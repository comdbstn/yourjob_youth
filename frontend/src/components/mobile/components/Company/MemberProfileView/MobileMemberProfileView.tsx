import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../../../../api/axios";
import {
  CorporateResumeForm,
  DisabledGrade,
  getCareerTypeText,
  getDisabledGradeText,
  ResumeForm,
} from "../../../../../types/resume";
import MainFooter from "../../MainFooter/MainFooter";
import MobileMainHeader from "../../MainHeader/MainHeader";
import "./MobileMemberProfileView.css";
import {
  formatBirthAndAge,
  formatGender,
} from "../../../../../utils/formatUtils";
import {
  formatPeriod,
  calculatePeriod,
  formatDate,
} from "../../../../../utils/dateUtils";
import {
  GraduationStatusText,
  GraduationStatus,
  MilitaryServiceClass,
  MilitaryServiceClassText,
  MilitaryServiceStatus,
  MilitaryServiceStatusText,
} from "../../../../../app/dummy/options";
import { ProposalData, ProposalRequestData } from "../../../../../types/talent";
import { resumeApi } from "../../../../../api/resume";
import { sendPositionProposal } from "../../../../../api/talentApi";
import { MetaTagHelmet } from "../../../../common/MetaTagHelmet";
export default function MobileMemberProfileView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const fromPage = location.state?.from || "";
  const isPageInScrapOrLatest =
    fromPage === "scraphuman" || fromPage === "latesthuman";
  const [resume, setResume] = useState<CorporateResumeForm>({
    title: "",
    picturePath: "",
    name: "",
    englishName: "",
    birth: "",
    gender: "",
    careerType: "JUNIOR",
    phone: "",
    address: "",
    email: "",
    nationality: "",
    visa: [],
    educations: [],
    languages: [],
    careers: [],
    activities: [],
    apostilles: [],
    certifications: [],
    awards: [],
    employmentPreferences: {
      isVeteran: false,
      isEmploymentProtected: false,
      isEmploymentSupport: false,
      isDisabled: false,
      disabledGrade: "",
      hasMilitaryService: false,
      militaryServiceStatus: "",
      militaryServiceJoinDate: "",
      militaryServiceOutDate: "",
      militaryServiceClass: "",
    },
    selfIntroductions: [],
    responseStatus: "PENDING",
    blind: true,
  });
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [isScrapModalOpen, setIsScrapModalOpen] = useState<boolean>(false);
  const [scrapTalentId, setScrapTalentId] = useState<number | null>(null);
  const [showProposalModal, setShowProposalModal] = useState<boolean>(false);

  useEffect(() => {
    fetchResumeDetail();
  }, [id]);

  const fetchResumeDetail = async () => {
    try {
      if (!id) return;
      const response = await resumeApi.getResumeDetail(parseInt(id));
      if (response.data) {
        // employmentPreferences가 없는 경우 기본값 설정
        const employmentPreferences = response.data.employmentPreferences || {
          isVeteran: false,
          isEmploymentProtected: false,
          isEmploymentSupport: false,
          isDisabled: false,
          disabledGrade: "",
          hasMilitaryService: false,
          militaryServiceStatus: "",
          militaryServiceJoinDate: "",
          militaryServiceOutDate: "",
          militaryServiceClass: "",
        };

        setResume({
          ...resume,
          ...response.data,
          // 배열 데이터에 대한 기본값 설정
          educations: response.data.educations || [],
          languages: response.data.languages || [],
          careers: response.data.careers || [],
          activities: response.data.activities || [],
          apostilles: response.data.apostilles || [],
          certifications: response.data.certifications || [],
          awards: response.data.awards || [],
          employmentPreferences: {
            isVeteran: false,
            isEmploymentProtected: false,
            isEmploymentSupport: false,
            isDisabled: false,
            disabledGrade: "",
            hasMilitaryService: false,
            militaryServiceStatus: "",
            militaryServiceJoinDate: "",
            militaryServiceOutDate: "",
            militaryServiceClass: "",
            ...response.data.employmentPreferences,
          },
          selfIntroductions: response.data.selfIntroductions || [],
        });
      }
    } catch (err) {
      navigate("/notfound");
      console.error("이력서 상세 조회 실패:", err);
    }
  };

  const openSuggestionModal = () => {
    setIsSuggestionModalOpen(true);
  };

  const closeSuggestionModal = () => {
    setIsSuggestionModalOpen(false);
  };

  const openScrapModal = () => {
    if (!id) return;
    setScrapTalentId(parseInt(id));
    setIsScrapModalOpen(true);
  };

  const closeScrapModal = () => {
    setScrapTalentId(null);
    setIsScrapModalOpen(false);
  };

  const handleOpenProposalModal = () => {
    setShowProposalModal(true);
  };

  const handleCloseProposalModal = () => {
    setShowProposalModal(false);
  };

  const handleSubmitProposal = async (data: ProposalData) => {
    if (!id) return;

    try {
      const proposalData: ProposalRequestData = {
        jobseekerId: data.jobseekerId,
        userId: parseInt(id),
        position: data.position,
        message: data.message,
        positionInfo: data.positionInfo || "",
        manager: data.manager || "",
        jobPostId: data.jobPostId || 0,
      };

      await sendPositionProposal(proposalData);
      handleCloseProposalModal();
      alert("포지션 제안이 성공적으로 전송되었습니다.");
    } catch (err) {
      console.error("포지션 제안 실패:", err);
      //alert("포지션 제안 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };
  return (
    <div className="MobileMemberProfileView_container">
      <MetaTagHelmet title="이력서 상세" description="이력서 상세" />
      <MobileMainHeader />
      <div className="postHeader mt-20">{resume?.title}</div>
      <section className="profileSection">
        <div className="profileHeader">
          <div className="imgBox">
            <img
              src={resume?.picturePath || "/img/f_logo.png"}
              className={resume?.blind ? "blurred" : ""}
            />
          </div>
          <div className="column">
            <p className="blueLabel">
              {resume?.careerType && getCareerTypeText(resume.careerType)}
            </p>
            <p>{resume?.name}</p>
            <p>
              {formatGender(resume?.gender || "")}{" "}
              {formatBirthAndAge(resume?.birth || "")}
            </p>
          </div>
        </div>
        {resume?.blind && (
          <div className="blindMessage">
            <p>포지션 제안 수락 시, 연락처가 공개됩니다.</p>
            <button
              type="button"
              className="proposalButton"
              onClick={handleOpenProposalModal}
            >
              제안하기
              <i className="fa-solid fa-angle-right"></i>
            </button>
          </div>
        )}
        <div className={`infoGrid ${resume?.blind ? "blurred" : ""}`}>
          <div className="gridRow">
            <p>휴대폰</p>
            <p>{resume?.phone}</p>
          </div>{" "}
          <div className="gridRow">
            <p>영문이름</p>
            <p>{resume?.englishName}</p>
          </div>{" "}
          <div className="gridRow">
            <p>주소</p>
            <p>{resume?.address}</p>
          </div>{" "}
          <div className="gridRow">
            <p>국적</p>
            <p>{resume?.nationality}</p>
          </div>{" "}
          <div className="gridRow">
            <p>Email</p>
            <p>{resume?.email}</p>
          </div>{" "}
          {resume?.nationality !== "02000031" && (
            <div className="gridRow">
              <p>비자여부</p>
              <p>{resume?.visa}</p>
            </div>
          )}
        </div>
      </section>
      <section className="infoSection">
        <div className="gridRow">
          <p>학력</p>
          <div className="textColumn">
            <p>{resume?.educations[0]?.schoolName}</p>
            <p>{resume?.educations[0]?.department}</p>
          </div>
        </div>{" "}
        <div className="gridRow">
          <p>경력</p>
          <div className="textColumn">
            <p>{resume?.careers[0]?.companyName}</p>
            <p>
              {resume?.careers[0] &&
                formatPeriod(
                  calculatePeriod(
                    new Date(resume.careers[0]?.startDate),
                    new Date(resume.careers[0]?.endDate)
                  )
                )}
            </p>
          </div>
        </div>{" "}
        <div className="gridRow">
          <p>인턴/대외활동</p>
          <div className="textColumn">
            <p>{resume?.activities[0]?.organizationName}</p>
            <p>
              {resume?.activities[0] &&
                formatPeriod(
                  calculatePeriod(
                    new Date(resume.activities[0]?.startDate),
                    new Date(resume.activities[0]?.endDate)
                  )
                )}
            </p>
          </div>
        </div>{" "}
        <div className="gridRow">
          <p>자격증/어학</p>
          <div className="textColumn">
            <p>{resume?.languages[0]?.language}</p>
            <p>{resume?.languages[0]?.speakingLevel}</p>
          </div>
        </div>
      </section>
      {resume?.nationality !== "02000031" && (
        <>
          <p className="sectionHeader mt-20 mb-20">비자여부</p>
          <section className="visaSection">
            <p>{resume?.visa}</p>
          </section>
        </>
      )}
      <p className="sectionHeader mt-20 mb-20">학력</p>
      <section className="listSection">
        <ul>
          {resume?.educations.map((education, index) => (
            <li>
              <p>
                {formatDate(new Date(education.admissionDate), "yyyy.MM")}~
                {formatDate(new Date(education.graduationDate), "yyyy.MM")}
                <strong className="blueLabel">
                  {
                    GraduationStatusText[
                      education.graduationStatus as GraduationStatus
                    ]
                  }
                </strong>
              </p>
              <p>
                <strong>{education.schoolName}</strong>({education.department})
              </p>
              {/* <p>학점 3.7/4.0</p> */}
            </li>
          ))}
        </ul>
      </section>
      <p className="sectionHeader mt-20 mb-20">어학능력</p>
      <section className="langSkillSection">
        {resume?.languages.map((language, index) => (
          <div className="row">
            <div>{language.language}</div>
            <div>
              <p>
                <strong>회화수준</strong> | {language.speakingLevel}
              </p>{" "}
              <p>
                <strong>작문수준</strong> | {language.writingLevel}
              </p>{" "}
              <p>
                <strong>독해수준</strong> | {language.readingLevel}
              </p>
            </div>
          </div>
        ))}
      </section>
      <p className="sectionHeader mt-20 mb-20">경력</p>
      <section className="listSection">
        <ul>
          {resume?.careers.map((career, index) => (
            <li>
              <p>
                {formatDate(new Date(career.startDate), "yyyy.MM")}~
                {career.endDate
                  ? formatDate(new Date(career.endDate), "yyyy.MM")
                  : "재직중"}
              </p>
              <p>
                <strong>{career.companyName}</strong>({career.jobTitle})
              </p>
              <p>{career.responsibilities}</p>
            </li>
          ))}
        </ul>
      </section>{" "}
      <p className="sectionHeader mt-20 mb-20">인턴/대외활동</p>
      <section className="listSection">
        <ul>
          {resume?.activities.map((activity, index) => (
            <li>
              <p>
                {formatDate(new Date(activity.startDate), "yyyy.MM")}~
                {activity.endDate
                  ? formatDate(new Date(activity.endDate), "yyyy.MM")
                  : "재직중"}
                <strong className="blueLabel">
                  {formatPeriod(
                    calculatePeriod(
                      new Date(activity.startDate),
                      new Date(activity.endDate)
                    )
                  )}
                </strong>
              </p>
              <p>
                <strong>{activity.organizationName}</strong>
                {activity.activityType}
              </p>
              <p>{activity.description}</p>
            </li>
          ))}
        </ul>
      </section>
      <p className="sectionHeader mt-20 mb-20">아포스티유</p>
      <div className="internFile">
        <img src="/img/mobile/file.svg" />
        {resume?.apostilles.length === 0 ? (
          <p>등록된 아포스티유가 없습니다.</p>
        ) : (
          resume?.apostilles.map((apostille, index) => (
            <p
              key={`apostille-${index}`}
              style={{ cursor: "pointer" }}
              onClick={() => {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(apostille.file!);
                link.download = apostille.file!.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
              }}
            >
              <i className="fa-regular fa-file-lines"></i>
              {apostille.file?.name}
            </p>
          ))
        )}
      </div>
      <p className="sectionHeader mt-20 mb-20">자격증</p>
      <section className="listSection">
        <ul>
          {resume?.certifications.map((certification, index) => (
            <li>
              <p>
                {" "}
                {formatDate(new Date(certification.acquisitionDate), "yyyy.MM")}
              </p>
              <p>
                <strong>{certification.certificationName}</strong>
                {certification.issuingOrganization}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <p className="sectionHeader mt-20 mb-20">수상</p>
      <section className="listSection">
        <ul>
          {resume?.awards.map((award, index) => (
            <li>
              <p>{formatDate(new Date(award.awardYear), "yyyy")}</p>
              <p>
                <strong>{award.awardName}</strong>({award.awardingOrganization})
              </p>
              <p>{award.description}</p>
            </li>
          ))}
        </ul>
      </section>
      <p className="sectionHeader mt-20 mb-20">취업우대·병역</p>
      <section className="prioritySection">
        <div className="gridSection">
          <div className="gridRow">보훈대상 여부</div>
          <div className="gridRow">
            {resume?.employmentPreferences.isVeteran
              ? "보훈대상자"
              : "비보훈대상자"}
          </div>
          <div className="gridRow">취업보호대상 여부</div>
          <div className="gridRow">
            {resume?.employmentPreferences.isEmploymentProtected
              ? "취업보호대상자"
              : "비취업보호대상자"}
          </div>
          <div className="gridRow">고용지원금대상 여부</div>
          <div className="gridRow">
            {resume?.employmentPreferences.isEmploymentSupport
              ? "고용지원금대상자"
              : "비고용지원금대상자"}
          </div>
          <div className="gridRow">병역사항</div>
          <div className="gridRow">
            {resume?.employmentPreferences.hasMilitaryService
              ? "[군필]"
              : "[미필]"}{" "}
            {resume?.employmentPreferences.hasMilitaryService && (
              <>
                {formatDate(
                  new Date(
                    resume?.employmentPreferences.militaryServiceJoinDate
                  ),
                  "yyyy.MM"
                )}
                ~
                {formatDate(
                  new Date(
                    resume?.employmentPreferences.militaryServiceOutDate
                  ),
                  "yyyy.MM"
                )}
                {
                  MilitaryServiceClassText[
                    resume?.employmentPreferences
                      .militaryServiceClass as MilitaryServiceClass
                  ]
                }
                {
                  MilitaryServiceStatusText[
                    resume?.employmentPreferences
                      .militaryServiceStatus as MilitaryServiceStatus
                  ]
                }
              </>
            )}
          </div>
          <div className="gridRow">장애여부</div>
          <div className="gridRow">
            {resume?.employmentPreferences.isDisabled
              ? getDisabledGradeText(
                  resume?.employmentPreferences.disabledGrade as DisabledGrade
                )
              : "비장애"}
          </div>
        </div>
      </section>
      <p className="sectionHeader mt-20 mb-20">자기소개서</p>
      {resume?.selfIntroductions.map((selfIntroduction, index) => (
        <div className="reportSection">
          <strong>{selfIntroduction.title}</strong>
          <p>{selfIntroduction.content}</p>
        </div>
      ))}
      <MainFooter />
    </div>
  );
}
