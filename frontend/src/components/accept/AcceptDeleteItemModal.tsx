import React from 'react';
import CustomModal from '../common/CustomModal';
import './AcceptDeleteItemModal.css';

interface AcceptDeleteItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const AcceptDeleteItemModal: React.FC<AcceptDeleteItemModalProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      showCloseButton={false}
    >
      <div className="accept-delete-item-modal">
        <p>선택한 항목을 삭제하시겠습니까?</p>
        <div className="accept-delete-item-modal-buttons">
          <button className="confirm-button" onClick={onConfirm}>확인</button>
          <button className="cancel-button" onClick={onClose}>취소</button>
        </div>
      </div>
    </CustomModal>
  );
};

export default AcceptDeleteItemModal; 