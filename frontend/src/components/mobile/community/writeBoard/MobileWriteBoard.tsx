import { useEffect, useState } from "react";
import MobileCommunityHeader from "../../components/CommunityHeader/CommunityHeader";
import "./MobileWriteBoard.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../../../api/axios";
import MainFooter from "../../components/MainFooter/MainFooter";
import { MetaTagHelmet } from "../../../common/MetaTagHelmet";

const categoryMap: {
  [key: string]: { subTitle: string; description: string };
} = {
  all: { subTitle: "전체글", description: "모든 게시글을 확인하세요" },
  america: { subTitle: "미주", description: "미주 지역 유학생들의 이야기" },
  europe: { subTitle: "유럽", description: "유럽 지역 유학생들의 이야기" },
  asia: { subTitle: "아시아", description: "아시아 지역 유학생들의 이야기" },
  oceania: {
    subTitle: "오세아니아",
    description: "오세아니아 지역 유학생들의 이야기",
  },
  other: { subTitle: "기타", description: "기타 지역 유학생들의 이야기" },
};
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>;

export default function MobileWriteBoard() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isMentor = queryParams.get("isMentor") || "";
  const userId = sessionStorage.getItem("userId");
  const [selectedTab, setSelectedTab] = useState(
    isMentor ? "mentoring" : "student"
  );

  const navigate = useNavigate();
  const category = queryParams.get("category") || "america";
  const id = queryParams.get("id");

  const fromViewPage = queryParams.get("view") === "true";

  const [formData, setFormData] = useState({
    category: category,
    title: "",
    content: "",
  });

  useEffect(() => {
    if (id) {
      // 게시글 수정 모드일 경우 기존 데이터 로드
      const fetchPost = async () => {
        try {
          const response = await axiosInstance.get(
            `/api/v1/community/posts/${id}`
          );
          const post = response.data;
          setFormData({
            category: post.category || category,
            title: post.title,
            content: post.content,
          });
        } catch (error) {
          console.error("게시글 로드에 실패했습니다:", error);
          alert("게시글을 불러오는데 실패했습니다.");
          navigate(`/community/bbslist?category=${category}`);
        }
      };
      fetchPost();
    } else {
      setFormData({
        category: category,
        title: "",
        content: "",
      });
    }
  }, [id, category, navigate]);

  useEffect(() => {
    setFormData({
      category: category,
      title: "",
      content: "",
    });
  }, [selectedTab]);

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
        navigate(`/m/community`);
      } else {
        navigate(`/m/community`);
      }
    } catch (error) {
      console.error("게시글 저장에 실패했습니다:", error);
      alert("게시글 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleCancel = () => {
    if (selectedTab === "student") {
      navigate(`/m/community`);
    } else {
      navigate(`/m/community?gbn=mentor&isMentor=true`);
    }
  };
  const [selectedCategory, setSelectedCategory] = useState(category);

  const handleCategoryClick = (cat: string) => {
    // (추가)
    setSelectedCategory(cat);
    navigate(`/m/community?category=${cat}`);
  };

  return (
    <div className="MobileWriteBoard_container">
      <MetaTagHelmet title="커뮤니티" description="커뮤니티" />
      <MobileCommunityHeader />
      <div className="topBtns">
        {/* 버튼 클릭 시 setSelectedTab 변경 */}
        <button
          className={selectedTab === "student" ? "selected" : ""}
          // onClick={() => setSelectedTab("student")}
          onClick={() => navigate("/m/community")}
        >
          <span>유학생</span>
        </button>
        <button
          className={selectedTab === "mentoring" ? "selected" : ""}
          // onClick={() => setSelectedTab("mentoring")}
          onClick={() =>
            navigate(
              "/m/community?category=all&page=1&type=title&keyword=&isMentor=true"
            )
          }
        >
          <span>멘토링</span>
        </button>
      </div>
      <div className="countryBtns">
        <div
          className={`btn-area ${selectedTab === "mentoring" ? "mentor" : ""}`}
        >
          {selectedTab === "student" ? (
            <>
              {Object.entries(categoryMap).map(([key, { subTitle }]) => (
                <button
                  key={key}
                  className={selectedCategory === key ? "selected" : ""}
                  onClick={() => handleCategoryClick(key)}
                >
                  {subTitle}
                </button>
              ))}
              <button
                onClick={() => {
                  if (userId) navigate("/m/community/writeBoard");
                  else {
                    alert("로그인해 주세요");
                    navigate("/m/member/userLogin");
                  }
                }}
              >
                <img src="/img/mobile/pencil.png" alt="pencil icon" />
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
      <section className="inputSection">
        {selectedTab === "student" && (
          <div className="input_default">
            <select
              name="category"
              className="w-full"
              value={formData.category}
              onChange={handleInputChange}
            >
              {/* <option value="all">전체글</option> */}
              <option value="america">미주</option>
              <option value="europe">유럽</option>
              <option value="asia">아시아</option>
              <option value="oceania">오세아니아</option>
              <option value="other">기타</option>
            </select>
          </div>
        )}
        <div className="input_default" style={{ height: "89px" }}>
          <input
            name="title"
            placeholder="제목을 입력해주세요."
            value={formData.title}
            onChange={handleInputChange}
          />
        </div>
        <div className="input_default contentInput">
          <textarea
            name="content"
            placeholder="내용을 입력해주세요."
            className="contentInput"
            value={formData.content}
            onChange={handleInputChange}
          ></textarea>
        </div>
      </section>
      <div className="flexGap10 pl-20 pr-20 btn-write-area">
        <button className="blueBtn" onClick={handleSubmit}>
          등록
        </button>
        <button className="blueBtn" onClick={handleCancel}>
          취소
        </button>
      </div>
      <MainFooter />
    </div>
  );
}
