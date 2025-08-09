import React, { useState } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import { formatDate } from "../../utils/dateUtils";
import { getCommaSeparatedNumber } from "../../utils/numberUtils";
import { axiosInstance } from "../../api/axios";
import "./BbsView.css";
import { useAlert } from "../../contexts/AlertContext";
import { Helmet } from "react-helmet-async";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

interface commentProps {
  id: number;
  writer: string;
  date: string;
  content: string;
  likes: string;
  recommentId?: number;
  isLiked?: boolean;
  isMine?: boolean;
  delYn: string;
}

interface BbsDetailProps {
  id: number;
  subTitle: string;
  title: string;
  writer: string;
  date: string;
  views: string;
  likes: string;
  content: string;
  comments: commentProps[];
  isLiked?: boolean;
  isMine?: boolean;
}

const categoryMap: {
  [key: string]: { subTitle: string; description: string };
} = {
  all: { subTitle: "전체글", description: "모든 게시글을 확인하세요" },
  america: { subTitle: "미주", description: "미주 지역 유학생들의 이야기" },
  europe: { subTitle: "유럽", description: "유럽 지역 유학생들의 이야기" },
  asia: { subTitle: "아시아", description: "아시아 지역 유학생들의 이야기" },
  oceania: {
    subTitle: "오세아니아",
    description: "오세아니아 지역 유학생들의 이야기",
  },
  other: { subTitle: "기타", description: "기타 지역 유학생들의 이야기" },
};

const BbsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const location = useLocation();
  const navigate = useNavigate();
  const { customAlert, customConfirm } = useAlert();
  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get("category") || "all";
  const { subTitle, description } = categoryMap[category] || categoryMap["all"];

  const [replyInputs, setReplyInputs] = useState<{ [key: number]: boolean }>(
    {}
  );
  // 수정중인 댓글
  const [editingComments, setEditingComments] = useState<{
    [key: number]: boolean;
  }>({});
  // 수정중인 댓글 내용
  const [editingContents, setEditingContents] = useState<{
    [key: number]: string;
  }>({});
  const [postDetail, setPostDetail] = React.useState<BbsDetailProps | null>(
    null
  );
  // Edit버튼 클릭시 처리
  const handleEditClick = (commentId: number, currentContent: string) => {
    setEditingComments((prev) => ({ ...prev, [commentId]: true }));
    setEditingContents((prev) => ({ ...prev, [commentId]: currentContent }));
  };
  // 수정 삭제버튼 핸들러
  const handleEditCancel = (commentId: number) => {
    setEditingComments((prev) => ({ ...prev, [commentId]: false }));
  };
  // 수정 저장 메소드
  const handleEditSave = async (postId: number, commentId: number) => {
    if (
      !(await customConfirm({
        content: "수정하시겠습니까?",
        confirmLabel: "수정",
        cancelLabel: "취소",
      }))
    ) {
      return;
    }
    try {
      await axiosInstance.put(
        `/api/v1/community/posts/${postId}/comments/${commentId}`,
        { content: editingContents[commentId] }
      );
      // 새로고침
      fetchUserCommunityPost(postId);
      // 모드 끄기
      setEditingComments((prev) => ({ ...prev, [commentId]: false }));
    } catch (err) {
      console.error("댓글 수정 실패:", err);

      customAlert({
        content: "댓글 수정에 실패했습니다.",
      });
    }
  };

  const fetchUserCommunityPost = async (postId: number) => {
    try {
      const response = await axiosInstance.get(
        `/api/v1/community/posts/${postId}`
      );

      const mappedPost: BbsDetailProps = {
        id: response.data.id,
        subTitle: response.data.subTitle,
        title: response.data.title,
        writer: response.data.writer,
        date: formatDate(new Date(response.data.date), "yyyy.MM.DD HH:mm"),
        views: getCommaSeparatedNumber(response.data.views),
        likes: getCommaSeparatedNumber(response.data.likes),
        content: response.data.content,
        comments: response.data.comments.map((comment: any) => ({
          id: comment.id,
          writer: comment.writer,
          date: formatDate(new Date(comment.date), "YY.MM.DD HH:mm"),
          content: comment.content,
          likes: getCommaSeparatedNumber(comment.likes || 0),
          recommentId: comment.recommentId,
          isLiked: comment.isLiked,
          isMine: comment.isMine,
          delYn: comment.delYn,
        })),
        isLiked: response.data.isLiked,
        isMine: response.data.isMine,
      };

      setPostDetail(mappedPost);
    } catch (error) {
      console.error("게시글을 불러오는데 실패했습니다:", error);
      navigate("/notfound");
    }
  };

  const handleCommentSubmit = async (content: string, recommentId?: number) => {
    try {
      await axiosInstance.post(`/api/v1/community/posts/${id}/comments`, {
        content,
        recommentId,
      });

      // 댓글 작성 후 게시글 다시 불러오기
      fetchUserCommunityPost(Number(id));
    } catch (error) {
      console.error("댓글 작성에 실패했습니다:", error);
    }
  };
  const userId = sessionStorage.getItem("userId");
  // 댓글 작성 핸들러
  const handleCommentWrite = () => {
    if (!userId) {
      // 로그인 페이지로 이동
      customAlert({
        content: "로그인해 주세요.",
      });
      navigate("/member/userlogin");
      return;
    }
    const content = (document.getElementById("content") as HTMLTextAreaElement)
      .value;
    if (content.trim()) {
      handleCommentSubmit(content);
      (document.getElementById("content") as HTMLTextAreaElement).value = "";
    }
  };

  // 답글 작성 핸들러
  const handleReplyWrite = (parentCommentId: number) => {
    const replyContent = (
      document.getElementById(`reply-${parentCommentId}`) as HTMLTextAreaElement
    )?.value;
    if (replyContent?.trim()) {
      handleCommentSubmit(replyContent, parentCommentId);
      (
        document.getElementById(
          `reply-${parentCommentId}`
        ) as HTMLTextAreaElement
      ).value = "";
    }
  };

  const handleReplyClick = (commentId: number) => {
    setReplyInputs((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // 게시글 좋아요 처리
  const handlePostLike = async (postId: number) => {
    if (!userId) {
      customAlert({
        content: "로그인해 주세요.",
        onConfirm() {
          navigate("/member/userlogin");
        },
      });
      return;
    }

    try {
      // ① 응답 구조: { message: string, isLiked: boolean }
      const response = await axiosInstance.post(
        `/api/v1/community/recommend/post/${postId}`
      );

      // ② 최신 상태로 새로고침
      fetchUserCommunityPost(postId);

      // ③ 백엔드에서 내려준 message 사용
      customAlert({
        content: response.data.message,
      });
    } catch (error) {
      console.error("게시글 추천 토글에 실패했습니다:", error);
    }
  };

  // 댓글 좋아요 처리
  const handleCommentLike = async (postId: number, commentId: number) => {
    try {
      const response = await axiosInstance.post(
        `/api/v1/community/recommend/comment/${commentId}`
      );

      fetchUserCommunityPost(postId);

      customAlert({
        content: response.data.message,
      });
    } catch (error) {
      console.error("댓글 추천 토글에 실패했습니다:", error);
    }
  };

  // 댓글 신고 처리
  const handleCommentReport = async (postId: number, commentId: number) => {
    try {
      await axiosInstance.post(
        `/api/v1/community/posts/${postId}/comments/report`,
        {
          commentId: commentId,
        }
      );
      fetchUserCommunityPost(postId);
      customAlert({
        content: "신고가 접수되었습니다.",
      });
    } catch (error) {
      console.error("댓글 신고 처리에 실패했습니다:", error);
    }
  };

  // 댓글 차단 처리
  const handleCommentBlock = async (postId: number, commentId: number) => {
    try {
      await axiosInstance.post(
        `/api/v1/community/posts/${postId}/comments/block`,
        {
          commentId: commentId,
        }
      );
      fetchUserCommunityPost(postId);
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        customAlert({
          content: "자신의 댓글은 차단할 수 없습니다.",
        });
      } else {
        customAlert({
          content: "댓글 차단에 실패했습니다.",
        });
      }
      console.error("댓글 차단 처리에 실패했습니다:", error);
    }
  };
  // 댓글 삭제 처리
  const handleCommentRemove = async (postId: number, commentId: number) => {
    try {
      if (
        await customConfirm({
          content: "댓글을 삭제하시겠습니까?",
          confirmLabel: "삭제",
          cancelLabel: "취소",
        })
      ) {
        await axiosInstance.post(
          `/api/v1/community/posts/${postId}/comments/delete`,
          {
            commentId: commentId,
          }
        );
        fetchUserCommunityPost(postId);
        customAlert({
          content: "댓글이 삭제되었습니다.",
        });
      }
    } catch (error) {
      console.error("댓글 삭제 처리에 실패했습니다:", error);
    }
  };

  // 게시글 삭제 처리
  const handlePostDelete = async (postId: number) => {
    if (
      !(await customConfirm({
        content: "정말 삭제하시겠습니까?",
        confirmLabel: "삭제",
        cancelLabel: "취소",
      }))
    ) {
      return;
    }
    try {
      await axiosInstance.delete(`/api/v1/community/posts/${postId}`);
      customAlert({
        content: "게시글이 삭제되었습니다.",
      });
      navigate(`/community/bbslist?category=${category}`);
    } catch (error) {
      console.error("게시글 삭제에 실패했습니다:", error);
      customAlert({
        content: "게시글 삭제에 실패했습니다.",
      });
    }
  };

  // 게시글 수정 페이지로 이동
  const handlePostEdit = () => {
    navigate(`/community/bbswrite/${id}?category=${category}&view=true`);
  };

  React.useEffect(() => {
    if (id) {
      fetchUserCommunityPost(Number(id));
    }
  }, [id]);

  return (
    <Layout>
      <MetaTagHelmet
        title={"유학생 게시판"}
        description={postDetail?.title || ""}
        ogTitle={postDetail?.title || ""}
        ogDescription={postDetail?.content || ""}
      />
      <div className="container-center-horizontal">
        <div className="jobpost screen">
          <div className="container">
            <div className="flex-con">
              <div className="sidebar item_start">
                <div className="sidebar-title">유학생 게시판</div>
                <ul className="snb-list mb2">
                  {Object.keys(categoryMap).map((key) => (
                    <li key={key}>
                      <Link
                        to={`/community/bbslist?category=${key}`}
                        className={`item_start ${
                          category === key ? "active" : ""
                        }`}
                      >
                        {categoryMap[key].subTitle}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="sidebar-title">멘토링</div>
                <ul className="snb-list">
                  <li>
                    <Link to="/community/mentolist" className="item_start">
                      대기업 인사담당자 Q&A
                    </Link>
                  </li>
                </ul>
              </div>

              {/* bbsview */}
              <div className="flex-col">
                <div className="pageTitle">
                  <div className="conTitle">
                    <div className="titDetailSch">유학생 게시판</div>
                    <div className="subtit">
                      <span className="line">{subTitle}</span>
                      <span>{description}</span>
                    </div>
                  </div>
                </div>

                <div className="bbsdetail_top">
                  <div className="viewTit">
                    <h2>{postDetail?.title || ""}</h2>
                    <div className="subbox">
                      <span className="line">{postDetail?.writer || ""}</span>
                      <span>{postDetail?.date || ""}</span>
                    </div>
                  </div>
                  <div className="viewdata">
                    <span className="line">
                      조회수 {postDetail?.views || 0}
                    </span>
                    <span>추천 {postDetail?.likes || 0}</span>
                  </div>
                </div>

                <div className="viewCon">
                  <p style={{ whiteSpace: "pre-line" }}>
                    {postDetail?.content || ""}
                  </p>
                </div>

                <div className="bbsBtn">
                  {!postDetail?.isMine && (
                    <button
                      type="button"
                      className={`sug ${postDetail?.isLiked ? "active" : ""}`}
                      onClick={() => handlePostLike(Number(id))}
                      style={{
                        background: postDetail?.isLiked ? "#2e7fdb" : "",
                        color: postDetail?.isLiked ? "white" : "",
                      }}
                    >
                      <i className="fa-regular fa-thumbs-up"></i> 추천
                    </button>
                  )}
                  {postDetail?.isMine && (
                    <>
                      <button
                        type="button"
                        className="editBtn"
                        onClick={handlePostEdit}
                      >
                        <i className="fa-solid fa-pen"></i> 수정
                      </button>
                      <button
                        type="button"
                        className="deleteBtn"
                        onClick={() => handlePostDelete(Number(id))}
                      >
                        <i className="fa-solid fa-trash"></i> 삭제
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="listBtn"
                    onClick={() => navigate("/community/bbslist")}
                  >
                    목록
                  </button>
                </div>

                {/*코멘트 */}
                <div className="comment">
                  <div className="comTilte">
                    댓글{" "}
                    {getCommaSeparatedNumber(postDetail?.comments.length || 0)}
                  </div>
                  <div className="re_area">
                    <div className="formBox">
                      <textarea
                        id="content"
                        name="content"
                        placeholder="댓글을 입력하세요."
                      ></textarea>
                      <button
                        type="button"
                        className="comWrite"
                        onClick={handleCommentWrite}
                      >
                        등록
                      </button>
                    </div>
                  </div>

                  {/* 코멘트 roop */}
                  {postDetail?.comments
                    .filter((comment) => !comment.recommentId)
                    .map((comment) => (
                      <React.Fragment key={comment.id}>
                        <div className="comList">
                          <div className="listCol">
                            <div className="name">{comment.writer}</div>
                            {editingComments[comment.id] ? (
                              <div className="re_area">
                                <div className="formBox">
                                  <textarea
                                    value={editingContents[comment.id]}
                                    onChange={(e) =>
                                      setEditingContents((prev) => ({
                                        ...prev,
                                        [comment.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="댓글을 수정하세요."
                                  ></textarea>
                                  <div className="edit-buttons">
                                    <button
                                      type="button"
                                      className="comWrite"
                                      onClick={() =>
                                        handleEditSave(Number(id), comment.id)
                                      }
                                    >
                                      저장
                                    </button>
                                    <button
                                      type="button"
                                      className="comWrite cancel"
                                      onClick={() =>
                                        handleEditCancel(comment.id)
                                      }
                                    >
                                      취소
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="comTxt">{comment.content}</div>
                            )}
                            <div className="comdate">{comment.date}</div>

                            {comment.content !== "삭제된 댓글입니다." && (
                              <button
                                type="button"
                                className="reCom"
                                onClick={() => handleReplyClick(comment.id)}
                              >
                                답글쓰기
                              </button>
                            )}
                          </div>
                          {comment.delYn !== "y" && (
                            <div className="block_box">
                              <div className="block">
                                {!comment.isMine && (
                                  <>
                                    {" "}
                                    <span
                                      className="line"
                                      onClick={() =>
                                        handleCommentReport(
                                          Number(id),
                                          comment.id
                                        )
                                      }
                                    >
                                      신고
                                    </span>
                                    <span
                                      onClick={() =>
                                        handleCommentBlock(
                                          Number(id),
                                          comment.id
                                        )
                                      }
                                    >
                                      차단
                                    </span>
                                  </>
                                )}
                              </div>
                              {comment.isMine && (
                                <div className="block">
                                  <span
                                    className="line"
                                    onClick={() =>
                                      handleEditClick(
                                        comment.id,
                                        comment.content
                                      )
                                    }
                                  >
                                    수정
                                  </span>
                                  <span
                                    onClick={() => {
                                      handleCommentRemove(
                                        Number(id),
                                        comment.id
                                      );
                                    }}
                                  >
                                    삭제
                                  </span>
                                </div>
                              )}
                              <button
                                type="button"
                                className={`sugBtn ${
                                  comment.isLiked ? "active" : ""
                                }`}
                                onClick={() =>
                                  handleCommentLike(Number(id), comment.id)
                                }
                              >
                                <i className="fa-regular fa-thumbs-up"></i>{" "}
                                {comment.likes}
                              </button>
                            </div>
                          )}
                        </div>
                        {postDetail.comments
                          .filter(
                            (recomment) => recomment.recommentId === comment.id
                          )
                          .map((recomment) => (
                            <div
                              key={recomment.id}
                              className="comList comListBg"
                            >
                              <div className="relistCol">
                                <div className="com_icon">
                                  <img
                                    src="/img/recom-icon.png"
                                    className="com_icon"
                                    alt="recomment icon"
                                  />
                                </div>
                                <div
                                  className="listCol"
                                  style={{ flexGrow: 1 }}
                                >
                                  <div className="name">{recomment.writer}</div>
                                  {editingComments[recomment.id] ? (
                                    <div className="re_area">
                                      <div className="formBox">
                                        <textarea
                                          value={editingContents[recomment.id]}
                                          onChange={(e) =>
                                            setEditingContents((prev) => ({
                                              ...prev,
                                              [recomment.id]: e.target.value,
                                            }))
                                          }
                                          placeholder="답글을 수정하세요."
                                        ></textarea>
                                        <div className="edit-buttons">
                                          <button
                                            type="button"
                                            className="comWrite"
                                            onClick={() =>
                                              handleEditSave(
                                                Number(id),
                                                recomment.id
                                              )
                                            }
                                          >
                                            저장
                                          </button>
                                          <button
                                            type="button"
                                            className="comWrite cancel"
                                            onClick={() =>
                                              handleEditCancel(recomment.id)
                                            }
                                          >
                                            취소
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="comTxt">
                                      {recomment.content}
                                    </div>
                                  )}
                                  <div className="comdate">
                                    {recomment.date}
                                  </div>
                                </div>
                              </div>
                              {recomment.delYn !== "y" && (
                                <div className="block_box">
                                  <div className="block">
                                    {!recomment.isMine && (
                                      <>
                                        {" "}
                                        <span
                                          className="line"
                                          onClick={() =>
                                            handleCommentReport(
                                              Number(id),
                                              recomment.id
                                            )
                                          }
                                        >
                                          신고
                                        </span>
                                        <span
                                          onClick={() =>
                                            handleCommentBlock(
                                              Number(id),
                                              recomment.id
                                            )
                                          }
                                        >
                                          차단
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  {recomment.isMine && (
                                    <div className="block">
                                      <span
                                        className="line"
                                        onClick={() =>
                                          handleEditClick(
                                            recomment.id,
                                            recomment.content
                                          )
                                        }
                                      >
                                        수정
                                      </span>
                                      <span
                                        onClick={() =>
                                          handleCommentRemove(
                                            Number(id),
                                            recomment.id
                                          )
                                        }
                                      >
                                        삭제
                                      </span>
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    className={`sugBtn ${
                                      recomment.isLiked ? "active" : ""
                                    }`}
                                    onClick={() =>
                                      handleCommentLike(
                                        Number(id),
                                        recomment.id
                                      )
                                    }
                                  >
                                    <i className="fa-regular fa-thumbs-up"></i>{" "}
                                    {recomment.likes}
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        {replyInputs[comment.id] && (
                          <div className="re_area">
                            <div className="formBox">
                              <textarea
                                id={`reply-${comment.id}`}
                                name="content"
                                placeholder="답글을 입력하세요."
                              ></textarea>
                              <button
                                type="button"
                                className="comWrite"
                                onClick={() => handleReplyWrite(comment.id)}
                              >
                                등록
                              </button>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                </div>
                {/*코멘트 end*/}

                <div className="bbsBtn">
                  <button
                    type="button"
                    className="listBtn"
                    onClick={() => navigate("/community/bbslist")}
                  >
                    목록
                  </button>
                </div>
              </div>
              {/* bbsview end */}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BbsView;
