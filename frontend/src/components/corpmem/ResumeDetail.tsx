import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import CorpLayout from "../layout/CorpLayout";
import "../../../public/css/corpmypage.css";
import "../../../public/css/nice-select.css";
import { resumeApi } from "../../api/resume";
import {
  CorporateResumeForm,
  DisabledGrade,
  getDisabledGradeText,
} from "../../types/resume";
import {
  calculateAge,
  calculateMonthPeriod,
  formatAge,
  formatBirthYear,
  formatDate,
} from "../../utils/dateUtils";
import SuggestionModal from "../common/SuggestionModal";
import TalentScrapModal from "./TalentScrapModal";
import ProposalModal from "./ProposalModal";
import { sendPositionProposal } from "../../api/talentApi";
import { ProposalData, ProposalRequestData } from "../../types/talent";
import {
  LanguageTypeText,
  LanguageType,
  LanguageLevel,
  LanguageLevelText,
  MilitaryServiceClassText,
  MilitaryServiceStatus,
  MilitaryServiceStatusText,
  MilitaryServiceClass,
  GraduationStatus,
  GraduationStatusText,
} from "../../app/dummy/options";
import { formatBirthAndAge, formatGender } from "../../utils/formatUtils";
import { useAlert } from "../../contexts/AlertContext";
import { Helmet } from "react-helmet-async";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const ResumeDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { customAlert } = useAlert();
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
      customAlert({
        content: "포지션 제안이 성공적으로 전송되었습니다.",
      });
    } catch (err) {
      console.error("포지션 제안 실패:", err);
      //alert('포지션 제안 전송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <CorpLayout>
      <MetaTagHelmet title="이력서 상세" description="이력서 상세" />
      <div className="container-center-horizontal">
        <div className="crop-wrap screen">
          <div className="container">
            <div className="head_txt">{resume.title}</div>

            {/* 지원자 기본정보 */}
            <div className="Profile">
              <div className="picture">
                <img
                  src={resume.picturePath}
                  className={resume.blind ? "blurred" : ""}
                  alt="프로필 사진"
                />
              </div>
              <div className="user-profile">
                {/* 스크랩인재, 최근본인재일 때 노출 */}
                {resume.blind && (
                  <>
                    {resume.responseStatus === "REJECTED" ? (
                      <div className="Accept_Message">
                        <p>
                          포지션 제안을 거절하여 연락처가 공개되지 않습니다.
                        </p>
                      </div>
                    ) : (
                      <div className="Accept_Message">
                        <p>포지션 제안 수락 시, 연락처가 공개됩니다.</p>
                        <button
                          type="button"
                          className="stxt"
                          id="suggestion"
                          onClick={handleOpenProposalModal}
                        >
                          제안하기
                          <i className="fa-solid fa-angle-right"></i>
                        </button>
                      </div>
                    )}
                  </>
                )}
                {/* 스크랩인재, 최근본인재일 때 노출 end */}

                <div className="user-profile_row">
                  <div className="user-profile_name-container">
                    <div className="user-profile_name">{resume.name}</div>
                    <span>{`${formatGender(resume.gender)} ${formatBirthAndAge(
                      resume.birth.replace(
                        /^(\d{4})(\d{2})(\d{2})$/,
                        "$1-$2-$3"
                      )
                    )}`}</span>
                    <span className="pspan">
                      {resume.careerType === "JUNIOR" ? "신입" : "경력"}
                    </span>
                  </div>
                </div>
                <div
                  className={`user-profile_detail-contents ${
                    resume.blind ? "blurred" : ""
                  }`}
                >
                  <div className="profile_detail">
                    <div className="user-profile_list-container">
                      <dl>
                        <dt>휴대폰</dt>
                        <dd>{resume.phone}</dd>
                      </dl>
                      <dl>
                        <dt>영문이름</dt>
                        <dd>{resume.englishName}</dd>
                      </dl>
                    </div>
                  </div>
                  <div className="profile_detail">
                    <div className="user-profile_list-container">
                      <dl>
                        <dt>주소</dt>
                        <dd>{resume.address}</dd>
                      </dl>
                      <dl>
                        <dt>국적</dt>
                        <dd>{resume.nationality}</dd>
                      </dl>
                    </div>
                  </div>
                  <div className="profile_detail">
                    <div className="user-profile_list-container">
                      <dl>
                        <dt>Email</dt>
                        <dd>{resume.email}</dd>
                      </dl>
                      {resume.nationality !== "02000031" && (
                        <dl>
                          <dt>비자여부</dt>
                          <dd>{resume.visa}</dd>
                        </dl>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="Profile_card">
              <div className="card items-direction">
                <h1>학력</h1>
                <h2>{resume.educations?.[0]?.schoolName ?? "-"}</h2>
                <h3>
                  {GraduationStatusText[
                    resume.educations?.[0]?.graduationStatus as GraduationStatus
                  ] ?? "-"}
                </h3>
              </div>
              <div className="card items-direction">
                <h1>경력</h1>
                <h2>{resume.careers?.[0]?.companyName ?? "-"}</h2>
                <h3>
                  {resume.careers?.[0]
                    ? resume.careers[0].isCurrent
                      ? calculateMonthPeriod(resume.careers[0].startDate)
                      : calculateMonthPeriod(
                          resume.careers[0].startDate,
                          resume.careers[0].endDate
                        )
                    : "-"}
                </h3>
              </div>
              <div className="card items-direction">
                <h1>인턴/대외활동</h1>
                <h2>{`${resume.activities?.[0]?.organizationName ?? "-"} ${
                  resume.activities?.[0]?.activityType ?? ""
                }`}</h2>
                <h3>
                  {resume.activities?.[0]
                    ? calculateMonthPeriod(
                        resume.activities[0].startDate,
                        resume.activities[0].endDate
                      )
                    : "-"}
                </h3>
              </div>
              <div className="card items-direction">
                <h1>자격증/어학</h1>
                <h2>
                  {
                    LanguageTypeText[
                      resume.languages?.[0]?.language as LanguageType
                    ]
                  }
                </h2>
                <h3>
                  {
                    LanguageLevelText[
                      resume.languages?.[0]?.speakingLevel as LanguageLevel
                    ]
                  }
                </h3>
              </div>
            </div>

            {/* 비자여부 */}
            {resume.nationality !== "02000031" && (
              <>
                <div className="sub_txt">비자여부</div>
                <div className="Profile_card">
                  <div className="card full">
                    <div className="visastat">
                      {resume.visa && <p>{resume.visa}</p>}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 학력 */}
            {resume.educations && resume.educations.length > 0 && (
              <>
                <div className="sub_txt">학력</div>
                <div className="Profile_card">
                  <div className="card full pd02">
                    <div className="eduBox items-direction">
                      {(resume.educations ?? []).map((edu, index) => (
                        <ul className="list" key={index}>
                          <li>
                            <div className="years">
                              {formatDate(
                                new Date(edu.admissionDate),
                                "yyyy.MM"
                              )}
                              ~
                              {formatDate(
                                new Date(edu.graduationDate),
                                "yyyy.MM"
                              )}
                              <p>
                                {
                                  GraduationStatusText[
                                    edu.graduationStatus as GraduationStatus
                                  ]
                                }
                              </p>
                              {edu?.transferStatus && <p>편입</p>}
                            </div>
                          </li>
                          <li>
                            <div className="schbox">
                              <div className="group">
                                <p className="txt01">{edu.schoolName}</p>
                                <p className="txt02">{edu.department}</p>
                              </div>
                              {edu.additionalMajor && (
                                <div className="group gap20">
                                  <p className="txt02 line">부전공</p>
                                  <p className="txt02">{edu.additionalMajor}</p>
                                </div>
                              )}
                            </div>
                          </li>
                          <li>
                            <div className="gpa">
                              학점 {edu.gpa} / {edu.totalCredits}
                            </div>
                          </li>
                        </ul>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 어학능력 */}
            {resume.languages && resume.languages.length > 0 && (
              <>
                <div className="sub_txt">어학능력</div>
                <div className="Profile_card">
                  <div className="card full pd02">
                    <div className="langBox items-direction">
                      {(resume.languages ?? []).map((lang, index) => (
                        <ul className="list" key={index}>
                          <li>
                            <div className="language">
                              {LanguageTypeText[lang.language as LanguageType]}
                            </div>
                          </li>
                          <li>
                            <div className="ability">
                              <div className="group">
                                <p className="txt01">회화수준</p>
                                <p className="txt02">
                                  {
                                    LanguageLevelText[
                                      lang.speakingLevel as LanguageLevel
                                    ]
                                  }
                                </p>
                              </div>
                              <div className="group">
                                <p className="txt01">작문수준</p>
                                <p className="txt02">
                                  {
                                    LanguageLevelText[
                                      lang.writingLevel as LanguageLevel
                                    ]
                                  }
                                </p>
                              </div>
                              <div className="group">
                                <p className="txt01">독해수준</p>
                                <p className="txt02">
                                  {
                                    LanguageLevelText[
                                      lang.readingLevel as LanguageLevel
                                    ]
                                  }
                                </p>
                              </div>
                            </div>
                          </li>
                        </ul>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 경력 */}

            {resume.careers && resume.careers.length > 0 && (
              <>
                <div className="sub_txt">경력</div>
                <div className="Profile_card">
                  <div className="card full pd02">
                    <div className="commBox items-direction">
                      {(resume.careers ?? []).map((career, index) => (
                        <ul className="list" key={index}>
                          <li>
                            <div className="years">
                              {career.startDate}~
                              {career.isCurrent ? "재직중" : career.endDate}
                              {!career.isCurrent && (
                                <p>
                                  {calculateMonthPeriod(
                                    career.startDate,
                                    career.endDate
                                  )}
                                </p>
                              )}
                            </div>
                          </li>
                          <li>
                            <div className="commchild gap5">
                              <div className="group">
                                <p className="txt01">{career.companyName}</p>
                                <p className="txt02">
                                  {career.jobTitle} {career.position}
                                </p>
                              </div>
                              <div className="group gap20">
                                <p className="txt02">
                                  {career.responsibilities}
                                </p>
                              </div>
                            </div>
                          </li>
                        </ul>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 인턴/대외활동 */}
            {resume.activities && resume.activities.length > 0 && (
              <>
                <div className="sub_txt">인턴/대외활동</div>
                <div className="Profile_card">
                  <div className="card full pd02">
                    <div className="commBox items-direction">
                      {(resume.activities ?? []).map((activity, index) => (
                        <ul className="list" key={index}>
                          <li>
                            <div className="years">
                              {activity.startDate}~{activity.endDate}
                              <p>
                                {calculateMonthPeriod(
                                  activity.startDate,
                                  activity.endDate
                                )}
                              </p>
                            </div>
                          </li>
                          <li>
                            <div className="commchild gap5">
                              <div className="group">
                                <p className="txt01">
                                  {activity.organizationName}
                                </p>
                                <p className="txt02">{activity.activityType}</p>
                              </div>
                              <div className="group gap20">
                                <p className="txt02">{activity.description}</p>
                              </div>
                            </div>
                          </li>
                        </ul>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 아포스티유 */}
            {resume.apostilles && resume.apostilles.length > 0 && (
              <>
                <div className="sub_txt">아포스티유</div>
                <div className="Profile_card">
                  <div className="card full">
                    <div className="apoth">
                      {(resume.apostilles ?? []).map((apostille, index) => (
                        <a
                          href={`/api/download/${apostille.file}`}
                          download
                          key={index}
                        >
                          <i className="fa-regular fa-file-lines"></i>{" "}
                          {apostille.file?.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 자격증 */}
            {resume.certifications && resume.certifications.length > 0 && (
              <>
                <div className="sub_txt">자격증</div>
                <div className="Profile_card">
                  <div className="card full pd02">
                    <div className="commBox items-direction">
                      {(resume.certifications ?? []).map((cert, index) => (
                        <ul className="list" key={index}>
                          <li>
                            <div className="years">{cert.acquisitionDate}</div>
                          </li>
                          <li>
                            <div className="commchild gap5">
                              <div className="group">
                                <p className="txt01">
                                  {cert.certificationName}
                                </p>
                                <p className="txt02">
                                  {cert.issuingOrganization}
                                </p>
                              </div>
                            </div>
                          </li>
                        </ul>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 수상 */}
            {resume.awards && resume.awards.length > 0 && (
              <>
                <div className="sub_txt">수상</div>
                <div className="Profile_card">
                  <div className="card full pd02">
                    <div className="commBox items-direction">
                      {(resume.awards ?? []).map((award, index) => (
                        <ul className="list" key={index}>
                          <li>
                            <div className="years">{award.awardYear}</div>
                          </li>
                          <li>
                            <div className="commchild gap5">
                              <div className="group">
                                <p className="txt01">{award.awardName}</p>
                                <p className="txt02">
                                  {award.awardingOrganization}
                                </p>
                              </div>
                              {award.description && (
                                <div className="group gap20">
                                  <p className="txt02">{award.description}</p>
                                </div>
                              )}
                            </div>
                          </li>
                        </ul>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 취업우대·병역 */}
            <div className="sub_txt">취업우대·병역</div>
            <div className="Profile_card">
              <div className="military">
                <table>
                  <tbody>
                    <tr>
                      <th>보훈대상 여부</th>
                      <td>
                        {resume?.employmentPreferences.isVeteran
                          ? "보훈대상자"
                          : "비보훈대상자"}
                      </td>
                      <th>취업보호대상 여부</th>
                      <td>
                        {resume?.employmentPreferences.isEmploymentProtected
                          ? "취업보호대상자"
                          : "비취업보호대상자"}
                      </td>
                      <th>고용지원금대상 여부</th>
                      <td>
                        {resume?.employmentPreferences.isEmploymentSupport
                          ? "고용지원금대상자"
                          : "비고용지원금대상자"}
                      </td>
                    </tr>
                    <tr>
                      <th>병역사항</th>
                      <td colSpan={3}>
                        {resume?.employmentPreferences.hasMilitaryService
                          ? "[군필]"
                          : "[미필]"}
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
                      </td>
                      <th>장애여부</th>
                      <td>
                        {resume?.employmentPreferences.isDisabled
                          ? getDisabledGradeText(
                              resume?.employmentPreferences
                                .disabledGrade as DisabledGrade
                            )
                          : "비장애"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 자기소개서 */}
            {resume.selfIntroductions &&
              resume.selfIntroductions.length > 0 && (
                <>
                  <div className="sub_txt">자기소개서</div>
                  <div className="Profile_card">
                    <div className="card full pd02">
                      {(resume.selfIntroductions ?? []).map((intro, index) => (
                        <div className="selfBox" key={index}>
                          <h2>{intro.title}</h2>
                          <div className="selfintro">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: intro.content,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

            <div className="txtBox mt50" style={{ marginBottom: "100px" }}>
              <h2>위의 모든 기재사항은 사실과 다름없음을 확인합니다.</h2>
              <p>작성자 : {resume.name}</p>
            </div>

            {/* 스크랩인재, 최근본인재 에서만 노출되는 버튼 부분 수정 */}
            {isPageInScrapOrLatest && (
              <div className="btnBox mt80">
                <button
                  type="button"
                  className="form_btn"
                  id="proposal"
                  onClick={handleOpenProposalModal}
                >
                  포지션 제안
                </button>
                <button
                  type="button"
                  className="home_btn"
                  id="candsave"
                  onClick={openScrapModal}
                >
                  후보자 저장
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isPageInScrapOrLatest && resume.blind && (
        <SuggestionModal
          isOpen={isSuggestionModalOpen}
          onClose={closeSuggestionModal}
        />
      )}

      {isScrapModalOpen && scrapTalentId && (
        <TalentScrapModal
          userId={scrapTalentId}
          isOpen={isScrapModalOpen}
          onClose={closeScrapModal}
        />
      )}

      {showProposalModal && (
        <ProposalModal
          isOpen={showProposalModal}
          onClose={handleCloseProposalModal}
          onSubmit={handleSubmitProposal}
          name={resume.name}
          gender={resume.gender}
          age={calculateAge(resume.birth)}
        />
      )}
    </CorpLayout>
  );
};

export default ResumeDetail;
