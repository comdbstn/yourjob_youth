import React from 'react';


const DeleteModal: React.FC = () => {
  return (
    <div id="addmodal">
      <div className="h_title">채용 공고를 삭제하시겠습니까?</div>
      <div className="s_title">채용공고를 삭제하시면 내용이 완전히<br/>사라지게 됩니다.</div>
      <form name="chkForm" id="chkForm" method="post" autoComplete="off">
        <div className="modal_sbtn mt25">
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

export default DeleteModal;