import React from 'react';


const CompleteModal: React.FC = () => {
  const handleClick = () => {
    window.location.href = '/mypage/resume';
  };

  return (
    <div id="addmodal" className="modal_middle">
      <div className="title">저장이 완료되었습니다.</div>
      <form name="chkForm" id="chkForm" method="post" autoComplete="off">
        <div className="modal_sbtn">
          <div className="btnm">
            <a href="#close-modal" rel="modal:close">
              <button type="button" id="btn_insert" className="btns btn-submit" onClick={handleClick}>확인
              </button>
            </a>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompleteModal;