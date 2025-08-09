import React from 'react';


const FileupModal: React.FC = () => {
  return (
    <div id="addmodal" className="viewModal">
      <div className="modal_title mb25">자사양식 이력서 등록</div>

      <form name="chkForm" id="chkForm" method="post" autoComplete="off">
        <div className="filebox mb25">
          <input className="upload-name" value="첨부파일" placeholder="첨부파일"/>
          <label htmlFor="file">찾기</label>
          <input type="file" id="file"/>
        </div>

        <div className="modal_sbtn mt25">
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

export default FileupModal;