import { Link, useNavigate } from "react-router-dom";
import MainFooter from "../../MainFooter/MainFooter";
import MobileMainHeader from "../../MainHeader/MainHeader";
import "./MobileCompanyHome.css";
import { useState, useEffect } from "react";
import { axiosInstance } from "../../../../../api/axios";
import { CompanyInfo } from "../../../../../types/corp";
import { CompanyProfile } from "../../../../../types/company";
import {
  ProposalData,
  ProposalRequestData,
  Talent,
} from "../../../../../types/talent";
import { sendPositionProposal } from "../../../../../api/talentApi";
import { companyApi } from "../../../../../api/company";
import ProposalModal from "../../../../corpmem/ProposalModal";
import CompanyLogo from "../../../../common/CompanyLogo";
import { MetaTagHelmet } from "../../../../common/MetaTagHelmet";

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

export default function MobileCompanyHome() {
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

        setTalents(response.data.slice(0, 4));
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
    <div className="mobileCompanyHome_Container">
      <MobileMainHeader />
      <MetaTagHelmet title="기업회원 홈" description={`기업회원 홈`} />
      <h3 className="siteH3Label">홈</h3>
      <section className="ProfileSection">
        <p className="corpName">(주)유어잡</p>
        <div className="ContentSection">
          <div className="corpImg">
            {companyInfo?.logo_url ? (
              <CompanyLogo logoUrl={companyInfo.logo_url} />
            ) : (
              <div className="thumbnail-placeholder">
                <i className="fa-solid fa-image"></i>
                <p>클릭하여 이미지 업로드</p>
              </div>
            )}
          </div>
          <div className="rows">
            <div className="row">
              <p>사원수</p>
              <p>{companyInfo?.employeeCount}명</p>
            </div>
            <div className="row">
              <p>자본금</p>
              <p>{companyInfo?.capitalAmount}억</p>
            </div>{" "}
            <div className="row">
              <p>매출액</p>
              <p>{companyInfo?.revenueAmount}억</p>
            </div>{" "}
            <div className="row">
              <p>당기순익</p>
              <p>{companyInfo?.netIncome}억</p>
            </div>
          </div>
        </div>
        <button
          className="editBtn"
          onClick={() => {
            navigate("/m/company/home/edit");
          }}
        >
          기업정보 수정
        </button>
      </section>
      <section className="ProfileSection2 mt-20">
        <div className="sections">
          <h4>일반 채용 현황</h4>
          <Link to={`/m/company/managePost`}>
            <div className="circleDiv">
              <p>{recruitmentStatus.ongoingPosts}</p>
              <p>진행중 공고</p>
            </div>
          </Link>
          <Link to={`/m/company/managePost`}>
            <div className="circleDiv">
              <p>{recruitmentStatus.unreadResumes}</p>
              <p>미열람 이력서</p>
            </div>
          </Link>
        </div>
        {/* Border */}
        <div className="sections">
          <h4>인재 관리 현황</h4>
          <Link to={`/m/company/manageTalent`}>
            <div className="circleDiv">
              <p>{recruitmentStatus.positionOffers}</p>
              <p>포지션 제안</p>
            </div>
          </Link>
        </div>
      </section>
      <section className="ProfileSection3 mt-20">
        <div className="headers">
          <Link to={"/m/company/managePost"}>
            <h4 style={{ display: "flex", gap: "5px", alignItems: "center" }}>
              일반 공고 이용내역{" "}
              {/* <img src="/img/RightArrow.png" style={{ paddingTop: "3px" }} /> */}
            </h4>
          </Link>
        </div>
        <div className="bodys">
          <ul>
            {jobPosts.map((i) => (
              <li key={i.id}>
                <a href={`/m/company/managePost/document?id=${i.id}`}>
                  <div className="topRow">
                    <p className="processingLabel">{i.status}</p>
                    <p className="countLabel">
                      지원자 <strong>{i.applicantCount}</strong>명
                      <span className="bar"></span>미열람 이력서{" "}
                      <strong>{i.unreadCount}</strong>건
                    </p>
                  </div>
                  <div>
                    <p className="desc">{i.title}</p>
                  </div>
                </a>
              </li>
            ))}
            <button
              onClick={() => {
                navigate("/m/company/writeRecruit");
              }}
              style={{
                background: "#2F80DC",
                height: "50px",
                width: "100%",
                borderRadius: "15px",
                color: "white",
                marginTop: "20px",
              }}
            >
              공고 등록
            </button>
          </ul>
        </div>
      </section>
      <div className="proposalProduct">
        <img src="/img/mobile/documentSearch.png" />
        <div className="desc">
          <p>포지션제안 상품</p>
          <p>마음에 드는 인재에게 포지션 제안이 가능한 상품을 만나보세요</p>
        </div>
      </div>
      <section className="ProfileSection4 mt-20">
        <div className="headers">
          <h4>인재들에게 포지션 제안을 해보세요!</h4>
        </div>
        <div className="bodys" style={{ overflowY: "scroll", width: "100%" }}>
          <ul style={{ width: "100%" }}>
            {talents.map((talent) => (
              <li
                key={talent.id}
                onClick={() => handleOpenProposalModal(talent)}
              >
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
                <div className="rightDiv">
                  <p>
                    <strong>{talent.name}</strong>(
                    {isNaN(talent.age) ? talent.age : `${talent.age}세`})
                    <span className="bar"></span>경력 {talent.career.years}년{" "}
                    {talent.career.months}개월
                  </p>
                  <p className="desc">
                    {talent.education && (
                      <>
                        {`${talent.education.school} ${talent.education.degree}`}{" "}
                        <br />
                        {talent.career.company}
                      </>
                    )}
                  </p>
                </div>
                <button
                  className="rightBtn"
                  onClick={() => handleOpenProposalModal(talent)}
                  style={{ marginLeft: "auto" }}
                >
                  제안 <img src="/img/mobile/right_arrow.png" />
                </button>
              </li>
            ))}
            <button
              onClick={() => {
                navigate("/m/company/searchTalent");
              }}
              style={{
                height: "50px",
                width: "100%",
                fontSize: "14px",
                color: "#a8a8a8",
              }}
            >
              더보기
            </button>
          </ul>
        </div>
      </section>
      <MainFooter />
      <ProposalModal
        isOpen={showProposalModal}
        onClose={handleCloseProposalModal}
        onSubmit={handleSubmitProposal}
        name={selectedTalent?.name || ""}
        gender={selectedTalent?.gender || ""}
        age={selectedTalent?.age || 0}
      />
    </div>
  );
}
