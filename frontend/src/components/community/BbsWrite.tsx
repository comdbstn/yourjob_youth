import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import Layout from "../layout/Layout";
import { axiosInstance } from "../../api/axios";
import { categoryMap } from "../../constants/category";
import "../../../public/css/jobpost.css";
import "../../../public/css/nice-select.css";
import SearchSelectBox from "../common/SearchSelectBox";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const countryOptions = [
  { value: "america", label: "미주" },
  { value: "europe", label: "유럽" },
  { value: "asia", label: "아시아" },
  { value: "oceania", label: "오세아니아" },
  { value: "other", label: "기타" },
];

const BbsWrite: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get("category") || "all";
  const country =
    countryOptions.find((option) => option.value === category)?.value ||
    "america";
  const fromViewPage = queryParams.get("view") === "true";

  const [formData, setFormData] = useState({
    category: country,
    title: "",
    content: "",
  });

  useEffect(() => {
    // 1) 수정 모드일 때만 실행: id가 바뀔 때만
    if (!id) return;
    const fetchPost = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/v1/community/posts/${id}`
        );
        const post = response.data;
        setFormData({
          category: post.category || country,
          title: post.title,
          content: post.content,
        });
      } catch (error) {
        console.error("게시글 로드에 실패했습니다:", error);
        alert("게시글을 불러오는데 실패했습니다.");
        navigate(`/community/bbslist?category=${country}`);
      }
    };
    fetchPost();
  }, [id, navigate, country]);

  useEffect(() => {
    // 2) 등록 모드(마운트)시에만 실행
    if (id) return;
    setFormData({
      category: country,
      title: formData.title, // 기존 title 유지
      content: formData.content, // 기존 content 유지
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!formData.content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    if (!formData.category) {
      alert("지역을 선택해주세요.");
      return;
    }

    try {
      if (id) {
        // 수정 모드
        await axiosInstance.put(`/api/v1/community/posts/${id}`, {
          title: formData.title,
          content: formData.content,
          category: formData.category,
        });
      } else {
        // 등록 모드
        await axiosInstance.post("/api/v1/community/posts", {
          title: formData.title,
          content: formData.content,
          category: formData.category,
        });
      }

      if (fromViewPage) {
        navigate(`/community/bbsview/${id}?category=${formData.category}`);
      } else {
        navigate(`/community/bbslist?category=${formData.category}`);
      }
    } catch (error) {
      console.error("게시글 저장에 실패했습니다:", error);
      alert("게시글 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleCancel = () => {
    navigate(`/community/bbslist?category=${category}`);
  };
  const { subTitle, description } = categoryMap[category] || categoryMap["all"];
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

              {/* bbsWrite */}
              <div className="flex-col">
                <div className="pageTitle">
                  <div className="conTitle">
                    <div className="titDetailSch">유학생 게시판</div>
                    <div className="subtit">
                      <span className="line">{subTitle}</span>
                      <span>{description}</span>
                    </div>
                  </div>
                </div>

                <div className="writeForm">
                  <div style={{ position: "relative", width: "230px" }}>
                    <SearchSelectBox
                      value={formData.category}
                      onChange={(value) => {
                        // 폼 상태 업데이트
                        setFormData((prev) => ({ ...prev, category: value }));
                        // URL 쿼리스트링 변경
                        navigate(`/community/bbswrite?category=${value}`, {
                          replace: true,
                        });
                      }}
                      options={countryOptions}
                      style={{
                        height: "60px",
                        width: "100%",
                        textAlign: "left",
                        paddingLeft: "18px",
                        paddingRight: "30px", // 여백 확보
                        alignContent: "center",
                        borderRadius: "20px",
                        appearance: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        outline: "none",
                      }}
                    />
                  </div>

                  <input
                    type="text"
                    name="title"
                    className="form-control formfild bbs_subject"
                    placeholder="제목을 입력해 주세요."
                    value={formData.title}
                    onChange={handleInputChange}
                  />

                  <textarea
                    name="content"
                    className="form-control formfild"
                    placeholder="내용을 입력하세요."
                    value={formData.content}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="bbsBtn">
                  <button
                    type="button"
                    className="submitBtn"
                    onClick={handleSubmit}
                  >
                    등록
                  </button>
                  <button
                    type="button"
                    className="cancelBtn"
                    onClick={handleCancel}
                  >
                    취소
                  </button>
                </div>
              </div>
              {/* bbsview end */}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BbsWrite;
