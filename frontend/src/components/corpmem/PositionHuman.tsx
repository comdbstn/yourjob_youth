import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CorpLayout from "../layout/CorpLayout";
import "../../../public/css/corpmypage.css";
import "../../../public/css/nice-select.css";
import "./TalentManage.css";
import {
  fetchPositionProposals,
  updateInterviewStatus,
  deletePositionProposals,
  fetchProposalTalentStatus,
} from "../../api/talentApi";
import { ProposalTalent } from "../../types/talent";
import PostingPagination from "../common/PostingPagination";
import { formatGender } from "../../utils/formatUtils";
import { formatDate } from "../../utils/dateUtils";
import { useAlert } from "../../contexts/AlertContext";
import {
  OfferStatus,
  OfferStatusText,
  SchoolType,
  SchoolTypeText,
} from "../../app/dummy/options";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const PositionHuman: React.FC = () => {
  const { customAlert, customConfirm } = useAlert();
  const [talents, setTalents] = useState<ProposalTalent[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [filter, setFilter] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedTalents, setSelectedTalents] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [statusCounts, setStatusCounts] = useState({
    accept: 0,
    reject: 0,
    none: 0,
  });

  // 데이터 로딩
  useEffect(() => {
    loadProposalTalents();
  }, [currentPage, filter]);

  // 포지션 제안 인재 목록 조회
  const loadProposalTalents = async () => {
    // 포지션 제안 인재 목록 현황 조회 API 호출
    try {
      const statusResponse = await fetchProposalTalentStatus();
      setStatusCounts(statusResponse.counts);
      setTotalCount(
        statusResponse.counts.accept +
          statusResponse.counts.reject +
          statusResponse.counts.none
      );
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
      //setTotalCount(response.totalElements);
    } catch (err) {
      console.error("포지션 제안 인재 목록 조회 실패:", err);
    }
  };

  // 검색 핸들러
  const handleSearch = () => {
    setCurrentPage(1);
    loadProposalTalents();
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
  const handleDelete = async () => {
    if (selectedTalents.length === 0) {
      customAlert({
        content: "삭제할 항목을 선택해주세요.",
      });
      return;
    }

    if (
      await customConfirm({
        content: "선택한 항목을 삭제하시겠습니까?",
        confirmLabel: "확인",
        cancelLabel: "취소",
      })
    ) {
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
        customAlert({
          content: "삭제에 실패했습니다. 다시 시도해주세요.",
        });
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
      customAlert({
        content: "면접 상태 변경에 실패했습니다. 다시 시도해주세요.",
      });
    }
  };

  return (
    <CorpLayout>
      <MetaTagHelmet title="포지션 제안 인재" description="포지션 제안 인재" />
      <div className="container-center-horizontal">
        <div className="crop-wrap screen">
          <div className="talent-manage-container container">
            <div className="talent-tab mb50">
              <Link to="/corpmem/positionhuman" className="tab_btn active">
                포지션 제안 인재
              </Link>
              <Link to="/corpmem/scraphuman" className="tab_btn">
                스크랩 인재
              </Link>
              <Link to="/corpmem/latesthuman" className="tab_btn">
                최근 본 인재
              </Link>
            </div>

            {/* 타이틀 */}
            <div className="head_txt">포지션 제안 인재</div>
            {/* 타이틀 end*/}

            {/* tabBox */}
            <div className="tabBox mb30">
              <div className="tabMenu">
                <button
                  type="button"
                  className={filter === "all" ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    handleFilterChange("all");
                  }}
                >
                  전체 {totalCount}
                </button>
                <button
                  type="button"
                  className={filter === "accept" ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    handleFilterChange("accept");
                  }}
                >
                  수락 {statusCounts.accept}
                </button>
                <button
                  type="button"
                  className={filter === "reject" ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    handleFilterChange("reject");
                  }}
                >
                  거절 {statusCounts.reject}
                </button>
                <button
                  type="button"
                  className={filter === "none" ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    handleFilterChange("none");
                  }}
                >
                  미응답 {statusCounts.none}
                </button>
              </div>

              <div className="search_box">
                <input
                  type="search"
                  id="s_keyword"
                  name="s_keyword"
                  className="form-control search_form"
                  placeholder="이름, 학교, 재직회사"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
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
            {/* tabBox end */}

            <div className="list_table">
              <ul className="list_thead">
                <li className="w07 text-center">
                  <input
                    type="checkbox"
                    id="chk-all"
                    name="chk-all"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                  <label htmlFor="chk-all"></label>
                </li>
                <li className="w02">이름/나이</li>
                <li className="w03">경력</li>
                <li className="w03">최종학력</li>
                <li className="w04">담당자/제안일</li>
                <li className="w08"></li>
                <li className="w04 text-center">제안답변상태</li>
                <li className="w04 text-center">발표</li>
              </ul>

              {talents.length === 0 ? (
                <ul className="list_tbody">
                  <li>검색 결과가 없습니다.</li>
                </ul>
              ) : (
                talents.map((talent) => (
                  <ul className="list_tbody" key={talent.id}>
                    <li className="w07 text-center">
                      <input
                        type="checkbox"
                        id={`chk-${talent.id}`}
                        name="chk[]"
                        checked={selectedTalents.includes(talent.id)}
                        onChange={(e) => handleSelectTalent(e, talent.id)}
                      />
                      <label htmlFor={`chk-${talent.id}`}></label>
                    </li>
                    <li className="w02">
                      <p className="txt2">{talent.name}</p>
                      <p className="txt3">
                        {formatGender(talent.gender)},{" "}
                        {isNaN(talent.age) ? talent.age : `${talent.age}세`}
                      </p>
                    </li>
                    <li className="w03">
                      <p className="txt2">
                        {talent.career.years}년 {talent.career.months}개월
                      </p>
                      <p className="txt3">{talent.career.company}</p>
                    </li>
                    <li className="w03">
                      <p className="txt2">
                        {SchoolTypeText[talent.education?.degree as SchoolType]}
                      </p>
                      <p className="txt3">{talent.education?.school}</p>
                    </li>
                    <li className="w04">
                      <p className="txt2">{talent.manager}</p>
                      <p className="txt3">
                        {formatDate(new Date(talent.proposalDate), "yyyy.MM")}
                      </p>
                    </li>
                    <li className="w08 text-center">
                      <div className="infobtnGroup item-justify-center">
                        <button
                          type="button"
                          className="resuBtn"
                          onClick={() =>
                            (window.location.href = `/corpmem/newResumeDetail/${talent.resumeid}`)
                          }
                        >
                          이력서 보기
                        </button>
                      </div>
                    </li>
                    <li className="w04 text-center">
                      <p className="txt3">
                        {OfferStatusText[talent.responseStatus as OfferStatus]}
                      </p>
                    </li>
                    <li className="w04 text-center flex-row item-justify-center">
                      <select
                        name="Interview_div"
                        className="nice-select"
                        value={talent.interviewStatus}
                        onChange={(e) =>
                          handleInterviewStatusChange(talent.id, e.target.value)
                        }
                      >
                        <option value="면접 대기">면접 대기</option>
                        <option value="면접 제안">면접 제안</option>
                        <option value="면접 진행중">면접 진행중</option>
                        <option value="면접 완료">면접 완료</option>
                        <option value="면접 거절">면접 거절</option>
                      </select>
                    </li>
                  </ul>
                ))
              )}
            </div>

            <div className="listBtn-Box">
              <button type="button" className="delBtn" onClick={handleDelete}>
                삭제
              </button>
            </div>

            {/* 페이지네이션 */}
            <PostingPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
            {/* 페이지네이션 end */}
          </div>
        </div>
      </div>
    </CorpLayout>
  );
};

export default PositionHuman;
