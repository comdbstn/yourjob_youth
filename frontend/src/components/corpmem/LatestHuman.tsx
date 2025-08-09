import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CorpLayout from "../layout/CorpLayout";
import "../../../public/css/corpmypage.css";
import "../../../public/css/nice-select.css";
import "./TalentManage.css";
import {
  fetchLatestTalents,
  addTalentScrap,
  removeTalentScrap,
} from "../../api/talentApi";
import { LatestTalent } from "../../types/talent";
import PostingPagination from "../common/PostingPagination";
import { formatGender } from "../../utils/formatUtils";
import { formatDate } from "../../utils/dateUtils";
import { SchoolType, SchoolTypeText } from "../../app/dummy/options";
import TalentScrapModal from "./TalentScrapModal";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const LatestHuman: React.FC = () => {
  const [talents, setTalents] = useState<LatestTalent[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isScrapModalOpen, setIsScrapModalOpen] = useState<boolean>(false);
  const [scrapTalentId, setScrapTalentId] = useState<number | null>(null);

  // 데이터 로딩
  useEffect(() => {
    loadLatestTalents();
  }, [currentPage]);

  // 최근 본 인재 목록 조회
  const loadLatestTalents = async () => {
    try {
      // 최근 본 인재 목록 조회 API 호출
      const response = await fetchLatestTalents({
        page: currentPage,
        size: 10,
      });

      setTalents(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("최근 본 인재 목록 조회 실패:", err);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 스크랩 모달 열기
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

  // 스크랩 모달 닫기
  const closeScrapModal = () => {
    setScrapTalentId(null);
    setIsScrapModalOpen(false);
  };

  // 스크랩 토글 핸들러
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

  return (
    <CorpLayout>
      <MetaTagHelmet title="최근 본 인재" description="최근 본 인재" />
      <div className="container-center-horizontal">
        <div className="crop-wrap screen">
          <div className="talent-manage-container container">
            <div className="talent-tab mb50">
              <Link to="/corpmem/positionhuman" className="tab_btn">
                포지션 제안 인재
              </Link>
              <Link to="/corpmem/scraphuman" className="tab_btn">
                스크랩 인재
              </Link>
              <Link to="/corpmem/latesthuman" className="tab_btn active">
                최근 본 인재
              </Link>
            </div>

            {/* 타이틀 */}
            <div className="head_txt">최근 본 인재</div>
            {/* 타이틀 end*/}

            <div className="list_table">
              <ul className="list_thead">
                <li className="w07 text-center"></li>
                <li className="w02">이름/나이</li>
                <li className="w03">경력</li>
                <li className="w03">최종학력</li>
                <li className="w04">전공/학점</li>
                <li className="w08"></li>
                <li className="w04 text-center">열람날짜</li>
              </ul>

              {talents.length === 0 ? (
                <ul className="list_tbody">
                  <li>검색 결과가 없습니다.</li>
                </ul>
              ) : (
                talents.map((talent) => (
                  <ul className="list_tbody" key={talent.id}>
                    <li className="w07 text-center">
                      <button
                        type="button"
                        className="Inter"
                        id="Bookmark"
                        onClick={() =>
                          openScrapModal(talent.id, talent.isScraped)
                        }
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
                      <p
                        className="txt2 ellipsis"
                        style={{ textWrap: "nowrap" }}
                      >
                        {talent.education?.major}
                      </p>
                      <p className="txt3">
                        {talent.education?.gpa || 0}/
                        {talent.education?.totalCredits || 0}
                      </p>
                    </li>
                    <li className="w08 text-center">
                      {talent.isPublic ? (
                        <div className="infobtnGroup item-justify-center">
                          <button
                            type="button"
                            className="resuBtn"
                            onClick={() =>
                              (window.location.href = `/corpmem/resumedetail/${talent.id}`)
                            }
                          >
                            이력서 보기
                          </button>
                        </div>
                      ) : (
                        <p className="txt4">
                          사용자에 의해 비공개된 이력서입니다.
                        </p>
                      )}
                    </li>
                    <li className="w04 text-center">
                      <p className="txt3">
                        {formatDate(new Date(talent.viewDate), "yyyy.MM.DD")}
                      </p>
                    </li>
                  </ul>
                ))
              )}
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

      {isScrapModalOpen && scrapTalentId && (
        <TalentScrapModal
          userId={scrapTalentId}
          isOpen={isScrapModalOpen}
          onClose={closeScrapModal}
          onConfirm={() => handleToggleScrap(scrapTalentId, false)}
        />
      )}
    </CorpLayout>
  );
};

export default LatestHuman;
