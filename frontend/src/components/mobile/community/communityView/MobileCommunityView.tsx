import React, { useEffect, useState } from "react";
import MobileCommunityHeader from "../../components/CommunityHeader/CommunityHeader";
import "./MobileCommunityView.css";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../../../api/axios";
import { formatDate } from "../../../../utils/dateUtils";
import { getCommaSeparatedNumber } from "../../../../utils/numberUtils";
import MainFooter from "../../components/MainFooter/MainFooter";
import { UserType } from "../../../../types/user";
import { useAlert } from "../../../../contexts/AlertContext";
import { MetaTagHelmet } from "../../../common/MetaTagHelmet";

interface commentProps {
  id: number;
  writer: string;
  date: string;
  content: string;
  likes: string;
  recommentId?: number;
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

export default function MobileCommunityView() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id"); // URL 쿼리에서 id를 추출
  const gbn = queryParams.get("gbn");
  const isMentor = queryParams.get("isMentor");
  const category = queryParams.get("category") || "all";
  const { subTitle, description } = categoryMap[category] || categoryMap["all"];
  // 수정 모드 관리
  const [editingComments, setEditingComments] = useState<{
    [key: number]: boolean;
  }>({});
  const [editingContents, setEditingContents] = useState<{
    [key: number]: string;
  }>({});
  // 댓글 수정 버튼 클릭
  const handleEditClick = (commentId: number, currentContent: string) => {
    setEditingComments((prev) => ({ ...prev, [commentId]: true }));
    setEditingContents((prev) => ({ ...prev, [commentId]: currentContent }));
  };
  // 수정 취소
  const handleEditCancel = (commentId: number) => {
    setEditingComments((prev) => ({ ...prev, [commentId]: false }));
  };
  // 수정 저장
  const handleEditSave = async (commentId: number) => {
    if (!confirm("댓글을 수정하시겠습니까?")) return;
    try {
      await axiosInstance.put(
        `/api/v1/community/posts/${id}/comments/${commentId}`,
        { content: editingContents[commentId] }
      );
      await fetchUserCommunityPost(Number(id)!);
      setEditingComments((prev) => ({ ...prev, [commentId]: false }));
    } catch (err) {
      console.error("댓글 수정 실패:", err);
      alert("댓글 수정에 실패했습니다.");
    }
  };
  const [postDetail, setPostDetail] = React.useState<BbsDetailProps | null>(
    null
  );

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
  const userType = sessionStorage.getItem("userType") as UserType;
  const { customAlert } = useAlert();
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
  // 댓글 작성 핸들러
  const handleCommentWrite = () => {
    if (!userId) {
      alert("로그인해 주세요.");
      navigate("/m/member/userLogin");
      return;
    }
    if (userType !== UserType.COMPANY && isMentor === "true") {
      customAlert({
        content: "기업회원만 답변할 수 있습니다.",
      });
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
    if (!userId) {
      alert("로그인해 주세요.");
      navigate("/m/member/userLogin");
      return;
    }
    if (userType !== UserType.COMPANY && isMentor === "true") {
      customAlert({
        content: "기업회원만 답변할 수 있습니다.",
      });
      return;
    }
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

  React.useEffect(() => {
    if (id) {
      fetchUserCommunityPost(Number(id));
    }
  }, [id]);

  const [selectedTab, setSelectedTab] = useState("student"); // 기본값: 유학생
  const [replyInputs, setReplyInputs] = useState<{ [key: number]: boolean }>(
    {}
  );
  const handleReplyClick = (commentId: number) => {
    setReplyInputs((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };
  const userId = sessionStorage.getItem("userId");
  useEffect(() => {
    if (gbn === "mentor") {
      setSelectedTab("mentoring");
    }
  }, [gbn]);
  const initialCategory = queryParams.get("category") || "all";
  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategory);
  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    const params = new URLSearchParams(location.search);
    params.set("category", cat);
    // id, gbn 같은 기존 파라미터도 그대로 유지됨
    navigate(`/m/community?category=${cat}`);
  };
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

  const handlePostLike = async (postId: number) => {
    if (!userId) {
      customAlert({
        content: "로그인 해주세요.",
        onConfirm() {
          navigate("/m/member/userLogin");
          return;
        },
      });
    }
    try {
      await axiosInstance.post(`/api/v1/community/recommend/post/${postId}`);
      fetchUserCommunityPost(postId);
      alert("게시글을 추천했습니다.");
    } catch (error) {
      console.error("게시글 좋아요 처리에 실패했습니다:", error);
    }
  };
  const handleCommentRemove = async (postId: number, commentId: number) => {
    try {
      if (confirm("댓글을 삭제하시겠습니까?")) {
        await axiosInstance.post(
          `/api/v1/community/posts/${postId}/comments/delete`,
          {
            commentId: commentId,
          }
        );
        alert("댓글이 삭제되었습니다.");
      }
    } catch (error) {
      console.error("댓글 삭제 처리에 실패했습니다:", error);
    }
  };
  // 게시글 삭제 처리
  const handlePostDelete = async (postId: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) {
      return;
    }
    try {
      await axiosInstance.delete(`/api/v1/community/posts/${postId}`);
      alert("게시글이 삭제되었습니다.");
      navigate(`/m/community`);
    } catch (error) {
      console.error("게시글 삭제에 실패했습니다:", error);
      alert("게시글 삭제에 실패했습니다.");
    }
  };

  // 게시글 수정 페이지로 이동
  const handlePostEdit = () => {
    navigate(
      `/m/community/writeBoard/?id=${id}&category=${category}&view=true`
    );
  };

  React.useEffect(() => {
    if (id) {
      fetchUserCommunityPost(Number(id));
    }
  }, [id]);
  return (
    <div className="mobileCommunityView_container">
      <MetaTagHelmet title="커뮤니티" description="커뮤니티" />
      <MobileCommunityHeader />
      <div className="topBtns">
        <button
          className={selectedTab === "student" ? "selected" : ""}
          onClick={() => navigate("/m/community")}
        >
          <span>유학생</span>
        </button>
        <button
          className={selectedTab === "mentoring" ? "selected" : ""}
          // onClick={() => setSelectedTab("mentoring")}
          onClick={() =>
            navigate(
              "/m/community?category=all&page=1&type=title&keyword=&isMentor=true"
            )
          }
        >
          <span>멘토링</span>
        </button>
      </div>
      {isMentor !== "true" ? (
        <div
          className="countryBtns"
          style={{ overflowX: "scroll", textWrap: "nowrap" }}
        >
          <div className="btn-area">
            <button
              className={selectedCategory === "all" ? "selected" : ""}
              onClick={() => handleCategoryClick("all")}
            >
              전체글
            </button>
            <button
              className={selectedCategory === "america" ? "selected" : ""}
              onClick={() => handleCategoryClick("america")}
            >
              미주
            </button>
            <button
              className={selectedCategory === "europe" ? "selected" : ""}
              onClick={() => handleCategoryClick("europe")}
            >
              유럽
            </button>
            <button
              className={selectedCategory === "asia" ? "selected" : ""}
              onClick={() => handleCategoryClick("asia")}
            >
              아시아
            </button>
            <button
              className={selectedCategory === "oceania" ? "selected" : ""}
              onClick={() => handleCategoryClick("oceania")}
            >
              오세아니아
            </button>
            <button
              className={selectedCategory === "other" ? "selected" : ""}
              onClick={() => handleCategoryClick("other")}
            >
              기타
            </button>
          </div>
          <button className="btn-write">
            <img src="/img/mobile/pencil.png" alt="pencil icon" />
          </button>
        </div>
      ) : (
        <div
          style={{
            height: "63px",
            width: "100%",
            borderBottom: "#eaeaea 1px solid",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            justifyContent: "space-between",
          }}
        >
          <p style={{ color: "#2f80dc", fontWeight: "500" }}>
            대기업 인사담당자 Q&A
          </p>
          <button className="btn-write">
            <img src="/img/mobile/pencil.png" alt="pencil icon" />
          </button>
        </div>
      )}

      <section className="contentSection">
        <div className="headers">
          <p className="subtitle">
            {`${subTitle}`}
            <span className="bar"></span>
            {`${description}`}
          </p>
          <p className="title">{postDetail?.title || "제목이 들어갑니다"}</p>
          {/* <p>
            {postDetail
              ? `${postDetail.writer} | ${postDetail.date} | 조회 ${postDetail.views} | 추천 ${postDetail.likes}`
              : "작성자 | 날짜 | 조회수 | 추천수"}
          </p> */}
          {postDetail && (
            <div className="horizontalContent">
              <p>{postDetail.writer}</p>
              <span className="bar"></span>
              <p>{postDetail.date}</p>
              <span className="bar"></span>
              <p>조회 {postDetail.views}</p>
              <span className="bar"></span>
              <p>추천 {postDetail.likes}</p>
            </div>
          )}
        </div>
        <div className="content">
          <p>{postDetail?.content || "피드백 해주세요"}</p>
        </div>
        <div className="btns">
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
              <button onClick={handlePostEdit}>수정</button>
              <button onClick={() => handlePostDelete(Number(id))}>삭제</button>
            </>
          )}
          <button
            onClick={() =>
              navigate(
                isMentor === "true"
                  ? "/m/community?category=all&page=1&type=title&keyword=&isMentor=true"
                  : `/m/community?category=${category}`
              )
            }
          >
            목록
          </button>
        </div>
        <div className="inputReplySection">
          <p>
            댓글 {getCommaSeparatedNumber(postDetail?.comments.length || 0)}
          </p>
          <div className="input_default" style={{ height: "105px" }}>
            <textarea id="content" placeholder="댓글을 입력하세요." />
          </div>
          <div className="uploadBtnDiv">
            <button onClick={handleCommentWrite}>등록</button>
          </div>
        </div>
      </section>
      <section className="replyListSection">
        <ul>
          {postDetail?.comments
            .filter((c) => !c.recommentId)
            .map((comment) => (
              <li key={comment.id}>
                <div className="mainReply">
                  <p className="title">{comment.writer}</p>

                  {/* 수정 모드일 때 */}
                  {editingComments[comment.id] ? (
                    <>
                      <div className="input_default">
                        <textarea
                          style={{ height: "50px" }}
                          value={editingContents[comment.id]}
                          onChange={(e) =>
                            setEditingContents((prev) => ({
                              ...prev,
                              [comment.id]: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div
                        className="uploadBtnDiv"
                        style={{ display: "flex", gap: "8px" }}
                      >
                        <button onClick={() => handleEditSave(comment.id)}>
                          저장
                        </button>
                        <button onClick={() => handleEditCancel(comment.id)}>
                          취소
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="content">{comment.content}</p>
                      <p className="date">{comment.date}</p>
                      <div className="bottom_div">
                        {comment.content !== "삭제된 댓글입니다." && (
                          <button
                            onClick={() => handleReplyClick(comment.id)}
                            className="replyBtn"
                          >
                            답글쓰기
                          </button>
                        )}
                        {comment.delYn !== "y" && (
                          <div className="bottomRightDiv">
                            <button
                              className="recomBtn"
                              onClick={() =>
                                handleCommentLike(postDetail!.id, comment.id)
                              }
                            >
                              <img src="/img/recom_icon.png" alt="" />
                              {comment.likes}
                            </button>
                            <>
                              {!comment.isMine && (
                                <>
                                  <button
                                    className="editBtn"
                                    onClick={() =>
                                      handleCommentReport(
                                        Number(id),
                                        comment.id
                                      )
                                    }
                                  >
                                    신고
                                  </button>
                                  <button
                                    className="editBtn"
                                    onClick={() =>
                                      handleCommentBlock(Number(id), comment.id)
                                    }
                                  >
                                    차단
                                  </button>
                                </>
                              )}
                            </>

                            {comment.isMine && (
                              <>
                                <button
                                  className="editBtn"
                                  onClick={() =>
                                    handleEditClick(comment.id, comment.content)
                                  }
                                >
                                  수정
                                </button>
                                <button
                                  className="editBtn"
                                  onClick={() => {
                                    handleCommentRemove(Number(id), comment.id);
                                  }}
                                >
                                  삭제
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* 중첩 댓글(답글) */}
                {postDetail.comments
                  .filter((r) => r.recommentId === comment.id)
                  .map((recomment) => (
                    <div key={recomment.id} className="subReply">
                      {/* 답글 텍스트만 보여 주고, 마찬가지로 isMine 체크 후 수정 UI 추가 가능 */}
                      <div className="flexDiv w-full">
                        <img
                          src="/img/rereply_icon.png"
                          alt=""
                          style={{ width: "12px", height: "12px" }}
                        />
                        <div className="columnDiv w-full">
                          <p className="title">{recomment.writer}</p>
                          <p className="content">{recomment.content}</p>
                          <div className="flexJb w-full">
                            <p style={{ fontSize: "14px", color: "#A8A8A8" }}>
                              {recomment.date}
                            </p>
                            <div className="bottomRightDiv">
                              <button
                                className="recomBtn"
                                onClick={() =>
                                  handleCommentLike(postDetail.id, recomment.id)
                                }
                              >
                                <img src="/img/recom_icon.png" alt="" />
                                {recomment.likes}
                              </button>
                              {/* 답글도 isMine 체크 후 수정 버튼 달아줄 수 있습니다 */}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* 답글 입력란 */}
                {replyInputs[comment.id] && (
                  <div className="subReply" style={{ borderTop: "none" }}>
                    <div className="replyInputSection">
                      <img
                        src="/img/rereply_icon.png"
                        alt=""
                        style={{ width: "12px", height: "12px" }}
                      />
                      <div className="replyInput">
                        <textarea
                          id={`reply-${comment.id}`}
                          placeholder="답글을 입력하세요."
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleReplyWrite(comment.id)}
                      className="uploadBtnDiv"
                      style={{ marginLeft: "auto" }}
                    >
                      등록
                    </button>
                  </div>
                )}
              </li>
            ))}
        </ul>
      </section>

      <MainFooter />
    </div>
  );
}
