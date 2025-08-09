import React from 'react';
import CustomModal from './CustomModal';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: 'success' | 'error';
}

const MessageModal: React.FC<MessageModalProps> = ({ 
  isOpen, 
  onClose, 
  message, 
  type = 'success' 
}) => {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      width="400px"
    >
      <div className="position-modal-container">
        <div className="modal_title">
          <h2 dangerouslySetInnerHTML={{ 
            __html: message.replace(
              /(수락|거절)/g, 
              `<span class='${type === 'success' ? 'primary' : 'red'}'>$1</span>`
            )
          }}></h2>
        </div>
        <div className="modal_sbtn">
          <div className="btnm">
            <button type="button" className="btns btn-submit" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default MessageModal; 