import { useEffect, useState } from "react";
import JobPostHeader from "../JobPostHeader/JobPostHeader";
import "./JobPostDetail.css";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../../../../api/axios";
import { JobPostForm } from "../../Company/WriteRecruit/MobileWriteRecruit";
import { getDdayString, isPreviousDate } from "../../../../../utils/dateUtils";
import ScrapModal from "../../../../jobpost/ScrapModal";
import MainFooter from "../../MainFooter/MainFooter";
import { jobpostApi } from "../../../../../api/jobpost";
import ApplyModalMobile from "../../Popups/ApplyModalMobile/ApplyModalMobile";
import { UserType } from "../../../../../types/user";
import {
  fetchJobpostData,
  JobpostDataItem,
} from "../../../../../api/jobpostData";
import { MetaTagHelmet } from "../../../../common/MetaTagHelmet";
export default function MobileJobPostDetail() {
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
  const [selectedTab, setSelectedTab] = useState("student"); // 기본값: 유학생
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("jobId");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobDetailProps, setJobDetailProps] = useState<JobPostForm>(
    {} as JobPostForm
  );
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyJobId, setApplyJobId] = useState<number | null>(null);
  const [applyCompanyName, setApplyCompanyName] = useState("");
  const [applyJobTitle, setApplyJobTitle] = useState("");
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");
  const [isScraped, setIsScraped] = useState(false);
  useEffect(() => {
    // 채용공고 상세 정보 조회
    const fetchJobDetail = async () => {
      try {
        const response = await axiosInstance.get(`/api/v1/jobs/${id}`);
        setJobDetailProps(response.data);
      } catch (error) {
        console.error("Error fetching job detail:", error);
      }
    };

    fetchJobDetail();
  }, [id]);
  const handleApply = (
    jobId: number | undefined,
    companyName: string,
    jobTitle: string
  ) => {
    // if (!jobId) return; // jobId가 undefined / 0일 땐 아무 동작 안 함
    setApplyJobId(jobId ?? 0);
    setApplyCompanyName(companyName);
    setApplyJobTitle(jobTitle);
    setIsApplyModalOpen(true);
  };
  const openScrapModal = () => {
    if (!userId) {
      alert("로그인해 주세요.");
      navigate("/m/member/userLogin");
      return;
    }
    if (isScraped) {
      // 이미 스크랩된 경우 바로 스크랩 취소
      jobpostApi
        .toggleScrap(Number(id))
        .then(() => {
          setIsScraped(false);
          window.location.reload();
        })
        .catch((error: Error) => {
          console.error("Error toggling scrap:", error);
        });
    } else {
      // 스크랩되지 않은 경우 모달 표시
      setIsModalOpen(true);
    }
  };

  const closeScrapModal = () => {
    setIsModalOpen(false);
    window.location.reload();
  };

  const handleScrap = () => {
    setIsScraped(!isScraped);
    navigate("/m/mypage/scrap");
  };
  const userType = sessionStorage.getItem("userType") as UserType;
  return (
    <div className="jobPostDetail_container">
      <MetaTagHelmet
        title={`${jobDetailProps?.title}`}
        ogTitle={`${jobDetailProps?.title}`}
        description={`${jobDetailProps?.title}`}
        ogImage={jobDetailProps?.logo_url}
      />
      <JobPostHeader />
      <div className="topBtns">
        {/* 버튼 클릭 시 setSelectedTab 변경 */}
        <button
          className={selectedTab === "student" ? "selected" : ""}
          onClick={() => navigate("/m/jobPost?gbn=domestic")}
        >
          <span>국내채용</span>
        </button>
        <button
          className={selectedTab === "mentoring" ? "selected" : ""}
          onClick={() => navigate("/m/jobPost?gbn=national")}
        >
          <span>해외채용</span>
        </button>
      </div>
      {/* <div className="topBtns secondBtns">
        <button>직무</button>
        <button>근무지역</button>
        <button>채용형태</button>
        <button>기업형태</button>
      </div> */}
      <h2>채용공고</h2>
      <section className="infoSection">
        <div className="content">
          <div
            className="imgDiv"
            style={{
              backgroundImage: `url("${jobDetailProps.logo_url}")`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          ></div>
          <p className="companyTitle">{jobDetailProps?.companyInfo?.name}</p>
          <p className="title">{jobDetailProps?.title}</p>
          <div className="rows">
            <div className="row">
              <p>경력</p>
              <p>{jobDetailProps?.career?.type}</p>
            </div>
            <div className="row">
              <p>학력</p>
              <p>{jobDetailProps?.qualification?.education?.level}</p>
            </div>
            <div className="row">
              <p>외국어</p>
              <p>
                {(jobDetailProps.qualification?.preferences?.language?.length ??
                  0) > 0
                  ? jobDetailProps
                      .qualification!.preferences!.language!.map((code) => {
                        const found = languageData.find(
                          (i) => i.operationDataId === code
                        );
                        return found?.level1 ?? code;
                      })
                      .join(", ")
                  : "외국어"}
              </p>
            </div>
          </div>{" "}
          <div className="rows pt-20">
            <div className="row">
              <p>근무형태</p>
              <p>{jobDetailProps?.jobType}</p>
            </div>
            <div className="row">
              <p>근무지역</p>
              <p>{jobDetailProps?.workConditions?.location?.address}</p>
            </div>
            <div className="row">
              <p>근무요일</p>
              <p>{jobDetailProps?.workConditions?.workingDay?.type}</p>
            </div>
            <div className="row">
              <p>급여</p>
              <p>{jobDetailProps?.workConditions?.salary?.type}</p>
            </div>
          </div>
          <div className="row pt-20">
            <p>마감일</p>
            <p>
              <span style={{ display: "inline-block", marginRight: "6px" }}>
                {jobDetailProps?.applicationPeriod?.end?.date}
              </span>
              <span
                style={{
                  display: "inline-block",
                  marginRight: "6px",
                  fontSize: "0",
                }}
              >
                <span className="bar"></span>{" "}
                <span style={{ color: "#2f80dc", fontSize: "16px" }}>
                  {getDdayString(jobDetailProps?.applicationPeriod?.end?.date)}
                </span>
              </span>
            </p>
          </div>
        </div>
      </section>
      {userType !== UserType.COMPANY && (
        <div className="btns">
          {jobDetailProps.applicationPeriod &&
          isPreviousDate(jobDetailProps.applicationPeriod.end.date) ? (
            <>
              {jobDetailProps.url ? (
                <button
                  className="blackBtn"
                  onClick={() => {
                    if (!userId) {
                      alert("로그인 후 지원해주세요.");
                      navigate("/member/join");
                    } else {
                      window.open(jobDetailProps?.applicationMethod?.homepage);
                    }
                  }}
                >
                  홈페이지 지원
                </button>
              ) : (
                <button
                  style={{
                    background: "#2F80DC",
                    width: "100%",
                    color: "white",
                  }}
                  onClick={() =>
                    handleApply(
                      jobDetailProps.id ?? 0,
                      jobDetailProps.companyInfo.name,
                      jobDetailProps.title
                    )
                  }
                  className="whiteBtn"
                >
                  즉시지원
                </button>
              )}
            </>
          ) : (
            <>
              {" "}
              <button type="button" className="h_btn" onClick={() => {}}>
                채용 마감
              </button>
            </>
          )}
          <button className="scrap" onClick={openScrapModal}>
            스크랩
          </button>
        </div>
      )}
      <div
        className="detail_content item_column"
        style={{
          width: "100%",
          boxSizing: "border-box",
          overflowX: "auto",
          wordBreak: "break-word",
          WebkitHyphens: "auto",
          hyphens: "auto",
        }}
        dangerouslySetInnerHTML={{ __html: jobDetailProps?.content }}
      ></div>
      {userType !== UserType.COMPANY && (
        <div className="btns">
          {jobDetailProps.applicationPeriod &&
          isPreviousDate(jobDetailProps.applicationPeriod.end.date) ? (
            <>
              {jobDetailProps.url ? (
                <button
                  className="blackBtn"
                  onClick={() => {
                    if (!userId) {
                      alert("로그인 후 지원해주세요.");
                      navigate("/member/join");
                    } else {
                      window.open(jobDetailProps?.applicationMethod?.homepage);
                    }
                  }}
                >
                  홈페이지 지원
                </button>
              ) : (
                <button
                  style={{
                    background: "#2F80DC",
                    width: "100%",
                    color: "white",
                  }}
                  onClick={() =>
                    handleApply(
                      jobDetailProps.id ?? 0,
                      jobDetailProps.companyInfo.name,
                      jobDetailProps.title
                    )
                  }
                  className="whiteBtn"
                >
                  즉시지원
                </button>
              )}
            </>
          ) : (
            <>
              {" "}
              <button type="button" className="h_btn" onClick={() => {}}>
                채용 마감
              </button>
            </>
          )}
          <button className="scrap" onClick={openScrapModal}>
            스크랩
          </button>
        </div>
      )}
      <button className="backBtn" onClick={() => navigate(-1)}>
        목록
      </button>
      {/* <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {jobDetailProps.applicationPeriod &&
        isPreviousDate(jobDetailProps.applicationPeriod.end.date) ? (
          <>
            {jobDetailProps.url ? (
              <button
                className="scrapBtn"
                style={{ background: "#545454", color: "white", width: "100%" }}
                onClick={() =>
                  window.open(jobDetailProps?.applicationMethod?.homepage)
                }
              >
                홈페이지 지원
              </button>
            ) : (
              <button
                type="button"
                style={{ background: "#2F80DC", width: "50%" }}
                onClick={() =>
                  handleApply(
                    jobDetailProps.id ?? 0,
                    jobDetailProps.companyInfo.name,
                    jobDetailProps.title,
                  )
                }
                className="blueBtn"
              >
                즉시지원
              </button>
            )}
          </>
        ) : (
          <button type="button" className="h_btn" onClick={() => {}}>
            채용 마감
          </button>
        )}
        <button
          className="scrapBtn"
          onClick={openScrapModal}
          style={{
            marginBottom: "12px",
            height: "60px",
            textWrap: "nowrap",
            width: "100%",
          }}
        >
          스크랩
        </button>
      </div> */}
      {isModalOpen && (
        <ScrapModal
          jobPostId={Number(id) ?? ""}
          isOpen={isModalOpen}
          onClose={closeScrapModal}
          onConfirm={handleScrap}
        />
      )}
      {isApplyModalOpen && (
        <ApplyModalMobile
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          jobId={Number(id)} // non-null 단언
          companyName={applyCompanyName}
          jobTitle={applyJobTitle}
          width="90%"
        />
      )}
      <MainFooter />
    </div>
  );
}
