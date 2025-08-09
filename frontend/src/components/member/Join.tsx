import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import "./Join.css";
import { oauthCallback, emailSignup } from "../../app/slices/authSlice";
import type { AppDispatch } from "../../app/store";
import axios from "axios";
import PostModal from "../common/PostModal/PostModal";
import { visaOptions, VisaStatusText, VisaType } from "../../app/dummy/options";
import getOperationData from "../../api/operatuibData";
import { OperationDataResponse } from "../../types/operationData";
import DatePicker from "react-datepicker";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const Join: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [isOpenPost, setIsOpenPost] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [regionData, setRegionData] = useState<OperationDataResponse>();
  const [form, setForm] = useState({
    name: "",
    englishName: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    birth: "",
    gender: "",
    nationality: "02000031",
    address: "",
    address_detail: "",
    zip_code: "",
    visa: [] as VisaType[],
    profileImage: "",
  });

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

  const handleKakoSignup = async (): Promise<void> => {
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "birth") {
      const onlyDigits = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [name]: onlyDigits }));
      return;
    }

    console.log(value);

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVisaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      visa: checked
        ? [...prev.visa, value as VisaType]
        : prev.visa.filter((v) => v !== (value as VisaType)),
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    let formattedValue = value;

    if (value.length <= 10) {
      formattedValue = value.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    } else if (value.length === 11) {
      formattedValue = value.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    } else {
      formattedValue = value.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
    }

    setForm((prev) => ({ ...prev, phone: formattedValue }));
  };

  const handlePostComplete = (address: string, zoneCode: string) => {
    setForm((prev) => ({
      ...prev,
      address: address,
      zip_code: zoneCode,
    }));
    setIsOpenPost(false);
  };

  // --- 1) validateForm 수정 ---
  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    const pwdRule = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    const phoneRule = /^\d{3}-\d{3,4}-\d{4}$|^\d{4}-\d{4}-\d{4}$/;
    const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.name) newErrors.name = "이름을 입력해주세요.";
    if (!form.password) newErrors.password = "비밀번호를 입력해주세요.";
    else if (!pwdRule.test(form.password))
      newErrors.password =
        "비밀번호는 최소 8자 이상이며 영문·숫자·특수문자를 모두 포함해야 합니다.";

    if (!form.passwordConfirm)
      newErrors.passwordConfirm = "비밀번호 확인을 입력해주세요.";
    else if (form.password !== form.passwordConfirm)
      newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";

    if (!form.phone) newErrors.phone = "휴대폰 번호를 입력해주세요.";
    else if (!phoneRule.test(form.phone))
      newErrors.phone = "휴대폰 번호 형식이 올바르지 않습니다.";

    if (!form.email) newErrors.email = "이메일을 입력해주세요.";
    else if (!emailRule.test(form.email))
      newErrors.email = "올바른 이메일 형식이 아닙니다.";

    if (!form.birth) newErrors.birth = "생년월일을 입력해주세요.";
    if (!form.gender) newErrors.gender = "성별을 선택해주세요.";
    if (!form.nationality) newErrors.nationality = "국적을 선택해주세요.";

    setErrors(newErrors);
    return newErrors;
  };

  // --- handleEmailSignup 수정 ---
  const handleEmailSignup = () => {
    // 1) validation
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      // 2) 첫 번째 에러 필드로 스크롤 & 포커스
      const firstKey = Object.keys(newErrors)[0];
      const el = document.getElementsByName(firstKey)[0] as HTMLElement;
      if (el) {
        el.scrollIntoView();
        el.focus();
      }
      // 3) alert
      const msgs = Object.values(newErrors).join("\n");
      alert(`다음 항목을 확인해주세요:\n${msgs}`);
      return;
    }

    // 4) dispatch signup
    dispatch(emailSignup(form))
      .unwrap()
      .then(() => {
        alert("회원가입이 성공적으로 완료되었습니다.");
        setShowEmailPopup(false);
        window.location.href = "/member/userlogin";
      })
      .catch((error: any) => {
        console.error("회원가입 오류:", error);
        // HTTP 409 Conflict 일 때
        if (error?.response?.status === 409) {
          alert("이미 가입된 메일주소입니다.");
        } else {
          // alert("회원가입 중 오류가 발생했습니다.");
        }
      });
  };

  useEffect(() => {
    const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (!form.email) {
        newErrors.email = "이메일을 입력해주세요.";
      } else if (!emailRule.test(form.email)) {
        newErrors.email = "올바른 이메일 형식이 아닙니다.";
      } else {
        // 이메일이 유효해지면 에러 메시지 삭제
        delete newErrors.email;
      }
      return newErrors;
    });
  }, [form.email]);

  useEffect(() => {
    const birthRule = /^\d{8}$/;
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (!form.birth) {
        newErrors.birth = "생년월일을 입력해주세요.";
      } else if (!birthRule.test(form.birth)) {
        newErrors.birth = "YYYYMMDD 형식으로 입력해주세요.";
      } else {
        delete newErrors.birth;
      }
      return newErrors;
    });
  }, [form.birth]);
  // 1) 비밀번호 유효성(영문·숫자·특수문자 포함 8자 이상) 실시간 검증
  useEffect(() => {
    const pwdRule = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    setErrors((prev) => {
      const next = { ...prev };
      if (!form.password) {
        next.password = "비밀번호를 입력해주세요.";
      } else if (!pwdRule.test(form.password)) {
        next.password =
          "비밀번호는 8자 이상, 영문·숫자·특수문자 포함해야 합니다.";
      } else {
        delete next.password;
      }
      return next;
    });
  }, [form.password]);

  // 2) 비밀번호 확인 일치 여부 실시간 검증
  useEffect(() => {
    setErrors((prev) => {
      const next = { ...prev };
      if (!form.passwordConfirm) {
        next.passwordConfirm = "비밀번호 확인을 입력해주세요.";
      } else if (form.password !== form.passwordConfirm) {
        next.passwordConfirm = "비밀번호가 일치하지 않습니다.";
      } else {
        delete next.passwordConfirm;
      }
      return next;
    });
  }, [form.password, form.passwordConfirm]);
  const fetchRegion = async () => {
    const response = await getOperationData("00000002");
    setRegionData(response);
  };

  useEffect(() => {
    fetchRegion();
  }, []);
  const parseBirth = (value: string): Date | null => {
    const match = value.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (!match) return null;
    const [, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
  };
  return (
    <div className="container-center-horizontal">
      <MetaTagHelmet title="회원가입" description="회원가입" />
      <div className="mem_container">
        <div className="join">
          <h1>
            <span>
              유어잡
              <br />
            </span>
            <span>회원가입</span>
            <span>을 환영합니다.</span>
          </h1>
          <div className="joinTab">
            <a href="/member/join" className="active">
              일반회원
            </a>
            <a href="/member/corpjoin">기업회원</a>
          </div>
          {!showEmailPopup && (
            <div className="social_login_buttons">
              <button
                type="button"
                className="naverBtn overlap"
                onClick={handleNaverSignup}
              >
                <img
                  className="naver_icon"
                  src="/img/vector-1.svg"
                  alt="naver_icon"
                />
                <div className="text white_txt">네이버로 회원가입</div>
              </button>
              <button
                type="button"
                className="kakaoBtn overlap"
                onClick={handleKakoSignup}
              >
                <img
                  className="kakao_icon"
                  src="/img/group-1124@2x.png"
                  alt="kakao_icon"
                />
                <div className="text">카카오톡으로 회원가입</div>
              </button>
              <button
                type="button"
                className="gmailBtn overlap"
                onClick={handleGoogleSignup}
              >
                <img
                  className="gmail_icon"
                  src="/img/group-1122@2x.png"
                  alt="gmail_icon"
                />
                <div className="text">구글로 회원가입</div>
              </button>
              <button
                type="button"
                className="emailJoinBtn overlap"
                onClick={() => setShowEmailPopup(true)}
              >
                <img
                  className="email_icon"
                  src="/img/group-1123@2x.png"
                  alt="email_icon"
                />
                <div className="text">이메일로 회원가입</div>
              </button>
            </div>
          )}

          {showEmailPopup && (
            <div className="popup_overlay">
              <div className="popup_content email_join_form">
                <div className="form-group">
                  <label htmlFor="name">이름</label>
                  <input
                    type="text"
                    name="name"
                    className="input_default"
                    placeholder="이름을 입력해주세요."
                    onChange={handleInputChange}
                  />
                  {errors.name && (
                    <div className="error-message">{errors.name}</div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="englishName">영문이름</label>
                  <input
                    type="text"
                    name="englishName"
                    className="input_default"
                    placeholder="영문이름을 입력해주세요."
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">이메일</label>
                  <input
                    type="email"
                    name="email"
                    className="input_default"
                    placeholder="이메일을 입력해주세요."
                    onChange={handleInputChange}
                  />
                  {errors.email && (
                    <div className="error-message">{errors.email}</div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="password">비밀번호</label>
                  <input
                    type="password"
                    name="password"
                    className="input_default"
                    placeholder="비밀번호를 입력해주세요."
                    onChange={handleInputChange}
                  />
                  {errors.password && (
                    <div className="error-message">{errors.password}</div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="passwordConfirm">비밀번호 확인</label>
                  <input
                    type="password"
                    name="passwordConfirm"
                    className="input_default"
                    placeholder="비밀번호를 다시 입력해주세요."
                    onChange={handleInputChange}
                  />
                  {errors.passwordConfirm && (
                    <div className="error-message">
                      {errors.passwordConfirm}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">휴대폰 번호</label>
                  <input
                    type="tel"
                    name="phone"
                    className="input_default"
                    placeholder="01012345678"
                    maxLength={14}
                    onChange={handlePhoneChange}
                  />
                  {errors.phone && (
                    <div className="error-message">{errors.phone}</div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="birth">생년월일</label>
                  <DatePicker
                    selected={parseBirth(form.birth)}
                    onChange={(date: Date | null) => {
                      if (date) {
                        const y = date.getFullYear();
                        const m = String(date.getMonth() + 1).padStart(2, "0");
                        const d = String(date.getDate()).padStart(2, "0");
                        setForm((prev) => ({ ...prev, birth: `${y}${m}${d}` }));
                      } else {
                        setForm((prev) => ({ ...prev, birth: "" }));
                      }
                    }}
                    dateFormat="yyyy-MM-dd"
                    locale="ko"
                    placeholderText="YYYYMMDD"
                    className="input_default"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    onChangeRaw={(e) => e?.preventDefault()}
                  />
                  {errors.birth && (
                    <div className="error-message">{errors.birth}</div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="gender">성별</label>
                  <select
                    name="gender"
                    onChange={handleInputChange}
                    className="input_default"
                  >
                    <option value="">성별을 선택해주세요.</option>
                    <option value="M">남성</option>
                    <option value="F">여성</option>
                  </select>
                  {errors.gender && (
                    <div className="error-message">{errors.gender}</div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="nationality">국적</label>
                  <select
                    name="nationality"
                    value={form.nationality}
                    onChange={handleInputChange}
                    className="input_default"
                  >
                    <option value="">국적을 선택해주세요.</option>
                    {regionData && (
                      <>
                        {regionData.content.map((i, idx) => (
                          <option value={i.operationDataId}>{i.level2}</option>
                        ))}
                      </>
                    )}
                  </select>
                  {errors.nationality && (
                    <div className="error-message">{errors.nationality}</div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="address">주소</label>
                  <div className="input_default flexJb">
                    <p>{form.address}</p>
                    <button
                      type="button"
                      className="text-nowrap"
                      onClick={() => {
                        setIsOpenPost(true);
                      }}
                    >
                      찾기
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="address_detail">상세 주소</label>
                  <input
                    type="text"
                    name="address_detail"
                    placeholder="상세 주소를 입력해주세요."
                    onChange={handleInputChange}
                    className="input_default"
                  />
                </div>
                {form.nationality !== "02000031" && form.nationality && (
                  <div className="form-group">
                    <label htmlFor="visa">비자 여부</label>
                    <div
                      className="visa-checkbox-group"
                      style={{
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      {Array.from({
                        length: Math.ceil(visaOptions.length / 3),
                      }).map((_, rowIndex) => (
                        <div key={rowIndex} className="visa-row">
                          {visaOptions
                            .slice(rowIndex * 3, (rowIndex + 1) * 3)
                            .map((option) => (
                              <div className="visa-checkbox" key={option.id}>
                                <input
                                  id={`visa-${option.id}`}
                                  type="checkbox"
                                  name="visa"
                                  value={option.value as VisaType}
                                  onChange={handleVisaChange}
                                  className="input_default"
                                />
                                <label htmlFor={`visa-${option.id}`}>
                                  {VisaStatusText[option.value as VisaType]}
                                </label>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button className="joinBtn" onClick={handleEmailSignup}>
                  회원가입
                </button>
                <button
                  className="cancelBtn"
                  onClick={() => setShowEmailPopup(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isOpenPost && (
        <PostModal
          isOpen={isOpenPost}
          width="900px"
          onClose={() => setIsOpenPost(false)}
          onComplete={handlePostComplete}
        />
      )}
    </div>
  );
};

export default Join;
