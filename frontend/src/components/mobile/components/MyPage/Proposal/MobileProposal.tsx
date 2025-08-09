import { useEffect, useState } from "react";
import Search from "../../../../corpmem/Search";
import MainFooter from "../../MainFooter/MainFooter";
import MobileMainHeader from "../../MainHeader/MainHeader";
import ProposalPopup from "./components/Popup/ProposalPopup";
import "./MobileProposal.css";
import { getDummyProposals, proposalApi } from "../../../../../api/proposal";
import {
  Proposal,
  ProposalDetail,
  ProposalStatus,
} from "../../../../../types/proposal";
import PositionModal from "../../../../mypage/PositionModal";
import PostingPagination from "../../../../common/PostingPagination";
import { formatDate } from "../../../../../utils/dateUtils";
import { MetaTagHelmet } from "../../../../common/MetaTagHelmet";

const MobileProposal: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [keyword, setKeyword] = useState("");
  const pageSize = 10;
  const [selectedProposal, setSelectedProposal] =
    useState<ProposalDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRefusalModal, setShowRefusalModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState("");
  const [messageModalType, setMessageModalType] = useState<"success" | "error">(
    "success"
  );

  useEffect(() => {
    fetchProposals();
  }, [currentPage]);

  // 제안 목록 조회
  const fetchProposals = async () => {
    try {
      const response = await proposalApi.getProposals({
        page: currentPage,
        size: pageSize,
        keyword,
      });
      setProposals(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);

      // setProposals(getDummyProposals());
      // setTotalPages(1);
      // setTotalElements(getDummyProposals().length);
    } catch (error) {
      console.error("제안 목록 조회 실패:", error);
    }
  };

  // 검색 처리
  const handleSearch = () => {
    setCurrentPage(1);
    fetchProposals();
  };

  // 검색어 변경 처리
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  // 엔터 키 입력 처리
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 제안 상세 조회
  const handleViewProposal = async (proposalId: number) => {
    try {
      const detail = await proposalApi.getProposalDetail(proposalId);
      // const detail = getDummyProposals().find(p => p.id === proposalId) || null;
      setSelectedProposal(detail);
      setIsModalOpen(true);
    } catch (error) {
      console.error("제안 상세 조회 실패:", error);
    }
  };

  // 제안 수락 처리
  const handleAcceptProposal = async () => {
    if (!selectedProposal) return;
    try {
      await proposalApi.updateProposalStatus(
        selectedProposal.id,
        ProposalStatus.ACCEPTED
      );
      setIsModalOpen(false);
      setMessageModalContent("포지션 제안 수락이 완료되었습니다.");
      setMessageModalType("success");
      setShowMessageModal(true);
      fetchProposals(); // 목록 새로고침
    } catch (error) {
      console.error("제안 수락 실패:", error);
    }
  };

  // 제안 거절 처리
  const handleRejectClick = () => {
    setIsModalOpen(false);
    setShowRefusalModal(true);
  };

  const handleRejectSubmit = async (reason: string) => {
    if (!selectedProposal) return;
    try {
      await proposalApi.updateProposalStatus(
        selectedProposal.id,
        ProposalStatus.REJECTED
      );
      setShowRefusalModal(false);
      setMessageModalContent("포지션 제안 거절이 완료되었습니다.");
      setMessageModalType("error");
      setShowMessageModal(true);
      fetchProposals(); // 목록 새로고침
    } catch (error) {
      console.error("제안 거절 실패:", error);
    }
  };
  const getStatusButton = (proposal: Proposal) => {
    switch (proposal.status) {
      case ProposalStatus.PENDING:
        return (
          <button
            type="button"
            className="selected"
            onClick={() => handleViewProposal(proposal.id)}
          >
            답변하기
          </button>
        );
      case ProposalStatus.ACCEPTED:
        return (
          <button type="button" className="resacceptBtn">
            수락
          </button>
        );
      case ProposalStatus.REJECTED:
        return (
          <button type="button" className="resacceptBtn">
            거절
          </button>
        );
      case ProposalStatus.EXPIRED:
        return (
          <button type="button" className="resacceptBtn">
            만료
          </button>
        );
      default:
        return null;
    }
  };
  return (
    <>
      {/* 팝업이 열려 있을 때만 표시 */}
      {selectedProposal && (
        <PositionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          proposal={selectedProposal}
          onAccept={handleAcceptProposal}
          onReject={handleRejectClick}
          width="90%"
        />
      )}
      <div className="mobileProposal-container">
        <MetaTagHelmet
          title="받은 포지션 제안"
          description="받은 포지션 제안"
        />
        <MobileMainHeader />
        <h2>받은 포지션 제안</h2>
        <section className="searchSection">
          <div className="input_default">
            <input placeholder="검색어를 입력하세요" />
            <img src="/img/search_glass.png" style={{ marginLeft: "auto" }} />
          </div>
        </section>
        <section>
          <ul>
            {proposals.map((i, index) => (
              <li key={index}>
                <p className="date">
                  {formatDate(new Date(i.proposalDate), "yyyy.MM.DD")}
                  <span className="bar"></span>마감일 :
                  {formatDate(new Date(i.expiryDate), "yyyy.MM.DD")}
                </p>
                <div className="middle">
                  <p>{i.companyName}</p>
                  <p>{i.position}</p>
                </div>
                {/* 답변하기 버튼 클릭 시 팝업 열기 */}
                {getStatusButton(i)}
              </li>
            ))}
          </ul>
        </section>
        <PostingPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        <MainFooter />
      </div>
    </>
  );
};

export default MobileProposal;
