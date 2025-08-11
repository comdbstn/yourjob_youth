import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserType } from "../../types/user";

const Header: React.FC = () => {
  const location = useLocation();
  const isMainPage = location.pathname === "/";
  const isJobsPage =
    location.pathname.startsWith("/jobs") ||
    location.pathname.startsWith("/jobpost");
  const isCommunityPage = location.pathname.startsWith("/community");
  const isAcceptPage = location.pathname.startsWith("/accept");

  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const keyword = isJobsPage ? searchParams.get("keyword") || "" : "";
  const [searchKeyword, setSearchKeyword] = useState(keyword);
  const token = localStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");
  const userType = sessionStorage.getItem("userType") as UserType;
  const isLoggedIn = token || userId;

  const API_URL =
    process.env.REACT_APP_API_BASE_URL || "http://13.125.187.22:8082";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const isOverseasPage = location.pathname.startsWith("/jobpost/joblistover");

    if (searchKeyword.trim()) {
      const searchPath = isOverseasPage ? "/jobpost/joblistover" : "/jobs";
      navigate(
        `${searchPath}?keyword=${encodeURIComponent(searchKeyword.trim())}`,
      );
    }
  };

  useEffect(() => {
    setSearchKeyword(keyword);
  }, [keyword]);

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      const response = await fetch(API_URL + "/api/v1/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userType");
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("userType");
        alert("로그아웃 되었습니다.");
        navigate("/member/userlogin");
      } else {
        alert("로그아웃 실패.");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header>
      <nav>
        <div className="nav-container">
          <div className="container flex-row items-center">
            <div className="logo">
              <Link to="/" className="title">
                <img src="/img/logo.png" alt="logo" />
              </Link>
              <div className="logo_txt">국내 종합 채용 플랫폼</div>
            </div>
            <form onSubmit={handleSearch} className="top_search">
              <div className="search_box">
                <input
                  type="search"
                  id="s_keyword"
                  name="s_keyword"
                  className="form-control search_form"
                  placeholder="유학생 채용정보를 검색해 보세요."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
              <button type="submit" className="top_search_btn">
                <img className="union" src="/img/union.svg" alt="Union" />
              </button>
            </form>
          </div>
        </div>
        <div className="menu-container">
          <div className="container flex-row items-center item_between">
            <ul className="menunavi">
              <li>
                <Link
                  to="/jobs"
                  className={`notosanscjkkr-bold-mine-shaft-18px ${
                    isJobsPage ? "active" : ""
                  }`}
                >
                  채용공고
                </Link>
              </li>
              <li>
                <Link
                  to="/community/bbslist"
                  className={`notosanscjkkr-bold-mine-shaft-18px ${
                    isCommunityPage ? "active" : ""
                  }`}
                >
                  커뮤니티
                </Link>
              </li>
              <li>
                <Link
                  to="/accept/acceptlist"
                  className={`notosanscjkkr-bold-mine-shaft-18px ${
                    isAcceptPage ? "active" : ""
                  }`}
                >
                  합격자소서
                </Link>
              </li>
            </ul>
            {isMainPage ? (
              <ul className="userNav">
                {!isLoggedIn && (
                  <>
                    <li>
                      <Link to="/member/join">회원가입</Link>
                    </li>
                  </>
                )}
              </ul>
            ) : (
              <ul className="userNav">
                {isLoggedIn ? (
                  userType === UserType.JOB_SEEKER ? (
                    <>
                      <li>
                        <Link to="/mypage">
                          <i className="fa-regular fa-user"></i>
                        </Link>
                      </li>
                      <li>
                        <button onClick={handleLogout} className="logOut">
                          로그아웃
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link to="/corpmem/productmypage">유료 이용내역</Link>
                      </li>
                      <li>
                        <Link to="/corpmem/mypage">
                          <i className="fa-regular fa-user"></i>
                        </Link>
                      </li>
                      <li>
                        <button onClick={handleLogout} className="logOut">
                          로그아웃
                        </button>
                      </li>
                    </>
                  )
                ) : (
                  <>
                    <li>
                      <Link to="/member/join">회원가입</Link>
                    </li>
                    <li>
                      <Link to="/member/userlogin">로그인</Link>
                    </li>
                  </>
                )}
              </ul>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
