import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import "../../../public/css/jobpost.css";
import { JobResponse } from "../../app/dummy/jobPost";
import { getDdayString, isApplyAvailable } from "../../utils/dateUtils";
import PostingPagination from "../common/PostingPagination";

import ScrapModal from "./ScrapModal";
import { JobPostSearchFilterOption } from "../../types/jobPost";
import { jobpostApi } from "../../api/jobpost";
import {
  getDumsRegionAll,
  getDumsCorporateTypesAll,
  getDumsJobTypesAll,
  getDumsJobCategoriesAll,
} from "../../api/dums";
import "./JobList.css";
import ApplyModal from "./ApplyModal";
import getLevelOneCode, {
  LevelCode,
  LevelOneCodesResponse,
} from "../../api/getLevelOneCodes";
import SearchSelectBoxScroll from "./SearchSelectBoxScroll";
import { fetchJobpostData, JobpostDataItem } from "../../api/jobpostData";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

interface JobPost {
  jobId: number;
  employerName: string;
  title: string;
  description: string;
  experience: string;
  education: string;
  location: string;
  jobType: string;
  dDay: string;
  url: string;
  salary: string;
  views: number;
  scrapes: number;
}

const JoblistOver: React.FC = () => {
  // -------- 라벨링용 데이터
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
  const mapCodesToLabels = (
    codes: string[] = [],
    list: JobpostDataItem[],
    // 어떤 필드를 레이블로 쓸지 선택 (기본은 level1)
    getLabel: (item: JobpostDataItem) => string = (item) => item.level1 ?? ""
  ): string[] => {
    return codes.map((code) => {
      const found = list.find((item) => item.operationDataId === code);
      return found ? getLabel(found) : code;
    });
  };

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get("keyword") || "";
  const jobType = searchParams.get("jobType") || "";
  const locationParam = searchParams.get("location") || "";
  const type = searchParams.get("type") || "";
  const company = searchParams.get("company") || "";

  const [jobPostTopRes, setJobPostTopRes] = useState<JobResponse[]>([]);
  const [jobPostRes, setJobPostRes] = useState<JobResponse[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.get("page") || "1")
  );
  const [totalPages, setTotalPages] = useState(0);
  const [selectedJob, setSelectedJob] = useState<LevelCode[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LevelCode[]>([]);
  const [selectedType, setSelectedType] = useState<LevelCode[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<LevelCode[]>([]);
  const [isScrapModalOpen, setIsScrapModalOpen] = useState(false);
  const [scrapJobId, setScrapJobId] = useState<number | null>(null);
  const [isSearched, setIsSearched] = useState(!!keyword);
  const [isScraped, setIsScraped] = useState(false);
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
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyJobId, setApplyJobId] = useState<number | null>(null);
  const [applyCompanyName, setApplyCompanyName] = useState("");
  const [applyJobTitle, setApplyJobTitle] = useState("");

  const fetchJobTopList = () => {
    jobpostApi
      .getJobposts({
        page: 1,
        size: 6,
        searchType: "title",
        query: "",
        country: "해외",
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
        country: "해외",

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
  function toggleOption(
    list: JobPostSearchFilterOption[],
    option: JobPostSearchFilterOption,
    setter: React.Dispatch<React.SetStateAction<JobPostSearchFilterOption[]>>
  ) {
    const exists = list.find((o) => o.value === option.value);
    if (exists) {
      setter(list.filter((o) => o.value !== option.value));
    } else {
      setter([...list, option]);
    }
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
    navigate("/jobpost/joblistover");
  };

  const handleSearch = () => {
    updateQueryParams();

    if (
      keyword ||
      selectedJob.length > 0 ||
      selectedLocation.length > 0 ||
      selectedType.length > 0 ||
      selectedCompany.length > 0
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
    setIsScraped(!isScraped);
  };

  const closeApplyModal = () => {
    setIsApplyModalOpen(false);
  };

  const fetchRegions = async () => {
    try {
      const response = await getDumsRegionAll();
      const regions = response
        .filter((region) => region.regionType === "international")
        .map((region) => ({
          value: region.regionId.toString(),
          label: region.regionName,
        }));
      setLocationOptions(regions);
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
    } catch (error) {
      console.error("직무 카테고리 데이터 로딩 중 오류 발생:", error);
    }
  };
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    fetchRegions();
    fetchCorporateTypes();
    fetchJobTypes();
    fetchJobCategories();
    fetchJobTopList();

    if (keyword || jobType || locationParam || type || company) {
      setIsSearched(true);
    }
  }, []);

  useEffect(() => {
    if (keyword) {
      setIsSearched(true);
    }
  }, [keyword]);

  useEffect(() => {
    if (!isSearched) {
      fetchJobList(currentPage);
    }
  }, [isSearched]);

  return (
    <Layout>
      <MetaTagHelmet title="해외채용" description="해외채용" />
      <div className="container-center-horizontal">
        <div className="jobpost screen">
          <div className="container pd00">
            <div className="flex-con">
              <div className="left_menu">
                <Link to="/jobs">국내채용</Link>
                <Link to="/jobpost/joblistover" className="active">
                  해외채용
                </Link>
              </div>

              <div className="flex-col job_list_new job-list-container">
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
                          // ...(domesticData?.levelCodes ?? []),
                          ...(globalData?.levelCodes ?? []),
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
                                    src="/img/2819v00cpm-rwfmne3w9oc4425m0ivmtsg-ud5s8x2vm@2x.png"
                                    alt=""
                                  />
                                </div>
                              )}
                              <div className="name notosanscjkkr-medium-stack-14px">
                                {jPost.companyName}
                              </div>
                              <div className="txt notosanscjkkr-medium-mine-shaft-16px ellipsis">
                                {jPost.title}
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
                    </div>
                  </div>
                )}
                {/* top_job end */}

                {/* jobinfo start */}
                <div className="jobinfo">
                  <div className="group_title">채용정보</div>
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
                                maxWidth: "500px",
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
                                <div className="vector_img">
                                  <i
                                    className={
                                      jPost.isScraped
                                        ? "fa-solid fa-star scraped"
                                        : "fa-regular fa-star"
                                    }
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      openScrapModal(jPost.jobId);
                                    }}
                                    style={{ cursor: "pointer" }}
                                  ></i>
                                </div>
                              </div>
                              <div className="text-container">
                                {jPost.requirements && (
                                  <div className="cell">
                                    {jPost.requirements}
                                  </div>
                                )}
                                {(jPost.wrkcndtnLctRgnStr ||
                                  jPost.location) && (
                                  <div className="cell">
                                    {jPost.wrkcndtnLctRgnStr || jPost.location}
                                  </div>
                                )}
                                {jPost.jobType && (
                                  <div className="cell">
                                    {/* {jPost.jobType} */}
                                    {mapCodesToLabels(
                                      [jPost.jobType],
                                      jobTypeLabelData
                                    ).join(", ")}
                                  </div>
                                )}
                              </div>
                              <div className="dsc">{jPost.description}</div>
                            </div>
                          </Link>
                        </div>
                      </div>
                      <div className="tplprv">
                        <div className="paystat">{jPost.salaryType}</div>
                        <div className="lstIe">{jPost.salary}</div>
                      </div>
                      <div className="tplnum">
                        <div className="nums">
                          <div className="icon">
                            <i className="fa-regular fa-eye"></i>
                          </div>
                          <div className="icon_txt">{jPost.views || 0}명</div>
                        </div>
                        <div className="nums">
                          <div className="icon">
                            <i className="fa-regular fa-star"></i>
                          </div>
                          <div className="icon_txt">{jPost.scrapes || 0}명</div>
                        </div>
                      </div>
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
                                onClick={() =>
                                  handleApply(
                                    jPost.jobId,
                                    jPost.companyName,
                                    jPost.title
                                  )
                                }
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
                    </div>
                  ))}

                  <PostingPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
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

export default JoblistOver;
