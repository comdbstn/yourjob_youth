import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import PostingPagination from "../common/PostingPagination";
import { formatDate } from "../../utils/dateUtils";
import { getCommaSeparatedNumber } from "../../utils/numberUtils";
import "../../../public/css/mypage.css";
import { axiosInstance } from "../../api/axios";
import { ResumeItem, ResumePage } from "../../types/resume";
import { useAlert } from "../../contexts/AlertContext";
import { userApi } from "../../api/user";
import { UpdateUserProfileRequest } from "../../types/user";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

const menuItems = [
  { path: "/mypage", label: "홈", isActive: false },
  { path: "/mypage/resume", label: "이력서 관리", isActive: true },
  { path: "/mypage/proposal", label: "받은 포지션 제안", isActive: false },
  { path: "/mypage/apply", label: "지원현황", isActive: false },
  { path: "/mypage/scrap", label: "스크랩", isActive: false },
];

const Resume: React.FC = () => {
  const navigate = useNavigate();
  const [resumeList, setResumeList] = useState<ResumeItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 4;
  const { customAlert, customConfirm } = useAlert();

  // --- 1) 사용자 프로필을 불러와서 상태에 저장
  const [formData, setFormData] = useState<UpdateUserProfileRequest>({
    name: "",
    englishName: "",
    birth: "",
    nationality: "",
    visa: [],
    email: "",
    phone: "",
    address: "",
    address_detail: "",
    zip_code: "",
    gender: "M",
    profileImage: "",
  });

  const fetchUserProfile = async () => {
    try {
      const data = await userApi.getUserProfile();
      setFormData({
        ...data,
        visa: data.visa ? [...data.visa] : [],
      });
    } catch (error) {
      console.error("사용자 프로필 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // --- 2) 이력서 리스트를 불러오는 함수
  const fetchResumeList = async (page: number) => {
    try {
      const response = await axiosInstance.get<ResumePage>("/api/v1/resumes", {
        params: {
          page: page,
          size: PAGE_SIZE,
        },
      });

      const { content, totalPages, totalElements } = response.data;

      const mappedResumeList = content.map((item: ResumeItem) => ({
        id: item.id,
        title: item.title,
        date: formatDate(new Date(item.date), "YY.MM.DD"),
        status: item.status,
        isPublic: item.isPublic,
      }));

      setResumeList(mappedResumeList);
      setTotalPages(totalPages);
      setTotalElements(totalElements);
    } catch (error) {
      console.error("이력서 목록 조회 실패:", error);
      customAlert({
        content: "이력서 목록을 불러오는데 실패했습니다.",
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchResumeList(page);
  };

  useEffect(() => {
    fetchResumeList(1);
  }, []);

  // --- 3) “이력서 작성” 버튼을 눌렀을 때 프로필 필수값 검사 후 이동
  const handleNewResume = () => {
    const { phone, englishName, address, email, nationality } = formData;

    // null, undefined, 공백 모두 체크
    const isEmpty = (value: string | null | undefined): boolean =>
      value === null || value === undefined || String(value).trim() === "";

    if (
      isEmpty(phone) ||
      isEmpty(englishName) ||
      isEmpty(address) ||
      isEmpty(email) ||
      isEmpty(nationality)
    ) {
      customAlert({
        content: "휴대폰, 영문이름, 주소, 이메일, 국적을 모두 입력해주세요.",
        onConfirm: () => {
          navigate("/mypage/profile");
        },
      });
      return;
    }

    navigate("/mypage/resume/write");
  };

  // --- 4) 나머지 버튼 핸들러들 (수정·삭제·공개 토글 등)
  const handleResumeEdit = (id: number) => {
    navigate(`/mypage/resume/write/${id}`);
  };

  const handleResumeCopy = (id: number) => {
    navigate(`/mypage/resume/write/${id}?gbn=copy`);
  };

  const handleResumeDelete = async (id: number) => {
    if (
      await customConfirm({
        content: "이력서를 삭제하시겠습니까?",
        confirmLabel: "삭제",
        cancelLabel: "취소",
      })
    ) {
      try {
        const response = await axiosInstance.delete(`/api/v1/resumes/${id}`);
        if (response.status === 200) {
          customAlert({
            content: "이력서가 삭제되었습니다.",
          });
          fetchResumeList(currentPage);
        }
      } catch (error) {
        console.error("이력서 삭제 실패:", error);
        customAlert({
          content: "이력서 삭제에 실패했습니다.",
        });
      }
    }
  };

  const handleTogglePublic = async (id: number, currentIsPublic: boolean) => {
    try {
      const response = await axiosInstance.patch(
        `/api/v1/resumes/${id}/public`,
        {
          isPublic: !currentIsPublic,
        }
      );

      if (response.status === 200) {
        setResumeList((prevList) =>
          prevList.map((item) =>
            item.id === id ? { ...item, isPublic: !currentIsPublic } : item
          )
        );
        customAlert({
          content: `이력서의 개인 정보가 ${
            !currentIsPublic ? "공개" : "비공개"
          }로 변경되었습니다.`,
        });
      }
    } catch (error) {
      console.error("이력서 개인 정보 공개 상태 변경 실패:", error);
      customAlert({
        content: "이력서 개인 정보 공개 상태 변경에 실패했습니다.",
      });
    }
  };

  return (
    <Layout>
      <MetaTagHelmet title="이력서 관리" description="이력서 관리" />
      <div className="container-center-horizontal">
        <div className="mypage screen">
          <div className="container">
            <div className="flex-con">
              <div className="sidebar item_start">
                <ul className="snb-list mb2">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        to={item.path}
                        className={`menu_font01 ${
                          item.isActive ? "active" : ""
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex-col">
                <div className="pageTitle">
                  <div className="conTitle">
                    <div className="titDetailSch">이력서 관리</div>
                    <div className="subtit">
                      <span>총 {getCommaSeparatedNumber(totalElements)}건</span>
                    </div>
                  </div>
                  <div className="TitleBtn">
                    <button
                      type="button"
                      onClick={handleNewResume}
                      className="btn btn-primary"
                    >
                      이력서 작성
                    </button>
                  </div>
                </div>

                <div className="bbstable table-list">
                  <table>
                    <colgroup>
                      <col style={{ width: "8%" }} />
                      <col />
                      <col style={{ width: "20%" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>날짜</th>
                        <th>이력서 제목</th>
                        <th>이력서 관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumeList.map((item, index) => (
                        <tr
                          key={index}
                          className="table-list-item"
                          onClick={() =>
                            navigate(`/mypage/newResumeDetail/${item.id}`)
                          }
                        >
                          <td className="cell-default">{item.date}</td>
                          <td className="cell-company">
                            <div className="company">
                              <p>{item.title}</p>
                            </div>
                          </td>
                          <td className="cell-default">
                            <div className="ListBtnBox">
                              <button
                                type="button"
                                className="resListBtn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResumeEdit(item.id);
                                }}
                                style={{ borderColor: "black", color: "black" }}
                              >
                                수정
                              </button>
                              {/* 복사 버튼 예시
                              <button
                                type="button"
                                className="resListBtn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResumeCopy(item.id);
                                }}
                              >
                                복사
                              </button> */}
                              <button
                                type="button"
                                className="resdeleteBtn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResumeDelete(item.id);
                                }}
                              >
                                삭제
                              </button>
                              <button
                                type="button"
                                className={`resListBtn ${
                                  item.isPublic ? "active" : ""
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTogglePublic(item.id, item.isPublic);
                                }}
                              >
                                {item.isPublic ? "공개" : "비공개"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <PostingPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Resume;
