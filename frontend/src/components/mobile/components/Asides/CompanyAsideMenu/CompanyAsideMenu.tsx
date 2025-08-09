import { Link, useLocation, useNavigate } from "react-router-dom";
import "./CompanyAsideMenu.css";
import { UserProfile, UserType } from "../../../../../types/user";
import { useState, useEffect } from "react";
import { companyApi } from "../../../../../api/company";
import { userApi } from "../../../../../api/user";
import { CompanyProfile } from "../../../../../types/company";

interface CompanyAsideMenuProps {
  onClose: () => void;
}

const CompanyAsideMenu: React.FC<CompanyAsideMenuProps> = (props) => {
  const userId = sessionStorage.getItem("userId");
  const userType = sessionStorage.getItem("userType") as UserType;
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>();
  const [userProfile, setUserProfile] = useState<UserProfile>();
  const location = useLocation(); // 현재 URL 경로 가져오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (userType === UserType.JOB_SEEKER) {
          const profile = await userApi.getUserProfile();
          setUserProfile(profile);
        } else if (userType === UserType.COMPANY) {
          const profile = await companyApi.getCompanyProfile();
          setCompanyProfile(profile);
        }
      } catch (error) {
        // setIsLoggedIn(false);
        console.error("프로필 정보 조회 실패:", error);
      }
    };

    fetchUserProfile();
  }, [userType]);
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userType");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userType");

    navigate("/m");
    props.onClose();
  };
  return (
    <aside className="CompanyAsideMenuContainer">
      <div className="headers">
        <div className="leftSide">
          <div className="leftcon">
            <img src="/img/mobile/Company.png" />
            <p>
              {userId ? (
                <strong>
                  {userId ? (
                    <b>
                      {`${companyProfile?.companyName}`}
                      <span>님</span>
                    </b>
                  ) : (
                    "로그인해 주세요."
                  )}
                </strong>
              ) : (
                <Link to={"/m/member/userLogin"}>
                  {userId ? (
                    <b>
                      {`${userId}`}
                      <span>님</span>
                    </b>
                  ) : (
                    "로그인해 주세요."
                  )}
                </Link>
              )}
            </p>

            {/* {userId ? (
              <strong>
                {userId ? `${companyProfile?.companyName}님` : "로그인해 주세요."}
              </strong>
            ) : (
              <Link to={"/m/member/userLogin"}>
                {userId ? `${userId}님` : "로그인해 주세요."}
              </Link>
            )} */}
          </div>
          {userId && (
            <button onClick={handleLogout} className="logout">
              로그아웃
            </button>
          )}
        </div>
        {/* props.onClose 호출 */}
        <button onClick={props.onClose}>
          <img src="/img/mobile/XIcon.png" alt="닫기" />
        </button>
      </div>
      <div className="buttons">
        {userId && (
          <>
            <button
              className={
                location.pathname === "/m/company/home" ? "selected" : ""
              }
              onClick={() => {
                navigate("/m/company/home");
              }}
            >
              홈
            </button>

            <button
              onClick={() => {
                navigate("/m/company/writeRecruit");
              }}
              className={
                location.pathname.includes("/m/company/writeRecruit")
                  ? "selected"
                  : ""
              }
            >
              공고등록
            </button>
            <button
              onClick={() => {
                navigate("/m/company/managePost");
              }}
              className={
                location.pathname.includes("/m/company/managePost")
                  ? "selected"
                  : ""
              }
            >
              공고·지원자관리
            </button>
            <button
              onClick={() => {
                navigate("/m/company/searchTalent");
              }}
              className={
                location.pathname.includes("/m/company/searchTalent")
                  ? "selected"
                  : ""
              }
            >
              인재검색
            </button>
            <button
              onClick={() => {
                navigate("/m/company/manageTalent");
              }}
              className={
                location.pathname.includes("/m/company/manageTalent")
                  ? "selected"
                  : ""
              }
            >
              인재관리
            </button>
            <button
              onClick={() => {
                navigate("/m/company/productPage");
              }}
              className={
                location.pathname.includes("/m/company/productPage")
                  ? "selected"
                  : ""
              }
            >
              유료 이용내역
            </button>
          </>
        )}
      </div>
    </aside>
  );
};

export default CompanyAsideMenu;
