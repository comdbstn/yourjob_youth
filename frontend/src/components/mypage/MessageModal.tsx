import React from 'react';


const MessageModal: React.FC = () => {
  return (
    <div id="addmodal" className="modal_middle">
      <div className="modal_title">
        <h2></h2>
      </div>
      <div className="modal_sbtn mt20">
        <div className="btnm">
          <a href="#close-modal" rel="modal:close">
            <button type="button" className="btns btn-submit">확인</button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;