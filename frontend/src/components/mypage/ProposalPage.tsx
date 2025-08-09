import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../layout/Layout";
import "../../../public/css/mypage.css";
import { Proposal, ProposalStatus } from "../../types/proposal";
import { getDummyProposals, proposalApi } from "../../api/proposal";
import PostingPagination from "../common/PostingPagination";
import PositionModal from "./PositionModal";
import { ProposalDetail } from "../../types/proposal";
import RefusalModal from "./RefusalModal";
import MessageModal from "../common/MessageModal";
import { formatDate } from "../../utils/dateUtils";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const ProposalPage: React.FC = () => {
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
        ProposalStatus.REJECTED,
        reason
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

  // 제안 상태 버튼 반환
  const getStatusButton = (proposal: Proposal) => {
    switch (proposal.status) {
      case ProposalStatus.PENDING:
        return (
          <button
            type="button"
            className="resRepleBtn"
            onClick={() => handleViewProposal(proposal.id)}
          >
            답변하기
          </button>
        );
      case ProposalStatus.ACCEPTED:
        return (
          <button
            type="button"
            className="resacceptBtn"
            onClick={() => handleViewProposal(proposal.id)}
          >
            수락
          </button>
        );
      case ProposalStatus.REJECTED:
        return (
          <button
            type="button"
            className="resacceptBtn"
            onClick={() => handleViewProposal(proposal.id)}
          >
            거절
          </button>
        );
      case ProposalStatus.EXPIRED:
        return (
          <button
            type="button"
            className="resacceptBtn"
            onClick={() => handleViewProposal(proposal.id)}
          >
            만료
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <MetaTagHelmet title="받은 포지션 제안" description="받은 포지션 제안" />
      <div className="container-center-horizontal">
        <div className="mypage screen">
          <div className="container">
            <div className="flex-con">
              <div className="sidebar item_start">
                <ul className="snb-list mb2">
                  <li>
                    <Link to="/mypage" className="menu_font01">
                      홈
                    </Link>
                  </li>
                  <li>
                    <Link to="/mypage/resume" className="menu_font01">
                      이력서 관리
                    </Link>
                  </li>
                  <li>
                    <Link to="/mypage/proposal" className="menu_font01 active">
                      받은 포지션 제안
                    </Link>
                  </li>
                  <li>
                    <Link to="/mypage/apply" className="menu_font01">
                      지원현황
                    </Link>
                  </li>
                  <li>
                    <Link to="/mypage/scrap" className="menu_font01">
                      스크랩
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="flex-col">
                <div className="pageTitle">
                  <div className="conTitle">
                    <div className="titDetailSch">받은 포지션 제안</div>
                    <div className="subtit">
                      <span>총 {totalElements}건</span>
                    </div>
                  </div>
                  <div className="search_box">
                    <input
                      type="search"
                      value={keyword}
                      onChange={handleKeywordChange}
                      onKeyPress={handleKeyPress}
                      className="form-control search_form"
                      placeholder="검색어를 입력하세요."
                    />
                    <button
                      type="button"
                      className="searchbtn"
                      onClick={handleSearch}
                    >
                      <i className="fa-solid fa-magnifying-glass"></i>
                    </button>
                  </div>
                </div>

                <div className="bbstable table-list">
                  <table>
                    <colgroup>
                      <col style={{ width: "122px" }} />
                      <col style={{ width: "122px" }} />
                      <col />
                      <col style={{ width: "14%" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>제안일</th>
                        <th>마감일</th>
                        <th>기업명/포지션</th>
                        <th>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proposals.length === 0 && (
                        <tr>
                          <td colSpan={4} className="cell-default">
                            제안 받은 내역이 없습니다.
                          </td>
                        </tr>
                      )}
                      {proposals.map((proposal) => (
                        <tr key={proposal.id}>
                          <td
                            className="cell-default"
                            style={{ height: "155px" }}
                          >
                            {formatDate(
                              new Date(proposal.proposalDate),
                              "YY.MM.DD"
                            )}
                          </td>
                          <td className="cell-default">
                            {formatDate(
                              new Date(proposal.expiryDate),
                              "YY.MM.DD"
                            )}
                          </td>
                          <td className="cell-company">
                            <div className="company">
                              <p className="cnm">{proposal.companyName}</p>
                              <p>{proposal.position}</p>
                            </div>
                          </td>
                          <td className="cell-default">
                            <div className="ListBtnBox">
                              {getStatusButton(proposal)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <PostingPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedProposal && (
        <PositionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          proposal={selectedProposal}
          onAccept={handleAcceptProposal}
          onReject={handleRejectClick}
        />
      )}
      {showRefusalModal && (
        <RefusalModal
          isOpen={showRefusalModal}
          onClose={() => setShowRefusalModal(false)}
          onSubmit={handleRejectSubmit}
        />
      )}
      {showMessageModal && (
        <MessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          message={messageModalContent}
          type={messageModalType}
        />
      )}{" "}
    </Layout>
  );
};

export default ProposalPage;
