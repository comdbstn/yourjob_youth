import React from 'react';


const InterviewpassModal: React.FC = () => {
  return (
    <div id="addmodal">
      <div className="h_title">홍길동 지원자를 [면접]에서<br/>[최종합격]으로 이동합니다.</div>
      <form name="chkForm" id="chkForm" method="post" autoComplete="off">
        <div className="modal_sbtn mt25">
          <div className="btnm">
            <button type="button" id="deadline_ok" className="btns deadlineBtn">확인</button>
            <a href="#close-modal" rel="modal:close">
              <button type="button" className="btns closeBtn">취소</button>
            </a>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InterviewpassModal;