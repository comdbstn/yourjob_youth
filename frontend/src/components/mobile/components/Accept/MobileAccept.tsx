import { Link, useLocation, useNavigate } from "react-router-dom";
import MainFooter from "../MainFooter/MainFooter";
import MobileMainHeader from "../MainHeader/MainHeader";
import "./MobileAccept.css";
import { useState, useEffect } from "react";
import { acceptApi } from "../../../../api/accept";
import { JobPostSearchFilterOption } from "../../../../app/store";
import {
  AcceptListItem,
  SearchParams,
  SuccessfulResumeItem,
} from "../../../../types/accept";
import {
  planningOptions,
  graduationCountryOptions,
} from "../../../../app/dummy/options";
import PostingPagination from "../../../common/PostingPagination";
import { MetaTagHelmet } from "../../../common/MetaTagHelmet";
export default function MobileAccept() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const fieldParam = searchParams.get("field") || "";
  const countryParam = searchParams.get("country") || "";

  const userId = sessionStorage.getItem("userId");

  const [acceptList, setAcceptList] = useState<SuccessfulResumeItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

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

  useEffect(() => {
    if (fieldParam) {
      const fieldValues = fieldParam.split("|");
      const initialFields = fieldValues
        .map((value) => {
          const option = planningOptions.find(
            (opt) => opt.value === value || opt.label === value
          );
          return option ? option : { value: value, label: value };
        })
        .filter((option) => option.label.trim() !== "");

      setSelectedFields(initialFields);

      setActiveFieldValues(initialFields.map((field) => field.value));
    }

    if (countryParam) {
      const countryValues = countryParam.split("|");
      const initialCountries = countryValues
        .map((value) => {
          const option = graduationCountryOptions.find(
            (opt) => opt.value === value || opt.label === value
          );
          return option ? option : { value: value, label: value };
        })
        .filter((option) => option.label.trim() !== "");

      setSelectedCountries(initialCountries);

      // 다중 하이라이트를 위한 value 배열 설정
      setActiveCountryValues(initialCountries.map((country) => country.value));
    }

    if (fieldParam || countryParam) {
      setIsSearched(true);
    }
  }, []);

  useEffect(() => {
    fetchAcceptList(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (fieldParam || countryParam) {
      setIsSearched(true);
      fetchAcceptList(currentPage);
    }
  }, []);

  const fetchAcceptList = async (page: number) => {
    try {
      const response = await acceptApi.getSuccessfulResumes({
        ...params,
        page,
        query: searchKeyword,
        field:
          selectedFields.length > 0
            ? selectedFields.map((field) => field.label).join("|")
            : undefined,
        country:
          selectedCountries.length > 0
            ? selectedCountries.map((country) => country.label).join("|")
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

    newQueryParams.set("query", searchKeyword);

    navigate({ search: newQueryParams.toString() });
  };

  // 필드 옵션 선택 핸들러
  const handleFieldSelect = (option: JobPostSearchFilterOption) => {
    const alreadySelected = selectedFields.some(
      (field) => field.value === option.value || field.label === option.label
    );

    if (alreadySelected) {
      // 이미 선택된 경우, 제거
      setSelectedFields((prev) =>
        prev.filter(
          (field) =>
            field.value !== option.value && field.label !== option.label
        )
      );

      // 하이라이트에서도 제거
      setActiveFieldValues((prev) =>
        prev.filter((value) => value !== option.value)
      );
    } else {
      // 선택되지 않은 경우, 추가
      setSelectedFields((prev) => [...prev, option]);

      // 하이라이트에도 추가
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
      // 이미 선택된 경우, 제거
      setSelectedCountries((prev) =>
        prev.filter(
          (country) =>
            country.value !== option.value && country.label !== option.label
        )
      );

      // 하이라이트에서도 제거
      setActiveCountryValues((prev) =>
        prev.filter((value) => value !== option.value)
      );
    } else {
      // 선택되지 않은 경우, 추가
      setSelectedCountries((prev) => [...prev, option]);

      // 하이라이트에도 추가
      setActiveCountryValues((prev) => [...prev, option.value]);
    }
  };

  // 필터 삭제 핸들러
  const handleRemoveFilter = (
    type: "field" | "country",
    optionToRemove: JobPostSearchFilterOption
  ) => {
    if (type === "field") {
      // 선택 목록에서 제거
      setSelectedFields((prev) =>
        prev.filter(
          (option) =>
            option.value !== optionToRemove.value &&
            option.label !== optionToRemove.label
        )
      );

      // 하이라이트에서도 제거
      setActiveFieldValues((prev) =>
        prev.filter((value) => value !== optionToRemove.value)
      );
    } else {
      // 선택 목록에서 제거
      setSelectedCountries((prev) =>
        prev.filter(
          (option) =>
            option.value !== optionToRemove.value &&
            option.label !== optionToRemove.label
        )
      );

      // 하이라이트에서도 제거
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

    // 하이라이트 초기화
    setActiveFieldValues([]);
    setActiveCountryValues([]);

    const newQueryParams = new URLSearchParams();
    navigate({ search: newQueryParams.toString() });

    fetchAcceptList(1);
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
    fetchAcceptList(1);

    if (
      searchKeyword ||
      selectedFields.length > 0 ||
      selectedCountries.length > 0
    ) {
      setIsSearched(true);
    } else {
      setIsSearched(false);
    }
  };

  // 페이지네이션 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="mobileAccept_container">
      <MetaTagHelmet title="합격자소서" description="합격자소서" />
      <MobileMainHeader />
      <h2>합격자소서</h2>
      <section className="contentSection">
        <p className="count">총 {totalElements}건</p>
        <ul>
          {acceptList.map((i) => (
            <li key={i.resumeId}>
              <Link to={`/m/accept/view?id=${i.resumeId}`}>
                <div className="headers">
                  <div className="logo">
                    <img
                      src={i.jobPost.company.corpLogoUrl}
                      onError={(e) => {
                        e.currentTarget.src = "/img/logo.png";
                      }}
                    />
                  </div>
                  <p>{i.jobPost.company.companyName}</p>
                </div>
                <div className="bodys">
                  <p className="title">
                    Q. {i.questionAnswers[0]?.questionText}
                  </p>
                  <p
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "normal",
                    }}
                  >
                    A. {i.questionAnswers[0]?.answerText}
                  </p>
                </div>
                <p className="foot">
                  {i.jobPost.postPeriod} | {i.jobPost.careerLevel} |{" "}
                  {i.jobPost.jobTitle}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
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
      <div className="bbsSearch bbsSearch_area">
        {/* <SearchSelectBox
          value={searchType}
          onChange={setSearchType}
          options={searchOptions}
        /> */}
        <div className="searchbox">
          <div className="search_box" style={{ width: "100%" }}>
            <input
              type="search"
              className="form-control search_form"
              placeholder="검색어를 입력하세요."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyUp={(e) => e.key === "Enter" && handleSearch()}
              style={{}}
            />
          </div>
          <button className="searchbtn" onClick={handleSearch}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>
      <MainFooter />
    </div>
  );
}
