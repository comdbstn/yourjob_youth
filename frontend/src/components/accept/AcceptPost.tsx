import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Layout from "../layout/Layout";
import "../../../public/css/accept.css";
import { acceptApi } from "../../api/accept";
import {
  AcceptPostItem,
  MyIntroductionQuestion,
  SuccessfulResumeItem,
  AcceptDetailType,
  MyIntroductionRequest,
  MyIntroductionDto,
  SuccessfulResumeListResponse,
} from "../../types/accept";
import AcceptNewWriteModal from "./AcceptNewWriteModal";
import AcceptDeleteItemModal from "./AcceptDeleteItemModal";
import AcceptSaveConfirmModal from "./AcceptSaveConfirmModal";
import { formatDate, getDdayString } from "../../utils/dateUtils";
import PostingPagination from "../common/PostingPagination";
import { useAlert } from "../../contexts/AlertContext";
import CompanyLogo from "../common/CompanyLogo";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const TAB_IDS = {
  JOB_POST: "01",
  SUCCESSFUL_RESUME: "02",
  MY_RESUME: "03",
} as const;

type TabId = (typeof TAB_IDS)[keyof typeof TAB_IDS];

const INITIAL_QUESTION: MyIntroductionQuestion = {
  questionText: "",
  answerText: "",
  questionIdx: 1,
  isFromApi: false,
  isModified: false,
  originalAnswerText: "",
};

