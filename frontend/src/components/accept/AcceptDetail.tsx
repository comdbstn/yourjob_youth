import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import { acceptApi } from "../../api/accept";
import { AcceptDetailType } from "../../types/accept";
import { useAlert } from "../../contexts/AlertContext";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const AcceptDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<AcceptDetailType | null>(null);
  const [isExpanded, setIsExpanded] = useState<{ [key: number]: boolean }>({
    0: true,
  });
  const userId = sessionStorage.getItem("userId");
  useEffect(() => {
    if (id) {
      fetchAcceptDetail(parseInt(id));
    }
  }, [id]);

  const fetchAcceptDetail = async (acceptId: number) => {
    try {
      const response = await acceptApi.getSuccessfulResumeDetail(acceptId);
      setDetail(response);
    } catch (error) {
      console.error("Error fetching accept detail:", error);
      navigate("/notfound");
    }
  };

  const toggleAnswer = (index: number) => {
    setIsExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  const { customAlert } = useAlert();

  return (
    <Layout>
      <MetaTagHelmet
        title={`${detail?.resume.companyName} 합격자소서`}
        description={`${detail?.resume.companyName} 합격자소서 상세 페이지`}
      />
      <div className="container-center-horizontal">
        <div className="accept-detail screen">
          <div className="container">
            <div className="accept-detail-header">
              <div className="accept-detail-header-title">합격자소서</div>
              <div className="accept-detail-header-button">
                <button
                  type="button"
                  onClick={() => {
                    if (userId) {
                      navigate(
                        `/accept/acceptpost?resumeId=${detail?.resume.resumeId}`
                      );
                    } else {
                      customAlert({
                        content: "로그인이 필요한 메뉴입니다.",
                        onConfirm() {
                          navigate(`/member/userlogin`);
                        },
                      });
                    }
                  }}
                >
                  자소서 작성
                </button>
              </div>
            </div>
            {/* 합격자소서 정보 */}
            <div className="company-info">
              <h1>{detail?.resume.companyName}</h1>
              <div className="resume-title">
                <span>{detail?.resume.title}</span> 합격자소서
              </div>
              <div className="sub-info">
                <span>합격자 정보</span>
                <span>|</span>
                <span>{detail?.resume.schoolRegion}</span>
                <span>{detail?.resume.schoolType}</span>
                <span>{detail?.resume.major}</span>
                <span>
                  학점 {detail?.resume.gpa}/{detail?.resume.gpaScale}
                </span>
              </div>
            </div>

            {/* 자기소개서 문항들 */}
            <div className="question-list">
              {detail?.answers.length === 0 && (
                <div className="txt ellipsis2">답변이 없습니다.</div>
              )}
              {detail?.answers.map((item, index) => (
                <div key={index} className="question-item">
                  <div
                    className={`question-header ${
                      isExpanded[index] ? "expanded" : ""
                    }`}
                    onClick={() => toggleAnswer(index)}
                  >
                    <div className="question-header-content">
                      <span className="q-mark">Q.</span>
                      <h3>{item.questionText}</h3>
                    </div>
                    <div className="question-header-icon">
                      <i
                        className={`fa-solid fa-chevron-${
                          isExpanded[index] ? "up" : "down"
                        }`}
                      />
                    </div>
                  </div>

                  {isExpanded[index] && (
                    <>
                      <div className="divider"></div>
                      <div className="answer-content">
                        <p>{item.answerText}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* 하단 버튼 */}
            <div className="button-group">
              <button
                type="button"
                className="submit-btn"
                onClick={() => navigate("/accept/acceptlist")}
              >
                목록
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AcceptDetail;
