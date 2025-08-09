import React, { useEffect, useState } from "react";
import CorpLayout from "../layout/CorpLayout";
import "../../../public/css/corpmypage.css";
import "../../../public/css/nice-select.css";
import { useParams, useNavigate } from "react-router-dom";
import {
  DisabledGrade,
  getCareerTypeText,
  getDisabledGradeText,
  ResumeForm,
} from "../../types/resume";
import { axiosInstance } from "../../api/axios";
import {
  calculateMonthPeriod,
  calculatePeriod,
  formatDate,
  formatPeriod,
} from "../../utils/dateUtils";
import { formatBirthAndAge, formatGender } from "../../utils/formatUtils";
import {
  GraduationStatusText,
  GraduationStatus,
  MilitaryServiceClass,
  MilitaryServiceClassText,
  MilitaryServiceStatus,
  MilitaryServiceStatusText,
  LanguageTypeText,
  LanguageType,
  LanguageLevelText,
  LanguageLevel,
} from "../../app/dummy/options";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const { postId, volunteerId } = useParams();
  const [resume, setResume] = useState<ResumeForm | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await axiosInstance.get<ResumeForm>(
          `/api/v1/corpmem/posts/${postId}/${volunteerId}`
        );
        setResume(response.data);
      } catch (err) {
        navigate("/notfound");
        console.error("이력서 조회 실패:", err);
      }
    };
    fetchResume();
  }, [postId, volunteerId]);

  return (
    <CorpLayout>
      <MetaTagHelmet title="이력서 상세" description="이력서 상세" />
      <div className="container-center-horizontal">
        <div className="crop-wrap screen">
          <div className="container">
            <div className="head_txt">{resume?.title}</div>
            {/* 지원자 기본정보 */}
            <div className="Profile">
              <div className="picture">
                <img
                  src={resume?.picturePath || "/img/f_logo.png"}
                  alt="프로필 이미지"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/img/f_logo.png";
                  }}
                />
              </div>
              <div className="user-profile">
                <div className="user-profile_row">
                  <div className="user-profile_name-container">
                    <div className="user-profile_name">{resume?.name}</div>
                    <span>{formatGender(resume?.gender || "")}</span>
                    <span>{formatBirthAndAge(resume?.birth || "")}</span>
                    <span className="pspan">
                      {resume?.careerType &&
                        getCareerTypeText(resume.careerType)}
                    </span>
                  </div>
                </div>
                <div className="user-profile_detail-contents">
                  <div className="profile_detail">
                    <div className="user-profile_list-container">
                      <dl>
                        <dt>휴대폰</dt>
                        <dd>{resume?.phone}</dd>
                      </dl>
                      <dl>
                        <dt>영문이름</dt>
                        <dd>{resume?.englishName}</dd>
                      </dl>
                    </div>
                  </div>
                  <div className="profile_detail">
                    <div className="user-profile_list-container">
                      <dl>
                        <dt>주소</dt>
                        <dd>{resume?.address}</dd>
                      </dl>
                      <dl>
                        <dt>국적</dt>
                        <dd>{resume?.nationality}</dd>
                      </dl>
                    </div>
                  </div>
                  <div className="profile_detail">
                    <div className="user-profile_list-container">
                      <dl>
                        <dt>Email</dt>
                        <dd>{resume?.email}</dd>
                      </dl>
                      {resume?.nationality !== "02000031" && (
                        <dl>
                          <dt>비자여부</dt>
                          <dd>{resume?.visa}</dd>
                        </dl>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* 지원자 기본정보 end */}

            <div className="Profile_card">
              <div className="card items-direction">
                <h1>학력</h1>
                <h2>{resume?.educations[0]?.schoolName}</h2>
                <h3>{resume?.educations[0]?.department}</h3>
              </div>
              <div className="card items-direction">
                <h1>경력</h1>
                <h2>{resume?.careers[0]?.companyName}</h2>
                <h3>
                  {resume?.careers[0] &&
                    formatPeriod(
                      calculatePeriod(
                        new Date(resume.careers[0]?.startDate),
                        new Date(resume.careers[0]?.endDate)
                      )
                    )}
                </h3>
              </div>
              <div className="card items-direction">
                <h1>인턴/대외활동</h1>
                <h2>{resume?.activities[0]?.organizationName}</h2>
                <h3>
                  {resume?.activities[0] &&
                    formatPeriod(
                      calculatePeriod(
                        new Date(resume.activities[0]?.startDate),
                        new Date(resume.activities[0]?.endDate)
                      )
                    )}
                </h3>
              </div>
              <div className="card items-direction">
                <h1>자격증/어학</h1>
                <h2>
                  {LanguageTypeText[
                    resume?.languages[0]?.language as LanguageType
                  ] || resume?.languages[0]?.language}
                </h2>
                <h3>{resume?.languages[0]?.speakingLevel}</h3>
              </div>
            </div>

            {/* 비자여부 */}
            {resume?.nationality !== "02000031" && (
              <>
                <div className="sub_txt">비자여부</div>
                <div className="Profile_card">
                  <div className="card full">
                    <div className="visastat">
                      <p>{resume?.visa}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
            {/* 비자여부 end */}

            {/* 학력 */}
            {resume?.educations && resume.educations.length > 0 && (
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
            {/* 학력 end */}

            {/* 어학능력 */}
            {resume?.languages && resume.languages.length > 0 && (
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
            {resume?.careers && resume.careers.length > 0 && (
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

            {/* 경력 end */}

            {/* 인턴/대외활동 */}
            {resume?.activities && resume.activities.length > 0 && (
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
            {/* 인턴/대외활동 end */}

            {/* 아포스티유 */}
            {resume?.apostilles && resume.apostilles.length > 0 && (
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
            {/* 아포스티유 end */}

            {/* 자격증 */}
            {resume?.certifications && resume.certifications.length > 0 && (
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
            {/* 자격증 end */}

            {/* 수상 */}
            {resume?.awards && resume.awards.length > 0 && (
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
            {/* 수상 end */}

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
            {/* 취업우대·병역 end */}

            {/* 자기소개서 */}
            {resume?.selfIntroductions &&
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
            {/* 자기소개서 end */}
          </div>
        </div>
      </div>
    </CorpLayout>
  );
};

export default ProfileView;
