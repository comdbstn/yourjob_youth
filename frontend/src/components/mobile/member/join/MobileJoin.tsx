import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import useMobile from "../../../../hooks/useMobile";
import "./MobileJoin.css";
import MainFooter from "../../components/MainFooter/MainFooter";
import { oauthCallback } from "../../../../app/slices/authSlice";
import type { AppDispatch } from "../../../../app/store";
import axios from "axios";
import { MetaTagHelmet } from "../../../common/MetaTagHelmet";

type TabType = "personal" | "corporate";

const MobileJoin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const isMobile = useMobile();
  const [selectedTab, setSelectedTab] = useState<TabType>("personal");

  const API_URL =
    process.env.REACT_APP_API_BASE_URL || "https://localhost:8082";
  const OAUTH2_REDIRECT_URI = "https://www.urjob.kr/oauth2/redirect";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    if (code) {
      dispatch(oauthCallback(code))
        .unwrap()
        .then((resultToken: string) => {
          if (resultToken) {
            localStorage.setItem("token", resultToken);
            navigate("/");
          } else {
            console.error("토큰이 반환되지 않았습니다.");
          }
        })
        .catch((err: any) => {
          console.error("OAuth 콜백 처리 중 오류 발생:", err);
        });
    }
  }, [location, navigate, dispatch]);

  const handleTabClick = (tab: TabType) => {
    setSelectedTab(tab);
  };

  const handleNaverSignup = async (): Promise<void> => {
    try {
      const redirectUri = OAUTH2_REDIRECT_URI;
      const loginUrl =
        API_URL +
        `/api/v1/oauth/authorization/naver?redirect_uri=${encodeURIComponent(
          redirectUri
        )}`;

      window.location.href = loginUrl;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(
          "OAuth 회원가입 실패: " +
            (error.response?.data?.message ||
              error.message ||
              "알 수 없는 오류")
        );
      } else {
        alert(
          "OAuth 회원가입 실패: " +
            ((error as Error).message || "알 수 없는 오류")
        );
      }
    }
  };

  const handleGoogleSignup = async (): Promise<void> => {
    try {
      const redirectUri = OAUTH2_REDIRECT_URI;
      const loginUrl =
        API_URL +
        `/api/v1/oauth/authorization/google?redirect_uri=${encodeURIComponent(
          redirectUri
        )}`;

      window.location.href = loginUrl;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(
          "OAuth 회원가입 실패: " +
            (error.response?.data?.message ||
              error.message ||
              "알 수 없는 오류")
        );
      } else {
        alert(
          "OAuth 회원가입 실패: " +
            ((error as Error).message || "알 수 없는 오류")
        );
      }
    }
  };

  const handleKakaoSignup = async (): Promise<void> => {
    try {
      const redirectUri = OAUTH2_REDIRECT_URI;
      const loginUrl =
        API_URL +
        `/api/v1/oauth/authorization/kakao?redirect_uri=${encodeURIComponent(
          redirectUri
        )}`;

      window.location.href = loginUrl;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(
          "OAuth 회원가입 실패: " +
            (error.response?.data?.message ||
              error.message ||
              "알 수 없는 오류")
        );
      } else {
        alert(
          "OAuth 회원가입 실패: " +
            ((error as Error).message || "알 수 없는 오류")
        );
      }
    }
  };

  return (
    <div className="container-center-horizontal">
      <MetaTagHelmet title="회원가입" description="회원가입" />
      <div className="join_container_mobile">
        <h1 className="header">
          유어잡
          <br />
          <strong>회원가입</strong>을 환영합니다.
        </h1>
        <div className="tabs">
          <button
            className={selectedTab === "personal" ? "selected" : ""}
            onClick={() => handleTabClick("personal")}
          >
            일반회원
          </button>
          <button
            className={selectedTab === "corporate" ? "selected" : ""}
            onClick={() => navigate("/m/member/corpJoin")}
          >
            기업회원
          </button>
        </div>
        <div className="main_btns modify">
          <button onClick={handleNaverSignup}>
            <img
              className="naver_icon"
              src="/img/vector-1.svg"
              alt="naver_icon"
            />
            <p>네이버로 회원가입</p>
          </button>
          <button onClick={handleKakaoSignup}>
            <img
              className="kakao_icon"
              src="/img/group-1124@2x.png"
              alt="kakao_icon"
            />
            <p>카카오톡으로 회원가입</p>
          </button>

          <button onClick={handleGoogleSignup}>
            <img
              className="gmail_icon"
              src="/img/group-1122@2x.png"
              alt="gmail_icon"
            />
            <p>구글로 회원가입</p>
          </button>

          {/* <button>
            <img
              className="apple_icon"
              src="/img/group-5@2x.png"
              alt="apple_icon"
            />
            <p>Apple로 회원가입</p>
          </button> */}
          <button
            onClick={() => {
              // 탭에 따라 이메일 회원가입 URL이 다르게 이동
              if (selectedTab === "personal") {
                navigate("/m/member/userJoin");
              } else {
                navigate("/m/member/corpJoin");
              }
            }}
          >
            <img src="/img/group-1123@2x.png" />
            <p>이메일로 회원가입</p>
          </button>
        </div>
      </div>
      {/* <MainFooter /> */}
    </div>
  );
};

export default MobileJoin;
