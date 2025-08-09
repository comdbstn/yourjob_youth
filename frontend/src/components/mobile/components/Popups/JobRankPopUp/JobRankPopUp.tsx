import React, { useState, useEffect } from "react";
import "./JobRankPopUp.css";

import { positionOptions, roleOptions } from "../../../../../app/dummy/options";
interface JobRankPopUpProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedOptions: string[]) => void;
  initialSelected?: string[];
}

const JobRankPopUp: React.FC<JobRankPopUpProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialSelected = [],
}) => {
  const [selectedOptions, setSelectedOptions] =
    useState<string[]>(initialSelected);
  const [selectedLabels, setSelectedLabels] =
    useState<string[]>(initialSelected);
  const [activeTab, setActiveTab] = useState<string>("planning");

  const tabs = [
    { key: "positions", label: "포지션", options: positionOptions },
    { key: "role", label: "역할", options: roleOptions },
  ];

  const currentOptions =
    tabs.find((tab) => tab.key === activeTab)?.options || [];

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    label: string,
  ) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedOptions((prev) => [...prev, value]);
      setSelectedLabels((prev) => [...prev, label]);
    } else {
      setSelectedOptions((prev) => prev.filter((option) => option !== value));
      setSelectedLabels((prev) => prev.filter((item) => item !== label));
    }
  };

  const handleRemoveOption = (value: string, label: string) => {
    setSelectedOptions((prev) => prev.filter((option) => option !== value));
    setSelectedLabels((prev) => prev.filter((item) => item !== label));
  };

  const handleReset = () => {
    setSelectedOptions([]);
    setSelectedLabels([]);
  };

  const handleConfirm = () => {
    onSelect(selectedOptions);
    onClose();
  };

  useEffect(() => {
    setSelectedOptions(initialSelected);
    setSelectedLabels(initialSelected);
  }, []); // 한 번만 실행

  if (!isOpen) return null;

  return (
    <div className="JobRankPopUp_container">
      <div className="header">
        <h2 style={{ paddingLeft: "10px" }}>채용공고 상세검색</h2>
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
                {currentOptions.map((option) => (
                  <li key={`${activeTab}-${option.id}`}>
                    <input
                      type="checkbox"
                      id={`${activeTab}-${option.id}`}
                      name="jobSearch"
                      value={option.label}
                      className="check_box"
                      checked={selectedOptions.includes(option.label)}
                      onChange={(e) => handleCheckboxChange(e, option.label)}
                    />
                    <label
                      htmlFor={`${activeTab}-${option.id}`}
                      className="label"
                    >
                      {option.label}
                    </label>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </div>
      </section>
      <section className="bottomSection">
        <div className="list">
          {selectedLabels.map((label, index) => (
            <button
              key={index}
              onClick={() => handleRemoveOption(selectedOptions[index], label)}
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
            조건 검색하기
          </button>
        </div>
      </section>
    </div>
  );
};

export default JobRankPopUp;
