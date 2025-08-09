import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import CorpLayout from "../layout/CorpLayout";
import {
  JobPost,
  JobPostStatus,
  ApplicantStatus,
  JobPostResponse,
  JobPostCountResponse,
} from "../../types/jobPost";
import { axiosInstance } from "../../api/axios";
import "../../../public/css/corpmypage.css";
import PostingPagination from "../common/PostingPagination";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

// 상태별 표시 텍스트
export const JOB_POST_STATUS_TEXT: Record<JobPostStatus, string> = {
  [JobPostStatus.ONGOING]: "진행중",
  [JobPostStatus.CLOSED]: "접수마감",
  [JobPostStatus.ENDED]: "채용종료",
  // [JobPostStatus.TEMP]: '임시저장'
};

const Applicant: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<JobPostStatus>(
    JobPostStatus.ONGOING
  );
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const [jobPostCount, setJobPostCount] = useState<JobPostCountResponse>({
    [JobPostStatus.ONGOING]: 0,
    [JobPostStatus.CLOSED]: 0,
    [JobPostStatus.ENDED]: 0,
    // [JobPostStatus.TEMP]: 0,
  });

  useEffect(() => {
    fetchJobPosts(activeTab);
    fetchJobPostCount();
  }, [activeTab, currentPage]);

  // 공고 목록 조회
  const fetchJobPosts = async (status: JobPostStatus) => {
    try {
      const response = await axiosInstance.get<JobPostResponse>(
        `/api/v1/corpmem/posts`,
        {
          params: {
            status: status,
            query: searchKeyword,
            page: currentPage ? currentPage : 1,
            size: 4,
          },
        }
      );

      setJobPosts(response.data.content);
      setCurrentPage(response.data.page);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("공고 목록 조회 실패:", error);
    }
  };

  // 공고 상태별 개수 조회
  const fetchJobPostCount = async () => {
    try {
      const response = await axiosInstance.get<JobPostCountResponse>(
        `/api/v1/corpmem/posts/count`
      );
      setJobPostCount(response.data);
    } catch (error) {
      console.error("공고 상태별 개수 조회 실패:", error);
    }
  };

  // 공고 상세 보기
  const handleViewPost = (postId: number) => {
    navigate(`/corpmem/jobdetail/${postId}`);
  };

  // 공고 수정
  const handleModifyPost = (postId: number) => {
    navigate(`/corpmem/jobpost/${postId}`);
  };

  // 공고 복사
  const handleCopyPost = (postId: number) => {
    // TODO: 공고 복사 API 연동 필요
    // navigate(`/corpmem/jobpost/${postId}`);
    console.log("공고 복사");
  };

  // 공고 마감
  const handleClosePost = async (postId: number) => {
    try {
      if (window.confirm("공고를 마감하시겠습니까?")) {
        await axiosInstance.patch(`/api/v1/corpmem/posts/${postId}/close`);
        console.log("공고 마감");
        await fetchJobPosts(activeTab);
        fetchJobPostCount();
      }
    } catch (error) {
      console.error("공고 마감 실패:", error);
    }
  };

  // 공고 삭제
  const handleDeletePost = async (postId: number) => {
    try {
      if (window.confirm("공고를 삭제하시겠습니까?")) {
        await axiosInstance.delete(`/api/v1/corpmem/posts/${postId}`);
        console.log("공고 삭제");
        await fetchJobPosts(activeTab);
        fetchJobPostCount();
      }
    } catch (error) {
      console.error("공고 삭제 실패:", error);
    }
  };

  // 검색 처리
  const handleSearch = async () => {
    try {
      const response = await axiosInstance.get(`/api/v1/corpmem/posts`, {
        params: {
          status: activeTab,
          query: searchKeyword,
          page: currentPage,
          size: 4,
        },
      });

      setJobPosts(response.data.content);
      setCurrentPage(response.data.page);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("검색 실패:", error);
    }
  };

  // 페이지 변경 처리
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <CorpLayout>
      <MetaTagHelmet title="채용공고" description="채용공고" />
      <div className="container-center-horizontal">
        <div className="crop-wrap screen">
          <div className="container container-col">
            <div className="head_txt">채용공고</div>

            <div className="tabBox">
              <div className="tabMenu">
                {(Object.values(JobPostStatus) as JobPostStatus[]).map(
                  (status) => (
                    <Link
                      key={status}
                      to=""
                      className={activeTab === status ? "active" : ""}
                      onClick={() => {
                        setActiveTab(status);
                        setCurrentPage(1);
                      }}
                    >
                      {JOB_POST_STATUS_TEXT[status]} {jobPostCount[status]}
                    </Link>
                  )
                )}
              </div>

              <div className="search_box">
                <input
                  type="search"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  className="form-control search_form"
                  placeholder="검색어를 입력하세요."
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

            {jobPosts &&
              jobPosts.map((post) => (
                <div key={`${post.id}_${post.status}`} className="item_list">
                  <div className="list_info col2">
                    <p
                      className={
                        post.status === JobPostStatus.ONGOING ? "pcolor" : ""
                      }
                    >
                      {JOB_POST_STATUS_TEXT[post.status]}
                    </p>
                    <h3>{post.title}</h3>
                    <ul>
                      <li className="line">공고번호 {post.postNumber}</li>
                      <li className="line">
                        {post.startDate}~{post.endDate}
                      </li>
                      <li>{post.registeredDate} 등록</li>
                    </ul>
                    <div className="btnGroup">
                      <button
                        type="button"
                        className="aBtn"
                        onClick={() => handleViewPost(post.id)}
                      >
                        공고 보기
                      </button>
                      {post.status === JobPostStatus.ONGOING && (
                        <button
                          type="button"
                          className="aBtn"
                          onClick={() => handleModifyPost(post.id)}
                        >
                          수정
                        </button>
                      )}
                      {/* TODO: 데모 간 비활성화 처리 */}
                      {/* <button 
                      type="button" 
                      className="aBtn" 
                      onClick={() => handleCopyPost(post.id)}
                    >
                      복사
                    </button> */}
                      {post.status === JobPostStatus.ONGOING && (
                        <button
                          type="button"
                          className="aBtn"
                          onClick={() => handleClosePost(post.id)}
                        >
                          마감
                        </button>
                      )}
                      <button
                        type="button"
                        className="aBtn"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  <div className="list_data col2">
                    <Link to={`/corpmem/applicant/${post.id}`}>
                      <div className="circle bg">
                        <h2>{post.total_applier}</h2>
                        <p>전체 지원자</p>
                      </div>
                    </Link>
                    <Link
                      to={`/corpmem/applicant/${post.id}?filter=${ApplicantStatus.UNREAD}`}
                    >
                      <div className="circle">
                        <h2>{post.unread}</h2>
                        <p>미열람</p>
                      </div>
                    </Link>
                    <Link
                      to={`/corpmem/applicant/${post.id}?filter=${ApplicantStatus.PENDING}`}
                    >
                      <div className="circle">
                        <h2>{post.pending}</h2>
                        <p>미심사</p>
                      </div>
                    </Link>
                    <Link
                      to={`/corpmem/applicant/${post.id}?filter=${ApplicantStatus.PASSED}`}
                    >
                      <div className="circle">
                        <h2>{post.paper_passed}</h2>
                        <p>서류합격</p>
                      </div>
                    </Link>
                    <Link
                      to={`/corpmem/applicant/${post.id}?filter=${ApplicantStatus.FINAL}`}
                    >
                      <div className="circle">
                        <h2>{post.final_passed}</h2>
                        <p>최종합격</p>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}

            {/* page */}
            <PostingPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
            {/* page end */}
          </div>
        </div>
      </div>
    </CorpLayout>
  );
};

export default Applicant;
