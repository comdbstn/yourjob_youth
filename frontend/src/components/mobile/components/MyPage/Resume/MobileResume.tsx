import { useEffect, useState } from "react";
import { axiosInstance } from "../../../../../api/axios";
import { ResumeItem, ResumePage } from "../../../../../types/resume";
import { formatDate } from "../../../../../utils/dateUtils";
import MainFooter from "../../MainFooter/MainFooter";
import MobileMainHeader from "../../MainHeader/MainHeader";
import "./MobileResume.css";
import { Link, useNavigate } from "react-router-dom";
import PostingPagination from "../../../../common/PostingPagination";
import { useAlert } from "../../../../../contexts/AlertContext";
import { MetaTagHelmet } from "../../../../common/MetaTagHelmet";
const MobileResume: React.FC = () => {
  const [resumeList, setResumeList] = useState<ResumeItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const navigate = useNavigate();
  const PAGE_SIZE = 4;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const fetchResumeList = async (page: number) => {
    try {
      const response = await axiosInstance.get<ResumePage>("/api/v1/resumes", {
        params: {
          page: page,
          size: PAGE_SIZE,
        },
      });

      const { content, totalPages, totalElements } = response.data;

      const mappedResumeList = content.map((item: ResumeItem) => ({
        id: item.id,
        title: item.title,
        date: formatDate(new Date(item.date), "yyyy-MM-DD"),
        status: item.status,
        isPublic: item.isPublic,
      }));

      setResumeList(mappedResumeList);
      setTotalPages(totalPages);
      setTotalElements(totalElements);
    } catch (error) {
      console.error("이력서 목록 조회 실패:", error);
      alert("이력서 목록을 불러오는데 실패했습니다.");
    }
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchResumeList(page);
  };
  const handleResumeDelete = async (id: number) => {
    if (
      await customConfirm({
        content: "이력서를 삭제하시겠습니까?",
        confirmLabel: "삭제",
        cancelLabel: "취소",
      })
    ) {
      try {
        const response = await axiosInstance.delete(`/api/v1/resumes/${id}`);
        if (response.status === 200) {
          customAlert({
            content: "이력서가 삭제되었습니다.",
          });
          fetchResumeList(currentPage);
        }
      } catch (error) {
        console.error("이력서 삭제 실패:", error);
        customAlert({
          content: "이력서 삭제에 실패했습니다.",
        });
      }
    }
  };

  useEffect(() => {
    fetchResumeList(1);
  }, []);
  const { customAlert, customConfirm } = useAlert();
  const handleResumeCopy = async (id: number) => {
    if (
      await customConfirm({
        content: "이력서를 복사하시겠습니까?",
        confirmLabel: "복사",
        cancelLabel: "취소",
      })
    ) {
      try {
        const response = await axiosInstance.post(`/api/v1/resumes/${id}/copy`);
        if (response.status === 201) {
          customAlert({
            content: "이력서가 복사되었습니다.",
          });
          fetchResumeList(currentPage);
        }
      } catch (error) {
        console.error("이력서 복사 실패:", error);
        customAlert({
          content: "이력서 복사에 실패했습니다.",
        });
      }
    }
  };

  const handleTogglePublic = async (id: number, currentIsPublic: boolean) => {
    try {
      const response = await axiosInstance.patch(
        `/api/v1/resumes/${id}/public`,
        {
          isPublic: !currentIsPublic,
        }
      );

      if (response.status === 200) {
        setResumeList((prevList) =>
          prevList.map((item) =>
            item.id === id ? { ...item, isPublic: !currentIsPublic } : item
          )
        );
        customAlert({
          content: `이력서의 개인 정보가 ${
            !currentIsPublic ? "공개" : "비공개"
          }로 변경되었습니다.`,
        });
      }
    } catch (error) {
      console.error("이력서 개인 정보 공개 상태 변경 실패:", error);
      customAlert({
        content: "이력서 개인 정보 공개 상태 변경에 실패했습니다.",
      });
    }
  };

  return (
    <div className="mobileResume-container">
      <MetaTagHelmet title="이력서 관리" description="이력서 관리" />
      <MobileMainHeader />
      <h2>이력서 관리</h2>
      <div style={{ padding: "20px", width: "100%" }}>
        <Link to={"/m/mypage/writeResume"} className="blueBtn">
          이력서 작성
        </Link>
      </div>
      <ul>
        {resumeList.map((i, idx) => (
          <li key={idx}>
            <p className="date">{i.date}</p>
            <p>{i.title}</p>
            <div className="btns">
              <button
                onClick={() => {
                  navigate(`/m/mypage/writeResume?id=${i.id}`);
                }}
              >
                수정
              </button>
              <button onClick={() => handleResumeDelete(i.id)}>삭제</button>
              {/* <button
                onClick={() => {
                  navigate(`/m/mypage/writeResume?id=${i.id}&gbn=copy`);
                }}
              >
                복사
              </button> */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePublic(i.id, i.isPublic);
                }}
                className={i.isPublic ? "active" : ""}
              >
                {i.isPublic ? "공개" : "비공개"}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <PostingPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      <MainFooter />
    </div>
  );
};
export default MobileResume;
