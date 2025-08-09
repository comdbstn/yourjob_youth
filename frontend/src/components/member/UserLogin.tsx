// frontend/src/components/member/UserLogin.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import firebaseApp from "../../firebaseConfig";
import "./UserLogin.css";
import "../../styles/nomal.css";
import { firebaseOAuth, oauthCallback } from "../../app/slices/authSlice";
import type { AppDispatch } from "../../app/store";
import { axiosInstance } from "../../api/axios";
import axios from "axios";
import useMobile from "../../hooks/useMobile";
import { useAlert } from "../../contexts/AlertContext";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const UserLogin: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"normal" | "corp">(
    (() => {
      const searchParams = new URLSearchParams(window.location.search);
      return (searchParams.get("tab") as "normal" | "corp") || "normal";
    })()
  );
  const [showEmailPopup, setShowEmailPopup] = useState(false);

  const [emailLogin, setEmailLogin] = useState({
    email: "",
    password: "",
  });

  const [corpLogin, setCorpLogin] = useState({
    email: "",
    password: "",
  });

  const API_URL =
    process.env.REACT_APP_API_BASE_URL || "https://localhost:8082";
  const OAUTH2_REDIRECT_URI = "https://www.urjob.kr/oauth2/redirect";
  //const API_URL = "http://13.125.187.22:8082";
  //const OAUTH2_REDIRECT_URI = "http://13.125.187.22:3000/oauth2/redirect";
  const handleNaverLogin = async (): Promise<void> => {
    try {
      const redirectUri = OAUTH2_REDIRECT_URI; // 예: http://localhost:3000/oauth2/redirect
      const loginUrl =
        API_URL +
        `/api/v1/oauth/authorization/naver?redirect_uri=${encodeURIComponent(
          redirectUri
        )}`;

      window.location.href = loginUrl;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(
          "OAuth 로그인 실패: " +
            (error.response?.data?.message ||
              error.message ||
              "알 수 없는 오류")
        );
      } else {
        alert(
          "OAuth 로그인 실패: " +
            ((error as Error).message || "알 수 없는 오류")
        );
      }
    }
  };

  const handleGoogleLogin = async (): Promise<void> => {
    try {
      const redirectUri = OAUTH2_REDIRECT_URI; // 예: http://localhost:3000/oauth2/redirect
      const loginUrl =
        API_URL +
        `/api/v1/oauth/authorization/google?redirect_uri=${encodeURIComponent(
          redirectUri
        )}`;

      window.location.href = loginUrl;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(
          "OAuth 로그인 실패: " +
            (error.response?.data?.message ||
              error.message ||
              "알 수 없는 오류")
        );
      } else {
        alert(
          "OAuth 로그인 실패: " +
            ((error as Error).message || "알 수 없는 오류")
        );
      }
    }
  };

  const handleKakoLogin = async (): Promise<void> => {
    try {
      const redirectUri = OAUTH2_REDIRECT_URI; // 예: http://localhost:3000/oauth2/redirect
      const loginUrl =
        API_URL +
        `/api/v1/oauth/authorization/kakao?redirect_uri=${encodeURIComponent(
          redirectUri
        )}`;

      window.location.href = loginUrl;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(
          "OAuth 로그인 실패: " +
            (error.response?.data?.message ||
              error.message ||
              "알 수 없는 오류")
        );
      } else {
        alert(
          "OAuth 로그인 실패: " +
            ((error as Error).message || "알 수 없는 오류")
        );
      }
    }
  };

  /*const handleGoogleLogin = async (): Promise<void> => {
    const auth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      dispatch(firebaseOAuth(idToken))
        .unwrap()
        .then(() => {
          alert("Google 로그인 성공");
          navigate("/");
        })
        .catch((err: string) => {
          alert("Google 로그인 실패: " + err);
        });
    } catch (error: any) {
      alert("Google 로그인 오류: " + error.message);
    }
  };*/

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailLogin((prev) => ({ ...prev, [name]: value }));
  };

  const handleCorpEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCorpLogin((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailLogin = async (): Promise<void> => {
    try {
      const { email, password } = emailLogin;
      if (email === "" || password === "") {
        customAlert({
          content: "계정과 비밀번호를 입력해주세요.",
        });
        return;
      }
      const response = await axiosInstance.post("/api/v1/auth/login", {
        email,
        password,
      });

      const { token, userId, userType } = response.data;

      // 토큰 저장
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("userType", userType);
      sessionStorage.setItem("userId", userId);
      sessionStorage.setItem("userType", userType);

      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        let errorMessage =
          error.response?.data?.message || error.message || "알 수 없는 오류";

        if (error.response?.status === 403) {
          errorMessage = "비밀번호가 일치하지 않습니다.";
        }

        if (error.response?.status === 423) {
          errorMessage = "차단된 유저입니다. 관리자에게 문의하세요.";
        }

        if (
          error.response?.status === 400 &&
          error.response?.data?.message?.includes("기업회원")
        ) {
          errorMessage = "기업회원은 기업회원 로그인을 이용해주세요.";
        }

        alert(`이메일 로그인 실패: ${errorMessage}`);
      } else {
        alert(
          `이메일 로그인 실패: ${(error as Error).message || "알 수 없는 오류"}`
        );
      }
    }
  };
  const { customAlert } = useAlert();
  const handleCorpEmailLogin = async (): Promise<void> => {
    try {
      const { email, password } = corpLogin;

      if (email === "" || password === "") {
        customAlert({
          content: "계정과 비밀번호를 입력해주세요.",
        });
        return;
      }

      const response = await axiosInstance.post("/api/v1/auth/corplogin", {
        email,
        password,
      });

      const { token, userId, userType } = response.data;

      // 토큰 저장
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("userType", userType);
      sessionStorage.setItem("userId", userId);
      sessionStorage.setItem("userType", userType);

      navigate("/corpmem/mypage");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        let errorMessage =
          error.response?.data?.message || error.message || "알 수 없는 오류";
        if (error.response?.status === 403) {
          errorMessage = "비밀번호가 일치하지 않습니다.";
        }
        alert("계정 혹은 비밀번호가 일치하지 않습니다");
      } else {
        alert(
          `기업 이메일 로그인 실패: ${
            (error as Error).message || "알 수 없는 오류"
          }`
        );
      }
    }
  };
  const isMobile = useMobile();

  return (
    <>
      {isMobile ? (
        <>
          <div className="container-center-horizontal">
            <div className="login_container_mobile">
              <div className="header">
                <p className="notosanskr-normal-block-30px">URJOB</p>
              </div>
              <div className="main_btns">
                <button>
                  <img
                    className="naver_icon"
                    src="/img/vector-1.svg"
                    alt="naver_icon"
                  />{" "}
                  <p>네이버로 로그인</p>
                </button>
                <button>
                  <img
                    className="kakao_icon"
                    src="/img/group-1124@2x.png"
                    alt="kakao_icon"
                  />
                  <p>카카오톡으로 로그인</p>
                </button>
                {/* <button>
                  <img
                    className="apple_icon"
                    src="/img/group-5@2x.png"
                    alt="apple_icon"
                  />
                  <p>Apple로 로그인</p>
                </button> */}
                <button>
                  <img
                    className="gmail_icon"
                    src="/img/group-1122@2x.png"
                    alt="gmail_icon"
                  />
                  <p>Google로 로그인</p>
                </button>
              </div>
              <p className="mt-15 mb-15 or">or</p>
              <button className="bottomBtn">기업회원 로그인</button>
              <button className="mt-15 bottomLabel">
                <Link to="/member/join">회원가입</Link>
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {" "}
          <div className="container-center-horizontal">
            <MetaTagHelmet title="로그인" description="로그인" />
            <div className="login_container">
              <div className="login">
                <Link to="/" className="title">
                  <img src="/img/logo.png"></img>
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

                {activeTab === "normal" && (
                  <>
                    <div className="social_login_buttons">
                      <button
                        type="button"
                        className="naverBtn overlap"
                        onClick={handleNaverLogin}
                      >
                        <img
                          className="naver_icon"
                          src="/img/vector-1.svg"
                          alt="naver_icon"
                        />
                        <div className="text white_txt">네이버로 로그인</div>
                      </button>
                      <button
                        type="button"
                        className="kakaoBtn overlap"
                        onClick={handleKakoLogin}
                      >
                        <img
                          className="kakao_icon"
                          src="/img/group-1124@2x.png"
                          alt="kakao_icon"
                        />
                        <div className="text">카카오톡으로 로그인</div>
                      </button>
                      {/* <button
                        type="button"
                        className="appleBtn overlap"
                        onClick={() => alert("Apple 로그인 기능 미구현")}
                      >
                        <img
                          className="apple_icon"
                          src="/img/group-5@2x.png"
                          alt="apple_icon"
                        />
                        <div className="text white_txt">Apple로 로그인</div>
                      </button> */}
                      <button
                        type="button"
                        className="gmailBtn overlap"
                        onClick={handleGoogleLogin}
                      >
                        <img
                          className="gmail_icon"
                          src="/img/group-1122@2x.png"
                          alt="gmail_icon"
                        />
                        <div className="text">Google로 로그인</div>
                      </button>
                      <button
                        type="button"
                        className="emailLoginBtn overlap"
                        onClick={() => setShowEmailPopup(true)}
                      >
                        <img
                          className="email_icon"
                          src="/img/group-1123@2x.png"
                          alt="email_icon"
                        />
                        <div className="text">이메일로 로그인</div>
                      </button>
                    </div>

                    {showEmailPopup && (
                      <div className="email_login_popup formBox">
                        <div className="popup_content">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleEmailLogin();
                            }}
                          >
                            <input
                              type="email"
                              name="email"
                              className="form-control input"
                              placeholder="이메일 주소"
                              value={emailLogin.email}
                              onChange={handleEmailChange}
                            />
                            <input
                              type="password"
                              name="password"
                              className="form-control input"
                              placeholder="비밀번호"
                              value={emailLogin.password}
                              onChange={handleEmailChange}
                            />
                            <div className="button_container">
                              <button type="submit" className="btn btn-primary">
                                로그인
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowEmailPopup(false)}
                              >
                                닫기
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        width: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        className="signup_link"
                        style={{ textAlign: "start", width: "100px" }}
                      >
                        <Link
                          to="/member/join"
                          className="signup_link_txt"
                          style={{ width: "50px", textAlign: "start" }}
                        >
                          회원가입
                        </Link>
                      </div>
                      <div
                        className="signup_link"
                        style={{ textAlign: "start", width: "180px" }}
                      >
                        <Link
                          to="/member/findidpwd?gbn=user"
                          className="signup_link_txt"
                        >
                          아이디 | 비밀번호 찾기
                        </Link>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "corp" && (
                  <>
                    <div className="email_login_popup formBox">
                      <div className="popup_content">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleCorpEmailLogin();
                          }}
                        >
                          <label className="label" htmlFor="email">
                            아이디
                          </label>
                          <input
                            type="text"
                            name="email"
                            className="form-control input"
                            style={{ marginBottom: "10px", marginTop: "10px" }}
                            placeholder="아이디"
                            value={corpLogin.email}
                            onChange={handleCorpEmailChange}
                          />
                          <label className="label" htmlFor="password">
                            비밀번호
                          </label>
                          <input
                            type="password"
                            name="password"
                            className="form-control input"
                            style={{ marginBottom: "10px", marginTop: "10px" }}
                            placeholder="비밀번호"
                            value={corpLogin.password}
                            onChange={handleCorpEmailChange}
                          />
                          <div className="button_container">
                            <button
                              type="submit"
                              className="btn btn-primary"
                              style={{ margin: "auto", width: "100%" }}
                            >
                              기업회원 로그인
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>

                    <div className="signup_link">
                      <Link
                        to="/member/findidpwd?gbn=company"
                        className="signup_link_txt"
                      >
                        아이디 찾기 | 비밀번호 찾기
                      </Link>
                      <div style={{ flexGrow: 1 }}></div>
                      <Link to="/member/corpjoin" className="signup_link_txt">
                        기업회원 회원가입
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default UserLogin;
