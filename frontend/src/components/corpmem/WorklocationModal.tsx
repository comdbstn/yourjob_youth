import React, { useEffect, useState } from "react";
import CustomModal from "../common/CustomModal";
import "./WorklocationModal.css";
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

interface WorklocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedItems: SelectedItem[]) => void;
  initialSelected?: SelectedItem[];
}

const WorklocationModal: React.FC<WorklocationModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialSelected = [],
}) => {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [domesticData, setDomesticData] = useState<JobpostDataItem[]>([]);
  const [overseasData, setOverseasData] = useState<JobpostDataItem[]>([]);
  const [allData, setAllData] = useState<JobpostDataItem[]>([]);
  const [groupedData, setGroupedData] = useState<
    Record<string, JobpostDataItem[]>
  >({});
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [visibleCategories, setVisibleCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const categoriesPerPage = 4;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const domestic = await fetchJobpostData("00000012");
      setDomesticData(domestic);

      const overseas = await fetchJobpostData("00000013");
      setOverseasData(overseas);

      const combined = [...domestic, ...overseas];
      setAllData(combined);

      const groupedDomestic = groupDataByLevel1(domestic);
      const groupedOverseas = groupDataByLevel1(overseas);

      const combinedGrouped = { ...groupedDomestic, ...groupedOverseas };
      setGroupedData(combinedGrouped);

      const domesticCategories = getUniqueLevel1Values(domestic);
      const overseasCategories = getUniqueLevel1Values(overseas);

      const combinedCategories = [...domesticCategories, ...overseasCategories];
      setAllCategories(combinedCategories);

      const total = Math.ceil(combinedCategories.length / categoriesPerPage);
      setTotalPages(total);

      updateVisibleCategories(1, combinedCategories);

      setLoading(false);
    };

    fetchData();
  }, []);

  const updateVisibleCategories = (
    page: number,
    categories: string[] = allCategories,
  ) => {
    const startIdx = (page - 1) * categoriesPerPage;
    const endIdx = startIdx + categoriesPerPage;
    setVisibleCategories(categories.slice(startIdx, endIdx));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateVisibleCategories(page);
  };

  useEffect(() => {
    if (initialSelected.length > 0) {
      setSelectedItems(initialSelected);
    }
  }, [initialSelected, allData]);

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
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        title="근무지역 선택"
        width="950px"
      >
        <div className="work-location-modal-container">
          <p>데이터를 불러오는 중입니다...</p>
        </div>
      </CustomModal>
    );
  }

  const hasPagination = allCategories.length > categoriesPerPage;

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="근무지역 선택"
      width="950px"
    >
      <div className="work-location-modal-container">
        <form name="chkForm" id="chkForm" method="post" autoComplete="off">
          <div className="tab-navigation">
            <ul className="select_nav">
              {visibleCategories.map((category, index) => (
                <li key={`loc-${category}-${index}`}>{category}</li>
              ))}
            </ul>
          </div>

          <ul className="select_box">
            {visibleCategories.map((category, categoryIndex) => (
              <li key={`locBox-${category}-${categoryIndex}`}>
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
                        {option.level2 || option.level1}
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

export default WorklocationModal;
