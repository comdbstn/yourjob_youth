import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UserLogin.css";
import "../../styles/nomal.css";
import { axiosInstance } from "../../api/axios";
import useMobile from "../../hooks/useMobile";
import { useAlert } from "../../contexts/AlertContext";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const UserLogin: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useMobile();
  const { customAlert } = useAlert();
  
  const [activeTab, setActiveTab] = useState<"normal" | "corp">(
    (() => {
      const searchParams = new URLSearchParams(window.location.search);
      return (searchParams.get("tab") as "normal" | "corp") || "normal";
    })()
  );

  const [emailLogin, setEmailLogin] = useState({
    email: "",
    password: "",
  });

  const [corpLogin, setCorpLogin] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8082";

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginData = activeTab === "normal" ? emailLogin : corpLogin;
      
      if (!loginData.email || !loginData.password) {
        customAlert({ content: "이메일과 비밀번호를 입력해주세요." });
        return;
      }

      const response = await axiosInstance.post("/api/v1/auth/login", {
        email: loginData.email,
        password: loginData.password,
        userType: activeTab === "normal" ? "JOB_SEEKER" : "COMPANY"
      });

      if (response.data.success) {
        // 로그인 성공
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("userId", response.data.data.userId);
        localStorage.setItem("userType", activeTab === "normal" ? "JOB_SEEKER" : "COMPANY");
        
        sessionStorage.setItem("userId", response.data.data.userId);
        sessionStorage.setItem("userType", activeTab === "normal" ? "JOB_SEEKER" : "COMPANY");

        customAlert({ content: "로그인 되었습니다." });
        
        // 리다이렉트
        if (activeTab === "normal") {
          navigate("/");
        } else {
          navigate("/corpmem/mypage");
        }
      } else {
        customAlert({ content: response.data.message || "로그인에 실패했습니다." });
      }
    } catch (error: any) {
      console.error("로그인 오류:", error);
      if (error.response?.status === 401) {
        customAlert({ content: "이메일 또는 비밀번호가 올바르지 않습니다." });
      } else {
        customAlert({ content: "로그인 중 오류가 발생했습니다. 다시 시도해주세요." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (activeTab === "normal") {
      setEmailLogin(prev => ({ ...prev, [field]: value }));
    } else {
      setCorpLogin(prev => ({ ...prev, [field]: value }));
    }
  };

  const currentLogin = activeTab === "normal" ? emailLogin : corpLogin;

  return (
    <>
      {isMobile ? (
        <div className="mobile-login-container">
          <MetaTagHelmet title="로그인" description="로그인" />
          <div className="mobile-login">
            <Link to="/" className="mobile-logo">
              <img src="/img/logo.png" alt="로고" />
            </Link>
            
            <div className="mobile-login-tabs">
              <button
                className={activeTab === "normal" ? "active" : ""}
                onClick={() => setActiveTab("normal")}
              >
                일반회원
              </button>
              <button
                className={activeTab === "corp" ? "active" : ""}
                onClick={() => setActiveTab("corp")}
              >
                기업회원
              </button>
            </div>

            <form onSubmit={handleEmailLogin} className="mobile-login-form">
              <div className="form-group">
                <input
                  type="email"
                  placeholder="이메일 주소"
                  value={currentLogin.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={currentLogin.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="login-button"
                disabled={loading}
              >
                {loading ? "로그인 중..." : "로그인"}
              </button>
            </form>

            <div className="mobile-login-links">
              <Link to="/member/join">회원가입</Link>
              <Link to="/member/find-password">비밀번호 찾기</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="container-center-horizontal">
          <MetaTagHelmet title="로그인" description="로그인" />
          <div className="login_container">
            <div className="login">
              <Link to="/" className="title">
                <img src="/img/logo.png" alt="로고" />
              </Link>

              <div className="loginTab">
                <a
                  href="#!"
                  className={activeTab === "normal" ? "active" : ""}
                  onClick={() => {
                    setActiveTab("normal");
                    navigate("/member/userlogin?tab=normal");
                  }}
                >
                  일반회원
                </a>
                <a
                  href="#!"
                  className={activeTab === "corp" ? "active" : ""}
                  onClick={() => {
                    setActiveTab("corp");
                    navigate("/member/userlogin?tab=corp");
                  }}
                >
                  기업회원
                </a>
              </div>

              <form onSubmit={handleEmailLogin} className="email-login-form">
                <div className="input-group">
                  <label>이메일</label>
                  <input
                    type="email"
                    placeholder="이메일을 입력하세요"
                    value={currentLogin.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>비밀번호</label>
                  <input
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={currentLogin.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="login-submit-button"
                  disabled={loading}
                >
                  {loading ? "로그인 중..." : "로그인"}
                </button>
              </form>

              <div className="login-links">
                <Link to="/member/join" className="signup-link">
                  아직 회원이 아니신가요? <strong>회원가입</strong>
                </Link>
                <Link to="/member/find-password" className="forgot-password">
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
            </div>
          </div>

          <style>{`
            .container-center-horizontal {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f8fafc;
              padding: 2rem;
            }

            .login_container {
              background: white;
              border-radius: 12px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
              padding: 3rem;
              width: 100%;
              max-width: 450px;
            }

            .title {
              display: flex;
              justify-content: center;
              margin-bottom: 2rem;
            }

            .title img {
              height: 60px;
            }

            .loginTab {
              display: flex;
              border-bottom: 1px solid #e2e8f0;
              margin-bottom: 2rem;
            }

            .loginTab a {
              flex: 1;
              padding: 1rem;
              text-align: center;
              text-decoration: none;
              color: #718096;
              font-weight: 500;
              border-bottom: 2px solid transparent;
              transition: all 0.2s;
            }

            .loginTab a.active {
              color: #667eea;
              border-bottom-color: #667eea;
            }

            .loginTab a:hover {
              color: #667eea;
            }

            .email-login-form {
              margin-bottom: 2rem;
            }

            .input-group {
              margin-bottom: 1.5rem;
            }

            .input-group label {
              display: block;
              margin-bottom: 0.5rem;
              font-weight: 500;
              color: #2d3748;
            }

            .input-group input {
              width: 100%;
              padding: 0.75rem 1rem;
              border: 2px solid #e2e8f0;
              border-radius: 8px;
              font-size: 1rem;
              transition: border-color 0.2s;
            }

            .input-group input:focus {
              outline: none;
              border-color: #667eea;
            }

            .login-submit-button {
              width: 100%;
              padding: 0.875rem;
              background: #667eea;
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              transition: background 0.2s;
            }

            .login-submit-button:hover:not(:disabled) {
              background: #5a6fd8;
            }

            .login-submit-button:disabled {
              background: #a0aec0;
              cursor: not-allowed;
            }

            .login-links {
              text-align: center;
              padding-top: 1.5rem;
              border-top: 1px solid #e2e8f0;
            }

            .signup-link {
              display: block;
              color: #4a5568;
              text-decoration: none;
              margin-bottom: 1rem;
            }

            .signup-link strong {
              color: #667eea;
            }

            .signup-link:hover strong {
              text-decoration: underline;
            }

            .forgot-password {
              color: #718096;
              text-decoration: none;
              font-size: 0.9rem;
            }

            .forgot-password:hover {
              color: #667eea;
              text-decoration: underline;
            }

            .mobile-login-container {
              min-height: 100vh;
              background: #f8fafc;
              padding: 2rem 1rem;
            }

            .mobile-login {
              max-width: 400px;
              margin: 0 auto;
            }

            .mobile-logo {
              display: flex;
              justify-content: center;
              margin-bottom: 2rem;
            }

            .mobile-logo img {
              height: 50px;
            }

            .mobile-login-tabs {
              display: flex;
              background: white;
              border-radius: 8px;
              margin-bottom: 2rem;
              overflow: hidden;
            }

            .mobile-login-tabs button {
              flex: 1;
              padding: 1rem;
              background: white;
              border: none;
              color: #718096;
              font-weight: 500;
              cursor: pointer;
            }

            .mobile-login-tabs button.active {
              background: #667eea;
              color: white;
            }

            .mobile-login-form {
              background: white;
              border-radius: 12px;
              padding: 2rem;
              margin-bottom: 2rem;
            }

            .form-group {
              margin-bottom: 1.5rem;
            }

            .form-group input {
              width: 100%;
              padding: 0.875rem;
              border: 2px solid #e2e8f0;
              border-radius: 8px;
              font-size: 1rem;
            }

            .form-group input:focus {
              outline: none;
              border-color: #667eea;
            }

            .login-button {
              width: 100%;
              padding: 0.875rem;
              background: #667eea;
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
            }

            .login-button:disabled {
              background: #a0aec0;
            }

            .mobile-login-links {
              display: flex;
              justify-content: space-between;
              background: white;
              border-radius: 8px;
              padding: 1rem;
            }

            .mobile-login-links a {
              color: #667eea;
              text-decoration: none;
              font-size: 0.9rem;
            }

            @media (max-width: 768px) {
              .container-center-horizontal {
                padding: 1rem;
              }
              
              .login_container {
                padding: 2rem;
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default UserLogin;