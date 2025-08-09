import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import PostingPagination from "../common/PostingPagination";
import SearchSelectBox from "../common/SearchSelectBox";
import { formatDate } from "../../utils/dateUtils";
import { getCommaSeparatedNumber } from "../../utils/numberUtils";
import { axiosInstance } from "../../api/axios";
import "./BbsList.css";
import { categoryIdMap, categoryMap } from "../../constants/category";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

interface BbsProps {
  id: number;
  categoryId: number;
  subTitle: string;
  title: string;
  writer: string;
  date: string;
  views: string;
  likes: string;
  commentCount: number;
  isNotice?: boolean;
  isMine?: boolean;
}

interface SearchParamsCommunityPost {
  category: string;
  keyword: string;
  type: string;
}

const searchOptions = [
  { value: "title", label: "제목" },
  { value: "content", label: "내용" },
  { value: "title+content", label: "제목+내용" },
  { value: "writer", label: "글쓴이" },
];

const BbsList: React.FC = () => {
  const userId = sessionStorage.getItem("userId");
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get("category") || "all";
  const initialSearchType = queryParams.get("type") || "title";
  const initialKeyword = queryParams.get("keyword") || "";
  const initialPage = parseInt(queryParams.get("page") || "1");
  const { subTitle, description } = categoryMap[category] || categoryMap["all"];

  const [bbsList, setBbsList] = useState<BbsProps[]>([]);
  const [size] = useState(10);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchType, setSearchType] = useState(initialSearchType);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [isSearched, setIsSearched] = useState(!!initialKeyword);

  const searchParams: SearchParamsCommunityPost = {
    category,
    keyword,
    type: searchType,
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const newQueryParams = new URLSearchParams(location.search);
    newQueryParams.set("page", page.toString());
    navigate({ search: newQueryParams.toString() });
    fetchUserCommunity(searchParams, page, size);
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
          commentCount: post.commentCount,
          isNotice: post.isNotice,
          isMine: post.isMine,
        })
      );

      setBbsList(mappedBbsList);
      setCurrentPage(response.data.currentPage);
      setTotalElements(response.data.totalElements);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("게시글 목록을 불러오는데 실패했습니다:", error);
    }
  };

  const handleSearch = () => {
    const newQueryParams = new URLSearchParams(location.search);
    newQueryParams.set("type", searchType);
    newQueryParams.set("keyword", keyword);
    newQueryParams.set("page", "1");
    navigate({ search: newQueryParams.toString() });
    setCurrentPage(1);
    fetchUserCommunity(searchParams, 1, size);
    setIsSearched(!!keyword);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      axiosInstance
        .delete(`/api/v1/community/posts/${id}`)
        .then(() => {
          fetchUserCommunity(searchParams, currentPage, size);
        })
        .catch((error) => {
          console.error("게시글 삭제에 실패했습니다:", error);
          alert("게시글 삭제에 실패했습니다. 다시 시도해주세요.");
        });
    }
  };

  useEffect(() => {
    fetchUserCommunity(searchParams, currentPage, size);
  }, [category]);

  useEffect(() => {
    if (initialKeyword) {
      fetchUserCommunity(searchParams, currentPage, size);
    }
  }, []);
  const startNo = totalElements - (currentPage - 1) * size;
  return (
    <Layout>
      <MetaTagHelmet title="유학생 게시판" description="유학생 게시판" />
      <div className="container-center-horizontal">
        <div className="jobpost screen">
          <div className="container">
            <div className="flex-con">
              <div className="sidebar item_start">
                <div className="sidebar-title">유학생 게시판</div>
                <ul className="snb-list mb2">
                  {Object.keys(categoryMap).map((key) => (
                    <li key={key}>
                      <Link
                        to={`/community/bbslist?category=${key}`}
                        className={`item_start ${
                          category === key ? "active" : ""
                        }`}
                        onClick={() => {
                          if (category !== key) {
                            setSearchType("title");
                            setKeyword("");
                            setCurrentPage(1);
                            setTotalPages(1);
                            setBbsList([]);
                          }
                        }}
                      >
                        {categoryMap[key].subTitle}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="sidebar-title">멘토링</div>
                <ul className="snb-list">
                  <li>
                    <Link to="/community/mentolist" className="item_start">
                      대기업 인사담당자 Q&A
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="flex-col">
                <div className="pageTitle">
                  <div className="conTitle">
                    <div className="titDetailSch">유학생 게시판</div>
                    <div className="subtit">
                      <span className="line">{subTitle}</span>
                      <span>{description}</span>
                    </div>
                  </div>
                  <div className="TitleBtn">
                    <button
                      type="button"
                      onClick={() => {
                        if (userId) {
                          window.location.href =
                            "/community/bbswrite?category=" + category;
                        } else {
                          alert("로그인해 주세요.");
                          navigate("/member/userlogin");
                        }
                      }}
                    >
                      글쓰기
                    </button>
                  </div>
                </div>

                <div
                  className="bbstable table-list"
                  style={{ minHeight: "500px" }}
                >
                  <table>
                    <colgroup>
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "11%" }} />
                      <col />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "8%" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>번호</th>
                        <th>게시판명</th>
                        <th>제목</th>
                        <th>글쓴이</th>
                        <th>등록일</th>
                        <th>조회</th>
                        <th>추천</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* loop start */}
                      {bbsList.length === 0 && (
                        <tr>
                          <td colSpan={6} className="cell-default">
                            <div className="txt ellipsis2">
                              {isSearched ? "검색 결과가 없습니다." : ""}
                            </div>
                          </td>
                        </tr>
                      )}
                      {bbsList.map((post, idx) => (
                        <tr
                          key={post.id}
                          className={post.isNotice ? "notice" : ""}
                        >
                          <td className="cell-default">{startNo - idx}</td>
                          <td className="cell-default">{post.subTitle}</td>
                          <td className="cell-subject">
                            <Link
                              to={`/community/bbsview/${post.id}?category=${
                                categoryIdMap[post.categoryId]
                              }`}
                              className="ellipsis"
                            >
                              {post.title}
                              <span className="comment-count">
                                {post.commentCount > 0 &&
                                  ` (${post.commentCount})`}
                              </span>
                            </Link>
                            {/* {post.isMine && (
                              <div className="post-actions">
                                <button
                                  className="edit-btn"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigate(
                                      `/community/bbswrite/${
                                        post.id
                                      }?category=${
                                        categoryIdMap[post.categoryId]
                                      }`,
                                    );
                                  }}
                                >
                                  <i className="fa-solid fa-pen"></i>
                                </button>
                                <button
                                  className="delete-btn"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleDelete(post.id);
                                  }}
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </div>
                            )} */}
                          </td>
                          <td className="cell-default">
                            <span
                              // className={post.isMine ? "my-post" : ""}
                              style={{ textWrap: "nowrap" }}
                            >
                              {post.writer}
                              {/* {post.isMine && (
                                <i className="fa-solid fa-user-check"></i>
                              )} */}
                            </span>
                          </td>
                          <td className="cell-default">{post.date}</td>
                          <td className="cell-default">{post.views}</td>
                          <td className="cell-default">{post.likes}</td>
                        </tr>
                      ))}
                      {/* loop end */}
                    </tbody>
                  </table>
                </div>

                {/* page */}
                <PostingPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
                {/* page end */}

                <div className="bbsSearch bbsSearch_area">
                  <SearchSelectBox
                    value={searchType}
                    onChange={setSearchType}
                    options={searchOptions}
                  />

                  <div className="searchbox">
                    <div className="search_box">
                      <input
                        type="search"
                        id="s_keyword"
                        name="s_keyword"
                        className="form-control search_form"
                        placeholder="검색어를 입력하세요."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyUp={(e) => e.key === "Enter" && handleSearch()}
                      />
                    </div>
                    <button
                      type="button"
                      className="searchbtn"
                      onClick={handleSearch}
                    >
                      <i className="fa-solid fa-magnifying-glass"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BbsList;
