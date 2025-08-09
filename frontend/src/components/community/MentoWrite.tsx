import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import Layout from "../layout/Layout";
import { axiosInstance } from "../../api/axios";
import "../../../public/css/jobpost.css";
import "../../../public/css/nice-select.css";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const MentoWrite: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const queryParams = new URLSearchParams(location.search);
  const fromViewPage = queryParams.get("view") === "true";

  const [formData, setFormData] = useState({
    companyName: "",
    title: "",
    content: "",
  });

  useEffect(() => {
    if (id) {
      // 게시글 수정 모드일 경우 기존 데이터 로드
      const fetchPost = async () => {
        try {
          const response = await axiosInstance.get(
            `/api/v1/community/mento/posts/${id}`
          );
          const post = response.data;
          setFormData({
            companyName: post.companyName || "",
            title: post.title,
            content: post.content,
          });
        } catch (error) {
          console.error("게시글 로드에 실패했습니다:", error);
          alert("게시글을 불러오는데 실패했습니다.");
          navigate("/community/mentolist");
        }
      };
      fetchPost();
    } else {
      setFormData({
        companyName: "",
        title: "",
        content: "",
      });
    }
  }, [id, navigate]);

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
    try {
      /*if (!formData.company) {
        alert('기업명을 선택해주세요.');
        return;
      }*/
      if (!formData.title.trim()) {
        alert("제목을 입력해주세요.");
        return;
      }
      if (!formData.content.trim()) {
        alert("내용을 입력해주세요.");
        return;
      }

      if (id) {
        // 수정 모드
        await axiosInstance.put(`/api/v1/community/mento/posts/${id}`, {
          companyName: formData.companyName,
          title: formData.title,
          content: formData.content,
        });
      } else {
        // 등록 모드
        await axiosInstance.post("/api/v1/community/mento/posts", {
          companyName: formData.companyName,
          title: formData.title,
          content: formData.content,
        });
      }

      if (fromViewPage) {
        navigate(`/community/mentoview/${id}?view=true`);
      } else {
        navigate("/community/mentolist");
      }
    } catch (error) {
      console.error("게시글 작성에 실패했습니다:", error);
      alert("게시글 작성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleCancel = () => {
    if (id && fromViewPage) {
      navigate(`/community/mentoview/${id}`);
    } else {
      navigate("/community/mentolist");
    }
  };

  return (
    <Layout>
      <MetaTagHelmet title="멘토링" description="대기업 인사담당자 Q&A" />
      <div className="container-center-horizontal">
        <div className="jobpost screen">
          <div className="container">
            <div className="flex-con">
              <div className="sidebar item_start">
                <div className="sidebar-title">유학생 게시판</div>
                <ul className="snb-list mb2">
                  <li>
                    <Link
                      to="/community/bbslist?category=all"
                      className="item_start"
                    >
                      전체글
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/community/bbslist?category=america"
                      className="item_start"
                    >
                      미주
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/community/bbslist?category=europe"
                      className="item_start"
                    >
                      유럽
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/community/bbslist?category=asia"
                      className="item_start"
                    >
                      아시아
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/community/bbslist?category=oceania"
                      className="item_start"
                    >
                      오세아니아
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/community/bbslist?category=other"
                      className="item_start"
                    >
                      기타
                    </Link>
                  </li>
                </ul>
                <div className="sidebar-title">멘토링</div>
                <ul className="snb-list">
                  <li>
                    <Link
                      to="/community/mentolist"
                      className="item_start active"
                    >
                      대기업 인사담당자 Q&A
                    </Link>
                  </li>
                </ul>
              </div>

              {/* bbsWrite */}
              <div className="flex-col">
                <div className="pageTitle">
                  <div className="conTitle">
                    <div className="titDetailSch">멘토링</div>
                    <div className="subtit">
                      <span>대기업 인사담당자 Q&A</span>
                    </div>
                  </div>
                </div>

                <div className="writeForm">
                  {/*<select
                        name="category"
                        className="form-control formselect"
                        value="대기업 인사담당자 Q&A"
                        onChange={handleInputChange}
                        style={{
                          width: '300px',
                          textAlign: 'left',
                          paddingLeft: '10px'
                        }}
                    >
                      <option value="대기업 인사담당자 Q&A">대기업 인사담당자 Q&A</option>
                    </select>*/}

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
                    {id ? "수정" : "등록"}
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

export default MentoWrite;
