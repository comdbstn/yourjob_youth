import React from 'react';


const FileModal: React.FC = () => {
  return (
    <div id="addmodal">
      <div className="modal_title mb20">
        <h2>양식 다운로드</h2>
      </div>

      <form name="chkForm" id="chkForm" method="post" autoComplete="off">
        <div className="fileStorage">
          <div className="card mb5">
            <ul className="card_body item_between">
              <li className="ellipsis">이력서 양식.hwp</li>
              <li><a href="" className="tcolor">다운로드</a></li>
            </ul>
          </div>
          <div className="card mb5">
            <ul className="card_body item_between">
              <li className="ellipsis">자기소개서 양식.pptx</li>
              <li><a href="" className="tcolor">다운로드</a></li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FileModal;