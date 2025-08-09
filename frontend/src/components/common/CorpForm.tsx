import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CompanyInfo, initialCompanyInfo } from "../../types/corp";
import { companyApi } from "../../api/company";
import { CompanyTypeOption } from "../../api/getLevelOneCodes";
import "../../components/member/CorpJoin.css";
import CheckBox from "../mobile/components/CheckBox/CheckBox";
import getOperationData from "../../api/operatuibData";
import { OperationDataResponse } from "../../types/operationData";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";

interface CorpFormProps {
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  initialData?: CompanyInfo;
  isEditMode?: boolean;
}

const CorpForm: React.FC<CorpFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditMode = false,
}) => {
  const { customAlert } = useAlert();
  const [emailDomains] = useState([
    "naver.com",
    "gmail.com",
    "daum.net",
    "nate.com",
    "직접입력",
  ]);
  const [emailDomain, setEmailDomain] = useState(() => {
    if (isEditMode && initialData?.emailDomain) {
      return initialData.emailDomain;
    }
    return "";
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendVerificationCode, setIsSendVerificationCode] = useState(false);
  const [verificationTimer, setVerificationTimer] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEmailModified, setIsEmailModified] = useState(false);
  const [regionData, setRegionData] = useState<OperationDataResponse>();

  const [terms, setTerms] = useState({
    all: false,
    service: false,
    privacy: false,
    marketingEmail: false,
    marketingSms: false,
  });
  const [companyTypeOptions, setCompanyTypeOptions] = useState<
    CompanyTypeOption[]
  >([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors: formErrors },
  } = useForm({
    defaultValues: initialData || initialCompanyInfo,
  });

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
    if (isEditMode && initialData?.managerEmail) {
      const currentEmail = initialData.managerEmail;
      const currentDomain = initialData.emailDomain;

      const isModified =
        watch("managerEmail") !== currentEmail ||
        emailDomain !== (currentDomain || "");

      setIsEmailModified(isModified);

      // 이메일이 변경되지 않았으면 인증 상태를 true로 설정
      // if (!isModified) {
      //   setIsEmailVerified(true);
      // }
    }
  }, [watch("managerEmail"), emailDomain]);

  useEffect(() => {
    if (verificationTimer > 0) {
      const timer = setInterval(() => {
        setVerificationTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [verificationTimer]);

  const handleSendVerificationCode = async () => {
    try {
      await companyApi.sendVerificationCode(
        `${watch("managerEmail")}@${emailDomain}`,
      );
      setIsSendVerificationCode(true);
      setVerificationTimer(300);
      alert("인증코드가 전송되었습니다.");
    } catch (error) {
      alert("인증코드 전송에 실패했습니다.");
    }
  };

  const handleVerifyCode = async () => {
    try {
      await companyApi.verifyEmailCode(
        `${watch("managerEmail")}@${emailDomain}`,
        verificationCode,
      );
      setIsEmailVerified(true);
      setVerificationTimer(0);
      alert("이메일 인증이 완료되었습니다.");
    } catch (error) {
      alert("인증코드가 일치하지 않습니다.");
    }
  };
  const requiredIds = [
    "username",
    "password",
    "passwordConfirm",
    "managerName",
    "managerPhone",
    "managerEmail",
    "companyName",
    "businessNumber",
    "representative",
    "businessCertificate",
    "companyType",
    "terms",
  ];

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
    const value = e.target.value.replace(/[^0-9]/g, "");
    let formattedValue = value;

    if (value.length <= 10) {
      formattedValue = value.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    } else if (value.length === 11) {
      formattedValue = value.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    } else {
      formattedValue = value.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
    }

    setValue("managerPhone", formattedValue);
  };

  const handleBusinessNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value.replace(/\D/g, "");
    setValue("businessNumber", value);
  };

  const handleAllTermsChange = (checked: boolean) => {
    setTerms({
      all: checked,
      service: checked,
      privacy: checked,
      marketingEmail: checked,
      marketingSms: checked,
    });
  };

  const handleTermChange = (term: keyof typeof terms, checked: boolean) => {
    const newTerms = {
      ...terms,
      [term]: checked,
    };

    const allChecked =
      newTerms.service &&
      newTerms.privacy &&
      newTerms.marketingEmail &&
      newTerms.marketingSms;

    setTerms({
      ...newTerms,
      all: allChecked,
    });
  };
  const validateForm = (data: any) => {
    const errs: Record<string, string> = {};
    const pwdRule = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    const phoneRule = /^\d{3}-\d{3,4}-\d{4}$|^\d{4}-\d{4}-\d{4}$/;
    const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 필수값 검증 순서 정의
    const requiredFields = [
      { field: 'username', message: '아이디를 입력해주세요.' },
      { field: 'password', message: '비밀번호를 입력해주세요.', 
        validate: (value: string) => !pwdRule.test(value) ? '비밀번호는 최소 8자 이상이며 영문, 숫자, 특수문자를 모두 포함해야 합니다.' : '' },
      { field: 'passwordConfirm', message: '비밀번호 확인을 입력해주세요.',
        validate: (value: string) => value !== data.password ? '비밀번호가 일치하지 않습니다.' : '' },
      { field: 'managerName', message: '담당자 이름을 입력해주세요.' },
      { field: 'managerPhone', message: '휴대폰 번호를 입력해주세요.',
        validate: (value: string) => !phoneRule.test(value) ? '휴대폰 번호 형식이 올바르지 않습니다.' : '' },
      { field: 'managerEmail', message: '이메일을 입력해주세요.',
        validate: (value: string) => !emailRule.test(`${value}@${emailDomain}`) ? '올바른 이메일 형식이 아닙니다.' : '' },
      { field: 'companyName', message: '기업명을 입력해주세요.' },
      { field: 'businessNumber', message: '사업자등록번호를 입력해주세요.',
        validate: (value: string) => !/^\d{10}$/.test(value) ? '사업자등록번호는 10자리 숫자여야 합니다.' : '' },
      { field: 'representative', message: '대표자 이름을 입력해주세요.' },
      { field: 'businessCertificate', message: '사업자등록증을 첨부해주세요.',
        validate: (value: any) => !value?.file ? '사업자등록증을 첨부해주세요.' : '' },
      { field: 'companyType', message: '기업 구분을 선택해주세요.' }
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

    setErrors(errs);
    return errs;
  };

  const onFormSubmit = (data: any) => {
    const errs = validateForm(data);

    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0];
      const el = document.getElementById(firstKey);
      if (el) {
        el.scrollIntoView();
        el.focus();
      }

      customAlert({
        content: '필수 항목을 확인해주세요.',
      });
      return;
    }

    const selectedCompanyType = companyTypeOptions.find(
      (option) => option.value === data.companyType,
    );

    const reFormData = {
      ...data,
      managerEmail: `${data.managerEmail}@${emailDomain}`,
      companyType: selectedCompanyType
        ? selectedCompanyType.operationDataId
        : data.companyType,
    };

    onSubmit(reFormData);
  };

  function getExtensionFromMimeType(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "application/pdf": ".pdf",
      "image/gif": ".gif",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ".docx",
      "application/msword": ".doc",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        ".xlsx",
      "application/vnd.ms-excel": ".xls",
    };

    return mimeToExt[mimeType] || "";
  }

  function extractActualFilename(url: string): string {
    if (!url) return "";

    const fullFilename = url.split("/").pop() || "";

    const parts = fullFilename.split("_");

    if (parts.length > 1) {
      return parts.slice(1).join("_");
    }

    return fullFilename;
  }
  const fetchRegion = async () => {
    const response = await getOperationData("00000002");
    setRegionData(response);
  };

  useEffect(() => {
    fetchRegion();
  }, []);
  const password = watch("password");
  const passwordConfirm = watch("passwordConfirm");
  const pwdRule = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
  const [pwdHelper, setPwdHelper] = useState("");

  useEffect(() => {
    if (!password) {
      setPwdHelper("");
    } else if (pwdRule.test(password)) {
      setPwdHelper("사용 가능한 비밀번호 형식입니다.");
    } else {
      setPwdHelper(
        "비밀번호는 최소 8자 이상이며 영문, 숫자, 특수문자를 모두 포함해야 합니다.",
      );
    }
  }, [password]);

  const ErrorMessage = ({ field }: { field: string }) => {
    return errors[field] ? (
      <div className="error-message">{errors[field]}</div>
    ) : null;
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <div className="join_box">
        <div className="box_title">계정 정보</div>
        <div className="input_field" id="username">
          <div className="span">
            아이디 <span className="required">*</span>
          </div>
          <div className="file_cus">
            <input
              type="text"
              className="form-control formfild"
              placeholder="아이디를 입력해 주세요."
              disabled={isEditMode}
              {...register("username")}
            />

            <ErrorMessage field="username" />
          </div>
        </div>
        <div className="input_field" id="password">
          <div className="span">
            비밀번호 <span className="required">*</span>
          </div>
          <div className="file_cus">
            <input
              type="password"
              className="form-control formfild"
              placeholder="비밀번호를 입력해 주세요."
              {...register("password")}
            />
            {pwdHelper && (
              <div
                style={{
                  marginTop: 4,
                  color: pwdRule.test(password ?? "") ? "green" : "red",
                  fontSize: "0.9rem",
                }}
              >
                {pwdHelper}
              </div>
            )}
            {/* <ErrorMessage field="password" /> */}
          </div>
        </div>
        <div className="input_field" id="passwordConfirm">
          <div className="span">
            비밀번호 확인 <span className="required">*</span>
          </div>
          <div className="file_cus">
            <input
              type="password"
              className="form-control formfild"
              placeholder="한 번 더 입력해 주세요."
              {...register("passwordConfirm")}
            />

            {passwordConfirm && (
              <>
                {" "}
                {passwordConfirm.length > 0 && (
                  <div
                    className="error-message"
                    style={{
                      color: password === passwordConfirm ? "green" : "red",
                    }}
                  >
                    {password === passwordConfirm
                      ? "비밀번호가 일치합니다."
                      : "비밀번호가 일치하지 않습니다."}
                  </div>
                )}
              </>
            )}
            {/* <ErrorMessage field="passwordConfirm" /> */}
          </div>
        </div>
      </div>

      <div className="join_box">
        <div className="box_title">담당자 정보</div>
        <div className="input_field" id="managerName">
          <div className="span">
            담당자 명 <span className="required">*</span>
          </div>
          <div className="file_cus">
            <input
              type="text"
              className="form-control formfild"
              placeholder="이름을 입력해 주세요."
              {...register("managerName")}
            />
            <ErrorMessage field="managerName" />
          </div>
        </div>
        <div className="input_field" id="managerPhone">
          <div className="span">
            담당자 휴대폰 번호 <span className="required">*</span>
          </div>
          <div className="file_cus">
            <input
              type="tel"
              className="form-control formfild"
              placeholder="휴대폰 번호를 입력해주세요."
              maxLength={14}
              onChange={handlePhoneChange}
              value={watch("managerPhone")}
            />
            <ErrorMessage field="managerPhone" />
          </div>
        </div>
        <div className="input_field" id="managerEmail">
          <div className="span" style={{ textWrap: "nowrap" }}>
            담당자 이메일 <span className="required">*</span>
          </div>
          <div className="email-input-wrapper">
            <div className="file_cus">
              <label>
                <input
                  type="text"
                  className="form-control formfild"
                  placeholder="이메일을 입력해 주세요."
                  disabled={isEmailVerified}
                  {...register("managerEmail")}
                />
                <span className="email-at">@</span>
                <div className="email-domain-wrapper">
                  <input
                    type="text"
                    className="form-control formfild email-domain"
                    placeholder="도메인을 선택하거나 입력하세요"
                    value={emailDomain}
                    disabled={isEmailVerified}
                    onChange={(e) => setEmailDomain(e.target.value)}
                  />
                  <div className="email-domain-dropdown">
                    {emailDomains.map((domain) => (
                      <div
                        key={domain}
                        className="email-domain-option"
                        onClick={() => {
                          setEmailDomain(domain);
                        }}
                      >
                        {domain}
                      </div>
                    ))}
                  </div>
                </div>
                {/* {(!isEditMode || isEmailModified) && (
                  <button
                    type="button"
                    className="file_btn"
                    onClick={handleSendVerificationCode}
                    disabled={isEmailVerified}
                  >
                    인증코드 보내기
                  </button>
                )} */}
                <button
                  type="button"
                  className="file_btn"
                  onClick={handleSendVerificationCode}
                  disabled={isEmailVerified}
                >
                  인증코드 보내기
                </button>
              </label>
            </div>
            {isSendVerificationCode && (
              //  && (!isEditMode || isEmailModified)
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
                    onClick={handleVerifyCode}
                    disabled={!verificationCode || isEmailVerified}
                  >
                    인증하기
                  </button>
                </label>
              </div>
            )}
            <ErrorMessage field="emailVerification" />
            <ErrorMessage field="emailDomain" />
            {isEmailVerified && (
              <div className="verification-success">
                <i className="fas fa-check-circle"></i> 이메일 인증이
                완료되었습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="join_box">
        <div className="box_title">기업 정보</div>
        <div className="input_field" id="companyName">
          <div className="span">
            기업명 <span className="required">*</span>
          </div>
          <div className="file_cus">
            <label>
              <input
                type="text"
                className="form-control formfild"
                placeholder="기업명을 입력해 주세요."
                {...register("companyName")}
              />
            </label>
            <ErrorMessage field="companyName" />
          </div>
        </div>
        <div className="input_field" id="businessNumber">
          <div className="span">
            사업자등록번호 <span className="required">*</span>
          </div>
          <div className="file_cus">
            <input
              type="text"
              className="form-control formfild"
              placeholder="0123456789"
              maxLength={10}
              onChange={handleBusinessNumberChange}
              value={watch("businessNumber")}
            />
            <ErrorMessage field="businessNumber" />
          </div>
        </div>
        <div className="input_field" id="representative">
          <div className="span">
            대표자 <span className="required">*</span>
          </div>
          <div className="file_cus">
            <input
              type="text"
              className="form-control formfild"
              placeholder="대표자 이름을 입력해 주세요."
              {...register("representative")}
            />
            <ErrorMessage field="representative" />
          </div>
        </div>
        <div className="input_field" id="businessCertificate">
          <div className="span">
            사업자등록증(고유번호증) 또는
            <br />
            사업자등록증명원 <span className="required">*</span>
          </div>
          <div className="file_cus">
            <label>
              <input
                type="file"
                className="form-control formfild"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
              />
              <div className="file_name ellipsis formfild">
                {watch("businessCertificate")?.file instanceof File
                  ? (watch("businessCertificate")?.file as File).name ||
                    "첨부파일을 선택해주세요."
                  : watch("businessCertificate")?.filedownload
                  ? extractActualFilename(
                      watch("businessCertificate")?.filedownload || "",
                    )
                  : "첨부파일을 선택해주세요."}
              </div>
              <div className="file_btn">찾기</div>
            </label>
            {watch("businessCertificate") && (
              <div style={{ marginTop: "10px" }}>
                <button
                  type="button"
                  className="preview-btn"
                  onClick={async () => {
                    try {
                      const certificateData = watch("businessCertificate");
                      if (!certificateData) {
                        alert("다운로드할 파일이 없습니다.");
                        return;
                      }

                      if (certificateData.file instanceof File) {
                        const url = URL.createObjectURL(certificateData.file);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download =
                          certificateData.file.name || "business-certificate";
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        return;
                      }

                      const downloadUrl =
                        certificateData.filedownload ||
                        certificateData.fileurl ||
                        "";

                      if (downloadUrl && typeof downloadUrl === "string") {
                        const actualFilename =
                          extractActualFilename(downloadUrl);

                        const downloadIndicator = document.createElement("div");
                        downloadIndicator.textContent = "다운로드 중...";
                        downloadIndicator.style.position = "fixed";
                        downloadIndicator.style.top = "50%";
                        downloadIndicator.style.left = "50%";
                        downloadIndicator.style.transform =
                          "translate(-50%, -50%)";
                        downloadIndicator.style.padding = "10px 20px";
                        downloadIndicator.style.background = "rgba(0,0,0,0.7)";
                        downloadIndicator.style.color = "white";
                        downloadIndicator.style.borderRadius = "5px";
                        downloadIndicator.style.zIndex = "9999";
                        document.body.appendChild(downloadIndicator);

                        const response = await fetch(downloadUrl);

                        if (!response.ok) {
                          throw new Error(
                            `HTTP error! status: ${response.status}`,
                          );
                        }

                        const blob = await response.blob();

                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download =
                          actualFilename ||
                          "business-certificate" +
                            getExtensionFromMimeType(blob.type);
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);

                        document.body.removeChild(downloadIndicator);
                      } else {
                        alert("다운로드할 파일 URL이 없습니다.");
                      }
                    } catch (error) {
                      console.error("파일 다운로드 중 오류 발생:", error);
                      alert(`파일 다운로드 중 오류가 발생했습니다`);
                    }
                  }}
                >
                  다운로드
                </button>
              </div>
            )}
            <ErrorMessage field="businessCertificate" />
          </div>
        </div>
        <p>
          -사업자등록증이 없는 기업, 단체는 담당자 명함과 재직증명서를 제출해
          주세요.
          <br />
          -2MB 이하의 JPG, PDF 파일만 첨부할 수 있습니다.
        </p>

        <div className="input_field" id="companyType">
          <div className="span">
            기업 구분 <span className="required">*</span>
          </div>
          <div className="chk_box">
            <div
              className="flex-row items-center flex-wrap"
              style={{ gap: "10px" }}
            >
              {companyTypeOptions.map((option) => (
                <div key={option.id} className="radio-item">
                  <input
                    id={`company_type_${option.id}`}
                    type="radio"
                    value={option.value}
                    {...register("companyType")}
                  />
                  <label htmlFor={`company_type_${option.id}`}>
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <ErrorMessage field="companyType" />
        </div>

        <div className="input_field">
          <div className="span">사원수</div>
          <div className="file_cus">
            <input
              type="number"
              className="form-control formfild"
              placeholder="사원수를 입력해 주세요."
              {...register("employeeCount")}
            />
          </div>
        </div>
        <div className="input_field">
          <div className="span">자본금</div>
          <div className="file_cus">
            <input
              type="text"
              className="form-control formfild"
              placeholder="자본금을 입력해 주세요."
              value={watch("capital")}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, "");
                const formatted = onlyDigits
                  ? parseInt(onlyDigits, 10).toLocaleString()
                  : "";
                setValue("capital", formatted as any);
              }}
            />
          </div>
        </div>
        <div className="input_field">
          <div className="span">매출액</div>
          <div className="file_cus">
            <input
              type="text"
              className="form-control formfild"
              placeholder="매출액을 입력해 주세요."
              value={watch("revenue")}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, "");
                const formatted = onlyDigits
                  ? parseInt(onlyDigits, 10).toLocaleString()
                  : "";
                setValue("revenue", formatted as any);
              }}
            />
          </div>
        </div>
        <div className="input_field">
          <div className="span">당기순익</div>
          <div className="file_cus">
            <input
              type="text"
              className="form-control formfild"
              placeholder="당기순익을 입력해 주세요."
              value={watch("profit")}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, "");
                const formatted = onlyDigits
                  ? parseInt(onlyDigits, 10).toLocaleString()
                  : "";
                setValue("profit", formatted as any);
              }}
            />
          </div>
        </div>

        {!isEditMode && (
          <p className="txt tcolor1" style={{ textAlign: "center" }}>
            기업정보 입력 후 관리자의 승인이 완료되면 모든 공고를 등록할 수
            있습니다. 승인까지는 최대 1일(영업일 기준) 소요됩니다.
          </p>
        )}
      </div>
      <div className="join_box">
        <div
          className="box_title"
          style={{ marginRight: "auto", textAlign: "start" }}
        >
          약관 동의<strong style={{ color: "red" }}>*</strong>
        </div>
        <div className="terms">
          <div className="selectAll">
            <div className="termsRow">
              <CheckBox
                isChecked={terms.all}
                setIsChecked={handleAllTermsChange}
              />
              <p>전체동의</p>
            </div>
          </div>
          <div className="termsList">
            <div className="flexJb">
              <div className="termsRow">
                <CheckBox
                  isChecked={terms.service}
                  setIsChecked={(checked) =>
                    handleTermChange("service", checked)
                  }
                />
                <p>
                  기업회원 이용약관에 동의
                  <strong className="mandatory">(필수)</strong>
                </p>
              </div>
              <button
                type="button"
                className="viewDetailBtn"
                onClick={() => window.open("/terms/service", "_blank")}
              >
                상세보기
              </button>
            </div>
            <div className="flexJb">
              <div className="termsRow">
                <CheckBox
                  isChecked={terms.privacy}
                  setIsChecked={(checked) =>
                    handleTermChange("privacy", checked)
                  }
                />
                <p>
                  개인정보 수집 및 이용에 동의
                  <strong className="mandatory">(필수)</strong>
                </p>
              </div>
              <button
                type="button"
                className="viewDetailBtn"
                onClick={() => window.open("/terms/privacy", "_blank")}
              >
                상세보기
              </button>
            </div>
            <div className="termsRow">
              <CheckBox
                isChecked={terms.marketingEmail}
                setIsChecked={(checked) =>
                  handleTermChange("marketingEmail", checked)
                }
              />
              <p>
                마케팅 정보 수신 동의 - 이메일
                <strong className="optional">(선택)</strong>
              </p>
            </div>
            <div className="termsRow">
              <CheckBox
                isChecked={terms.marketingSms}
                setIsChecked={(checked) =>
                  handleTermChange("marketingSms", checked)
                }
              />
              <p>
                마케팅 정보 수신 동의 - SMS / MMS
                <strong className="optional">(선택)</strong>
              </p>
            </div>
          </div>
          <ErrorMessage field="terms" />
        </div>
      </div>
      <div className="btnBox" style={{ justifyContent: "center" }}>
        {isEditMode ? (
          <button type="submit" className="form_btn">
            수정하기
          </button>
        ) : (
          <button type="submit" className="form_btn submit_btn">
            가입하기
          </button>
        )}
        {onCancel && (
          <button type="button" className="home_btn" onClick={onCancel}>
            취소
          </button>
        )}
      </div>
    </form>
  );
};

export default CorpForm;
