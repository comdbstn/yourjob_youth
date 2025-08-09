import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../layout/Layout";
import "../../../public/css/jobpost.css";
import {
  formatDate,
  getDdayString,
  isPreviousDate,
} from "../../utils/dateUtils";
import ScrapModal from "./ScrapModal";
import { axiosInstance } from "../../api/axios";
import { jobpostApi } from "../../api/jobpost";
import ApplyModal from "./ApplyModal";
import { JobPostDetailResponse } from "../../types/jobPost";
import { UserType } from "../../types/user";
import { fetchJobpostData, JobpostDataItem } from "../../api/jobpostData";
import { useAlert } from "../../contexts/AlertContext";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const JobDetail: React.FC = () => {
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
  // 직무
  const [jobTypeData, setJobTypeData] = useState<JobpostDataItem[]>([]);
  // 스킬
  const [skillData, setSkillData] = useState<JobpostDataItem[]>([]);
  // 핵심역량
  const [capabilityData, setCapabilityData] = useState<JobpostDataItem[]>([]);
  // 자격증
  const [licenseData, setLicenseData] = useState<JobpostDataItem[]>([]);
  // 지역 (국내+해외)
  const [locationData, setLocationData] = useState<JobpostDataItem[]>([]);

  // 추가로 필요한 데이터들
  // 우대조건
  const [preferenceData, setPreferenceData] = useState<JobpostDataItem[]>([]);
  // 외국어
  const [languageData, setLanguageData] = useState<JobpostDataItem[]>([]);
  // 우대전공
  const [majorData, setMajorData] = useState<JobpostDataItem[]>([]);
  // 업종
  const [industryData, setIndustryData] = useState<JobpostDataItem[]>([]);

  //
  const [isBring, setIsBring] = useState<boolean>(false);

  // 데이터 fetch
  useEffect(() => {
    const fetchData = async () => {
      const jobTypeData = await fetchJobpostData("00000009");
      const skillTypeData = await fetchJobpostData("00000015");
      const capabilityData = await fetchJobpostData("00000020");
      const licenseData = await fetchJobpostData("00000018");
      // 지역데이터
      const domestic = await fetchJobpostData("00000012");
      const overseas = await fetchJobpostData("00000013");
      const combined = [...domestic, ...overseas];
      //
      const preferenceData = await fetchJobpostData("00000014");
      const languageData = await fetchJobpostData("00000017");
      const majorData = await fetchJobpostData("00000019");
      const industryData = await fetchJobpostData("00000016");
      setJobTypeData(jobTypeData);
      setSkillData(skillTypeData);
      setCapabilityData(capabilityData);
      setLicenseData(licenseData);
      setLocationData(combined);

      setPreferenceData(preferenceData);
      setLanguageData(languageData);
      setMajorData(majorData);
      setIndustryData(industryData);
    };

    fetchData();
  }, []);
  const { id } = useParams<{ id: string }>();
  const userType = sessionStorage.getItem("userType") as UserType;
  const userId = sessionStorage.getItem("userId");
  const [isScrapModalOpen, setIsScrapModalOpen] = useState(false);
  const [jobDetailProps, setJobDetailProps] = useState<JobPostDetailResponse>(
    {} as JobPostDetailResponse
  );

  useEffect(() => {
    fetchJobDetail();
  }, [id]);

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

  const openScrapModal = () => {
    if (!userId) {
      alert("로그인해 주세요.");
      navigate("/member/userlogin");
    }

    if (jobDetailProps.isScraped) {
      // 이미 스크랩된 경우 바로 스크랩 취소
      jobpostApi
        .toggleScrap(Number(id))
        .then(() => {
          fetchJobDetail();
        })
        .catch((error: Error) => {
          console.error("Error toggling scrap:", error);
        });
    } else {
      // 스크랩되지 않은 경우 모달 표시
      setIsScrapModalOpen(true);
    }
  };

  const closeScrapModal = () => {
    setIsScrapModalOpen(false);
  };
  const navigate = useNavigate();
  const handleScrap = () => {
    closeScrapModal();
    fetchJobDetail();
    navigate("/mypage/scrap");
  };
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyJobId, setApplyJobId] = useState<number | null>(null);
  const [applyCompanyName, setApplyCompanyName] = useState("");
  const [applyJobTitle, setApplyJobTitle] = useState("");
  const { customAlert } = useAlert();
  const handleApply = (
    jobId: number | undefined,
    companyName: string,
    jobTitle: string
  ) => {
    // if (!jobId) return; // jobId가 undefined / 0일 땐 아무 동작 안 함
    if (!userId) {
      customAlert({
        content: "로그인해 주세요.",
        onConfirm() {
          navigate("/member/userlogin");
        },
      });
      return;
    }

    setApplyJobId(jobId ?? 0);
    setApplyCompanyName(companyName);
    setApplyJobTitle(jobTitle);
    setIsApplyModalOpen(true);
  };
  const closeApplyModal = () => {
    setIsApplyModalOpen(false);
  };
  const mapCodesToLabels = (
    codes: string | string[] = [],
    list: JobpostDataItem[],
    getLabel: (item: JobpostDataItem) => string = (item) => item.level1 ?? ""
  ): string[] => {
    // codes가 array가 아니면 배열로 감싸준다
    const codeArray = Array.isArray(codes) ? codes : [codes];

    return codeArray.map((code) => {
      const found = list.find((item) => item.operationDataId === code);
      return found ? getLabel(found) : code;
    });
  };
  return (
    <Layout>
      <MetaTagHelmet
        title={jobDetailProps?.title || "채용공고 상세"}
        description={jobDetailProps?.content || "채용공고 상세"}
        ogTitle={jobDetailProps?.title || "채용공고 상세"}
        ogDescription={jobDetailProps?.content || "채용공고 상세"}
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
                    <img
                      style={{
                        width: "175px",
                        height: "175px",
                        objectFit: "contain",
                      }}
                      src={jobDetailProps?.logo_url || "/img/f_logo.png"}
                      alt="회사 로고"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/img/f_logo.png";
                      }}
                    />
                  </div>
                </div>
                <div className="detail_con">
                  <div className="detail_header">
                    <p className="stxt">{jobDetailProps?.companyInfo?.name}</p>
                    {userType !== UserType.COMPANY && (
                      <button
                        type="button"
                        className="s_btn"
                        onClick={openScrapModal}
                      >
                        <i
                          className={
                            jobDetailProps.isScraped
                              ? "fa-solid fa-star scraped"
                              : "fa-solid fa-star"
                          }
                        ></i>
                      </button>
                    )}
                  </div>
                  <p className="htxt">{jobDetailProps?.title}</p>
                  <div className="detail-group">
                    <div className="decol">
                      {jobDetailProps?.career?.type && (
                        <dl
                          style={{
                            display:
                              jobDetailProps.career?.type &&
                              jobDetailProps.career.type !== ""
                                ? undefined
                                : "none",
                          }}
                        >
                          <dt className="colw2 text-nowrap">경력</dt>
                          <dd>{jobDetailProps.career?.type}</dd>
                        </dl>
                      )}
                      {jobDetailProps?.qualification?.education?.level && (
                        <dl
                          style={{
                            display:
                              jobDetailProps.qualification?.education?.level &&
                              jobDetailProps.qualification.education.level !==
                                ""
                                ? undefined
                                : "none",
                          }}
                        >
                          <dt className="colw2 text-nowrap">학력</dt>
                          <dd>
                            {jobDetailProps.qualification?.education?.level}
                          </dd>
                        </dl>
                      )}
                      {jobDetailProps?.qualification?.preferences?.language &&
                        jobDetailProps?.qualification?.preferences?.language
                          .length > 0 &&
                        !(
                          jobDetailProps?.qualification?.preferences?.language
                            .length === 1 &&
                          jobDetailProps?.qualification?.preferences
                            ?.language[0] === ""
                        ) && (
                          <>
                            {(() => {
                              const langs =
                                jobDetailProps.qualification?.preferences?.language
                                  ?.filter((l) => l)
                                  .join(", ") || "";
                              return (
                                <dl
                                  style={{
                                    display: langs ? undefined : "none",
                                  }}
                                >
                                  <dt className="colw2 text-nowrap">외국어</dt>
                                  {/* <dd>{langs}</dd> */}
                                  <dd>
                                    {(jobDetailProps.qualification?.preferences
                                      ?.language?.length ?? 0) > 0
                                      ? jobDetailProps
                                          .qualification!.preferences!.language!.map(
                                            (code) => {
                                              const found = languageData.find(
                                                (i) =>
                                                  i.operationDataId === code
                                              );
                                              return found?.level1 ?? code;
                                            }
                                          )
                                          .join(", ")
                                      : "외국어"}
                                  </dd>
                                </dl>
                              );
                            })()}
                          </>
                        )}
                    </div>
                    <div className="decol">
                      <dl
                        style={{
                          display: jobDetailProps?.jobType ? undefined : "none",
                        }}
                      >
                        <dt className="colw3 text-nowrap">근무형태</dt>

                        <dd>
                          {" "}
                          {mapCodesToLabels(
                            jobDetailProps.jobType,
                            jobTypeLabelData
                          ).join(", ")}
                        </dd>
                      </dl>

                      <dl
                        style={{
                          display: jobDetailProps?.workConditions?.location
                            ?.address
                            ? undefined
                            : "none",
                        }}
                      >
                        <dt className="colw3 text-nowrap">근무지역</dt>
                        <dd>
                          {jobDetailProps?.workConditions?.location?.address}
                        </dd>
                      </dl>

                      <dl
                        style={{
                          display: jobDetailProps?.workConditions?.workingDay
                            ?.type
                            ? undefined
                            : "none",
                        }}
                      >
                        <dt className="colw3 text-nowrap">근무요일</dt>
                        <dd>
                          {jobDetailProps?.workConditions?.workingDay?.type}
                        </dd>
                      </dl>

                      <dl
                        style={{
                          display: jobDetailProps?.workConditions?.salary?.type
                            ? undefined
                            : "none",
                        }}
                      >
                        <dt className="colw3 text-nowrap">급여</dt>
                        <dd>{jobDetailProps?.workConditions?.salary?.type}</dd>
                      </dl>
                    </div>

                    <div className="decol colw4">
                      <dl
                        style={{
                          display: jobDetailProps?.applicationPeriod?.start
                            ?.date
                            ? undefined
                            : "none",
                        }}
                      >
                        <dt className="colw2 text-nowrap">시작일</dt>
                        <dd>
                          {formatDate(
                            new Date(
                              jobDetailProps?.applicationPeriod?.start?.date
                            ),
                            "yyyy.MM.DD"
                          )}
                        </dd>
                      </dl>

                      <dl
                        style={{
                          display: jobDetailProps?.applicationPeriod?.end?.date
                            ? undefined
                            : "none",
                        }}
                      >
                        <dt className="colw2 text-nowrap">마감일</dt>
                        <dd>
                          {formatDate(
                            new Date(
                              jobDetailProps?.applicationPeriod?.end?.date
                            ),
                            "yyyy.MM.DD"
                          )}
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

              <div className="detailBtn">
                {userType !== UserType.COMPANY && (
                  <>
                    {" "}
                    {jobDetailProps.applicationPeriod &&
                    isPreviousDate(
                      jobDetailProps.applicationPeriod.end.date
                    ) ? (
                      <>
                        {" "}
                        {jobDetailProps.url ? (
                          <button
                            type="button"
                            className="h_btn"
                            onClick={() => {
                              if (!userId) {
                                alert("로그인 후 지원해주세요.");
                                navigate("/member/join");
                              } else {
                                window.open(
                                  jobDetailProps?.applicationMethod?.homepage
                                );
                              }
                            }}
                          >
                            홈페이지 지원
                          </button>
                        ) : (
                          <button
                            type="button"
                            style={{ background: "#2F80DC" }}
                            onClick={() =>
                              handleApply(
                                jobDetailProps.id ?? 0,
                                jobDetailProps.companyInfo.name,
                                jobDetailProps.title
                              )
                            }
                          >
                            즉시지원
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        className="h_btn"
                        onClick={() => {}}
                      >
                        채용 마감
                      </button>
                    )}
                  </>
                )}
                {userType === UserType.JOB_SEEKER && (
                  <button
                    type="button"
                    className="s_btn"
                    onClick={openScrapModal}
                  >
                    <i
                      className={
                        jobDetailProps.isScraped
                          ? "fa-solid fa-star scraped"
                          : "fa-regular fa-star"
                      }
                    ></i>
                    스크랩
                  </button>
                )}
                <button onClick={() => navigate(-1)}>목록</button>
              </div>

              {/* 모집요강 */}
              <div
                className="detail_content item_column"
                dangerouslySetInnerHTML={{ __html: jobDetailProps?.content }}
              ></div>
              {/* 모집요강 end */}

              <div className="detailBtn">
                {userType !== UserType.COMPANY && (
                  <>
                    {" "}
                    {jobDetailProps.applicationPeriod &&
                    isPreviousDate(
                      jobDetailProps.applicationPeriod.end.date
                    ) ? (
                      <>
                        {" "}
                        {jobDetailProps.url ? (
                          <button
                            type="button"
                            className="h_btn"
                            onClick={() => {
                              if (!userId) {
                                alert("로그인 후 지원해주세요.");
                                navigate("/member/join");
                              } else {
                                window.open(
                                  jobDetailProps?.applicationMethod?.homepage
                                );
                              }
                            }}
                          >
                            홈페이지 지원
                          </button>
                        ) : (
                          <button
                            type="button"
                            style={{ background: "#2F80DC" }}
                            onClick={() =>
                              handleApply(
                                jobDetailProps.id ?? 0,
                                jobDetailProps.companyInfo.name,
                                jobDetailProps.title
                              )
                            }
                          >
                            즉시지원
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        className="h_btn"
                        onClick={() => {}}
                      >
                        채용 마감
                      </button>
                    )}
                  </>
                )}

                {userType === UserType.JOB_SEEKER && (
                  <button
                    type="button"
                    className="s_btn"
                    onClick={openScrapModal}
                  >
                    <i
                      className={
                        jobDetailProps.isScraped
                          ? "fa-solid fa-star scraped"
                          : "fa-regular fa-star"
                      }
                    ></i>
                    스크랩
                  </button>
                )}
              </div>
            </div>
            {/* detail end */}
          </div>
        </div>
      </div>
      {isScrapModalOpen && id && (
        <ScrapModal
          jobPostId={Number(id)}
          isOpen={isScrapModalOpen}
          onClose={closeScrapModal}
          onConfirm={handleScrap}
        />
      )}
      {isApplyModalOpen && (
        <ApplyModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          jobId={Number(id)} // non-null 단언
          companyName={applyCompanyName}
          jobTitle={applyJobTitle}
        />
      )}
    </Layout>
  );
};

export default JobDetail;
