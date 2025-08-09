import { useNavigate } from "react-router-dom";
import MainFooter from "../../MainFooter/MainFooter";
import MobileMainHeader from "../../MainHeader/MainHeader";
import "./MobileManagePost.css";
import { useState, useEffect } from "react";
import { axiosInstance } from "../../../../../api/axios";
import {
  JobPost,
  JobPostStatus,
  JobPostResponse,
  ApplicantStatus,
  JobPostCountResponse,
} from "../../../../../types/jobPost";
import PostingPagination from "../../../../common/PostingPagination";
import { formatDate } from "../../../../../utils/dateUtils";
import { MetaTagHelmet } from "../../../../common/MetaTagHelmet";
// 상태별 표시 텍스트
const JOB_POST_STATUS_TEXT: Record<JobPostStatus, string> = {
  [JobPostStatus.ONGOING]: "진행중",
  [JobPostStatus.CLOSED]: "접수마감",
  [JobPostStatus.ENDED]: "채용종료",
  // [JobPostStatus.TEMP]: '임시저장'
};

// 지원자 상태별 표시 텍스트
const APPLICANT_STATUS_TEXT: Record<ApplicantStatus, string> = {
  [ApplicantStatus.UNREAD]: "미열람",
  [ApplicantStatus.PENDING]: "미심사",
  [ApplicantStatus.PASSED]: "서류합격",
  [ApplicantStatus.FAILED]: "불합격",
  [ApplicantStatus.FINAL]: "최종합격",
};
export default function MobileManagePost() {
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
    navigate(`/m/company/writeRecruit?id=${postId}`);
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
    <div className="MobileManagePostContainer">
      <MetaTagHelmet title="공고·지원자관리" description="공고·지원자관리" />
      <MobileMainHeader />
      <div className="darkBg">
        <h2>공고·지원자관리</h2>
        <div className="board-wrap">
          <div className="board">
            <div />
            {(Object.values(JobPostStatus) as JobPostStatus[]).map((status) => (
              <div className="row" key={status}>
                <p>{jobPostCount[status]}</p>
                <p>{JOB_POST_STATUS_TEXT[status]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <section className="rows">
        <ul>
          {jobPosts?.map((post, idx) => (
            <li className="rowType1" key={post.id}>
              <div className="rowHeader">
                <div className="flexGap10" style={{ marginBottom: "7px" }}>
                  <p className="processingLabel">진행중</p>
                  <p style={{ display: "flex", alignItems: "center" }}>
                    <span>
                      지원자 <strong>{post.total_applier}명</strong>
                    </span>
                    <span className="bar"></span>
                    <button
                      onClick={() => {
                        navigate(
                          `/m/company/managePost/document?id=${post.id}`
                        );
                      }}
                      style={{
                        padding: "0",
                        border: "0",
                        fontSize: "inherit",
                        height: "auto",
                        width: "auto",
                      }}
                    >
                      미열람 이력서 <strong>{post.unread}건</strong>
                    </button>
                  </p>
                </div>
                <div>
                  <p className="titleLabel">{post.title}</p>
                  <p style={{ fontWeight: 400 }}>
                    {formatDate(new Date(post.registeredDate), "YYYY.MM.DD")}
                    &nbsp; 등록<span className="bar"></span>
                    {formatDate(new Date(post.startDate), "YYYY.MM.DD")}~
                    {formatDate(new Date(post.endDate), "YYYY.MM.DD")}
                  </p>
                </div>
              </div>
              <div className="gridSection">
                <button
                  onClick={() => {
                    // navigate(`/m/company/managePost/document?id=${post.id}`);
                    navigate(`/m/jobPost/detail?jobId=${post.id}`);
                  }}
                >
                  공고보기
                </button>
                <button onClick={() => handleModifyPost(post.id)}>수정</button>
                {/* <button>복사</button> */}
                <button onClick={() => handleDeletePost(post.id)}>삭제</button>
                <button
                  // className="mt-10"
                  onClick={() => handleClosePost(post.id)}
                >
                  채용 마감하기
                </button>
              </div>
            </li>
          ))}
          {/* <li className="rowType1">
            <div className="rowHeader">
              <div className="flexGap10">
                <p className="processingLabel">진행중</p>
                <p>
                  지원자<strong>2명</strong> | 미열람 이력서{" "}
                  <strong>1건</strong>
                </p>
              </div>
              <div>
                <p className="titleLabel">
                  [(주)유어잡]문구, 캐릭터 디자인 정규직 채용(경력&...
                </p>
                <p>2024.10.10등록 | 2024.10.11~2024.11.11</p>
              </div>
            </div>
            <div className="gridSection">
              <button
                onClick={() => {
                  navigate("/m/company/managePost/document");
                }}
              >
                공고보기
              </button>
              <button>수정</button>
              <button>복사</button>
              <button>삭제</button>
            </div>
            <button className="mt-10">채용 마감하기</button>
          </li>
          <li className="rowType2">
            {" "}
            <div className="rowHeader">
              <div className="flexGap10">
                <p className="processingLabel">진행중</p>
                <p>
                  지원자<strong>2명</strong> | 미열람 이력서{" "}
                  <strong>1건</strong>
                </p>
              </div>
              <div>
                <p className="titleLabel">
                  [(주)유어잡]문구, 캐릭터 디자인 정규직 채용(경력&...
                </p>
                <p>2024.10.10등록 | 2024.10.11~2024.11.11</p>
              </div>
            </div>{" "}
            <div className="gridSection">
              <button>공고보기</button>

              <button>복사</button>
              <button>삭제</button>
            </div>
          </li> */}
        </ul>
      </section>
      <PostingPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      <MainFooter />
    </div>
  );
}
