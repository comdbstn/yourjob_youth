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
  const isZighangJobsPage = location.pathname.startsWith("/zighang-jobs");

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
    <>
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
                    placeholder="채용공고를 검색해 보세요."
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
      
      <style>{`
        header {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .nav-container {
          border-bottom: 1px solid #e2e8f0;
        }
        
        .menu-container {
          background: #f8fafc;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        .flex-row {
          display: flex;
        }
        
        .items-center {
          align-items: center;
        }
        
        .item_between {
          justify-content: space-between;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .logo img {
          height: 40px;
        }
        
        .logo_txt {
          font-size: 0.9rem;
          color: #718096;
          font-weight: 500;
        }
        
        .top_search {
          flex: 1;
          max-width: 500px;
          margin: 0 2rem;
          display: flex;
          background: #f7fafc;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .search_box {
          flex: 1;
        }
        
        .search_form {
          width: 100%;
          padding: 0.75rem 1rem;
          border: none;
          background: transparent;
          outline: none;
          font-size: 1rem;
        }
        
        .top_search_btn {
          padding: 0.75rem;
          background: #667eea;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .top_search_btn .union {
          width: 20px;
          height: 20px;
          filter: brightness(0) invert(1);
        }
        
        .menunavi {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 2rem;
        }
        
        .menunavi a {
          text-decoration: none;
          color: #2d3748;
          font-weight: 600;
          padding: 1rem 0;
          transition: color 0.2s ease;
          position: relative;
        }
        
        .menunavi a:hover,
        .menunavi a.active {
          color: #667eea;
        }
        
        .menunavi a.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: #667eea;
        }
        
        .userNav {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 1rem;
          align-items: center;
        }
        
        .userNav a {
          text-decoration: none;
          color: #4a5568;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        
        .userNav a:hover {
          background: #f7fafc;
          color: #667eea;
        }
        
        .logOut {
          background: none;
          border: 1px solid #e2e8f0;
          color: #718096;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .logOut:hover {
          background: #f7fafc;
          border-color: #667eea;
          color: #667eea;
        }
        
        @media (max-width: 768px) {
          .top_search {
            margin: 0 1rem;
            max-width: 300px;
          }
          
          .logo_txt {
            display: none;
          }
          
          .menunavi {
            gap: 1rem;
          }
          
          .menunavi a {
            font-size: 0.9rem;
          }
          
          .userNav {
            gap: 0.5rem;
          }
          
          .userNav a {
            padding: 0.4rem 0.8rem;
            font-size: 0.9rem;
          }
        }
        
        @media (max-width: 640px) {
          .container {
            padding: 0 0.5rem;
          }
          
          .top_search {
            margin: 0 0.5rem;
            max-width: 200px;
          }
          
          .search_form {
            font-size: 0.9rem;
            padding: 0.6rem 0.8rem;
          }
          
          .logo img {
            height: 32px;
          }
          
          .menunavi {
            gap: 0.5rem;
          }
          
          .menunavi a {
            font-size: 0.8rem;
            padding: 0.8rem 0;
          }
          
          .userNav a {
            padding: 0.3rem 0.6rem;
            font-size: 0.8rem;
          }
          
          .logOut {
            padding: 0.3rem 0.6rem;
            font-size: 0.8rem;
          }
        }
        
        @media (max-width: 480px) {
          .top_search {
            display: none;
          }
          
          .logo {
            gap: 0.5rem;
          }
          
          .menunavi {
            gap: 0.3rem;
          }
          
          .menunavi a {
            font-size: 0.75rem;
          }
          
          .userNav {
            gap: 0.3rem;
          }
          
          .userNav a,
          .logOut {
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
