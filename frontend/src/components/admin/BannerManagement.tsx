import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../api/axios';

interface Banner {
  id: number;
  groupName: string;
  startDate: string;
  endDate: string;
  status: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
}

interface ApiResponse {
  content: Banner[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface SearchParams {
  groupName: string;
  status: string;
  startDate: string;
  endDate: string;
  keyword: string;
  page: number;
  size: number;
}

const BannerManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    groupName: '',
    status: '',
    startDate: '',
    endDate: '',
    keyword: '',
    page: 0,
    size: 10
  });
  const [banners, setBanners] = useState<Banner[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadBanners = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get<ApiResponse>('/admin/banners', { params: searchParams });
      setBanners(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('배너 목록을 불러오는데 실패했습니다:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, [searchParams]);

  const handleSearch = () => {
    setSearchParams(prev => ({ ...prev, page: 0 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('선택된 배너가 없습니다.');
      return;
    }

    if (!window.confirm('선택한 배너를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await axiosInstance.delete('/admin/banners/bulk', {
        data: { ids: selectedIds }
      });
      alert('선택한 배너가 삭제되었습니다.');
      setSelectedIds([]);
      loadBanners();
    } catch (error) {
      console.error('배너 삭제에 실패했습니다:', error);
      alert('배너 삭제에 실패했습니다.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(banners.map(banner => banner.id));
    } else {
      setSelectedIds([]);
    }
  };

  const getGroupNameText = (groupName: string): string => {
    switch (groupName) {
      case 'MAIN_A':
        return '메인 A';
      case 'MAIN_B':
        return '메인 B';
      case 'SUB_A':
        return '서브 A';
      case 'SUB_B':
        return '서브 B';
      default:
        return groupName;
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return '출력';
      case 'INACTIVE':
        return '출력안함';
      default:
        return status;
    }
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
                  onClick={handleBulkDelete}
                >
                  삭제
                </button>
                <button 
                  type="button" 
                  className="btn btn-success btn-small"
                  onClick={() => navigate('/admin/banner-management/create')}
                >
                  배너등록
                </button>
              </div>

              <div className="search-area">
                <div className="search--select select-box">
                  <div className="control">
                    <select 
                      name="groupName" 
                      className="select"
                      value={searchParams.groupName}
                      onChange={handleInputChange}
                    >
                      <option value="">그룹명</option>
                      <option value="MAIN_A">메인 A</option>
                      <option value="MAIN_B">메인 B</option>
                      <option value="SUB">서브</option>
                    </select>
                  </div>
                  <div className="control">
                    <select 
                      name="status" 
                      className="select"
                      value={searchParams.status}
                      onChange={handleInputChange}
                    >
                      <option value="">상태</option>
                      <option value="ACTIVE">출력</option>
                      <option value="INACTIVE">출력안함</option>
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
                      placeholder="검색어를 입력하세요"
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

              <div className="table-wrapper">
                <div className="table-scroll">
                  <section className="table-area">
                    <div className="table-header">
                      <table>
                        <colgroup>
                          <col width="44px"/>
                          <col width="70px"/>
                          <col width="120px"/>
                          <col width="140px"/>
                          <col width="140px"/>
                          <col width="100px"/>
                          <col width="200px"/>
                          <col width="200px"/>
                          <col width="100px"/>
                          <col width="180px"/>
                        </colgroup>
                        <thead>
                          <tr>
                            <th>
                              <div className="control">
                                <input 
                                  type="checkbox"
                                  className="checked--all"
                                  checked={selectedIds.length === banners.length}
                                  onChange={handleSelectAll}
                                />
                              </div>
                            </th>
                            <th>번호</th>
                            <th>그룹명</th>
                            <th>시작시간</th>
                            <th>마감시간</th>
                            <th>상태</th>
                            <th>배너제목</th>
                            <th>배너이미지</th>
                            <th>링크</th>
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
                          <col width="120px"/>
                          <col width="140px"/>
                          <col width="140px"/>
                          <col width="100px"/>
                          <col width="200px"/>
                          <col width="200px"/>
                          <col width="100px"/>
                          <col width="180px"/>
                        </colgroup>
                        <tbody>
                          {banners.map((banner, index) => (
                            <tr key={banner.id}>
                              <td>
                                <div className="control">
                                  <input 
                                    type="checkbox"
                                    className="checked--node"
                                    checked={selectedIds.includes(banner.id)}
                                    onChange={() => handleCheckboxChange(banner.id)}
                                  />
                                </div>
                              </td>
                              <td>{banners.length - index}</td>
                              <td>{getGroupNameText(banner.groupName)}</td>
                              <td>{new Date(banner.startDate).toLocaleString()}</td>
                              <td>{new Date(banner.endDate).toLocaleString()}</td>
                              <td>{getStatusText(banner.status)}</td>
                              <td>{banner.title}</td>
                              <td>
                                <div className="thumb--banner">
                                  <img src={banner.imageUrl} alt={banner.title} />
                                </div>
                              </td>
                              <td>{banner.linkUrl}</td>
                              <td>
                                <div className="btn-area">
                                  <button 
                                    type="button" 
                                    className="btn btn-primary btn-small"
                                    onClick={() => navigate(`/admin/banner-management/${banner.id}`)}
                                  >
                                    수정
                                  </button>
                                  <button 
                                    type="button" 
                                    className="btn btn-danger btn-small"
                                    onClick={() => handleBulkDelete()}
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
                  </section>
                </div>
              </div>

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

export default BannerManagement; 