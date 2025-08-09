import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import "../../../public/css/jobpost.css";
import { JobResponse } from "../../app/dummy/jobPost";
import { getDday, isApplyAvailable } from "../../utils/dateUtils";
import PostingPagination from "../common/PostingPagination";
import SelectBoxScroll from "./SelectBoxScroll";
import { JobPostSearchFilterOption } from "../../types/jobPost";
import { jobpostApi } from "../../api/jobpost";
import {
  getDumsRegionAll,
  getDumsCorporateTypesAll,
  getDumsJobTypesAll,
  getDumsJobCategoriesAll,
} from "../../api/dums";
import "./JobList.css";
import ScrapModal from "./ScrapModal";
import ApplyModal from "./ApplyModal";
import { UserType } from "../../types/user";
import getLevelOneCode, {
  LevelCode,
  LevelOneCodesResponse,
} from "../../api/getLevelOneCodes";
import SearchSelectBoxScroll from "./SearchSelectBoxScroll";
import { fetchJobpostData, JobpostDataItem } from "../../api/jobpostData";
import { Option } from "../../app/dummy/options";
import { resumeApi } from "../../api/resume";
import { ResumeItem } from "../../types/resume";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const JoblistDom: React.FC = () => {
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
  // 근무형태
  const [jobTypeLabelData, setJobTypeLabelData] = useState<JobpostDataItem[]>(
    []
  );
  useEffect(() => {
    const fetchData = async () => {
      const jobTypeData = await fetchJobpostData("00000010");
      setJobTypeLabelData(jobTypeData);
    };
    fetchData();
  }, []);
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
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userType = sessionStorage.getItem("userType") as UserType;
  const keyword = searchParams.get("keyword") || "";
  const jobType = searchParams.get("jobType") || "";
  const locationParam = searchParams.get("location") || "";
  const type = searchParams.get("type") || "";
  const company = searchParams.get("company") || "";
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");
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
  // const [selectedJob, setSelectedJob] = useState<JobPostSearchFilterOption[]>(
  //   jobType
  //     ? jobType.split(",").map((v) => ({
  //         value: v,
  //         label: jobCategoryOptions.find((o) => o.value === v)?.label || v,
  //       }))
  //     : [],
  // );
  const [selectedJob, setSelectedJob] = useState<LevelCode[]>([]);
  // const [selectedLocation, setSelectedLocation] = useState<
  //   JobPostSearchFilterOption[]
  // >(
  //   locationParam
  //     ? locationParam.split(",").map((v) => ({
  //         value: v,
  //         label: locationOptions.find((o) => o.value === v)?.label || v,
  //       }))
  //     : [],
  // );
  const [selectedLocation, setSelectedLocation] = useState<LevelCode[]>([]);
  // const [selectedType, setSelectedType] = useState<JobPostSearchFilterOption[]>(
  //   type
  //     ? type.split(",").map((v) => ({
  //         value: v,
  //         label: jobTypeOptions.find((o) => o.value === v)?.label || v,
  //       }))
  //     : [],
  // );
  const [selectedType, setSelectedType] = useState<LevelCode[]>([]);
  // const [selectedCompany, setSelectedCompany] = useState<
  //   JobPostSearchFilterOption[]
  // >(
  //   company
  //     ? company.split(",").map((v) => ({
  //         value: v,
  //         label: companyOptions.find((o) => o.value === v)?.label || v,
  //       }))
  //     : [],
  // );
  const [selectedCompany, setSelectedCompany] = useState<LevelCode[]>([]);
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
        country: "국내",
      })
      .then((response) => {
        setJobPostTopRes(response.content || response.data || []);
      })
      .catch((error) => {
        console.error("Error fetching job top list:", error);
      });
  };

  const fetchJobList = (page: number) => {
    if (
      !selectedJob ||
      !selectedLocation ||
      !selectedType ||
      !selectedCompany
    ) {
      return;
    }
    jobpostApi
      .getJobposts({
        page: page,
        size: 10,
        searchType: "title",
        query: keyword,
        country: "국내",

        ...(selectedJob.length > 0 && {
          jobType: selectedJob.map((o) => o.code).join(","),
        }),

        ...(selectedLocation.length > 0 && {
          location: selectedLocation.map((o) => o.code).join(","),
        }),
        ...(selectedType.length > 0 && {
          type: selectedType.map((o) => o.code).join(","),
        }),
        ...(selectedCompany.length > 0 && {
          company: selectedCompany.map((o) => o.code).join(","),
        }),
      })
      .then((response) => {
        setJobPostRes(response.content || []);
        setTotalPages(response.totalPages || 1);
      })
      .catch((error) => {
        console.error("Error fetching job list:", error);
      });
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
  function toggleOption(
    list: LevelCode[],
    option: LevelCode,
    setter: React.Dispatch<React.SetStateAction<LevelCode[]>>
  ) {
    const exists = list.some((o) => o.code === option.code);
    setter(
      exists ? list.filter((o) => o.code !== option.code) : [...list, option]
    );
  }
  function parseMultiParam(
    raw: string | null,
    options: LevelCode[]
  ): LevelCode[] {
    if (!raw) return [];
    return raw
      .split(",")
      .filter((v) => v)
      .map((code) => {
        const found = options.find((o) => o.code === code);
        // 있으면 해당 객체, 없으면 기본 형태로 대체
        return (
          found ?? {
            code,
            levelValue: code,
            parentCode: null,
          }
        );
      });
  }

  const handlePageChange = (page: number) => {
    const searchParams = new URLSearchParams(window.location.search);
    const jobTypeParam = searchParams.get("jobType");
    setSelectedJob(
      parseMultiParam(jobTypeParam, jobTypeData?.levelCodes ?? [])
    );

    const locationParamStr = searchParams.get("location");
    setSelectedLocation(
      parseMultiParam(locationParamStr, locationData?.levelCodes ?? [])
    );

    const typeParam = searchParams.get("type");
    setSelectedType(
      parseMultiParam(typeParam, operationTypeData?.levelCodes ?? [])
    );

    const companyParam = searchParams.get("company");
    setSelectedCompany(
      parseMultiParam(companyParam, corpTypeData?.levelCodes ?? [])
    );

    setCurrentPage(page);
    fetchJobList(page);
  };

  const updateQueryParams = () => {
    const params = new URLSearchParams();
    if (
      !selectedJob ||
      !selectedLocation ||
      !selectedType ||
      !selectedCompany
    ) {
      return;
    }
    if (keyword) {
      params.set("keyword", keyword);
    } else {
      params.delete("keyword");
    }
    if (selectedJob.length)
      params.set("jobType", selectedJob.map((o) => o.code).join(","));
    else params.delete("jobType");
    if (selectedLocation.length)
      params.set("location", selectedLocation.map((o) => o.code).join(","));
    else params.delete("location");
    if (selectedType.length)
      params.set("type", selectedType.map((o) => o.code).join(","));
    else params.delete("type");
    if (selectedCompany.length)
      params.set("company", selectedCompany.map((o) => o.code).join(","));
    else params.delete("company");

    const newPath = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newPath);
  };

  const handleSelectJob = (opt: LevelCode) => {
    setSelectedJob((prev) => {
      const exists = prev?.some((j) => j.code === opt.code);
      if (exists) {
        // 이미 있으면 제거
        return prev?.filter((j) => j.code !== opt.code);
      } else {
        // 없으면 추가
        return [...(prev ?? []), opt];
      }
    });
  };

  const handleSelectLocation = (opt: LevelCode) =>
    setSelectedLocation((prev) => {
      const exists = prev?.some((o) => o.code === opt.code);
      return exists
        ? prev?.filter((o) => o.code !== opt.code)
        : [...(prev ?? []), opt];
    });

  const handleSelectType = (opt: LevelCode) =>
    setSelectedType((prev) => {
      const exists = prev?.some((o) => o.code === opt.code);
      return exists
        ? prev?.filter((o) => o.code !== opt.code)
        : [...(prev ?? []), opt];
    });

  const handleSelectCompany = (opt: LevelCode) =>
    setSelectedCompany((prev) => {
      const exists = prev?.some((o) => o.code === opt.code);
      return exists
        ? prev?.filter((o) => o.code !== opt.code)
        : [...(prev ?? []), opt];
    });

  const handleReset = () => {
    setSelectedJob([]);
    setSelectedLocation([]);
    setSelectedType([]);
    setSelectedCompany([]);
    setIsSearched(false);
    navigate("/jobs", { replace: true });
  };

  const handleSearch = () => {
    updateQueryParams();

    if (
      keyword ||
      selectedJob ||
      selectedLocation ||
      selectedType ||
      selectedCompany
    ) {
      setIsSearched(true);
      fetchJobList(1);
    } else {
      setIsSearched(false);
    }
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
    if (scrapJobId) {
      closeScrapModal();
    }
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
      const raw = new URLSearchParams(window.location.search).get("location");
      // setSelectedLocation(parseMultiParam(raw, regions));
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

      const rawCompany = new URLSearchParams(window.location.search).get(
        "company"
      );
      // setSelectedCompany(parseMultiParam(rawCompany, types));
    } catch (error) {
      console.error("기업형태 정보 로딩 중 오류 발생:", error);
    }
  };

  // const fetchJobTypes = async () => {
  //   try {
  //     const response = await getDumsJobTypesAll();
  //     const types = response.map((type) => ({
  //       value: type.jobTypeId.toString(),
  //       label: type.jobTypeName,
  //     }));
  //     setJobTypeOptions(types);

  //     const rawType = new URLSearchParams(window.location.search).get("type");
  //     setSelectedType(parseMultiParam(rawType, types));
  //   } catch (error) {
  //     console.error("채용형태 정보 로딩 중 오류 발생:", error);
  //   }
  // };

  // const fetchJobCategories = async () => {
  //   try {
  //     const response = await getDumsJobCategoriesAll();
  //     const options = response.map((category) => ({
  //       value: category.jobCategoryId.toString(),
  //       label: category.jobCategoryName,
  //     }));
  //     setJobCategoryOptions(options);

  //     const rawCategories = new URLSearchParams(window.location.search).get(
  //       "jobType",
  //     );
  //     setSelectedJob(parseMultiParam(rawCategories, options));
  //   } catch (error) {
  //     console.error("직무 카테고리 데이터 로딩 중 오류 발생:", error);
  //   }
  // };

  useEffect(() => {
    fetchRegions();
    fetchCorporateTypes();
    // fetchJobTypes();
    // fetchJobCategories();
    fetchJobTopList();

    // URL 파라미터가 있으면 초기 검색 수행
    if (keyword || jobType || locationParam || type || company) {
      setIsSearched(true);
    }
  }, []);

  useEffect(() => {
    if (keyword) {
      setIsSearched(true);
      fetchJobList(1);
    }
  }, [keyword]);

  useEffect(() => {
    if (!isSearched) {
      fetchJobList(1);
    }
  }, [isSearched]);
  useEffect(() => {
    if (jobTypeData) {
      setSelectedJob(parseMultiParam(jobType, jobTypeData.levelCodes));
    }
    if (domesticData && globalData) {
      const locOpts = [...domesticData.levelCodes, ...globalData.levelCodes];
      setSelectedLocation(parseMultiParam(locationParam, locOpts));
    }
    if (operationTypeData) {
      setSelectedType(parseMultiParam(type, operationTypeData.levelCodes));
    }
    if (corpTypeData) {
      setSelectedCompany(parseMultiParam(company, corpTypeData.levelCodes));
    }

    setCurrentPage(1);
    fetchJobList(1);
    setIsSearched(!!(keyword || jobType || locationParam || type || company));
  }, [
    jobTypeData,
    domesticData,
    globalData,
    operationTypeData,
    corpTypeData,
    keyword,
    jobType,
    locationParam,
    type,
    company,
  ]);
  const mapCodesToLabels = (
    codes: string | string[] = [],
    list: JobpostDataItem[],
    getLabel: (item: JobpostDataItem) => string = (item) => item.level1 ?? ""
  ): string[] => {
    // codes가 array가 아니면 배열로 감싸준다
    const codeArray = Array.isArray(codes) ? codes : [codes];

    return codeArray.map((code) => {
      const found = list.find((item) => item.operationDataId === code);
      return found ? getLabel(found) : code;
    });
  };
  // 즉시지원 이력서 갯수 체크용
  const [resumes, setResumes] = useState<Option[]>([]);
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const params = {
          page: 1,
          size: 10,
        };
        const response = await resumeApi.getResumes(params);
        setResumes(
          response.content &&
            response.content.map((resume: ResumeItem) => ({
              id: resume.id,
              value: resume.title,
              label: resume.title,
            }))
        );
      } catch (error) {
        console.error("이력서 조회에 실패했습니다:", error);
      }
    };
    fetchResumes();
  }, []);
  //
  return (
    <Layout>
      <MetaTagHelmet title="채용공고" description="채용공고" />
      <div className="container-center-horizontal">
        <div className="jobpost screen">
          <div className="container pd00">
            <div className="flex-con">
              <div className="left_menu">
                <Link to="/jobs" className="active">
                  국내채용
                </Link>
                <Link to="/jobpost/joblistover">해외채용</Link>
              </div>

              <div className="flex-col job_list_new job-list-container">
                {/* 
                <div className="dataLinkFilterContainer">
                  <ul className="selectHeader">
                    <li>
                      <button onClick={() => setOpenSearchTabType("jobType")}>
                        직무
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setOpenSearchTabType("location")}>
                        근무지역
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setOpenSearchTabType("hiringType")}
                      >
                        채용형태
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setOpenSearchTabType("corpType")}>
                        기업형태
                      </button>
                    </li>
                  </ul>
                  <ul className="selectBody">
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                  </ul>
                </div> 
                */}
                {/* search start */}
                <div className="SearchForm">
                  <div className="titDetailSch">채용공고 상세검색</div>
                  <ul className="select_nav">
                    <li>직무</li>
                    <li>근무지역</li>
                    <li>채용형태</li>
                    <li>기업형태</li>
                  </ul>
                  <ul className="select_box">
                    <li>
                      <SearchSelectBoxScroll
                        options={jobTypeData?.levelCodes ?? []}
                        activeValues={selectedJob?.map((o) => o.code)}
                        onSelect={handleSelectJob}
                      />
                    </li>
                    <li>
                      <SearchSelectBoxScroll
                        options={[
                          ...(domesticData?.levelCodes ?? []),
                          // ...(globalData?.levelCodes ?? []),
                        ]}
                        activeValues={selectedLocation?.map((o) => o.code)}
                        onSelect={handleSelectLocation}
                      />
                    </li>
                    <li>
                      <SearchSelectBoxScroll
                        options={operationTypeData?.levelCodes ?? []}
                        activeValues={selectedType?.map((o) => o.code)}
                        onSelect={handleSelectType}
                      />
                    </li>
                    <li>
                      <SearchSelectBoxScroll
                        options={corpTypeData?.levelCodes ?? []}
                        activeValues={selectedCompany?.map((o) => o.code)}
                        onSelect={handleSelectCompany}
                      />
                    </li>
                  </ul>

                  <div className="job_search_box">
                    <div className="choice_box">
                      {selectedJob?.map((opt) => (
                        <div key={opt.code} className="choice_flex">
                          <div className="choice_txt">{opt.levelValue}</div>
                          <button
                            type="button"
                            className="job_search_tag_btn"
                            onClick={() => handleSelectJob(opt)}
                          >
                            <i className="fa-solid fa-xmark">
                              <span>삭제</span>
                            </i>
                          </button>
                        </div>
                      ))}
                      {/* 근무지역 */}
                      {selectedLocation?.map((loc) => (
                        <div key={loc.code} className="choice_flex">
                          <div className="choice_txt">{loc.levelValue}</div>
                          <button
                            type="button"
                            className="job_search_tag_btn"
                            onClick={() => handleSelectLocation(loc)}
                          >
                            <i className="fa-solid fa-xmark">
                              <span>삭제</span>
                            </i>
                          </button>
                        </div>
                      ))}

                      {/* 채용형태 */}
                      {selectedType?.map((t) => (
                        <div key={t.code} className="choice_flex">
                          <div className="choice_txt">{t.levelValue}</div>
                          <button
                            type="button"
                            className="job_search_tag_btn"
                            onClick={() => handleSelectType(t)}
                          >
                            <i className="fa-solid fa-xmark">
                              <span>삭제</span>
                            </i>
                          </button>
                        </div>
                      ))}

                      {/* 기업형태 */}
                      {selectedCompany?.map((c) => (
                        <div key={c.code} className="choice_flex">
                          <div className="choice_txt">{c.levelValue}</div>
                          <button
                            type="button"
                            className="job_search_tag_btn"
                            onClick={() => handleSelectCompany(c)}
                          >
                            <i className="fa-solid fa-xmark">
                              <span>삭제</span>
                            </i>
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="choice_reset">
                      <button
                        type="button"
                        className="choice_flex job_search_reset_btn"
                        onClick={handleReset}
                        style={{
                          backgroundColor: "transparent",
                          boxShadow: "none",
                          border: "none",
                          outline: "none",
                          transition: "none",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <div className="choice_txt rotate">초기화</div>
                        <i className="fa-solid fa-rotate rotate">
                          <span>삭제</span>
                        </i>
                      </button>
                      <button
                        type="button"
                        className="choice_btn choice_btn_search"
                        onClick={handleSearch}
                      >
                        조건 검색하기
                      </button>
                    </div>
                  </div>
                </div>
                {/* search end */}

                {/* top_job start */}
                {!isSearched && (
                  <div className="top_job">
                    <div className="group_title">TOP 채용관</div>
                    <div className="top_group">
                      {/* roop */}
                      {jobPostTopRes.length === 0 && (
                        <div className="txt ellipsis">
                          TOP 채용관 공고가 없습니다.
                        </div>
                      )}
                      {jobPostTopRes.map(
                        (jPost: JobResponse, index: number) => (
                          <div
                            className="card"
                            key={`top-${jPost.jobId}-${index}`}
                          >
                            <Link to={`/jobs/${jPost.jobId}`}>
                              {jPost.logo_url ? (
                                <div className="img_box">
                                  <img
                                    className="comimg"
                                    src={jPost.logo_url}
                                    alt=""
                                  />
                                </div>
                              ) : (
                                <div className="img_box">
                                  <img
                                    className="comimg"
                                    src="/img/logo.png"
                                    alt=""
                                    style={{ width: "100px", height: "40px" }}
                                  />
                                </div>
                              )}
                              <div className="name notosanscjkkr-medium-stack-14px">
                                {jPost.title}
                              </div>
                              <div className="txt notosanscjkkr-medium-mine-shaft-16px ellipsis">
                                {jPost.description}
                              </div>
                              <div className="text-container">
                                <div className="region ellipsis">
                                  {jPost.wrkcndtnLctRgnStr || jPost.location}
                                </div>
                                <div className="dday red_dday">
                                  {getDdayString(jPost.endDate)}
                                </div>
                              </div>
                            </Link>
                          </div>
                        )
                      )}
                      {/* roop end */}
                    </div>
                  </div>
                )}
                {/* top_job end */}

                {/* jobinfo start */}
                <div className="jobinfo">
                  <div className="group_title">채용정보</div>
                  {/* roop */}
                  {jobPostRes.length === 0 && (
                    <div className="txt ellipsis">
                      {isSearched
                        ? "검색된 채용정보가 없습니다."
                        : "채용정보가 없습니다."}
                    </div>
                  )}
                  {jobPostRes.map((jPost: JobResponse, index: number) => (
                    <div
                      className={`list ${index > 0 ? "btnone" : ""}`}
                      key={`${jPost.jobId}-${index}`}
                    >
                      <div className="listinfo">
                        <div className="name notosanscjkkr-medium-stack-14px">
                          {jPost.companyName}
                        </div>
                        <div className="info_con">
                          <Link to={`/jobs/${jPost.jobId}`}>
                            <div
                              className="flex-col"
                              style={{
                                maxWidth: "600px",
                                overflowX: "hidden",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                              }}
                            >
                              <div
                                className="info_txt"
                                style={{
                                  display: "flex",
                                  gap: "10px",
                                  alignItems: "center",
                                }}
                              >
                                <p
                                  className="ellipsis"
                                  style={{ textWrap: "wrap" }}
                                >
                                  {jPost.title}
                                </p>
                                {userType === UserType.JOB_SEEKER && (
                                  <div
                                    style={{ paddingBottom: "5px" }}
                                    className="vector_img"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      openScrapModal(jPost.jobId);
                                    }}
                                  >
                                    <i
                                      className={
                                        jPost.isScraped
                                          ? "fa-solid fa-star scraped"
                                          : "fa-regular fa-star"
                                      }
                                    ></i>
                                  </div>
                                )}
                              </div>
                              <div className="text-container">
                                <div className="cell">경력무관</div>
                                <div className="cell">고졸↑</div>
                                <div className="cell">
                                  {jPost.wrkcndtnLctRgnStr || jPost.location}
                                </div>
                                <div className="cell">
                                  {mapCodesToLabels(
                                    jPost.jobType.split(","),
                                    jobTypeLabelData
                                  ).join(", ")}
                                </div>
                              </div>
                              <div className="dsc">
                                {jPost.description} 마감일: ~
                                {jPost.endDate.split(" ")[0]}
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                      {userType !== UserType.COMPANY && (
                        <>
                          {isApplyAvailable(jPost.endDate) ? (
                            <>
                              {jPost.url ? (
                                <div className="btn_odd">
                                  <button
                                    type="button"
                                    className="h_btn"
                                    onClick={() => {
                                      if (!userId) {
                                        alert("로그인 후 지원해주세요.");
                                        navigate("/member/join");
                                      } else {
                                        window.open(jPost.url, "_blank");
                                      }
                                    }}
                                  >
                                    홈페이지 지원
                                  </button>
                                </div>
                              ) : (
                                <div className="btn_odd">
                                  <button
                                    type="button"
                                    className="d_btn"
                                    onClick={() => {
                                      if (!userId) {
                                        alert("로그인해 주세요.");
                                        navigate("/member/userlogin");
                                      } else if (resumes.length === 0) {
                                        alert(
                                          "이력서가 없습니다. 이력서를 먼저 작성해주세요."
                                        );
                                        navigate("/mypage/resume/write");
                                      } else {
                                        handleApply(
                                          jPost.jobId,
                                          jPost.companyName,
                                          jPost.title
                                        );
                                      }
                                    }}
                                  >
                                    즉시 지원
                                  </button>
                                </div>
                              )}
                            </>
                          ) : (
                            <div
                              style={{
                                width: "150px",
                                height: "50px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                color: "#a8a8a8",
                              }}
                            >
                              채용마감
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  {/* roop end */}

                  {/* page */}
                  <PostingPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                  {/* page end */}
                </div>
                {/* jobinfo end */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isScrapModalOpen && scrapJobId && (
        <ScrapModal
          jobPostId={scrapJobId}
          isOpen={isScrapModalOpen}
          onClose={closeScrapModal}
          onConfirm={handleScrap}
        />
      )}

      {isApplyModalOpen && applyJobId && (
        <ApplyModal
          isOpen={isApplyModalOpen}
          onClose={closeApplyModal}
          jobId={applyJobId}
          companyName={applyCompanyName}
          jobTitle={applyJobTitle}
        />
      )}
    </Layout>
  );
};
export default JoblistDom;
