import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import "../../../public/css/mypage.css";
import "../../../public/css/nice-select.css";
import { UpdateUserProfileRequest } from "../../types/user";
import { userApi } from "../../api/user";
import PostModal from "../common/PostModal/PostModal";
import { visaOptions, VisaStatusText, VisaType } from "../../app/dummy/options";
import NiceSelectBox from "../common/NiceSelectBox";
import { OperationDataResponse } from "../../types/operationData";
import getOperationData from "../../api/operatuibData";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const genderOptions = [
  { value: "M", label: "남자" },
  { value: "F", label: "여자" },
];

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [isOpenPost, setIsOpenPost] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<UpdateUserProfileRequest>({
    name: "",
    englishName: "",
    birth: "",
    nationality: "02000031",
    visa: [],
    email: "",
    phone: "",
    address: "",
    address_detail: "",
    zip_code: "",
    gender: "M",
    profileImage: "",
  });
  const [previewImage, setPreviewImage] = useState<string>("");

  const handlePostComplete = (address: string, zoneCode: string) => {
    setFormData((prev) => ({
      ...prev,
      address: address,
      zip_code: zoneCode,
    }));
    setIsOpenPost(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    try {
      setIsUploading(true);
      const { profileImage } = await userApi.uploadProfileImage(file);
      setFormData((prev) => ({
        ...prev,
        profileImage,
      }));
      setPreviewImage(profileImage);
      alert("프로필 이미지가 성공적으로 변경되었습니다.");
    } catch (error) {
      console.error("프로필 이미지 업로드 실패:", error);
      alert("프로필 이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await userApi.getUserProfile();
        setFormData({
          ...data,
          visa: data.visa ? [...data.visa] : [],
          nationality: data.nationality || "02000031",
        });
      } catch (error) {
        console.error("사용자 프로필 조회 실패:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "birth") {
      const onlyDigits = value.replace(/\D/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: onlyDigits,
      }));
      return;
    }
    if (name === "phone") {
      const value = e.target.value.replace(/[^0-9]/g, "");
      let formattedValue = value;

      if (value.length <= 10) {
        formattedValue = value.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
      } else if (value.length === 11) {
        formattedValue = value.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
      } else {
        formattedValue = value.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
      }

      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVisaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      visa: checked
        ? [...prev.visa, value as VisaType]
        : prev.visa.filter((v) => v !== (value as VisaType)),
    }));
  };

  const handleSelectChange = (value: string | null, fieldName?: string) => {
    if (value) {
      setFormData((prev) => ({
        ...prev,
        [fieldName || "nationality"]: value,
      }));
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (birthError) {
      alert("생년월일 형식을 확인해주세요.");
      return;
    }
    if (formData.email && !validateEmail(formData.email)) {
      alert("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    try {
      await userApi.updateUserProfile({
        ...formData,
        profileImage: formData.profileImage,
      });

      alert("프로필 정보가 성공적으로 수정되었습니다.");
      navigate("/mypage");
    } catch (error) {
      console.error("프로필 수정 실패:", error);
      alert("프로필 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleCancel = () => {
    navigate("/mypage");
  };
  const [regionData, setRegionData] = useState<OperationDataResponse>();

  const fetchRegion = async () => {
    const response = await getOperationData("00000002");
    response.content.sort((a, b) => a.level2!.localeCompare(b.level2!, "ko"));
    setRegionData(response);
  };

  useEffect(() => {
    fetchRegion();
  }, []);

  const [birthError, setBirthError] = useState<string>("");
  useEffect(() => {
    const { birth } = formData;
    if (!birth) {
      setBirthError("");
      return;
    }
    // 숫자만 8자리인지 확인
    const birthRegex = /^\d{8}$/;
    if (!birthRegex.test(birth)) {
      setBirthError(
        "생년월일은 YYYYMMDD 형식(예: 19901010)으로 입력해야 합니다."
      );
      return;
    }
    // 유효한 날짜인지 확인
    const year = parseInt(birth.substring(0, 4), 10);
    const month = parseInt(birth.substring(4, 6), 10);
    const day = parseInt(birth.substring(6, 8), 10);
    const dateObj = new Date(year, month - 1, day);
    if (
      dateObj.getFullYear() !== year ||
      dateObj.getMonth() + 1 !== month ||
      dateObj.getDate() !== day
    ) {
      setBirthError("유효한 날짜가 아닙니다.");
      return;
    }
    // 미래 날짜인지 확인
    const today = new Date();
    if (dateObj > today) {
      setBirthError("미래의 생년월일은 입력할 수 없습니다.");
      return;
    }
    // 모든 검증 통과 시 에러 메시지 해제
    setBirthError("");
  }, [formData.birth]);

  return (
    <Layout>
      <MetaTagHelmet title="프로필" description="프로필" />
      <div className="container-center-horizontal">
        <div className="mypage-profile mypage screen">
          <div className="container">
            <div className="flex-con">
              <div className="sidebar item_start">
                <ul className="snb-list mb2">
                  <li>
                    <Link to="/mypage" className="menu_font01 active">
                      홈
                    </Link>
                  </li>
                  <li>
                    <Link to="/mypage/resume" className="menu_font01">
                      이력서 관리
                    </Link>
                  </li>
                  <li>
                    <Link to="/mypage/proposal" className="menu_font01">
                      받은 포지션 제안
                    </Link>
                  </li>
                  <li>
                    <Link to="/mypage/apply" className="menu_font01">
                      지원현황
                    </Link>
                  </li>
                  <li>
                    <Link to="/mypage/scrap" className="menu_font01">
                      스크랩
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="flex-col">
                <div className="pageTitle">
                  <div className="conTitle">
                    <div className="headTitle">홈</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card_head">기본정보</div>
                  <div className="formBox">
                    <div className="fildSet">
                      <label className="label">프로필 이미지</label>
                      <div
                        className="flex-row"
                        style={{ width: "100%", alignItems: "center" }}
                      >
                        <div className="imgBox">
                          <label
                            htmlFor="profile-upload"
                            className="upload-label"
                          >
                            {isUploading ? (
                              <div className="loading-spinner">
                                업로드 중...
                              </div>
                            ) : previewImage || formData.profileImage ? (
                              <img
                                src={previewImage || formData.profileImage}
                                alt=""
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/img/f_logo.png";
                                }}
                              />
                            ) : (
                              <i className="fa-solid fa-user"></i>
                            )}
                          </label>
                          <input
                            id="profile-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: "none" }}
                          />
                          {!formData.profileImage && (
                            <div className="photo">
                              <i className="fa-solid fa-camera"></i>
                            </div>
                          )}
                        </div>
                        <div className="upload-btn-container">
                          <button
                            type="button"
                            className="upload-btn"
                            onClick={() =>
                              document.getElementById("profile-upload")?.click()
                            }
                          >
                            사진변경
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="fildSet">
                      <label htmlFor="name" className="label">
                        이름
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="input"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="이름"
                      />
                    </div>
                    <div className="fildSet">
                      <label htmlFor="englishName" className="label">
                        영문이름
                      </label>
                      <input
                        type="text"
                        id="englishName"
                        name="englishName"
                        className="input"
                        value={formData.englishName}
                        onChange={handleInputChange}
                        placeholder="영문이름"
                      />
                    </div>
                    <div className="fildSet">
                      <label htmlFor="birth" className="label">
                        생년월일
                      </label>
                      <input
                        type="text"
                        id="birth"
                        name="birth"
                        className="input"
                        value={formData.birth}
                        onChange={handleInputChange}
                        placeholder="YYYYMMDD"
                        maxLength={8}
                      />
                    </div>
                    {birthError && (
                      <div
                        style={{
                          color: "#FF4D4F",
                          marginTop: "4px",
                          marginBottom: "4px",
                          fontSize: "0.9rem",
                          marginLeft: "110px",
                        }}
                      >
                        {birthError}
                      </div>
                    )}
                    <div className="fildSet" style={{ padding: 0 }}>
                      <label htmlFor="nationality" className="label">
                        국적
                      </label>
                      {/* <NiceSelectBox
                        value={formData.nationality}
                        options={nationalityOptions}
                        onChange={(value) =>
                          handleSelectChange(value, "nationality")
                        }
                        placeholder="선택하세요"
                      /> */}
                      <div
                        className="input_default"
                        style={{ maxWidth: "450px" }}
                      >
                        <select
                          name="nationality"
                          onChange={handleInputChange}
                          value={formData.nationality}
                          className=""
                          style={{ width: "100%" }}
                        >
                          <option value="">국적을 선택해주세요.</option>
                          {regionData && (
                            <>
                              {regionData.content.map((i, idx) => (
                                <option
                                  key={i.operationDataId}
                                  value={i.operationDataId}
                                >
                                  {i.level2}
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                      </div>
                      {/* <select
                        name="nationality"
                        className="input nice-select"
                        value={formData.nationality}
                        onChange={handleInputChange}
                      >
                        <option value="">선택하세요</option>
                        <option value="대한민국">대한민국</option>
                        <option value="일본">일본</option>
                        <option value="중국">중국</option>
                        <option value="캐나다">캐나다</option>
                        <option value="나이지리아">나이지리아</option>
                        <option value="아프리카">아프리카</option>
                        <option value="태국">태국</option>
                      </select> */}
                    </div>
                    <div className="fildSet">
                      <label className="label">성별</label>
                      <NiceSelectBox
                        value={formData.gender}
                        options={genderOptions}
                        placeholder="선택하세요"
                        onChange={(value) =>
                          handleSelectChange(value, "gender")
                        }
                      />
                      {/* <select
                        name="gender"
                        className="input nice-select"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="">선택하세요</option>
                        <option value="F">여자</option>
                        <option value="M">남자</option>
                      </select> */}
                    </div>
                    <div className="fildSet">
                      <label className="label">주소</label>
                      <div
                        className="input input_default flexJb"
                        style={{ width: "450px" }}
                      >
                        <p>{formData.address}</p>
                        <button
                          onClick={() => {
                            setIsOpenPost(true);
                          }}
                          style={{ textWrap: "nowrap" }}
                        >
                          찾기
                        </button>
                      </div>
                    </div>
                    <div className="fildSet">
                      <label className="label"></label>
                      <input
                        type="text"
                        id="address_detail"
                        name="address_detail"
                        className="input"
                        value={formData.address_detail}
                        onChange={handleInputChange}
                        placeholder="주소 상세"
                      />
                    </div>
                    {formData.nationality !== "02000031" && (
                      <div className="fildSet">
                        <label className="label">비자여부</label>
                        <div className="chkBox">
                          {Array.from({
                            length: Math.ceil(visaOptions.length / 5),
                          }).map((_, rowIndex) => (
                            <div
                              key={rowIndex}
                              className="flex-row items-center"
                            >
                              {visaOptions
                                .slice(rowIndex * 5, (rowIndex + 1) * 5)
                                .map((option) => (
                                  <div className="chkInput" key={option.id}>
                                    <input
                                      id={option.id.toString()}
                                      type="checkbox"
                                      name="visa"
                                      value={option.value as VisaType}
                                      checked={formData.visa.includes(
                                        option.value as VisaType
                                      )}
                                      onChange={handleVisaChange}
                                    />
                                    <label htmlFor={option.id.toString()}>
                                      {VisaStatusText[option.value as VisaType]}
                                    </label>
                                  </div>
                                ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="card_head">연락처 정보</div>
                  <div className="formBox">
                    <div className="fildSet">
                      <label htmlFor="email" className="label">
                        이메일
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="input"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="이메일"
                      />
                    </div>
                    <div className="fildSet">
                      <label htmlFor="phone" className="label">
                        전화번호
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="input"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="010-0000-0000"
                        maxLength={14}
                      />
                    </div>
                  </div>
                </div>
                <div className="BtnBox">
                  <button
                    type="button"
                    className="submitBtn"
                    onClick={handleSubmit}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    className="cancelBtn"
                    onClick={handleCancel}
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
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
    </Layout>
  );
};

export default Profile;
