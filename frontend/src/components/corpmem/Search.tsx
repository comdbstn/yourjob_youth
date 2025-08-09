import React, { useState, useEffect } from "react";
import CorpLayout from "../layout/CorpLayout";
import "../../../public/css/corpmypage.css";
import "../../../public/css/nice-select.css";
import ProposalModal from "./ProposalModal";
import TalentScrapModal from "./TalentScrapModal";
import { Talent, ProposalData, ProposalRequestData } from "../../types/talent";
import {
  fetchTalents,
  removeTalentScrap,
  sendPositionProposal,
  fetchTopTalents,
} from "../../api/talentApi";
import PostingPagination from "../common/PostingPagination";
import { formatGender } from "../../utils/formatUtils";
import { SchoolType } from "../../app/dummy/options";
import { SchoolTypeText } from "../../app/dummy/options";
import NiceSelectBox from "../common/NiceSelectBox";
import { Link, useNavigate } from "react-router-dom";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const searchTypeOptions = [
  { value: "", label: "통합검색" },
  { value: "company", label: "회사명" },
  { value: "school", label: "학교명" },
];

const genderOptions = [
  { value: "", label: "성별" },
  { value: "male", label: "남" },
  { value: "female", label: "여" },
];

const statusOptions = [
  { value: "", label: "구직상태" },
  { value: "재직중", label: "재직중" },
  { value: "구직중", label: "구직중" },
];

const careerOptions = [
  { value: "", label: "경력" },
  { value: "신입", label: "신입" },
  { value: "경력", label: "경력" },
];

interface LevelCode {
  code: string;
  levelValue: string;
  parentCode: string | null;
}

interface LevelCodeListDto {
  dataType: string;
  dataTypeName: string;
  levelCodes: LevelCode[];
}

const API_URL = process.env.REACT_APP_API_BASE_URL || "https://localhost:8082";

