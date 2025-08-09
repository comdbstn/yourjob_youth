import React, { useState, useEffect } from "react";
import "./JopTypePopUp.css";
import CheckBox from "../../CheckBox/CheckBox";
import {
  fetchJobpostData,
  groupDataByLevel1,
  getUniqueLevel1Values,
  JobpostDataItem,
} from "../../../../../api/jobpostData";

interface JopTypePopUpProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedOptions: string[]) => void;
  initialSelected?: string[];
}

const JopTypePopUp: React.FC<JopTypePopUpProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialSelected = [],
}) => {
  // 선택된 값
  const [selectedOptions, setSelectedOptions] =
    useState<string[]>(initialSelected);
  const [selectedLabels, setSelectedLabels] =
    useState<string[]>(initialSelected);
  const [jobTypeData, setJobTypeData] = useState<JobpostDataItem[]>();
  // API 로딩 상태 및 데이터
  const [loading, setLoading] = useState<boolean>(true);
  const [groupedData, setGrouped] = useState<Record<string, JobpostDataItem[]>>(
    {},
  );
  const [tabs, setTabs] = useState<
    { key: string; label: string; options: JobpostDataItem[] }[]
  >([]);
  const [activeTab, setActiveTab] = useState<string>("");
  useEffect(() => {
    if (isOpen) {
      // 팝업이 열릴 때
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none"; // 모바일 브라우저 터치 이동도 막아줄 수 있습니다.
    } else {
      // 팝업이 닫힐 때
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    // 컴포넌트 언마운트 시에도 원복
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen]);

  // 1) 마운트 시 API 에서 ‘직무’ 데이터 불러오기
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await fetchJobpostData("00000009");
        const grouped = groupDataByLevel1(list);
        const categories = getUniqueLevel1Values(list);
        setJobTypeData(list);
        // tabs 배열 생성: key,label 은 level1, options 는 해당 그룹
        const tabDefs = categories.map((cat) => ({
          key: cat,
          label: cat,
          options: grouped[cat] || [],
        }));

        setGrouped(grouped);
        setTabs(tabDefs);
        setActiveTab(tabDefs[0]?.key || "");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // initialSelected 변경 시 동기화
  useEffect(() => {
    // initialSelected 는 ['0001', '0003', …] 이런 코드들
    setSelectedOptions(initialSelected);
    // mapCodesToLabels 로 레이블로 변환
    setSelectedLabels(
      initialSelected.map((code) => {
        const list = jobTypeData || [];
        const found = list.find((i) => i.operationDataId === code);

        return found?.level2 ?? found?.level1 ?? code;
      }),
    );
  }, [initialSelected, jobTypeData]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // ▶️ 훅 등록이 끝난 뒤에야 조건부 렌더링
  if (!isOpen) return null;

  const currentTab = tabs.find((t) => t.key === activeTab);
  const currentOptions = currentTab?.options || [];

  // 체크박스 토글
  const toggleOption = (code: string, label: string, checked: boolean) => {
    if (checked) {
      setSelectedOptions((prev) => [...prev, code]);
      setSelectedLabels((prev) => [...prev, label]);
    } else {
      setSelectedOptions((prev) => prev.filter((c) => c !== code));
      setSelectedLabels((prev) => prev.filter((l) => l !== label));
    }
  };

  // 선택 태그 삭제
  const handleRemoveOption = (value: string, label: string) => {
    setSelectedOptions((prev) => prev.filter((o) => o !== value));
    setSelectedLabels((prev) => prev.filter((l) => l !== label));
  };

  const handleReset = () => {
    setSelectedOptions([]);
    setSelectedLabels([]);
  };
  const handleConfirm = () => {
    onSelect(selectedOptions);
    console.log(selectedOptions);
    onClose();
  };

  return (
    <div
      className="JopTypePopUp_container"
      style={{
        position: "fixed",
        inset: 0, // top:0, right:0, bottom:0, left:0
        overflow: "hidden", // 배경 스크롤 차단
        zIndex: 1000,
      }}
    >
      <div className="header">
        <h2 style={{ paddingLeft: "10px" }}>직무</h2>
        <button onClick={onClose} className="ml-auto pr-10">
          <img src="/img/mobile/XIcon.png" alt="닫기" />
        </button>
      </div>

      {/* 로딩 중 */}
      {loading ? (
        <p style={{ padding: "20px", textAlign: "center" }}>
          데이터를 불러오는 중입니다...
        </p>
      ) : (
        <>
          {/* 탭 사이드바 (level1) */}
          <section className="selectSection">
            <div className="left">
              <ul>
                {tabs.map((tab) => (
                  <li key={tab.key}>
                    <button
                      type="button"
                      className={activeTab === tab.key ? "selected" : ""}
                      onClick={() => setActiveTab(tab.key)}
                      style={{ textAlign: "start" }}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 현재 탭의 옵션 리스트 (level2) */}
            <div className="right">
              <ul className="select_box" key={activeTab}>
                <li>
                  <ul className="select_box-scroll">
                    {currentOptions.map((opt) => {
                      const code = opt.operationDataId;
                      const label = opt.level2 || opt.level1;
                      return (
                        <li key={`${activeTab}-${code}`} className="flexGap10">
                          <CheckBox
                            // 코드로 체크 여부 결정
                            isChecked={selectedOptions.includes(code)}
                            // 토글할 때도 코드로만 추가/제거
                            setIsChecked={(checked) =>
                              toggleOption(code, label ?? "", checked)
                            }
                          />
                          <label className="label">{label}</label>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              </ul>
            </div>
          </section>

          {/* 선택된 항목, 초기화/확인 버튼 */}
          <section className="bottomSection">
            <div
              className="list"
              style={{
                overflowX: "scroll",
                overflowY: "hidden",
                width: "100%",
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              {selectedLabels.map((label, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    handleRemoveOption(selectedOptions[idx], label)
                  }
                  style={{ whiteSpace: "nowrap", fontSize: "12px" }}
                >
                  {label} <img src="/img/mobile/BlueXIcon.png" alt="삭제" />
                </button>
              ))}
            </div>
            <div className="btns">
              <button className="blueBtn w-25 grayBtn" onClick={handleReset}>
                초기화
              </button>
              <button className="blueBtn w-75" onClick={handleConfirm}>
                확인
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default JopTypePopUp;
