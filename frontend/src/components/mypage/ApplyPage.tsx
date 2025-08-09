import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import "../../../public/css/mypage.css";
import { Apply, ApplyStatusText } from "../../types/apply";
import { applyApi } from "../../api/apply";
import PostingPagination from "../common/PostingPagination";
import { formatDate } from "../../utils/dateUtils";
import { downloadFiles } from "../../utils/fileUtils";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const ApplyPage: React.FC = () => {
  const [applies, setApplies] = useState<Apply[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplies();
  }, [currentPage]);

  const fetchApplies = async () => {
    try {
      const response = await applyApi.getApplies({
        page: currentPage,
        size: pageSize,
      });
      setApplies(
        response.content.map((apply) => ({
          ...apply,
          applyDate: formatDate(new Date(apply.applyDate), "YY.MM.DD"),
        }))
      );
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error("지원 목록 조회 실패:", error);
    }
  };

  const handleRowClick = (applyId: number) => {
    navigate(`/jobs/${applyId}`);
  };

  return (
    <Layout>
      <MetaTagHelmet title="지원현황" description="지원현황" />
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
                    <Link to="/mypage/proposal" className="menu_font01">
                      받은 포지션 제안
                    </Link>
                  </li>
                  <li>
                    <Link to="/mypage/apply" className="menu_font01 active">
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
                    <div className="titDetailSch">지원현황</div>
                    <div className="subtit">
                      <span>총 {totalElements}건</span>
                    </div>
                  </div>
                </div>

                <div className="bbstable table-list">
                  <table>
                    <colgroup>
                      <col style={{ width: "138px" }} />
                      <col />
                      <col style={{ width: "209px" }} />
                      <col style={{ width: "109px" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>날짜</th>
                        <th>기업명/포지션</th>
                        <th>첨부파일</th>
                        <th>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applies.length === 0 && (
                        <tr>
                          <td colSpan={4} className="cell-default">
                            지원 내역이 없습니다.
                          </td>
                        </tr>
                      )}
                      {applies.map((apply) => (
                        <tr
                          key={apply.id}
                          onClick={() => handleRowClick(apply.jobId)}
                          style={{ cursor: "pointer" }}
                        >
                          <td
                            className="cell-default"
                            style={{ height: "155px" }}
                          >
                            {apply.applyDate}
                          </td>
                          <td className="cell-company">
                            <div className="company">
                              <p>{apply.companyName}</p>
                              <p
                                className="cnm"
                                style={{
                                  marginBottom: "5px",
                                  marginTop: "10px",
                                }}
                              >
                                {apply.position}
                              </p>
                              <p className="cnm">{apply.title}</p>
                            </div>
                          </td>
                          <td className="cell-default">
                            {apply.attachments.length > 0 && (
                              <div onClick={(e) => e.stopPropagation()}>
                                <i className="fa-regular fa-file-lines"></i>{" "}
                                <a
                                  href="javascript:void(0)"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    downloadFiles(
                                      apply.attachments.map(
                                        (attachment) => attachment.fileurl || ""
                                      )
                                    );
                                  }}
                                  style={{ fontWeight: "400" }}
                                >
                                  이력서·포트폴리오 ({apply.attachments.length}
                                  개)
                                </a>
                              </div>
                            )}
                          </td>
                          <td
                            className="cell-stat"
                            style={{ fontWeight: "400" }}
                          >
                            {ApplyStatusText[apply.status]}
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
    </Layout>
  );
};

export default ApplyPage;
