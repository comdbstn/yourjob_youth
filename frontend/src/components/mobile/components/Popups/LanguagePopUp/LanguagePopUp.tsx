import React, { useState, useEffect } from "react";
import "./LanguagePopUp.css";
import CheckBox from "../../CheckBox/CheckBox";
import {
  fetchJobpostData,
  JobpostDataItem,
} from "../../../../../api/jobpostData";

interface LanguagePopUpProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedOptions: string[]) => void;
  initialSelected?: string[];
}

const LanguagePopUp: React.FC<LanguagePopUpProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialSelected = [],
}) => {
  // 1) API data & loading 상태
  const [data, setData] = useState<JobpostDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 2) 탭 (외국어는 한 개)
  const [tabs, setTabs] = useState<
    { key: string; label: string; options: JobpostDataItem[] }[]
  >([]);
  const [activeTab, setActiveTab] = useState<string>("all");

  // 3) 선택된 코드/레이블
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  // 4) 마운트 시 API 호출
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await fetchJobpostData("00000017"); // 외국어 코드
        setData(list);
        setTabs([{ key: "all", label: "외국어", options: list }]);
        setActiveTab("all");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 5) data 로드 완료 후에만 initialSelected → 라벨 매핑
  useEffect(() => {
    if (loading || data.length === 0) return;

    // 선택된 코드 초기화
    setSelectedCodes(initialSelected);

    // 라벨 매핑: level3 > level2 > level1
    const labels = initialSelected.map((code) => {
      const item = data.find((i) => i.operationDataId === code);
      if (!item) return code;
      if (item.level3) {
        const parent = item.level2 || item.level1;
        return `${parent} > ${item.level3}`;
      }
      if (item.level2) {
        return item.level2;
      }
      return item.level1;
    });
    setSelectedLabels(labels as string[]);
  }, [initialSelected, loading, data]);

  // 6) 팝업 열릴 때 뒤 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen]);

  // 7) 체크박스 토글
  const toggleOption = (code: string, label: string, checked: boolean) => {
    if (checked) {
      setSelectedCodes((prev) => [...prev, code]);
      setSelectedLabels((prev) => [...prev, label]);
    } else {
      setSelectedCodes((prev) => prev.filter((c) => c !== code));
      setSelectedLabels((prev) => prev.filter((l) => l !== label));
    }
  };

  // 8) 하단 태그 삭제
  const handleRemove = (code: string, label: string) => {
    setSelectedCodes((prev) => prev.filter((c) => c !== code));
    setSelectedLabels((prev) => prev.filter((l) => l !== label));
  };

  // 9) 초기화
  const handleReset = () => {
    setSelectedCodes([]);
    setSelectedLabels([]);
  };

  // 10) 확인
  const handleConfirm = () => {
    onSelect(selectedCodes);
    onClose();
  };

  if (!isOpen) return null;

  const currentOptions = tabs.find((t) => t.key === activeTab)?.options || [];

  return (
    <div className="LanguagePopUp_container">
      <div className="header">
        <h2 style={{ paddingLeft: 10 }}>외국어</h2>
        <button onClick={onClose} className="ml-auto pr-10">
          <img src="/img/mobile/XIcon.png" alt="닫기" />
        </button>
      </div>

      {loading ? (
        <p style={{ padding: 20, textAlign: "center" }}>
          데이터를 불러오는 중…
        </p>
      ) : (
        <>
          <section className="selectSection">
            <div className="left">
              <ul>
                {tabs.map((tab) => (
                  <li key={tab.key}>
                    <button
                      type="button"
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
              <ul className="select_box">
                <li>
                  <ul className="select_box-scroll">
                    {currentOptions.map((opt) => {
                      const code = opt.operationDataId;
                      const label = opt.level3
                        ? `${opt.level2 || opt.level1} > ${opt.level3}`
                        : opt.level2 || opt.level1;
                      return (
                        <li key={code} className="flexGap10">
                          <CheckBox
                            isChecked={selectedCodes.includes(code)}
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

          <section className="bottomSection">
            <div className="list">
              {selectedLabels.map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRemove(selectedCodes[idx], label)}
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

export default LanguagePopUp;
