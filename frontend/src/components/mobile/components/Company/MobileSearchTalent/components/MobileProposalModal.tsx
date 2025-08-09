import { useState, useEffect } from "react";
import { fetchJobPositions } from "../../../../../../api/talentApi";
import { ProposalData, JobPosition } from "../../../../../../types/talent";
import CustomModalMobile from "../../../CustomModal/CustomModalMobile";
import "./MobileProposalModal.css";
interface MobileProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProposalData) => void;
  name: string;
  gender: string;
  age: number;
}

export default function MobileProposalModal(props: MobileProposalModalProps) {
  const [formData, setFormData] = useState<ProposalData>({
    jobseekerId: 0,
    position: "",
    message: "",
    positionInfo: "",
    manager: "인사팀",
    jobPostId: 0,
  });

  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);

  // 채용 포지션 목록 조회
  useEffect(() => {
    if (props.isOpen) {
      loadJobPositions();
    }
  }, [props.isOpen]);

  const loadJobPositions = async () => {
    try {
      // 채용 포지션 목록 조회 API 호출
      const data = await fetchJobPositions();
      setJobPositions(data || []);
    } catch (err) {
      console.error("채용 포지션 목록 조회 실패:", err);
      setJobPositions([]);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    props.onSubmit(formData);
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    props.onClose();
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
  };

  return (
    <CustomModalMobile
      isOpen={props.isOpen}
      onClose={props.onClose}
      width="95%"
      title="포지션 제안하기"
    >
      <div className="mobileProposalModalContainer">
        <div className="headerSection">
          <select
            name="jobPostId"
            value={formData.jobPostId}
            onChange={handleChange}
            className="nice-select"
          >
            <option value="0">포지션을 선택하세요</option>
            {jobPositions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.title}
              </option>
            ))}
          </select>
        </div>
        <div className="nameRow">
          <p>후보자명</p>
          <p>
            {props.name}({props.gender}, {isNaN(props.age) ? props.age : `${props.age}세`})
          </p>
        </div>
        <div className="row">
          <p className="rowHeader">제안 포지션명</p>
          <div className="input_default">
            <input
              placeholder="제안 포지션명을 입력해 주세요."
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              style={{ fontSize: "14px" }}
            />
          </div>
        </div>
        <div className="row">
          <p className="rowHeader">제안 내용</p>
          <textarea
            style={{ padding: "15px" }}
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="제안 내용을 입력해 주세요."
            required
            className="form-control"
          ></textarea>
        </div>
        <div className="row">
          <p className="rowHeader">포지션 정보</p>
          <textarea
            style={{ padding: "15px" }}
            id="positionInfo"
            name="positionInfo"
            value={formData.positionInfo}
            onChange={handleChange}
            placeholder="제안 내용을 입력해 주세요."
            required
            className="form-control"
          ></textarea>
        </div>
        <div className="row">
          <p className="rowHeader">담당자</p>
          <div className="input_default">
            <input
              id="manager"
              name="manager"
              value={formData.manager}
              onChange={handleChange}
              placeholder="제안 포지션명을 입력해 주세요."
            />
          </div>
        </div>
        <div className="flexGap10">
          <button className="blueBtn mt-20" onClick={handleSubmit}>
            제안 보내기
          </button>
          <button
            className="blueBtn mt-20"
            onClick={() => {
              props.onClose();
            }}
            style={{
              background: "white",
              border: "#c8c8c8 1px solid",
              color: "#c8c8c8",
            }}
          >
            {" "}
            취소
          </button>
        </div>
      </div>
    </CustomModalMobile>
  );
}
