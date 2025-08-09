import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CorpLayout from "../layout/CorpLayout";
import "../../../public/css/corpmypage.css";
import { getDdayString } from "../../utils/dateUtils";
import { axiosInstance } from "../../api/axios";
import { JobPostForm } from "./Jobpost";
import { fetchJobpostData, JobpostDataItem } from "../../api/jobpostData";
import CompanyLogo from "../common/CompanyLogo";
import { MetaTagHelmet } from "../common/MetaTagHelmet";
const JobDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [jobDetailProps, setJobDetailProps] = useState<JobPostForm>(
    {} as JobPostForm
  );
  const [languageData, setLanguageData] = useState<JobpostDataItem[]>([]);
  useEffect(() => {
    // 채용공고 상세 정보 조회
    const fetchJobDetail = async () => {
      try {
        const response = await axiosInstance.get(`/api/v1/jobs/${id}`);
        setJobDetailProps(response.data);
      } catch (error) {
        navigate("/notfound");
        console.error("Error fetching job detail:", error);
      }
    };

    fetchJobDetail();
  }, [id]);
  useEffect(() => {
    const fetchData = async () => {
      const languageData = await fetchJobpostData("00000017");
      setLanguageData(languageData);
    };
    fetchData();
  }, []);
  const mapCodesToLabels = (
    codes: string[] = [],
    list: JobpostDataItem[],
    // 어떤 필드를 레이블로 쓸지 선택 (기본은 level1)
    getLabel: (item: JobpostDataItem) => string = (item) => item.level1 ?? ""
  ): string[] => {
    return codes.map((code) => {
      const found = list.find((item) => item.operationDataId === code);
      return found ? getLabel(found) : code;
    });
  };
  return (
    <CorpLayout>
      <MetaTagHelmet
        title="채용공고 상세"
        description="채용공고 상세"
        ogTitle={jobDetailProps?.title || ""}
        ogDescription={jobDetailProps?.content || ""}
      />

      <div className="container-center-horizontal">
        <div className="jobpost screen">
          <div className="container">
            {/* detail */}
            <div className="flex-con item_column item_center">
              {/* detail top */}
              <div className="jobdetail">
                <div className="logo_area">
                  <div className="urjob">
                    <CompanyLogo logoUrl={jobDetailProps?.logo_url} />
                  </div>
                </div>
                <div className="detail_con">
                  <p className="stxt">{jobDetailProps?.companyInfo?.name}</p>
                  <p className="htxt">{jobDetailProps?.title}</p>
                  <div className="detail-group">
                    <div className="decol">
                      {jobDetailProps?.career?.type && (
                        <dl>
                          <dt className="colw2 text-nowrap">경력</dt>
                          <dd>{jobDetailProps?.career?.type}</dd>
                        </dl>
                      )}
                      {jobDetailProps?.qualification?.education?.level && (
                        <dl>
                          <dt className="colw2 text-nowrap">학력</dt>
                          <dd>
                            {jobDetailProps?.qualification?.education?.level}
                          </dd>
                        </dl>
                      )}
                      {jobDetailProps?.qualification?.preferences?.language &&
                        jobDetailProps?.qualification?.preferences?.language
                          .length > 0 && (
                          <dl>
                            <dt className="colw2 text-nowrap">외국어</dt>
                            <dd>
                              {mapCodesToLabels(
                                jobDetailProps.qualification.preferences
                                  .language,
                                languageData,
                                (item) =>
                                  item.level1 ||
                                  item.level2 ||
                                  item.level3 ||
                                  ""
                              ).join(", ")}
                            </dd>
                          </dl>
                        )}
                    </div>
                    <div className="decol">
                      <dl>
                        <dt className="colw3 text-nowrap">근무형태</dt>
                        <dd>{jobDetailProps?.jobType}</dd>
                      </dl>
                      <dl>
                        <dt className="colw3 text-nowrap">근무지역</dt>
                        <dd>
                          {jobDetailProps?.workConditions?.location?.address}
                        </dd>
                      </dl>
                      <dl>
                        <dt className="colw3 text-nowrap">근무요일</dt>
                        <dd>
                          {jobDetailProps?.workConditions?.workingDay?.type}
                        </dd>
                      </dl>
                      <dl>
                        <dt className="colw3 text-nowrap">급여</dt>
                        <dd>{jobDetailProps?.workConditions?.salary?.type}</dd>
                      </dl>
                    </div>
                    <div className="decol colw4">
                      <dl>
                        <dt className="colw2 text-nowrap">시작일</dt>
                        <dd style={{ whiteSpace: "nowrap" }}>
                          {(() => {
                            const dt =
                              jobDetailProps?.applicationPeriod?.start?.date ||
                              "";
                            const [date, time] = dt.split(" ");
                            return (
                              <>
                                <span style={{ color: "#767676" }}>{date}</span>{" "}
                                {time && (
                                  <span style={{ color: "#ACACAC" }}>
                                    {time}
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </dd>
                      </dl>
                      <dl>
                        <dt className="colw2 text-nowrap">마감일</dt>
                        <dd style={{ whiteSpace: "nowrap" }}>
                          {(() => {
                            const dt =
                              jobDetailProps?.applicationPeriod?.end?.date ||
                              "";
                            const [date, time] = dt.split(" ");
                            return (
                              <>
                                <span style={{ color: "#767676" }}>{date}</span>{" "}
                                {time && (
                                  <span style={{ color: "#ACACAC" }}>
                                    {time}
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </dd>
                      </dl>
                    </div>
                    <div className="decol colw1">
                      <div className="dday">
                        {getDdayString(
                          jobDetailProps?.applicationPeriod?.end?.date
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* detail top end */}

              {/* <div className="detailBtn">
                <button type="button" className="h_btn" onClick={() => window.open(jobDetailProps?.applicationMethod?.homepage)}>홈페이지 지원</button>
                <button type="button" className="s_btn" onClick={openScrapModal}><i className={isScraped ? "fa-solid fa-star scraped" : "fa-regular fa-star"}></i> 스크랩</button>
              </div> */}

              {/* 모집요강 */}
              <div
                className="detail_content item_column"
                dangerouslySetInnerHTML={{ __html: jobDetailProps?.content }}
              ></div>
              {/* 모집요강 end */}

              {/* <div className="detailBtn">
                <button type="button" className="h_btn" onClick={() => window.open(jobDetailProps?.applicationMethod?.homepage)}>홈페이지 지원</button>
                <button type="button" className="s_btn" onClick={openScrapModal}><i className={isScraped ? "fa-solid fa-star scraped" : "fa-regular fa-star"}></i> 스크랩</button>
              </div> */}
            </div>
            {/* detail end */}
          </div>
        </div>
      </div>
    </CorpLayout>
  );
};

export default JobDetail;
