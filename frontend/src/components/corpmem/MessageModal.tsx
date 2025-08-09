import React from 'react';


const MessageModal: React.FC = () => {
  return (
    <div id="addmodal" className="modal_middle">
      <div className="title">채용공고가 등록되었습니다.</div>
      <form name="chkForm" id="chkForm" method="post" autoComplete="off">
        <div className="modal_sbtn">
          <div className="btnm">
            <button type="button" id="btn_insert" className="btns btn-submit">확인</button>
            <a href="#close-modal" rel="modal:close">
              <button type="button" className="btns btn-cancel">취소</button>
            </a>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MessageModal;