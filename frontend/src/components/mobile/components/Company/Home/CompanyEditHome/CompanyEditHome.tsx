import React, { useEffect, useState } from "react";
import MainFooter from "../../../MainFooter/MainFooter";
import MobileMainHeader from "../../../MainHeader/MainHeader";
import "./CompanyEditHome.css";
import { useNavigate } from "react-router-dom";
import { companyApi } from "../../../../../../api/company";
import { CompanyInfo, initialCompanyInfo } from "../../../../../../types/corp";
import { CompanyTypeOption } from "../../../../../../api/getLevelOneCodes";
import { MetaTagHelmet } from "../../../../../common/MetaTagHelmet";

export default function MobileCompanyEditHome() {
  const navigate = useNavigate();

  const [corpInfo, setCorpInfo] = useState<CompanyInfo>(initialCompanyInfo);
  const [companyTypeOptions, setCompanyTypeOptions] = useState<
    CompanyTypeOption[]
  >([]);

  const [verificationTimer, setVerificationTimer] = useState(0);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCodeInput, setVerificationCodeInput] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    fetchCorpInfo();
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

  const fetchCompanyTypes = async () => {
    try {
      const options = await companyApi.getCompanyTypeOptions();
      setCompanyTypeOptions(options);
    } catch (error) {
      console.error("Failed to fetch company type options:", error);
    }
  };

  const fetchCorpInfo = async () => {
    try {
      const response = await companyApi.getCompanyInfo();
      if (response) {
        setCorpInfo(response);

        if (
          response.businessCertificate &&
          !Array.isArray(response.businessCertificate)
        ) {
          try {
            const fileResponse = await fetch(
              response.businessCertificate.filedownload || ""
            );
            const blob = await fileResponse.blob();
            const file = new File(
              [blob],
              response.businessCertificate.filename || "",
              { type: blob.type }
            );
            setCorpInfo((prev) => ({
              ...prev,
              businessCertificate: {
                ...response.businessCertificate,
                filename: response.businessCertificate?.filename,
                filedownload: response.businessCertificate?.filedownload,
                fileurl: response.businessCertificate?.fileurl,
                file,
              },
            }));
          } catch (error) {
            console.error("사업자등록증 파일 변환 실패:", error);
          }
        }

        const [emailLocal, emailDomain] = response.managerEmail.split("@");
        setCorpInfo((prev) => ({
          ...prev,
          managerEmail: emailLocal,
          emailDomain,
        }));
      }
    } catch (error) {
      console.error("기업 정보를 불러오는 중 오류가 발생했습니다:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCorpInfo((prev) => ({
      ...prev,
      [name]: e.target.type === "number" ? Number(value) : value,
    }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCorpInfo((prev) => ({
      ...prev,
      companyType: e.target.value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setCorpInfo((prev) => ({
        ...prev,
        businessCertificate: {
          file,
          filename: file.name,
          filedownload: URL.createObjectURL(file),
          fileurl: URL.createObjectURL(file),
        },
      }));
    } else {
      setCorpInfo((prev) => ({
        ...prev,
        businessCertificate: null,
      }));
    }
  };

  const handleSendVerificationCode = async () => {
    try {
      const email = `${corpInfo.managerEmail}@${corpInfo.emailDomain}`;
      await companyApi.sendVerificationCode(email);
      setVerificationSent(true);
      setVerificationTimer(300);
      setIsEmailVerified(false);
      setVerificationCodeInput("");
      alert("인증코드가 전송되었습니다.");
    } catch (error) {
      console.error("인증코드 전송 실패:", error);
      alert("인증코드 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleVerifyCode = async () => {
    try {
      const email = `${corpInfo.managerEmail}@${corpInfo.emailDomain}`;
      await companyApi.verifyEmailCode(email, verificationCodeInput);
      setIsEmailVerified(true);
      alert("이메일 인증이 완료되었습니다.");
    } catch (error) {
      console.error("인증코드 확인 실패:", error);
      alert("인증번호가 일치하지 않습니다.");
    }
  };

  const handleSearchCompany = async () => {
    if (!corpInfo.businessNumber) {
      alert("사업자등록번호를 입력해주세요.");
      return;
    }
    try {
      const result = await companyApi.searchCompany(corpInfo.businessNumber);
      setCorpInfo((prev) => ({
        ...prev,
        companyName: result.companyName,
        representative: result.representative,
      }));
    } catch (error) {
      console.error("기업 검색 실패:", error);
      alert("기업 검색에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleSubmit = async () => {
    try {
      const selectedCompanyType = companyTypeOptions.find(
        (option) => option.value === corpInfo.companyType
      );

      const formData = new FormData();
      const submitData = {
        ...corpInfo,
        companyType: selectedCompanyType
          ? selectedCompanyType.operationDataId
          : corpInfo.companyType,
      };

      formData.append("data", JSON.stringify(submitData));
      if (corpInfo.businessCertificate?.file) {
        formData.append(
          "businessCertificate",
          corpInfo.businessCertificate.file
        );
      }
      await companyApi.updateCompanyInfo(formData);
      alert("기업 정보가 성공적으로 수정되었습니다.");
      navigate("/m/company/home");
    } catch (error) {
      console.error("기업 정보 수정 중 오류:", error);
      alert("기업 정보 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleCancel = () => {
    navigate("/m/company/home");
  };

  return (
    <div className="mobileCompanyEditHome_Container">
      <MetaTagHelmet
        title="기업회원 정보 수정"
        description="기업회원 정보 수정"
      />
      <MobileMainHeader />

      <section className="contentSection">
        <h3>계정 정보</h3>
        <div className="rows">
          <div className="row">
            <p>아이디</p>
            <div className="input_default">
              <input
                readOnly
                placeholder="가입 시 기재된 내용 노출(수정 불가능)"
                value={corpInfo.username}
              />
            </div>
          </div>
          <div className="row">
            <p>비밀번호</p>
            <div className="input_default">
              <input
                type="password"
                name="password"
                placeholder="비밀번호를 입력해 주세요."
                value={corpInfo.password}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="row">
            <p>비밀번호 확인</p>
            <div className="input_default">
              <input
                type="password"
                name="passwordConfirm"
                placeholder="한 번 더 입력해 주세요."
                value={corpInfo.passwordConfirm}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="contentSection mt-50">
        <h3>담당자 정보</h3>
        <div className="rows">
          <div className="row">
            <p>담당자 명</p>
            <div className="input_default">
              <input
                name="managerName"
                placeholder="가입 시 기재된 내용 노출"
                value={corpInfo.managerName}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="row">
            <p>담당자 휴대폰 번호</p>
            <div className="input_default">
              <input
                name="managerPhone"
                placeholder="가입 시 기재된 내용 노출(수정 불가능)"
                value={corpInfo.managerPhone}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="row">
            <p>담당자 이메일</p>
            <div
              className="budle"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                className="emailBox"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "5px",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  className="input_default"
                  style={{ flex: "1 1 120px", minWidth: 0 }}
                >
                  <input
                    name="managerEmail"
                    placeholder="이메일"
                    value={corpInfo.managerEmail}
                    onChange={handleInputChange}
                    disabled={isEmailVerified}
                  />
                </div>
                <span style={{ paddingTop: "15px" }}>@</span>
                <div
                  className="input_default"
                  style={{ flex: "1 1 120px", minWidth: 0 }}
                >
                  <input
                    name="emailDomain"
                    placeholder="도메인"
                    value={corpInfo.emailDomain}
                    onChange={handleInputChange}
                    disabled={isEmailVerified}
                  />
                </div>
              </div>
              <button
                className="blueBtn"
                onClick={handleSendVerificationCode}
                disabled={verificationTimer > 0 || isEmailVerified}
              >
                {isEmailVerified
                  ? "인증완료"
                  : verificationTimer > 0
                  ? `${Math.floor(verificationTimer / 60)
                      .toString()
                      .padStart(2, "0")}:${(verificationTimer % 60)
                      .toString()
                      .padStart(2, "0")}`
                  : "인증"}
              </button>
            </div>

            {verificationSent && !isEmailVerified && (
              <div
                className="verifyRow"
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "10px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <div
                  className="input_default"
                  style={{ flex: "1 1 150px", minWidth: 0 }}
                >
                  <input
                    placeholder="인증번호 입력"
                    value={verificationCodeInput}
                    onChange={(e) => setVerificationCodeInput(e.target.value)}
                  />
                </div>
                <button
                  className="blueBtn"
                  onClick={handleVerifyCode}
                  disabled={!verificationCodeInput.trim()}
                >
                  확인
                </button>
              </div>
            )}

            {isEmailVerified && (
              <p style={{ color: "green", marginTop: "8px" }}>
                이메일 인증이 완료되었습니다.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-70 contentSection">
        <h3>기업 정보</h3>
        <div className="rows">
          <div className="row">
            <p>
              기업명<span className="essential">*</span>
            </p>
            <div className="budle">
              <div className="input_default">
                <input
                  name="companyName"
                  placeholder="가입 시 기재된 내용 노출(수정 불가능)"
                  value={corpInfo.companyName}
                  onChange={handleInputChange}
                />
              </div>
              <button className="blueBtn" onClick={handleSearchCompany}>
                찾기
              </button>
            </div>
          </div>

          <div className="row">
            <p>
              사업자등록번호<span className="essential">*</span>
            </p>
            <div className="input_default">
              <input
                name="businessNumber"
                placeholder="사업자등록번호를 입력해 주세요."
                value={corpInfo.businessNumber}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="row">
            <p>
              사업자등록증 또는 사업자등록증명원
              <span className="essential">*</span>
            </p>
            <div className="budle">
              <div className="input_default">
                <input
                  type="text"
                  readOnly
                  placeholder="첨부파일을 선택해주세요."
                  value={corpInfo.businessCertificate?.filename || ""}
                />
              </div>
              <label className="blueBtn">
                찾기
                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          <div className="row">
            <p>기업 구분</p>
            <div className="input_field text-nowrap">
              <div className="chk_box">
                <div
                  className="flex-row items-center"
                  style={{ lineHeight: "170%" }}
                >
                  {companyTypeOptions.map((option) => (
                    <div key={option.id} className="radio-item">
                      <input
                        id={`company_type_${option.id}`}
                        type="radio"
                        name="companyType"
                        value={option.value}
                        checked={corpInfo.companyType === option.value}
                        onChange={handleRadioChange}
                      />
                      <label htmlFor={`company_type_${option.id}`}>
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <p>사원수</p>
            <div className="input_default">
              <input
                type="number"
                name="employeeCount"
                placeholder="사원수를 입력해 주세요."
                value={corpInfo.employeeCount || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="row">
            <p>자본금</p>
            <div className="input_default">
              <input
                type="number"
                name="capital"
                placeholder="자본금을 입력해 주세요"
                value={corpInfo.capital || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="row">
            <p>매출액</p>
            <div className="input_default">
              <input
                type="number"
                name="revenue"
                placeholder="매출액을 입력해 주세요"
                value={corpInfo.revenue || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="row">
            <p>당기순익</p>
            <div className="input_default">
              <input
                type="number"
                name="profit"
                placeholder="당기순익을 입력해 주세요."
                value={corpInfo.profit || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </section>

      <div
        className="btnBox mobileCompanyEditHome_btn_area"
        style={{ gap: "10px", marginTop: "60px" }}
      >
        <button className="form_btn" onClick={handleSubmit}>
          수정하기
        </button>
        <button className="home_btn" onClick={handleCancel}>
          취소
        </button>
      </div>

      <MainFooter />
    </div>
  );
}
