import { useEffect, useState } from "react";
import MainFooter from "../../MainFooter/MainFooter";
import MobileMainHeader from "../../MainHeader/MainHeader";
import MobileApplyPopup from "./components/ApplyPopup";
import "./MobileScrap.css";
import { jobpostApi } from "../../../../../api/jobpost";
import { JobResponse } from "../../../../../app/dummy/jobPost";
import ApplyModal from "../../../../jobpost/ApplyModal";
import MessageModal from "../../../../common/MessageModal";
import PostingPagination from "../../../../common/PostingPagination";
import { isApplyAvailable } from "../../../../../utils/dateUtils";
import { Link, useNavigate } from "react-router-dom";
import {
  fetchJobpostData,
  JobpostDataItem,
} from "../../../../../api/jobpostData";
import { MetaTagHelmet } from "../../../../common/MetaTagHelmet";

const MobileScrap: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false); // 팝업 상태
  const [jobPosts, setJobPosts] = useState<JobResponse[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  // 지역 (국내+해외)
  const [locationData, setLocationData] = useState<JobpostDataItem[]>([]);
  const [domesticLocationData, setDomesticLocationData] = useState<
    JobpostDataItem[]
  >([]);
  const [overseasLocationData, setOverseasLocationData] = useState<
    JobpostDataItem[]
  >([]);
  const mapCodesToLabels = (
    codes: string[] = [],
    list: JobpostDataItem[],
    // 어떤 필드를 레이블로 쓸지 선택 (기본은 level1)
    getLabel: (item: JobpostDataItem) => string = (item) => item.level1 ?? ""
  ): string[] => {
    return codes.map((code) => {
      const found = list.find((item) => item.operationDataId === code);
      return found ? getLabel(found) : code;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const domestic = await fetchJobpostData("00000012");
      const overseas = await fetchJobpostData("00000013");
      setDomesticLocationData(domestic);
      setOverseasLocationData(overseas);
      setLocationData([...domestic, ...overseas]);
    };
    fetchData();
  }, []);

  const [selectedJob, setSelectedJob] = useState<{
    jobId: number;
    companyName: string;
    position: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    fetchJobList(currentPage);
  }, [currentPage]);

  const fetchJobList = (page: number) => {
    jobpostApi
      .getScraps({
        page: page,
        size: 10,
        searchType: "title",
        query: "",
      })
      .then((response) => {
        setJobPosts(response.content || []);
        setTotalPages(response.totalPages || 1);
        setTotalElements(response.totalElements || 0);
      })
      .catch((error) => {
        console.error("Error fetching job list:", error);
      });

    // setJobPosts(getDummyJobposts().content);
    // setTotalPages(getDummyJobposts().totalPages);
    // setTotalElements(getDummyJobposts().totalElements);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedJobIds(jobPosts.map((jobPost) => jobPost.jobId));
    } else {
      setSelectedJobIds([]);
    }
  };

  const handleSelect = (jobId: number) => {
    setSelectedJobIds((prev) => {
      if (prev.includes(jobId)) {
        return prev.filter((id) => id !== jobId);
      } else {
        return [...prev, jobId];
      }
    });
  };

  const handleDelete = async (removeIdx: number) => {
    if (window.confirm("선택한 스크랩을 삭제하시겠습니까?")) {
      try {
        await jobpostApi.deleteScraps([removeIdx]);
        setMessageModalContent("선택한 스크랩이 삭제되었습니다.");
        setShowMessageModal(true);
        fetchJobList(currentPage);
        setSelectedJobIds([]);
      } catch (error) {
        console.error("스크랩 삭제 실패:", error);
      }
    }
  };
  const navigate = useNavigate();
  const handleApply = (scrap: JobResponse) => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      alert("로그인 후 지원해주세요.");
      navigate("/member/join");
      return;
    }
    if (scrap.url) {
      alert("홈페이지로 이동합니다.");
      window.open(scrap.url, "_blank");
    } else {
      setSelectedJob({
        jobId: scrap.jobId,
        companyName: scrap.companyName,
        position: scrap.jobType,
        title: scrap.title,
      });
      setShowApplyModal(true);
    }
  };
  return (
    <>
      {/* 팝업이 열려 있을 때만 표시 */}
      {isPopupOpen && (
        <MobileApplyPopup onClose={() => setIsPopupOpen(false)} />
      )}
      <div className="mobileScrap-container">
        <MetaTagHelmet title="스크랩" description="스크랩" />
        <MobileMainHeader />
        <h2>스크랩</h2>
        <span className="total">총 {totalElements}건</span>
        <ul>
          {jobPosts.map((jobPost) => (
            <li key={jobPost.jobId}>
              {/* <p className="date">
                {formatDate(new Date(jobPost.createdAt), "YY.MM.DD")}
              </p> */}
              <div className="middle">
                <p>{jobPost.companyName}</p>
                <Link to={`/m/jobPost/detail?jobId=${jobPost.jobId}`}>
                  <p>{jobPost.title}</p>
                </Link>
                <p>
                  경력무관 고졸{" "}
                  {mapCodesToLabels(
                    Array.isArray(jobPost.location)
                      ? jobPost.location
                      : [jobPost.location],
                    locationData
                  ).join(", ")}{" "}
                  정규직
                </p>
                <p>
                  {jobPost.jobType} / {jobPost.description}
                </p>
              </div>
              <div className="flexGap10">
                {!isApplyAvailable(jobPost.endDate) ? (
                  <>
                    {jobPost.url ? (
                      <button
                        className="homeBtn"
                        onClick={() => handleApply(jobPost)}
                      >
                        <p>홈페이지 지원</p>
                      </button>
                    ) : (
                      <button
                        className="blueBtn"
                        onClick={() => handleApply(jobPost)}
                      >
                        <p>즉시 지원</p>
                      </button>
                    )}
                  </>
                ) : (
                  <div
                    style={{
                      width: "150px",
                      height: "50px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#a8a8a8",
                    }}
                  >
                    채용마감
                  </div>
                )}

                <button
                  className="applyBtns"
                  onClick={() => {
                    handleDelete(jobPost.jobId);
                  }}
                >
                  <p>삭제</p>
                </button>
              </div>
            </li>
          ))}
        </ul>

        <PostingPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        <MainFooter />
      </div>
      {showApplyModal && selectedJob && (
        <ApplyModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          jobId={selectedJob.jobId}
          companyName={selectedJob.companyName}
          jobTitle={selectedJob.title}
          width="90%"
        />
      )}

      {showMessageModal && (
        <MessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          message={messageModalContent}
          type="success"
        />
      )}
    </>
  );
};

export default MobileScrap;
