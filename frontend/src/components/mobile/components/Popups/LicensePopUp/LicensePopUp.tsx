import React, { useState, useEffect } from "react";
import "./LicensePopUp.css";
import CheckBox from "../../CheckBox/CheckBox";
import {
  fetchJobpostData,
  JobpostDataItem,
} from "../../../../../api/jobpostData";

interface LicensePopUpProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedOptions: string[]) => void;
  initialSelected?: string[];
}

const LicensePopUp: React.FC<LicensePopUpProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialSelected = [],
}) => {
  // 1) API 데이터 로드
  const [data, setData] = useState<JobpostDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 2) 탭 (자격증은 한 탭)
  const [tabs, setTabs] = useState<
    { key: string; label: string; options: JobpostDataItem[] }[]
  >([]);
  const [activeTab, setActiveTab] = useState("all");

  // 3) 선택된 코드 & 레이블
  const [selectedCodes, setSelectedCodes] = useState<string[]>(initialSelected);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  // 4) 마운트 시 API 호출
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const list = await fetchJobpostData("00000018"); // 자격증 코드
      setData(list);
      setTabs([{ key: "all", label: "자격증", options: list }]);
      setActiveTab("all");
      setLoading(false);
    };
    load();
  }, []);

  // 5) 팝업 열릴 때 바디 스크롤 잠금
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

  // 6) initialSelected → 레이블 매핑
  useEffect(() => {
    setSelectedCodes(initialSelected);
    const labels = initialSelected.map((code) => {
      const found = data.find((i) => i.operationDataId === code);
      return found?.level2 ?? found?.level1 ?? code;
    });
    setSelectedLabels(labels);
  }, [initialSelected, data]);

  const toggleOption = (code: string, label: string, checked: boolean) => {
    if (checked) {
      setSelectedCodes((prev) => [...prev, code]);
      setSelectedLabels((prev) => [...prev, label]);
    } else {
      setSelectedCodes((prev) => prev.filter((c) => c !== code));
      setSelectedLabels((prev) => prev.filter((l) => l !== label));
    }
  };

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

  const currentOptions = tabs.find((t) => t.key === activeTab)?.options || [];

  return (
    <div className="LicensePopUp_container">
      <div className="header">
        <h2 style={{ paddingLeft: 10 }}>자격증</h2>
        <button onClick={onClose} className="ml-auto pr-10">
          <img src="/img/mobile/XIcon.png" alt="닫기" />
        </button>
      </div>

      {loading ? (
        <p style={{ padding: 20, textAlign: "center" }}>
          데이터를 불러오는 중입니다...
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
                      const label = opt.level2 || opt.level1;
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

export default LicensePopUp;
