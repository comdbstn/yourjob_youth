import React from 'react';


const PositionSendModal: React.FC = () => {
  return (
    <div id="addmodal">
      <div className="modal_title"><h2>포지션 제안을 보냈습니다.</h2></div>
      <form name="chkForm" id="chkForm" method="post" autoComplete="off">
        <div className="modal_btnBox mt35">
          <button type="button" className="modal_submit">확인</button>
        </div>
      </form>
    </div>
  );
};

export default PositionSendModal;