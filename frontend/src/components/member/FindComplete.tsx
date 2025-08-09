import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Layout from "../layout/Layout";
import "./FindComplete.css";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const FindComplete: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [foundId, setFoundId] = useState<string | null>(null);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  useEffect(() => {
    // Get data from location state
    const state = location.state as {
      foundId?: string;
      isPasswordReset?: boolean;
    } | null;

    if (state?.foundId) {
      setFoundId(state.foundId);
    }

    if (state?.isPasswordReset) {
      setIsPasswordReset(true);
    }

    // If no data found, redirect to find id/password page
    if (!state?.foundId && !state?.isPasswordReset) {
      navigate("/member/findidpwd");
    }
  }, [location, navigate]);

  const handleLoginClick = () => {
    navigate("/member/userlogin?tab=corp");
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <Layout>
      <MetaTagHelmet
        title="아이디/비밀번호 찾기 결과"
        description="아이디/비밀번호 찾기 결과"
      />
      <div className="container-center-horizontal">
        <div className="mem_container">
          <div className="find_complete">
            <Link to="/" className="title">
              <img src="/img/logo.png" alt="YourJob Logo" />
            </Link>

            {foundId && (
              <h1 className="find_complete_title">
                회원님의 아이디는 <strong>{foundId}</strong>입니다.
              </h1>
            )}

            {isPasswordReset && (
              <h1 className="find_complete_title">
                임시 비밀번호가 이메일로 발송되었습니다.
              </h1>
            )}

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

export default FindComplete;
