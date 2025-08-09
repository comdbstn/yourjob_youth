import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CorpLayout from "../layout/CorpLayout";
import "../../../public/css/corpmypage.css";
import "../../../public/css/nice-select.css";
import "./TalentManage.css";
import { fetchScrapTalents, deleteScrapTalents } from "../../api/talentApi";
import { ScrapTalent } from "../../types/talent";
import PostingPagination from "../common/PostingPagination";
import { formatGender } from "../../utils/formatUtils";
import { formatDate } from "../../utils/dateUtils";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const ScrapHuman: React.FC = () => {
  const [talents, setTalents] = useState<ScrapTalent[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedTalents, setSelectedTalents] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);

  // 데이터 로딩
  useEffect(() => {
    loadScrapTalents();
  }, [currentPage]);

  // 스크랩 인재 목록 조회
  const loadScrapTalents = async () => {
    try {
      // 스크랩 인재 목록 조회 API 호출
      const response = await fetchScrapTalents({
        page: currentPage,
        size: 10,
        keyword: searchKeyword,
      });

      setTalents(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("스크랩 인재 목록 조회 실패:", err);
    }
  };

  // 검색 핸들러
  const handleSearch = () => {
    setCurrentPage(1);
    loadScrapTalents();
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

  return (
    <CorpLayout>
      <MetaTagHelmet title="스크랩 인재" description="스크랩 인재" />
      <div className="container-center-horizontal">
        <div className="crop-wrap screen">
          <div className="talent-manage-container container">
            <div className="talent-tab mb50">
              <Link to="/corpmem/positionhuman" className="tab_btn">
                포지션 제안 인재
              </Link>
              <Link to="/corpmem/scraphuman" className="tab_btn active">
                스크랩 인재
              </Link>
              <Link to="/corpmem/latesthuman" className="tab_btn">
                최근 본 인재
              </Link>
            </div>

            {/* 타이틀 */}
            <div className="head_txt items-end item_between">
              스크랩 인재
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
            {/* 타이틀 end*/}

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
                <li className="w04">전공/학점</li>
                <li className="w08"></li>
                <li className="w04 text-center">스크랩 일순</li>
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
                      <p className="txt2">{talent.education?.degree}</p>
                      <p className="txt3">{talent.education?.school}</p>
                    </li>
                    <li className="w04">
                      <p className="txt2">{talent.education?.major}</p>
                      <p className="txt3">{talent.education?.gpa}</p>
                    </li>
                    <li className="w08 text-center">
                      {talent.isPublic ? (
                        <div className="infobtnGroup item-justify-center">
                          <button
                            type="button"
                            className="resuBtn"
                            onClick={() =>
                              (window.location.href = `/corpmem/resumedetail/${talent.resumeId}`)
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
                        {formatDate(new Date(talent.scrapDate), "yyyy.MM.DD")}
                      </p>
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

export default ScrapHuman;
