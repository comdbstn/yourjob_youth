import React from 'react';
import '../../../public/css/nice-select.css';


const HomeapplyModal: React.FC = () => {
  return (
    <div id="addmodal">
      <div className="modal_title mb20">
        <h2>입사지원</h2>
      </div>

      <form name="chkForm" id="chkForm" method="post" autoComplete="off">
        <div className="modal_card">
          <div className="card_body">
            <p className="stxt">(주)삼원프린테크</p>
            <p className="txt">문구, 캐릭터 디자인 정규직 채용(경력&신입)</p>
            <select name="nationality">
              <option value="">지원분야를 선택해 주세요.</option>
              <option value="">캐릭터디자인</option>
              <option value="">패키지디자인</option>
              <option value="">문구디자인</option>
              <option value="">타이포디자인</option>
            </select>
          </div>
        </div>

        <div className="modal_card">
          <div className="card_body">
            <p className="txt">지원이력서</p>
            <select name="nationality">
              <option value="">이력서를 선택해 주세요.</option>
              <option value="">이력서1</option>
              <option value="">이력서2</option>
              <option value="">이력서3</option>
            </select>
          </div>
        </div>

        <div className="modal_card">
          <div className="card_body">
            <div className="header">
              <p>선택항목</p>
              <button type="button" className="fileaddBtn" id="fileaddBtn">파일첨부</button>
            </div>
            <div className="file_con">
              <div className="htxt">증명서</div>
              <div className="ctxt">증명서.jpg</div>
              <button type="button" className="delBtn" id="filedelBtn"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="file_con">
              <div className="htxt">포트폴리오</div>
              <div className="ctxt">http://portfolio.com/web</div>
              <button type="button" className="delBtn" id="filedelBtn"><i className="fa-solid fa-xmark"></i></button>
            </div>
          </div>
        </div>
        <ul className="titcon">
          <li>개인정보보호를 위해 개인정보가 포함된 파일은 사전동의 없이 삭제될 수 있습니다.</li>
          <li>제출서류는 채용 마감 후 90일까지 지원기업에게 제공됩니다. 제출에 동의할 경우에만 <br/>[지원하기]버튼을 눌러주세요. 동의하지 않을 경우 입사지원이 불가능합니다.</li>
        </ul>


        <div className="modal_sbtn mt20">
          <div className="btnm">
            <button type="button" className="btns ApplyBtn" id="modelAccept">지원하기</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HomeapplyModal;