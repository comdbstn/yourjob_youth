// frontend/src/components/member/JoinComplete.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import "./JoinComplete.css";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

interface JoinCompleteResponse {
  message: string;
}

const JoinComplete: React.FC = () => {
  const navigate = useNavigate();
  const [welcomeMessage, setWelcomeMessage] = useState<string>("");
  const API_URL =
    process.env.REACT_APP_API_BASE_URL || "http://13.125.187.22:8082";

  useEffect(() => {
    fetch(API_URL + "/api/v1/auth/joincomplete")
      .then((res) => res.json())
      .then((data: JoinCompleteResponse) => setWelcomeMessage(data.message))
      .catch((err) => {
        console.error("Join complete 메시지 호출 오류:", err);
        setWelcomeMessage("가입을 축하드립니다.");
      });
  }, []);

  const handleLoginClick = () => {
    navigate("/member/userlogin");
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <Layout>
      <MetaTagHelmet title="회원가입 완료" description="회원가입 완료" />
      <div className="container-center-horizontal">
        <div className="mem_container">
          <div className="join_complete">
            {/* 로고 영역 */}
            <Link to="/" className="title">
              <img src="/img/logo.png" alt="YourJob Logo" />
            </Link>
            {/* 가입 완료 메시지 */}
            <h1 className="complete_title">{welcomeMessage}</h1>
            {/* 버튼 영역 */}
            <div className="complete-container">
              <button
                type="button"
                className="form_btn"
                onClick={handleLoginClick}
              >
                로그인
              </button>
              <button
                type="button"
                className="home_btn"
                onClick={handleHomeClick}
              >
                홈으로
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JoinComplete;
