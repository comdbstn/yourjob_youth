import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('keyword') || '';
  const [searchKeyword, setSearchKeyword] = useState(keyword);
  const token = localStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");

  const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://13.125.187.22:8082';

  const isHome = location.pathname.startsWith('/corpmem/mypage') || location.pathname.startsWith('/corpmem/corpmodify');
  const isJobPost = location.pathname.startsWith('/corpmem/jobpost');
  const isApplicant = location.pathname.startsWith('/corpmem/applicant') || location.pathname.startsWith('/corpmem/jobdetail');
  const isSearch = location.pathname.startsWith('/corpmem/search');
  const isTalent = location.pathname.startsWith('/corpmem/positionhuman') || location.pathname.startsWith('/corpmem/scraphuman') || location.pathname.startsWith('/corpmem/latesthuman');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/jobs?keyword=${encodeURIComponent(searchKeyword.trim())}`);
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
          "Authorization": `Bearer ${token}`,
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
              <Link to="/" className="title"><img src="/img/logo.png" alt="logo" /></Link>
              <div className="logo_txt">국내 종합 채용 플랫폼</div>
            </div>
            <form onSubmit={handleSearch} className="top_search">
              <div className="search_box">
                <input 
                  type="search" 
                  id="s_keyword" 
                  name="s_keyword" 
                  className="form-control search_form" 
                  placeholder="채용정보를 검색해 보세요."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
              <button type="submit" className="top_search_btn">
                <img className="union" src="/img/union.svg" alt="Union"/>
              </button>
            </form>
          </div>
        </div>
        <div className="menu-container">
          <div className="container flex-row items-center item_between">
            <ul className="menunavi">
              <li><Link to="/corpmem/mypage" className={`notosanscjkkr-bold-mine-shaft-18px ${isHome ? 'active' : ''}`}>홈</Link></li>
              <li><Link to="/corpmem/jobpost" className={`notosanscjkkr-bold-mine-shaft-18px ${isJobPost ? 'active' : ''}`}>공고등록</Link></li>
              <li><Link to="/corpmem/applicant" className={`notosanscjkkr-bold-mine-shaft-18px ${isApplicant ? 'active' : ''}`}>공고·지원자관리</Link></li>
              <li><Link to="/corpmem/search" className={`notosanscjkkr-bold-mine-shaft-18px ${isSearch ? 'active' : ''}`}>인재검색</Link></li>
              <li><Link to="/corpmem/positionhuman" className={`notosanscjkkr-bold-mine-shaft-18px ${isTalent ? 'active' : ''}`}>인재관리</Link></li>
            </ul>
            <ul className="userNav">
              {token || userId ? (
                <>
                  <li><Link to="/corpmem/productmypage">유료 이용내역</Link></li>
                  <li><Link to="/corpmem/mypage"><i className="fa-regular fa-user"></i></Link></li>
                  <li><button onClick={handleLogout} className="logOut">로그아웃</button></li>
                </>
              ) : (
                <>
                  <li><Link to="/member/corpjoin">회원가입</Link></li>
                  <li><Link to="/userlogin?tab=corp">로그인</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
