import React from 'react';


const DataDelModal: React.FC = () => {
  return (
    <div id="addmodal">
      <div className="h_title">선택한 항목을 삭제하시겠습니까?</div>
      <form name="chkForm" id="chkForm" method="post" autoComplete="off">
        <div className="modal_sbtn mt30">
          <div className="btnm">
            <button type="button" id="deadline_ok" className="btns deadlineBtn">삭제</button>
            <a href="#close-modal" rel="modal:close">
              <button type="button" className="btns closeBtn">취소</button>
            </a>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DataDelModal;