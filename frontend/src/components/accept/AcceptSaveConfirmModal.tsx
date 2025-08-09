import React from 'react';
import CustomModal from '../common/CustomModal';
import './AcceptSaveConfirmModal.css';

interface AcceptSaveConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const AcceptSaveConfirmModal: React.FC<AcceptSaveConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      showCloseButton={false}
    >
      <div className="accept-save-confirm-modal">
        <p>작성한 내용을 저장하시겠습니까?</p>
        <div className="accept-save-confirm-modal-buttons">
        <button className="confirm-button" onClick={onConfirm}>확인</button>
          <button className="cancel-button" onClick={onClose}>취소</button>
        </div>
      </div>
    </CustomModal>
  );
};

export default AcceptSaveConfirmModal; 