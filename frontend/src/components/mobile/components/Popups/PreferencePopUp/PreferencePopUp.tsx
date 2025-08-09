import React, { useState, useEffect } from "react";
import "./PreferencePopUp.css";
import CheckBox from "../../CheckBox/CheckBox";
import {
  fetchJobpostData,
  groupDataByLevel1,
  getUniqueLevel1Values,
  JobpostDataItem,
} from "../../../../../api/jobpostData";

interface PreferencePopUpProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedOptions: string[]) => void;
  initialSelected?: string[];
}

const PreferencePopUp: React.FC<PreferencePopUpProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialSelected = [],
}) => {
  // 1) API 로딩 및 데이터
  const [data, setData] = useState<JobpostDataItem[]>([]);
  const [grouped, setGrouped] = useState<Record<string, JobpostDataItem[]>>({});
  const [tabs, setTabs] = useState<
    { key: string; label: string; options: JobpostDataItem[] }[]
  >([]);
  const [activeTab, setActiveTab] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);

  // 2) 선택된 코드 & 레이블
  const [selectedCodes, setSelectedCodes] = useState<string[]>(initialSelected);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  // 3) 마운트 시 API 호출 → 그룹핑 → 탭 생성
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const list = await fetchJobpostData("00000014");
      setData(list);

      const g = groupDataByLevel1(list);
      const level1s = getUniqueLevel1Values(list);
      setGrouped(g);

      const defs = level1s.map((lvl1) => ({
        key: lvl1,
        label: lvl1,
        options: g[lvl1] || [],
      }));
      setTabs(defs);
      setActiveTab(defs[0]?.key || "");
      setLoading(false);
    };
    load();
  }, []);

  // 4) 팝업 열릴 때 body 스크롤 잠금
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

  // 5) 초기 selected 코드 → 레이블로 변환
  useEffect(() => {
    setSelectedCodes(initialSelected);
    const labels = initialSelected.map((code) => {
      const found = data.find((i) => i.operationDataId === code);
      return found?.level2 ?? found?.level1 ?? code;
    });
    setSelectedLabels(labels);
  }, [initialSelected, data]);

  // 체크박스 토글
  const toggleOption = (code: string, label: string, checked: boolean) => {
    if (checked) {
      setSelectedCodes((prev) => [...prev, code]);
      setSelectedLabels((prev) => [...prev, label]);
    } else {
      setSelectedCodes((prev) => prev.filter((c) => c !== code));
      setSelectedLabels((prev) => prev.filter((l) => l !== label));
    }
  };

  // 하단 태그 삭제
  const handleRemove = (code: string, label: string) => {
    setSelectedCodes((prev) => prev.filter((c) => c !== code));
    setSelectedLabels((prev) => prev.filter((l) => l !== label));
  };

  const handleReset = () => {
    setSelectedCodes([]);
    setSelectedLabels([]);
  };

  const handleConfirm = () => {
    onSelect(selectedCodes);
    onClose();
  };

  if (!isOpen) return null;

  const currentTab = tabs.find((t) => t.key === activeTab);
  const currentOptions = currentTab?.options || [];

  return (
    <div className="PreferencePopUp_container">
      <div className="header">
        <h2 style={{ paddingLeft: 10 }}>우대조건</h2>
        <button onClick={onClose} className="ml-auto pr-10">
          <img src="/img/mobile/XIcon.png" alt="닫기" />
        </button>
      </div>

      {loading ? (
        <p style={{ padding: 20, textAlign: "center" }}>로딩 중…</p>
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
                      const label = opt.level2 || opt.level1;
                      return (
                        <li key={`${activeTab}-${code}`} className="flexGap10">
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

export default PreferencePopUp;
