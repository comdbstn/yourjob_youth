import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { resumeApi } from "../../../../api/resume";
import { sendPositionProposal } from "../../../../api/talentApi";
import {
  CorporateResumeForm,
  DisabledGrade,
  getDisabledGradeText,
  getInternTypeText,
} from "../../../../types/resume";
import { ProposalData, ProposalRequestData } from "../../../../types/talent";
import Layout from "../../../layout/CorpLayout";
import MainFooter from "../../../mobile/components/MainFooter/MainFooter";
import MobileMainHeader from "../../../mobile/components/MainHeader/MainHeader";
import "./MobileNewResumeDetail.css";
import {
  formatBirthYear,
  formatAge,
  calculateMonthPeriod,
  formatDate,
} from "../../../../utils/dateUtils";
import { formatGender } from "../../../../utils/formatUtils";
import {
  GraduationStatusText,
  GraduationStatus,
  LanguageType,
  LanguageTypeText,
  LanguageLevel,
  LanguageLevelText,
  MilitaryServiceClass,
  MilitaryServiceClassText,
  MilitaryServiceStatus,
  MilitaryServiceStatusText,
  internTypeOptions,
  InternType,
} from "../../../../app/dummy/options";
import { MetaTagHelmet } from "../../../common/MetaTagHelmet";
export default function MobileNewResumeDetail() {
  const navigate = useNavigate();
  useEffect(() => {
    document.body.classList.add("new-resume-detail");
    return () => {
      document.body.classList.remove("new-resume-detail");
    };
  }, []);
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
        console.log(response.data);

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
    <div className="mobileNewResumeDetailContainer">
      <MetaTagHelmet title="이력서 상세" description="이력서 상세" />
      <MobileMainHeader />
      <div className="wrapper">
        <section className="summarySection">
          <div className="header">
            <p>{resume.title}</p>
          </div>
          <div className="content">
            <div className="applicant">
              <div className="profileImg">
                <img
                  src={resume.picturePath}
                  className={
                    isPageInScrapOrLatest && resume.blind ? "blurred" : ""
                  }
                  alt="프로필 사진"
                />
              </div>
              <div className="texts">
                <div>
                  <p>
                    <strong>{resume.name}</strong>&nbsp;{" "}
                    {`${formatGender(resume.gender)} ${formatBirthYear(
                      resume.birth
                    )}${formatAge(resume.birth)}`}
                  </p>
                </div>
                <p>
                  <span>Phone</span> {resume.phone}
                </p>
                <p>
                  <span>Mail</span> {resume.email}
                </p>
                <p>
                  <span>Address</span> {resume.address}
                </p>
              </div>
            </div>
            <div className="list">
              <ul>
                <li>
                  {resume.educations?.[0]?.schoolName ?? "-"}{" "}
                  {GraduationStatusText[
                    resume.educations?.[0]?.graduationStatus as GraduationStatus
                  ] ?? "-"}
                </li>
                <li>
                  경력{" "}
                  {resume.careers?.[0]
                    ? resume.careers[0].isCurrent
                      ? calculateMonthPeriod(resume.careers[0].startDate)
                      : calculateMonthPeriod(
                          resume.careers[0].startDate,
                          resume.careers[0].endDate
                        )
                    : "-"}
                </li>
              </ul>
            </div>
          </div>
        </section>
        <section className="educationSection">
          <div className="header">
            <p>학력</p>
            {/* <p className="blueLabel">대학교(4년) 졸업</p> */}
          </div>
          <div className="content">
            {resume.educations && resume.educations.length > 0 && (
              <>
                {resume.educations.map((edu, index) => (
                  <div className="row">
                    <p className="title">{edu.schoolName}</p>
                    <ul>
                      <li>
                        <span>기간</span>
                        <p>
                          {edu.admissionDate}~{edu.graduationDate}
                        </p>
                      </li>
                      <li>
                        <span>주전공</span>
                        <p>{edu.department}</p>
                      </li>
                      <li>
                        <span>학점</span>
                        <p>{edu.gpa}/4.5</p>
                      </li>
                    </ul>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>

        {resume.nationality !== "02000031" && (
          <section className="visaSection">
            <div className="header">
              <p>비자여부</p>
            </div>
            <div className="content">
              <div className="row">
                <p className="title">{resume.visa && resume.visa}</p>
              </div>
            </div>
          </section>
        )}
        <section className="languageSection">
          <div className="header">
            <p>어학능력</p>
          </div>
          <div className="content">
            {resume.languages && (
              <>
                {resume.languages.map((lang, index) => (
                  <div className="row">
                    <p className="title">
                      {LanguageTypeText[lang.language as LanguageType]}
                    </p>
                    <ul>
                      <li>
                        <span>회화수준</span>
                        <p>
                          {" "}
                          {
                            LanguageLevelText[
                              lang.speakingLevel as LanguageLevel
                            ]
                          }
                        </p>
                      </li>
                      <li>
                        <span>작문수준</span>
                        <p>
                          {" "}
                          {
                            LanguageLevelText[
                              lang.writingLevel as LanguageLevel
                            ]
                          }
                        </p>
                      </li>
                      <li>
                        <span>독해수준</span>
                        <p>
                          {" "}
                          {
                            LanguageLevelText[
                              lang.readingLevel as LanguageLevel
                            ]
                          }
                        </p>
                      </li>
                    </ul>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>
        <section className="careerSection">
          <div className="header">
            <p>경력</p>
          </div>
          <div className="content">
            {resume.careers && (
              <>
                {resume.careers.map((career, index) => (
                  <div className="row">
                    <p className="title">{career.companyName}</p>
                    <ul>
                      <li>
                        <span>기간</span>
                        <p>
                          {" "}
                          {career.startDate}~
                          {career.isCurrent ? "재직중" : career.endDate}
                        </p>
                      </li>
                      <li>
                        <span>담당 업무명</span>
                        <p>{career.jobTitle}</p>
                      </li>
                      <li>
                        <span>업무 설명</span>
                        <p>
                          {career.position} {career.responsibilities}
                        </p>
                      </li>
                    </ul>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>
        <section className="careerSection">
          <div className="header">
            <p>인턴/대외활동</p>
          </div>
          <div className="content">
            {resume.activities && (
              <>
                {resume.activities.map((activity, index) => (
                  <div className="row">
                    <p className="title">인턴단체명</p>
                    <ul>
                      <li>
                        <span>{activity.organizationName}</span>
                        <p>
                          {activity.startDate}~{activity.endDate}{" "}
                          {calculateMonthPeriod(
                            activity.startDate,
                            activity.endDate
                          )}
                        </p>
                      </li>
                      <li>
                        <span>담당업무</span>
                        <p>
                          {getInternTypeText(
                            activity.activityType as InternType
                          )}
                        </p>
                      </li>
                      <li>
                        <span>업무 설명</span>
                        <p>{activity.description}</p>
                      </li>
                    </ul>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>
        <section className="careerSection">
          <div className="header">
            <p>자격증</p>
          </div>
          <div className="content">
            {resume.certifications && (
              <>
                {resume.certifications.map((cert, index) => (
                  <div className="row">
                    <p className="title">{cert.certificationName}</p>
                    <ul>
                      <li>
                        <span>발급기관</span>
                        <p>{cert.issuingOrganization}</p>
                      </li>
                    </ul>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>
        <section className="careerSection">
          <div className="header">
            <p>수상</p>
          </div>
          <div className="content">
            {resume.awards && (
              <>
                {resume.awards.map((award, index) => (
                  <div className="row">
                    <p className="title">{award.awardName}</p>
                    <ul>
                      <li>
                        <span>수여기관</span>
                        <p>{award.awardingOrganization}</p>
                      </li>
                      <li>
                        <span>설명</span>
                        <p>{award.description}</p>
                      </li>
                    </ul>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>
        <section className="careerSection">
          <div className="header">
            <p>취업우대·병역</p>
          </div>
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

        <section className="introduceSection">
          <div className="header">
            <p>자기소개서</p>
          </div>
          <div className="content">
            {resume.selfIntroductions && (
              <>
                {resume.selfIntroductions.map((intro, index) => (
                  <div>
                    <p className="introduceTitle">자기소개서 {intro.title}</p>
                    <pre
                      dangerouslySetInnerHTML={{ __html: intro.content }}
                    ></pre>{" "}
                  </div>
                ))}
              </>
            )}
          </div>
        </section>
      </div>
      <MainFooter />
    </div>
  );
}
