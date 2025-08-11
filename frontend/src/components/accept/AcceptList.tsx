import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import "../../../public/css/accept.css";
import { acceptApi } from "../../api/accept";
import { SearchParams, SuccessfulResumeItem } from "../../types/accept";
import PostingPagination from "../common/PostingPagination";
import SelectBoxScroll from "../jobpost/SelectBoxScroll";
import { JobPostSearchFilterOption } from "../../app/store";
import { getCommaSeparatedNumber } from "../../utils/numberUtils";
import { UserType } from "../../types/user";
import CompanyLogo from "../common/CompanyLogo";
import { Helmet } from "react-helmet-async";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const AcceptList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userType = sessionStorage.getItem("userType") as UserType;
  const fieldParam = searchParams.get("field") || "";
  const countryParam = searchParams.get("country") || "";

  const userId = sessionStorage.getItem("userId");

  const [acceptList, setAcceptList] = useState<SuccessfulResumeItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 직무분야 및 졸업국가 옵션
  const [jobCategoryOptions, setJobCategoryOptions] = useState<
    JobPostSearchFilterOption[]
  >([]);
  const [countryOptions, setCountryOptions] = useState<
    JobPostSearchFilterOption[]
  >([]);

  const [selectedFields, setSelectedFields] = useState<
    JobPostSearchFilterOption[]
  >([]);
  const [selectedCountries, setSelectedCountries] = useState<
    JobPostSearchFilterOption[]
  >([]);
  const [searchKeyword, setSearchKeyword] = useState<string>(
    searchParams.get("keyword") || ""
  );
  const [isSearched, setIsSearched] = useState(false);

  const [activeFieldValues, setActiveFieldValues] = useState<string[]>([]);
  const [activeCountryValues, setActiveCountryValues] = useState<string[]>([]);

  const [params, setParams] = useState<SearchParams>({
    page: 1,
    size: 10,
  });

  const API_URL =
    process.env.REACT_APP_API_BASE_URL || "https://localhost:8082";

  // API에서 직무분야 데이터 로드
  useEffect(() => {
    const fetchJobCategories = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/corpmem/jobpost-data/level1-codes?dataType=00000009&size=999999`
        );
        if (response.ok) {
          const data = await response.json();
          const options = (data.levelCodes || []).map(
            (category: { levelValue: string; code: string }) => ({
              value: category.levelValue,
              label: category.levelValue,
            })
          );
          setJobCategoryOptions(options);
        }
      } catch (error) {
        console.error("Error fetching job categories:", error);
      }
    };

    // API에서 국가 데이터 로드
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/corpmem/jobpost-data/level1-codes?dataType=00000013&size=999999`
        );
        if (response.ok) {
          const data = await response.json();
          // 대한민국 옵션 추가 및 API 응답의 국가 추가
          const options = [
            { value: "대한민국", label: "대한민국" },
            ...(data.levelCodes || []).map(
              (country: { levelValue: string; code: string }) => ({
                value: country.levelValue,
                label: country.levelValue,
              })
            ),
          ];
          setCountryOptions(options);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchJobCategories();
    fetchCountries();
  }, []);

  useEffect(() => {
    if (fieldParam && jobCategoryOptions.length > 0) {
      const fieldValues = fieldParam.split("|");
      const initialFields = fieldValues
        .map((value) => {
          const option = jobCategoryOptions.find(
            (opt) => opt.value === value || opt.label === value
          );
          return option ? option : { value: value, label: value };
        })
        .filter((option) => option.label.trim() !== "");

      setSelectedFields(initialFields);
      setActiveFieldValues(initialFields.map((field) => field.value));
    }

    if (countryParam && countryOptions.length > 0) {
      const countryValues = countryParam.split("|");
      const initialCountries = countryValues
        .map((value) => {
          const option = countryOptions.find(
            (opt) => opt.value === value || opt.label === value
          );
          return option ? option : { value: value, label: value };
        })
        .filter((option) => option.label.trim() !== "");

      setSelectedCountries(initialCountries);
      setActiveCountryValues(initialCountries.map((country) => country.value));
    }

    if (fieldParam || countryParam) {
      setIsSearched(true);
    }
  }, [jobCategoryOptions, countryOptions, fieldParam, countryParam]);

  useEffect(() => {
    fetchAcceptList(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (fieldParam || countryParam) {
      setIsSearched(true);
    }
  }, []);

  useEffect(() => {
    if (!isSearched) {
      fetchAcceptList(1);
    }
  }, [isSearched]);

  const fetchAcceptList = async (page: number) => {
    try {
      const response = await acceptApi.getSuccessfulResumes({
        ...params,
        page,
        query: searchKeyword,
        field:
          selectedFields.length > 0
            ? selectedFields.map((field) => field.label)
            : undefined,
        country:
          selectedCountries.length > 0
            ? selectedCountries.map((country) => country.label)
            : undefined,
      });

      setAcceptList(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error fetching accept list:", error);
    }
  };

  const updateQueryParams = () => {
    const newQueryParams = new URLSearchParams(location.search);

    const fieldString =
      selectedFields.length > 0
        ? selectedFields.map((field) => field.label).join("|")
        : "";

    const countryString =
      selectedCountries.length > 0
        ? selectedCountries.map((country) => country.label).join("|")
        : "";

    newQueryParams.set("field", fieldString);
    newQueryParams.set("country", countryString);
    newQueryParams.set("keyword", searchKeyword);

    navigate({ search: newQueryParams.toString() });
  };

  // 필드 옵션 선택 핸들러
  const handleFieldSelect = (option: JobPostSearchFilterOption) => {
    const alreadySelected = selectedFields.some(
      (field) => field.value === option.value || field.label === option.label
    );

    if (alreadySelected) {
      setSelectedFields((prev) =>
        prev.filter(
          (field) =>
            field.value !== option.value && field.label !== option.label
        )
      );
      setActiveFieldValues((prev) =>
        prev.filter((value) => value !== option.value)
      );
    } else {
      setSelectedFields((prev) => [...prev, option]);
      setActiveFieldValues((prev) => [...prev, option.value]);
    }
  };

  // 국가 옵션 선택 핸들러
  const handleCountrySelect = (option: JobPostSearchFilterOption) => {
    const alreadySelected = selectedCountries.some(
      (country) =>
        country.value === option.value || country.label === option.label
    );

    if (alreadySelected) {
      setSelectedCountries((prev) =>
        prev.filter(
          (country) =>
            country.value !== option.value && country.label !== option.label
        )
      );
      setActiveCountryValues((prev) =>
        prev.filter((value) => value !== option.value)
      );
    } else {
      setSelectedCountries((prev) => [...prev, option]);
      setActiveCountryValues((prev) => [...prev, option.value]);
    }
  };

  // 필터 삭제 핸들러
  const handleRemoveFilter = (
    type: "field" | "country",
    optionToRemove: JobPostSearchFilterOption
  ) => {
    if (type === "field") {
      setSelectedFields((prev) =>
        prev.filter(
          (option) =>
            option.value !== optionToRemove.value &&
            option.label !== optionToRemove.label
        )
      );
      setActiveFieldValues((prev) =>
        prev.filter((value) => value !== optionToRemove.value)
      );
    } else {
      setSelectedCountries((prev) =>
        prev.filter(
          (option) =>
            option.value !== optionToRemove.value &&
            option.label !== optionToRemove.label
        )
      );
      setActiveCountryValues((prev) =>
        prev.filter((value) => value !== optionToRemove.value)
      );
    }
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setSelectedFields([]);
    setSelectedCountries([]);
    setSearchKeyword("");
    setIsSearched(false);
    setParams((prev) => ({
      ...prev,
      query: "",
      page: 1,
      field: undefined,
      country: undefined,
    }));

    setActiveFieldValues([]);
    setActiveCountryValues([]);

    const newQueryParams = new URLSearchParams();
    navigate({ search: newQueryParams.toString() });
  };

  // 검색 핸들러
  const handleSearch = () => {
    setParams((prev) => ({
      ...prev,
      query: searchKeyword,
      page: 1,
    }));
    setCurrentPage(1);
    updateQueryParams();

    if (
      searchKeyword ||
      selectedFields.length > 0 ||
      selectedCountries.length > 0
    ) {
      setIsSearched(true);
      fetchAcceptList(1);
    } else {
      setIsSearched(false);
    }
  };

  // 페이지네이션 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 상세 페이지로 이동
  const handleItemClick = (id: number) => {
    navigate(`/accept/acceptdetail/${id}`);
  };

  return (
    <Layout>
      <MetaTagHelmet title="합격자소서 목록" description="합격자소서 목록" />
      <div className="container-center-horizontal">
        <div className="accept screen">
          <div className="container">
            <div className="SearchForm">
              <div className="titDetailSch">합격자소서</div>
              <ul className="select_nav">
                <li>지원분야</li>
                <li>졸업국가</li>
              </ul>
              <ul className="select_box">
                <li>
                  <SelectBoxScroll
                    options={jobCategoryOptions}
                    activeValues={activeFieldValues}
                    onSelect={handleFieldSelect}
                  />
                </li>
                <li>
                  <SelectBoxScroll
                    options={countryOptions}
                    activeValues={activeCountryValues}
                    onSelect={handleCountrySelect}
                  />
                </li>
              </ul>

              <div className="job_search_box">
                <div className="choice_box">
                  {selectedFields.map((field, index) => (
                    <div className="choice_flex" key={`field-${index}`}>
                      <div className="choice_txt">{field.label}</div>
                      <button
                        type="button"
                        className="job_search_tag_btn"
                        onClick={() => handleRemoveFilter("field", field)}
                      >
                        <i className="fa-solid fa-xmark">
                          <span>삭제</span>
                        </i>
                      </button>
                    </div>
                  ))}

                  {selectedCountries.map((country, index) => (
                    <div className="choice_flex" key={`country-${index}`}>
                      <div className="choice_txt">{country.label}</div>
                      <button
                        type="button"
                        className="job_search_tag_btn"
                        onClick={() => handleRemoveFilter("country", country)}
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
                    onClick={handleResetFilters}
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

            <div className="accep_title item_between">
              <div className="txt">
                총 {getCommaSeparatedNumber(totalElements)}건
              </div>
              <div className="search_box">
                <input
                  type="search"
                  className="form-control search_form"
                  placeholder="검색어를 입력하세요."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />
                <button
                  type="button"
                  className="searchbtn"
                  onClick={handleSearch}
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
            </div>

            <ul className="dataList">
              {acceptList.length === 0 && (
                <div className="txt ellipsis2">
                  {isSearched
                    ? "검색된 합격자소서가 없습니다."
                    : "합격자소서가 없습니다."}
                </div>
              )}
              {acceptList.map((item, index) => (
                <li
                  key={item.resumeId}
                  className={`accep_list item_between ${
                    index > 0 ? "btnone" : ""
                  }`}
                  onClick={() => handleItemClick(item.resumeId)}
                  style={{ cursor: "pointer" }}
                >
                  <CompanyLogo logoUrl={item.jobPost.company.corpLogoUrl} />
                  <div className="cname">
                    {item.jobPost.company.companyName}
                  </div>
                  <div className="cinfo">
                    <p className="q ellipsis">{item.jobPost.jobTitle}</p>
                    <p className="a-it ellipsis">{item.jobPost.jobCategory}</p>
                    <div className="infoBox">
                      {item.schoolRegion && (
                        <span className="line">{item.schoolRegion}</span>
                      )}
                      {item.schoolType && (
                        <span className="line">{item.schoolType}</span>
                      )}
                      {item.major && <span>{item.major}</span>}
                    </div>
                  </div>
                  {userType !== UserType.COMPANY && (
                    <button
                      type="button"
                      className="myselfBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (userId) {
                          navigate(
                            `/accept/acceptpost?resumeId=${item.resumeId}`
                          );
                        } else {
                          alert("로그인해 주세요.");
                          navigate("/member/userlogin");
                        }
                      }}
                    >
                      자소서 작성
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <PostingPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AcceptList;
