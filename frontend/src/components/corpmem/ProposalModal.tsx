import React, { useState, useEffect } from "react";
import CustomModal from "../common/CustomModal";
import "./ProposalModal.css";
import { JobPosition, ProposalData } from "../../types/talent";
import { fetchJobPositions } from "../../api/talentApi";
import { formatGender } from "../../utils/formatUtils";

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProposalData) => void;
  name: string;
  gender: string;
  age: number;
  width?: string;
}

export default function ProposalModal({
  isOpen,
  onClose,
  onSubmit,
  name,
  gender,
  age,
  width,
}: ProposalModalProps) {
  const [formData, setFormData] = useState<ProposalData>({
    jobseekerId: 0,
    jobPostId: 0,
    position: "",
    message: "",
    positionInfo: "",
    manager: "인사팀",
  });
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProposalData, string>>
  >({});

  // load positions
  useEffect(() => {
    if (isOpen) {
      fetchJobPositions()
        .then((data) => setJobPositions(data || []))
        .catch(() => setJobPositions([]));
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
    // clear existing error on change
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!formData.jobPostId || formData.jobPostId === 0) {
      errs.jobPostId = "포지션을 선택해주세요.";
    }
    if (!formData.position.trim()) {
      errs.position = "제안할 포지션명을 입력해주세요.";
    }
    if (!formData.message.trim()) {
      errs.message = "제안 내용을 입력해주세요.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      jobseekerId: 0,
      jobPostId: 0,
      position: "",
      message: "",
      positionInfo: "",
      manager: "인사팀",
    });
    setErrors({});
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="포지션 제안하기"
      width={width || "800px"}
    >
      <div className="proposal-container">
        <div className="position-select">
          <select
            name="jobPostId"
            value={formData.jobPostId}
            onChange={handleChange}
            className={`nice-select ${errors.jobPostId ? "error" : ""}`}
          >
            <option value={0}>포지션을 선택하세요</option>
            {jobPositions.map((pos) => (
              <option key={pos.id} value={pos.id}>
                {pos.title}
              </option>
            ))}
          </select>
          {errors.jobPostId && (
            <div className="error-message">{errors.jobPostId}</div>
          )}
        </div>

        <form
          className="proposal-form"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <div className="form-group bundle" style={{ marginBottom: "30px" }}>
            <label>후보자명</label>
            <p>
              {name}({formatGender(gender)}, {isNaN(age) ? age : `${age}세`})
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="position">제안 포지션명</label>
            <input
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="제안 포지션명을 입력해 주세요."
              className={`form-control ${errors.position ? "error" : ""}`}
            />
          </div>
          {errors.position && (
            <div className="error-message" style={{ marginLeft: "130px" }}>
              {errors.position}
            </div>
          )}
          <div className="form-group" style={{ alignItems: "start" }}>
            <label htmlFor="message" style={{ marginTop: "17px" }}>
              제안 내용
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="제안 내용을 입력해 주세요."
              className={`form-control ${errors.message ? "error" : ""}`}
            />
          </div>
          {errors.message && (
            <div className="error-message" style={{ marginLeft: "130px" }}>
              {errors.message}
            </div>
          )}
          <div className="form-group" style={{ alignItems: "start" }}>
            <label htmlFor="positionInfo" style={{ marginTop: "17px" }}>
              포지션 정보
            </label>
            <textarea
              id="positionInfo"
              name="positionInfo"
              value={formData.positionInfo}
              onChange={handleChange}
              placeholder="포지션 정보에 대한 내용을 입력해 주세요."
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="manager">담당자</label>
            <input
              id="manager"
              name="manager"
              value={formData.manager}
              onChange={handleChange}
              placeholder="담당자"
              className="form-control"
            />
          </div>

          <div className="button-box">
            <button type="submit" className="submit-btn">
              제안 보내기
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              style={{
                background: "white",
                border: "#999 1px solid",
                color: "#999",
              }}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </CustomModal>
  );
}
