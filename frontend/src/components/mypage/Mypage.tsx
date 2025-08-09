import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import "../../../public/css/mypage.css";
import { UserProfile } from "../../types/user";
import { userApi } from "../../api/user";
import { VisaStatusText } from "../../app/dummy/options";
import {
  fetchCodeData,
  fetchOperationCodeData,
  mapCodesToLabels,
  mapOperationCodesToLabels,
} from "../../services/mapCodesToLabels";
import { OperationData } from "../../types/operationData";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const [regions, setRegions] = useState<OperationData[]>([]);

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
      }
    };
    fetchOperationCodeData("00000002").then((res) => {
      setRegions(res.content);
    });
    fetchUserProfile();
  }, []);

  const handleProfileEdit = () => {
    navigate("/mypage/profile");
  };

  return (
    <Layout>
      <MetaTagHelmet title="홈" description="홈" />
      <div className="container-center-horizontal">
        <div className="mypage screen">
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
                  <div className="TitleBtn">
                    <button
                      type="button"
                      id="profileWrite"
                      onClick={handleProfileEdit}
                    >
                      프로필 수정
                    </button>
                  </div>
                </div>

                <div className="card">
                  <div className="card_head">기본정보</div>
                  <div className="card_body">
                    <dl>
                      <dt>이름</dt>
                      <dd>{userProfile.name || ""}</dd>
                    </dl>
                    <dl>
                      <dt>영문이름</dt>
                      <dd>{userProfile.englishName || ""}</dd>
                    </dl>
                    <dl>
                      <dt>생년월일</dt>
                      <dd>{userProfile.birth || ""}</dd>
                    </dl>
                    <dl>
                      <dt>성별</dt>
                      <dd>
                        {userProfile.gender === "M"
                          ? "남자"
                          : userProfile.gender === "F"
                          ? "여자"
                          : ""}
                      </dd>
                    </dl>
                    <dl>
                      <dt>국적</dt>
                      <dd>
                        {regions.length
                          ? mapOperationCodesToLabels(
                              [userProfile.nationality],
                              regions
                            ).join(", ")
                          : "-"}
                      </dd>
                    </dl>
                    {userProfile.nationality !== "02000031" && (
                      <dl>
                        <dt>비자여부</dt>
                        <dd>
                          {userProfile.visa?.length > 0
                            ? userProfile.visa
                                .map((visa) => VisaStatusText[visa])
                                .join(", ")
                            : "-"}
                        </dd>
                      </dl>
                    )}
                  </div>

                  <div className="card_head">연락처 정보</div>
                  <div className="card_body">
                    <dl>
                      <dt>이메일</dt>
                      <dd>{userProfile.email || ""}</dd>
                    </dl>
                    <dl>
                      <dt>전화번호</dt>
                      <dd>{userProfile.phone || ""}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyPage;
