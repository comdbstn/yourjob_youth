import React, { useEffect, useState } from "react";

import "./ApplyModalMobile.css";
import { Option } from "../../../../../app/dummy/options";
import { axiosInstance } from "../../../../../api/axios";
import { jobpostApi } from "../../../../../api/jobpost";
import { resumeApi } from "../../../../../api/resume";
import { ResumeItem } from "../../../../../types/resume";
import CustomModal from "../../../../common/CustomModal";
import CustomModalMobile from "../../CustomModal/CustomModalMobile";
import { fetchJobpostData, JobpostDataItem } from "../../../../../api/jobpostData";

interface ApplyModalMobileProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  companyName: string;
  jobTitle: string;
  width?: string;
}

const ApplyModalMobile: React.FC<ApplyModalMobileProps> = ({
  isOpen,
  onClose,
  jobId,
  companyName,
  jobTitle,
  width,
}) => {
  const [step, setStep] = useState<"select" | "complete">("select");
  const [selectedJobType, setSelectedJobType] = useState<string | null>(null);
  const [selectedJobTypeName, setSelectedJobTypeName] = useState<string | null>(
    null,
  );
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [jobTypeData, setJobTypeData] = useState<JobpostDataItem[]>([]);
  const [jobApplyOptions, setJobApplyOptions] = useState<Option[]>([]);
  const [resumes, setResumes] = useState<Option[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState<
    {
      title: string;
      content: File | null;
      type: string;
    }[]
  >([]);

  const handleAddItem = () => {
    if (additionalInfo.length >= 3) {
      alert("선택 항목은 최대 3개까지만 추가할 수 있습니다.");
      return;
    }
    setAdditionalInfo([
      ...additionalInfo,
      {
        title: "",
        content: null,
        type: "custom",
      },
    ]);
  };

  const handleAdditionalInfoInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: "title" | "content",
  ) => {
    if (field === "content" && e.target.files && e.target.files[0]) {
      const newAdditionalInfo = [...additionalInfo];
      newAdditionalInfo[index][field] = e.target.files[0];
      setAdditionalInfo(newAdditionalInfo);
    } else if (field === "title") {
      const { value } = e.target;
      const newAdditionalInfo = [...additionalInfo];
      newAdditionalInfo[index][field] = value;
      setAdditionalInfo(newAdditionalInfo);
    }
  };

  const handleApply = async () => {
    try {
      const formData = new FormData();
      formData.append("jobId", jobId.toString());
      formData.append("jobType", selectedJobType || "");
      formData.append("resumeId", selectedResumeId?.toString() || "");
      formData.append("jobTypeName", selectedJobTypeName || "");

      // 첨부파일 정보를 개별 필드로 추가
      additionalInfo.forEach((info, index) => {
        formData.append(`attachments[${index}].title`, info.title);
        if (info.content) {
          formData.append(`attachments[${index}].file`, info.content);
        }
      });

      const response = await axiosInstance.post(
        "/api/v1/applications",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setStep("complete");
    } catch (error: any) {
      if (error.response?.status === 409) {
        alert("이미 지원한 채용공고입니다.");
        handleClose();
      } else {
        console.error("지원 과정에서 오류가 발생했습니다:", error);
      }
    }
  };

  const handleClose = () => {
    setStep("select");
    setSelectedResumeId(null);
    setSelectedJobType(null);
    onClose();
  };
  
  const mappingJobType = (id: string): string => {
    const found = jobTypeData.find((item) => item.operationDataId === id);
    return found?.level1 ?? id;
  };

  useEffect(() => {
    const fetchApplyOptions = async () => {
      try {
        const response = await jobpostApi.getJobpostTypes(jobId);
        setJobApplyOptions(response || []);

        // setJobApplyOptions(marketingOptions);
      } catch (error) {
        console.error("지원분야 조회에 실패했습니다:", error);
      }
    };
    fetchApplyOptions();
    
    const fetchData = async () => {
      const jobTypeData = await fetchJobpostData("00000009");
      setJobTypeData(jobTypeData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const params = {
          page: 1,
          size: 10,
        };
        const response = await resumeApi.getResumes(params);
        setResumes(
          response.content &&
            response.content.map((resume: ResumeItem) => ({
              id: resume.id,
              value: resume.title,
              label: resume.title,
            })),
        );
      } catch (error) {
        console.error("이력서 조회에 실패했습니다:", error);
      }
    };
    fetchResumes();
  }, []);

  return (
    <>
      <CustomModalMobile
        isOpen={isOpen}
        onClose={handleClose}
        title={step === "complete" ? "" : "입사지원"}
        width={width ? width : "430px"}
      >
        <div className="d-apply-modal-container">
          {step === "select" && (
            <>
              <div className="section">
                <div>
                  <p className="company-name">{companyName}</p>
                  <p className="section-title">{jobTitle}</p>
                </div>

                <div className="input-wrapper">
                  <select
                    className="input"
                    value={selectedJobType || ""}
                    onChange={(e) => {
                      setSelectedJobType(e.target.value);
                      const selectedId = e.target.value;
                      const sel = jobApplyOptions.find(
                        (opt) => String(opt.job_type) === selectedId,
                      );

                      setSelectedJobTypeName(sel ? sel.job_type! : null);
                    }}
                  >
                    <option value="" disabled>
                      지원분야를 선택해 주세요.
                    </option>
                    {jobApplyOptions.map((job) => {
                      const id = String(job.job_type);
                      return (
                        <option
                          key={id}
                          value={id}
                      >
                          {mappingJobType(id)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="section">
                <div>
                  <p className="section-title">지원이력서</p>
                </div>

                <div className="input-wrapper">
                  <select
                    className="input"
                    value={selectedResumeId || ""}
                    onChange={(e) => {
                      const resumeId = Number(e.target.value);
                      const resume = resumes.find((r) => r.id === resumeId);
                      setSelectedResumeId(resume ? resume.id : null);
                    }}
                  >
                    <option value="" disabled>
                      이력서를 선택해 주세요.
                    </option>
                    {resumes?.map((resume) => (
                      <option
                        key={`${resume.id}-${resume.value}`}
                        value={resume.id}
                      >
                        {resume.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="section">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <p className="section-title">선택항목</p>
                  <button className="add-item-btn" onClick={handleAddItem}>
                    파일 첨부
                  </button>
                </div>

                <div className="divider" style={{ marginBottom: "15px" }} />

                {additionalInfo.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      marginBottom: "20px",
                    }}
                  >
                    <span className="add-item-title">{`${
                      index + 1
                    }번째 항목`}</span>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        className="input"
                        placeholder="제목을 입력해 주세요."
                        value={item.title}
                        onChange={(e) =>
                          handleAdditionalInfoInputChange(e, index, "title")
                        }
                      />
                    </div>
                    <div className="input-wrapper">
                      <label
                        htmlFor={`file-upload-${index}`}
                        className="upload-label"
                        style={{ width: "100%" }}
                      >
                        <input
                          id={`file-upload-${index}`}
                          type="file"
                          className="input"
                          onChange={(e) =>
                            handleAdditionalInfoInputChange(e, index, "content")
                          }
                          style={{ display: "none" }}
                        />
                        <div className="input file-upload-wrapper">
                          <span
                            className={`file-upload-text ${
                              item.content ? "has-file" : ""
                            }`}
                          >
                            {item.content
                              ? item.content.name
                              : "파일을 선택해 주세요."}
                          </span>
                          <i className="fa-solid fa-upload file-upload-icon"></i>
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="terms">
                • 개인정보보호를 위해 개인정보가 포함된 파일은
                <br />
                사전동의 없이 삭제될 수 있습니다.
                <br />• 제출서류는 채용 마감 후 90일까지 지원기업에게
                제공됩니다.
                <br /> 제출에 동의할 경우에만 [지원하기]버튼을 눌러주세요.
                <br /> 동의하지 않을 경우 입사지원이 불가능합니다.
              </div>

              <div className="footer">
                <button
                  className={`button ${
                    !selectedResumeId ? "button-disabled" : ""
                  }`}
                  disabled={!selectedResumeId}
                  onClick={handleApply}
                >
                  지원하기
                </button>
              </div>
            </>
          )}

          {step === "complete" && (
            <div className="d-apply-modal-container complete">
              <p className="complete-message">지원이 완료되었습니다.</p>
              <button className="confirm-button" onClick={handleClose}>
                확인
              </button>
            </div>
          )}
        </div>
      </CustomModalMobile>
    </>
  );
};

export default ApplyModalMobile;
