import React, { useState } from 'react';
import CustomModal from '../common/CustomModal';

interface RefusalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const RefusalModal: React.FC<RefusalModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [isCustomInput, setIsCustomInput] = useState<boolean>(false);

  const reasons = [
    '원하는 직종이 아닙니다.',
    '경력이 맞지 않습니다.',
    '원하는 근무지역이 아닙니다.',
    '원하는 급여조건이 아닙니다.',
    '이미 다른 곳에 취업했습니다.',
    '직접입력'
  ];

  const handleSubmit = () => {
    if (!selectedReason) {
      alert('거절 사유를 선택해주세요.');
      return;
    }
    if (isCustomInput && !customReason.trim()) {
      alert('거절 사유를 작성해주세요.');
      return;
    }
    onSubmit(isCustomInput ? customReason : selectedReason);
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedReason(value);
    setIsCustomInput(value === '직접입력');
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="거절 사유를 선택해 주세요."
      width="420px"
    >
      <div className="position-modal-container">
        <div className="modal_row">
          {reasons.map((reason, index) => (
            <div className="chked-primary" key={index}>
              <input
                type="radio"
                id={`reason${index + 1}`}
                name="refusal"
                value={reason}
                checked={selectedReason === reason}
                onChange={handleReasonChange}
              />
              <label htmlFor={`reason${index + 1}`}>{reason}</label>
            </div>
          ))}
          {isCustomInput && (
            <div className="formBox">
              <textarea
                className="custom-reason-input"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="거절 사유를 입력해주세요."
                rows={2}
                style={{ width: '100%', height: '100px', padding: '8px' }}
              />
            </div>
          )}
        </div>
        <div className="modal_sbtn">
          <div className="btnm">
            <button type="button" className="btns btn-submit" onClick={handleSubmit}>
              보내기
            </button>
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default RefusalModal;