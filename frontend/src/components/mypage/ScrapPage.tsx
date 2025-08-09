import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import "../../../public/css/mypage.css";
import PostingPagination from "../common/PostingPagination";
import {
  formatDate,
  isApplyAvailable,
  isPreviousDate,
} from "../../utils/dateUtils";
import ApplyModal from "../jobpost/ApplyModal";
import { JobResponse } from "../../app/dummy/jobPost";
import { useAlert } from "../../contexts/AlertContext";
import { jobpostApi } from "../../api/jobpost";
import { fetchJobpostData, JobpostDataItem } from "../../api/jobpostData";
import { mapCodesToLabels } from "../../services/mapCodesToLabels";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const ScrapPage: React.FC = () => {
  // 맵핑용
  // 지역 (국내+해외)
  const [locationData, setLocationData] = useState<JobpostDataItem[]>([]);
  const [jobTypeData, setJobTypeData] = useState<JobpostDataItem[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const jobTypeData = await fetchJobpostData("00000009");
      // 지역데이터
      const domestic = await fetchJobpostData("00000012");
      const overseas = await fetchJobpostData("00000013");
      const combined = [...domestic, ...overseas];
      //

      setJobTypeData(jobTypeData);

      setLocationData(combined);
    };

    fetchData();
  }, []);
  //
  const { customAlert, customConfirm } = useAlert();
  const [jobPosts, setJobPosts] = useState<JobResponse[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{
    jobId: number;
    companyName: string;
    position: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    fetchJobList(currentPage);
  }, [currentPage]);

  const fetchJobList = (page: number) => {
    jobpostApi
      .getScraps({
        page: page,
        size: 10,
        searchType: "title",
        query: "",
      })
      .then((response) => {
        setJobPosts(response.content || []);
        setTotalPages(response.totalPages || 1);
        setTotalElements(response.totalElements || 0);
      })
      .catch((error) => {
        console.error("Error fetching job list:", error);
      });

    // setJobPosts(getDummyJobposts().content);
    // setTotalPages(getDummyJobposts().totalPages);
    // setTotalElements(getDummyJobposts().totalElements);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedJobIds(jobPosts.map((jobPost) => jobPost.jobId));
    } else {
      setSelectedJobIds([]);
    }
  };

  const handleSelect = (jobId: number) => {
    setSelectedJobIds((prev) => {
      if (prev.includes(jobId)) {
        return prev.filter((id) => id !== jobId);
      } else {
        return [...prev, jobId];
      }
    });
  };

  const handleDelete = async () => {
    if (selectedJobIds.length === 0) {
      customAlert({
        content: "삭제할 항목을 선택해주세요.",
      });
      return;
    }

    if (
      await customConfirm({
        content: "선택한 스크랩을 삭제하시겠습니까?",
        confirmLabel: "삭제",
        cancelLabel: "취소",
      })
    ) {
      try {
        await jobpostApi.deleteScraps(selectedJobIds);
        customAlert({
          content: "선택한 스크랩이 삭제되었습니다.",
        });
        fetchJobList(currentPage);
        setSelectedJobIds([]);
      } catch (error) {
        console.error("스크랩 삭제 실패:", error);
      }
    }
  };
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");
  const handleApply = (scrap: JobResponse) => {
    if (scrap.url) {
      customAlert({
        content: "홈페이지로 이동합니다.",
        onConfirm() {
          window.open(scrap.url, "_blank");
        },
      });

      //onClick={() => window.open(jPost.url, "_blank")}
    } else {
      setSelectedJob({
        jobId: scrap.jobId,
        companyName: scrap.companyName,
        position: scrap.jobType,
        title: scrap.title,
      });
      setShowApplyModal(true);
    }
  };
  const mappingLocation = (location: string): string[] => {
    if (!location) return [];

    // 1) "123456,231425" → ["123456","231425"]
    const ids = location.split(",").map((id) => id.trim());

    // 2) 각 id에 대응하는 level1 찾기 (없으면 id 그대로)
    const names = ids.map((id) => {
      const found = locationData.find((item) => item.operationDataId === id);
      return found?.level1 ?? id;
    });

    return names;
  };
  const mappingLocationString = (location: string): string =>
    mappingLocation(location).join(", ");
  const [jobTypeLabelData, setJobTypeLabelData] = useState<JobpostDataItem[]>(
    []
  );
  useEffect(() => {
    const fetchData = async () => {
      const jobTypeData = await fetchJobpostData("00000010");
      setJobTypeLabelData(jobTypeData);
    };
    fetchData();
  }, []);
  return (
    <Layout>
      <MetaTagHelmet title="스크랩" description="스크랩" />
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
                    <Link to="/mypage/apply" className="menu_font01">
                      지원현황
                    </Link>
                  </li>
                  <li>
                    <Link to="/mypage/scrap" className="menu_font01 active">
                      스크랩
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="flex-col">
                <div className="pageTitle">
                  <div className="conTitle">
                    <div className="titDetailSch">스크랩</div>
                    <div className="subtit">
                      <span>총 {totalElements}건</span>
                    </div>
                  </div>
                </div>

                <div className="bbstable table-list">
                  <table>
                    <colgroup>
                      <col style={{ width: "6%" }} />
                      <col style={{ width: "8%" }} />
                      <col />
                      <col style={{ width: "14%" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={
                              selectedJobIds.length === jobPosts.length &&
                              jobPosts.length > 0
                            }
                            onChange={handleSelectAll}
                            className="check_box"
                          />
                        </th>
                        <th>스크랩일</th>
                        <th>채용공고</th>
                        <th>지원하기</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobPosts.length === 0 && (
                        <tr>
                          <td colSpan={4} className="cell-default">
                            스크랩한 채용공고가 없습니다.
                          </td>
                        </tr>
                      )}
                      {jobPosts.map((jobPost) => (
                        <tr key={jobPost.jobId}>
                          <td className="cell-default">
                            <input
                              type="checkbox"
                              checked={selectedJobIds.includes(jobPost.jobId)}
                              onChange={() => handleSelect(jobPost.jobId)}
                              className="check_box"
                            />
                          </td>
                          <td className="cell-default">
                            {formatDate(
                              new Date(jobPost.createdAt),
                              "YY.MM.DD"
                            )}
                          </td>
                          <td className="cell-company">
                            <div className="flex-col scrap">
                              <div className="cname">{jobPost.companyName}</div>
                              <div className="info_txt ellipsis2">
                                <Link to={`/jobs/${jobPost.jobId}`}>
                                  {jobPost.title}
                                </Link>
                              </div>
                              <div className="text-container">
                                <div className="cell">경력무관</div>
                                <div className="cell">고졸↑</div>
                                <div className="cell">
                                  {mappingLocationString(jobPost.location)}
                                </div>
                                <div className="cell">
                                  {}
                                  {mapCodesToLabels(
                                    jobPost.jobType.split(","),
                                    jobTypeData
                                  ).join(", ")}
                                </div>
                              </div>
                              <div className="dsc">{jobPost.description}</div>
                            </div>
                          </td>
                          <td className="cell-default">
                            <div className="ListBtnBox">
                              {!isApplyAvailable(jobPost.endDate) ? (
                                <>
                                  {jobPost.url ? (
                                    <div className="btn_odd">
                                      <button
                                        type="button"
                                        className="h_btn"
                                        onClick={() => {
                                          if (!userId) {
                                            alert("로그인 후 지원해주세요.");
                                            navigate("/member/join");
                                          } else {
                                            window.open(jobPost.url, "_blank");
                                          }
                                        }}
                                        style={{
                                          background: "#545454",
                                          color: "white",
                                          width: "125px",
                                        }}
                                      >
                                        홈페이지 지원
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="btn_odd">
                                      <button
                                        style={{
                                          background: jobPost.isApplied
                                            ? "#eaeaea"
                                            : "#2e7fdb",
                                          color: "white",
                                          width: "125px",
                                          cursor: jobPost.isApplied
                                            ? "default"
                                            : "pointer",
                                        }}
                                        type="button"
                                        className="d_btn"
                                        onClick={() => handleApply(jobPost)}
                                        disabled={jobPost.isApplied}
                                      >
                                        즉시 지원
                                      </button>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div
                                  style={{
                                    width: "150px",
                                    height: "50px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    color: "#a8a8a8",
                                  }}
                                >
                                  채용마감
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="scrapBtn">
                  <button
                    type="button"
                    className="scrapDelBtn"
                    onClick={handleDelete}
                  >
                    삭제
                  </button>
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

      {showApplyModal && selectedJob && (
        <ApplyModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          jobId={selectedJob.jobId}
          companyName={selectedJob.companyName}
          jobTitle={selectedJob.title}
        />
      )}
    </Layout>
  );
};

export default ScrapPage;
