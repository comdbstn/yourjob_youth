import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import "../../common/styles/common.css";
import "./UserJoin.css";
import { AppDispatch } from "../../../../app/store";
import { emailSignup } from "../../../../app/slices/authSlice";
import {
  visaOptions,
  VisaStatusText,
  VisaType,
} from "../../../../app/dummy/options";
import PostModal from "../../../common/PostModal/PostModal";
import { OperationDataResponse } from "../../../../types/operationData";
import getOperationData from "../../../../api/operatuibData";
import DatePicker from "react-datepicker";
import { MetaTagHelmet } from "../../../common/MetaTagHelmet";

const UserJoin: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isOpenPost, setIsOpenPost] = useState(false);
  const [regionData, setRegionData] = useState<OperationDataResponse>();
  const [name, setName] = useState("");
  const [englishName, setEnglishName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [birth, setBirth] = useState("");
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("02000031");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [visa, setVisa] = useState<VisaType[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 폼 검증 함수
  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    const pwdRule = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    const phoneRule = /^\d{3}-\d{3,4}-\d{4}$|^\d{4}-\d{4}-\d{4}$/;
    const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) newErrors.name = "이름을 입력해주세요.";
    if (!password) newErrors.password = "비밀번호를 입력해주세요.";
    else if (!pwdRule.test(password))
      newErrors.password =
        "비밀번호는 8자 이상, 영문·숫자·특수문자 포함해야 합니다.";
    if (!passwordConfirm)
      newErrors.passwordConfirm = "비밀번호 확인을 입력해주세요.";
    else if (password !== passwordConfirm)
      newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    if (!phone) newErrors.phone = "휴대폰 번호를 입력해주세요.";
    else if (!phoneRule.test(phone))
      newErrors.phone = "휴대폰 번호 형식이 올바르지 않습니다.";
    if (!email) newErrors.email = "이메일을 입력해주세요.";
    else if (!emailRule.test(email))
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    if (!birth) newErrors.birth = "생년월일을 입력해주세요.";
    if (!gender) newErrors.gender = "성별을 선택해주세요.";
    if (!nationality) newErrors.nationality = "국적을 선택해주세요.";

    setErrors(newErrors);
    return newErrors;
  };

  // 제출 핸들러: 비어있는 필드 우선 스크롤 → 검증 → dispatch
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1) 필수 항목 순서대로 검사해서 빈 값이면 스크롤/포커스 후 리턴
    const requiredIds = [
      "name",
      "email",
      "password",
      "passwordConfirm",
      "phone",
      "birth",
      "gender",
      "nationality",
    ];

    for (const id of requiredIds) {
      const wrapper = document.getElementById(id);
      if (!wrapper) continue;

      // 생년월일(DatePicker)의 경우
      if (id === "birth") {
        if (!birth) {
          wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
        continue;
      }

      // 성별(select)의 경우
      if (id === "gender") {
        if (!gender) {
          wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
        continue;
      }

      // 국적(select)의 경우
      if (id === "nationality") {
        if (!nationality) {
          wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
        continue;
      }

      // 나머지 일반 input
      const input = wrapper.querySelector<HTMLInputElement | HTMLSelectElement>(
        "input, select"
      );
      if (!input) continue;

      if (!input.value) {
        wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
        input.focus();
        return;
      }
    }

    // 2) 나머지 검증 로직
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      const messages = Object.values(newErrors).join("\n");
      alert(`다음 항목을 확인해주세요:\n${messages}`);
      return;
    }

    // 3) 페이로드 구성 및 dispatch
    const payload = {
      name,
      englishName,
      email,
      password,
      phone,
      birth,
      gender,
      nationality,
      address,
      address_detail: addressDetail,
      zip_code: zipCode,
      visa,
    };

    dispatch(emailSignup(payload))
      .unwrap()
      .then(() => {
        alert("회원가입이 성공적으로 완료되었습니다.");
        window.location.href = "/member/userlogin";
      })
      .catch((error: any) => {
        console.error("회원가입 오류:", error);
        // HTTP 409 Conflict 일 때
        if (error?.response?.status === 409) {
          alert("이미 가입된 메일주소입니다.");
        } else {
          // alert("회원가입 중 오류가 발생했습니다!");
        }
      });
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

    setPhone(formattedValue);
  };

  useEffect(() => {
    getOperationData("00000002").then((res) => setRegionData(res));
  }, []);

  const handleVisaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setVisa((prev) =>
      checked
        ? [...prev, value as VisaType]
        : prev.filter((v) => v !== (value as VisaType))
    );
  };

  const handlePostComplete = (address: string, zoneCode: string) => {
    setAddress(address);
    setZipCode(zoneCode);
    setIsOpenPost(false);
  };

  const parseBirth = (value: string): Date | null => {
    const match = value.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (!match) return null;
    const [, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
  };

  return (
    <div className="UserJoin-container">
      <MetaTagHelmet title="회원가입" description="회원가입" />
      <Link to={"/m"}>
        <h1 className="urJobHeaderLabel">
          <img src="/img/logo.png" alt="urJob logo" />
        </h1>
      </Link>
      <form onSubmit={handleSubmit}>
        <section className="mt-60">
          <h2>계정 정보</h2>
          <div className="inputs">
            <div className="inputBox" id="name">
              <h3>
                이름<strong>*</strong>
              </h3>
              <div className="input_default">
                <input
                  placeholder="이름을 입력해 주세요."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {errors.name && <p className="error">{errors.name}</p>}
            </div>

            <div className="inputBox" id="email">
              <h3>
                이메일<strong>*</strong>
              </h3>
              <div className="input_default">
                <input
                  type="email"
                  placeholder="이메일을 입력해 주세요."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && <p className="error">{errors.email}</p>}
            </div>

            <div className="inputBox" id="password">
              <h3>
                비밀번호<strong>*</strong>
              </h3>
              <div className="input_default">
                <input
                  type="password"
                  placeholder="비밀번호를 입력해 주세요."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {errors.password && <p className="error">{errors.password}</p>}
            </div>

            <div className="inputBox" id="passwordConfirm">
              <h3>
                비밀번호 확인<strong>*</strong>
              </h3>
              <div className="input_default">
                <input
                  type="password"
                  placeholder="비밀번호를 다시 입력해 주세요."
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>
              {errors.passwordConfirm && (
                <p className="error">{errors.passwordConfirm}</p>
              )}
            </div>

            <div className="inputBox" id="phone">
              <h3>
                휴대폰 번호<strong>*</strong>
              </h3>
              <div className="input_default">
                <input
                  placeholder="휴대폰 번호를 입력해 주세요."
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={14}
                />
              </div>
              {errors.phone && <p className="error">{errors.phone}</p>}
            </div>

            <div className="inputBox" id="birth">
              <h3>
                생년월일<strong>*</strong>
              </h3>
              <DatePicker
                selected={parseBirth(birth)}
                onChange={(date: Date | null) => {
                  if (date) {
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, "0");
                    const d = String(date.getDate()).padStart(2, "0");
                    setBirth(`${y}${m}${d}`);
                  } else {
                    setBirth("");
                  }
                }}
                dateFormat="yyyyMMdd"
                locale="ko"
                placeholderText="YYYYMMDD"
                className="input_default w-full"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                onChangeRaw={(e) => e?.preventDefault()}
              />
              {errors.birth && <p className="error">{errors.birth}</p>}
            </div>

            <div className="inputBox" id="gender">
              <h3>
                성별<strong>*</strong>
              </h3>
              <div className="input_default">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">성별을 선택해주세요</option>
                  <option value="M">남성</option>
                  <option value="F">여성</option>
                </select>
              </div>
              {errors.gender && <p className="error">{errors.gender}</p>}
            </div>

            <div className="inputBox" id="nationality">
              <h3>
                국적<strong>*</strong>
              </h3>
              <div className="input_default">
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                >
                  <option value="">국적 선택</option>
                  {regionData?.content.map((r) => (
                    <option key={r.operationDataId} value={r.operationDataId}>
                      {r.level2}
                    </option>
                  ))}
                </select>
              </div>
              {errors.nationality && (
                <p className="error">{errors.nationality}</p>
              )}
            </div>

            {nationality && nationality !== "02000031" && (
              <div className="inputBox">
                <h3>비자 여부</h3>
                <div className="visa-checkbox-group">
                  {visaOptions.map((opt) => (
                    <label key={opt.id} className="visa-checkbox">
                      <input
                        type="radio"
                        value={opt.value as VisaType}
                        checked={visa.includes(opt.value as VisaType)}
                        onChange={handleVisaChange}
                      />
                      {VisaStatusText[opt.value as VisaType]}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="inputBox">
              <h3>주소</h3>
              <div className="input_default flexJb">
                <p style={{ flex: 1, margin: 0, padding: "10px 0" }}>
                  {address || "주소를 검색해주세요"}
                </p>
                <button
                  type="button"
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: "0 10px",
                  }}
                  onClick={() => setIsOpenPost(true)}
                >
                  찾기
                </button>
              </div>
            </div>

            <div className="inputBox">
              <h3>상세 주소</h3>
              <div className="input_default">
                <input
                  placeholder="상세 주소를 입력해 주세요."
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                />
              </div>
            </div>

            <input
              type="hidden"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />

            <button className="blueBtn mt-25 mb-25">가입하기</button>
          </div>
        </section>
      </form>

      {isOpenPost && (
        <PostModal
          isOpen={isOpenPost}
          width="90%"
          onClose={() => setIsOpenPost(false)}
          onComplete={handlePostComplete}
        />
      )}
    </div>
  );
};

export default UserJoin;
