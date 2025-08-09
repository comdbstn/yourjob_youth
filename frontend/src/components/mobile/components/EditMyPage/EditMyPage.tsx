import MobileMainHeader from "../MainHeader/MainHeader";
import "./EditMyPage.css";
import "../../common/styles/common.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../../../api/user";
import { UpdateUserProfileRequest } from "../../../../types/user";
import PostModal from "../../../common/PostModal/PostModal";
import {
  visaOptions,
  VisaStatusText,
  VisaType,
} from "../../../../app/dummy/options";
import { OperationDataResponse } from "../../../../types/operationData";
import getOperationData from "../../../../api/operatuibData";
import { MetaTagHelmet } from "../../../common/MetaTagHelmet";

const MobileEditMyPage: React.FC = () => {
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

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");

  const [regionData, setRegionData] = useState<OperationDataResponse>();

  const fetchRegion = async () => {
    const response = await getOperationData("00000002");
    response.content.sort((a, b) => a.level2!.localeCompare(b.level2!, "ko"));
    setRegionData(response);
  };

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
    fetchRegion();
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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
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
      navigate("/m/mypage");
    } catch (error) {
      console.error("프로필 수정 실패:", error);
      alert("프로필 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleCancel = () => {
    navigate("/mypage");
  };

  return (
    <div className="mobileEditMyPageContainer">
      <MetaTagHelmet title="마이페이지" description="마이페이지" />
      <PostModal
        isOpen={isOpenPost}
        width="90%"
        onClose={() => setIsOpenPost(false)}
        onComplete={function (address: string, zoneCode: string): void {
          setFormData((prev) => ({
            ...prev,
            address: address,
            zip_code: zoneCode,
          }));
          setIsOpenPost(false);
        }}
      />
      <MobileMainHeader />
      <h2>홈</h2>
      <section className="contentSection">
        <div className="content">
          <h3>기본정보</h3>
          <div className="rows">
            <div className="row">
              <h4>이름</h4>
              <div className="input_default w-75">
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
            </div>
            <div className="row">
              <h4>영문 이름</h4>
              <div className="input_default w-75">
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
            </div>
            <div className="row">
              <h4>생년월일</h4>
              <div className="input_default w-75">
                <input
                  type="text"
                  id="birth"
                  name="birth"
                  className="input"
                  value={formData.birth}
                  onChange={handleInputChange}
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>
            <div className="row">
              <h4>국적</h4>
              <div className="t w-75">
                <select
                  name="nationality"
                  className="input nice-select"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  style={{
                    height: "60px",
                    borderRadius: "15px",
                    width: "100%",
                  }}
                >
                  <option value="">선택하세요</option>
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
            </div>
            <div className="row">
              <h4>성별</h4>
              <div className="t w-75">
                <select
                  name="gender"
                  className="input nice-select"
                  value={formData.gender}
                  onChange={handleInputChange}
                  style={{
                    height: "60px",
                    borderRadius: "15px",
                    width: "100%",
                  }}
                >
                  <option value="">선택하세요</option>
                  <option value="M">남</option>
                  <option value="F">여</option>
                </select>
              </div>
            </div>
            <div className="row">
              <h4>주소</h4>
              <div className="input_default w-75 flexJb">
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
            <div className="row">
              <h4>상세 주소</h4>
              <div className="input_default w-75 flexJb">
                <input
                  placeholder="상세주소를 입력해주세요."
                  value={formData.address_detail}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      address_detail: e.target.value,
                    }));
                  }}
                />
              </div>
            </div>
            <div className="row">
              <h4 style={{ alignSelf: "flex-start", paddingTop: "7px" }}>
                비자 여부
              </h4>
              <div className="checks w-75">
                <div className="checkContainer">
                  {visaOptions.map((option) => (
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
              </div>
            </div>
          </div>

          <h3 className="mt-35 mb-25">연락처 정보</h3>
          <div className="formBox w-full">
            <div className="row flexJb">
              <h4>이메일</h4>
              <div className="input_default w-75">
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
            </div>
            <div className="row flexJb">
              <h4>전화번호</h4>
              <div className="input_default w-75 mt-10">
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
        </div>
        <div className="BtnBox modify" style={{ textWrap: "nowrap" }}>
          <button
            type="button"
            className="submitBtn btn--ridius15"
            onClick={handleSubmit}
          >
            수정
          </button>
          <button
            type="button"
            className="cancelBtn btn--ridius15"
            onClick={() => {
              navigate("/m/mypage/");
            }}
          >
            취소
          </button>
        </div>
      </section>
      {/* <MainFooter /> */}
    </div>
  );
};

export default MobileEditMyPage;
