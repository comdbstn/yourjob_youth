import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MobileUserLogin.css";
import { axiosInstance } from "../../../../api/axios";
import axios from "axios";
import MainFooter from "../../components/MainFooter/MainFooter";
import { useAlert } from "../../../../contexts/AlertContext";
import { MetaTagHelmet } from "../../../common/MetaTagHelmet";

const MobileUserLogin: React.FC = () => {
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { customAlert } = useAlert();
  const API_URL =
    process.env.REACT_APP_API_BASE_URL || "http://13.125.187.22:8082";
  const OAUTH2_REDIRECT_URI = "https://www.urjob.kr/oauth2/redirect";
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

  const handleEmailLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (email === "" || password === "") {
      customAlert({
        content: "계정과 암호를 입력해주세요.",
      });
      return;
    }

    try {
      const response = await axiosInstance.post("/api/v1/auth/login", {
        email,
        password,
      });
      // API 응답 구조에 따라 userId와 userType을 조정하세요.
      const userId = response.data.userId;
      const userType = response.data.userType;
      sessionStorage.setItem("userId", userId);
      sessionStorage.setItem("userType", userType);
      // alert(`이메일 로그인 성공: ${email}`);
      navigate("/m");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          alert("비밀번호가 일치하지 않습니다.");
        }

        if (error.response?.status === 423) {
          alert("차단된 유저입니다. 관리자에게 문의하세요.");
        }

        alert(
          "이메일 로그인 실패: " +
            (error.response?.data?.message ||
              error.message ||
              "알 수 없는 오류")
        );
      } else {
        alert(
          "이메일 로그인 실패: " +
            ((error as Error).message || "알 수 없는 오류")
        );
      }
    }
  };

  const goToFindPage = () => {
    navigate("/m/member/findIdPwd?gbn=user", { state: { tab: "pwd" } });
  };

  return (
    <>
      <div className="container-center-horizontal">
        <MetaTagHelmet title="로그인" description="로그인" />
        <div className="login_container_mobile">
          <div className="header">
            <Link to={"/m"}>
              {/* <p className="notosanskr-normal-block-30px">URJOB</p> */}
              <img src="/img/logo.png" />
            </Link>
          </div>
          {!showEmailLogin && (
            <div className="main_btns">
              <button onClick={handleNaverLogin}>
                <p>
                  {" "}
                  <img
                    className="naver_icon"
                    src="/img/vector-1.svg"
                    alt="naver_icon"
                  />
                  네이버로 로그인
                </p>
              </button>
              <button onClick={handleKakoLogin}>
                <p>
                  {" "}
                  <img
                    className="kakao_icon"
                    src="/img/group-1124@2x.png"
                    alt="kakao_icon"
                  />
                  카카오톡으로 로그인
                </p>
              </button>

              <button
                onClick={handleGoogleLogin}
                style={{
                  backgroundColor: "white",
                  color: "black",
                  borderColor: "black",
                  border: "solid",
                  borderWidth: "1px",
                }}
              >
                <p>
                  {" "}
                  <img
                    className="gmail_icon"
                    src="/img/group-1122@2x.png"
                    alt="gmail_icon"
                  />
                  구글로 로그인
                </p>
              </button>
              <button onClick={() => setShowEmailLogin(true)}>
                <p>
                  <img src="/img/group-1123@2x.png" className="emailIcon" />
                  이메일로 로그인
                </p>
              </button>
            </div>
          )}
          {showEmailLogin && (
            <div className="email-login-form-mobile">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEmailLogin(e);
                }}
              >
                <div className="input_default">
                  <input
                    type="email"
                    placeholder="이메일을 입력해 주세요."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="input_default">
                  <input
                    type="password"
                    placeholder="비밀번호를 입력해 주세요."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button className="blueBtn">로그인</button>
                <button
                  className="blueBtn"
                  style={{
                    background: "white",
                    border: "#a8a8a8 1px solid",
                    color: "#a8a8a8",
                  }}
                  onClick={() => setShowEmailLogin(false)}
                >
                  취소
                </button>
              </form>
              <div className="flex grayLabel userIdPwFind-wrap">
                <Link to={"/m/member/findIdPwd?gbn=user"}>아이디 찾기</Link>
                <span className="bar"></span>
                <button onClick={goToFindPage}>비밀번호 찾기</button>
              </div>
            </div>
          )}
          <p className="mt-15 mb-15 or">or</p>
          <Link to={"/m/member/corplogin"} className="bottomBtn">
            기업회원 로그인
          </Link>
          <button className="mt-15 bottomLabel">
            <Link to="/m/member/join">회원가입</Link>
          </button>
        </div>
        {/* <MainFooter /> */}
      </div>
    </>
  );
};

export default MobileUserLogin;
