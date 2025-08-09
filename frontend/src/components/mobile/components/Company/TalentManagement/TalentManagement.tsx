import { useEffect, useState } from "react";
import MainFooter from "../../MainFooter/MainFooter";
import MobileMainHeader from "../../MainHeader/MainHeader";
import "./TalentManagement.css";
import {
  fetchProposalTalentStatus,
  fetchPositionProposals,
  deletePositionProposals,
  updateInterviewStatus,
  fetchScrapTalents,
  fetchLatestTalents,
  addTalentScrap,
  removeTalentScrap,
  deleteScrapTalents,
} from "../../../../../api/talentApi";
import {
  LatestTalent,
  ProposalTalent,
  ScrapTalent,
} from "../../../../../types/talent";
import PostingPagination from "../../../../common/PostingPagination";
import { formatDate } from "../../../../../utils/dateUtils";
import TalentScrapModal from "../../../../corpmem/TalentScrapModal";
import { useNavigate } from "react-router-dom";
import { formatGender } from "../../../../../utils/formatUtils";
import { MetaTagHelmet } from "../../../../common/MetaTagHelmet";

export default function TalentManagement() {
  const [selectedTab, setSelectedTab] = useState("포지션 제안"); // 기본 선택값 설정
  const [talents, setTalents] = useState<ProposalTalent[]>([]);
  const [scrapTalents, setScrapTalents] = useState<ScrapTalent[]>([]);
  const [latestTalents, setLatestTalents] = useState<LatestTalent[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [filter, setFilter] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedTalents, setSelectedTalents] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const navigate = useNavigate();
  const [statusCounts, setStatusCounts] = useState({
    accept: 0,
    reject: 0,
    none: 0,
  });

  // 데이터 로딩

  // 최근 본 인재 목록 조회
  const loadLatestTalents = async () => {
    try {
      // 최근 본 인재 목록 조회 API 호출
      const response = await fetchLatestTalents({
        page: currentPage,
        size: 10,
      });

      setLatestTalents(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("최근 본 인재 목록 조회 실패:", err);
    }
  };
  // 스크랩 인재 목록 조회
  const loadScrapTalents = async () => {
    try {
      // 스크랩 인재 목록 조회 API 호출
      const response = await fetchScrapTalents({
        page: currentPage,
        size: 10,
        keyword: searchKeyword,
      });

      setScrapTalents(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("스크랩 인재 목록 조회 실패:", err);
    }
  };
  // 포지션 제안 인재 목록 조회
  const loadProposalTalents = async () => {
    // 포지션 제안 인재 목록 현황 조회 API 호출
    try {
      const statusResponse = await fetchProposalTalentStatus();
      setStatusCounts(statusResponse.counts);
    } catch (err) {
      console.error("포지션 제안 인재 목록 현황 조회 실패:", err);
      setStatusCounts({
        accept: 0,
        reject: 0,
        none: 0,
      });
    }

    // 포지션 제안 인재 목록 조회 API 호출
    try {
      const response = await fetchPositionProposals({
        page: currentPage,
        size: 10,
        status: filter === "전체" ? "" : filter,
        keyword: searchKeyword,
      });

      setTalents(response.content);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalElements);
    } catch (err) {
      console.error("포지션 제안 인재 목록 조회 실패:", err);
    }
  };

  // 검색 핸들러
  const handleSearch = () => {
    setCurrentPage(1);
    loadProposalTalents();
    loadLatestTalents();
    loadScrapTalents();
  };

  // 필터 변경 핸들러
  const handleFilterChange = (status: string) => {
    setFilter(status);
    setCurrentPage(1);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 체크박스 전체 선택/해제 핸들러
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAll(checked);

    if (checked) {
      // 모든 인재 ID 선택
      setSelectedTalents(talents.map((talent) => talent.id));
    } else {
      // 선택 해제
      setSelectedTalents([]);
    }
  };

  // 개별 체크박스 선택/해제 핸들러
  const handleSelectTalent = (
    e: React.ChangeEvent<HTMLInputElement>,
    talentId: number
  ) => {
    const checked = e.target.checked;

    if (checked) {
      // 선택한 인재 ID 추가
      setSelectedTalents((prev) => [...prev, talentId]);
    } else {
      // 선택 해제
      setSelectedTalents((prev) => prev.filter((id) => id !== talentId));
    }
  };

  // 선택 삭제 핸들러
  const handleDelete = async (id: number) => {
    if (selectedTalents.length === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }

    if (window.confirm("선택한 항목을 삭제하시겠습니까?")) {
      try {
        // 포지션 제안 인재 삭제 API 호출
        await deletePositionProposals(selectedTalents);

        // 성공 시 UI 업데이트
        setTalents((prev) =>
          prev.filter((talent) => !selectedTalents.includes(talent.id))
        );
        setSelectedTalents([]);
        setSelectAll(false);

        // 목록 새로고침
        loadProposalTalents();
      } catch (err) {
        console.error("포지션 제안 인재 삭제 실패:", err);
        alert("삭제에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 면접 상태 변경 핸들러
  const handleInterviewStatusChange = async (
    talentId: number,
    status: string
  ) => {
    try {
      // 면접 상태 변경 API 호출
      await updateInterviewStatus(talentId, status);

      // 성공 시 목록 업데이트
      setTalents((prev) =>
        prev.map((talent) =>
          talent.id === talentId
            ? { ...talent, interviewStatus: status }
            : talent
        )
      );
    } catch (err) {
      console.error("면접 상태 변경 실패:", err);
      alert("면접 상태 변경에 실패했습니다. 다시 시도해주세요.");
    }
  };
  const handleDeleteSingle = async (talentId: number) => {
    if (!window.confirm("해당 인재를 삭제하시겠습니까?")) return;

    try {
      await deletePositionProposals([talentId]);

      // UI 에서도 바로 제거
      setTalents((prev) => prev.filter((t) => t.id !== talentId));
      setTotalCount((prev) => prev - 1);
    } catch (err) {
      console.error("인재 삭제 실패:", err);
      alert("삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };
  const loadTalents = async () => {
    if (selectedTab === "포지션 제안") {
      // 1) 현황 + 제안 인재 목록
      const { counts } = await fetchProposalTalentStatus();
      setStatusCounts(counts);

      const res = await fetchPositionProposals({
        page: currentPage,
        size: 10,
        status: filter === "전체" ? "" : filter,
        keyword: searchKeyword,
      });
      setTalents(res.content);
      setTotalCount(res.totalElements);
      setTotalPages(res.totalPages);
    } else if (selectedTab === "스크랩 인재") {
      // 2) 스크랩 인재 목록
      const res = await fetchScrapTalents({
        page: currentPage,
        size: 10,
        keyword: searchKeyword,
      });
      setScrapTalents(res.content);
      setTotalCount(res.totalElements);
      setTotalPages(res.totalPages);
    } else {
      // 3) 최근 본 인재 목록
      const res = await fetchLatestTalents({
        page: currentPage,
        size: 10,
      });
      setLatestTalents(res.content);
      setTotalCount(res.totalElements);
      setTotalPages(res.totalPages);
    }

    // 공통 선택 초기화
    setSelectedTalents([]);
    setSelectAll(false);
  };
  useEffect(() => {
    loadTalents();
  }, [selectedTab, currentPage, filter]);
  const handleToggleScrap = async (talentId: number, isScraped: boolean) => {
    try {
      if (isScraped) {
        // 스크랩 삭제 API 호출
        await removeTalentScrap(talentId);
      } else {
        // 스크랩 추가 API 호출
        await addTalentScrap(talentId);
      }

      // 성공 시 목록 업데이트
      setTalents((prev) =>
        prev.map((talent) =>
          talent.id === talentId ? { ...talent, isScraped: !isScraped } : talent
        )
      );
    } catch (err) {
      console.error("스크랩 토글 실패:", err);
      alert("스크랩 처리에 실패했습니다. 다시 시도해주세요.");
    }
  };
  const [isScrapModalOpen, setIsScrapModalOpen] = useState<boolean>(false);
  const [scrapTalentId, setScrapTalentId] = useState<number | null>(null);
  const openScrapModal = (talentId: number, isScraped: boolean) => {
    if (isScraped) {
      // 이미 스크랩된 경우 바로 스크랩 취소
      handleToggleScrap(talentId, isScraped);
    } else {
      // 스크랩되지 않은 경우 모달 표시
      setScrapTalentId(talentId);
      setIsScrapModalOpen(true);
    }
  };
  const closeScrapModal = () => {
    setScrapTalentId(null);
    setIsScrapModalOpen(false);
  };

  // 삭제핸들러들
  const handleScrapDelete = async () => {
    if (selectedTalents.length === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }

    if (window.confirm("선택한 항목을 삭제하시겠습니까?")) {
      try {
        // 스크랩 인재 삭제 API 호출
        await deleteScrapTalents(selectedTalents);

        // 성공 시 UI 업데이트
        setTalents((prev) =>
          prev.filter((talent) => !selectedTalents.includes(talent.id))
        );
        setSelectedTalents([]);
        setSelectAll(false);

        // 목록 새로고침
        loadScrapTalents();
      } catch (err) {
        console.error("스크랩 인재 삭제 실패:", err);
        alert("삭제에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };
  const handleDeleteSingleScrap = async (scrapId: number) => {
    if (!window.confirm("해당 스크랩을 삭제하시겠습니까?")) return;
    await deleteScrapTalents([scrapId]);
    setScrapTalents((prev) => prev.filter((s) => s.id !== scrapId));
    setTotalCount((c) => c - 1);
  };

  return (
    <div className="TalentManagement_container">
      <MetaTagHelmet title="인재관리" description="인재관리" />
      <MobileMainHeader />
      <h3 className="siteH3Label">인재관리</h3>
      <section className="paddingSection">
        <div className="btns">
          {["포지션 제안", "스크랩 인재", "최근 본 인재"].map((tab) => (
            <button
              key={tab}
              className={selectedTab === tab ? "selected" : ""}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 선택된 탭에 따라 UI 변경 */}
        <div className="content">
          {selectedTab === "포지션 제안" && (
            <div className="contentSection mt-50">
              <p className="sectionHeader">포지션 제안 인재</p>
              <div className="board mt-15">
                <div className="row">
                  <p>{totalCount}</p>
                  <p>전체</p>
                </div>{" "}
                <div className="row">
                  <p>{statusCounts.accept}</p>
                  <p>수락</p>
                </div>{" "}
                <div className="row">
                  <p>{statusCounts.reject}</p>
                  <p>거절</p>
                </div>{" "}
                <div className="row border-none">
                  <p>{statusCounts.none}</p>
                  <p>미응답</p>
                </div>
              </div>
              <div className="input_default mt-20 mb-20 w-full">
                <input
                  placeholder="이름,학교,재직회사"
                  className="w-full"
                  type="search"
                  id="s_keyword"
                  name="s_keyword"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />
                <img src="/img/mobile/searchGlass.svg" />
              </div>
              <ul
                className="lists"
                // style={{
                //   width: "100%",
                //   padding: "0 16px",
                //   boxSizing: "border-box",
                // }}
              >
                {talents.length === 0 ? (
                  <div>검색 결과가 없습니다.</div>
                ) : (
                  <>
                    {talents.map((talent) => (
                      <li key={talent.id}>
                        <div className="state">
                          <p className="procLabel">{talent.responseStatus}</p>
                          <p className="dateLabel">
                            {talent.proposalDate}
                            <span className="bar"></span>
                            {talent.manager}
                          </p>
                          <button
                            className="trashBtn"
                            onClick={() => handleDeleteSingle(talent.id)}
                          >
                            <img src="/img/mobile/trash.svg" />
                          </button>
                        </div>
                        <div className="mb-20">
                          <div className="userinfo">
                            <p
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <strong>{talent.name}</strong>(
                              {formatGender(talent.gender)},{" "}
                              {isNaN(talent.age)
                                ? talent.age
                                : `${talent.age}세`}
                              )<span className="bar"></span>{" "}
                              <strong className="blueLabel">
                                경력 {talent.career.years}년{" "}
                                {talent.career.months}개월
                              </strong>
                            </p>
                          </div>
                          <div className="conpanyinfo">
                            <strong>{talent.career.company}&nbsp;</strong>근무
                          </div>
                        </div>
                        <div className="btns2 w-full">
                          <button
                            onClick={() => {
                              navigate(
                                `/m/corpmem/newResumeDetail/${talent.resumeid}`
                              );
                            }}
                            style={{ width: "50%", padding: "0" }}
                          >
                            이력서 보기
                          </button>
                          <select
                            style={{ width: "100%" }}
                            name="Interview_div"
                            className="nice-select"
                            value={talent.interviewStatus}
                            onChange={(e) =>
                              handleInterviewStatusChange(
                                talent.id,
                                e.target.value
                              )
                            }
                          >
                            <option value="면접 대기">면접 대기</option>
                            <option value="면접 제안">면접 제안</option>
                            <option value="면접 진행중">면접 진행중</option>
                            <option value="면접 완료">면접 완료</option>
                            <option value="면접 거절">면접 거절</option>
                          </select>
                        </div>
                      </li>
                    ))}
                  </>
                )}

                {/* <li>
                  <div>
                    <p className="procLabel">미응답</p>
                    <p className="dateLabel">2025.10.10 | 김남길 담당자</p>
                    <img src="/img/mobile/trash.svg" />
                  </div>
                  <div className="mb-10">
                    <div>
                      <p>
                        <strong>홍길동</strong>(남,만 30세) |{" "}
                        <strong className="blueLabel">경력 2년 8개월</strong>
                      </p>
                    </div>
                    <div>
                      <strong>근무했던 회사명&nbsp;</strong>근무
                    </div>
                  </div>
                  <div className="hideLabelCont">
                    <p className="hideLabel">
                      사용자에 의해 비공개된 이력서입니다.
                    </p>
                  </div>
                </li> */}
              </ul>
              <PostingPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
          {selectedTab === "스크랩 인재" && (
            <div className="contentSection mt-50">
              <p className="sectionHeader">스크랩 인재</p>

              <div className="input_default mt-20 mb-20">
                <input
                  placeholder="이름,학교,재직회사"
                  className="w-full"
                  type="search"
                  id="s_keyword"
                  name="s_keyword"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <img src="/img/mobile/searchGlass.svg" />
              </div>
              <ul className="lists">
                {scrapTalents.length === 0 ? (
                  <div>검색 결과가 없습니다.</div>
                ) : (
                  <>
                    {scrapTalents.map((talent) => (
                      <li key={talent.id}>
                        <div className="state">
                          {/* <p className="procLabel">{talent.interviewStatus}</p> */}
                          <p className="dateLabel">
                            {/* {talent.proposalDate} | {talent.manager} */}
                            {formatDate(
                              new Date(talent.scrapDate),
                              "yyyy.MM.DD"
                            )}
                          </p>
                          <button
                            className="trashBtn"
                            onClick={() => handleDeleteSingleScrap(talent.id)}
                          >
                            <img src="/img/mobile/trash.svg" />
                          </button>
                        </div>
                        <div className="mb-20">
                          <div className="userinfo">
                            <p
                              style={{
                                display: "flex",
                                gap: "5px",
                                alignItems: "center",
                              }}
                            >
                              <strong>{talent.name}</strong>(
                              {formatGender(talent.gender)},{" "}
                              {isNaN(talent.age)
                                ? talent.age
                                : `${talent.age}세`}
                              )<span className="bar"></span>{" "}
                              <strong className="blueLabel">
                                경력 {talent.career.years}년{" "}
                                {talent.career.months}개월
                              </strong>
                            </p>
                          </div>
                          <div>
                            <strong>{talent.career.company}&nbsp;</strong>근무
                          </div>
                        </div>
                        <div className="btns2 w-full">
                          {talent.isPublic ? (
                            <button
                              className="w-full"
                              style={{ width: "100%" }}
                              onClick={() => {
                                navigate(
                                  `/m/company/memberProfileView/${talent.id}`
                                );
                              }}
                            >
                              이력서 보기
                            </button>
                          ) : (
                            <p className="txt4" style={{ color: "red" }}>
                              사용자에 의해 비공개된 이력서입니다.
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </>
                )}

                {/* <li>
                  <div>
                    <p className="procLabel">미응답</p>
                    <p className="dateLabel">2025.10.10 | 김남길 담당자</p>
                    <img src="/img/mobile/trash.svg" />
                  </div>
                  <div className="mb-10">
                    <div>
                      <p>
                        <strong>홍길동</strong>(남,만 30세) |{" "}
                        <strong className="blueLabel">경력 2년 8개월</strong>
                      </p>
                    </div>
                    <div>
                      <strong>근무했던 회사명&nbsp;</strong>근무
                    </div>
                  </div>
                  <div className="hideLabelCont">
                    <p className="hideLabel">
                      사용자에 의해 비공개된 이력서입니다.
                    </p>
                  </div>
                </li> */}
              </ul>
              <PostingPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
          {selectedTab === "최근 본 인재" && (
            <div className="contentSection mt-50" style={{ maxWidth: "400px" }}>
              <p
                className="sectionHeader"
                style={{ marginRight: "auto", marginBottom: "10px" }}
              >
                최근 본 인재
              </p>

              <ul className="lists">
                {latestTalents.length === 0 ? (
                  <div>검색 결과가 없습니다.</div>
                ) : (
                  <>
                    {latestTalents.map((talent) => (
                      <li key={talent.id}>
                        <div className="state">
                          {/* <p className="procLabel">{talent.interviewStatus}</p> */}
                          <p className="dateLabel">
                            {formatDate(
                              new Date(talent.viewDate),
                              "yyyy.MM.DD"
                            )}
                          </p>
                          {/* <button
                            className="trashBtn"
                            onClick={() => handleDeleteSingle(talent.id)}
                          >
                            <img src="/img/mobile/trash.svg" />
                          </button> */}
                        </div>
                        <div className="mb-20">
                          <div className="userinfo">
                            <p
                              style={{
                                display: "flex",
                                gap: "5px",
                                alignItems: "center",
                              }}
                            >
                              <strong>{talent.name}</strong>(
                              {formatGender(talent.gender)},{" "}
                              {isNaN(talent.age)
                                ? talent.age
                                : `${talent.age}세`}
                              )<span className="bar"></span>{" "}
                              <strong className="blueLabel">
                                경력 {talent.career.years}년{" "}
                                {talent.career.months}개월
                              </strong>
                            </p>
                          </div>
                          <div className="conpanyinfo">
                            <strong>{talent.career.company}&nbsp;</strong>근무
                          </div>
                        </div>
                        <div className="btns2 w-full">
                          {!talent.isPublic ? (
                            <button
                              onClick={() => {
                                navigate(
                                  `/m/company/memberProfileView/${talent.id}`
                                );
                              }}
                            >
                              이력서 보기
                            </button>
                          ) : (
                            <p style={{ color: "red" }}>
                              사용자에 의해 비공개된 이력서입니다.
                            </p>
                          )}
                          {talent.isPublic && (
                            <button
                              className="flexGap10"
                              onClick={() =>
                                openScrapModal(talent.id, talent.isScraped)
                              }
                            >
                              {talent.isScraped ? "스크랩 취소" : "스크랩"}
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </>
                )}
              </ul>
              <PostingPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </section>

      <MainFooter />
      {isScrapModalOpen && scrapTalentId && (
        <TalentScrapModal
          userId={scrapTalentId}
          isOpen={isScrapModalOpen}
          onClose={closeScrapModal}
          onConfirm={() => handleToggleScrap(scrapTalentId, false)}
        />
      )}
    </div>
  );
}

// 예제 컴포넌트 (실제 데이터에 맞게 수정 가능)
