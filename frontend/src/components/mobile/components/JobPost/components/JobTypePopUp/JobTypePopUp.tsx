import React, { useEffect, useState } from "react";
import "./JobTypePopUp.css";
import getLevelOneCode, {
  LevelOneCodesResponse,
  LevelCode,
} from "../../../../../../api/getLevelOneCodes";

interface JobTypePopUpProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedOptions: { [key: string]: LevelCode[] }) => void;
  initialSelected?: { [key: string]: LevelCode[] };
  initialField?: string;
  isGlobal?: boolean;
}

const tabs = [
  { key: "planningOptions", label: "직무", dataType: "00000009" },
  { key: "nationwideLocation", label: "근무지역", dataType: "00000012" },
  {
    key: "fullNationwideLocation",
    label: "근무지역(해외)",
    dataType: "00000013",
  },
  { key: "employmentType", label: "채용형태", dataType: "00000010" },
  { key: "companyType", label: "기업형태", dataType: "00000011" },
];

const JobTypePopUp: React.FC<JobTypePopUpProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialSelected = {},
  initialField,
  isGlobal = false,
}) => {
  // 1) 탭별 LevelCode[]를 저장
  const [codesByKey, setCodesByKey] = useState<Record<string, LevelCode[]>>({});

  // 2) 사용자가 선택한 LevelCode[]를 저장
  const [selectedByKey, setSelectedByKey] =
    useState<Record<string, LevelCode[]>>(initialSelected);

  // 3) 활성 탭
  const [activeTab, setActiveTab] = useState<string>(
    initialField ?? "planningOptions",
  );

  // -- 1단계: 마운트 시 각 dataType별로 코드 로딩 --
  useEffect(() => {
    tabs.forEach(({ key, dataType }) => {
      getLevelOneCode({ dataType })
        .then((res) => {
          setCodesByKey((prev) => ({ ...prev, [key]: res.levelCodes }));
        })
        .catch(console.error);
    });
  }, []);

  // 탭에서 보여줄 옵션
  const currentOptions = (() => {
    if (activeTab === "nationwideLocation") {
      // 국내
      return codesByKey["nationwideLocation"] ?? [];
    }
    if (activeTab === "fullNationwideLocation") {
      // 해외
      return codesByKey["fullNationwideLocation"] ?? [];
    }
    return codesByKey[activeTab] ?? [];
  })();

  // -- 체크박스 변경 --
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: key, value: code, checked } = e.target;
    const dom = codesByKey["nationwideLocation"] ?? [];
    const glob = codesByKey["fullNationwideLocation"] ?? [];
    const combinedNationwide = [...dom, ...glob];

    // 국내/해외 합쳐진 옵션에서는 combinedNationwide 사용
    const list =
      key === "nationwideLocation" ? combinedNationwide : codesByKey[key] || [];
    const found = list.find((o) => o.code === code);
    if (!found) return;

    setSelectedByKey((prev) => {
      const prevArr = prev[key] ?? [];
      const nextArr = checked
        ? [...prevArr, found]
        : prevArr.filter((o) => o.code !== code);

      if (nextArr.length === 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: nextArr };
    });
  };

  // -- 태그 클릭으로 선택 해제 --
  const handleRemoveOption = (key: string, code: string) => {
    setSelectedByKey((prev) => {
      const prevArr = prev[key] ?? [];
      const nextArr = prevArr.filter((o) => o.code !== code);
      if (nextArr.length === 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: nextArr };
    });
  };

  // -- 초기화 --
  const handleReset = () => {
    setSelectedByKey({});
  };

  // -- 확인 --
  const handleConfirm = () => {
    onSelect(selectedByKey);
    onClose();
  };

  // 외부 props 변경 동기화
  useEffect(() => {
    setSelectedByKey(initialSelected);
  }, [initialSelected]);
  useEffect(() => {
    if (initialField) setActiveTab(initialField);
  }, [initialField]);
  // --- 초기 선택값에 코드만 들어오는 문제 해결용 매핑 useEffect ---
  useEffect(() => {
    if (!Object.keys(codesByKey).length) return;

    const mapped: Record<string, LevelCode[]> = {};

    Object.entries(initialSelected).forEach(([key, arr]) => {
      // 국내/해외 소스 선택
      const source =
        key === "nationwideLocation"
          ? (isGlobal
              ? codesByKey["fullNationwideLocation"]
              : codesByKey["nationwideLocation"]) || []
          : codesByKey[key] || [];

      const filled = arr
        .map((i) => source.find((o) => o.code === i.code))
        .filter((o): o is LevelCode => Boolean(o));
      if (filled.length) mapped[key] = filled;
    });

    setSelectedByKey(mapped);
  }, [codesByKey, initialSelected, isGlobal]);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    // 언마운트 시 원래대로 복원
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  useEffect(() => {
    if (initialField) {
      setActiveTab(initialField);
    }
  }, [initialField]);
  if (!isOpen) return null;

  return (
    <div className="JobTypePopUp_container">
      <div className="header">
        <h2 style={{ paddingLeft: "10px" }}>채용공고 상세검색</h2>
        <button
          className="closeBtn"
          onClick={onClose}
          style={{ position: "absolute", right: 10 }}
        >
          <img src="/img/XIcon.png" alt="닫기" />
        </button>
      </div>

      <section className="selectSection">
        <div className="left">
          <ul>
            {tabs
              .filter((t) => {
                if (t.key === "nationwideLocation") return !isGlobal;
                if (t.key === "fullNationwideLocation") return isGlobal;
                return (
                  t.key !== "nationwideLocation" &&
                  t.key !== "fullNationwideLocation"
                );
              })
              .map((tab) => (
                <li key={tab.key}>
                  <button
                    className={activeTab === tab.key ? "selected" : ""}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
          </ul>
        </div>

        <div className="right">
          <ul key={activeTab} className="select_box-scroll">
            {currentOptions.map((opt) => (
              <li key={`${activeTab}-${opt.code}`}>
                <input
                  type="checkbox"
                  id={`${activeTab}-${opt.code}`}
                  name={activeTab}
                  value={opt.code}
                  checked={
                    selectedByKey[activeTab]?.some(
                      (o) => o.code === opt.code,
                    ) ?? false
                  }
                  onChange={handleCheckboxChange}
                />
                <label htmlFor={`${activeTab}-${opt.code}`}>
                  {opt.levelValue}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="bottomSection"
        style={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
      >
        <div className="list">
          {Object.entries(selectedByKey).flatMap(([key, arr]) =>
            arr.map((o) => (
              <button
                key={`${key}-${o.code}`}
                className="selectedOptionBtn"
                onClick={() => handleRemoveOption(key, o.code)}
              >
                {o.levelValue}
                <img src="/img/mobile/BlueXIcon.png" alt="삭제" />
              </button>
            )),
          )}
        </div>

        <div className="btns">
          <button className="blueBtn grayBtn" onClick={handleReset}>
            초기화
          </button>
          <button className="blueBtn" onClick={handleConfirm}>
            조건 검색하기
          </button>
        </div>
      </section>
    </div>
  );
};

export default JobTypePopUp;
