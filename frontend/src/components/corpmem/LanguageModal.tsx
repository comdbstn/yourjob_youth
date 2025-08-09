import React, { useEffect, useState } from "react";
import CustomModal from "../common/CustomModal";
import "./LanguageModal.css";
import { fetchJobpostData, JobpostDataItem } from "../../api/jobpostData";

interface SelectedItem {
  operationDataId: string;
  displayLabel: string;
}

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedItems: SelectedItem[]) => void;
  initialSelected?: SelectedItem[];
}

const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialSelected = [],
}) => {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [languageData, setLanguageData] = useState<JobpostDataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [languageGroups, setLanguageGroups] = useState<JobpostDataItem[][]>([
    [],
    [],
    [],
    [],
  ]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await fetchJobpostData("00000017");
      setLanguageData(data);

      const totalLanguages = data.length;
      const groupSize = Math.ceil(totalLanguages / 4);

      const group1 = data.slice(0, groupSize);
      const group2 = data.slice(groupSize, groupSize * 2);
      const group3 = data.slice(groupSize * 2, groupSize * 3);
      const group4 = data.slice(groupSize * 3);

      setLanguageGroups([group1, group2, group3, group4]);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (initialSelected.length > 0) {
      setSelectedItems(initialSelected);
    }
  }, [initialSelected, languageData]);

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    option: JobpostDataItem,
  ) => {
    const { checked } = e.target;
    const id = option.operationDataId;
    const label = option.level1 || "";

    if (checked) {
      if (selectedItems.length >= 3) {
        alert(`최대 ${3}개까지만 선택 가능합니다.`);
        return;
      }
      setSelectedItems((prev) => [
        ...prev,
        { operationDataId: id, displayLabel: label },
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
  const getUniqueId = (id: string) => `language-${id}`;

  if (loading) {
    return (
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        title="외국어 선택"
        width="950px"
      >
        <div className="language-modal-container">
          <p>데이터를 불러오는 중입니다...</p>
        </div>
      </CustomModal>
    );
  }

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="외국어 선택"
      width="950px"
    >
      <div className="language-modal-container">
        <form name="chkForm" id="chkForm" method="post" autoComplete="off">
          <ul className="select_nav">
            <li className="full">외국어 선택</li>
          </ul>
          <ul className="select_box">
            {languageGroups.map((group, groupIndex) => (
              <li key={groupIndex}>
                <ul className="select_box-scroll">
                  {group.map((option) => (
                    <li key={getUniqueId(option.operationDataId)}>
                      <input
                        type="checkbox"
                        id={getUniqueId(option.operationDataId)}
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
                        htmlFor={getUniqueId(option.operationDataId)}
                        className="label"
                      >
                        {option.level1}
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

export default LanguageModal;
