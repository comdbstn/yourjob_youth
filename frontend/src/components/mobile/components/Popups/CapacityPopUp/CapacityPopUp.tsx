import React, { useState, useEffect } from "react";
import "./CapacityPopUp.css";
import CheckBox from "../../CheckBox/CheckBox";
import {
  fetchJobpostData,
  JobpostDataItem,
} from "../../../../../api/jobpostData";

interface CapacityPopUpProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedOptions: string[]) => void;
  initialSelected?: string[];
}

const CapacityPopUp: React.FC<CapacityPopUpProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialSelected = [],
}) => {
  // 1) API 데이터 + 로딩 상태
  const [capabilityData, setCapabilityData] = useState<JobpostDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 2) 팝업 열릴 때 바디 스크롤 잠금
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

  // 3) 마운트 시 API 호출
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await fetchJobpostData("00000020");
        setCapabilityData(list);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 4) 선택된 코드/레이블 상태
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  // 5) 데이터 로딩 완료 후 initialSelected → 레이블 매핑
  useEffect(() => {
    if (loading) return;

    setSelectedCodes(initialSelected);

    const labels = initialSelected.map((code) => {
      const item = capabilityData.find((i) => i.operationDataId === code);
      if (!item) return code;
      // level3 > level2 > level1 표시
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
  }, [initialSelected, loading, capabilityData]);

  // 6) 체크박스 토글
  const toggleOption = (code: string, label: string, checked: boolean) => {
    if (checked && selectedCodes.length >= 12) {
      return;
    }
    if (checked) {
      setSelectedCodes((prev) => [...prev, code]);
      setSelectedLabels((prev) => [...prev, label]);
    } else {
      setSelectedCodes((prev) => prev.filter((c) => c !== code));
      setSelectedLabels((prev) => prev.filter((l) => l !== label));
    }
  };

  // 7) 하단 삭제 버튼
  const handleRemove = (code: string, label: string) => {
    setSelectedCodes((prev) => prev.filter((c) => c !== code));
    setSelectedLabels((prev) => prev.filter((l) => l !== label));
  };

  // 8) 초기화
  const handleReset = () => {
    setSelectedCodes([]);
    setSelectedLabels([]);
  };

  // 9) 확인
  const handleConfirm = () => {
    onSelect(selectedCodes);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="CapacityPopUp_container">
      <div className="header">
        <h2 style={{ paddingLeft: "10px" }}>핵심역량</h2>
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
                <li>
                  <button className="selected">핵심역량</button>
                </li>
              </ul>
            </div>
            <div className="right">
              <ul className="select_box">
                <li>
                  <ul className="select_box-scroll">
                    {capabilityData
                      .slice()
                      .sort((a, b) => (a.level1 || "").localeCompare(b.level1 || "", "ko-KR"))
                      .map((opt) => {
                        const code = opt.operationDataId;
                        const label = opt.level3
                          ? `${opt.level2 || opt.level1} > ${opt.level3}`
                          : opt.level2 || opt.level1;
                        return (
                          <li key={code}>
                            <label className="flexGap10">
                              <CheckBox
                                isChecked={selectedCodes.includes(code)}
                                setIsChecked={(checked) =>
                                  toggleOption(code, label ?? "", checked)
                                }
                              />
                              <span>{label}</span>
                            </label>
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
                  onClick={() =>
                    handleRemove(selectedCodes[idx], selectedLabels[idx])
                  }
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

export default CapacityPopUp;
