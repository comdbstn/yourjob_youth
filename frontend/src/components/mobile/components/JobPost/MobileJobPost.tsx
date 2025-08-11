import { useEffect, useState } from "react";
import MobileMainHeader from "../MainHeader/MainHeader";
import JobPostHeader from "./JobPostHeader/JobPostHeader";
import "./MobileJobPost.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import JobPostSearchPopUp from "./JobPostSearchPopUp/JobPostSearchPopUp";
import { axiosInstance } from "../../../../api/axios";
import { JobResponse } from "../../../../app/dummy/jobPost";
import {
  planningOptions,
  nationwideLocationOptions,
  employmentTypeOptions,
  companyTypeOptions,
} from "../../../../app/dummy/options";
import { JobPostSearchFilterOption } from "../../../../app/store";
import { getDday, isPreviousDate } from "../../../../utils/dateUtils";
import ApplyModal from "../../../jobpost/ApplyModal";
import ApplyModalMobile from "../Popups/ApplyModalMobile/ApplyModalMobile";
import JobTypePopUp from "./components/JobTypePopUp/JobTypePopUp";
import PostingPagination from "../../../common/PostingPagination";
import MainFooter from "../MainFooter/MainFooter";
import {
  getDumsRegionAll,
  getDumsCorporateTypesAll,
  getDumsJobTypesAll,
  getDumsJobCategoriesAll,
} from "../../../../api/dums";
import { jobpostApi } from "../../../../api/jobpost";
import ScrapModal from "../../../jobpost/ScrapModal";
import { UserType } from "../../../../types/user";
import getLevelOneCode, {
  LevelCode,
  LevelOneCodesResponse,
} from "../../../../api/getLevelOneCodes";
import { MetaTagHelmet } from "../../../common/MetaTagHelmet";
const FILTER_PARAM_MAP: Record<string, string> = {
  planningOptions: "jobType",
  nationwideLocation: "location",
  fullNationwideLocation: "location",
  employmentType: "type",
  companyType: "company",
};
export default function MobileJobPost() {
  // -------- 검색용 데이터
  // 직무
  const [jobTypeData, setJobTypeData] = useState<LevelOneCodesResponse>();
  // 지역
  const [domesticData, setDomesticData] = useState<LevelOneCodesResponse>();
  const [globalData, setGlobalData] = useState<LevelOneCodesResponse>();
  const [locationData, setLocationData] = useState<LevelOneCodesResponse>();
  // 채용형태
  const [operationTypeData, setOperationTypeData] =
    useState<LevelOneCodesResponse>();
  // 기업형태
  const [corpTypeData, setCorpTypeData] = useState<LevelOneCodesResponse>();
  useEffect(() => {
    const fetchData = async () => {
      const jobTypeData = await getLevelOneCode({
        dataType: "00000009",
      });
      setJobTypeData(jobTypeData);
      const domestic = await getLevelOneCode({
        dataType: "00000012",
      });
      setDomesticData(domestic);
      const global = await getLevelOneCode({
        dataType: "00000013",
      });
      setGlobalData(global);
      const operationTypeData = await getLevelOneCode({
        dataType: "00000010",
      });
      setOperationTypeData(operationTypeData);
      const corpTypeData = await getLevelOneCode({
        dataType: "00000011",
      });
      setCorpTypeData(corpTypeData);
    };
    fetchData();
  }, []);
  // --------

  //해외채용 클릭시 서치쿼리

  // 기존의 개별 필터 상태
  const userId = sessionStorage.getItem("userId");
  const userType = sessionStorage.getItem("userType") as UserType;
  const [selectedTab, setSelectedTab] = useState("student"); // 기본값: 유학생
  const country = selectedTab === "mentoring" ? "해외" : "국내";
  // JobTypePopUp에서 선택된 필터들을 객체 형태로 관리 (예: { planningOptions: "개발", ... })
  const [isOpenJobTypeModal, setIsOpenJobTypeModal] = useState<boolean>(false);
  // JobTypePopUp에서 전달받은 선택값을 받고, activeFilterKey에 따라 개별 필터 상태를 업데이트합니다.
  // 수정 후:
  // 1) handleSelectJobType 에서 array → comma 문자열로 바꿔서 저장
  const handleSelectJobType = (newFilters: { [key: string]: LevelCode[] }) => {
    const codeFilters: { [key: string]: string[] } = {};
    Object.entries(newFilters).forEach(([key, arr]) => {
      codeFilters[key] = arr.map((o) => o.code);
    });
    setSelectedFilters(codeFilters);
    setIsOpenJobTypeModal(false);
    setCurrentPage(1);
  };
  // selectedFilters는 key → string[] 형태여야 합니다
  const [selectedFilters, setSelectedFilters] = useState<{
    [key: string]: string[];
  }>({});
  // 현재 어떤 필터 타입(키)을 선택할 것인지 관리합니다.
  const [activeFilterKey, setActiveFilterKey] = useState<string>("");
  const jobOptions = planningOptions;

  const typeOptions = employmentTypeOptions;

  //
  useEffect(() => {
    setSelectedFilters({});
  }, [selectedTab]);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get("keyword") || "";
  const jobType = searchParams.get("jobType") || "";
  const locationParam = searchParams.get("location") || "";
  const type = searchParams.get("type") || "";
  const company = searchParams.get("company") || "";
  const gbn = searchParams.get("gbn") || "";
  const navigate = useNavigate();

  const [jobPostTopRes, setJobPostTopRes] = useState<JobResponse[]>([]);
  const [jobPostRes, setJobPostRes] = useState<JobResponse[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.get("page") || "1")
  );
  const [totalPages, setTotalPages] = useState(0);
  const [locationOptions, setLocationOptions] = useState<
    JobPostSearchFilterOption[]
  >([]);
  const [companyOptions, setCompanyOptions] = useState<
    JobPostSearchFilterOption[]
  >([]);
  const [jobTypeOptions, setJobTypeOptions] = useState<
    JobPostSearchFilterOption[]
  >([]);
  const [jobCategoryOptions, setJobCategoryOptions] = useState<
    JobPostSearchFilterOption[]
  >([]);
  const [selectedJob, setSelectedJob] =
    useState<JobPostSearchFilterOption | null>(
      jobType
        ? {
            value: jobType,
            label:
              jobCategoryOptions.find((opt) => opt.value === jobType)?.label ||
              "",
          }
        : null
    );
  const [selectedLocation, setSelectedLocation] =
    useState<JobPostSearchFilterOption | null>(
      locationParam
        ? {
            value: locationParam,
            label:
              locationOptions.find((opt) => opt.value === locationParam)
                ?.label || "",
          }
        : null
    );
  const [selectedType, setSelectedType] =
    useState<JobPostSearchFilterOption | null>(
      type
        ? {
            value: type,
            label:
              jobTypeOptions.find((opt) => opt.value === type)?.label || "",
          }
        : null
    );
  const [selectedCompany, setSelectedCompany] =
    useState<JobPostSearchFilterOption | null>(
      company
        ? {
            value: company,
            label:
              companyOptions.find((opt) => opt.value === company)?.label || "",
          }
        : null
    );
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyJobId, setApplyJobId] = useState<number | null>(null);
  const [applyCompanyName, setApplyCompanyName] = useState("");
  const [applyJobTitle, setApplyJobTitle] = useState("");
  const [isScrapModalOpen, setIsScrapModalOpen] = useState(false);
  const [scrapJobId, setScrapJobId] = useState<number | null>(null);
  const [isSearched, setIsSearched] = useState(!!keyword);

  const fetchJobTopList = () => {
    jobpostApi
      .getJobposts({
        page: 1,
        size: 6,
        searchType: "title",
        query: "",
        country,
      })
      .then((response) => {
        setJobPostTopRes(response.content || response.data || []);
      })
      .catch((error) => {
        console.error("Error fetching job top list:", error);
      });
  };
  useEffect(() => {
    // 배열 그대로 꺼내 쓰기
    const jobLabels = selectedFilters.planningOptions || [];
    const locLabels = selectedFilters.nationwideLocation || [];
    const typeLabels = selectedFilters.employmentType || [];
    const corpLabels = selectedFilters.companyType || [];

    // pop-up에서 뽑아온 label 배열로 filter
    const jobs = jobCategoryOptions.filter((opt) =>
      jobLabels.includes(opt.label)
    );
    const locs = locationOptions.filter((opt) => locLabels.includes(opt.label));
    const types = typeOptions.filter((opt) => typeLabels.includes(opt.label));
    const companies = companyOptions.filter((opt) =>
      corpLabels.includes(opt.label)
    );

    // 필터링 결과의 첫 번째 항목(또는 null)로 set
    setSelectedJob(jobs.length > 0 ? jobs[0] : null);
    setSelectedLocation(locs.length > 0 ? locs[0] : null);
    setSelectedType(types.length > 0 ? types[0] : null);
    setSelectedCompany(companies.length > 0 ? companies[0] : null);
  }, [
    selectedFilters,
    jobCategoryOptions,
    locationOptions,
    typeOptions,
    companyOptions,
  ]);
  useEffect(() => {
    if (Object.entries(selectedFilters).length > 0) {
      setCurrentPage(1);
      fetchJobList(1);
    }
  }, [selectedFilters]);
  const fetchJobList = (page: number) => {
    const params: any = {
      page,
      size: 10,
      searchType: "title",
      query: keyword,
      country,
    };

    // selectedFilters 에 담긴 각 key 배열을 comma-string 으로 params 에 추가
    Object.entries(selectedFilters).forEach(([filterKey, values]) => {
      if (values.length && FILTER_PARAM_MAP[filterKey]) {
        params[FILTER_PARAM_MAP[filterKey]] = values.join(",");
      }
    });

    jobpostApi
      .getJobposts(params)
      .then((res) => {
        setJobPostRes(res.content || []);
        setTotalPages(res.totalPages || 1);
      })
      .catch(console.error);
  };

  const getDdayString = (endDate: string): string => {
    const dday = getDday(new Date(), new Date(endDate));
    if (dday === 0) {
      return "오늘마감";
    } else if (dday < 0) {
      return "채용마감";
    } else {
      return `D-${dday}`;
    }
  };

  const handlePageChange = (page: number) => {
    const searchParams = new URLSearchParams(window.location.search);
    const jobType = searchParams.get("jobType") || "";
    const locationParam = searchParams.get("location") || "";
    const type = searchParams.get("type") || "";
    const company = searchParams.get("company") || "";

    setSelectedJob(
      jobType
        ? {
            value: jobType,
            label:
              jobCategoryOptions.find((opt) => opt.value === jobType)?.label ||
              "",
          }
        : null
    );
    setSelectedLocation(
      locationParam
        ? {
            value: locationParam,
            label:
              locationOptions.find((opt) => opt.value === locationParam)
                ?.label || "",
          }
        : null
    );
    setSelectedType(
      type
        ? {
            value: type,
            label:
              jobTypeOptions.find((opt) => opt.value === type)?.label || "",
          }
        : null
    );
    setSelectedCompany(
      company
        ? {
            value: company,
            label:
              companyOptions.find((opt) => opt.value === company)?.label || "",
          }
        : null
    );

    setCurrentPage(page);
    fetchJobList(page);
  };
  useEffect(() => {
    fetchJobTopList(); /* (추가) */
    fetchJobList(1); /* (추가) */
    setCurrentPage(1); /* (추가) */
  }, [selectedTab]);
  const updateQueryParams = () => {
    const params = new URLSearchParams();

    if (keyword) params.set("keyword", keyword);
    Object.entries(selectedFilters).forEach(([filterKey, values]) => {
      const param = FILTER_PARAM_MAP[filterKey];
      if (param && values.length) {
        params.set(param, values.join(","));
      }
    });

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  };

  const handleSelectJob = (option: JobPostSearchFilterOption) => {
    setSelectedJob(option);
  };

  const handleSelectLocation = (option: JobPostSearchFilterOption) => {
    setSelectedLocation(option);
  };

  const handleSelectType = (option: JobPostSearchFilterOption) => {
    setSelectedType(option);
  };

  const handleSelectCompany = (option: JobPostSearchFilterOption) => {
    setSelectedCompany(option);
  };

  const handleReset = () => {
    setSelectedJob(null);
    setSelectedLocation(null);
    setSelectedType(null);
    setSelectedCompany(null);
    setIsSearched(false);
    navigate("/jobs", { replace: true });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchJobList(1);
    updateQueryParams();
    setIsSearched(true);
  };

  const handleApply = (
    jobId: number,
    companyName: string,
    jobTitle: string
  ) => {
    setApplyJobId(jobId);
    setApplyCompanyName(companyName);
    setApplyJobTitle(jobTitle);
    setIsApplyModalOpen(true);
  };

  const openScrapModal = (jobId: number) => {
    const job = jobPostRes.find((j) => j.jobId === jobId);
    if (!userId) {
      alert("로그인해 주세요.");
      return;
    }
    if (job) {
      if (job.isScraped) {
        jobpostApi
          .toggleScrap(jobId)
          .then(() => {
            fetchJobList(currentPage);
          })
          .catch((error: Error) => {
            console.error("Error toggling scrap:", error);
          });
      } else {
        setScrapJobId(jobId);
        setIsScrapModalOpen(true);
      }
    }
  };

  const closeScrapModal = () => {
    setScrapJobId(null);
    setIsScrapModalOpen(false);
    fetchJobList(currentPage);
  };

  const handleScrap = () => {
    // if (scrapJobId) {
    //   jobpostApi
    //     .toggleScrap(scrapJobId)
    //     .then(() => {
    //       closeScrapModal();
    //     })
    //     .catch((error: Error) => {
    //       console.error("Error toggling scrap:", error);
    //     });
    // }
    closeScrapModal();
  };

  const closeApplyModal = () => {
    setIsApplyModalOpen(false);
  };

  const fetchRegions = async () => {
    try {
      const response = await getDumsRegionAll();
      const regions = response
        .filter((region) => region.regionType === "domestic")
        .map((region) => ({
          value: region.regionId.toString(),
          label: region.regionName,
        }));
      setLocationOptions(regions);
      setSelectedLocation(
        regions.find((opt) => opt.value === locationParam) || null
      );
    } catch (error) {
      console.error("지역 정보 로딩 중 오류 발생:", error);
    }
  };

  const fetchCorporateTypes = async () => {
    try {
      const response = await getDumsCorporateTypesAll();
      const types = response.map((type) => ({
        value: type.corporateTypeId.toString(),
        label: type.corporateTypeName,
      }));
      setCompanyOptions(types);
      setSelectedCompany(types.find((opt) => opt.value === company) || null);
    } catch (error) {
      console.error("기업형태 정보 로딩 중 오류 발생:", error);
    }
  };

  const fetchJobTypes = async () => {
    try {
      const response = await getDumsJobTypesAll();
      const types = response.map((type) => ({
        value: type.jobTypeId.toString(),
        label: type.jobTypeName,
      }));

      setJobTypeOptions(types);
      setSelectedType(types.find((opt) => opt.value === type) || null);
    } catch (error) {
      console.error("채용형태 정보 로딩 중 오류 발생:", error);
    }
  };

  const fetchJobCategories = async () => {
    try {
      const response = await getDumsJobCategoriesAll();
      const options = response.map((category) => ({
        value: category.jobCategoryId.toString(),
        label: category.jobCategoryName,
      }));

      setJobCategoryOptions(options);
      setSelectedJob(options.find((opt) => opt.value === jobType) || null);
    } catch (error) {
      console.error("직무 카테고리 데이터 로딩 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    fetchRegions();
    fetchCorporateTypes();
    fetchJobTypes();
    fetchJobCategories();
    fetchJobTopList();

    // URL 파라미터가 있으면 초기 검색 수행
    if (keyword || jobType || locationParam || type || company) {
      setIsSearched(true);
    }
    fetchJobList(currentPage);
  }, []);

  useEffect(() => {
    if (keyword) {
      fetchJobList(1);
    }
  }, [keyword]);
  const handleRemoveOption = (filterKey: string, value: string) => {
    setSelectedFilters((prev) => {
      const next = { ...prev };
      // 해당 키에서 value 하나만 제거
      next[filterKey] = next[filterKey].filter((v) => v !== value);
      // 만약 빈 배열이 되면 키 자체를 삭제
      if (next[filterKey].length === 0) {
        delete next[filterKey];
      }
      return next;
    });
  };
  const isApplyAvailable = (dateTimeStr: string) => {
    if (!dateTimeStr) {
      return;
    }
    const [datePart, timePart] = dateTimeStr.split(" ");
    if (!datePart || !timePart) return false;

    const [year, month, day] = datePart.split("-").map((v) => parseInt(v, 10));
    const [hour, minute] = timePart.split(":").map((v) => parseInt(v, 10));

    // 로컬 타임존 기준 Date 객체 생성
    const target = new Date(year, month - 1, day, hour, minute);

    // 현재 시간과 비교
    return new Date() < target;
  };
  const [isScraped, setIsScraped] = useState(false);

  useEffect(() => {
    // whenever filters change, reset to page 1, fetch & update the URL
    if (!isOpenJobTypeModal) {
      fetchJobList(1);
      updateQueryParams();
    }
  }, [selectedFilters]);
  useEffect(() => {
    if (!gbn) return;

    const timer = setTimeout(() => {
      if (gbn === "national") {
        setSelectedTab("mentoring");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [gbn]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <JobTypePopUp
        isGlobal={selectedTab === "mentoring"}
        isOpen={isOpenJobTypeModal}
        onClose={() => setIsOpenJobTypeModal(false)}
        onSelect={handleSelectJobType}
        initialSelected={Object.entries(selectedFilters).reduce(
          (acc, [key, codes]) => {
            acc[key] = codes.map((code) => ({
              code,
              levelValue: "", // 실제 레이블은 팝업 내부의 API 응답에서 보여주므로 빈 문자열로 둬도 무방합니다
              parentCode: null,
            }));
            return acc;
          },
          {} as Record<string, LevelCode[]>
        )}
        initialField={activeFilterKey}
        // initialField={"planningOptions"}
      />

      <div className="mobile_jobPostContainer">
        <MetaTagHelmet title="채용정보" description="채용정보" />
        <JobPostHeader />
        <div className="topBtns">
          <button
            className={selectedTab === "student" ? "selected" : ""}
            onClick={() => setSelectedTab("student")}
          >
            <span>국내채용</span>
          </button>
          <button
            className={selectedTab === "mentoring" ? "selected" : ""}
            onClick={() => setSelectedTab("mentoring")}
          >
            <span>해외채용</span>
          </button>
        </div>
        <div className="topBtns secondBtns">
          <button
            onClick={() => {
              setActiveFilterKey("planningOptions");
              setIsOpenJobTypeModal(true);
            }}
          >
            직무
          </button>
          <button
            onClick={() => {
              setActiveFilterKey(
                selectedTab === "mentoring"
                  ? "fullNationwideLocation"
                  : "nationwideLocation"
              );
              setIsOpenJobTypeModal(true);
            }}
          >
            근무지역
          </button>
          <button
            onClick={() => {
              setActiveFilterKey("employmentType");
              setIsOpenJobTypeModal(true);
            }}
          >
            채용형태
          </button>
          <button
            onClick={() => {
              setActiveFilterKey("companyType");
              setIsOpenJobTypeModal(true);
            }}
          >
            기업형태
          </button>
        </div>
        {/* 선택된 필터들을 보여주는 영역 */}
        <div
          className="flexGap10"
          style={{ flexWrap: "wrap", padding: "0 10px" }}
        >
          {Object.entries(selectedFilters).flatMap(([filterKey, values]) =>
            values.map((valueId) => {
              // 기본으로 valueId(코드)
              let label = valueId;

              switch (filterKey) {
                case "planningOptions":
                  label =
                    jobTypeData?.levelCodes?.find((o) => o.code === valueId)
                      ?.levelValue ?? valueId;
                  break;

                case "nationwideLocation":
                case "fullNationwideLocation":
                  // 국내(domestic) + 해외(global) 합친 뒤 검색
                  const regions = [
                    ...(domesticData?.levelCodes ?? []),
                    ...(globalData?.levelCodes ?? []),
                  ];
                  label =
                    regions.find((o) => o.code === valueId)?.levelValue ??
                    valueId;
                  break;

                case "employmentType":
                  label =
                    operationTypeData?.levelCodes?.find(
                      (o) => o.code === valueId
                    )?.levelValue ?? valueId;
                  break;

                case "companyType":
                  label =
                    corpTypeData?.levelCodes?.find((o) => o.code === valueId)
                      ?.levelValue ?? valueId;
                  break;
              }

              return (
                <div
                  key={`${filterKey}-${valueId}`}
                  className="flexGap10 selectedOptions"
                  style={{ fontSize: "12px" }}
                >
                  <span>{label}</span>
                  {/* <button
                    type="button"
                    onClick={() => handleRemoveOption(filterKey, valueId)}
                  >
                    <img src="/img/XIconBlue.png" alt="삭제" />
                  </button> */}
                </div>
              );
            })
          )}
        </div>

        {Object.entries(selectedFilters).length === 0 && !keyword && (
          <section className="vipSection mt-30">
            <h3 className="m_sub_title">TOP 채용관</h3>
            <ul>
              {jobPostTopRes.map((i) => (
                <li key={i.jobId}>
                  <Link to={`/m/jobPost/detail?jobId=${i.jobId}`}>
                    <div className="thumb">
                      <img
                        src={
                          i.logo_url
                            ? i.logo_url
                            : "/img/2819v00cpm-rwfmne3w9oc4425m0ivmtsg-ud5s8x2vm@2x.png"
                        }
                        style={{ objectFit: "contain" }}
                        alt=""
                      />
                    </div>
                    <div className="middle">
                      <p>{i.companyName}</p>
                      <p
                        style={{
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "normal",
                        }}
                      >
                        {i.title}
                      </p>
                    </div>
                    <div className="bottom">
                      <p className="bottomP">{i.location}</p>
                      <p>{getDdayString(i.endDate)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="infoSection mt-30">
          <h3 className="m_sub_title bottom_line">채용 정보</h3>
          <ul>
            {jobPostRes.length === 0 && (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: "50px",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                결과 없음
              </div>
            )}
            {jobPostRes.map((i) => (
              <li key={i.jobId}>
                <Link to={`/m/jobPost/detail?jobId=${i.jobId}`}>
                  <p className="companyName">{i.companyName}</p>
                  <p className="titleName">{i.title}</p>
                  <p className="infoText">
                    {i.requirements} {i.description}
                  </p>
                  <div className="btns">
                    {!isApplyAvailable(i.endDate) ? (
                      <button
                        className="w-full"
                        style={{
                          border: "#eaeaea 1px solid",
                          borderRadius: "20px",
                          color: "#eaeaea",
                        }}
                      >
                        마감
                      </button>
                    ) : (
                      <>
                        {userType !== UserType.COMPANY && (
                          <>
                            {" "}
                            {i.url ? (
                              <button
                                className="buttonStyle"
                                onClick={(e) => {
                                  e.stopPropagation(); /* (추가) 상위 Link로의 이벤트 버블링 방지 */
                                  e.preventDefault();

                                  if (!userId) {
                                    alert("로그인 후 지원해주세요.");
                                    navigate("/member/join");
                                  } else {
                                    window.open(i.url, "_blank");
                                  }
                                }}
                              >
                                <p>홈페이지 지원</p>
                              </button>
                            ) : (
                              <button
                                className="buttonStyle"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleApply(i.jobId, i.companyName, i.title);
                                }}
                              >
                                <p>즉시지원</p>
                              </button>
                            )}
                          </>
                        )}
                      </>
                    )}
                    <button
                      className="buttonStyle"
                      style={{
                        alignItems: "center",
                        display: "flex",
                        gap: "10px",
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (userId) {
                          openScrapModal(i.jobId);
                        } else {
                          alert("로그인해 주세요!");
                          navigate("/m/member/userLogin");
                        }
                      }}
                    >
                      스크랩
                      <div
                        style={{ paddingBottom: "5px" }}
                        className="vector_img"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openScrapModal(i.jobId);
                        }}
                      >
                        <i
                          className={
                            i.isScraped
                              ? "fa-solid fa-star scraped"
                              : "fa-regular fa-star"
                          }
                        ></i>
                      </div>
                    </button>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        {jobPostRes.length > 0 && (
          <PostingPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}

        <MainFooter />
      </div>
      {isApplyModalOpen && applyJobId && (
        <ApplyModalMobile
          isOpen={isApplyModalOpen}
          onClose={closeApplyModal}
          jobId={applyJobId}
          companyName={applyCompanyName}
          jobTitle={applyJobTitle}
        />
      )}
      <ScrapModal
        jobPostId={Number(scrapJobId) ?? ""}
        isOpen={isScrapModalOpen}
        onClose={closeScrapModal}
        onConfirm={handleScrap}
      />
    </>
  );
}
