import React, { useEffect, useState } from "react";
import CustomModal from "../common/CustomModal";
import "./JobRankModal.css";
import { positionOptions, roleOptions } from "../../app/dummy/options";

interface SelectedItem {
  operationDataId: string;
  displayLabel: string;
}

interface JobRankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedItems: SelectedItem[]) => void;
  initialSelected?: SelectedItem[];
}

const JobRankModal: React.FC<JobRankModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialSelected = [],
}) => {
  const [selectedItems, setSelectedItems] =
    useState<SelectedItem[]>(initialSelected);

  // 더미 데이터 사용이므로 ID/라벨이 같음. 하지만 일관성을 위해 SelectedItem 객체 사용
  const allOptions = [...positionOptions, ...roleOptions];

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    label: string,
  ) => {
    const { value, checked } = e.target;

    if (checked) {
      setSelectedItems((prev) => [
        ...prev,
        {
          operationDataId: value,
          displayLabel: label,
        },
      ]);
    } else {
      setSelectedItems((prev) =>
        prev.filter((item) => item.operationDataId !== value),
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
  const getUniqueId = (category: string, id: number) => `${category}-${id}`;

  // useEffect(() => {
  //   // initialSelected는 SelectedItem 배열로 가정
  //   setSelectedItems(initialSelected);
  // }, [initialSelected]);

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="직급/직책 선택"
      width="950px"
    >
      <div className="jobrank-modal-container">
        <form name="chkForm" id="chkForm" method="post" autoComplete="off">
          <ul className="select_nav">
            <li className="half">직급</li>
            <li className="half">직책</li>
          </ul>
          <ul className="select_box">
            <li className="half">
              <ul className="select_box-scroll h-unset flex-row flex-wrap">
                {positionOptions.map((option) => (
                  <li key={getUniqueId("position", option.id)} className="half">
                    <input
                      type="checkbox"
                      id={getUniqueId("position", option.id)}
                      name="agree"
                      value={option.label}
                      className="check_box"
                      checked={selectedItems.some(
                        (item) => item.operationDataId === option.label,
                      )}
                      onChange={(e) => handleCheckboxChange(e, option.label)}
                    />
                    <label
                      htmlFor={getUniqueId("position", option.id)}
                      className="label letter-spac1"
                    >
                      {option.label}
                    </label>
                  </li>
                ))}
              </ul>
            </li>
            <li className="half">
              <ul className="select_box-scroll h-unset flex-row flex-wrap">
                {roleOptions.map((option) => (
                  <li key={getUniqueId("role", option.id)} className="half">
                    <input
                      type="checkbox"
                      id={getUniqueId("role", option.id)}
                      name="agree"
                      value={option.label}
                      className="check_box"
                      checked={selectedItems.some(
                        (item) => item.operationDataId === option.label,
                      )}
                      onChange={(e) => handleCheckboxChange(e, option.label)}
                    />
                    <label
                      htmlFor={getUniqueId("role", option.id)}
                      className="label letter-spac1"
                    >
                      {option.label}
                    </label>
                  </li>
                ))}
              </ul>
            </li>
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

export default JobRankModal;