const AcceptPost: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const jobPostId = searchParams.get("jobPostId") || "";
  const resumeId = searchParams.get("resumeId") || "";
  const isInitialLoad = useRef(false);
  const successfulListRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabId>(TAB_IDS.SUCCESSFUL_RESUME);
  const [questions, setQuestions] = useState<MyIntroductionQuestion[]>([
    INITIAL_QUESTION,
  ]);
  const [title, setTitle] = useState("");
  const [jobPosts, setJobPosts] = useState<AcceptPostItem[]>([]);
  const [successfulResumesResp, setSuccessfulResumesResp] =
    useState<SuccessfulResumeListResponse>();
  const [successfulResumes, setSuccessfulResumes] = useState<
    SuccessfulResumeItem[]
  >([]);
  // 합격자소서 페이징
  const [currPage, setCurrPage] = useState<number>(1);
  const [myResumes, setMyResumes] = useState<MyIntroductionDto[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedResume, setSelectedResume] =
    useState<SuccessfulResumeItem | null>(null);
  const [selectedResumeDetail, setSelectedResumeDetail] =
    useState<AcceptDetailType | null>(null);
  const [isNewWriteModalOpen, setIsNewWriteModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [deleteItemIndex, setDeleteItemIndex] = useState<number | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isSearched, setIsSearched] = useState(false);

  useEffect(() => {
    setSearchKeyword("");
    if (activeTab === TAB_IDS.JOB_POST) {
      fetchJobPosts();
    } else if (activeTab === TAB_IDS.SUCCESSFUL_RESUME) {
      fetchSuccessfulResumes();
    } else if (activeTab === TAB_IDS.MY_RESUME) {
      fetchMyResumes();
    }
  }, [activeTab, currPage]);
  useEffect(() => {
    if (activeTab === TAB_IDS.SUCCESSFUL_RESUME && !selectedResume) {
      successfulListRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [successfulResumes, activeTab, selectedResume]);
  const fetchJobPosts = async () => {
    try {
      const response = await acceptApi.getAcceptPosts({
        page: 1,
        size: 20,
        query: searchKeyword,
      });
      setJobPosts(response);

      if (!isInitialLoad.current && jobPostId) {
        const post = response.find(
          (post) => post.jobPostId === Number(jobPostId)
        );
        if (post) {
          handleWriteClick(post.jobPostId, post.jobTitle);
        }
        isInitialLoad.current = true;
      }
    } catch (error) {
      console.error("채용공고 목록 조회 실패:", error);
    }
  };

  const fetchSuccessfulResumes = async () => {
    try {
      const response = await acceptApi.getSuccessfulResumes({
        page: currPage,
        size: 20,
        query: searchKeyword,
      });
      setSuccessfulResumes(response.content);
      setSuccessfulResumesResp(response);
      if (!isInitialLoad.current && jobPostId) {
        const post = response.content.find(
          (post) => post.jobPost.jobPostId === Number(jobPostId)
        );
        if (post) {
          handleResumeClick(post);
        }
        isInitialLoad.current = true;
      }

      if (resumeId) {
        const post = response.content.find(
          (i) => i.resumeId === Number(resumeId)
        );
        if (post) {
          handleResumeClick(post);
        }
      }
    } catch (error) {
      console.error("합격자소서 목록 조회 실패:", error);
    }
  };

  const fetchMyResumes = async () => {
    try {
      const response = await acceptApi.getMyIntroductions({
        page: 1,
        size: 999,
        title: searchKeyword,
      });
      setMyResumes(response.content);
    } catch (error) {
      console.error("내 자소서 목록 조회 실패:", error);
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId as TabId);
    setSelectedPostId(null);
    setTitle("");
    setQuestions([INITIAL_QUESTION]);
  };

  const handleAddQuestion = () => {
    const maxQuestionIdx = Math.max(
      ...questions.map((item) => item.questionIdx),
      0
    );
    setQuestions([
      ...questions,
      { ...INITIAL_QUESTION, questionIdx: maxQuestionIdx + 1 },
    ]);
  };

  const handleRemoveQuestion = async (index: number) => {
    try {
      await acceptApi.deleteMyIntroductionQuestion(
        selectedPostId!,
        questions[index].questionIdx!
      );
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    } catch (error) {
      alert("항목 삭제에 실패했습니다.");
    }
  };

  const handleQuestionChange = (
    index: number,
    field: keyof MyIntroductionQuestion,
    value: string
  ) => {
    const newQuestions = [...questions];
    const question = newQuestions[index];

    if (field === "answerText" && question.isFromApi) {
      if (value !== question.originalAnswerText) {
        newQuestions[index] = { ...question, [field]: value, isModified: true };
      } else {
        newQuestions[index] = {
          ...question,
          [field]: value,
          isModified: false,
        };
      }
    } else {
      newQuestions[index] = { ...question, [field]: value };
    }

    setQuestions(newQuestions);
  };

  const handleWriteClick = async (postId: number, jobTitle: string) => {
    const questionData = await acceptApi.getAcceptQuestions(postId);
    const templates = questionData?.templates || [];
    const mappedQuestions: MyIntroductionQuestion[] = templates.map(
      (q: any, idx: number) => ({
        questionText: q.questionText ?? "",
        answerText: "",
        questionIdx: q.questionIdx ?? idx + 1,
        isFromApi: true,
        isModified: false,
        originalAnswerText: "",
      })
    );
    setQuestions(
      mappedQuestions.length > 0 ? mappedQuestions : [INITIAL_QUESTION]
    );
    setTitle(jobTitle);
  };

  const handleEditClick = async (resumeId: number) => {
    try {
      const detail = await acceptApi.getMyIntroductionDetail(resumeId);
      setSelectedPostId(resumeId);
      setTitle(detail.introduction.title);
      setQuestions(
        detail.answers.map((q) => ({
          questionText: q.questionText,
          answerText: q.answerText,
          questionIdx: q.questionIdx ?? 0,
          answerId: q.answerId ?? 0,
          isFromApi: true,
          isModified: false,
          originalAnswerText: q.answerText,
        }))
      );
    } catch (error) {
      console.error("자소서 상세 조회 실패:", error);
    }
  };
  const { customAlert } = useAlert();
  const handleSave = () => {
    if (title === "") {
      customAlert({
        content: "제목을 입력해주세요.",
      });
      return;
    }

    setIsSaveModalOpen(true);
  };

  const handleSaveResume = async (postId: number | null = null) => {
    if (!title || !questions.length) return;

    try {
      if (postId) {
        // 새로 추가된 항목들 중 내용이 있는 것만 저장
        const newQuestions = questions.filter(
          (item) => !item.isFromApi && (item.questionText || item.answerText)
        );
        if (newQuestions.length > 0) {
          await acceptApi.addMyIntroductionQuestions(postId, newQuestions);
        }

        // 수정된 기존 항목들의 답변만 업데이트
        const modifiedQuestions = questions.filter(
          (item) => item.isFromApi && item.isModified
        );
        for (const question of modifiedQuestions) {
          await acceptApi.updateMyIntroductionAnswer(
            question.answerId!,
            question.answerText
          );
        }

        // 제목 수정
        await acceptApi.updateMyIntroduction(postId, {
          title,
          isFinished: true,
        });
      } else {
        const data: MyIntroductionRequest = {
          title,
          isFinished: true,
          questions: questions
            .filter((item) => item.questionText || item.answerText)
            .map((item, index) => ({
              questionText: item.questionText,
              answerText: item.answerText,
              questionIdx: index + 1,
            })),
        };
        await acceptApi.saveMyIntroduction(data);
        setTitle("");
        setQuestions([INITIAL_QUESTION]);
        setSelectedPostId(null);
      }

      setIsSaveModalOpen(false);
      fetchMyResumes();
      postId && handleEditClick(postId);
      if (activeTab !== TAB_IDS.MY_RESUME) {
        setActiveTab(TAB_IDS.MY_RESUME);
      }
    } catch (error) {
      console.error("자소서 저장 실패:", error);
      alert("저장에 실패했습니다.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteItemIndex !== null) {
      await acceptApi.deleteMyIntroduction(deleteItemIndex);
      setIsDeleteModalOpen(false);
      setDeleteItemIndex(null);
      setSelectedPostId(null);
      setTitle("");
      setQuestions([INITIAL_QUESTION]);
      fetchMyResumes();
    }
  };

  const handleNewWrite = () => {
    setIsNewWriteModalOpen(true);
  };

  const handleNewWriteConfirm = () => {
    setIsNewWriteModalOpen(false);
    setQuestions([INITIAL_QUESTION]);
    setTitle("");
    setSelectedPostId(null);
  };

  const handleSearch = () => {
    if (activeTab === TAB_IDS.JOB_POST) {
      fetchJobPosts();
    } else if (activeTab === TAB_IDS.SUCCESSFUL_RESUME) {
      fetchSuccessfulResumes();
    } else if (activeTab === TAB_IDS.MY_RESUME) {
      fetchMyResumes();
    }
    setIsSearched(!!searchKeyword);
  };

  const handleResumeClick = async (resume: SuccessfulResumeItem) => {
    try {
      setSelectedResume(resume);
      const detail = await acceptApi.getSuccessfulResumeDetail(resume.resumeId);
      setSelectedResumeDetail(detail);
    } catch (error) {
      console.error("합격자소서 상세 조회 실패:", error);
    }
  };

  return (
    <Layout>
      <MetaTagHelmet title="합격자소서" description="합격자소서" />
      <div className="container-center-horizontal">
        <div className="accept accept-post screen">
          <div className="container">
            <div className="titDetailSch">합격자소서</div>

            <div className="flex-row">
              <div className="col2 acceptpost">
                <ul className="acceptTap no-cursor">
                  {/* <li
                    data-id={TAB_IDS.JOB_POST}
                    className={`line ${
                      activeTab === TAB_IDS.JOB_POST ? "active" : ""
                    }`}
                    onClick={() => handleTabClick(TAB_IDS.JOB_POST)}
                  >
                    채용공고
                  </li> */}
                  <li
                    data-id={TAB_IDS.SUCCESSFUL_RESUME}
                    className={`line ${
                      activeTab === TAB_IDS.SUCCESSFUL_RESUME ? "active" : ""
                    }`}
                    onClick={() => handleTabClick(TAB_IDS.SUCCESSFUL_RESUME)}
                  >
                    합격자소서
                  </li>
                  <li
                    data-id={TAB_IDS.MY_RESUME}
                    className={activeTab === TAB_IDS.MY_RESUME ? "active" : ""}
                    onClick={() => handleTabClick(TAB_IDS.MY_RESUME)}
                  >
                    내 자소서 보관함
                  </li>
                </ul>

                <div className="flex-row acceptSearch">
                  <div className="tottxt">
                    총{" "}
                    {activeTab === TAB_IDS.JOB_POST
                      ? jobPosts.length
                      : activeTab === TAB_IDS.SUCCESSFUL_RESUME
                      ? successfulResumesResp?.totalElements
                      : myResumes.length}
                    건
                  </div>
                  <div className="search_box">
                    <input
                      type="search"
                      className="form-control search_form"
                      placeholder="기업명, 제목"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="searchbtn"
                      onClick={handleSearch}
                    >
                      <i className="fa-solid fa-magnifying-glass"></i>
                    </button>
                  </div>
                </div>

                <div
                  className="accept_warp"
                  ref={successfulListRef}
                  style={{
                    overflowY: "auto",
                  }}
                >
                  {activeTab === TAB_IDS.JOB_POST && (
                    <div id="accept01">
                      {jobPosts?.length === 0 && (
                        <div className="txt ellipsis">
                          {isSearched
                            ? "검색된 채용공고가 없습니다."
                            : "채용공고가 없습니다."}
                        </div>
                      )}
                      {jobPosts.map((post) => (
                        <div
                          className="flex-row acceptList"
                          key={post.jobPostId}
                        >
                          <div className="clogo">
                            <CompanyLogo logoUrl={post.company.corpLogoUrl} />
                          </div>
                          <div className="flex-row item_center cinfo_box">
                            <div className="accepInfo">
                              <div className="cname">
                                {post.company.companyName}
                              </div>
                              <div className="ctxt ellipsis">
                                {post.jobTitle}
                              </div>
                            </div>
                            <div className="accepBtn_box">
                              <button
                                type="button"
                                className="accepBtn"
                                onClick={() =>
                                  handleWriteClick(
                                    post.jobPostId,
                                    post.jobTitle
                                  )
                                }
                              >
                                자소서 작성
                              </button>
                              <div className="accepdday">
                                {/* {getDdayString(post.createdAt)} */}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === TAB_IDS.SUCCESSFUL_RESUME && (
                    <div id="accept02">
                      {!selectedResume && successfulResumes.length === 0 && (
                        <div className="txt ellipsis">
                          {isSearched
                            ? "검색된 합격자소서가 없습니다."
                            : "합격자소서가 없습니다."}
                        </div>
                      )}
                      {!selectedResume &&
                        successfulResumes.map((resume) => (
                          <div
                            className="flex-row acceptList"
                            key={resume.resumeId}
                            onClick={() => handleResumeClick(resume)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="clogo">
                              <CompanyLogo
                                logoUrl={resume.jobPost.company.corpLogoUrl}
                              />
                            </div>
                            <div className="flex-row item_center cinfo_box">
                              <div className="accepInfo">
                                <div className="cname">
                                  {resume.jobPost.company.companyName}
                                </div>
                                <div className="ctxt ellipsis">
                                  {resume.title}
                                </div>
                              </div>
                              <div className="accepBtn_box">
                                <div className="accepdday">
                                  {/* {getDdayString(resume.createdAt)} */}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      {selectedResume && selectedResumeDetail && (
                        <div className="DetailBox">
                          <div className="rows">
                            <div className="detail_title">
                              <div className="logoBox">
                                <CompanyLogo
                                  logoUrl={
                                    selectedResume.jobPost.company.corpLogoUrl
                                  }
                                />
                              </div>
                              <div className="txtBox">
                                <p className="span">
                                  {selectedResumeDetail.resume.companyName}
                                </p>
                                <p>{selectedResumeDetail.resume.title}</p>
                              </div>
                              <button
                                type="button"
                                className="close"
                                onClick={() => {
                                  setSelectedResume(null);
                                  setSelectedResumeDetail(null);
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="19"
                                  height="19"
                                  viewBox="0 0 19 19"
                                  fill="none"
                                >
                                  <rect
                                    x="2"
                                    y="0.000244141"
                                    width="24.0416"
                                    height="2.82842"
                                    transform="rotate(45 2 0.000244141)"
                                    fill="#A8A8A8"
                                  ></rect>
                                  <rect
                                    x="19.0039"
                                    y="2"
                                    width="24.0416"
                                    height="2.82842"
                                    transform="rotate(135 19.0039 2)"
                                    fill="#A8A8A8"
                                  ></rect>
                                </svg>
                              </button>
                            </div>
                            <div className="detail_con">
                              <div className="answer_section">
                                {selectedResumeDetail.answers.length === 0 && (
                                  <div className="txt ellipsis">
                                    답변이 없습니다.
                                  </div>
                                )}
                                {selectedResumeDetail.answers.map(
                                  (answer, index) => (
                                    <div className="answer_item" key={index}>
                                      <div className="question">
                                        <span className="q_mark">Q.</span>
                                        <span className="question_text">
                                          {answer.questionText}
                                        </span>
                                      </div>
                                      <div className="answer">
                                        <span className="a_mark">A.</span>
                                        <span className="answer_text">
                                          {answer.answerText}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="listBtn mt45"
                            onClick={() => setSelectedResume(null)}
                          >
                            목록
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === TAB_IDS.MY_RESUME && (
                    <div className="my-introduction-section">
                      <ul>
                        {myResumes.length === 0 && (
                          <div className="txt ellipsis">
                            {isSearched
                              ? "검색된 자소서가 없습니다."
                              : "자소서가 없습니다."}
                          </div>
                        )}
                        {myResumes.map((resume, index) => (
                          <li
                            key={resume.myIntroductionId}
                            className={`my-accept-list ${
                              index > 0 ? "btnone" : ""
                            } ${
                              selectedPostId === resume.myIntroductionId
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              handleEditClick(resume.myIntroductionId)
                            }
                          >
                            <div className="flex-row item_between">
                              <div className="post_info">
                                <div className="post_title ellipsis">
                                  {resume.title}
                                </div>
                                <div className="post_date">
                                  {formatDate(
                                    new Date(resume.createdAt),
                                    "YYYY.MM.DD HH:mm"
                                  )}
                                </div>
                              </div>
                              <div className="post_actions">
                                <button
                                  type="button"
                                  className="editBtn"
                                  onClick={() =>
                                    handleEditClick(resume.myIntroductionId)
                                  }
                                >
                                  수정
                                </button>
                                <button
                                  type="button"
                                  className="deleteBtn"
                                  onClick={() => {
                                    setSelectedPostId(resume.myIntroductionId);
                                    setDeleteItemIndex(resume.myIntroductionId);
                                    setIsDeleteModalOpen(true);
                                  }}
                                >
                                  삭제
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    margin: "0 auto",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {successfulResumesResp &&
                    !selectedResume &&
                    activeTab === TAB_IDS.SUCCESSFUL_RESUME &&
                    (() => {
                      const pageSize = 20;
                      // 총 페이지 수를 올림으로 계산
                      const totalPages = Math.ceil(
                        successfulResumesResp.totalElements / pageSize
                      );

                      return (
                        <PostingPagination
                          currentPage={currPage}
                          totalPages={totalPages}
                          onPageChange={(page: number) => {
                            setCurrPage(page);
                          }}
                        />
                      );
                    })()}
                </div>
              </div>

              <div className="col2 acceptpost">
                <div className="acceptTitle">
                  <button type="button" id="newWrite" onClick={handleNewWrite}>
                    새 자소서 작성
                  </button>
                </div>

                <div className="accept_rwarp">
                  <div className="write_box">
                    <input
                      type="text"
                      className="form-control formfild subject"
                      placeholder="제목을 입력해 주세요."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <button
                      type="button"
                      className="writeBtn"
                      onClick={handleSave}
                    >
                      저장
                    </button>
                  </div>

                  <div className="write_warp">
                    {questions.map((question, index) => (
                      <div className="writeForm_box" key={index}>
                        <div className="input_field lines">
                          {question.isFromApi ? (
                            <div className="post_title">
                              {question.questionText}
                            </div>
                          ) : (
                            <textarea
                              className="form-control"
                              style={{ height: "30px" }}
                              placeholder="질문을 입력해 주세요."
                              value={question.questionText}
                              onChange={(e) =>
                                handleQuestionChange(
                                  index,
                                  "questionText",
                                  e.target.value
                                )
                              }
                            />
                          )}
                        </div>
                        <div className="input_field">
                          <textarea
                            className="form-control"
                            style={{ height: "100px" }}
                            placeholder="답변을 입력해 주세요."
                            value={question.answerText}
                            onChange={(e) =>
                              handleQuestionChange(
                                index,
                                "answerText",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="write_warp_del">
                          <button
                            type="button"
                            className="addDel"
                            onClick={() => handleRemoveQuestion(index)}
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="writeForm_addbox">
                      <button
                        type="button"
                        className="addBtn"
                        onClick={handleAddQuestion}
                      >
                        + 항목추가
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isNewWriteModalOpen && (
        <AcceptNewWriteModal
          isOpen={isNewWriteModalOpen}
          onClose={() => setIsNewWriteModalOpen(false)}
          onConfirm={handleNewWriteConfirm}
        />
      )}

      {isDeleteModalOpen && (
        <AcceptDeleteItemModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {isSaveModalOpen && (
        <AcceptSaveConfirmModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          onConfirm={() => handleSaveResume(selectedPostId ?? null)}
        />
      )}
    </Layout>
  );
};

export default AcceptPost;
