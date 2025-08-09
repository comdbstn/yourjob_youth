import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CorpLayout from "../layout/CorpLayout";
import { axiosInstance } from "../../api/axios";
import "../../../public/css/corpmypage.css";
import "../../../public/css/nice-select.css";
import PostingPagination from "../common/PostingPagination";
import {
  Volunteer,
  VolunteerListResponse,
  ApplicantStatus,
  JobPost,
  ApplicantStep,
  JobPostStatus,
} from "../../types/jobPost";
import { formatGender } from "../../utils/formatUtils";
import { APPLICANT_STATUS_TEXT, schoolOptions } from "../../app/dummy/options";
import { formatDate } from "../../utils/dateUtils";
import { getCommaSeparatedNumber } from "../../utils/numberUtils";
import { JOB_POST_STATUS_TEXT } from "./Applicant";
import { useAlert } from "../../contexts/AlertContext";
import AcceptResultModal from "./AcceptResultModal";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const VolunteerList: React.FC = () => {
  const navigate = useNavigate();
  const { customConfirm } = useAlert();
  const { postId } = useParams<{ postId: string }>();
  const [jobPost, setJobPost] = useState<JobPost>();
  const [applicants, setApplicants] = useState<Volunteer[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchJobPost();
    fetchApplicants();
  }, [postId, currentPage]);

  // Fetch job post
  const fetchJobPost = async () => {
    try {
      const response = await axiosInstance.get<JobPost>(
        `/api/v1/corpmem/posts/${postId}`
      );
      setJobPost(response.data);
    } catch (error) {
      console.error("공고 조회 실패:", error);
      navigate("/notfound");
    }
  };

  // Fetch applicants
  const fetchApplicants = async () => {
    try {
      const response = await axiosInstance.get<VolunteerListResponse>(
        `/api/v1/corpmem/posts/${postId}/volunteerlist`,
        {
          params: {
            page: currentPage,
            size: 4,
          },
        }
      );

      setApplicants(response.data.content);
      setCurrentPage(response.data.page);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      navigate("/notfound");
      console.error("지원자 목록 조회 실패:", error);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchApplicants();
    fetchJobPost();
  };

  const handleApplicantDocPass = async (
    applicantName: string,
    applicantId: number
  ) => {
    try {
      if (
        await customConfirm({
          content: `${applicantName} 지원자를 [서류전형]에서\n [면접]으로 이동합니다.`,
          confirmLabel: "확인",
          cancelLabel: "취소",
        })
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
  const [selectedApplicant, setSelectedApplicant] = useState<{
    name: string;
    id: number;
  } | null>(null);

  const handleApplicantDocFail = async (
    applicantName: string,
    applicantId: number
  ) => {
    try {
      if (
        await customConfirm({
          content: `${applicantName} 지원자를 [서류전형]에서\n [불합격]으로 이동합니다.`,
          confirmLabel: "확인",
          cancelLabel: "취소",
        })
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
  const [isOpenResultModal, setIsOpenResultModal] = useState<boolean>(false);
  const handleApplicantInterviewPass = async (
    applicantName: string,
    applicantId: number
  ) => {
    setSelectedApplicant({ name: applicantName, id: applicantId });
    setIsOpenResultModal(true);

    // try {
    //   if (
    //     await customConfirm({
    //       content: `${applicantName} 지원자를 [면접]에서\n [최종합격]으로 이동합니다.`,
    //       confirmLabel: "확인",
    //       cancelLabel: "취소",
    //     })
    //   ) {
    //     await axiosInstance.put(
    //       `/api/v1/corpmem/volunteerlist/${postId}/${applicantId}`,
    //       { status: ApplicantStatus.FINAL },
    //     );
    //     fetchApplicants();
    //     fetchJobPost();
    //   }
    // } catch (error) {
    //   console.error("지원자 최종합격 처리 실패:", error);
    // }
  };

  const handleApplicantInterviewFail = async (
    applicantName: string,
    applicantId: number
  ) => {
    try {
      if (
        await customConfirm({
          content: `${applicantName} 지원자를 [면접]에서\n [불합격]으로 이동합니다.`,
          confirmLabel: "확인",
          cancelLabel: "취소",
        })
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

  // 공고 관리 관련 메소드들
  const handleModifyPost = () => {
    navigate(`/corpmem/jobpost/${postId}`);
  };

  const handleCopyPost = () => {
    // TODO: 공고 복사 API 연동 필요
    console.log("공고 복사");
  };

  const handleClosePost = async () => {
    try {
      if (
        await customConfirm({
          content: "공고를 마감하시겠습니까?",
          confirmLabel: "확인",
          cancelLabel: "취소",
        })
      ) {
        await axiosInstance.patch(`/api/v1/corpmem/posts/${postId}/close`);
        await fetchJobPost();
        await fetchApplicants();
      }
    } catch (error) {
      console.error("공고 마감 실패:", error);
    }
  };

  const handleDeletePost = async () => {
    try {
      if (
        await customConfirm({
          content: "공고를 삭제하시겠습니까?",
          confirmLabel: "확인",
          cancelLabel: "취소",
        })
      ) {
        await axiosInstance.delete(`/api/v1/corpmem/posts/${postId}`);
        navigate("/corpmem/applicant");
      }
    } catch (error) {
      console.error("공고 삭제 실패:", error);
    }
  };

  const handlePostManagement = (action: string) => {
    switch (action) {
      case "modify":
        handleModifyPost();
        break;
      case "copy":
        handleCopyPost();
        break;
      case "close":
        handleClosePost();
        break;
      case "delete":
        handleDeletePost();
        break;
    }
  };
  function stripTime(dateTimeStr: string) {
    return dateTimeStr.split(" ")[0];
  }
  return (
    <CorpLayout>
      <MetaTagHelmet title="지원자 목록" description="지원자 목록" />
      <div className="container-center-horizontal">
        <div className="crop-wrap screen">
          <div className="container container-col">
            {/* jobInfo */}
            <div className="jonInfo_Box mb50">
              <div className="list_info col2">
                <p className="pcolor">
                  {
                    JOB_POST_STATUS_TEXT[
                      jobPost?.status || JobPostStatus.ONGOING
                    ]
                  }
                </p>
                <h3>{jobPost?.title}</h3>
                <ul>
                  <li className="line">공고번호 {jobPost?.postNumber}</li>
                  <li className="line">
                    {(() => {
                      const [sDate = "", sTime = ""] = (
                        jobPost?.startDate || ""
                      ).split(" ");
                      const [eDate = "", eTime = ""] = (
                        jobPost?.endDate || ""
                      ).split(" ");
                      return (
                        <>
                          <span style={{ color: "#767676" }}>{sDate}</span>{" "}
                          <span style={{ color: "#ACACAC" }}>{sTime}</span>
                          {" ~ "}
                          <span style={{ color: "#767676" }}>{eDate}</span>{" "}
                          <span style={{ color: "#ACACAC" }}>{eTime}</span>
                        </>
                      );
                    })()}
                  </li>

                  <li>{stripTime(jobPost?.registeredDate ?? "")} 등록</li>
                </ul>
              </div>

              <div className="infobtnGroup">
                <button
                  type="button"
                  className="JobView"
                  id="view"
                  onClick={() => navigate(`/corpmem/jobdetail/${postId}`)}
                >
                  공고 보기
                </button>
                <select
                  id="jobset"
                  name="jobset"
                  className="nice-select"
                  onChange={(e) => {
                    handlePostManagement(e.target.value);
                    e.target.value = ""; // 선택 후 초기화
                  }}
                >
                  <option value="">공고관리</option>
                  {jobPost?.status === JobPostStatus.ONGOING && (
                    <>
                      <option value="modify">공고수정</option>
                      <option value="close">공고마감</option>
                    </>
                  )}
                  <option value="delete">공고삭제</option>
                </select>
              </div>
            </div>
            {/* jobInfo end*/}

            {/* tabBox */}
            <div className="tabBox mb30">
              <div className="tabMenu">
                <button className="nolink">
                  전체 {jobPost?.total_applier || 0}
                </button>
                <button className="nolink">
                  서류전형 {jobPost?.pending || 0}
                </button>
                <button className="nolink">
                  면접 {jobPost?.paper_passed || 0}
                </button>
                <button className="nolink">
                  최종합격 {jobPost?.final_passed || 0}
                </button>
                <button className="nolink">
                  불합격 {jobPost?.failed || 0}
                </button>
              </div>
            </div>
            {/* tabBox end */}

            {/* loop thead*/}
            <div className="list_table">
              <ul className="list_thead">
                <li className="w01 text-center">진행단계</li>
                <li className="w02">이름/나이</li>
                <li className="w03">경력</li>
                <li className="w03">최종학력</li>
                <li className="w04">전공/학점</li>
                <li className="w04">희망/최근연봉</li>
                <li className="w05">지원일</li>
                <li className="w01 text-center">상태</li>
                <li className="w06 text-center">발표</li>
              </ul>
              {/* loop thead end */}

              {/* loop tbody */}
              {applicants.map((applicant) => (
                <ul className="list_tbody" key={`${applicant.id}`}>
                  <Link to={`/corpmem/applicant/${postId}/${applicant.id}`}>
                    <li className="w01 text-center">
                      <p className="txt1">
                        {APPLICANT_STATUS_TEXT[applicant.status]}
                      </p>
                    </li>
                    <li className="w02">
                      <p className="txt2">{applicant.name}</p>
                      <p className="txt3">
                        {formatGender(applicant.gender)},{" "}
                        {isNaN(applicant.age)
                          ? applicant.age
                          : `${applicant.age}세`}
                      </p>
                    </li>
                    <li className="w03">
                      <p className="txt2">{applicant.experience}년</p>
                      <p className="txt3">{applicant.companyName}</p>
                    </li>
                    <li className="w03">
                      <p className="txt2">
                        {
                          schoolOptions.find(
                            (option) => option.value === applicant.education
                          )?.label
                        }
                      </p>
                      <p className="txt3">{applicant.schoolName}</p>
                    </li>
                    <li className="w04">
                      <p className="txt2">{applicant.major}</p>
                      <p className="txt3">
                        {applicant.totalCredits || 0}/{applicant.gpa || 0}
                      </p>
                    </li>
                    <li className="w04">
                      <p className="txt2">
                        {getCommaSeparatedNumber(applicant.expectedSalary || 0)}
                      </p>
                      <p className="txt3">
                        {getCommaSeparatedNumber(applicant.recentSalary || 0)}
                      </p>
                    </li>
                    <li className="w05">
                      <p className="txt2">
                        {formatDate(
                          new Date(applicant.applicationDate),
                          "YYYY.MM.DD"
                        )}
                      </p>
                    </li>
                    <li className="w01 text-center">
                      {applicant.status === ApplicantStatus.UNREAD && (
                        <p className="txt1">미열람</p>
                      )}
                      {(applicant.status === ApplicantStatus.PENDING ||
                        applicant.status === ApplicantStatus.PASSED) && (
                        <p className="txt1">열람</p>
                      )}
                      {applicant.status === ApplicantStatus.FINAL && (
                        <p className="txt1">최종합격</p>
                      )}
                      {applicant.status === ApplicantStatus.FAILED && (
                        <p className="txt1">불합격</p>
                      )}
                    </li>
                    {applicant.status === ApplicantStatus.PENDING && (
                      <li className="w06 text-center">
                        <div className="infobtnGroup item-justify-center">
                          <button
                            type="button"
                            className="passBtn"
                            onClick={(e) => {
                              e.preventDefault();
                              handleApplicantDocPass(
                                applicant.name,
                                applicant.id
                              );
                            }}
                          >
                            합격
                          </button>
                          <button
                            type="button"
                            className="failBtn"
                            onClick={(e) => {
                              e.preventDefault();
                              handleApplicantDocFail(
                                applicant.name,
                                applicant.id
                              );
                            }}
                          >
                            불합격
                          </button>
                        </div>
                      </li>
                    )}
                    {applicant.status === ApplicantStatus.PASSED && (
                      <li className="w06 text-center">
                        <div className="infobtnGroup item-justify-center">
                          <button
                            type="button"
                            className="passBtn"
                            onClick={(e) => {
                              e.preventDefault();
                              handleApplicantInterviewPass(
                                applicant.name,
                                applicant.id
                              );
                            }}
                          >
                            합격
                          </button>
                          <button
                            type="button"
                            className="failBtn"
                            onClick={(e) => {
                              e.preventDefault();
                              handleApplicantInterviewFail(
                                applicant.name,
                                applicant.id
                              );
                            }}
                          >
                            불합격
                          </button>
                        </div>
                      </li>
                    )}
                    {applicant.status === ApplicantStatus.FINAL && (
                      <li className="w06 text-center">
                        <button
                          type="button"
                          className="passBtn"
                          style={{ width: "100%" }}
                          onClick={(e) => {
                            e.preventDefault();
                            setIsOpenResultModal(true);
                          }}
                        >
                          합격발표
                        </button>
                      </li>
                    )}
                  </Link>
                </ul>
              ))}
            </div>
            {/* loop tbody end */}

            {/* page */}
            <PostingPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
            <AcceptResultModal
              isOpen={isOpenResultModal}
              onClose={() => {
                setIsOpenResultModal(false);
                setSelectedApplicant(null);
              }}
              onConfirm={async (title: string, content: string) => {
                if (!selectedApplicant) return;

                try {
                  // 최종 합격 처리 및 이메일 발송
                  await axiosInstance.put(
                    `/api/v1/corpmem/volunteerlist/${postId}/${selectedApplicant.id}`,
                    {
                      status: ApplicantStatus.FINAL,
                      title: title,
                      content: content,
                    }
                  );

                  // 성공 메시지 (옵션)
                  alert(
                    "최종합격 처리되었으며, 합격자에게 이메일이 발송되었습니다."
                  );

                  // 목록 새로고침
                  await fetchApplicants();
                  await fetchJobPost();
                } catch (error) {
                  console.error("최종합격 처리 실패:", error);
                  alert("합격 처리 중 오류가 발생했습니다.");
                } finally {
                  setIsOpenResultModal(false);
                  setSelectedApplicant(null);
                }
              }}
            />
            {/* page end */}
          </div>
        </div>
      </div>
    </CorpLayout>
  );
};

export default VolunteerList;
