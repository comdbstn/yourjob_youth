import React from "react";
import CustomModal from "../common/CustomModal";
import { axiosInstance } from "../../api/axios";
import "./ScrapModal.css";

interface ScrapModalProps {
  jobPostId: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ScrapModal: React.FC<ScrapModalProps> = ({
  jobPostId,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const handleConfirm = async () => {
    try {
      await axiosInstance.post(`/api/v1/jobs/${jobPostId}/scrap`);
      onConfirm();
      //onClose();
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        console.error("이미 스크랩된 구직입니다:", error);
        alert("이미 스크랩된 구직입니다.");
      } else {
        console.error("스크랩하는 중 오류가 발생했습니다:", error);
      }
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="" width="400px">
      <div className="scrap-modal-container">
        <p className="scrap-modal-title">해당 공고를 스크랩합니다.</p>

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

export default ScrapModal;
