import { Link, useLocation } from "react-router-dom";
import MainFooter from "../../MainFooter/MainFooter";
import MobileMainHeader from "../../MainHeader/MainHeader";
import "./MobileSearchTalent.css";

import MobileProposalModal from "./components/MobileProposalModal";
import {
  ProposalData,
  ProposalRequestData,
  Talent,
} from "../../../../../types/talent";
import { useState, useEffect } from "react";
import {
  fetchTopTalents,
  fetchTalents,
  removeTalentScrap,
  sendPositionProposal,
} from "../../../../../api/talentApi";
import TalentScrapModal from "../../../../corpmem/TalentScrapModal";
import PostingPagination from "../../../../common/PostingPagination";
import { formatGender } from "../../../../../utils/formatUtils";
import React from "react";
import { MetaTagHelmet } from "../../../../common/MetaTagHelmet";

export default function MobileSearchTalent() {
  const location = useLocation(); // (추가)
  const params = new URLSearchParams(location.search); // (추가)
  const initialKeyword = params.get("keyword") || "";
  const [topTalents, setTopTalents] = useState<Talent[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [sortType, setSortType] = useState<"recommended" | "updated">(
    "recommended"
  );
  const [isSearched, setIsSearched] = useState<boolean>(false);

  // 검색 필터 상태
  const [searchFilters, setSearchFilters] = useState({
    searchType: "",
    gender: "",
    status: "",
    career: "",
    workplace: "",
    keyword: initialKeyword,
  });

  // 포지션 제안 모달 상태
  const [showProposalModal, setShowProposalModal] = useState<boolean>(false);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  // 스크랩 모달 상태 추가
  const [isScrapModalOpen, setIsScrapModalOpen] = useState<boolean>(false);
  const [scrapTalentId, setScrapTalentId] = useState<number | null>(null);

  // 데이터 로딩
  useEffect(() => {
    loadTopTalents();
    loadTalents();
  }, []);

  useEffect(() => {
    loadTalents();
  }, [currentPage]);

  // Top 인재 목록 조회
  const loadTopTalents = async () => {
    try {
      // TOP 인재 조회
      const response = await fetchTopTalents();
      setTopTalents(response.content);
    } catch (err) {
      console.error("TOP 인재 목록 조회 실패:", err);
    }
  };

  // 인재 목록 조회
  const loadTalents = async () => {
    try {
      // 전체 인재 목록 조회
      const response = await fetchTalents({
        page: currentPage,
        size: 10,
        searchType: searchFilters.searchType,
        gender: searchFilters.gender,
        status: searchFilters.status,
        career: searchFilters.career,
        workplace: searchFilters.workplace,
        keyword: searchFilters.keyword,
        sortType: sortType,
      });
      setTalents(response.content);
      setTotalPages(response.totalPages);

      // setTalents(getMockTalents());
      // setTotalPages(1);
    } catch (err) {
      console.error("전체 인재 목록 조회 실패:", err);
    }
  };

  // 필터 적용하여 인재 목록 조회
  const applySearch = async () => {
    try {
      // 필터를 적용한 API 요청
      const response = await fetchTalents({
        searchType: searchFilters.searchType,
        gender: searchFilters.gender,
        status: searchFilters.status,
        career: searchFilters.career,
        workplace: searchFilters.workplace,
        keyword: searchFilters.keyword,
        page: 1, // 검색 시 첫 페이지부터 조회
        size: 10,
        sortType: sortType,
      });

      setTalents(response.content);
      setTotalPages(response.totalPages);

      // 페이지네이션 초기화
      setCurrentPage(1);
    } catch (err) {
      console.error("필터링된 인재 목록 조회 실패:", err);
    }
  };
  useEffect(() => {
    // (추가) 검색 여부에 따라 전체 로드 or 검색
    if (isSearched) {
      applySearch(); // (추가)
    } else {
      loadTalents();
    }
  }, [currentPage]);

  // 검색 필터 변경 핸들러
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    applySearch();
    setIsSearched(true);
  };

  // 정렬 방식 변경 핸들러
  const handleSortChange = (type: "recommended" | "updated") => {
    setSortType(type);

    // 정렬 방식 변경 시 API 요청
    fetchTalents({
      searchType: searchFilters.searchType,
      gender: searchFilters.gender,
      status: searchFilters.status,
      career: searchFilters.career,
      workplace: searchFilters.workplace,
      keyword: searchFilters.keyword,
      page: currentPage,
      size: 10,
      sortType: type,
    })
      .then((response) => {
        setTalents(response.content);
        setTotalPages(response.totalPages);
      })
      .catch((err) => {
        console.error("정렬 변경 중 오류 발생:", err);
      });
  };

  // 스크랩 모달 열기
  const openScrapModal = (talentId: number) => {
    setScrapTalentId(talentId);
    setIsScrapModalOpen(true);
  };

  // 스크랩 모달 닫기
  const closeScrapModal = () => {
    setScrapTalentId(null);
    setIsScrapModalOpen(false);
    loadTopTalents(); // 목록 새로고침
    loadTalents(); // 목록 새로고침
  };

  // 스크랩 토글 핸들러 수정
  const handleToggleScrap = (talentId: number) => {
    const targetTalent = talents.find((talent) => talent.id === talentId);

    if (targetTalent && targetTalent.isScraped) {
      // 이미 스크랩된 경우 바로 삭제 처리
      removeTalentScrap(talentId)
        .then(() => {
          // 성공 시 목록 업데이트
          updateTalentScrapStatus(talentId, false);
        })
        .catch((err) => {
          console.error("스크랩 삭제 실패:", err);
        });
    } else {
      // 스크랩되지 않은 경우 모달 열기
      openScrapModal(talentId);
    }
  };

  // 스크랩 상태 업데이트 헬퍼 함수
  const updateTalentScrapStatus = (talentId: number, isScraped: boolean) => {
    // 인재 목록 업데이트
    setTalents((prev) =>
      prev.map((talent) =>
        talent.id === talentId ? { ...talent, isScraped } : talent
      )
    );

    // 탑 인재 목록도 업데이트
    setTopTalents((prev) =>
      prev.map((talent) =>
        talent.id === talentId ? { ...talent, isScraped } : talent
      )
    );
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 포지션 제안 모달 열기
  const handleOpenProposalModal = (talent: Talent) => {
    setSelectedTalent(talent);
    setShowProposalModal(true);
  };

  // 포지션 제안 모달 닫기
  const handleCloseProposalModal = () => {
    setSelectedTalent(null);
    setShowProposalModal(false);
  };

  // 포지션 제안 제출 핸들러
  const handleSubmitProposal = async (data: ProposalData) => {
    if (!selectedTalent) return;

    try {
      const proposalData: ProposalRequestData = {
        jobseekerId: selectedTalent.jobseekerId,
        userId: selectedTalent.id,
        position: data.position,
        message: data.message,
        positionInfo: data.positionInfo || "",
        manager: data.manager || "",
        jobPostId: data.jobPostId || 0,
      };

      await sendPositionProposal(proposalData);

      // 성공 시 모달 닫기
      handleCloseProposalModal();
      // 성공 메시지 표시
      alert("포지션 제안이 성공적으로 전송되었습니다.");
    } catch (err) {
      console.error("포지션 제안 실패:", err);
      //alert("포지션 제안 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="MobileSearchTalent_container">
      <MetaTagHelmet title="인재검색" description="인재검색" />
      {/* 스크랩 모달 */}
      {isScrapModalOpen && (
        <TalentScrapModal
          userId={scrapTalentId || 0}
          isOpen={isScrapModalOpen}
          onClose={closeScrapModal}
        />
      )}
      <MobileProposalModal
        isOpen={showProposalModal}
        onClose={handleCloseProposalModal}
        onSubmit={handleSubmitProposal}
        name={selectedTalent?.name || ""}
        gender={selectedTalent?.gender || ""}
        age={selectedTalent?.age || 0}
      />
      <MobileMainHeader />
      <h3 className="siteH3Label">인재검색</h3>
      <div className="searchSection">
        <div className="input_default">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <input
              type="search"
              id="s_keyword"
              name="keyword"
              placeholder="인재를 검색해 보세요."
              value={searchFilters.keyword}
              onChange={handleFilterChange}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
            />
          </form>
          <img src="/img/mobile/searchGlass.svg" onClick={handleSearch} />
        </div>
      </div>
      <section className="topTalentSection">
        <p className="sectionHeader">TOP 인재</p>
        <div className="gridSection">
          {topTalents.map((i) => (
            <Link to={`/m/company/memberProfileView/${i.id}`} key={i.id}>
              <div className="gridRow">
                <p
                  className="profile"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0px",
                    textWrap: "nowrap",
                  }}
                >
                  <strong className="name">{i.name}</strong>({i.gender},{" "}
                  {isNaN(i.age) ? i.age : `만 ${i.age}세`})
                  {!i.career.years && !i.career.months ? null : ` |&nbsp;`}
                  <strong>
                    {!i.career.years && !i.career.months
                      ? null
                      : `경력${i.career.years ? ` ${i.career.years}년` : ""}${
                          i.career.months ? ` ${i.career.months}개월` : ""
                        }`}
                  </strong>
                </p>
                <p className="companyName">
                  <strong>{i.career.company || "회사명"}</strong>근무
                </p>
                <p className="positionName">
                  {i.career.position || "직무 정보 없음"}
                </p>
                <div className="flexJb">
                  <div className="positions">
                    {i.skills.map((skill, index) => (
                      <React.Fragment key={`${i.id}-skill-${index}`}>
                        {skill !== "" && (
                          <div className="positionRow">{skill}</div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="Inter"
                    onClick={() => handleToggleScrap(i.id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="18"
                      viewBox="0 0 19 18"
                      fill="none"
                    >
                      <path
                        d="M19 6.85895L12.1695 6.27158L9.5 0L6.8305 6.28105L0 6.85895L5.187 11.34L3.629 18L9.5 14.4663L15.371 18L13.8225 11.34L19 6.85895Z"
                        fill={i.isScraped ? "#FFC300" : "#A8A8A8"}
                      />
                      {!i.isScraped && (
                        <path
                          d="M9.5 12.6947L5.928 14.8453L6.878 10.7905L3.724 8.06211L7.885 7.70211L9.5 3.88421L11.1245 7.71158L15.2855 8.07158L12.1315 10.8L13.0815 14.8547L9.5 12.6947Z"
                          fill="#A8A8A8"
                        />
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="talentInfoSection">
        <p className="sectionHeader w-full mb-15">인재정보</p>
        <ul>
          {talents.length === 0 ? (
            <div>검색결과가 없습니다.</div>
          ) : (
            <>
              {talents.map((talent) => (
                <li key={talent.id}>
                  <p
                    className="profile"
                    style={{
                      alignItems: "center",
                      textWrap: "nowrap",
                      fontSize: "12px !important",
                    }}
                  >
                    <strong>
                      {talent.name}
                      <span className="genderAge">
                        ({formatGender(talent.gender)},{" "}
                        {isNaN(talent.age) ? talent.age : `만 ${talent.age}세`})
                      </span>
                    </strong>
                    <span className="bar"></span>{" "}
                    <strong className="blueLabel">
                      {" "}
                      {!talent.career.years && !talent.career.months
                        ? null
                        : `경력${
                            talent.career.years
                              ? ` ${talent.career.years}년`
                              : ""
                          }${
                            talent.career.months
                              ? ` ${talent.career.months}개월`
                              : ""
                          }`}
                    </strong>{" "}
                    <span className="bar"></span>{" "}
                    <span className="local">
                      <img
                        src="/img/mobile/location.svg"
                        style={{ width: "15px", height: "15px" }}
                      />
                      서울
                    </span>
                  </p>
                  <p className="compName">
                    <strong>{talent.career.company}</strong> 근무
                  </p>
                  <div className="flexGap10">
                    {talent.skills.map((skill, idx) => (
                      <div className="positionRow" key={idx}>
                        {skill}
                      </div>
                    ))}
                  </div>
                  <div
                    className="flexGap10 w-full"
                    style={{ marginTop: "18px" }}
                  >
                    <button
                      className="blueBtn"
                      onClick={() => handleOpenProposalModal(talent)}
                    >
                      포지션 제안
                    </button>
                    <button
                      className="grayBtn"
                      onClick={() => handleToggleScrap(talent.id)}
                    >
                      {talent.isScraped ? "저장됨" : "후보자 저장"}
                    </button>
                  </div>
                </li>
              ))}
            </>
          )}
        </ul>
      </section>
      <PostingPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      <MainFooter />
    </div>
  );
}
