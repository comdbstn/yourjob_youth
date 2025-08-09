import React from "react";
import CustomModal from "../common/CustomModal";
import "./PositionModal.css";
import { ProposalDetail, ProposalStatus } from "../../types/proposal";
import { formatDate } from "../../utils/dateUtils";

interface PositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ProposalDetail;
  onAccept: () => void;
  onReject: () => void;
  width?: string;
}

const PositionModal: React.FC<PositionModalProps> = ({
  isOpen,
  onClose,
  proposal,
  onAccept,
  onReject,
  width,
}) => {
  const getStatusMessage = () => {
    const date = formatDate(new Date(proposal.proposalUpdatedAt), "YYYY.MM.DD");
    switch (proposal.status) {
      case ProposalStatus.ACCEPTED:
        return `${date}일에 <span class="accepted">수락</span>한 제안입니다.`;
      case ProposalStatus.REJECTED:
        return `${date}일에 <span class="rejected">거절</span>한 제안입니다.`;
      case ProposalStatus.EXPIRED:
        return "만료된 제안입니다.";
      default:
        return "";
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      width={width ? width : "946px"}
    >
      <div className="position-modal-container">
        <div className="modal_title">
          <h2>제안 상세보기</h2>
          {proposal.status !== ProposalStatus.PENDING && (
            <h3 className="status-message" dangerouslySetInnerHTML={{ __html: getStatusMessage() }} />
          )}
          <h3>답변마감일 : {proposal.expiryDate}</h3>
        </div>
        <div className="modal_head">
          <p className="stxt">{proposal.companyName}</p>
          <p className="txt">
            [{proposal.companyName}]{proposal.position}
          </p>
        </div>
        <div className="modal_body">
          <div className="content">
            <h2>{proposal.title}</h2>
            <div className="contentBox">
              <div className="defultTxt">
                <div
                  dangerouslySetInnerHTML={{ __html: proposal.message }}
                ></div>
              </div>
              <div className="defultTxt">
                <h3>포지션 정보</h3>
                <p>{proposal.positionInfo}</p>
              </div>
              <div className="defultTxt">
                <h3>담당자</h3>
                <p>{proposal.manager}</p>
              </div>
            </div>
          </div>
        </div>
        {proposal.status === ProposalStatus.PENDING && (
          <div className="modal_sbtn">
            <div className="btnm">
              <button
                type="button"
                className="btns btn-submit"
                onClick={onAccept}
              >
                수락
              </button>
              <button
                type="button"
                className="btns btn-cancel"
                onClick={onReject}
              >
                거절
              </button>
            </div>
          </div>
        )}
      </div>
    </CustomModal>
  );
};

export default PositionModal;
