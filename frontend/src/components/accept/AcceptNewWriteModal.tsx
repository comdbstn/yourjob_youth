import React from 'react';
import CustomModal from '../common/CustomModal';
import './AcceptNewWriteModal.css';

interface AcceptNewWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const AcceptNewWriteModal: React.FC<AcceptNewWriteModalProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      showCloseButton={false}
    >
      <div className="accept-new-write-modal">
        <p>현재 작성 중인 내용은 저장되지 않습니다.<br/>새로운 자소서를 작성할까요?</p>
        <div className="accept-new-write-modal-buttons">
          <button className="confirm-button" onClick={onConfirm}>확인</button>
          <button className="cancel-button" onClick={onClose}>취소</button>
        </div>
      </div>
    </CustomModal>
  );
};

export default AcceptNewWriteModal; 