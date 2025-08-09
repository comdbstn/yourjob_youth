import React from "react";
import CustomModal from "../common/CustomModal";
import { addTalentScrap, removeTalentScrap } from "../../api/talentApi";
import "./TalentScrapModal.css";

const MODAL_MESSAGES = {
  ADD: "선택한 인재를\n스크랩 인재 페이지로 이동합니다.",
  REMOVE: "선택한 인재를 스크랩에서 삭제하시겠습니까?",
} as const;

interface TalentScrapModalProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  isScraped?: boolean;
}

const TalentScrapModal: React.FC<TalentScrapModalProps> = ({
  userId,
  isOpen,
  onClose,
  onConfirm,
  isScraped = false,
}) => {
  const handleConfirm = async () => {
    try {
      const apiCall = isScraped ? removeTalentScrap : addTalentScrap;
      await apiCall(userId);
      onConfirm?.();
      onClose();
    } catch (error) {
      console.error("인재 스크랩 처리 중 오류가 발생했습니다:", error);
      alert("처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="" width="400px">
      <div className="talent-scrap-modal-container">
        <pre className="scrap-modal-title">
          {isScraped ? MODAL_MESSAGES.REMOVE : MODAL_MESSAGES.ADD}
        </pre>

        <div className="button-group">
          <button onClick={handleConfirm} className="confirm-btn">
            확인
          </button>
          <button onClick={onClose} className="cancel-btn">
            취소
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default TalentScrapModal;
