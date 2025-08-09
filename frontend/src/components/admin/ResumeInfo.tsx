import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../api/axios';
import { formatGender } from '../../utils/formatUtils';

interface ResumeInfo {
  id: number;
  createdAt: string;
  photoUrl: string;
  userId: string;
  name: string;
  age: number;
  gender: string;
  experience: string;
  country: string;
  region: string;
  title: string;
  status: string;
}

interface ApiResponse {
  content: ResumeInfo[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface SearchParams {
  status: string;
  gender: string;
  country: string;
  region: string;
  startDate: string;
  endDate: string;
  keyword: string;
  page: number;
  size: number;
}

const ResumeInfo: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    status: '',
    gender: '',
    country: '',
    region: '',
    startDate: '',
    endDate: '',
    keyword: '',
    page: 0,
    size: 10
  });
  const [resumes, setResumes] = useState<ResumeInfo[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadResumes = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get<ApiResponse>('/api/v1/admin/resumes', { params: searchParams });
      setResumes(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('이력서 목록을 불러오는데 실패했습니다:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, [searchParams]);

  const handleCheckboxChange = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSearch = () => {
    setSearchParams(prev => ({ ...prev, page: 0 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  };

  const handleBulkUpdateStatus = async (status: string) => {
    if (selectedIds.length === 0) {
      alert('선택된 이력서가 없습니다.');
      return;
    }

    try {
      await axiosInstance.put('/admin/resumes/bulk-update', {
        ids: selectedIds,
        status
      });
      alert('상태가 업데이트되었습니다.');
      setSelectedIds([]);
      loadResumes();
    } catch (error) {
      console.error('상태 업데이트에 실패했습니다:', error);
      alert('상태 업데이트에 실패했습니다.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="main">
      <div className="contents">
        <div className="content">
          <div className="container">
            <article className="article-area">
              <div className="btn-area--top">
                <button 
                  type="button" 
                  className="btn btn-danger btn-small"
                  onClick={() => handleBulkUpdateStatus('delete')}
                >
                  삭제
                </button>
                <button 
                  type="button" 
                  className="btn btn-success btn-small"
                  onClick={() => handleBulkUpdateStatus('enable')}
                >
                  노출
                </button>
                <button 
                  type="button" 
                  className="btn btn-warning btn-small"
                  onClick={() => handleBulkUpdateStatus('disable')}
                >
                  비노출
                </button>
              </div>

              <div className="search-area">
                <div className="search--select select-box">
                  <div className="control">
                    <select 
                      name="status" 
                      className="select"
                      value={searchParams.status}
                      onChange={handleInputChange}
                    >
                      <option value="">상태</option>
                      <option value="delete">삭제</option>
                      <option value="enable">노출</option>
                      <option value="disable">비노출</option>
                    </select>
                  </div>

                  <div className="control">
                    <select 
                      name="gender" 
                      className="select"
                      value={searchParams.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">성별</option>
                      <option value="male">남</option>
                      <option value="female">여</option>
                    </select>
                  </div>

                  <div className="control">
                    <select 
                      name="country" 
                      className="select"
                      value={searchParams.country}
                      onChange={handleInputChange}
                    >
                      <option value="">국가</option>
                      <option value="all">전체</option>
                      <option value="america">미주</option>
                      <option value="europe">유럽</option>
                      <option value="asia">아시아</option>
                      <option value="oceania">오세아니아</option>
                      <option value="other">기타</option>
                    </select>
                  </div>

                  <div className="control">
                    <select 
                      name="region" 
                      className="select"
                      value={searchParams.region}
                      onChange={handleInputChange}
                    >
                      <option value="">지역</option>
                      <option value="seoul">서울</option>
                      <option value="busan">부산</option>
                    </select>
                  </div>
                  
                  <div className="select--date">
                    <div className="control">
                      <input 
                        type="date"
                        name="startDate"
                        className="select"
                        value={searchParams.startDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="control">
                      <input 
                        type="date"
                        name="endDate"
                        className="select"
                        value={searchParams.endDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="search--text">
                  <div className="control">
                    <input 
                      type="text"
                      name="keyword"
                      value={searchParams.keyword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleSearch}
                  >
                    검색
                  </button>
                </div>
              </div>

              <section className="table-area">
                <div className="table-wrapper">
                  <div className="table-scroll">
                    <div className="table-header">
                      <table>
                        <colgroup>
                          <col width="44px"/>
                          <col width="70px"/>
                          <col width="140px"/>
                          <col width="140px"/>
                          <col width="130px"/>
                          <col width="130px"/>
                          <col width="58px"/>
                          <col width="58px"/>
                          <col width="110px"/>
                          <col width="110px"/>
                          <col width="130px"/>
                          <col width="200px"/>
                          <col width="336px"/>
                        </colgroup>
                        <thead>
                          <tr>
                            <th>
                              <input 
                                type="checkbox"
                                checked={selectedIds.length === resumes.length}
                                onChange={() => {
                                  if (selectedIds.length === resumes.length) {
                                    setSelectedIds([]);
                                  } else {
                                    setSelectedIds(resumes.map(resume => resume.id));
                                  }
                                }}
                              />
                            </th>
                            <th>번호</th>
                            <th>등록일시</th>
                            <th>사진</th>
                            <th>아이디</th>
                            <th>이름</th>
                            <th>나이</th>
                            <th>성별</th>
                            <th>경력</th>
                            <th>국가</th>
                            <th>지역</th>
                            <th>제목</th>
                            <th>관리자툴</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="table-content">
                      <table>
                        <colgroup>
                          <col width="44px"/>
                          <col width="70px"/>
                          <col width="140px"/>
                          <col width="140px"/>
                          <col width="130px"/>
                          <col width="130px"/>
                          <col width="58px"/>
                          <col width="58px"/>
                          <col width="110px"/>
                          <col width="110px"/>
                          <col width="130px"/>
                          <col width="200px"/>
                          <col width="336px"/>
                        </colgroup>
                        <tbody>
                          {resumes.map((resume, index) => (
                            <tr key={resume.id}>
                              <td>
                                <input 
                                  type="checkbox"
                                  checked={selectedIds.includes(resume.id)}
                                  onChange={() => handleCheckboxChange(resume.id)}
                                />
                              </td>
                              <td>{resumes.length - index}</td>
                              <td>{new Date(resume.createdAt).toLocaleString()}</td>
                              <td>
                                <div className="user__thumb">
                                  <img src={resume.photoUrl} alt={resume.name} />
                                </div>
                              </td>
                              <td>{resume.userId}</td>
                              <td>{resume.name}</td>
                              <td>{resume.age}</td>
                              <td>{formatGender(resume.gender)}</td>
                              <td>{resume.experience}</td>
                              <td>{resume.country}</td>
                              <td>{resume.region}</td>
                              <td>{resume.title}</td>
                              <td>
                                <div className="btn-area">
                                  <button 
                                    type="button" 
                                    className="btn btn-primary btn-small"
                                    onClick={() => navigate(`/admin/resume-info/${resume.id}`)}
                                  >
                                    상세
                                  </button>
                                  <button 
                                    type="button" 
                                    className="btn btn-danger btn-small"
                                    onClick={() => handleBulkUpdateStatus('delete')}
                                  >
                                    삭제
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>

              <div className="pagination-area">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`page-btn ${searchParams.page === i ? 'active' : ''}`}
                    onClick={() => handlePageChange(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeInfo; 