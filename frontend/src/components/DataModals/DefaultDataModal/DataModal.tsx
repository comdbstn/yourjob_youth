// src/components/DataModal/DataModal.tsx (또는 .jsx)
import { useEffect, useState } from "react";
import {
  fetchJobpostData,
  getUniqueLevel1Values,
  groupDataByLevel1,
  JobpostDataItem,
} from "../../../api/jobpostData";
import CustomModal from "../../common/CustomModal";
import "./DataModal.css";

interface SelectedItem {
  operationDataId: string;
  displayLabel: string;
}
interface DataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedOptions: SelectedItem[]) => void;
  initialSelected?: SelectedItem[];
  initialData: JobpostDataItem[];
  isOneDepth?: boolean;
  title?: string;
  isGlobal?: boolean;
  maxLength?: number;
}

export default function DataModal(props: DataModalProps) {
  const [jobTypeData, setJobTypeData] = useState<JobpostDataItem[]>(
    props.initialData,
  );
  const [groupedData, setGroupedData] = useState<
    Record<string, JobpostDataItem[]>
  >({});
  const [categories, setCategories] = useState<string[]>([]);

  // 선택 상태
  const [selectedOneDepth, setSelectedOneDepth] = useState<string>("");
  const [selectedTwoDepth, setSelectedTwoDepth] = useState<string>("");
  const [selectedThreeDepth, setSelectedThreeDepth] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(
    props.initialSelected ?? [],
  );

  // 초기 데이터 세팅
  useEffect(() => {
    setJobTypeData(props.initialData);
  }, [props.initialData]);
  useEffect(() => {
    const grouped = groupDataByLevel1(jobTypeData);
    setGroupedData(grouped);
    setCategories(getUniqueLevel1Values(jobTypeData));
  }, [jobTypeData]);

  // depth1 클릭 시 depth2, depth3 초기화
  const onSelectLevel1 = (lvl1: string) => {
    setSelectedOneDepth(lvl1);
    setSelectedTwoDepth("");
    setSelectedThreeDepth("");
  };
  // depth2 클릭 시 depth3 초기화
  const onSelectLevel2 = (lvl2: string) => {
    setSelectedTwoDepth(lvl2);
    setSelectedThreeDepth("");
  };
  const onSelectLevel3 = (lvl3: string) => {
    setSelectedThreeDepth(lvl3);
  };

  // depth2 candidates
  const depth2Items = groupedData[selectedOneDepth] || [];
  const uniqueLevel2 = Array.from(
    new Set(depth2Items.filter((i) => i.level2).map((i) => i.level2!)),
  );

  // depth3 candidates for currently selected level2
  const depth3Items = depth2Items.filter(
    (i) => i.level2 === selectedTwoDepth && i.level3,
  );
  const uniqueLevel3 = Array.from(new Set(depth3Items.map((i) => i.level3!)));

  // 선택 추가
  const handleAdd = () => {
    if (props.maxLength && selectedItems.length >= props.maxLength) {
      alert(`최대 ${props.maxLength}개만 선택할 수 있습니다.`);
      return;
    }
    if (!selectedOneDepth) return;
    let operationDataId: string;
    let displayLabel: string;

    const candidates = groupedData[selectedOneDepth] || [];
    const onlyOneDepth = candidates.every((i) => !i.level2);

    if (onlyOneDepth) {
      operationDataId = selectedOneDepth;
      displayLabel = selectedOneDepth;
    } else if (!selectedTwoDepth) {
      return;
    } else {
      const hasLevel3 = candidates.some(
        (i) => i.level2 === selectedTwoDepth && !!i.level3,
      );
      if (!hasLevel3) {
        // 2단계만
        const item = candidates.find((i) => i.level2 === selectedTwoDepth)!;
        operationDataId = item.operationDataId;
        displayLabel = `${selectedOneDepth} > ${selectedTwoDepth}`;
      } else {
        if (!selectedThreeDepth) return;
        const item = candidates.find(
          (i) =>
            i.level2 === selectedTwoDepth && i.level3 === selectedThreeDepth,
        )!;
        operationDataId = item.operationDataId;
        displayLabel = `${selectedOneDepth} > ${selectedTwoDepth} > ${selectedThreeDepth}`;
      }
    }

    if (selectedItems.some((it) => it.operationDataId === operationDataId))
      return;
    setSelectedItems((prev) => [...prev, { operationDataId, displayLabel }]);
    // 초기화
    // setSelectedOneDepth("");
    // setSelectedTwoDepth("");
    setSelectedThreeDepth("");
  };
  const handleLevel2Click = (lvl2: string) => {
    if (!selectedOneDepth) {
      alert("먼저 상분류를 선택해주세요.");
      return;
    }
    onSelectLevel2(lvl2);
  };
  return (
    <CustomModal isOpen={props.isOpen} onClose={props.onClose} width="950px">
      <div className="DataModalContainer">
        <p className="headers">{props.title || "직무"}</p>
        <div className="body">
          {/* 1단계 */}
          <div className="depth1 depthLayout">
            <div className="depthHeader">상분류</div>
            <ul>
              {categories.map((lvl1) => (
                <li
                  key={lvl1}
                  className={selectedOneDepth === lvl1 ? "selected" : ""}
                >
                  <button onClick={() => onSelectLevel1(lvl1)}>{lvl1}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* 2단계 */}
          {!props.isOneDepth && (
            <div className="depth2 depthLayout">
              <div className="depthHeader">중분류</div>
              <ul>
                {uniqueLevel2.map((lvl2) => (
                  <li
                    key={lvl2}
                    className={selectedTwoDepth === lvl2 ? "selected" : ""}
                  >
                    <button onClick={() => handleLevel2Click(lvl2)}>
                      {lvl2}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3단계 */}
          {!props.isOneDepth && uniqueLevel3.length > 0 && (
            <div className="depth3 depthLayout">
              <div className="depthHeader">소분류</div>
              <ul>
                {uniqueLevel3.map((lvl3) => (
                  <li
                    key={lvl3}
                    className={selectedThreeDepth === lvl3 ? "selected" : ""}
                  >
                    <button onClick={() => onSelectLevel3(lvl3)}>{lvl3}</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <ul className="selectedItems" style={{ padding: 0, listStyle: "none" }}>
          {selectedItems.map((item, idx) => (
            <li key={item.operationDataId} style={{ margin: "4px 0" }}>
              {item.displayLabel}
              <button
                style={{
                  marginLeft: 8,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setSelectedItems((prev) => prev.filter((_, i) => i !== idx))
                }
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        <div className="footerBar">
          <button className="addBtn" onClick={handleAdd}>
            + 추가
          </button>
          <button
            className="addBtn"
            onClick={() => {
              if (selectedItems.length > 0) {
                props.onSelect(selectedItems);
                props.onClose();
              } else {
                alert("1개이상 선택해주세요.");
              }
            }}
          >
            확인
          </button>
        </div>
      </div>
    </CustomModal>
  );
}
