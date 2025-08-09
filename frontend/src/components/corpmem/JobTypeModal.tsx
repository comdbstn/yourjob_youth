import React, { useEffect, useState } from "react";
import CustomModal from "../common/CustomModal";
import "./JobTypeModal.css";
import PostingPagination from "../common/PostingPagination";
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

interface JobTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedItems: SelectedItem[]) => void;
  initialSelected?: SelectedItem[];
}

const JobTypeModal: React.FC<JobTypeModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialSelected = [],
}) => {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [jobTypeData, setJobTypeData] = useState<JobpostDataItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [groupedData, setGroupedData] = useState<
    Record<string, JobpostDataItem[]>
  >({});
  const [loading, setLoading] = useState<boolean>(true);
  const [visibleCategories, setVisibleCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const categoriesPerPage = 4;
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await fetchJobpostData("00000009");
      setJobTypeData(data);

      const grouped = groupDataByLevel1(data);
      setGroupedData(grouped);

      const uniqueCategories = getUniqueLevel1Values(data);
      setCategories(uniqueCategories);

      const total = Math.ceil(uniqueCategories.length / categoriesPerPage);
      setTotalPages(total);

      updateVisibleCategories(1, uniqueCategories);

      setLoading(false);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateVisibleCategories(page);
  };

  useEffect(() => {
    if (initialSelected.length > 0) {
      setSelectedItems(initialSelected);
    }
  }, [initialSelected, jobTypeData]);

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    option: JobpostDataItem,
  ) => {
    const { checked } = e.target;
    const label = option.level2 || option.level1 || "";
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
      <CustomModal isOpen={isOpen} onClose={onClose} title="직무" width="950px">
        <div className="job-type-modal-container">
          <p>데이터를 불러오는 중입니다...</p>
        </div>
      </CustomModal>
    );
  }

  const hasPagination = categories.length > categoriesPerPage;

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="직무" width="950px">
      <div className="job-type-modal-container">
        <form name="chkForm" id="chkForm" method="post" autoComplete="off">
          <div className="tab-navigation">
            <ul className="select_nav">
              {visibleCategories.map((category, index) => (
                <li key={`job-${currentPage}-${index}`}>{category}</li>
              ))}
            </ul>
          </div>

          <div className="select_box_wrapper">
            <ul className="select_box">
              {visibleCategories.map((category, categoryIndex) => (
                <li key={`jobtype-${currentPage}-${categoryIndex}`}>
                  <ul className="select_box-scroll">
                    {groupedData[category]?.map((option) => (
                      <li
                        key={`option-${currentPage}-${getUniqueId(
                          category,
                          option.operationDataId,
                        )}`}
                      >
                        <input
                          type="checkbox"
                          id={`input-${currentPage}-${getUniqueId(
                            category,
                            option.operationDataId,
                          )}`}
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
                          htmlFor={`input-${currentPage}-${getUniqueId(
                            category,
                            option.operationDataId,
                          )}`}
                          className="label"
                        >
                          {option.level2 || option.level1}
                        </label>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>

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

          {hasPagination && (
            <div className="pagination-container">
              <PostingPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}

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

export default JobTypeModal;
