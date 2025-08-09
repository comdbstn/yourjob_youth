import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CorpLayout from "../layout/CorpLayout";
import "../../../public/css/corpmypage.css";
import { axiosInstance } from "../../api/axios";
import { CompanyProfile } from "../../types/company";
import ProposalModal from "./ProposalModal";
import { Talent, ProposalData, ProposalRequestData } from "../../types/talent";
import { sendPositionProposal } from "../../api/talentApi";
import { companyApi } from "../../api/company";
import CompanyLogo from "../common/CompanyLogo";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

interface RecruitmentStatus {
  ongoingPosts: number; // 진행 중 공고
  unreadResumes: number; // 미열람 이력서
  positionOffers: number; // 포지션 제안
}

interface JobPost {
  id: number;
  status: string; // 진행중/마감
  title: string;
  applicantCount: number; // 지원자 수
  unreadCount: number; // 미열람 이력서 수
}

const Mypage: React.FC = () => {
  const navigate = useNavigate();
  const [companyInfo, setCompanyInfo] = useState<CompanyProfile | null>(null);
  const [recruitmentStatus, setRecruitmentStatus] = useState<RecruitmentStatus>(
    {
      ongoingPosts: 0,
      unreadResumes: 0,
      positionOffers: 0,
    }
  );
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 포지션 제안 모달 상태 추가
  const [showProposalModal, setShowProposalModal] = useState<boolean>(false);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const fetchCompanyInfo = async () => {
    try {
      const response = await companyApi.getCompanyProfile();
      setCompanyInfo(response);
    } catch (error) {
      console.error("회사 정보 조회 실패:", error);
    }
  };
  useEffect(() => {
    // 회사 정보 조회
    const fetchCompanyInfo = async () => {
      try {
        const response = await companyApi.getCompanyProfile();
        setCompanyInfo(response);
      } catch (error) {
        console.error("회사 정보 조회 실패:", error);
      }
    };

    // 채용/인재관리 현황 조회
    const fetchRecruitmentStatus = async () => {
      try {
        const response = await axiosInstance.get<RecruitmentStatus>(
          "/api/v1/corpmem/dashboard/status"
        );
        setRecruitmentStatus(response.data);
      } catch (error) {
        console.error("채용/인재관리 현황 조회 실패:", error);
      }
    };

    // 일반 공고 이용내역 조회
    const fetchJobPosts = async () => {
      try {
        const response = await axiosInstance.get<JobPost[]>(
          "/api/v1/corpmem/dashboard/posts"
        );
        setJobPosts(response.data.slice(0, 4));
      } catch (error) {
        console.error("공고 목록 조회 실패:", error);
      }
    };

    // 인재 목록 조회
    const fetchTalents = async () => {
      try {
        const response = await axiosInstance.get<Talent[]>(
          "/api/v1/corpmem/dashboard/talents"
        );
        setTalents(response.data);
      } catch (error) {
        console.error("인재 목록 조회 실패:", error);
      }
    };

    fetchCompanyInfo();
    fetchRecruitmentStatus();
    fetchJobPosts();
    fetchTalents();
  }, []);

  // 이미지 업로드 처리 함수
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (예: 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    // 이미지 파일 타입 체크
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    try {
      setIsUploading(true);

      const { logo_url } = await companyApi.uploadLogoImage(file);

      setCompanyInfo((prev) =>
        prev
          ? {
              ...prev,
              logo_url: logo_url,
            }
          : null
      );
    } catch (error) {
      console.error("썸네일 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      fetchCompanyInfo();
    }
  };

  // 포지션 제안 모달 열기
  const handleOpenProposalModal = (talent: Talent) => {
    setSelectedTalent(talent);
    setShowProposalModal(true);
  };

  // 포지션 제안 모달 닫기
  const handleCloseProposalModal = () => {
    setSelectedTalent(null);
    setShowProposalModal(false);
  };

  // 포지션 제안 제출 핸들러
  const handleSubmitProposal = async (data: ProposalData) => {
    if (!selectedTalent) return;

    try {
      const proposalData: ProposalRequestData = {
        jobseekerId: selectedTalent.jobseekerId,
        userId: selectedTalent.id,
        position: data.position,
        message: data.message,
        positionInfo: data.positionInfo || "",
        manager: data.manager || "",
        jobPostId: data.jobPostId || 0,
      };

      await sendPositionProposal(proposalData);

      // 성공 시 모달 닫기
      handleCloseProposalModal();
      // 성공 메시지 표시
      alert("포지션 제안이 성공적으로 전송되었습니다.");
    } catch (err) {
      console.error("포지션 제안 실패:", err);
      //alert("포지션 제안 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <CorpLayout>
      <MetaTagHelmet title="홈" description="홈" />
      <div className="container-center-horizontal">
        <div className="crop-wrap screen">
          <div className="container">
            {/* container-row */}
            <div className="container-row gap28 mb28">
              {/* home-flex1 */}
              <div className="home-flex1">
                <div className="column_center col2 hcurrent">
                  <h2 className="mb24">일반 채용 현황</h2>
                  <div className="center_flex">
                    <Link to="/corpmem/applicant">
                      <div className="cycle_flex">
                        <h3>{recruitmentStatus.ongoingPosts}</h3>
                        <p>진행 중 공고</p>
                      </div>
                    </Link>
                    <Link to="/corpmem/applicant">
                      <div className="cycle_flex">
                        <h3>{recruitmentStatus.unreadResumes}</h3>
                        <p>미열람 이력서</p>
                      </div>
                    </Link>
                  </div>
                </div>
                <div className="column_center col2 hcurrent">
                  <h2 className="mb24">인재 관리 현황</h2>
                  <div className="center_flex">
                    <Link to="/corpmem/positionhuman">
                      <div className="cycle_flex">
                        <h3>{recruitmentStatus.positionOffers}</h3>
                        <p>포지션 제안</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
              {/* home-flex1 end */}

              {/* home-flex2 : 회사 정보 영역 */}
              <div className="home-flex2">
                <div className="column_start">
                  <h2>
                    {companyInfo ? companyInfo.companyInfo?.name : "(회사명)"}
                  </h2>
                  <div className="row">
                    <div className="overlap-group">
                      {isUploading ? (
                        <div className="loading-spinner">업로드 중...</div>
                      ) : (
                        <>
                          <label
                            htmlFor="thumbnail-upload"
                            className="thumbnail-label"
                          >
                            {companyInfo?.logo_url ? (
                              <CompanyLogo logoUrl={companyInfo.logo_url} />
                            ) : (
                              <div className="thumbnail-placeholder">
                                <i className="fa-solid fa-image"></i>
                                <p>클릭하여 이미지 업로드</p>
                              </div>
                            )}
                          </label>
                          <input
                            id="thumbnail-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: "none" }}
                          />
                        </>
                      )}
                    </div>
                    <div className="detail">
                      <div className="text-container">
                        <div className="title">사원수</div>
                        <div className="text">
                          {companyInfo
                            ? `${companyInfo.employeeCount}명`
                            : "100명"}
                        </div>
                      </div>
                      <div className="text-container">
                        <div className="title">자본금</div>
                        <div className="text">
                          {companyInfo
                            ? `${companyInfo.capitalAmount}억`
                            : "288억"}
                        </div>
                      </div>
                      <div className="text-container">
                        <div className="title">매출액</div>
                        <div className="text">
                          {companyInfo
                            ? `${companyInfo.revenueAmount}억`
                            : "5000억"}
                        </div>
                      </div>
                      <div className="text-container">
                        <div className="title">당기순익</div>
                        <div className="text">
                          {companyInfo ? `${companyInfo.netIncome}억` : "500억"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="hcropMod"
                    onClick={() => navigate("/corpmem/corpmodify")}
                  >
                    기업정보 수정
                  </button>
                </div>
              </div>
              {/* home-flex2 end */}
            </div>
            {/* container-row end */}

            {/* container-row */}
            <div className="container-row gap28">
              {/* home-flex3 */}
              <div className="home-flex3">
                <div className="header">
                  <Link
                    to={"/corpmem/applicant"}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    일반 공고 이용내역 <img src="/img/RightArrow.png" />
                  </Link>
                  <button
                    type="button"
                    className="postWrite"
                    onClick={() => navigate("/corpmem/jobpost")}
                  >
                    공고등록
                  </button>
                </div>
                <ul className="contents mb28">
                  {jobPosts.length === 0 && (
                    <li>
                      <div className="subject">
                        <div className="ellipsis">등록된 공고가 없습니다.</div>
                      </div>
                    </li>
                  )}
                  {jobPosts.map((post) => (
                    <li key={post.id}>
                      <Link to={`/corpmem/applicant/${post.id}`}>
                        <div className="recruit_state">{post.status}</div>
                        <div className="subject">
                          <div className="ellipsis">{post.title}</div>
                        </div>
                        <div className="text-container">
                          <p>
                            지원자 <span>{post.applicantCount}</span>명
                          </p>
                          <p>
                            미열람 이력서 <span>{post.unreadCount}</span>건
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                  {/* <Link
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                    }}
                    to={"/corpmem/applicant"}
                  >
                    더보기
                  </Link> */}
                </ul>
                <div className="home-flex3 bannerBox">
                  <Link to="/corpmem/productInform">
                    <img src="/img/con_banner.jpg" />
                  </Link>
                </div>
              </div>
              {/* home-flex3 end */}

              {/* home-flex4 */}
              <div className="home-flex4">
                <div className="header">
                  <h2>인재들에게 포지션 제안을 해보세요!</h2>
                </div>
                <ul className="contents">
                  {talents.length === 0 && (
                    <li>
                      <div className="recruit_state"></div>
                      <div className="profile_txt">
                        <div className="ellipsis">
                          등록된 포지션 제안이 없습니다.
                        </div>
                      </div>
                    </li>
                  )}
                  {talents.map((talent) => (
                    <li
                      key={talent.id}
                      onClick={() => handleOpenProposalModal(talent)}
                    >
                      <div className="recruit_state">
                        {talent.profileImage ? (
                          <img src={talent.profileImage} alt={talent.name} />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="59"
                            height="59"
                            viewBox="0 0 59 59"
                            fill="none"
                          >
                            <circle
                              cx="29.5"
                              cy="29.5"
                              r="29.5"
                              fill="#E2EAF3"
                            ></circle>
                            <path
                              d="M29.2079 29.1619C32.014 29.1619 34.2889 26.8871 34.2889 24.081C34.2889 21.2748 32.014 19 29.2079 19C26.4018 19 24.127 21.2748 24.127 24.081C24.127 26.8871 26.4018 29.1619 29.2079 29.1619Z"
                              fill="white"
                            ></path>
                            <path
                              d="M29.2077 29.9438C24.6781 29.9438 21 33.5304 21 37.9472V38.7774C21 39.508 21.613 40.1058 22.3623 40.1058H36.0531C36.8024 40.1058 37.4154 39.508 37.4154 38.7774V37.9472C37.4154 33.5304 33.7372 29.9438 29.2077 29.9438Z"
                              fill="white"
                            ></path>
                          </svg>
                        )}
                      </div>
                      <div className="profile_txt">
                        <div className="flex-row">
                          <p>
                            {talent.name}
                            <span>
                              (
                              {isNaN(talent.age)
                                ? talent.age
                                : `만 ${talent.age}세`}
                              )
                            </span>
                          </p>
                          <p>
                            <span>
                              경력 {talent.career.years}년{" "}
                              {talent.career.months}개월
                            </span>
                          </p>
                        </div>
                        <div className="subject">
                          <div className="ellipsis">
                            {talent.education?.school &&
                              talent.education?.degree &&
                              `${talent.education.school} ${talent.education.degree}`}
                          </div>
                        </div>
                        {talent.career.company && (
                          <div className="subject">
                            {talent.career.company} {talent.career.position}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="propBtn"
                        onClick={() => handleOpenProposalModal(talent)}
                      >
                        제안 <i className="fa-solid fa-angle-right"></i>
                      </button>
                    </li>
                  ))}
                  {/* <button
                    type="button"
                    className="moreBtn"
                    onClick={() => navigate("/corpmem/search")}
                  >
                    더보기
                  </button> */}
                </ul>
              </div>
              {/* home-flex4 end */}
            </div>
            {/* container-row end */}
          </div>
        </div>
      </div>

      {/* 포지션 제안 모달 */}
      <ProposalModal
        isOpen={showProposalModal}
        onClose={handleCloseProposalModal}
        onSubmit={handleSubmitProposal}
        name={selectedTalent?.name || ""}
        gender={selectedTalent?.gender || ""}
        age={selectedTalent?.age || 0}
        width="90%"
      />
    </CorpLayout>
  );
};

export default Mypage;
