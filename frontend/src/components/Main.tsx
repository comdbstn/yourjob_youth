import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "./layout/Layout";
import "../../public/css/main.css";
import { axiosInstance } from "../api/axios";
import { getDdayString } from "../utils/dateUtils";
import { UserType, UserProfile } from "../types/user";
import { CompanyProfile } from "../types/company";
import { userApi } from "../api/user";
import { companyApi } from "../api/company";
import { JobPost } from "../types/jobPost";
import { Banner, BannerGroup, BannerStatus } from "../types/banner";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useAlert } from "../contexts/AlertContext";
import { fetchJobpostData, JobpostDataItem } from "../api/jobpostData";
import CompanyLogo from "./common/CompanyLogo";
import axios from "axios";

interface CommunityProps {
  id: number;
  idx: number;
  title: string;
  commentCount: number;
  likes: number;
}

interface BestJobProps {
  id: number;
  title: string;
  thumbnail: string;
}

interface DomesticJobProps {
  id: number;
  title: string;
  thumbnail: string;
  startDate: string;
  endDate: string;
}

interface OverseasJobProps {
  id: number;
  title: string;
  thumbnail: string;
  startDate: string;
  endDate: string;
}

interface VvipJobProps {
  id: number;
  title: string;
  companyName: string;
  address: string;
  thumbnail: string;
  startDate: string;
  endDate: string;
  wrkcndtnLctRgnStr: string;
}

interface VipJobProps {
  id: number;
  title: string;
  companyName: string;
  address: string;
  thumbnail: string;
  startDate: string;
  endDate: string;
  wrkcndtnLctRgnStr: string;
}

interface SpecialJobProps {
  id: number;
  title: string;
  companyName: string;
  address: string;
  startDate: string;
  endDate: string;
  wrkcndtnLctRgnStr: string;
}

