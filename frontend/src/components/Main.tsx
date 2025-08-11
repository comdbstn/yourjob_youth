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
    const fetchBestJobList = async () => {
      try {
        // TODO: 인기공고 조건 필요
        const response = await axiosInstance.get("/api/v1/jobs", {
          params: {
            page: 1,
            size: 10,
            searchType: "title",
            query: "",
            country: "all",
            location: "all",
            jobType: "all",
          },
        });
        setBestJobList(
          response.data?.map((job: JobPost) => ({
            id: job.id,
            title: job.title,
            thumbnail: job.logo_url,
          })) || [],
        );
      } catch (error) {
        console.error("인기 공고 목록 가져오기 실패:", error);
      }
    };

    const fetchDomesticJobList = async () => {
      try {
        // TODO: 국내 공고 조건 필요
        const response = await axiosInstance.get("/api/v1/jobs", {
          params: {
            page: 1,
            size: 4,
            searchType: "title",
            query: "",
            country: "국내",
            location: "all",
            jobType: "all",
          },
        });
        setDomesticJobList(
          response.data?.content?.map((job: JobPost) => ({
            id: job.id,
            title: job.title,
            thumbnail: job.logo_url,
            startDate: job.startDate,
            endDate: job.endDate,
          })) || [],
        );
      } catch (error) {
        console.error("국내 공고 목록 가져오기 실패:", error);
      }
    };

    const fetchOverseasJobList = async () => {
      try {
        // TODO: 해외 공고 조건 필요
        const response = await axiosInstance.get("/api/v1/jobs", {
          params: {
            page: 1,
            size: 4,
            searchType: "title",
            query: "",
            country: "해외",
            location: "all",
            jobType: "all",
          },
        });
        setOverseasJobList(
          response.data?.content?.map((job: JobPost) => ({
            id: job.id,
            title: job.title,
            thumbnail: job.logo_url,
            startDate: job.startDate,
            endDate: job.endDate,
          })) || [],
        );
      } catch (error) {
        console.error("해외 공고 목록 가져오기 실패:", error);
      }
    };

    const fetchVvipJobList = async () => {
      try {
        // TODO: VVIP 공고 조건 필요
        const response = await axiosInstance.get("/api/v1/jobs", {
          params: {
            page: 1,
            size: 20,
            searchType: "vvip",
            query: "",
            country: "all",
            location: "all",
            jobType: "all",
          },
        });
        setVvipJobList(
          response.data?.content?.map((job: JobPost) => ({
            id: job.id,
            title: job.title,
            companyName: job.companyName,
            address: job.address,
            thumbnail: job.logo_url,
            startDate: job.startDate,
            endDate: job.endDate,
            wrkcndtnLctRgnStr: job.wrkcndtnLctRgnStr,
          })) || [],
        );
      } catch (error) {
        console.error("VVIP 공고 목록 가져오기 실패:", error);
      }
    };

    const fetchVipJobList = async () => {
      try {
        // TODO: VIP 공고 조건 필요
        const response = await axiosInstance.get("/api/v1/jobs", {
          params: {
            page: 1,
            size: 40,
            searchType: "vip",
            query: "",
            country: "all",
            location: "all",
            jobType: "all",
          },
        });
        setVipJobList(
          response.data?.content?.map((job: JobPost) => ({
            id: job.id,
            title: job.title,
            companyName: job.companyName,
            address: job.address,
            thumbnail: job.logo_url,
            startDate: job.startDate,
            endDate: job.endDate,
            wrkcndtnLctRgnStr: job.wrkcndtnLctRgnStr,
          })) || [],
        );
      } catch (error) {
        console.error("VIP 공고 목록 가져오기 실패:", error);
      }
    };

    const fetchSpecialJobList = async () => {
      try {
        // TODO: SPECIAL 공고 조건 필요
        const response = await axiosInstance.get("/api/v1/jobs", {
          params: {
            page: 1,
            size: 50,
            searchType: "special",
            query: "",
            country: "all",
            location: "all",
            jobType: "all",
          },
        });
        setSpecialJobList(
          response.data?.content?.map((job: JobPost) => ({
            id: job.id,
            title: job.title,
            companyName: job.companyName,
            address: job.address,
            startDate: job.startDate,
            endDate: job.endDate,
            wrkcndtnLctRgnStr: job.wrkcndtnLctRgnStr,
          })) || [],
        );
      } catch (error) {
        console.error("SPECIAL 공고 목록 가져오기 실패:", error);
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

    fetchBestJobList();
    fetchDomesticJobList();
    fetchOverseasJobList();
    fetchVvipJobList();
    fetchVipJobList();
    fetchSpecialJobList();

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
          style={{ minWidth: "1280px", overflowX: "hidden" }}
        >
          <div className="container">
            {/* 메인 배너 슬라이더 */}
            <div className="flex-row topWrap mb30">
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
                // 로그인 전 화면
                <div className="user_box">
                  <div className="flex-row card">
                    <img
                      className="icon"
                      src="/img/group-2230@2x.png"
                      alt="일반회원"
                    />
                    <div className="txt">일반회원</div>
                    <Link to="member/userlogin">로그인</Link>
                  </div>
                  <div className="line"></div>
                  <div className="flex-row card">
                    <img
                      className="icon"
                      src="/img/crop_icon.png"
                      alt="기업회원"
                    />
                    <div className="txt">기업회원</div>
                    <Link to="/member/userlogin?tab=corp">로그인</Link>
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
                          <p>유학생 인재풀 열람, 포지션 제안 상품 안내</p>
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
                  <li
                    className={`${communityTab === "america" ? "active" : ""}`}
                  >
                    <button onClick={() => setCommunityTab("america")}>
                      미주
                    </button>
                  </li>
                  <li
                    className={`${communityTab === "europe" ? "active" : ""}`}
                  >
                    <button onClick={() => setCommunityTab("europe")}>
                      유럽
                    </button>
                  </li>
                  <li className={`${communityTab === "asia" ? "active" : ""}`}>
                    <button onClick={() => setCommunityTab("asia")}>
                      아시아
                    </button>
                  </li>
                  <li
                    className={`${communityTab === "oceania" ? "active" : ""}`}
                  >
                    <button onClick={() => setCommunityTab("oceania")}>
                      오세아니아
                    </button>
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

          <section className="main_section">
            <div className="container">
              {/* 금주의 인기광고 */}
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
                              <Link to={`jobs/${job.id}`}>
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

              {/* 국내채용, 해외채용 */}
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
                          <Link to={`jobs/${job.id}`}>
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
                    해외채용
                    <img className="jobimg" src="/img/frame-140.svg" alt="" />
                  </h2>
                  <div className="flex-row card_body">
                    {/* loop */}
                    {overseasJobList.length === 0 ? (
                      <div className="card_item">
                        <div className="txt">
                          <p>해외 공고가 없습니다.</p>
                        </div>
                      </div>
                    ) : (
                      overseasJobList.map((job) => (
                        <div className="card_item" key={`overseas-${job.id}`}>
                          <Link to={`jobs/${job.id}`}>
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
                {/* 해외채용 end */}
              </div>
              {/* 국내채용, 해외채용 end */}
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
                    <Link to={`jobs/${job.id}`} key={`vvip-${job.id}-${index}`}>
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
                    <Link to={`jobs/${job.id}`} key={`vip-${job.id}`}>
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
                    <Link to={`jobs/${job.id}`} key={`special-${job.id}`}>
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
