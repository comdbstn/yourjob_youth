import { useLocation, useNavigate, useParams } from "react-router-dom";
import MainFooter from "../../MainFooter/MainFooter";
import MobileMainHeader from "../../MainHeader/MainHeader";
import "./MobileAcceptView.css";
import { useEffect, useState } from "react";
import { AcceptDetailType } from "../../../../../types/accept";
import { acceptApi } from "../../../../../api/accept";
import Accordion from "./Accordion";
import { MetaTagHelmet } from "../../../../common/MetaTagHelmet";
export default function MobileAcceptView() {
  const navigate = useNavigate();

  const [detail, setDetail] = useState<AcceptDetailType | null>(null);
  const [isExpanded, setIsExpanded] = useState<{ [key: number]: boolean }>({});
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
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
    }
  };

  const toggleAnswer = (index: number) => {
    setIsExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="mobileAcceptView_container">
      <MetaTagHelmet
        title={`${detail?.resume.companyName} 합격자소서`}
        description={`${detail?.resume.companyName} 합격자소서 상세 페이지`}
      />
      <MobileMainHeader />
      <section className="contentSection pb-0 pt-35">
        <div className="content">
          <p className="grayFont subtitle">{detail?.resume.companyName}</p>
          <p className="infotitle">
            {detail?.resume.title}&nbsp;
            <span>합격자소서</span>
          </p>
          <p className="grayFont info">
            합격자 정보<span className="bar"></span>
            {detail?.resume.schoolRegion} {detail?.resume.schoolType}{" "}
            {detail?.resume.major} 학점 {detail?.resume.gpa}
          </p>
        </div>
      </section>
      <section className="contentSection">
        {detail?.answers.map((v, i) => (
          <Accordion key={i} title={v.questionText} defaultOpen={i === 0}>
            {v.answerText}
          </Accordion>

          // <div className="content" style={{ background: "white" }}>
          //   <p className="title">{i.questionText}</p>
          //   <p className="desc">{i.answerText}</p>
          // </div>
        ))}
      </section>
      <MainFooter />
    </div>
  );
}