const Main: React.FC = () => {
  const navigate = useNavigate();
  const [locationData, setLocationData] = useState<JobpostDataItem[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const domestic = await fetchJobpostData("00000012") || [];
        const overseas = await fetchJobpostData("00000013") || [];
        const combined = [...(Array.isArray(domestic) ? domestic : []), ...(Array.isArray(overseas) ? overseas : [])];
        setLocationData(combined);
      } catch (error) {
        console.error("Location data fetch failed:", error);
        setLocationData([]);
      }
    };
    fetchData();
  }, []);
  const mapCodesToLabels = (
    codes: string[] = [],
    list: JobpostDataItem[],
    // 어떤 필드를 레이블로 쓸지 선택 (기본은 level1)
    getLabel: (item: JobpostDataItem) => string = (item) => item.level1 ?? "",
  ): string[] => {
    return codes.map((code) => {
      const found = list.find((item) => item.operationDataId === code);
      return found ? getLabel(found) : code;
    });
  };

  const token = localStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");
  const userType = sessionStorage.getItem("userType") as UserType;
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    () => Boolean(token) || Boolean(userId),
  );
  const { customAlert } = useAlert();

  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>();
  const [communityTab, setCommunityTab] = useState("all");
  const [communityList, setCommunityList] = useState<CommunityProps[]>([]);
  const [bestJobList, setBestJobList] = useState<BestJobProps[]>([]);
  const [domesticJobList, setDomesticJobList] = useState<DomesticJobProps[]>(
    [],
  );
  const [overseasJobList, setOverseasJobList] = useState<OverseasJobProps[]>(
    [],
  );
  const [vvipJobList, setVvipJobList] = useState<VvipJobProps[]>([]);
  const [vipJobList, setVipJobList] = useState<VipJobProps[]>([]);
  const [specialJobList, setSpecialJobList] = useState<SpecialJobProps[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [jobStats, setJobStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mainBanners, setMainBanners] = useState<Banner[]>([]);
  const [subBanners, setSubBanners] = useState<Banner[]>([]);
  const [corpAdBanners, setCorpAdBanners] = useState<Banner[]>([]);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userType");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userType");
    navigate("/");
  };

  useEffect(() => {
    const fetchCommunityList = async () => {
      try {
        const response = await axiosInstance.get(
          "/api/v1/community/postsBest",
          {
            params: {
              country: communityTab,
              searchType: "title",
              query: "",
              page: 1,
              size: 8,
            },
          },
        );
        setCommunityList(
          response.data?.posts?.map((post: any) => ({
            id: post.id,
            idx: post.idx,
            title: post.title,
            commentCount: post.commentCount,
            likes: post.likes,
          })) || [],
        );
      } catch (error) {
        console.error("커뮤니티 목록 가져오기 실패:", error);
      }
    };

    fetchCommunityList();
  }, [communityTab]);

  useEffect(() => {
    const fetchJobStats = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/stats`);
        if (response.data.success) {
          setJobStats(response.data.data);
        }
      } catch (error) {
        console.error('통계 정보 가져오기 실패:', error);
      }
    };

    const fetchRecentJobs = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/jobs?limit=8`);
        if (response.data.success) {
          setRecentJobs(response.data.data);
        }
      } catch (error) {
        console.error('최신 공고 가져오기 실패:', error);
      }
    };

    const fetchBestJobList = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/jobs?limit=10`);
        
        if (response.data.success && response.data.data) {
          setBestJobList(
            response.data.data.map((job: any) => ({
              id: job.id,
              title: job.title,
              thumbnail: job.image_url || '/img/default-company.png',
            })) || []
          );
        }
      } catch (error) {
        console.error('인기 공고 목록 가져오기 실패:', error);
        setBestJobList([]);
      }
    };

    const fetchDomesticJobList = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/jobs?limit=4`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setDomesticJobList(
            result.data.map((job: any) => ({
              id: job.id,
              title: job.title,
              thumbnail: job.image_url || '/img/default-company.png',
              startDate: job.posting_date || new Date().toISOString(),
              endDate: job.deadline || '상시채용',
            })) || []
          );
        }
      } catch (error) {
        console.error('국내 공고 목록 가져오기 실패:', error);
        setDomesticJobList([]);
      }
    };

    const fetchOverseasJobList = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/jobs?limit=4`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setOverseasJobList(
            result.data.slice(0, 4).map((job: any) => ({
              id: job.id,
              title: job.title,
              thumbnail: job.image_url || '/img/default-company.png',
              startDate: job.posting_date || new Date().toISOString(),
              endDate: job.deadline || '상시채용',
            })) || []
          );
        }
      } catch (error) {
        console.error('해외 공고 목록 가져오기 실패:', error);
        setOverseasJobList([]);
      }
    };

    const fetchVvipJobList = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/jobs?limit=5`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setVvipJobList(
            result.data.slice(0, 5).map((job: any) => ({
              id: job.id,
              title: job.title,
              companyName: job.company,
              address: job.location,
              thumbnail: job.image_url || '/img/default-company.png',
              startDate: job.posting_date || new Date().toISOString(),
              endDate: job.deadline || '상시채용',
              wrkcndtnLctRgnStr: job.location,
            })) || []
          );
        }
      } catch (error) {
        console.error('VVIP 공고 목록 가져오기 실패:', error);
        setVvipJobList([]);
      }
    };

    const fetchVipJobList = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/jobs?limit=8`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setVipJobList(
            result.data.slice(0, 8).map((job: any) => ({
              id: job.id,
              title: job.title,
              companyName: job.company,
              address: job.location,
              thumbnail: job.image_url || '/img/default-company.png',
              startDate: job.posting_date || new Date().toISOString(),
              endDate: job.deadline || '상시채용',
              wrkcndtnLctRgnStr: job.location,
            })) || []
          );
        }
      } catch (error) {
        console.error('VIP 공고 목록 가져오기 실패:', error);
        setVipJobList([]);
      }
    };

    const fetchSpecialJobList = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/jobs?limit=6`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setSpecialJobList(
            result.data.slice(0, 6).map((job: any) => ({
              id: job.id,
              title: job.title,
              companyName: job.company,
              address: job.location,
              startDate: job.posting_date || new Date().toISOString(),
              endDate: job.deadline || '상시채용',
              wrkcndtnLctRgnStr: job.location,
            })) || []
          );
        }
      } catch (error) {
        console.error('SPECIAL 공고 목록 가져오기 실패:', error);
        setSpecialJobList([]);
      }
    };

    const fetchMainBanners = async (groupName: BannerGroup) => {
      try {
        const response = await axiosInstance.get("/api/v1/banners", {
          params: {
            groupName: groupName,
            status: BannerStatus.ACTIVE,
            currentDate: new Date().toISOString(),
          },
        });

        setMainBanners(response.data?.content || []);
        // setMainBanners(
        //   banners.filter(
        //     (banner: Banner) => banner.groupName === BannerGroup.MAIN_A,
        //   ),
        // );
        // setSubBanners(
        //   banners.filter(
        //     (banner: Banner) => banner.groupName === BannerGroup.SUB_A,
        //   ),
        // );
        // setCorpAdBanners(
        //   banners.filter(
        //     (banner: Banner) => banner.groupName === BannerGroup.CORP_AD,
        //   ),
        // );
      } catch (error) {
        console.error("배너 목록 가져오기 실패:", error);
      }
    };

    const fetchSubBanners = async (groupName: BannerGroup) => {
      try {
        const response = await axiosInstance.get("/api/v1/banners", {
          params: {
            groupName: groupName,
            status: BannerStatus.ACTIVE,
            currentDate: new Date().toISOString(),
          },
        });

        setSubBanners(response.data?.content || []);
      } catch (error) {
        console.error("서브 배너 목록 가져오기 실패:", error);
      }
    };

    const fetchCorpAdBanners = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/banners", {
          params: {
            groupName: BannerGroup.CORP_AD,
            status: BannerStatus.ACTIVE,
            currentDate: new Date().toISOString(),
          },
        });

        setCorpAdBanners(response.data?.content || []);
      } catch (error) {
        console.error("기업광고 배너 목록 가져오기 실패:", error);
      }
    };

    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchJobStats(),
        fetchRecentJobs(),
        fetchBestJobList(),
        fetchDomesticJobList(),
        fetchOverseasJobList(),
        fetchVvipJobList(),
        fetchVipJobList(),
        fetchSpecialJobList()
      ]);
      setLoading(false);
    };
    
    loadAllData();

    if (userType === UserType.COMPANY) {
      fetchMainBanners(BannerGroup.MAIN_B);
      fetchSubBanners(BannerGroup.SUB_B);
      fetchCorpAdBanners();
    } else {
      fetchMainBanners(BannerGroup.MAIN_A);
      fetchSubBanners(BannerGroup.SUB_A);
    }
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isLoggedIn) return;

      try {
        if (userType === UserType.JOB_SEEKER) {
          const profile = await userApi.getUserProfile();
          setUserProfile(profile);
        } else if (userType === UserType.COMPANY) {
          const profile = await companyApi.getCompanyProfile();
          setCompanyProfile(profile);
        }
      } catch (error) {
        setIsLoggedIn(false);
        console.error("프로필 정보 조회 실패:", error);
      }
    };

    fetchUserProfile();
  }, [isLoggedIn, userType]);

  const getDdayClass = (endDate: string) => {
    if (!endDate) return "gray";

    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 9) return "red";
    if (diffDays >= 31) return "date";
    return "gray";
  };
  useEffect(() => {
    if (!userId) {
      setIsLoggedIn(false);
    }
  }, [userId]);

  return (
    <Layout>
      <div
        className="container-center-horizontal"
        style={{ overflowX: "hidden" }}
      >
        <div
          className="main screen"
          style={{ width: "100%", maxWidth: "1280px", margin: "0 auto", overflowX: "hidden" }}
        >
          <div className="container">
            {/* Hero Section */}
            <div className="hero-section" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              padding: '3rem',
              marginBottom: '2rem',
              color: 'white',
              textAlign: 'center'
            }}>
              <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>🚀 국내 종합 채용 플랫폼</h1>
              <p style={{fontSize: '1.2rem', opacity: 0.9, marginBottom: '2rem'}}>실시간 크롤링으로 최신 채용정보를 가장 빠르게 만나보세요</p>
              
              {/* 실시간 통계 */}
              {jobStats && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '3rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '2rem', fontWeight: 'bold'}}>{jobStats.total_jobs}</div>
                    <div style={{opacity: 0.8}}>실시간 채용공고</div>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '2rem', fontWeight: 'bold'}}>{Object.keys(jobStats.categories).length}</div>
                    <div style={{opacity: 0.8}}>다양한 직군</div>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '2rem', fontWeight: 'bold'}}>{Object.keys(jobStats.locations).length}</div>
                    <div style={{opacity: 0.8}}>전국 지역</div>
                  </div>
                </div>
              )}
              
              {/* 검색 바 */}
              <div style={{
                background: 'white',
                borderRadius: '50px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                maxWidth: '600px',
                margin: '0 auto',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}>
                <input 
                  type="text" 
                  placeholder="회사명이나 직무를 검색해보세요"
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '1rem',
                    color: '#333',
                    padding: '0 1rem'
                  }}
                />
                <Link 
                  to="/jobs" 
                  style={{
                    background: '#667eea',
                    color: 'white',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '25px',
                    textDecoration: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  검색하기
                </Link>
              </div>
            </div>

            {/* 빠른 메뉴 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '3rem'
            }}>
              <Link to="/jobs" style={{
                background: 'white',
                borderRadius: '15px',
                padding: '1.5rem',
                textAlign: 'center',
                textDecoration: 'none',
                color: '#333',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>💼</div>
                <div style={{fontWeight: 'bold', marginBottom: '0.3rem'}}>채용공고</div>
                <div style={{fontSize: '0.9rem', color: '#666'}}>최신 채용정보 확인</div>
              </Link>
              
              <Link to="/community/bbslist" style={{
                background: 'white',
                borderRadius: '15px',
                padding: '1.5rem',
                textAlign: 'center',
                textDecoration: 'none',
                color: '#333',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>💬</div>
                <div style={{fontWeight: 'bold', marginBottom: '0.3rem'}}>커뮤니티</div>
                <div style={{fontSize: '0.9rem', color: '#666'}}>취업 정보 공유</div>
              </Link>
              
              <Link to="/accept/acceptlist" style={{
                background: 'white',
                borderRadius: '15px',
                padding: '1.5rem',
                textAlign: 'center',
                textDecoration: 'none',
                color: '#333',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>📝</div>
                <div style={{fontWeight: 'bold', marginBottom: '0.3rem'}}>합격자소서</div>
                <div style={{fontSize: '0.9rem', color: '#666'}}>합격 자소서 모음</div>
              </Link>
              
              {!isLoggedIn && (
                <Link to="/member/join" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🎯</div>
                  <div style={{fontWeight: 'bold', marginBottom: '0.3rem'}}>회원가입</div>
                  <div style={{fontSize: '0.9rem', opacity: 0.9}}>지금 시작하세요!</div>
                </Link>
              )}
            </div>

            {/* 메인 배너 슬라이더 */}
            <div className="flex-row topWrap mb30" style={{display: 'none'}}>
              <div className="swiper topSwiper">
                <div className="swiper-wrapper">
                  {mainBanners.length === 0 ? (
                    <div className="swiper-slide">
                      <div className="swiper-container SwiperBg">
                        <img src="/img/banner01.jpg" alt="기본 배너" />
                      </div>
                    </div>
                  ) : (
                    <Swiper
                      modules={[Navigation, Autoplay]}
                      spaceBetween={10}
                      navigation={{
                        nextEl: ".topSwiper-button-next",
                        prevEl: ".topSwiper-button-prev",
                      }}
                      autoplay={{ delay: 5000, disableOnInteraction: false }}
                      loop={true}
                    >
                      {mainBanners.map((banner) => (
                        <SwiperSlide key={`main-banner-${banner.id}`}>
                          <Link
                            to={banner.linkTarget}
                            target={banner.linkTargetType || "_self"}
                          >
                            <div className="swiper-container SwiperBg">
                              <img
                                src={banner.imageUrl}
                                alt={banner.title}
                                style={{ borderRadius: "15px" }}
                              />
                            </div>
                          </Link>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  )}
                </div>
                {mainBanners.length > 0 && (
                  <>
                    <div className="topSwiper-button-next swiper-button-next no-cursor"></div>
                    <div className="topSwiper-button-prev swiper-button-prev no-cursor"></div>
                  </>
                )}
              </div>

              {isLoggedIn ? (
                // 로그인 후 화면
                <div className="user_box">
                  <div className="flex-row mypageinfo">
                    <div className="flex-row info_container">
                      <div className="flex-row infoBox">
                        {userType === UserType.JOB_SEEKER ? (
                          <>
                            <div
                              className={`imgBox ${
                                userProfile?.profileImage ? "has-image" : ""
                              }`}
                            >
                              {userProfile?.profileImage ? (
                                <img
                                  style={{
                                    borderRadius: "50%",
                                    width: "56px",
                                    height: "56px",
                                  }}
                                  className="profileImg"
                                  src={userProfile.profileImage}
                                  alt=""
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.parentElement!.innerHTML = `
                                    <i className="fa-solid fa-user"></i>
                                  `;
                                  }}
                                />
                              ) : (
                                <div className="bgColorGray">
                                  <i className="fa-solid fa-user"></i>
                                </div>
                              )}
                              {/* <button
                                className="addBtn"
                                onClick={() =>
                                  document
                                    .getElementById("profileImageUpload")
                                    ?.click()
                                }
                              >
                                <img src="/img/Camera.png" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  id="profileImageUpload"
                                  style={{ display: "none" }}
                                  onChange={(e) => handleImageUpload(e)}
                                />
                              </button> */}
                            </div>
                          </>
                        ) : (
                          <>
                            <div
                              className={`imgBox ${
                                companyProfile?.logo_url ? "has-image" : ""
                              }`}
                            >
                              {companyProfile?.logo_url ? (
                                <CompanyLogo logoUrl={companyProfile.logo_url} className="profileImg" />
                              ) : (
                                <i className="fa-solid fa-building"></i>
                              )}
                              {/* <button
                                className="addBtn"
                                onClick={() =>
                                  document
                                    .getElementById("companyImageUpload")
                                    ?.click()
                                }
                              >
                                <img src="/img/Camera.png" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  id="companyImageUpload"
                                  style={{ display: "none" }}
                                  onChange={(e) => handleImageUpload(e)}
                                />
                              </button> */}
                            </div>
                          </>
                        )}
                        <div className="flex-row item_column corpBox item_start">
                          {/* 기업회원 로그인 후 노출 */}
                          {userType === UserType.COMPANY && (
                            <div className="corpuserBox">
                              {companyProfile?.companyInfo?.name ||
                                "(주)어플라이드 머티어리얼즈 코리아"}
                            </div>
                          )}
                          {/* 기업회원 로그인 후 노출 end */}
                          <div className="userBox">
                            {userType === UserType.JOB_SEEKER
                              ? !userProfile?.name
                                ? ""
                                : `${userProfile.name}님`
                              : !companyProfile?.representativeName
                              ? ""
                              : `${companyProfile.representativeName}님`}
                          </div>
                          <div className="userBox">
                            {userType === UserType.ADMIN && <>운영계정</>}
                          </div>
                        </div>
                      </div>
                      <button onClick={handleLogout}>로그아웃</button>
                    </div>
                    {/* 일반회원 로그인 후 노출 */}
                    {userType === UserType.JOB_SEEKER && (
                      <div className="CorpinfoBtn_box">
                        <Link to="/mypage" className="borderRite">
                          일반회원 홈
                        </Link>
                        <Link to="/mypage/resume" className="borderRite">
                          이력서 관리
                        </Link>
                        <Link to="/mypage/apply">지원 현황</Link>
                      </div>
                    )}
                    {/* 기업회원 로그인 후 노출 */}
                    {userType === UserType.COMPANY && (
                      <div className="CorpinfoBtn_box">
                        <Link to="/corpmem/mypage">기업관리자 홈</Link>
                      </div>
                    )}
                    {/* 기업회원 로그인 후 노출 end */}
                  </div>
                </div>
              ) : (
                // 로그인 전 화면 - 현대적 디자인
                <div style={{
                  background: 'white',
                  borderRadius: '15px',
                  padding: '2rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  minWidth: '300px'
                }}>
                  <h3 style={{textAlign: 'center', marginBottom: '1.5rem', color: '#2d3748'}}>지금 시작하세요!</h3>
                  
                  <div style={{marginBottom: '1rem'}}>
                    <Link to="/member/userlogin" style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      color: '#333',
                      transition: 'all 0.2s ease',
                      marginBottom: '0.8rem'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}>
                      <div style={{fontSize: '1.8rem', marginRight: '1rem'}}>👤</div>
                      <div>
                        <div style={{fontWeight: 'bold', marginBottom: '0.2rem'}}>일반회원 로그인</div>
                        <div style={{fontSize: '0.85rem', color: '#718096'}}>구직자를 위한 서비스</div>
                      </div>
                    </Link>
                    
                    <Link to="/member/userlogin?tab=corp" style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      color: '#333',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}>
                      <div style={{fontSize: '1.8rem', marginRight: '1rem'}}>🏢</div>
                      <div>
                        <div style={{fontWeight: 'bold', marginBottom: '0.2rem'}}>기업회원 로그인</div>
                        <div style={{fontSize: '0.85rem', color: '#718096'}}>채용담당자를 위한 서비스</div>
                      </div>
                    </Link>
                  </div>
                  
                  <div style={{textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #e2e8f0'}}>
                    <span style={{color: '#718096', fontSize: '0.9rem'}}>아직 회원이 아니신가요? </span>
                    <Link to="/member/join" style={{
                      color: '#667eea',
                      textDecoration: 'none',
                      fontWeight: 'bold'
                    }}>회원가입</Link>
                  </div>
                </div>
              )}
            </div>
            {/* slider login end */}

            {/* 서브 배너 슬라이더 */}
            <div className="flex-row fmWrap mb30">
              <div className="flex-row cardWrap">
                {/* 기본/구직자 화면 - 합격자소서, 대기업 멘토링 */}
                {(!userType ||
                  userType === UserType.JOB_SEEKER ||
                  userType === UserType.ADMIN) && (
                  <div className="flex-row fmlBox">
                    <div className="flex-row card">
                      <img
                        className="imgBox"
                        src="/img/-x35-17-x2c--curriculum-x2c--cv-x2c--job-x2c--portfolio@2x.png"
                        alt=""
                      />
                      <div className="flex-row txt">
                        <Link to="/accept/acceptlist">
                          <p className="title">
                            합격자소서{" "}
                            <i className="fa-solid fa-angle-right"></i>
                          </p>
                          <p>합격한 자소서와 함께라면 합격률 UP!</p>
                        </Link>
                      </div>
                    </div>
                    <div className="flex-row card pd1 gap1">
                      <img
                        className="imgBox"
                        src="/img/-x35-24-x2c--job-x2c--find-x2c--laptop-x2c--chat@2x.png"
                        alt=""
                      />
                      <div className="flex-row txt">
                        <Link to="/community/mentolist">
                          <p className="title">
                            대기업 멘토링{" "}
                            <i className="fa-solid fa-angle-right"></i>
                          </p>
                          <p>인사담당자가 답해주는 대기업 멘토링!</p>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                {/* 기본/구직자 화면 - 합격자소서, 대기업 멘토링 end */}

                {/* 기업사용자 화면 - 채용 상품 배너, 인재풀 열람 */}
                {userType === UserType.COMPANY && (
                  <div
                    className="flex-row fmlBox"
                    style={{ cursor: "pointer" }}
                  >
                    <div className="flex-row corpAdSwiper">
                      {corpAdBanners.length === 0 ? (
                        <div className="swiper-container SwiperBg">
                          <img
                            src="/img/banner03.png"
                            alt="기본 기업 광고 배너"
                            onClick={() => navigate("/corpmem/productAd")}
                          />
                        </div>
                      ) : (
                        <Swiper
                          modules={[Pagination, Autoplay]}
                          spaceBetween={10}
                          pagination={{ clickable: true }}
                          autoplay={{
                            delay: 5000,
                            disableOnInteraction: false,
                          }}
                          loop={true}
                        >
                          {corpAdBanners.map((banner) => (
                            <SwiperSlide key={`corp-ad-banner-${banner.id}`}>
                              <Link
                                to={banner.linkTarget}
                                target={banner.linkTargetType || "_self"}
                              >
                                <div className="swiper-container SwiperBg">
                                  <img
                                    src={banner.imageUrl}
                                    alt={banner.title}
                                  />
                                </div>
                              </Link>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      )}
                    </div>
                    <div
                      className="flex-row card"
                      style={{ padding: "40px 47px" }}
                    >
                      <img
                        className="imgBox"
                        src="/img/image-main-talent.png"
                        alt=""
                      />
                      <div className="flex-row txt">
                        <Link to="/corpmem/productInform">
                          <p className="title">
                            인재풀 열람
                            <i className="fa-solid fa-angle-right"></i>
                          </p>
                          <p>구직자 인재풀 열람, 포지션 제안 상품 안내</p>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                {/* 기업사용자 화면 - 채용 상품 배너, 인재풀 열람 end */}

                <div className="swiper fmrSwiper">
                  <div className="swiper-wrapper">
                    {subBanners.length === 0 ? (
                      <div className="swiper-slide">
                        <Link to="">
                          <div className="swiper-container SwiperBg">
                            <img src="/img/banner02.jpg" alt="기본 서브 배너" />
                          </div>
                        </Link>
                      </div>
                    ) : (
                      <Swiper
                        modules={[Pagination, Autoplay]}
                        spaceBetween={10}
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        loop={true}
                      >
                        {subBanners.map((banner) => (
                          <SwiperSlide key={`sub-banner-${banner.id}`}>
                            <Link
                              to={banner.linkTarget}
                              target={banner.linkTargetType || "_self"}
                            >
                              <div className="swiper-container SwiperBg">
                                <img src={banner.imageUrl} alt={banner.title} />
                              </div>
                            </Link>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    )}
                  </div>
                </div>
              </div>
              {/* cardWrap end*/}

              {/* 유어잡 BEST이야기 */}
              <div className="urbest">
                <div className="hearder">
                  <div className="best">
                    <span className="span">유어잡 </span>
                    <span className="span1">BEST</span>
                    <span className="span">이야기</span>
                  </div>
                </div>
                <ul className="best_tab">
                  <li className={`${communityTab === "all" ? "active" : ""}`}>
                    <button onClick={() => setCommunityTab("all")}>Best</button>
                  </li>
                </ul>
                <div className="best_box">
                  <ul>
                    {communityList.length === 0 ? (
                      <li>
                        <div className="num"></div>
                        <div className="subject ellipsis">
                          커뮤니티 게시물이 없습니다.
                        </div>
                        <div className="cnt"></div>
                      </li>
                    ) : (
                      communityList.map((post) => (
                        <li key={`commnuity-${post.id}`}>
                          <Link to={`/community/bbsview/${post.id}`}>
                            <div className="num">
                              {String(post.idx).padStart(2, "0")}
                            </div>
                            <div className="subject ellipsis">{post.title}</div>
                            <div className="cnt">({post.likes})</div>
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
              {/* 유어잡 BEST이야기 end */}
            </div>
            {/* fmWrap end */}
          </div>
          {/* container end */}

          {/* 최신 채용공고 섬션 */}
          <div style={{marginBottom: '3rem'}}>
            <h2 style={{fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#2d3748'}}>
              🔥 실시간 최신 채용공고
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {loading ? (
                Array.from({length: 4}).map((_, index) => (
                  <div key={index} style={{
                    background: '#f0f0f0',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    height: '200px',
                    animation: 'pulse 1.5s ease-in-out infinite alternate'
                  }}>
                    <div style={{background: '#ddd', height: '20px', borderRadius: '10px', marginBottom: '10px'}}></div>
                    <div style={{background: '#ddd', height: '15px', borderRadius: '8px', marginBottom: '10px', width: '70%'}}></div>
                    <div style={{background: '#ddd', height: '15px', borderRadius: '8px', width: '50%'}}></div>
                  </div>
                ))
              ) : recentJobs.length === 0 ? (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#666'
                }}>
                  채용공고를 불러오는 중입니다...
                </div>
              ) : (
                recentJobs.slice(0, 4).map((job) => (
                  <Link to={`/jobs`} key={job.id} style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    textDecoration: 'none',
                    color: '#333',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    border: '1px solid #e2e8f0'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                  }}>
                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '10px',
                        background: '#f7fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '1rem',
                        fontSize: '1.5rem'
                      }}>
                        {job.image_url && !job.image_url.includes('default') ? (
                          <img src={job.image_url} alt={job.company} style={{width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover'}} />
                        ) : (
                          '🏢'
                        )}
                      </div>
                      <div>
                        <div style={{fontWeight: 'bold', color: '#667eea', fontSize: '0.9rem'}}>{job.company}</div>
                        <div style={{fontSize: '0.8rem', color: '#718096'}}>{job.location}</div>
                      </div>
                    </div>
                    <h3 style={{fontWeight: 'bold', marginBottom: '0.8rem', lineHeight: '1.4'}}>{job.title}</h3>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem'}}>
                      <span style={{background: '#e6fffa', color: '#38b2ac', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem'}}>{job.employment_type || '정규직'}</span>
                      <span style={{background: '#fef5e7', color: '#d69e2e', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem'}}>{job.experience || '경력무관'}</span>
                    </div>
                    <div style={{fontSize: '0.85rem', color: '#4a5568'}}>{job.salary || '급여협의'}</div>
                  </Link>
                ))
              )}
            </div>
            <div style={{textAlign: 'center'}}>
              <Link to="/jobs" style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '25px',
                textDecoration: 'none',
                fontWeight: 'bold',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                모든 채용공고 보기 →
              </Link>
            </div>
          </div>

          <section className="main_section">
            <div className="container">
              {/* 금주의 인기광고 */}
              <style>{`
                @keyframes pulse {
                  0% { opacity: 1; }
                  100% { opacity: 0.4; }
                }
                
                .hero-section h1 {
                  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .quick-menu-card:hover {
                  transform: translateY(-5px);
                  box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
                }
                
                .job-card:hover {
                  transform: translateY(-3px);
                  box-shadow: 0 12px 35px rgba(0,0,0,0.15) !important;
                }
                
                @media (max-width: 768px) {
                  .hero-section {
                    padding: 2rem 1rem !important;
                  }
                  
                  .hero-section h1 {
                    font-size: 1.8rem !important;
                  }
                  
                  .hero-section .stats-grid {
                    flex-direction: column;
                    gap: 1rem !important;
                  }
                }
              `}</style>
              <div className="hitpublic">
                <h2>
                  금주의 인기공고
                  <div className="swiperbtn">
                    {bestJobList.length > 0 && (
                      <>
                        <div className="hitSwiper-button-prev swiper-button-prev no-cursor"></div>
                        <div className="hitSwiper-button-next swiper-button-next no-cursor"></div>
                      </>
                    )}
                  </div>
                </h2>

                <div className="swiper hitSwiper">
                  <div className="swiper-wrapper">
                    {/* swiper-slide loop */}
                    {bestJobList.length === 0 ? (
                      <div className="swiper-slide">
                        <div className="card">
                          <div className="txt ellipsis2">
                            인기 공고가 없습니다.
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Swiper
                        modules={[Navigation, Autoplay]}
                        spaceBetween={33}
                        slidesPerView={5}
                        navigation={{
                          nextEl: ".hitSwiper-button-next",
                          prevEl: ".hitSwiper-button-prev",
                        }}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        loop={true}
                      >
                        {bestJobList.map((job) => (
                          <SwiperSlide key={`best-${job.id}`}>
                            <div className="card">
                              <Link to={`/jobs`}>
                                <div className="imgBox">
                                  <CompanyLogo logoUrl={job.thumbnail} />
                                </div>
                                <div className="txt ellipsis2">{job.title}</div>
                              </Link>
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    )}
                    {/* swiper-slide loop end*/}
                  </div>
                </div>
              </div>
              {/* 금주의 인기광고 end */}

              {/* 국내채용, 글로벌채용 */}
              <div className="flex-row jobdev">
                {/* 국내채용 */}
                <div className="col2 card">
                  <h2 className="flex-row" onClick={() => navigate("/jobs")}>
                    국내채용
                    <img
                      className="jobimg"
                      src="/img/mask-group-2@2x.png"
                      alt=""
                    />
                  </h2>
                  <div className="flex-row card_body">
                    {/* loop */}
                    {domesticJobList.length === 0 ? (
                      <div className="card_item">
                        <div className="txt">
                          <p>국내 공고가 없습니다.</p>
                        </div>
                      </div>
                    ) : (
                      domesticJobList.map((job) => (
                        <div className="card_item" key={`domestic-${job.id}`}>
                          <Link to={`/jobs`}>
                            <div className="logoBox">
                              <CompanyLogo logoUrl={job.thumbnail} />
                            </div>
                            <div className="txt">
                              <p>{job.title}</p>
                              <div
                                className={`dday ${getDdayClass(job.endDate)}`}
                              >
                                {getDdayString(job.endDate)}
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))
                    )}
                    {/* loop end */}
                  </div>
                </div>
                {/* 국내채용 end */}

                {/* 해외채용 */}
                <div className="col2 card">
                  <h2 className="flex-row" onClick={() => navigate("/jobs")}>
                    글로벌채용
                    <img className="jobimg" src="/img/frame-140.svg" alt="" />
                  </h2>
                  <div className="flex-row card_body">
                    {/* loop */}
                    {overseasJobList.length === 0 ? (
                      <div className="card_item">
                        <div className="txt">
                          <p>글로벌 공고가 없습니다.</p>
                        </div>
                      </div>
                    ) : (
                      overseasJobList.map((job) => (
                        <div className="card_item" key={`overseas-${job.id}`}>
                          <Link to={`/jobs`}>
                            <div className="logoBox">
                              <CompanyLogo logoUrl={job.thumbnail} />
                            </div>
                            <div className="txt">
                              <p>{job.title}</p>
                              <div
                                className={`dday ${getDdayClass(job.endDate)}`}
                              >
                                {getDdayString(job.endDate)}
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))
                    )}
                    {/* loop end */}
                  </div>
                </div>
                {/* 글로벌채용 end */}
              </div>
              {/* 국내채용, 글로벌채용 end */}
            </div>
          </section>

          <div className="container">
            <div className="vip_container">
              {/* VVIP 채용관 */}
              <h2>VVIP 채용관</h2>
              <div className="top_group">
                {/* loop */}
                {vvipJobList.length === 0 ? (
                  <div className="txt">
                    <p>VVIP 채용관 공고가 없습니다.</p>
                  </div>
                ) : (
                  vvipJobList.map((job, index) => (
                    <Link to={`/jobs`} key={`vvip-${job.id}-${index}`}>
                      <div className="card line add-hover">
                        <div className="img_box">
                          <CompanyLogo logoUrl={job.thumbnail} className="comimg" />
                        </div>
                        <div className="jobInfo_flex">
                          <div className="infogroup">
                            <div className="name notosanscjkkr-medium-stack-14px">
                              {job.companyName}
                            </div>
                            <div className="txt notosanscjkkr-medium-mine-shaft-16px ellipsis2">
                              {job.title}
                            </div>
                          </div>
                          <div className="text-container">
                            <div className="region notosanscjkkr-medium-star-dust-13px ellipsis">
                              {mapCodesToLabels(
                                job.wrkcndtnLctRgnStr.split(","),
                                locationData,
                              ).join(", ")}
                            </div>
                            <div
                              className={`dday ${getDdayClass(job.endDate)}`}
                            >
                              {getDdayString(job.endDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
                {/* loop end */}
              </div>
              {/* VVIP 채용관 end */}

              {/* VVIP 채용관 */}
              <h2>VIP 채용관</h2>
              <div className="top_group">
                {/* loop */}
                {vipJobList.length === 0 ? (
                  <div className="txt">
                    <p>VIP 채용관 공고가 없습니다.</p>
                  </div>
                ) : (
                  vipJobList.map((job) => (
                    <Link to={`/jobs`} key={`vip-${job.id}`}>
                      <div className="card add-hover">
                        <div className="img_box">
                          <CompanyLogo logoUrl={job.thumbnail} className="comimg" />
                        </div>
                        <div className="jobInfo_flex">
                          <div className="infogroup">
                            <div className="name notosanscjkkr-medium-stack-14px">
                              {job.companyName}
                            </div>
                            <div className="txt notosanscjkkr-medium-mine-shaft-16px ellipsis2">
                              {job.title}
                            </div>
                          </div>
                          <div className="text-container">
                            <div className="region notosanscjkkr-medium-star-dust-13px ellipsis">
                              {mapCodesToLabels(
                                job.wrkcndtnLctRgnStr.split(","),
                                locationData,
                              ).join(", ")}
                            </div>
                            <div
                              className={`dday ${getDdayClass(job.endDate)}`}
                            >
                              {getDdayString(job.endDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
                {/* loop end */}
              </div>
              {/* VVIP 채용관 end */}
              {/* SPECIAL 채용관 */}
              <h2>SPECIAL 채용관</h2>
              <div className="top_group">
                {/* loop */}
                {specialJobList.length === 0 ? (
                  <div className="txt">
                    <p>SPECIAL 채용관 공고가 없습니다.</p>
                  </div>
                ) : (
                  specialJobList.map((job) => (
                    <Link to={`/jobs`} key={`special-${job.id}`}>
                      <div className="card speclal add-hover">
                        <div className="jobInfo_flex">
                          <div className="infogroup">
                            <div className="sname notosanscjkkr-medium-stack-14px">
                              {job.companyName}
                            </div>
                            <div className="txt notosanscjkkr-medium-mine-shaft-16px ellipsis2">
                              {job.title}
                            </div>
                          </div>
                          <div className="text-container">
                            <div className="region notosanscjkkr-medium-star-dust-13px ellipsis">
                              {mapCodesToLabels(
                                job.wrkcndtnLctRgnStr.split(","),
                                locationData,
                              ).join(", ")}
                            </div>
                            <div
                              className={`dday ${getDdayClass(job.endDate)}`}
                            >
                              {getDdayString(job.endDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
                {/* loop end */}
              </div>
              {/* SPECIAL 채용관 end */}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Main;
