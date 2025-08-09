import React from 'react';


const AcceptModal: React.FC = () => {
  return (
    <div id="addmodal">
      <div className="modal_title"><h2>합격안내</h2></div>
      <form name="chkForm" id="chkForm" method="post" autoComplete="off">
        <div className="modal_form">
          <div className="inputfield mb20">
            <label className="label" htmlFor="">발표제목</label>
            <input type="text" className="form-control" id="position" name="position" placeholder="발표 제목을 입력해 주세요."/>
          </div>
          <div className="inputfield item_start mb20">
            <label className="label" htmlFor="">발표내용</label>
            <textarea id="txtContent" name="txtContent" className="form-control"
                      placeholder="발표 내용을 입력해 주세요."></textarea>
          </div>
        </div>
        <div className="modal_sbtn mb50">
          <div className="btnm">
            <button type="button" id="deadline_ok" className="btns deadlineBtn">합격발표</button>
            <a href="#close-modal" rel="modal:close">
              <button type="button" className="btns closeBtn">취소</button>
            </a>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AcceptModal;