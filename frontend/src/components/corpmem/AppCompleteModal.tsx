import React from 'react';


const AppCompleteModal: React.FC = () => {
  return (
    <div id="addmodal">
      <div className="h_title">선택한 항목을 삭제하시겠습니까?</div>
      <form name="chkForm" id="chkForm" method="post" autoComplete="off">
        <div className="modal_sbtn mt30">
          <div className="btnm">
            <button type="button" id="deadline_ok" className="btns deadlineBtn">확인</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AppCompleteModal;