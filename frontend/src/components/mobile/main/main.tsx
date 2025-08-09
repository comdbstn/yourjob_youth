import { useEffect, useState } from "react";
import MainFooter from "../components/MainFooter/MainFooter";
import MobileMainHeader from "../components/MainHeader/MainHeader";
import "./main.css";
import { axiosInstance } from "../../../api/axios";
import { getDdayString } from "../../../utils/dateUtils";
import { UserProfile, UserType } from "../../../types/user";
import { Link, useNavigate } from "react-router-dom";
import { JobPost } from "../../../types/jobPost";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Banner, BannerGroup, BannerStatus } from "../../../types/banner";
import { companyApi } from "../../../api/company";
import { userApi } from "../../../api/user";
import { CompanyProfile } from "../../../types/company";
import "swiper/css/grid";
import { MetaTagHelmet } from "../../common/MetaTagHelmet";
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
  wrkcndtnLctAddr: string;
}

interface VipJobProps {
  id: number;
  title: string;
  companyName: string;
  address: string;
  thumbnail: string;
  startDate: string;
  endDate: string;
  wrkcndtnLctAddr: string;
}

interface SpecialJobProps {
  id: number;
  title: string;
  companyName: string;
  address: string;
  startDate: string;
  endDate: string;
}
const MobileMain: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");
  const userType = sessionStorage.getItem("userType") as UserType;
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    () => Boolean(token) || Boolean(userId)
  );

  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>();
  const [communityTab, setCommunityTab] = useState("all");
  const [communityList, setCommunityList] = useState<CommunityProps[]>([]);
  const [bestJobList, setBestJobList] = useState<BestJobProps[]>([]);
  const [domesticJobList, setDomesticJobList] = useState<DomesticJobProps[]>(
    []
  );
  const [overseasJobList, setOverseasJobList] = useState<OverseasJobProps[]>(
    []
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
          }
        );
        setCommunityList(
          response.data.posts.map((post: any) => ({
            id: post.id,
            idx: post.idx,
            title: post.title,
            commentCount: post.commentCount,
            likes: post.likes,
          }))
        );
      } catch (error) {
        console.error("커뮤니티 목록 가져오기 실패:", error);
      }
    };

    fetchCommunityList();
  }, [communityTab]);

  // 기업회원 여부
  const [isCompany, setIsCompany] = useState(false);
  useEffect(() => {
    setIsCompany(userType === UserType.COMPANY);
  }, [userType]);

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
          response.data.map((job: JobPost) => ({
            id: job.id,
            title: job.title,
            thumbnail: job.logo_url,
          }))
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
          response.data.content.map((job: JobPost) => ({
            id: job.id,
            title: job.title,
            thumbnail: job.logo_url,
            startDate: job.startDate,
            endDate: job.endDate,
          }))
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
          response.data.content.map((job: JobPost) => ({
            id: job.id,
            title: job.title,
            thumbnail: job.logo_url,
            startDate: job.startDate,
            endDate: job.endDate,
          }))
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
          response.data.content.map((job: JobPost) => ({
            id: job.id,
            title: job.title,
            companyName: job.companyName,
            address: job.address,
            thumbnail: job.logo_url,
            startDate: job.startDate,
            endDate: job.endDate,
          }))
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
          response.data.content.map((job: JobPost) => ({
            id: job.id,
            title: job.title,
            companyName: job.companyName,
            address: job.address,
            thumbnail: job.logo_url,
            startDate: job.startDate,
            endDate: job.endDate,
          }))
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
          response.data.content.map((job: JobPost) => ({
            id: job.id,
            title: job.title,
            companyName: job.companyName,
            address: job.address,
            startDate: job.startDate,
            endDate: job.endDate,
          }))
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

        setMainBanners(response.data?.content);
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

        setSubBanners(response.data?.content);
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

        setCorpAdBanners(response.data?.content);
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
    <div className="mobile-main-container">
      <MetaTagHelmet title="메인" description="메인" />
      <MobileMainHeader />
      <div className="banner">
        <div
          className="swiper"
          // style={{ width: "100%", position: "relative" }}
        >
          <div className="">
            {mainBanners.length === 0 ? (
              <div className="swiper-slide">
                <div className="swiper-container">
                  <img
                    src="/img/mobile/top_banner.jpg"
                    alt="기본 배너"
                    // style
                    // height: "136px",
                    // width: "390px",
                    // objectFit: "fill",
                    // margin: "0 auto",
                    // }}
                  />
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
                loop={mainBanners.length > 1}
              >
                {mainBanners.map((banner) => (
                  <SwiperSlide key={`main-banner-${banner.id}`}>
                    <Link to={banner.linkTarget} target={banner.linkTargetType}>
                      <div
                        className="swiper-container"
                        // style={{ padding: "0 20px" }}
                      >
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          // style={{ objectFit: "fill" }}
                        />
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
          {mainBanners.length > 0 && (
            <div
            // style={{
            //   position: "absolute",
            //   left: "20px",
            //   right: "20px",
            //   top: "67px",
            // }}
            >
              <div className="topSwiper-button-next swiper-button-next no-cursor"></div>
              <div className="topSwiper-button-prev swiper-button-prev no-cursor"></div>
            </div>
          )}
        </div>
      </div>

      {userType !== UserType.COMPANY ? (
        <div className="gridBtns pl-20 pr-20" style={{ maxHeight: "270px" }}>
          <div className="flexColGap20 leftcon">
            <Link to={"/m/accept"}>
              <div className=" wFullhFull leftBtn">
                <img src="/img/mobile/acceptinform_icon.png" />
                <p>합격자소서</p>
              </div>
            </Link>
            <Link to={"/m/community?isMentor=true"}>
              <div className=" wFullhFull leftBtn">
                <img
                  src="/img/mobile/mento_icon.png"
                  style={{ objectFit: "contain" }}
                />
                <p>대기업멘토링</p>
              </div>
            </Link>
          </div>
          <div className="thirdBtn">
            {/* <img src="/img/banner02.jpg" /> */}
            <Swiper
              modules={[Autoplay, Pagination]}
              slidesPerView={1}
              pagination={{ clickable: true }}
              loop={subBanners.length > 1}
            >
              {subBanners.map((banner) => (
                <SwiperSlide key={banner.id}>
                  <Link to="/m/jobPost">
                    <div className="thumb">
                      <img src={banner.imageUrl} />
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      ) : (
        <>
          {" "}
          <div
            className="pl-20 pr-20"
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "20px",
            }}
          >
            <div className="">
              {corpAdBanners.length === 0 ? (
                <div className="swiper-container SwiperBg">
                  <img src="/img/banner03.png" alt="기본 기업 광고 배너" />
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
                          <img src={banner.imageUrl} alt={banner.title} />
                        </div>
                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>
            <div
              className=""
              style={{
                padding: "10px",
                background: "#f9fbfc",
                border: "#eaeaea 1px solid",
                marginTop: "10px",
                borderRadius: "15px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <img
                className=""
                src="/img/image-main-talent.png"
                alt=""
                style={{ width: "50px" }}
              />
              <div className="" style={{ fontSize: "12px" }}>
                <Link to="/corpmem/productInform">
                  <p className="">
                    인재풀 열람
                    <i className="fa-solid fa-angle-right"></i>
                  </p>
                  <p>유학생 인재풀 열람, 포지션 제안 상품 안내</p>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      <section className="boardSection">
        <div className="containers">
          <div className="header">
            <p>
              유어잡 <strong>BEST</strong>이야기
            </p>
          </div>
          <div className="category">
            <button
              onClick={() => setCommunityTab("all")}
              className={communityTab === "all" ? "best" : ""}
            >
              Best
            </button>
            <button
              onClick={() => setCommunityTab("america")}
              className={communityTab === "america" ? "best" : ""}
            >
              미주
            </button>
            <button
              onClick={() => setCommunityTab("europe")}
              className={communityTab === "europe" ? "best" : ""}
            >
              유럽
            </button>
            <button
              onClick={() => setCommunityTab("asia")}
              className={communityTab === "asia" ? "best" : ""}
            >
              아시아
            </button>
            <button
              onClick={() => setCommunityTab("oceania")}
              className={communityTab === "oceania" ? "best" : ""}
            >
              오세아니아
            </button>
          </div>

          <div className="rows">
            <ul>
              {communityList.map((i, idx) => (
                <li key={`community-${i.id}`}>
                  <Link to={`/m/community/view?id=${i.id}`}>
                    <p>0{idx + 1}</p>
                    <p>{i.title}</p>
                    <p>{i.commentCount}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 사업자 swier 배너 */}
      {isCompany && (
        <section className="companyBanner">
          <div className="banner">
            <div className="swiper">
              <div className="">
                {corpAdBanners.length === 0 ? (
                  <div className="swiper-slide">
                    <div className="swiper-container">
                      <img
                        src="/img/mobile/con04.jpg"
                        alt="기본 배너"
                        style={
                          {
                            // height: "136px",
                            // width: "390px",
                            // objectFit: "fill",
                            // margin: "0 auto",
                          }
                        }
                      />
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
                    loop={corpAdBanners.length > 1}
                  >
                    {corpAdBanners.map((banner) => (
                      <SwiperSlide key={`main-banner-${banner.id}`}>
                        <Link
                          to={banner.linkTarget}
                          target={banner.linkTargetType}
                        >
                          <div
                            className="swiper-container"
                            // style={{ padding: "0 20px" }}
                          >
                            <img
                              src={banner.imageUrl}
                              alt={banner.title}
                              // style={{ objectFit: "fill" }}
                            />
                          </div>
                        </Link>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>
              {corpAdBanners.length > 0 && (
                <div
                // style={{
                //   position: "absolute",
                //   left: "20px",
                //   right: "20px",
                //   top: "67px",
                // }}
                >
                  <div className="topSwiper-button-next swiper-button-next no-cursor"></div>
                  <div className="topSwiper-button-prev swiper-button-prev no-cursor"></div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 사업자 인제품 열람 배너 */}
      {isCompany && (
        <div className="talentPool">
          <Link to="#!">
            <img
              src="/img/mobile/con05.png"
              alt="인재풀 바로가기"
              style={{ objectFit: "fill", width: "100%" }}
            />
          </Link>
        </div>
      )}

      <section className="popularSection">
        <h3>금주의 인기공고</h3>
        <ul>
          {bestJobList.length === 0 && <div>인기공고가 없습니다.</div>}
          <Swiper
            modules={[Autoplay]}
            spaceBetween={10}
            autoplay={{ delay: 3000 }}
            loop={bestJobList.length > 1}
            slidesPerView={"auto"}
            // grid={{
            //   rows: 2,
            // }}
          >
            {bestJobList.map((i) => (
              <SwiperSlide
                key={i.id}
                style={{
                  width: "240px", // 한 슬라이드의 고정 너비
                  boxSizing: "border-box",
                }}
              >
                <li>
                  <Link to={`/m/jobPost/detail?jobId=${i.id}`}>
                    <div className="brand">
                      <img
                        src={
                          i.thumbnail ||
                          "/img/2q1cn00cpv-qwmcdoek6jr4h23v0inmush-lmqqnd2nv.png"
                        }
                        alt={i.title}
                      />
                    </div>
                    <p>{i.title}</p>
                  </Link>
                </li>
              </SwiperSlide>
            ))}
          </Swiper>
        </ul>
      </section>
      <section className="vipSection">
        <h3>VVIP 채용관</h3>
        <ul
          style={{
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {vvipJobList.length === 0 && <p>채용 공고가 없습니다.</p>}
          {vvipJobList.map((i) => (
            <li key={`vvip-${i.id}`}>
              <Link to={`/m/jobPost/detail?jobId=${i.id}`}>
                <img
                  src={
                    i.thumbnail ||
                    "/img/2819v00cpm-rwfmne3w9oc4425m0ivmtsg-ud5s8x2vm@2x.png"
                  }
                />
                <div className="middle">
                  <p>{i.companyName}</p>
                  <p>{i.title}</p>
                </div>
                <div className="bottom">
                  <p className="bottomP">{i.wrkcndtnLctAddr}</p>
                  <p>{getDdayString(i.endDate)}</p>
                </div>
              </Link>
            </li>
          ))}{" "}
        </ul>
      </section>
      <section className="vipSection">
        <h3>VIP 채용관</h3>
        <ul
          style={{
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {vipJobList.length === 0 && <p>채용 공고가 없습니다.</p>}
          {vipJobList.map((i) => (
            <li key={`vip-${i.id}`}>
              <Link to={`/m/jobPost/detail?jobId=${i.id}`}>
                <img
                  src={
                    i.thumbnail ||
                    "/img/2819v00cpm-rwfmne3w9oc4425m0ivmtsg-ud5s8x2vm@2x.png"
                  }
                />
                <div className="middle">
                  <p>{i.companyName}</p>
                  <p>{i.title}</p>
                </div>
                <div className="bottom">
                  <p className="bottomP">{i.wrkcndtnLctAddr}</p>
                  <p>{getDdayString(i.endDate)}</p>
                </div>
              </Link>
            </li>
          ))}{" "}
        </ul>
      </section>
      <section className="vipSection">
        <h3>SPECIAL 채용관</h3>
        <ul
          style={{
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {specialJobList.map((i) => (
            <Link
              key={`special-${i.id}`}
              to={`/m/jobPost/detail?jobId=${i.id}`}
            >
              <li className="h157">
                <div className="middle">
                  <p>{i.companyName}</p>
                  <p>{i.title}</p>
                </div>
                <div className="bottom">
                  <p className="bottomP">{i.address}</p>
                  <p>{getDdayString(i.endDate)}</p>
                </div>
              </li>
            </Link>
          ))}
        </ul>{" "}
      </section>
      <MainFooter />
    </div>
  );
};
export default MobileMain;
