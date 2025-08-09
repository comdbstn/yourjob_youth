import React from 'react';


const DeadlineModal: React.FC = () => {
  return (
    <div id="addmodal">
      <div className="h_title">채용 공고를 마감하시겠습니까?</div>
      <div className="s_title">마감하시면 채용공고가 게재되지 않습니다.<br/>마감된 공고는 접수마감 리스트에서 확인하실 수 있습니다.</div>
      <form name="chkForm" id="chkForm" method="post" autoComplete="off">
        <div className="modal_sbtn mt25">
          <div className="btnm">
            <button type="button" id="deadline_ok" className="btns deadlineBtn">마감</button>
            <a href="#close-modal" rel="modal:close">
              <button type="button" className="btns closeBtn">취소</button>
            </a>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DeadlineModal;