const fetchWorkplaceOptions = async () => {
  try {
    const [response1, response2] = await Promise.all([
      fetch(
        `${API_URL}/api/v1/mdms/operation-data/level1-codes?dataType=00000012`
      ),
      fetch(
        `${API_URL}/api/v1/mdms/operation-data/level1-codes?dataType=00000013`
      ),
    ]);

    if (!response1.ok || !response2.ok) {
      throw new Error("API 요청 실패");
    }

    const data1: LevelCodeListDto = await response1.json();
    const data2: LevelCodeListDto = await response2.json();

    const levelCodes1 = data1?.levelCodes || [];
    const levelCodes2 = data2?.levelCodes || [];
    const allLevelCodes = [...levelCodes1, ...levelCodes2];

    const uniqueCodes = allLevelCodes.filter(
      (code, index, self) =>
        index === self.findIndex((c) => c.levelValue === code.levelValue)
    );

    const workplaceOptions = [
      { value: "", label: "희망근무지" }, // 기본 선택 옵션
      ...uniqueCodes.map((code: LevelCode) => ({
        value: code.levelValue, // 검색 시 값으로 보내야 하므로 levelValue를 value로 사용
        label: code.levelValue, // 화면에 표시할 텍스트
      })),
    ];

    return workplaceOptions;
  } catch (error) {
    console.error("희망근무지 조회 실패:", error);
    // 에러 발생 시 기본값 반환
    return [{ value: "", label: "희망근무지" }];
  }
};

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [topTalents, setTopTalents] = useState<Talent[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [sortType, setSortType] = useState<"recommended" | "updated">(
    "recommended"
  );
  const [isSearched, setIsSearched] = useState<boolean>(false);

  // 희망근무지 옵션 상태 추가
  const [workplaceOptions, setWorkplaceOptions] = useState([
    { value: "", label: "희망근무지" },
  ]);

  // 검색 필터 상태
  const [searchFilters, setSearchFilters] = useState({
    searchType: "",
    gender: "",
    status: "",
    career: "",
    workplace: "",
    keyword: "",
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
    loadWorkplaceOptions(); // 희망근무지 옵션 로딩 추가
  }, []);

  useEffect(() => {
    if (isSearched) {
      applySearch();
    } else {
      loadTalents();
    }
  }, [currentPage, sortType]);

  // 희망근무지 옵션 로딩 함수 추가
  const loadWorkplaceOptions = async () => {
    const options = await fetchWorkplaceOptions();
    setWorkplaceOptions(options);
  };

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

  // 검색 필터 변경 핸들러
  const handleFilterChange = (name: string, value: string | null) => {
    setSearchFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  useEffect(() => {
    const handlePop = () => {
      if (isSearched) {
        // 검색 전 상태로 리셋
        setIsSearched(false);
        setTalents([]); // 결과 초기화
        setCurrentPage(1); // 페이지 초기화
        setSearchFilters({
          searchType: "",
          gender: "",
          status: "",
          career: "",
          workplace: "",
          keyword: "",
        });
        applySearch();
      }
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [isSearched]);

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    applySearch();
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
    setIsSearched(true);
    window.history.pushState({ searched: true }, "");
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
    <CorpLayout>
      <MetaTagHelmet title="인재 검색" description="인재 검색" />
      <div className="container-center-horizontal">
        <div className="crop-wrap screen">
          <div className="container">
            <div className="search_control">
              <NiceSelectBox
                value={searchFilters.searchType}
                options={searchTypeOptions}
                onChange={(value) => handleFilterChange("searchType", value)}
                placeholder="검색 타입 선택"
              />
              <NiceSelectBox
                value={searchFilters.gender}
                options={genderOptions}
                onChange={(value) => handleFilterChange("gender", value)}
                placeholder="성별"
              />
              <NiceSelectBox
                value={searchFilters.status}
                options={statusOptions}
                onChange={(value) => handleFilterChange("status", value)}
                placeholder="구직상태"
              />
              <NiceSelectBox
                value={searchFilters.career}
                options={careerOptions}
                onChange={(value) => handleFilterChange("career", value)}
                placeholder="경력"
              />
              <NiceSelectBox
                value={searchFilters.workplace}
                options={workplaceOptions}
                onChange={(value) => handleFilterChange("workplace", value)}
                placeholder="희망근무지"
              />
              <div className="searchbox">
                <div className="search_box">
                  <input
                    type="search"
                    id="s_keyword"
                    name="keyword"
                    className="form-control search_input"
                    placeholder=""
                    value={searchFilters.keyword}
                    onChange={(e) =>
                      handleFilterChange("keyword", e.target.value)
                    }
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="searchicon"
                  onClick={handleSearch}
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
              <button
                type="button"
                className="searchbtn"
                onClick={handleSearch}
              >
                검색
              </button>
            </div>

            {/* TOP 인재 */}
            {!isSearched && (
              <>
                <div className="head_txt">TOP 인재</div>
                <div className="top_talent mb45">
                  {topTalents.map((talent) => (
                    <div
                      className="card"
                      key={talent.id}
                      onClick={() =>
                        navigate(`/corpmem/resumedetail/${talent.id}`)
                      }
                    >
                      <div className="talentBox">
                        <div className="picture">
                          <img
                            src={talent.profileImage}
                            alt={talent.name}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.parentElement!.innerHTML = `
                                <svg xmlns="http://www.w3.org/2000/svg" width="27" height="35" viewBox="0 0 27 35" fill="none">
                                  <path d="M13.497 16.7143C18.1126 16.7143 21.8542 12.9727 21.8542 8.35714C21.8542 3.74162 18.1126 0 13.497 0C8.88151 0 5.13989 3.74162 5.13989 8.35714C5.13989 12.9727 8.88151 16.7143 13.497 16.7143Z" fill="white"></path>
                                  <path d="M13.5 17.9995C6.04979 17.9995 0 23.8987 0 31.1634V32.5289C0 33.7306 1.0083 34.7138 2.24066 34.7138H24.7593C25.9917 34.7138 27 33.7306 27 32.5289V31.1634C27 23.8987 20.9502 17.9995 13.5 17.9995Z" fill="white"></path>
                                </svg>
                              `;
                            }}
                          />
                        </div>
                        <div className="info">
                          <div className="flex-row">
                            <p>
                              {talent.name}
                              <span>
                                ({formatGender(talent.gender)},만 {talent.age}
                                세)
                              </span>
                            </p>
                            <p
                              className={`exper ${
                                talent.career.years > 2 ? "active" : ""
                              }`}
                            >
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
                            </p>
                          </div>
                          <h2>
                            {talent.career.company || "회사명"}
                            <span style={{ marginLeft: "5px" }}>근무</span>
                          </h2>
                          <div className="stxt">
                            {talent.career.position || "직무 정보 없음"}
                          </div>
                        </div>
                      </div>
                      <div className="TagBox">
                        <div className="talentTag">
                          {talent.skills.map(
                            (skill, index) =>
                              skill && <p key={index}>{skill}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          className="Inter"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleScrap(talent.id);
                          }}
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
                              fill={talent.isScraped ? "#FFC300" : "#A8A8A8"}
                            />
                            {!talent.isScraped && (
                              <path
                                d="M9.5 12.6947L5.928 14.8453L6.878 10.7905L3.724 8.06211L7.885 7.70211L9.5 3.88421L11.1245 7.71158L15.2855 8.07158L12.1315 10.8L13.0815 14.8547L9.5 12.6947Z"
                                fill="#A8A8A8"
                              />
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {/* TOP 인재 end */}

            {/* 인재정보 */}
            <div className="head_txt">인재정보</div>
            <div className="talentSort">
              <button
                type="button"
                className={`sortBtn ${
                  sortType === "recommended" ? "active" : ""
                }`}
                onClick={() => handleSortChange("recommended")}
              >
                추천순
              </button>
              <button
                type="button"
                className={`sortBtn ${sortType === "updated" ? "active" : ""}`}
                onClick={() => handleSortChange("updated")}
              >
                업데이트일순
              </button>
            </div>

            <ul className="talentList">
              {talents.length === 0 ? (
                <div className="no-result">검색 결과가 없습니다.</div>
              ) : (
                talents.map((talent) => (
                  <li key={talent.id}>
                    <Link to={`/corpmem/resumedetail/${talent.id}`}>
                      <div className="item">
                        <div className="uinfo">
                          <p>
                            {talent.name}
                            <span>
                              ({formatGender(talent.gender)},{" "}
                              {isNaN(talent.age)
                                ? talent.age
                                : `만 ${talent.age}세`}
                              )
                            </span>
                          </p>
                          <p className="exper">
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
                          </p>
                        </div>
                        <div className="uinfoBox">
                          <div className="infodata">
                            <p>
                              {talent.career.company || "회사명"}
                              <span>근무</span>
                            </p>
                            <p>
                              <span>
                                {talent.education
                                  ? `${talent.education.school} ${
                                      SchoolTypeText[
                                        talent.education.degree as SchoolType
                                      ]
                                    }`
                                  : "학력 정보 없음"}
                              </span>
                            </p>
                            <p className="area">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="11"
                                height="14"
                                viewBox="0 0 11 14"
                                fill="none"
                              >
                                <path
                                  d="M5.5 0C2.45929 0 0 2.39129 0 5.34792C0 9.35887 5.5 13.582 5.5 13.582C5.5 13.582 11 9.35887 11 5.34792C11 2.39129 8.54071 0 5.5 0ZM1.57143 5.34792C1.57143 3.23931 3.33143 1.52798 5.5 1.52798C7.66857 1.52798 9.42857 3.23931 9.42857 5.34792C9.42857 7.54821 7.16571 9.40471 5.5 11.4598C3.86571 9.41999 1.57143 7.52529 1.57143 5.34792Z"
                                  fill="#A8A8A8"
                                />
                                <path
                                  d="M5.49944 7.25989C6.58429 7.25989 7.46373 6.40476 7.46373 5.34991C7.46373 4.29507 6.58429 3.43994 5.49944 3.43994C4.4146 3.43994 3.53516 4.29507 3.53516 5.34991C3.53516 6.40476 4.4146 7.25989 5.49944 7.25989Z"
                                  fill="#A8A8A8"
                                />
                              </svg>
                              {talent.location || "지역 정보 없음"}
                            </p>
                            <div className="TagBox">
                              <div className="talentTag">
                                {talent.skills.map(
                                  (skill, index) =>
                                    skill && <p key={index}>{skill}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="uinfobtnBox">
                            <button
                              type="button"
                              className={`${!talent.isScraped ? "save" : ""}`}
                              onClick={(e) => {
                                e.preventDefault();
                                if (!talent.isScraped) {
                                  handleToggleScrap(talent.id);
                                }
                              }}
                              style={{
                                cursor: talent.isScraped
                                  ? "default"
                                  : "pointer",
                              }}
                            >
                              {/* {talent.isScraped ? "저장됨" : "후보자 저장"} */}
                              후보자 저장
                            </button>

                            <button
                              type="button"
                              className="proposal"
                              onClick={(e) => {
                                e.preventDefault();
                                handleOpenProposalModal(talent);
                              }}
                            >
                              포지션 제안하기
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
            {/* 인재정보 end*/}

            {/* 페이지네이션 */}
            <PostingPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
            {/* 페이지네이션 end */}

            {/* 포지션 제안 모달 */}
            <ProposalModal
              isOpen={showProposalModal}
              onClose={handleCloseProposalModal}
              onSubmit={handleSubmitProposal}
              name={selectedTalent?.name || ""}
              gender={selectedTalent?.gender || ""}
              age={selectedTalent?.age || 0}
            />

            {/* 스크랩 모달 */}
            {isScrapModalOpen && scrapTalentId && (
              <TalentScrapModal
                userId={scrapTalentId || 0}
                isOpen={isScrapModalOpen}
                onConfirm={() => navigate(`/corpmem/scraphuman`)}
                onClose={closeScrapModal}
              />
            )}
          </div>
        </div>
      </div>
    </CorpLayout>
  );
};

export default Search;
