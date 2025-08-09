import React, { useEffect, useState } from "react";
import CustomModal from "../common/CustomModal";
import "./CapacityTypeModal.css";
import { fetchJobpostData, JobpostDataItem } from "../../api/jobpostData";

interface SelectedItem {
  operationDataId: string;
  displayLabel: string;
}

interface CapacityTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedItems: SelectedItem[]) => void;
  initialSelected?: SelectedItem[]; // 여기가 수정되었습니다. string[]에서 SelectedItem[]로 변경
}

const CapacityTypeModal: React.FC<CapacityTypeModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialSelected = [],
}) => {
  const [selectedItems, setSelectedItems] =
    useState<SelectedItem[]>(initialSelected);
  const [capacityData, setCapacityData] = useState<JobpostDataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [capacityGroups, setCapacityGroups] = useState<JobpostDataItem[][]>([
    [],
    [],
    [],
    [],
  ]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await fetchJobpostData("00000020");
      setCapacityData(data);

      const totalCapacities = data.length;
      const groupSize = Math.ceil(totalCapacities / 4);

      const group1 = data.slice(0, groupSize);
      const group2 = data.slice(groupSize, groupSize * 2);
      const group3 = data.slice(groupSize * 2, groupSize * 3);
      const group4 = data.slice(groupSize * 3);

      setCapacityGroups([group1, group2, group3, group4]);
      setLoading(false);
    };

    fetchData();
  }, []);
  // useEffect(() => {
  //   if (isOpen) {
  //     setSelectedItems(initialSelected);
  //   }
  // }, [isOpen, initialSelected]);

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    option: JobpostDataItem,
  ) => {
    const { checked } = e.target;

    if (checked) {
      setSelectedItems((prev) => [
        ...prev,
        {
          operationDataId: option.operationDataId,
          displayLabel: option.level1 || "",
        },
      ]);
    } else {
      setSelectedItems((prev) =>
        prev.filter((item) => item.operationDataId !== option.operationDataId),
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

  const getUniqueId = (id: string) => `capacity-${id}`;

  if (loading) {
    return (
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        title="핵심역량 선택"
        width="950px"
      >
        <div className="capacity-type-modal-container">
          <p>데이터를 불러오는 중입니다...</p>
        </div>
      </CustomModal>
    );
  }

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="핵심역량 선택"
      width="950px"
    >
      <div className="capacity-type-modal-container">
        <form name="chkForm" id="chkForm" method="post" autoComplete="off">
          <ul className="select_nav">
            <li className="full">핵심역량 선택</li>
          </ul>
          <ul className="select_box">
            {capacityGroups.map((group, groupIndex) => (
              <li key={groupIndex}>
                <ul className="select_box-scroll h-unset">
                  {group
                    .slice() // 원본 배열 변형 방지
                    .sort((a, b) => (a.level1 || '').localeCompare(b.level1 || '', 'ko-KR'))
                    .map((option) => (
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

export default CapacityTypeModal;
