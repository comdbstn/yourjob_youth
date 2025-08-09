import React from 'react';


const ProposalModal: React.FC = () => {
  return (
    <div id="addmodal">
      <div className="modal_title">
        <h2>제안 상세보기</h2>
        <h3>2024.10.13일에 <span className='primary'>수락</span>한 제안입니다.</h3>
      </div>
      <div className="modal_head">
        <p className="stxt">(주)유어잡</p>
        <p className="txt">[(주)유어잡]문구, 캐릭터 디자인 정규직 채용(경력&신입)</p>
      </div>
      <form name="chkForm" id="chkForm" method="post" autoComplete="off">
        <div className="modal_body">
          <div className="content">
            <h2>유어잡에서 문구, 캐릭터 디자이너에 적합해보여 연락드립니다.</h2>
            <div className="contentBox">
              <div className="defultTxt">
                <p>
                  안녕하세요. 유어잡입니다.<br/><br/>

                  저희가 찾고 있는 포지션에 적합하다고 판단되어 제안 드립니다.<br/>
                  긍정적인 검토 부탁드리며, 답변 마감일까지 해당 포지션의 제안을 수락한 경우에 한해서 기업에 지원자의<br/>
                  이력서 및 개인정보가 전달되어 다음 전형 안내를 받으실 수 있습니다.<br/><br/>

                  감사합니다.
                </p>
              </div>
              <div className="defultTxt">
                <h3>포지션 정보</h3>
                <p>담당자가 입력한 포지션 정보에 대한 내용이 노출됩니다.</p>
              </div>
              <div className="defultTxt">
                <h3>담당자</h3>
                <p>인사팀 김남길</p>
              </div>
            </div>
          </div>
        </div>
        <div className="modal_sbtn">
          <div className="btnm">
            <a href="#close-modal" rel="modal:close">
              <button type="button" className="btns btn-submit">닫기</button>
            </a>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProposalModal;