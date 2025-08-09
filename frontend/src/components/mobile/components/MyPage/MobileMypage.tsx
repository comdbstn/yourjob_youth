import { useNavigate } from "react-router-dom";
import MainFooter from "../MainFooter/MainFooter";
import MobileMainHeader from "../MainHeader/MainHeader";
import "./MobileMypage.css";

import { useState, useEffect } from "react";
import { userApi } from "../../../../api/user";
import { UserProfile } from "../../../../types/user";
import { VisaStatusText } from "../../../../app/dummy/options";
import { MetaTagHelmet } from "../../../common/MetaTagHelmet";

const MobileMypage = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    englishName: "",
    birth: "",
    nationality: "",
    visa: [],
    email: "",
    phone: "",
    gender: "M",
    address: "",
    address_detail: "",
    zip_code: "",
    profileImage: "",
  });
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await userApi.getUserProfile();
        if (response) {
          setUserProfile(response);
        }
      } catch (error) {
        console.error("사용자 프로필 조회 실패:", error);
        navigate("/m/member/userLogin");
      }
    };

    fetchUserProfile();
  }, []);
  return (
    <div className="mobileMyPageContainer">
      <MetaTagHelmet title="마이페이지" description="마이페이지" />
      <MobileMainHeader />
      <h2>홈</h2>
      <div className="px-20 w-full">
        <button
          className="blueBtn medium"
          onClick={() => {
            navigate("/m/mypage/editMyPage");
          }}
        >
          프로필 수정
        </button>
      </div>

      <section className="contentSection">
        <div className="content">
          <h3>기본정보</h3>
          <div className="rows">
            <div className="row">
              <h4>이름</h4>
              <p>{userProfile.name || "홍길동"}</p>
            </div>
            <div className="row">
              <h4>생년월일</h4>
              <p>{userProfile.birth || "1998-05-05"}</p>
            </div>
            <div className="row">
              <h4>국적</h4>
              <p>{userProfile.nationality || "-"}</p>
            </div>
            <div className="row">
              <h4>비자여부</h4>
              <p style={{ lineHeight: "150%" }}>
                {" "}
                {userProfile.visa?.length > 0
                  ? userProfile.visa
                      .map((visa) => VisaStatusText[visa])
                      .join(", ")
                  : "-"}
              </p>
            </div>
            <div className="row">
              <h4>주소</h4>
              <p style={{ lineHeight: "150%" }}>{userProfile.address || "-"}</p>
            </div>
            <div className="row">
              <h4>상세주소</h4>
              <p>{userProfile.address_detail || "-"}</p>
            </div>
          </div>
          <h3 className="mt-50">연락처 정보</h3>
          <div className="rows">
            <div className="row">
              <h4>이메일</h4>
              <p>{userProfile.email || "abcd@gmail.com"}</p>
            </div>
            <div className="row">
              <h4>전화번호</h4>
              <p>{userProfile.phone || "010-1234-5678"}</p>
            </div>
          </div>
        </div>
      </section>
      <MainFooter />
    </div>
  );
};
export default MobileMypage;
