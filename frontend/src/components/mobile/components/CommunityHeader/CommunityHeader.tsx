import { useEffect, useState } from "react";
import "./CommunityHeader.css";
import "../../common/styles/common.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UserAsideMenu from "../Asides/UserAsideMenu/UserAsideMenu";
import { UserType } from "../../../../types/user";
import CompanyAsideMenu from "../Asides/CompanyAsideMenu/CompanyAsideMenu";
import { companyApi } from "../../../../api/company";
import { userApi } from "../../../../api/user";

const MobileCommunityHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 세션에 저장된 userId, userType
  const userId = sessionStorage.getItem("userId");
  const userType = sessionStorage.getItem("userType") as UserType;

  // 검색어
  const searchParams = new URLSearchParams(location.search);
  const initialKeyword = searchParams.get("keyword") || "";
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);

  // 기업회원 여부
  const [isCompany, setIsCompany] = useState(false);
  useEffect(() => {
    setIsCompany(userType === UserType.COMPANY);
  }, [userType]);

  // 로그인 유무 플래그 (true = 아직 로그인 정보 확인 전 또는 비로그인 상태)
  const [isNotLoggedIn, setIsNotLoggedIn] = useState<boolean>(true);

  // 최초 렌더링 시 프로필 호출 → 성공하면 “로그인된 상태”로 전환
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (userType === UserType.JOB_SEEKER) {
          await userApi.getUserProfile();
        } else if (userType === UserType.COMPANY) {
          await companyApi.getCompanyProfile();
        }
        // 프로필 호출 성공 → 로그인 상태
        setIsNotLoggedIn(false);
      } catch (err) {
        // 호출 실패 → 여전히 로그인 전으로
        setIsNotLoggedIn(true);
      }
    };
    fetchUserProfile();
  }, [userType]);

  // 메뉴 열림 상태
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 검색 처리
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/m/jobPost?keyword=${encodeURIComponent(searchKeyword)}`);
    }
  };

  // URL 파라미터 바뀔 때마다 searchKeyword 동기화
  useEffect(() => {
    setSearchKeyword(initialKeyword);
  }, [initialKeyword]);
  const navigation = useNavigate();
  return (
    <>
      <div className="mobile-mainHeader-container">
        <section className="header pt-0 pb-0">
          {/* 상단 좌측 로고/타이틀 */}
          <div className="headerSection1 flexJb">
            <div
              className="flexGap10 flex items-center"
              style={{ alignItems: "center" }}
            >
              <Link to="/m">
                <div className="logoWrap">
                  <img src="/img/logo.png" />
                </div>
                {/* <img src="/img/logo.png" /> */}
              </Link>
              <h2 style={{ paddingTop: "8px", fontSize: "12px" }}>
                유학생 채용 플랫폼
              </h2>
            </div>

            {/* 우측 아이콘 영역 */}
            {isNotLoggedIn || !userId ? (
              // 아직 로그인 확인 전 또는 비로그인 상태
              <div className="flexGap20">
                <button
                  onClick={() =>
                    userId
                      ? navigate("/m/mypage")
                      : navigate("/m/member/userLogin")
                  }
                  title="로그인"
                  style={{ width: "21px" }}
                >
                  <img
                    className="icon"
                    src="/img/mobile/Person.png"
                    alt="로그인"
                  />
                </button>
              </div>
            ) : (
              // 로그인된 상태 → userType에 따라 버튼 분기
              <div className="flexGap20">
                {isCompany ? (
                  <button
                    onClick={() =>
                      userId
                        ? navigate("/m/company/home")
                        : navigate("/m/member/userLogin")
                    }
                    title="기업홈"
                    style={{ width: "21px" }}
                  >
                    <img
                      className="icon"
                      src="/img/mobile/Company.png"
                      alt="기업회원"
                    />
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      userId
                        ? navigate("/m/mypage")
                        : navigate("/m/member/userLogin")
                    }
                    title="내정보"
                    style={{ width: "21px" }}
                  >
                    <img
                      className="icon"
                      src="/img/mobile/Person.png"
                      alt="일반회원"
                    />
                  </button>
                )}
                <button
                  onClick={() => setIsMenuOpen((p) => !p)}
                  style={{ width: "24px" }}
                >
                  <img
                    className="icon"
                    src="/img/mobile/h_menu.png"
                    alt="메뉴"
                  />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      
      {isMenuOpen &&
        !isNotLoggedIn &&
        (isCompany ? (
          <CompanyAsideMenu onClose={() => setIsMenuOpen(false)} />
        ) : (
          <UserAsideMenu onClose={() => setIsMenuOpen(false)} />
        ))}
    </>
  );
};

export default MobileCommunityHeader;
