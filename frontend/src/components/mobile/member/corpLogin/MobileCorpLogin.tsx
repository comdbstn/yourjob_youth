import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import "./MobileCorpLogin.css";
import "../../common/styles/common.css";
import { useAppDispatch } from "../../../../hooks";
import { corpLogin } from "../../../../app/slices/authSlice";
import { useDispatch } from "react-redux";
import { axiosInstance } from "../../../../api/axios";
import { AppDispatch } from "../../../../app/store";
import axios from "axios";
import MainFooter from "../../components/MainFooter/MainFooter";
import { MetaTagHelmet } from "../../../common/MetaTagHelmet";

interface MobileCorpLoginForm {
  accountId: string;
  password: string;
}

const MobileCorpLogin: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [corpLogin, setCorpLogin] = useState({
    email: "",
    password: "",
  });
  const handleCorpEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCorpLogin((prev) => ({ ...prev, [name]: value }));
  };
  const handleCorpEmailLogin = async (): Promise<void> => {
    try {
      const { email, password } = corpLogin;
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
      sessionStorage.setItem("userType", String(userType).toUpperCase());

      navigate("/m/company/home");
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

  const goToFindPage = () => {
    navigate("/m/member/findIdPwd", { state: { tab: "pwd" } });
  };

  return (
    <div className="container-center-horizontal">
      <MetaTagHelmet title="기업회원 로그인" description="기업회원 로그인" />
      <div className="corp_login_container_mobile">
        <div className="header" style={{ paddingTop: "70px" }}>
          <Link to={"/m"}>
            <img src="/img/logo.png" />
          </Link>
        </div>
        <form onSubmit={handleCorpEmailLogin} className="inputs">
          <div className="input_default">
            <input
              type="email"
              name="email"
              className="form-control input"
              placeholder="이메일 주소"
              value={corpLogin.email}
              onChange={handleCorpEmailChange}
            />
          </div>
          <div className="input_default">
            <input
              type="password"
              name="password"
              className="form-control input"
              placeholder="비밀번호"
              value={corpLogin.password}
              onChange={handleCorpEmailChange}
            />
          </div>
          <button className="blueBtn" onClick={handleCorpEmailLogin}>
            기업회원 로그인
          </button>
        </form>
        <div className="mt-15 w-full pl-20 pr-20 bottomBtns">
          <div className="flex gap-[10px] grayLabel">
            <Link to={"/m/member/findIdPwd"}>아이디 찾기</Link>
            <p>|</p>
            <button onClick={goToFindPage}>비밀번호 찾기</button>
          </div>
          <button
            className="grayLabel"
            onClick={() => navigate("/m/member/corpJoin")}
          >
            기업회원 회원가입
          </button>
        </div>
      </div>
      <MainFooter />
    </div>
  );
};

export default MobileCorpLogin;
