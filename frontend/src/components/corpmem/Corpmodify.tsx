import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CorpLayout from "../layout/CorpLayout";
import "../../../public/css/corpmypage.css";
import "../../../public/css/nice-select.css";
import "./JobpostSelect.css";
import { CompanyInfo, initialCompanyInfo } from "../../types/corp";
import { companyApi } from "../../api/company";
import CorpForm from "../common/CorpForm";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const Corpmodify: React.FC = () => {
  const navigate = useNavigate();

  const [corpInfo, setCorpInfo] = useState<CompanyInfo>(initialCompanyInfo);
  const [verificationTimer, setVerificationTimer] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetchCorpInfo();
  }, []);

  useEffect(() => {
    if (verificationTimer > 0) {
      const timer = setInterval(() => {
        setVerificationTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [verificationTimer]);

  function extractActualFilename(url: string): string {
    const fullFilename = url.split("/").pop() || "";

    const parts = fullFilename.split("_");

    if (parts.length > 1) {
      return parts.slice(1).join("_");
    }

    return fullFilename;
  }

  const fetchCorpInfo = async () => {
    try {
      const response = await companyApi.getCompanyInfo();
      if (response) {
        setCorpInfo(response);

        if (response.businessCertificate) {
          const certificateUrl =
            response.businessCertificate?.filedownload ||
            response.businessCertificate?.fileurl ||
            "";

          if (certificateUrl && typeof certificateUrl === "string") {
            const actualFilename = extractActualFilename(certificateUrl);

            setCorpInfo((prev) => ({
              ...prev,
              businessCertificate: {
                ...(prev.businessCertificate || {}),
                ...response.businessCertificate!,
                filedownload: certificateUrl,
                fileurl: certificateUrl,
                filename: actualFilename || "business-certificate",
              },
            }));
          }
        }

        if (
          response.managerEmail &&
          typeof response.managerEmail === "string" &&
          response.managerEmail.includes("@")
        ) {
          const [emailLocal, emailDomain] = response.managerEmail.split("@");
          setCorpInfo((prev) => ({
            ...prev,
            managerEmail: emailLocal || "",
            emailDomain: emailDomain || "",
          }));
        }

        setIsLoaded(true);
      }
    } catch (error) {
      console.error("기업 정보를 불러오는 중 오류가 발생했습니다:", error);
      setIsLoaded(true);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const formData = new FormData();

      const fullEmail =
        data.managerEmail && data.emailDomain
          ? `${data.managerEmail}@${data.emailDomain}`
          : data.managerEmail;

      const { businessCertificate, ...restData } = data;
      const jsonData = {
        ...restData,
        managerEmail: fullEmail,
      };

      formData.append("data", JSON.stringify(jsonData));

      if (
        businessCertificate &&
        businessCertificate.file instanceof File &&
        !businessCertificate.file.name.startsWith("http")
      ) {
        formData.append("businessCertificate", businessCertificate.file);
      }

      const response = await companyApi.updateCompanyInfo(formData);

      if (response) {
        alert("기업 정보가 성공적으로 수정되었습니다.");
        window.location.href = "/corpmem/mypage";
        // navigate(-1);
      }
    } catch (error) {
      console.error("기업 정보 수정 중 오류가 발생했습니다:", error);
      alert("기업 정보 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleCancel = () => {
    navigate("/corpmem/mypage");
  };

  return (
    <CorpLayout>
      <MetaTagHelmet title="기업 정보 수정" description="기업 정보 수정" />
      <div className="container-center-horizontal">
        <div className="crop-wrap screen">
          <div className="container">
            <div className="corpmodify corp_join_new">
              {isLoaded && (
                <CorpForm
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  initialData={corpInfo}
                  isEditMode={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </CorpLayout>
  );
};

export default Corpmodify;
