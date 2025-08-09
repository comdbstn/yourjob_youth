import { useEffect, useState } from "react";
import {
  fetchJobpostData,
  getUniqueLevel1Values,
  groupDataByLevel1,
  JobpostDataItem,
} from "../../../api/jobpostData";
import CustomModal from "../../common/CustomModal";
import "./JobTypeDataModal.css";
interface JobTypeDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedOptions: string[]) => void;
  initialSelected?: string[];
}
export default function JobTypeDataModal(props: JobTypeDataModalProps) {
  const [jobTypeData, setJobTypeData] = useState<JobpostDataItem[]>([]);
  const [groupedData, setGroupedData] = useState<
    Record<string, JobpostDataItem[]>
  >({});
  const [categories, setCategories] = useState<string[]>([]);
  const [visibleCategories, setVisibleCategories] = useState<string[]>([]);
  const categoriesPerPage = 4;
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchJobpostData("00000009");
      setJobTypeData(data);

      const grouped = groupDataByLevel1(data);
      setGroupedData(grouped);

      const uniqueCategories = getUniqueLevel1Values(data);
      setCategories(uniqueCategories);

      //   const total = Math.ceil(uniqueCategories.length / categoriesPerPage);
      //   setTotalPages(total);

      updateVisibleCategories(1, uniqueCategories);

      //   setLoading(false);
    };

    fetchData();
  }, []);
  const updateVisibleCategories = (
    page: number,
    allCategories: string[] = categories,
  ) => {
    const startIdx = (page - 1) * categoriesPerPage;
    const endIdx = startIdx + categoriesPerPage;
    setVisibleCategories(allCategories.slice(startIdx, endIdx));
  };

  //
  const [selectedOneDepth, setSelectedOneDepth] = useState<string>("");
  const [selectedTwoDepth, setSelectedTwoDepth] = useState<string>("");
  const [selectedThreeDepth, setSelectedThreeDepth] = useState<string>("");

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const handleAdd = () => {
    if (!selectedOneDepth || !selectedTwoDepth) return;
    const entry = `${selectedOneDepth} > ${selectedTwoDepth}`;
    if (!selectedItems.includes(entry)) {
      setSelectedItems((prev) => [...prev, entry]);
      setSelectedOneDepth("");
      setSelectedTwoDepth("");
    }
  };
  useEffect(() => {
    setSelectedItems(props.initialSelected ?? []);
    // setSelectedLabels(initialSelected.map((label) => label));
  }, [props.initialSelected]);
  return (
    <CustomModal isOpen={props.isOpen} onClose={props.onClose} width="950px">
      <div className="jobTypeDataModalContainer">
        <p className="headers">직무</p>
        <div className="body">
          <div className="depth1 depthLayout">
            <div className="depthHeader">상분류</div>
            <ul>
              {groupedData && (
                <>
                  {categories.map((i) => (
                    <li
                      className={`${selectedOneDepth === i ? "selected" : ""}`}
                    >
                      <button onClick={() => setSelectedOneDepth(i)}>
                        {i}
                      </button>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>
          <div className="depth2 depthLayout">
            <div className="depthHeader">중분류</div>
            <ul>
              {groupedData[selectedOneDepth] &&
                groupedData[selectedOneDepth].map((i) => (
                  <li
                    className={`${
                      selectedTwoDepth === i.level2 ? "selected" : ""
                    }`}
                  >
                    <button onClick={() => setSelectedTwoDepth(i.level2 ?? "")}>
                      {i.level2}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
          <div className="depth3 depthLayout">
            <div className="depthHeader">소분류</div>
          </div>
        </div>
        <ul className="selectedItems" style={{ padding: 0, listStyle: "none" }}>
          {selectedItems.map((item, idx) => (
            <li key={idx} style={{ margin: "4px 0" }}>
              {item}
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
              props.onSelect(selectedItems);
              props.onClose();
            }}
          >
            확인
          </button>
        </div>
      </div>
    </CustomModal>
  );
}
