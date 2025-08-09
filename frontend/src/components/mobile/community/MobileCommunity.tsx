import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MobileCommunityHeader from "../components/CommunityHeader/CommunityHeader";
import MainFooter from "../components/MainFooter/MainFooter";
import PostingPagination from "../../common/PostingPagination";
import { axiosInstance } from "../../../api/axios";
import { formatDate } from "../../../utils/dateUtils";
import { getCommaSeparatedNumber } from "../../../utils/numberUtils";
import { categoryIdMap } from "../../../constants/category";
import "./MobileCommunity.css";
import { SearchParamsCommunityPost } from "../../../app/dummy/userCommunity";
import { MetaTagHelmet } from "../../common/MetaTagHelmet";

interface BbsProps {
  id: number;
  categoryId: number;
  subTitle: string;
  title: string;
  writer: string;
  date: string;
  views: string;
  likes: string;
  isNotice?: boolean;
  isMine?: boolean;
  commentCount: number;
}

interface MentorProps {
  id: number;
  subTitle: string;
  title: string;
  writer: string;
  date: string;
  views: string;
  isNotice?: boolean;
  commentCount: number;
}

interface SearchParams {
  category: string;
  keyword: string;
  type: string;
}

const countryTabs = [
  { key: "all", label: "전체글" },
  { key: "america", label: "미주" },
  { key: "europe", label: "유럽" },
  { key: "asia", label: "아시아" },
  { key: "oceania", label: "오세아니아" },
  { key: "other", label: "기타" },
];

