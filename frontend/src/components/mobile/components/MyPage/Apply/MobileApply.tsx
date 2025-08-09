import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { applyApi } from "../../../../../api/apply";
import { Apply, ApplyStatusText } from "../../../../../types/apply";
import { formatDate } from "../../../../../utils/dateUtils";
import MainFooter from "../../MainFooter/MainFooter";
import MobileMainHeader from "../../MainHeader/MainHeader";
import "./MobileApply.css";
import PostingPagination from "../../../../common/PostingPagination";

import { downloadFiles } from "../../../../../utils/fileUtils";
import { MetaTagHelmet } from "../../../../common/MetaTagHelmet";
const MobileApply = () => {
  const [applies, setApplies] = useState<Apply[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplies();
  }, [currentPage]);

  const fetchApplies = async () => {
    try {
      const response = await applyApi.getApplies({
        page: currentPage,
        size: pageSize,
      });
      setApplies(
        response.content.map((apply) => ({
          ...apply,
          applyDate: formatDate(new Date(apply.applyDate), "YY.MM.DD"),
        }))
      );
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);

      // setApplies(getDummyApplies().map(apply => ({
      //   ...apply,
      //   applyDate: formatDate(new Date(apply.applyDate), 'YY.MM.DD')
      // })));
      // setTotalPages(1);
      // setTotalElements(getDummyApplies().length);
    } catch (error) {
      console.error("지원 목록 조회 실패:", error);
    }
  };

  const handleRowClick = (applyId: number) => {
    navigate(`/jobs/${applyId}`);
  };

  return (
    <div className="mobileApply-container">
      <MobileMainHeader />
      <MetaTagHelmet title="지원현황" description="지원현황" />
      <h2>지원현황</h2>
      <span className="total">총 {totalElements}건</span>
      <ul>
        {applies.map((i) => (
          <li>
            <a href={`/m/jobPost/detail?jobId=${i.jobId}`}>
              <p className="date">
                {i.applyDate}
                <span className="bar"></span>
                {ApplyStatusText[i.status]}
              </p>
              <div className="middle">
                <p>{i.companyName}</p>
                <p>{i.title}</p>
              </div>
              <button className="applyBtns">
                <img src="/img/mobile/document.png" />
                <a
                  href="javascript:void(0)"
                  onClick={(e) => {
                    e.preventDefault();
                    downloadFiles(
                      i.attachments.map(
                        (attachment) => attachment.fileurl || ""
                      )
                    );
                  }}
                  style={{ fontWeight: "400" }}
                >
                  이력서·포트폴리오 ({i.attachments.length}
                  개)
                </a>
              </button>
            </a>
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
  );
};

export default MobileApply;
