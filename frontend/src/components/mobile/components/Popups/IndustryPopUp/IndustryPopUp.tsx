import React, { useState, useEffect } from "react";
import "./IndustryPopUp.css";
import CheckBox from "../../CheckBox/CheckBox";
import {
  fetchJobpostData,
  groupDataByLevel1,
  getUniqueLevel1Values,
  JobpostDataItem,
} from "../../../../../api/jobpostData";

interface IndustryPopUpProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedOptions: string[]) => void;
  initialSelected?: string[];
}

const IndustryPopUp: React.FC<IndustryPopUpProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialSelected = [],
}) => {
  // API data and tabs
  const [data, setData] = useState<JobpostDataItem[]>([]);
  const [tabs, setTabs] = useState<
    { key: string; label: string; options: JobpostDataItem[] }[]
  >([]);
  const [activeTab, setActiveTab] = useState<string>("");

  // Selection state
  const [selectedCodes, setSelectedCodes] = useState<string[]>(initialSelected);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  // Expanded level2 for hierarchical display
  const [expandedLevel2, setExpandedLevel2] = useState<string | null>(null);

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    document.body.style.touchAction = isOpen ? "none" : "";
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen]);

  // Load data and build tabs
  useEffect(() => {
    const load = async () => {
      const list = await fetchJobpostData("00000016");
      setData(list);
      const grouped = groupDataByLevel1(list);
      const categories = getUniqueLevel1Values(list);
      const defs = categories.map((cat) => ({
        key: cat,
        label: cat,
        options: grouped[cat] || [],
      }));
      setTabs(defs);
      setActiveTab(defs[0]?.key || "");
    };
    load();
  }, []);

  // Sync initial selection
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

  // Options for active level1
  const currentOptions = tabs.find((t) => t.key === activeTab)?.options || [];

  // Separate level2-only vs level2-with-children
  const level2Only = currentOptions.filter((opt) => !opt.level3);
  const withLevel3 = currentOptions.filter((opt) => !!opt.level3);

  // Group children by level2
  const childrenByLevel2: Record<string, JobpostDataItem[]> = {};
  withLevel3.forEach((opt) => {
    const lvl2 = opt.level2 || opt.level1;
    childrenByLevel2[lvl2 ?? ""] = childrenByLevel2[lvl2 ?? ""] || [];
    childrenByLevel2[lvl2 ?? ""].push(opt);
  });

  return (
    <div className="IndustryPopUp_container">
      <div className="header">
        <h2 style={{ paddingLeft: 10 }}>업종</h2>
        <button onClick={onClose} className="ml-auto pr-10">
          <img src="/img/mobile/XIcon.png" alt="닫기" />
        </button>
      </div>

      <section className="selectSection">
        <div className="left">
          <ul>
            {tabs.map((tab) => (
              <li key={tab.key}>
                <button
                  type="button"
                  className={activeTab === tab.key ? "selected" : ""}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setExpandedLevel2(null);
                  }}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="right">
          <ul className="select_box-scroll">
            {/* Level2-only items */}
            {level2Only.map((opt) => {
              const code = opt.operationDataId;
              const label = opt.level2 || opt.level1 || code;
              return (
                <li key={code} className="flexGap10">
                  <CheckBox
                    isChecked={selectedCodes.includes(code)}
                    setIsChecked={(checked) =>
                      toggleOption(code, label, checked)
                    }
                  />
                  <label className="label">{label}</label>
                </li>
              );
            })}

            {/* Level2 groups with children */}
            {Object.entries(childrenByLevel2).map(([lvl2, children]) => (
              <React.Fragment key={lvl2}>
                <li
                  className={`level2-header ${
                    expandedLevel2 === lvl2 ? "expanded" : ""
                  }`}
                  onClick={() =>
                    setExpandedLevel2(expandedLevel2 === lvl2 ? null : lvl2)
                  }
                >
                  {lvl2}
                </li>
                {expandedLevel2 === lvl2 &&
                  children.map((child) => {
                    const code = child.operationDataId;
                    const label = child.level3 || child.level2 || code;
                    return (
                      <li key={code} className="level3-item flexGap10">
                        <CheckBox
                          isChecked={selectedCodes.includes(code)}
                          setIsChecked={(checked) =>
                            toggleOption(code, label, checked)
                          }
                        />
                        <label className="label">{label}</label>
                      </li>
                    );
                  })}
              </React.Fragment>
            ))}
          </ul>
        </div>
      </section>

      <section className="bottomSection">
        <div className="list">
          {selectedLabels.map((label, idx) => (
            <button
              key={idx}
              onClick={() => handleRemove(selectedCodes[idx], label)}
              style={{ whiteSpace: "nowrap", fontSize: 12 }}
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
    </div>
  );
};

export default IndustryPopUp;
