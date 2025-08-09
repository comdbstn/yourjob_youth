import { useNavigate } from "react-router-dom";
import "./MainFooter.css";
const MainFooter: React.FC = () => {
  const navigate = useNavigate();
  return (
    <footer className="mobile-mainFooter-container">
      <div className="headers">
        <button
          onClick={() => {
            navigate("/m/termsView?gbn=terms");
          }}
        >
          이용약관
        </button>
        <button
          onClick={() => {
            navigate("/m/termsView?gbn=info");
          }}
        >
          개인정보처리방침
        </button>
      </div>
      <div className="footers">
        <p>사업자등록번호 : 378-88-03422</p>
        <p>고객센터 : 1644-9988<span className="bar"></span>FAX : 0508-928-0728</p>
        <p>서울특별시 광진구 광나루로19길 23, 103호</p>
        <p>Copyright ©아이비리거. All rights reserved.</p>
      </div>
    </footer>
  );
};
export default MainFooter;
