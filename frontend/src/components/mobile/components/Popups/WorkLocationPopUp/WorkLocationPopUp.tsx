import React, { useState, useEffect } from "react";
import "./WorkLocationPopUp.css";
import CheckBox from "../../CheckBox/CheckBox";
import {
  fetchJobpostData,
  groupDataByLevel1,
  getUniqueLevel1Values,
  JobpostDataItem,
} from "../../../../../api/jobpostData";

interface WorkLocationPopUpProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedOptions: string[]) => void;
  initialSelected?: string[];
  isGlobal: boolean;
}

const WorkLocationPopUp: React.FC<WorkLocationPopUpProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialSelected = [],
  isGlobal = false,
}) => {
  // API에서 불러올 국내+해외 지역 데이터
  const [locationData, setLocationData] = useState<JobpostDataItem[]>([]);
  // level1 별로 그룹핑한 데이터
  const [groupedData, setGroupedData] = useState<
    Record<string, JobpostDataItem[]>
  >({});
  // 탭 정의: key = level1, label = level1, options = groupedData[level1]
  const [tabs, setTabs] = useState<
    { key: string; label: string; options: JobpostDataItem[] }[]
  >([]);
  const [activeTab, setActiveTab] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);

  // 선택된 코드와 레이블
  const [selectedCodes, setSelectedCodes] = useState<string[]>(initialSelected);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  // 1) 마운트 시: 국내(00000012) + 해외(00000013) 불러와서 그룹핑
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const domestic = await fetchJobpostData("00000012");
      const overseas = await fetchJobpostData("00000013");
      // const combined = [...domestic, ...overseas];
      let combined: any[] = [];
      if (isGlobal) {
        combined = overseas;
      } else {
        combined = domestic;
      }
      setLocationData(combined);

      const grouped = groupDataByLevel1(combined);
      const level1Values = getUniqueLevel1Values(combined);
      setGroupedData(grouped);
      setTabs(
        level1Values.map((lvl1) => ({
          key: lvl1,
          label: lvl1,
          options: grouped[lvl1] || [],
        })),
      );
      setActiveTab(level1Values[0] || "");
      setLoading(false);
    };
    load();
  }, []);

  // 팝업 열릴 때 body 스크롤 잠금
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

  // initialSelected(코드[]) 받으면 레이블로 변환
  useEffect(() => {
    setSelectedCodes(initialSelected);
    const labels = initialSelected.map((code) => {
      const found = locationData.find((i) => i.operationDataId === code);
      return found?.level2 ?? found?.level1 ?? code;
    });
    setSelectedLabels(labels);
  }, [initialSelected, locationData]);

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
    <div className="WorkLocationPopUp_container">
      <div className="header">
        <h2 style={{ paddingLeft: 10 }}>근무지역</h2>
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

export default WorkLocationPopUp;
