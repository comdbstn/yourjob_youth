import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { axiosInstance } from "../../../../../../api/axios";
import {
  ApplicantStep,
  JobPost,
  Volunteer,
  VolunteerListResponse,
  ApplicantStatus,
} from "../../../../../../types/jobPost";
import MainFooter from "../../../MainFooter/MainFooter";
import MobileMainHeader from "../../../MainHeader/MainHeader";
import "./VolunteerDocu.css";
import { formatGender } from "../../../../../../utils/formatUtils";
import { schoolOptions } from "../../../../../../app/dummy/options";
import { formatDate } from "../../../../../../utils/dateUtils";
import { getCommaSeparatedNumber } from "../../../../../../utils/numberUtils";
import { MetaTagHelmet } from "../../../../../common/MetaTagHelmet";

const APPLICANT_STATUS_TEXT: Record<ApplicantStatus, string> = {
  [ApplicantStatus.UNREAD]: "미열람",
  [ApplicantStatus.PENDING]: "미심사",
  [ApplicantStatus.PASSED]: "면접",
  [ApplicantStatus.FAILED]: "불합격",
  [ApplicantStatus.FINAL]: "최종합격",
};

export default function VolunteerDocu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const postId = searchParams.get("id");

  const [activeTab, setActiveTab] = useState<ApplicantStep>(
    ApplicantStep.DOCUMENT
  );
  const [jobPost, setJobPost] = useState<JobPost>();
  const [applicants, setApplicants] = useState<Volunteer[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchJobPost();
    fetchApplicants();
  }, [postId, currentPage, activeTab]);

  // Fetch job post
  const fetchJobPost = async () => {
    try {
      const response = await axiosInstance.get<JobPost>(
        `/api/v1/corpmem/posts/${postId}`
      );
      setJobPost(response.data);
    } catch (error) {
      console.error("공고 조회 실패:", error);
    }
  };

  // Fetch applicants
  const fetchApplicants = async () => {
    try {
      const response = await axiosInstance.get<VolunteerListResponse>(
        `/api/v1/corpmem/posts/${postId}/volunteerlist`,
        {
          params: {
            status: activeTab,
            page: currentPage,
            size: 4,
          },
        }
      );

      setApplicants(response.data.content);
      setCurrentPage(response.data.page);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("지원자 목록 조회 실패:", error);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchApplicants();
  };

  const handleApplicantDocPass = async (
    applicantName: string,
    applicantId: number
  ) => {
    try {
      if (
        window.confirm(
          `${applicantName} 지원자를 [서류전형]에서 [면접]으로 이동합니다.`
        )
      ) {
        await axiosInstance.put(
          `/api/v1/corpmem/volunteerlist/${postId}/${applicantId}`,
          { status: ApplicantStatus.PASSED }
        );
        fetchApplicants();
        fetchJobPost();
      }
    } catch (error) {
      console.error("지원자 합격 처리 실패:", error);
    }
  };

  const handleApplicantDocFail = async (
    applicantName: string,
    applicantId: number
  ) => {
    try {
      if (
        window.confirm(
          `${applicantName} 지원자를 [서류전형]에서 [불합격]으로 이동합니다.`
        )
      ) {
        await axiosInstance.put(
          `/api/v1/corpmem/volunteerlist/${postId}/${applicantId}`,
          { status: ApplicantStatus.FAILED }
        );
        fetchApplicants();
        fetchJobPost();
      }
    } catch (error) {
      console.error("지원자 불합격 처리 실패:", error);
    }
  };

  const handleApplicantInterviewPass = async (
    applicantName: string,
    applicantId: number
  ) => {
    try {
      if (
        window.confirm(
          `${applicantName} 지원자를 [면접]에서 [최종합격]으로 이동합니다.`
        )
      ) {
        await axiosInstance.put(
          `/api/v1/corpmem/volunteerlist/${postId}/${applicantId}`,
          { status: ApplicantStatus.FINAL }
        );
        fetchApplicants();
        fetchJobPost();
      }
    } catch (error) {
      console.error("지원자 최종합격 처리 실패:", error);
    }
  };

  const handleApplicantInterviewFail = async (
    applicantName: string,
    applicantId: number
  ) => {
    try {
      if (
        window.confirm(
          `${applicantName} 지원자를 [면접]에서 [불합격]으로 이동합니다.`
        )
      ) {
        await axiosInstance.put(
          `/api/v1/corpmem/volunteerlist/${postId}/${applicantId}`,
          { status: ApplicantStatus.FAILED }
        );
        fetchApplicants();
        fetchJobPost();
      }
    } catch (error) {
      console.error("지원자 불합격 처리 실패:", error);
    }
  };

  return (
    <div className="VolunteerDocuContainer">
      <MetaTagHelmet title="공고·지원자관리" description="공고·지원자관리" />
      <MobileMainHeader />
      <div className="darkBg">
        <h2>공고·지원자관리</h2>
        <div className="headers">
          <p className="processingLabel">채용중</p>
          <p className="titleLabel">{jobPost?.title}</p>
          <p className="info">
            {jobPost?.registeredDate}등록<span className="bar"></span>
            {jobPost?.startDate}~{jobPost?.endDate}
          </p>
          <div className="flexGap10 mt-10">
            <div
              className="input_default"
              onClick={() => {
                navigate(`/m/jobPost/detail?jobId=${postId}`);
              }}
            >
              공고보기
            </div>
            {/* <div className="input_default">
              <select className="w-full">
                <option>공고설정</option>
              </select>
            </div> */}
          </div>
        </div>
      </div>
      <div className="board-wrap">
        <div className="board">
          <div className="row">
            <p>{jobPost?.total_applier || 0}</p>
            <p>전체</p>
          </div>{" "}
          <div className="row">
            <p>{jobPost?.pending || 0}</p>
            <p>서류전형</p>
          </div>{" "}
          <div className="row">
            <p>{jobPost?.paper_passed || 0}</p>
            <p>면접</p>
          </div>{" "}
          <div className="row">
            <p>{jobPost?.final_passed || 0}</p>
            <p>최종합격</p>
          </div>{" "}
          <div className="row border-none">
            <p>{jobPost?.failed || 0}</p>
            <p>불합격</p>
          </div>
        </div>
      </div>
      <section className="rows">
        <ul>
          {applicants.map((applicant, idx) => (
            <li
              key={idx}
              onClick={() => {
                navigate(`/m/company/profileView/${postId}/${applicant.id}`);
              }}
            >
              <div className="flexGap10">
                <p className="procLabel">
                  {APPLICANT_STATUS_TEXT[applicant.status]}
                </p>
                <p>
                  {formatDate(
                    new Date(applicant.applicationDate),
                    "YYYY.MM.DD"
                  )}
                  &nbsp;|&nbsp;
                  {applicant.status === ApplicantStatus.UNREAD && (
                    <strong>미열람</strong>
                  )}
                  {(applicant.status === ApplicantStatus.PENDING ||
                    applicant.status === ApplicantStatus.PASSED) && (
                    <strong>열람</strong>
                  )}
                  {applicant.status === ApplicantStatus.FINAL && (
                    <strong>최종합격</strong>
                  )}
                  {applicant.status === ApplicantStatus.FAILED && (
                    <strong>불합격</strong>
                  )}
                </p>
              </div>
              <div className="rowBody mt-10">
                <p>
                  <strong>{applicant.name}</strong>(
                  {formatGender(applicant.gender)},{" "}
                  {isNaN(applicant.age) ? applicant.age : `${applicant.age}세`})
                  | 경력
                  {applicant.experience}년
                </p>
                <p className="desc">
                  {
                    schoolOptions.find(
                      (option) => option.value === applicant.education
                    )?.label
                  }{" "}
                  {applicant.major} {applicant.companyName}
                </p>
                <p className="cost mt-10">
                  {getCommaSeparatedNumber(applicant.expectedSalary || 0)}만원
                </p>
              </div>
              <div className="flexGap10 mt-20">
                {applicant.status === ApplicantStatus.PENDING && (
                  <>
                    <div
                      className="blueBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplicantDocPass(applicant.name, applicant.id);
                      }}
                    >
                      합격
                    </div>
                    <div
                      className="blueBtn2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplicantDocFail(applicant.name, applicant.id);
                      }}
                    >
                      불합격
                    </div>
                  </>
                )}
                {applicant.status === ApplicantStatus.PASSED && (
                  <>
                    <div
                      className="blueBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplicantInterviewPass(
                          applicant.name,
                          applicant.id
                        );
                      }}
                    >
                      합격
                    </div>
                    <div
                      className="blueBtn2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplicantInterviewFail(
                          applicant.name,
                          applicant.id
                        );
                      }}
                    >
                      불합격
                    </div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <MainFooter />
    </div>
  );
}
