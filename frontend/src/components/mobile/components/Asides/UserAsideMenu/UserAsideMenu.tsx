import { Link, useLocation, useNavigate } from "react-router-dom";
import "./UserAsideMenu.css";
import { UserProfile, UserType } from "../../../../../types/user";
import { useEffect, useState } from "react";
import { CompanyProfile } from "../../../../../types/company";
import { companyApi } from "../../../../../api/company";
import { userApi } from "../../../../../api/user";

interface UserAsideMenuProps {
  onClose: () => void;
}

const UserAsideMenu: React.FC<UserAsideMenuProps> = (props) => {
  const userId = sessionStorage.getItem("userId");
  const userType = sessionStorage.getItem("userType") as UserType;
  const location = useLocation(); // 현재 URL 경로 가져오기
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
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>();
  const [userProfile, setUserProfile] = useState<UserProfile>();
  return (
    <aside className="UserAsideMenuContainer " style={{ zIndex: "9999" }}>
      <div className="headers">
        <div className="leftSide">
          <div className="leftcon">
            <img src="/img/mobile/Person.png" />
            <p>
              {userId ? (
                <strong>
                  {userId ? (
                    <b>
                      {`${userProfile?.name}`}
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
                      {`${userProfile?.name}`}
                      <span>님</span>
                    </b>
                  ) : (
                    "로그인해 주세요."
                  )}
                </Link>
              )}
            </p>
          </div>
          {userId && <button onClick={handleLogout}>로그아웃</button>}
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
              className={location.pathname === "/m/mypage" ? "selected" : ""}
              onClick={() => {
                navigate("/m/mypage");
              }}
            >
              홈
            </button>

            <button
              onClick={() => {
                navigate("/m/mypage/resume");
              }}
              className={
                location.pathname.includes("/m/mypage/resume") ? "selected" : ""
              }
            >
              이력서 관리
            </button>
            <button
              onClick={() => {
                navigate("/m/mypage/proposal");
              }}
              className={
                location.pathname.includes("/m/mypage/proposal")
                  ? "selected"
                  : ""
              }
            >
              받은 포지션 제안
            </button>
            <button
              onClick={() => {
                navigate("/m/mypage/apply");
              }}
              className={
                location.pathname.includes("/m/mypage/apply") ? "selected" : ""
              }
            >
              지원현황
            </button>
            <button
              onClick={() => {
                navigate("/m/mypage/scrap");
              }}
              className={
                location.pathname.includes("/m/mypage/scrap") ? "selected" : ""
              }
            >
              스크랩
            </button>
          </>
        )}
      </div>
    </aside>
  );
};

export default UserAsideMenu;
