import { useEffect, useState } from "react";

import "./NewResumeDetail.css";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { resumeApi } from "../../../api/resume";
import { sendPositionProposal } from "../../../api/talentApi";
import {
  CorporateResumeForm,
  DisabledGrade,
  getDisabledGradeText,
  getInternTypeText,
} from "../../../types/resume";
import { ProposalData, ProposalRequestData } from "../../../types/talent";
import {
  formatBirthYear,
  formatAge,
  calculateMonthPeriod,
} from "../../../utils/dateUtils";
import { formatBirthAndAge, formatGender } from "../../../utils/formatUtils";
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
} from "../../../app/dummy/options";
import Layout from "../../layout/Layout";
import {
  fetchOperationCodeData,
  mapOperationCodesToLabels,
} from "../../../services/mapCodesToLabels";
import { OperationData } from "../../../api/jobpostData";
import { MetaTagHelmet } from "../../common/MetaTagHelmet";
export default function NewResumeDetail() {
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
  const [regions, setRegions] = useState<OperationData[]>([]);
  useEffect(() => {
    fetchOperationCodeData("00000002").then((res) => {
      setRegions(res.content);
    });
  }, []);
  return (
    <Layout>
      <MetaTagHelmet title="이력서 상세" description="이력서 상세" />
      <div className="page-bg">
        <div className="newResumeDetailContainer">
          <div className="header">
            <h2>{resume.title}</h2>
          </div>
          {/* Profile */}
          <section className="profileSection">
            <div className="profileImg">
              <img
                src={resume.picturePath}
                className={
                  isPageInScrapOrLatest && resume.blind ? "blurred" : ""
                }
                alt="프로필 사진"
              />
            </div>
            <div className="content">
              <p>
                <strong>{resume.name}</strong>
                {`${formatGender(resume.gender)}${formatBirthAndAge(
                  resume.birth.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3")
                )}`}
              </p>
              <div className="grid">
                <div className="gridRow">
                  <p className="title">영문이름</p>|
                  <p className="desc">{resume.englishName}</p>
                </div>
                <div className="gridRow">
                  <p className="title">휴대폰</p>|
                  <p className="desc">{resume.phone}</p>
                </div>
                <div className="gridRow">
                  <p className="title">주소</p>|
                  <p className="desc">{resume.address}</p>
                </div>
                <div className="gridRow">
                  <p className="title">국적</p>|
                  <p className="desc">
                    {mapOperationCodesToLabels([resume.nationality], regions)}
                  </p>
                </div>
                <div className="gridRow">
                  <p className="title">Email</p>|
                  <p className="desc">{resume.email}</p>
                </div>
                {resume.nationality !== "02000031" && (
                  <div className="gridRow">
                    <p className="title">비자여부</p>|
                    <p className="desc">{resume.visa}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
          {/* Profile End */}
          {/* Summary Section */}
          <section className="summarySection">
            <div className="info">
              <div className="item">
                <p>학력</p>
                <p>{resume.educations?.[0]?.schoolName ?? "-"}</p>
                <p>
                  {GraduationStatusText[
                    resume.educations?.[0]?.graduationStatus as GraduationStatus
                  ] ?? "-"}
                </p>
              </div>
              <div className="divider" />
              <div className="item">
                <p>경력</p>
                <p>{resume.careers?.[0]?.companyName ?? "-"}</p>
                <p>
                  {resume.careers?.[0]
                    ? resume.careers[0].isCurrent
                      ? calculateMonthPeriod(resume.careers[0].startDate)
                      : calculateMonthPeriod(
                          resume.careers[0].startDate,
                          resume.careers[0].endDate
                        )
                    : "-"}
                </p>
              </div>
              <div className="divider" />
              <div className="item">
                <p>인턴 대외활동 / 해외경험</p>
                <p>{`${resume.activities?.[0]?.organizationName ?? "-"} ${
                  getInternTypeText(
                    resume.activities?.[0]?.activityType as InternType
                  ) ?? ""
                }`}</p>
                <p>
                  {resume.activities?.[0]
                    ? calculateMonthPeriod(
                        resume.activities[0].startDate,
                        resume.activities[0].endDate
                      )
                    : "-"}
                </p>
              </div>
              <div className="divider" />
              <div className="item black">
                <p>자격증 / 어학</p>
                <p>
                  {
                    LanguageTypeText[
                      resume.languages?.[0]?.language as LanguageType
                    ]
                  }
                </p>
                <p>
                  {
                    LanguageLevelText[
                      resume.languages?.[0]?.speakingLevel as LanguageLevel
                    ]
                  }
                </p>
                {/* <p style={{ color: "#888" }}>외 1</p> */}
              </div>
            </div>
          </section>
          {/* Summary Section End */}
          {/* EducationSection */}
          <h3 className="sectionTitle">학력</h3>
          <section className="educationSection">
            {resume.educations && resume.educations.length > 0 && (
              <>
                {resume.educations.map((edu, index) => (
                  <div className="row" key={`education-${index}`}>
                    <div className="rowTitle" style={{ width: "180px" }}>
                      <p>
                        {edu.admissionDate}~{edu.graduationDate}
                      </p>
                      <p className="graduate">
                        {
                          GraduationStatusText[
                            edu.graduationStatus as GraduationStatus
                          ]
                        }
                      </p>
                    </div>
                    <div className="rowDesc">
                      <p className="name">
                        <strong>{edu.schoolName}</strong>
                        &nbsp;&nbsp;{edu.department}
                        {edu.additionalMajor && <>{edu.additionalMajor}</>}
                      </p>

                      <div className="descRow">
                        <p className="title">학점</p>|
                        <p className="desc">{edu.gpa} / 4.5</p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </section>
          {/* EducationSectionEnd */}
          {/* VisaSection */}
          {resume.nationality !== "02000031" && (
            <>
              <h3 className="sectionTitle">비자여부</h3>
              <section className="visaSection">
                <div className="row">
                  <div className="rowTitle"></div>
                  <div className="rowDesc">
                    <p className="name">
                      {resume.visa && <strong>{resume.visa}</strong>}
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}
          {/* VisaSection End*/}
          {/* Language Section */}
          <h3 className="sectionTitle">어학</h3>
          <section className="languageSection">
            {resume.languages && (
              <>
                {resume.languages.map((lang, index) => (
                  <div className="row" key={`language-${index}`}>
                    <div className="rowTitle">
                      <p>{LanguageTypeText[lang.language as LanguageType]}</p>
                    </div>
                    <div className="rowDesc">
                      <div className="descRow">
                        <p className="title">회화수준</p>|
                        <p className="desc">
                          {
                            LanguageLevelText[
                              lang.speakingLevel as LanguageLevel
                            ]
                          }
                        </p>
                      </div>
                      <div className="descRow">
                        <p className="title">작문수준</p>|
                        <p className="desc">
                          {
                            LanguageLevelText[
                              lang.writingLevel as LanguageLevel
                            ]
                          }
                        </p>
                      </div>
                      <div className="descRow">
                        <p className="title">독해수준</p>|
                        <p className="desc">
                          {
                            LanguageLevelText[
                              lang.readingLevel as LanguageLevel
                            ]
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </section>
          {/* Language Section ENd */}
          {/* Career Section */}
          <h3 className="sectionTitle">경력</h3>
          <section className="careerSection">
            {resume.careers && resume.careers.length > 0 && (
              <>
                {resume.careers.map((career, index) => (
                  <div className="row" key={`career-${index}`}>
                    <div className="rowTitle">
                      <p>
                        {career.startDate}~
                        {career.isCurrent ? "재직중" : career.endDate}
                      </p>
                      {!career.isCurrent && (
                        <p>
                          {calculateMonthPeriod(
                            career.startDate,
                            career.endDate
                          )}
                        </p>
                      )}
                    </div>
                    <div className="rowDesc">
                      <p className="name">
                        <strong>{career.companyName}</strong>&nbsp;&nbsp;
                        {career.jobTitle} {career.position}
                      </p>
                      <div className="descRow">
                        <p className="desc">{career.responsibilities}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </section>
          {/* Career Section ENd */}
          {/* ExperienceSection */}
          <h3 className="sectionTitle">인턴/대외활동</h3>
          <section className="experienceSection">
            {resume.activities && resume.activities.length > 0 && (
              <>
                {resume.activities.map((activity, index) => (
                  <div className="row" key={`activity-${index}`}>
                    <div className="rowTitle" style={{ width: "180px" }}>
                      <p>
                        {" "}
                        {activity.startDate}~{activity.endDate}
                      </p>
                      <p className="graduate">
                        {calculateMonthPeriod(
                          activity.startDate,
                          activity.endDate
                        )}
                      </p>
                    </div>
                    <div className="rowDesc">
                      <p className="name">
                        <strong>{activity.organizationName}</strong>&nbsp;&nbsp;
                        {getInternTypeText(activity.activityType as InternType)}
                      </p>

                      <div className="descRow">
                        <p className="desc">{activity.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </section>
          {/* EducationSectionEnd */}
          {/* ExperienceSection */}
          <h3 className="sectionTitle">자격증</h3>
          <section className="experienceSection">
            {resume.certifications && resume.certifications.length > 0 && (
              <>
                {resume.certifications.map((cert, index) => (
                  <div className="row" key={`certification-${index}`}>
                    <div className="rowTitle">
                      <p>{cert.acquisitionDate}</p>
                    </div>
                    <div className="rowDesc">
                      <p className="name">
                        <strong>{cert.certificationName}</strong>
                        &nbsp;&nbsp;{cert.issuingOrganization}
                      </p>

                      <div className="descRow">
                        <p className="desc"></p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </section>
          {/* EducationSectionEnd */}
          {/* ExperienceSection */}
          <h3 className="sectionTitle">수상</h3>
          <section className="experienceSection">
            {resume.awards && resume.awards.length > 0 && (
              <>
                {resume.awards.map((award, index) => (
                  <div className="row" key={`award-${index}`}>
                    <div className="rowTitle">
                      <p>{award.awardYear}</p>
                    </div>
                    <div className="rowDesc">
                      <p className="name">
                        <strong>{award.awardName}</strong>&nbsp;&nbsp;
                        {award.awardingOrganization}
                      </p>

                      <div className="descRow">
                        <p className="desc">{award.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </section>
          {/* EducationSectionEnd */}
          <h3 className="sectionTitle">취업우대·병역</h3>
          <div className="military">
            <table>
              <tbody>
                <tr>
                  <th>보훈대상 여부</th>
                  <td>
                    {resume.employmentPreferences?.isVeteran
                      ? "보훈대상자"
                      : "비보훈대상자"}
                  </td>
                  <th>취업보호대상 여부</th>
                  <td>
                    {resume.employmentPreferences?.isEmploymentProtected
                      ? "취업보호대상자"
                      : "비취업보호대상자"}
                  </td>
                  <th>고용지원금대상 여부</th>
                  <td>
                    {resume.employmentPreferences?.isEmploymentSupport
                      ? "고용지원금대상자"
                      : "비고용지원금대상자"}
                  </td>
                </tr>
                <tr>
                  <th>병역사항</th>
                  <td colSpan={3}>
                    {resume.employmentPreferences?.hasMilitaryService
                      ? `[${
                          MilitaryServiceStatusText[
                            resume.employmentPreferences
                              ?.militaryServiceStatus as MilitaryServiceStatus
                          ]
                        }]
                        ${
                          resume.employmentPreferences?.militaryServiceJoinDate
                        }~
                        ${resume.employmentPreferences?.militaryServiceOutDate} 
                        ${
                          MilitaryServiceClassText[
                            resume.employmentPreferences
                              ?.militaryServiceClass as MilitaryServiceClass
                          ]
                        } 제대`
                      : "해당없음"}
                  </td>
                  <th>장애여부</th>
                  <td>
                    {resume.employmentPreferences?.isDisabled
                      ? getDisabledGradeText(
                          resume.employmentPreferences
                            ?.disabledGrade as DisabledGrade
                        )
                      : "비장애"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 className="sectionTitle">자기소개서</h3>
          <section className="selfIntroduceSection">
            {resume.selfIntroductions &&
              resume.selfIntroductions.length > 0 && (
                <>
                  {resume.selfIntroductions.map((intro, index) => (
                    <div key={`intro-${index}`}>
                      <p className="selfTitle">{intro.title}</p>
                      <pre
                        className="selfDesc"
                        dangerouslySetInnerHTML={{ __html: intro.content }}
                      ></pre>
                    </div>
                  ))}
                </>
              )}
          </section>
          <div className="sign" style={{ marginBottom: "100px" }}>
            <p>위의 모든 기재사항은 사실과 다름없음을 확인합니다.</p>
            <p>작성자: {resume.name}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
