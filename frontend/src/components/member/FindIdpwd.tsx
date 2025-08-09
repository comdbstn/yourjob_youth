import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./FindIdPwd.css";
import { axiosInstance } from "../../api/axios";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const FindIdpwd: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gbn = searchParams.get("gbn") || "company"; // 기본은 기업회원
  const isUser = gbn === "user";

  // 동적 텍스트
  const memberType = isUser ? "개인회원" : "기업회원";
  const nameLabel = isUser ? "이름" : "담당자 명";
  const namePlaceholder = isUser
    ? "이름을 입력해 주세요."
    : "담당자 명을 입력해 주세요.";
  const emailLabel = "이메일";
  const emailPlaceholder = "가입한 이메일을 입력해 주세요.";

  const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [findIdForm, setFindIdForm] = useState({
    name: "",
    email: "",
  });
  const [findPwdForm, setFindPwdForm] = useState({
    id: "",
    email: "",
  });

  const handleFindIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFindIdForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFindPwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFindPwdForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFindId = async () => {
    if (!findIdForm.name) {
      alert(`${nameLabel}을(를) 입력해주세요.`);
      return;
    }
    if (!emailRule.test(findIdForm.email)) {
      alert("이메일 형식이 올바르지 않습니다.");
      return;
    }

    try {
      const response = await axiosInstance.post(
        isUser ? "/api/v1/auth/findUserId" : "/api/v1/auth/findCorpId",
        findIdForm
      );
      if (response.data.success) {
        navigate("/member/findcomplete", {
          state: { foundId: response.data.foundId },
        });
      } else {
        alert(`아이디 찾기 실패: ${response.data.message}`);
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message || "아이디 찾기 중 오류가 발생했습니다.";
      alert(msg);
      console.error("아이디 찾기 오류:", error);
    }
  };

  const handleSendPwd = async () => {
    if (!findPwdForm.id) {
      alert("아이디를 입력해주세요.");
      return;
    }
    if (!emailRule.test(findPwdForm.email)) {
      alert("이메일 형식이 올바르지 않습니다.");
      return;
    }

    try {
      const response = await axiosInstance.post(
        isUser
          ? "/api/v1/auth/sendUserPassword"
          : "/api/v1/auth/sendCorpPassword",
        findPwdForm
      );
      if (response.data.success) {
        navigate("/member/findcomplete", { state: { isPasswordReset: true } });
      } else {
        alert(`비밀번호 찾기 실패: ${response.data.message}`);
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "비밀번호 찾기 중 오류가 발생했습니다.";
      alert(msg);
      console.error("비밀번호 찾기 오류:", error);
    }
  };

  return (
    <div className="container-center-horizontal">
      <MetaTagHelmet
        title="아이디/비밀번호 찾기"
        description="아이디/비밀번호 찾기"
      />
      <div className="find_idpwd_mem_container">
        <div className="find_idpwd">
          <Link to="/" className="title">
            <img src="/img/logo.png" alt="logo" />
          </Link>

          <div className="flex-row">
            {/* 아이디 찾기 섹션 */}
            <div className="flex-col">
              <div className="find_title">{memberType} 아이디 찾기</div>
              <p className="find_subtitle">
                {memberType} 가입 시 등록한 정보를 입력해 주세요.
              </p>
              <div className="input_field items-start items-direction fmt01">
                <label className="label">{nameLabel}</label>
                <input
                  type="text"
                  name="name"
                  className="form-control formfild input"
                  placeholder={namePlaceholder}
                  value={findIdForm.name}
                  onChange={handleFindIdChange}
                />
              </div>
              <div className="input_field items-start items-direction">
                <label className="label">{emailLabel}</label>
                <input
                  type="text"
                  name="email"
                  className="form-control formfild input"
                  placeholder={emailPlaceholder}
                  value={findIdForm.email}
                  onChange={handleFindIdChange}
                />
              </div>

              <button
                type="button"
                className="find_btn"
                onClick={handleFindId}
                style={{ height: "60px" }}
              >
                아이디 찾기
              </button>
            </div>

            <div className="line"></div>

            {/* 비밀번호 찾기 섹션 */}
            <div className="flex-col">
              <div className="find_title">{memberType} 비밀번호 찾기</div>
              <p className="find_subtitle">
                {memberType} 가입 시 등록한 정보를 입력해 주세요.
              </p>
              <div className="input_field items-start items-direction fmt01">
                <label className="label">아이디</label>
                <input
                  type="text"
                  name="id"
                  className="form-control formfild input"
                  placeholder="아이디를 입력해 주세요."
                  value={findPwdForm.id}
                  onChange={handleFindPwdChange}
                />
              </div>
              <div className="input_field items-start items-direction">
                <label className="label">{emailLabel}</label>
                <input
                  type="text"
                  name="email"
                  className="form-control formfild input"
                  placeholder={emailPlaceholder}
                  value={findPwdForm.email}
                  onChange={handleFindPwdChange}
                />
              </div>

              <button
                type="button"
                className="find_btn"
                style={{ height: "60px" }}
                onClick={handleSendPwd}
              >
                임시 비밀번호 발송
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindIdpwd;
