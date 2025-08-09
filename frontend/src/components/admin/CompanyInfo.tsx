import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../api/axios';

interface CompanyInfo {
  id: number;
  createdAt: string;
  status: string;
  name: string;
  businessNumber: string;
  representativeName: string;
  contactPerson: string;
  phone: string;
  address: string;
}

interface ApiResponse {
  content: CompanyInfo[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface SearchParams {
  status: string;
  startDate: string;
  endDate: string;
  keyword: string;
  page: number;
  size: number;
}

const CompanyInfo: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    status: '',
    startDate: '',
    endDate: '',
    keyword: '',
    page: 0,
    size: 10
  });
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get<ApiResponse>('/admin/companies', { params: searchParams });
      setCompanies(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('기업 목록을 불러오는데 실패했습니다:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [searchParams]);

  const handleSearch = () => {
    setSearchParams(prev => ({ ...prev, page: 0 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  };

  const handleBulkUpdateStatus = async (status: string) => {
    if (selectedIds.length === 0) {
      alert('선택된 기업이 없습니다.');
      return;
    }

    try {
      await axiosInstance.put('/admin/companies/bulk-update', {
        ids: selectedIds,
        status
      });
      alert('상태가 업데이트되었습니다.');
      setSelectedIds([]);
      loadCompanies();
    } catch (error) {
      console.error('상태 업데이트에 실패했습니다:', error);
      alert('상태 업데이트에 실패했습니다.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return '활성';
      case 'INACTIVE':
        return '비활성';
      case 'PENDING':
        return '승인대기';
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
                  onClick={() => handleBulkUpdateStatus('INACTIVE')}
                >
                  삭제
                </button>
                <button 
                  type="button" 
                  className="btn btn-success btn-small"
                  onClick={() => handleBulkUpdateStatus('ACTIVE')}
                >
                  노출
                </button>
                <button 
                  type="button" 
                  className="btn btn-warning btn-small"
                  onClick={() => handleBulkUpdateStatus('INACTIVE')}
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
                      <option value="ACTIVE">활성</option>
                      <option value="INACTIVE">비활성</option>
                      <option value="PENDING">승인대기</option>
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
                          <col width="70px"/>
                          <col width="140px"/>
                          <col width="80px"/>
                          <col width="150px"/>
                          <col width="120px"/>
                          <col width="120px"/>
                          <col width="150px"/>
                          <col width="120px"/>
                          <col width="*"/>
                          <col width="180px"/>
                        </colgroup>
                        <thead>
                          <tr>
                            <th>번호</th>
                            <th>등록일시</th>
                            <th>상태</th>
                            <th>기업명</th>
                            <th>사업자번호</th>
                            <th>대표자명</th>
                            <th>담당자</th>
                            <th>연락처</th>
                            <th>주소</th>
                            <th>관리자툴</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="table-content">
                      <table>
                        <colgroup>
                          <col width="70px"/>
                          <col width="140px"/>
                          <col width="80px"/>
                          <col width="150px"/>
                          <col width="120px"/>
                          <col width="120px"/>
                          <col width="150px"/>
                          <col width="120px"/>
                          <col width="*"/>
                          <col width="180px"/>
                        </colgroup>
                        <tbody>
                          {companies.map((company, index) => (
                            <tr key={company.id}>
                              <td>{companies.length - index}</td>
                              <td>{new Date(company.createdAt).toLocaleString()}</td>
                              <td>{getStatusText(company.status)}</td>
                              <td>{company.name}</td>
                              <td>{company.businessNumber}</td>
                              <td>{company.representativeName}</td>
                              <td>{company.contactPerson}</td>
                              <td>{company.phone}</td>
                              <td>{company.address}</td>
                              <td>
                                <div className="btn-area">
                                  <button 
                                    type="button" 
                                    className="btn btn-primary btn-small"
                                    onClick={() => navigate(`/admin/company-info/${company.id}`)}
                                  >
                                    상세
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

export default CompanyInfo; 