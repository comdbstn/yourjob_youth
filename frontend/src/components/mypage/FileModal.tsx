import React from 'react';


const FileModal: React.FC = () => {
  return (
    <div id="addmodal">
      <div className="modal_title mb20">
        <h2>보관함</h2>
      </div>

      <form name="chkForm" id="chkForm" method="post" autoComplete="off">

        <div className="fileStorage">
          <div className="mypc">
            <button type="button" className="mypcBtn" id="mypcBtn">내PC</button>
          </div>
          <div className="card">
            <ul className="card_head">
              <li className="w1 txtcenter">구분</li>
              <li className="w2">파일명</li>
              <li className="w3">등록일</li>
            </ul>
            <ul className="card_body active">
              <li className="w1"><input type="checkbox" id="chk[]" name="chk[]" value="1" className="check_box"/> 증명서
              </li>
              <li className="w2 ellipsis">증명서.jpg</li>
              <li className="w3">2024.10.10</li>
            </ul>
            <ul className="card_body active">
              <li className="w1"><input type="checkbox" id="chk[]" name="chk[]" value="1" className="check_box"/> 포트폴리오
              </li>
              <li className="w2 ellipsis">http://portfolio.com/web</li>
              <li className="w3">2024.10.10</li>
            </ul>
            <ul className="card_body">
              <li className="w1"><input type="checkbox" id="chk[]" name="chk[]" value="1" className="check_box"/> 아포스티유
              </li>
              <li className="w2 ellipsis">아포스티유.jpg</li>
              <li className="w3">2024.10.10</li>
            </ul>
          </div>
        </div>


        <div className="modal_sbtn mt20">
          <div className="btnm">
            <button type="button" className="btns ApplyBtn" id="AttachFile">첨부하기</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FileModal;