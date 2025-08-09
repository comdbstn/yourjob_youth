import React, { useState, useEffect } from "react";
import "./SkillTypePopUp.css";
import CheckBox from "../../CheckBox/CheckBox";
import {
  fetchJobpostData,
  getUniqueLevel1Values,
  JobpostDataItem,
} from "../../../../../api/jobpostData";

interface SkillTypePopUpProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedOptions: string[]) => void;
  initialSelected?: string[];
}

const SkillTypePopUp: React.FC<SkillTypePopUpProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialSelected = [],
}) => {
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
  // 선택 상태
  const [selectedOptions, setSelectedOptions] =
    useState<string[]>(initialSelected);
  const [selectedLabels, setSelectedLabels] =
    useState<string[]>(initialSelected);

  // API에서 가져온 레벨1 리스트
  const [loading, setLoading] = useState<boolean>(true);
  const [level1List, setLevel1List] = useState<string[]>([]);

  // 마운트 시 스킬 데이터 로드
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data: JobpostDataItem[] = await fetchJobpostData("00000015");
        const uniqueLevel1 = getUniqueLevel1Values(data);
        setLevel1List(uniqueLevel1);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // initialSelected가 바뀌면 동기화
  useEffect(() => {
    setSelectedOptions(initialSelected);
    setSelectedLabels(initialSelected);
  }, [initialSelected]);

  if (!isOpen) return null;

  // 체크박스 토글
  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    label: string,
  ) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedOptions((prev) => [...prev, value]);
      setSelectedLabels((prev) => [...prev, label]);
    } else {
      setSelectedOptions((prev) => prev.filter((o) => o !== value));
      setSelectedLabels((prev) => prev.filter((l) => l !== label));
    }
  };

  // 선택된 태그 삭제
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
    onClose();
  };

  return (
    <div className="SkillTypePopUp_container">
      <div className="header">
        <h2 style={{ paddingLeft: "10px" }}>스킬</h2>
        <button onClick={onClose} className="ml-auto pr-10">
          <img src="/img/mobile/XIcon.png" alt="닫기" />
        </button>
      </div>

      {loading ? (
        <p style={{ padding: "20px", textAlign: "center" }}>
          데이터를 불러오는 중입니다...
        </p>
      ) : (
        <>
          <section className="selectSection">
            {/* 왼쪽 탭: 하나만 */}
            <div className="left">
              <ul>
                <li>
                  <button type="button" className="selected">
                    스킬
                  </button>
                </li>
              </ul>
            </div>

            {/* 오른쪽: 레벨1 리스트 */}
            <div className="right">
              <ul className="select_box">
                <li>
                  <ul className="select_box-scroll">
                    {level1List.map((level1) => (
                      <li key={level1}>
                        <label
                          style={{
                            cursor: "pointer",
                            display: "flex",
                            gap: "10px",
                          }}
                        >
                          <CheckBox
                            isChecked={selectedOptions.includes(level1)}
                            setIsChecked={function (value: boolean): void {}}
                          />
                          <input
                            type="checkbox"
                            value={level1}
                            checked={selectedOptions.includes(level1)}
                            onChange={(e) => handleCheckboxChange(e, level1)}
                          />
                          {level1}
                        </label>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </div>
          </section>

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

export default SkillTypePopUp;
