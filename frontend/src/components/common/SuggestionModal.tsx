import React from 'react';
import { useNavigate } from 'react-router-dom';
import CustomModal from './CustomModal';
import './SuggestionModal.css';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuggestionModal: React.FC<SuggestionModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleMove = () => {
    navigate('/corpmem/productmypage');
    onClose();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      width="480px"
    >
      <div className="suggestion-modal-container">
        <div className="complete">
          <p className="message">
            포지션 제안 상품 구매가 필요합니다.<br />
            안내페이지로 이동하시겠습니까?
          </p>
          <div className="button-group">
            <button className="move-button" onClick={handleMove}>
              이동
            </button>
            <button className="cancel-button" onClick={onClose}>
              취소
            </button>
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default SuggestionModal; 