export default function MobileCommunity() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const [size] = useState(10);
  const category = queryParams.get("category") || "all";
  const isMentor = queryParams.get("isMentor") || "";
  const initialSearchType = queryParams.get("type") || "title";
  const initialKeyword = queryParams.get("keyword") || "";
  const initialPage = parseInt(queryParams.get("page") || "1", 10);

  const userId = sessionStorage.getItem("userId");

  const [bbsList, setBbsList] = useState<BbsProps[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [searchType, setSearchType] = useState<string>(initialSearchType);
  const [keyword, setKeyword] = useState<string>(initialKeyword);
  const pageSize = 10;

  const [mentoList, setMentoList] = useState<MentorProps[]>([]);

  const [selectedTab, setSelectedTab] = useState<"student" | "mentoring">(
    isMentor ? "mentoring" : "student"
  );

  useEffect(() => {
    if (isMentor === "true") {
      setSelectedTab("mentoring");
    }
  }, [isMentor]);
  const searchParams: SearchParams = {
    category,
    type: searchType,
    keyword,
  };

  const fetchUserCommunity = async (
    searchParams: SearchParamsCommunityPost,
    page: number,
    size: number
  ) => {
    try {
      const response = await axiosInstance.get("/api/v1/community/posts", {
        params: {
          country: searchParams.category,
          searchType: searchParams.type,
          query: searchParams.keyword,
          page,
          size,
        },
      });

      const mappedBbsList: BbsProps[] = response.data.posts.map(
        (post: any) => ({
          categoryId: post.categoryId,
          id: post.id,
          subTitle: (function () {
            switch (post.categoryId) {
              case 1:
                return "미주";
              case 2:
                return "유럽";
              case 3:
                return "아시아";
              case 4:
                return "오세아니아";
              case 5:
                return "기타";
              default:
                return "";
            }
          })(),
          title: post.title,
          writer: post.writer,
          date: formatDate(new Date(post.date), "YY.MM.DD"),
          views: getCommaSeparatedNumber(post.views),
          likes: getCommaSeparatedNumber(post.likes),
          isNotice: post.isNotice,
          commentCount: post.commentCount,
          isMine: post.isMine,
        })
      );

      setBbsList(mappedBbsList);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("게시글 목록을 불러오는데 실패했습니다:", error);
    }
  };

  // Fetch mentor posts
  const fetchMentors = async (params: SearchParams, page: number) => {
    try {
      const resp = await axiosInstance.get("/api/v1/community/mento/posts", {
        params: {
          country: params.category,
          searchType: params.type,
          query: params.keyword,
          page,
          size: pageSize,
        },
      });
      const mapped = resp.data.posts.map((post: any) => ({
        id: post.id,
        subTitle: post.subTitle,
        title: post.title,
        writer: post.writer,
        date: formatDate(new Date(post.date), "YY.MM.DD"),
        views: getCommaSeparatedNumber(post.views),
        isNotice: post.isNotice,
        commentCount: post.commentCount,
      }));
      setMentoList(mapped);
      setCurrentPage(resp.data.currentPage);
      setTotalPages(resp.data.totalPages);
    } catch (e) {
      console.error("Failed to fetch mentor posts:", e);
    }
  };

  // Handle page change for pagination
  const handlePageChange = (page: number) => {
    const qp = new URLSearchParams(location.search);
    qp.set("page", page.toString());
    navigate({ search: qp.toString() });
    setCurrentPage(page);
  };

  // Handle search confirm
  const handleSearch = () => {
    const qp = new URLSearchParams(location.search);
    qp.set("type", searchType);
    qp.set("keyword", keyword);
    qp.set("page", "1");
    navigate({ search: qp.toString() });
    setCurrentPage(1);
    fetchUserCommunity(searchParams, currentPage, size);
  };

  // When category, page, searchType, keyword or tab changes, refetch
  useEffect(() => {
    if (selectedTab === "student") {
      fetchUserCommunity(searchParams, currentPage, size);
    } else {
      fetchMentors(searchParams, currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, currentPage, searchType, selectedTab]);

  return (
    <div className="mobileCommunity_Container">
      <MetaTagHelmet title="커뮤니티" description="커뮤니티" />
      <MobileCommunityHeader />
      {/* Main toggle: Student vs Mentoring */}
      <div className="topBtns">
        <button
          className={selectedTab === "student" ? "selected" : ""}
          onClick={() => {
            setSelectedTab("student");
            navigate({
              search: `?category=${category}&page=1&type=${searchType}&keyword=${keyword}`,
            });
          }}
        >
          <span>유학생</span>
        </button>
        <button
          className={selectedTab === "mentoring" ? "selected" : ""}
          onClick={() => {
            setSelectedTab("mentoring");
            navigate({
              search: `?category=${category}&page=1&type=${searchType}&keyword=${keyword}`,
            });
          }}
        >
          <span>멘토링</span>
        </button>
      </div>

      {selectedTab === "student" && (
        <>
          {/* Country filter tabs */}
          <div className="countryBtns community">
            <div className="btn-area">
              {countryTabs.map((tab) => (
                <button
                  key={tab.key}
                  className={category === tab.key ? "selected" : ""}
                  onClick={() => {
                    const qp = new URLSearchParams(location.search);
                    qp.set("category", tab.key);
                    qp.set("page", "1");
                    navigate({ search: qp.toString() });
                  }}
                  style={{ textWrap: "nowrap" }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                if (userId) navigate("/m/community/writeBoard");
                else {
                  alert("로그인해 주세요");
                  navigate("/m/member/userLogin");
                }
              }}
              className="btn-write"
            >
              <img src="/img/mobile/pencil.png" alt="글쓰기" />
            </button>
          </div>

          {/* Community post list */}
          <ul>
            {bbsList.map((item) => (
              <Link
                key={item.id}
                to={`/m/community/view?id=${item.id}&category=${
                  categoryIdMap[item.categoryId]
                }`}
              >
                <li>
                  <p className="subtitle">{item.subTitle}</p>
                  <div className="flexJb title-box">
                    <p>{item.title}</p>
                    <div className="flexGap10 comment-box">
                      <img
                        src="/img/mobile/chatBox.png"
                        width={16}
                        height={16}
                        alt="댓글"
                      />
                      <p>{item.commentCount ?? 0}</p>
                    </div>
                  </div>
                  <p className="writeInfo">
                    {item.writer}
                    <span className="bar"></span>
                    {item.date}
                    <span className="bar"></span>조회 {item.views}
                    <span className="bar"></span>추천 {item.likes}
                  </p>
                </li>
              </Link>
            ))}
          </ul>
        </>
      )}

      {selectedTab === "mentoring" && (
        <>
          {/* Mentor Q&A header */}
          <div className="mentoringSection">
            <div className="headers">
              <p>대기업 인사담당자Q&A</p>
              <button
                onClick={() => {
                  if (userId)
                    navigate(
                      "/m/community/writeBoard?gbn=mentor&isMentor=true"
                    );
                  else {
                    alert("로그인해 주세요");
                    navigate("/m/member/userLogin");
                  }
                }}
              >
                <img src="/img/mobile/pencil.png" alt="글쓰기" />
              </button>
            </div>
            <ul>
              {mentoList.map((item) => (
                <Link
                  key={item.id}
                  to={`/m/community/view?id=${item.id}&gbn=mentor&isMentor=true`}
                >
                  <li>
                    <p className="subtitle">
                      멘토링<span className="bar"></span>
                      {item.subTitle}
                    </p>
                    <div className="flexJb">
                      <p>{item.title}</p>
                      <div className="flexGap10 comment-box">
                        <img
                          src="/img/mobile/chatBox.png"
                          width={16}
                          height={16}
                          alt="댓글"
                        />
                        <p>{item.commentCount ?? 0}</p>
                      </div>
                    </div>
                    <p className="writeInfo">
                      {item.writer}
                      <span className="bar"></span>
                      {item.date}
                      <span className="bar"></span>조회 {item.views}
                    </p>
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Pagination */}
      <PostingPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Search area */}
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
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
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
