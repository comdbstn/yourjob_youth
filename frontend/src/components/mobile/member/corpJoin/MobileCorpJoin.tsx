import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import "../../common/styles/common.css";
import "./MobileCorpJoin.css";
import { useAppDispatch } from "../../../../hooks";
import { corpJoin } from "../../../../app/slices/authSlice";
import MainFooter from "../../components/MainFooter/MainFooter";
import { companyApi } from "../../../../api/company";
import { initialCompanyInfo, CompanyInfo } from "../../../../types/corp";
import { useAlert } from "../../../../contexts/AlertContext";
import { CompanyTypeOption } from "../../../../api/getLevelOneCodes";
import { MetaTagHelmet } from "../../../common/MetaTagHelmet";

interface CorpJoinForm {
  accountId: string;
  password: string;
  rePassword: string;
  managerName: string;
  managerPhone: string;
  companyName: string;
  businessRegistrationNumber: string;
  capital: string;
  revenue: string;
  netIncome: string;
  companyAddress: string;
  file?: FileList;
  corporateType: number;
  employeeCount?: "";
  terms: boolean;
}

const MobileCorpJoin: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CompanyInfo>({ defaultValues: initialCompanyInfo });

  const [emailDomains] = useState<string[]>([
    "naver.com",
    "gmail.com",
    "daum.net",
    "nate.com",
    "직접입력",
  ]);
  const [emailDomain, setEmailDomain] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [isSendVerificationCode, setIsSendVerificationCode] =
    useState<boolean>(false);
  const [verificationTimer, setVerificationTimer] = useState<number>(0);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [companyTypeOptions, setCompanyTypeOptions] = useState<
    CompanyTypeOption[]
  >([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isEmailModified, setIsEmailModified] = useState<boolean>(false);

  useEffect(() => {
    const fetchCompanyTypes = async () => {
      try {
        const options = await companyApi.getCompanyTypeOptions();
        setCompanyTypeOptions(options);
      } catch (error) {
        console.error("Failed to fetch company type options:", error);
      }
    };
    fetchCompanyTypes();
  }, []);

  useEffect(() => {
    if (verificationTimer > 0) {
      const timer = setInterval(() => {
        setVerificationTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [verificationTimer]);

  useEffect(() => {
    if (isEditMode && watch("managerEmail")) {
      const currentEmail = watch("managerEmail");
      const currentDomain = emailDomain;
      const isModified =
        currentEmail !== watch("managerEmail") || currentDomain !== emailDomain;
      setIsEmailModified(isModified);
    }
  }, [watch("managerEmail"), emailDomain, isEditMode]);

  const handleSendVerificationCode = async () => {
    try {
      await companyApi.sendVerificationCode(
        `${watch("managerEmail")}@${emailDomain}`
      );
      setIsSendVerificationCode(true);
      setVerificationTimer(300);
      alert("인증코드가 전송되었습니다.");
    } catch {
      alert("인증코드 전송에 실패했습니다.");
    }
  };

  const handleVerifyCode = async () => {
    try {
      await companyApi.verifyEmailCode(
        `${watch("managerEmail")}@${emailDomain}`,
        verificationCode
      );
      setIsEmailVerified(true);
      setVerificationTimer(0);
      alert("이메일 인증이 완료되었습니다.");
    } catch {
      alert("인증코드가 일치하지 않습니다.");
    }
  };

  const handleSearchCompany = async () => {
    try {
      const resp = await companyApi.searchCompany(watch("businessNumber"));
      if (resp) {
        setValue("companyName", resp.companyName);
        setValue("representative", resp.representative);
      }
    } catch {
      alert("기업 정보 검색에 실패했습니다.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValue("businessCertificate", {
      file,
      filename: file.name,
      filedownload: URL.createObjectURL(file),
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    let formatted = raw;
    if (raw.length <= 10) {
      formatted = raw.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    } else if (raw.length === 11) {
      formatted = raw.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    } else {
      formatted = raw.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
    }
    setValue("managerPhone", formatted);
  };

  const handleBusinessNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValue("businessNumber", e.target.value.replace(/\D/g, ""));
  };
  const { customAlert } = useAlert();

  const validateForm = (data: any) => {
    const errs: Record<string, string> = {};
    const pwdRule = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    const phoneRule = /^\d{3}-\d{3,4}-\d{4}$|^\d{4}-\d{4}-\d{4}$/;
    const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 필수값 검증 순서 정의
    const requiredFields = [
      { field: "username", message: "아이디를 입력해주세요." },
      {
        field: "password",
        message: "비밀번호를 입력해주세요.",
        validate: (value: string) =>
          !pwdRule.test(value)
            ? "비밀번호는 최소 8자 이상이며 영문, 숫자, 특수문자를 모두 포함해야 합니다."
            : "",
      },
      {
        field: "passwordConfirm",
        message: "비밀번호 확인을 입력해주세요.",
        validate: (value: string) =>
          value !== data.password ? "비밀번호가 일치하지 않습니다." : "",
      },
      { field: "managerName", message: "담당자 이름을 입력해주세요." },
      {
        field: "managerPhone",
        message: "휴대폰 번호를 입력해주세요.",
        validate: (value: string) =>
          !phoneRule.test(value) ? "휴대폰 번호 형식이 올바르지 않습니다." : "",
      },
      {
        field: "managerEmail",
        message: "이메일을 입력해주세요.",
        validate: (value: string) =>
          !emailRule.test(`${value}@${emailDomain}`)
            ? "올바른 이메일 형식이 아닙니다."
            : "",
      },
      { field: "companyName", message: "기업명을 입력해주세요." },
      {
        field: "businessNumber",
        message: "사업자등록번호를 입력해주세요.",
        validate: (value: string) =>
          !/^\d{10}$/.test(value)
            ? "사업자등록번호는 10자리 숫자여야 합니다."
            : "",
      },
      { field: "representative", message: "대표자 이름을 입력해주세요." },
      {
        field: "businessCertificate",
        message: "사업자등록증을 첨부해주세요.",
        validate: (value: any) =>
          !value?.file ? "사업자등록증을 첨부해주세요." : "",
      },
      { field: "companyType", message: "기업 구분을 선택해주세요." },
    ];

    // 순서대로 검증
    for (const { field, message, validate } of requiredFields) {
      const value = data[field];
      if (!value) {
        errs[field] = message;
      }
      if (validate) {
        const error = validate(value);
        if (error) {
          errs[field] = error;
        }
      }
    }

    // 이메일 인증 검증
    if (!isEditMode || (isEditMode && isEmailModified)) {
      if (!isEmailVerified) {
        errs.emailVerification = "이메일 인증이 필요합니다.";
      }
    }

    setFormErrors(errs);
    return errs;
  };

  const onFormSubmit = async (data: any) => {
    const errs = validateForm(data);

    const selectedCompanyType = companyTypeOptions.find(
      (option) => option.value === data.companyType
    );
    data.companyType = selectedCompanyType
      ? selectedCompanyType.operationDataId
      : data.companyType;

    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0];
      const el = document.getElementById(firstKey);
      if (el) {
        el.scrollIntoView();
        el.focus();
      }

      customAlert({
        content: "필수 항목을 확인해주세요.",
      });
      return;
    }

    try {
      await dispatch(corpJoin(data)).unwrap();
      alert("기업회원 가입이 완료되었습니다.");
      window.location.href = "/m/member/corplogin";
    } catch (err: any) {
      alert("기업회원 가입 실패: " + err.message);
    }
  };

  useEffect(() => {}, [emailDomain]);
  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false);

  const handleSelectDomain = (domain: string) => {
    setEmailDomain(domain);
    setIsDomainDropdownOpen(false);
  };

  const ErrorMessage = ({ field }: { field: string }) => {
    return formErrors[field] ? (
      <div className="error-message">{formErrors[field]}</div>
    ) : null;
  };

  return (
    <div className="mobile-corp-join-container">
      <MetaTagHelmet title="기업회원 가입" description="기업회원 가입" />
      <Link to={"/m"}>
        <h1 className="urJobHeaderLabel">
          <img src="/img/logo.png" />
        </h1>
      </Link>
      {/* <form onSubmit={handleSubmit(onFormSubmit)}> */}
      <form>
        {/* 계정 정보 섹션 */}
        <section className="mt-70">
          <h2>계정 정보</h2>
          <div className="inputs">
            <div className="inputBox">
              <h3>
                아이디<strong>*</strong>
              </h3>
              <div className="input_default">
                <input
                  type="text"
                  placeholder="아이디를 입력해 주세요."
                  {...register("username")}
                />
              </div>
              <ErrorMessage field="username" />
            </div>
            <div className="inputBox">
              <h3>
                비밀번호<strong>*</strong>
              </h3>
              <div className="input_default">
                <input
                  type="password"
                  placeholder="비밀번호를 입력해 주세요."
                  {...register("password")}
                />
              </div>
              <ErrorMessage field="password" />
            </div>
            <div className="inputBox">
              <h3>
                비밀번호 확인<strong>*</strong>
              </h3>
              <div className="input_default">
                <input
                  type="password"
                  placeholder="한 번 더 입력해 주세요."
                  {...register("passwordConfirm")}
                />
              </div>
              <ErrorMessage field="passwordConfirm" />
            </div>
          </div>
        </section>

        {/* 담당자 정보 섹션 */}
        <section className="mt-70">
          <h2>담당자 정보</h2>
          <div className="inputs">
            <div className="inputBox">
              <h3>
                담당자 명<strong>*</strong>
              </h3>
              <div className="input_default">
                <input
                  type="text"
                  placeholder="담당자 이름을 입력해 주세요."
                  {...register("managerName")}
                />
              </div>
              <ErrorMessage field="managerName" />
            </div>
            <div className="inputBox">
              <h3>
                담당자 휴대폰 번호<strong>*</strong>
              </h3>
              <div className="input_default">
                <input
                  type="text"
                  placeholder="'-' 없이 입력해 주세요."
                  value={watch("managerPhone")}
                  onChange={handlePhoneChange}
                />
              </div>
              <ErrorMessage field="managerPhone" />
            </div>
            <div className="inputBox">
              <h3>
                이메일<strong>*</strong>
              </h3>
              <div className="email-input-wrapper">
                <div className="file_cus">
                  <label>
                    <div className="input_default">
                      <input
                        type="text"
                        className="form-control formfild"
                        placeholder="이메일을 입력해 주세요."
                        disabled={isEmailVerified}
                        {...register("managerEmail")}
                      />
                    </div>
                    <button
                      type="button"
                      className="file_btn"
                      disabled={isEmailVerified}
                      onClick={handleSendVerificationCode}
                    >
                      인증코드
                    </button>
                  </label>
                  <div
                    className="email-domain-wrapper"
                    style={{ position: "relative" }} // dropdown이 wrapper 밖으로 튀어나오도록
                  >
                    <div
                      className="input_default"
                      style={{ marginTop: "15px" }}
                    >
                      <input
                        type="text"
                        placeholder="도메인을 입력/선택"
                        value={emailDomain}
                        disabled={isEmailVerified}
                        onFocus={() => setIsDomainDropdownOpen(true)}
                        readOnly // 직접 입력이 아니라 선택만 허용하려면
                      />
                    </div>
                    {isDomainDropdownOpen && (
                      <ul
                        className="email-domain-dropdown"
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          zIndex: 100,
                          maxHeight: "200px",
                          overflowY: "auto",
                          WebkitOverflowScrolling: "touch", // 모바일 스크롤 부드럽게
                        }}
                        // wrapper 외부 클릭 시 닫기
                        onBlur={() => setIsDomainDropdownOpen(false)}
                        tabIndex={-1}
                      >
                        {emailDomains.map((d) => (
                          <li
                            key={d}
                            style={{ padding: "8px", cursor: "pointer" }}
                            // 모바일에서 blur 전에 터치 이벤트를 받으려면 onMouseDown 또는 onTouchStart 사용
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectDomain(d);
                            }}
                            onTouchStart={() => handleSelectDomain(d)}
                          >
                            {d}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                {isSendVerificationCode && (
                  <div className="file_cus">
                    <label>
                      <input
                        type="text"
                        className="form-control formfild"
                        placeholder="인증코드를 입력해 주세요."
                        value={verificationCode}
                        disabled={isEmailVerified}
                        onChange={(e) => setVerificationCode(e.target.value)}
                      />
                      {!isEmailVerified && (
                        <div className="timer">
                          {verificationTimer > 0
                            ? Math.floor(verificationTimer / 60)
                            : 0}
                          :
                          {(verificationTimer > 0 ? verificationTimer % 60 : 0)
                            .toString()
                            .padStart(2, "0")}
                        </div>
                      )}
                      <button
                        type="button"
                        className="file_btn"
                        disabled={!verificationCode || isEmailVerified}
                        onClick={handleVerifyCode}
                      >
                        인증하기
                      </button>
                    </label>
                  </div>
                )}
                <ErrorMessage field="emailVerification" />
                {isEmailVerified && (
                  <div className="verification-success">
                    <i className="fas fa-check-circle"></i> 이메일 인증이
                    완료되었습니다.
                  </div>
                )}
              </div>
              <ErrorMessage field="managerEmail" />
            </div>
          </div>
        </section>

        {/* 기업 정보 섹션 */}
        <section className="mt-70">
          <h2>기업 정보</h2>
          <div className="inputs">
            {/*  */}
            <div className="inputBox mt-10 w-full">
              <h3>
                기업명<strong>*</strong>
              </h3>
              <div className="flexGap10 w-full">
                <label style={{ width: "100%", display: "flex", gap: "10px" }}>
                  <div className="file_name ellipsis formfild">
                    <input
                      // type="text"
                      style={{ width: "50px" }}
                      placeholder="기업명"
                      {...register("companyName")}
                    />
                  </div>
                  {/* <button className="file_btn">찾기</button> */}
                </label>
              </div>
              <ErrorMessage field="companyName" />
            </div>
            {/*  */}
            {/* <div className="inputBox">
              <div
                className=" w-full"
                style={{ display: "flex", flexDirection: "column" }}
              >
                <div className="input_default"></div>
              </div>
            </div> */}
            <div className="inputBox mt-10">
              <h3>
                사업자등록번호<strong>*</strong>
              </h3>
              <div className="input_default" style={{ padding: "10px" }}>
                <input
                  type="text"
                  className="form-control formfild"
                  placeholder="사업자등록번호를 입력해 주세요."
                  maxLength={10}
                  onChange={handleBusinessNumberChange}
                  value={watch("businessNumber")}
                />
              </div>
              <ErrorMessage field="businessNumber" />
              <div className="inputBox mt-10">
                <h3>
                  대표자<strong>*</strong>
                </h3>
                <div className="input_default">
                  <input
                    type="text"
                    placeholder="대표자 이름을 입력해 주세요."
                    {...register("representative")}
                  />
                </div>
                <ErrorMessage field="representative" />
              </div>
            </div>
            <div className="inputBox mt-10 w-full">
              <h3>사업자등록증 또는 사업자등록증명원</h3>
              <div className="flexGap10 w-full">
                <label style={{ width: "100%", display: "flex", gap: "10px" }}>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                  />
                  <div className="file_name ellipsis formfild">
                    {watch("businessCertificate")?.file?.name ||
                      "첨부파일 선택"}
                  </div>
                  <div className="file_btn">찾기</div>
                </label>
              </div>
            </div>
            <div className="inputBox">
              <h3>기업 구분</h3>
              <div className="input_field text-nowrap">
                <div className="chk_box">
                  <div className="flex-row items-center">
                    {companyTypeOptions.map((opt) => (
                      <label key={`label-${opt.value}`}>
                        <input
                          id={`use_gradebot_${opt.value}`}
                          type="radio"
                          value={opt.value}
                          {...register("companyType")}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  <div className="flex-row items-center">
                    <input
                      id="use_gradebot_extra"
                      type="radio"
                      value="11"
                      {...register("companyType")}
                    />
                    <label htmlFor="use_gradebot_extra">기타</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="inputBox">
              <h3>사원수</h3>
              <div className="input_default">
                <input
                  type="number"
                  className="form-control formfild"
                  {...register("employeeCount")}
                  placeholder="사원수를 입력해 주세요."
                />
              </div>
            </div>
            <div className="inputBox">
              <h3>자본금</h3>
              <div className="input_default">
                <input
                  type="number"
                  className="form-control formfild"
                  placeholder="자본금을 입력해 주세요"
                  {...register("capital")}
                />
              </div>
              <ErrorMessage field="capital" />
            </div>
            <div className="inputBox">
              <h3>매출액</h3>
              <div className="input_default">
                <input
                  type="number"
                  className="form-control formfild"
                  placeholder="매출액을 입력해 주세요"
                  {...register("revenue")}
                />
              </div>
              <ErrorMessage field="revenue" />
            </div>
            <div className="inputBox">
              <h3>당기순익</h3>
              <div className="input_default">
                <input
                  type="number"
                  className="form-control formfild"
                  placeholder="당기순익을 입력해 주세요."
                  {...register("profit")}
                />
              </div>
            </div>
          </div>
          <p className="blueLabel modify">
            기업정보 입력 후 관리자의 승인이 완료되면
            <br />
            모든 공고를 등록할 수 있습니다.
            <br />
            승인까지는 최대 1일(영업일 기준) 소요됩니다.
          </p>
        </section>
        <div
          className=" flex justify-center"
          style={{ paddingBottom: "144px" }}
        >
          <button
            className="blueBtn mt-25"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(onFormSubmit)();
            }}
            // type="submit"
          >
            가입하기
          </button>
        </div>
      </form>
      {/* <MainFooter /> */}
    </div>
  );
};

export default MobileCorpJoin;
