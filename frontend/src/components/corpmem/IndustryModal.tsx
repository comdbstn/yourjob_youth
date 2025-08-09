import React, { useEffect, useState } from "react";
import CustomModal from "../common/CustomModal";
import "./IndustryModal.css";
import {
  fetchJobpostData,
  JobpostDataItem,
  groupDataByLevel1,
  getUniqueLevel1Values,
} from "../../api/jobpostData";

interface SelectedItem {
  operationDataId: string;
  displayLabel: string;
}

interface IndustryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedItems: SelectedItem[]) => void;
  initialSelected?: SelectedItem[];
}

const IndustryModal: React.FC<IndustryModalProps> = ({
                                                       isOpen,
                                                       onClose,
                                                       onSelect,
                                                       initialSelected = [],
                                                     }) => {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [industryData, setIndustryData] = useState<JobpostDataItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [groupedData, setGroupedData] = useState<
      Record<string, JobpostDataItem[]>
  >({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await fetchJobpostData("00000016");
      setIndustryData(data);

      const grouped = groupDataByLevel1(data);
      setGroupedData(grouped);

      const uniqueCategories = getUniqueLevel1Values(data);
      setCategories(uniqueCategories);

      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (initialSelected.length > 0) {
      setSelectedItems(initialSelected);
    }
  }, [initialSelected]);

  const handleCheckboxChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      option: JobpostDataItem,
  ) => {
    const { checked } = e.target;
    const label = option.level3 || "";
    const id = option.operationDataId;

    if (checked) {
      setSelectedItems((prev) => [
        ...prev,
        {
          operationDataId: id,
          displayLabel: label,
        },
      ]);
    } else {
      setSelectedItems((prev) =>
          prev.filter((item) => item.operationDataId !== id),
      );
    }
  };

  const handleRemoveOption = (operationDataId: string) => {
    setSelectedItems((prev) =>
        prev.filter((item) => item.operationDataId !== operationDataId),
    );
  };

  const handleReset = () => {
    setSelectedItems([]);
  };

  const handleConfirm = () => {
    onSelect(selectedItems);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  // 각 옵션 그룹에 대한 고유 ID 생성
  const getUniqueId = (category: string, id: string) => `${category}-${id}`;

  if (loading) {
    return (
        <CustomModal
            isOpen={isOpen}
            onClose={onClose}
            title="업종 선택"
            width="950px"
        >
          <div className="industry-modal-container">
            <p>데이터를 불러오는 중입니다...</p>
          </div>
        </CustomModal>
    );
  }

  const displayCategories = categories.slice(0, 5);

  return (
      <CustomModal
          isOpen={isOpen}
          onClose={onClose}
          title="업종 선택"
          width="950px"
      >
        <div className="industry-modal-container">
          <form name="chkForm" id="chkForm" method="post" autoComplete="off">
            <ul className="select_nav">
              {displayCategories.map((category, index) => (
                  <li key={index}>{category}</li>
              ))}
            </ul>
            <ul className="select_box">
              {displayCategories.map((category, categoryIndex) => (
                  <li key={categoryIndex}>
                    <ul className="select_box-scroll">
                      {groupedData[category]?.map((option) => (
                          <li key={getUniqueId(category, option.operationDataId)}>
                            <input
                                type="checkbox"
                                id={getUniqueId(category, option.operationDataId)}
                                name="agree"
                                value={option.operationDataId}
                                className="check_box"
                                checked={selectedItems.some(
                                    (item) =>
                                        item.operationDataId === option.operationDataId,
                                )}
                                onChange={(e) => handleCheckboxChange(e, option)}
                            />
                            <label
                                htmlFor={getUniqueId(category, option.operationDataId)}
                                className="label"
                            >
                              {option.level3}
                            </label>
                          </li>
                      ))}
                    </ul>
                  </li>
              ))}
            </ul>

            <div className="choice_container">
              <div className="choice_box">
                {selectedItems.map((item, index) => (
                    <div key={item.operationDataId} className="choice_flex">
                      <div className="choice_txt">{item.displayLabel}</div>
                      <button
                          type="button"
                          onClick={() => handleRemoveOption(item.operationDataId)}
                      >
                        <i className="fa-solid fa-xmark">
                          <span>삭제</span>
                        </i>
                      </button>
                    </div>
                ))}
              </div>
              <div className="choice_reset">
                <button
                    type="button"
                    className="choice_flex"
                    onClick={handleReset}
                >
                  <div className="choice_txt rotate">초기화</div>
                  <i className="fa-solid fa-rotate rotate">
                    <span>삭제</span>
                  </i>
                </button>
              </div>
            </div>

            <div className="modal_sbtn">
              <div className="btnm">
                <button
                    type="button"
                    id="btn_insert"
                    className="btns btn-submit"
                    onClick={handleConfirm}
                >
                  확인
                </button>
                <button
                    type="button"
                    className="btns btn-cancel"
                    onClick={handleCancel}
                >
                  취소
                </button>
              </div>
            </div>
          </form>
        </div>
      </CustomModal>
  );
};

export default IndustryModal;
