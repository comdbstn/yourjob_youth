import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../api/axios';

interface PositionProposal {
  id: number;
  createdAt: string;
  status: string;
  employerId: string;
  jobTitle: string;
  applicantId: string;
  resumeTitle: string;
}

interface ApiResponse {
  content: PositionProposal[];
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

const PositionProposal: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    status: '',
    startDate: '',
    endDate: '',
    keyword: '',
    page: 0,
    size: 10
  });
  const [proposals, setProposals] = useState<PositionProposal[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadProposals = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get<ApiResponse>('/admin/position-proposals', { params: searchParams });
      setProposals(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('포지션제안 목록을 불러오는데 실패했습니다:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
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

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('선택된 포지션제안이 없습니다.');
      return;
    }

    if (!window.confirm('선택한 포지션제안을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await axiosInstance.delete('/admin/position-proposals/bulk', {
        data: { ids: selectedIds }
      });
      alert('선택한 포지션제안이 삭제되었습니다.');
      setSelectedIds([]);
      loadProposals();
    } catch (error) {
      console.error('포지션제안 삭제에 실패했습니다:', error);
      alert('포지션제안 삭제에 실패했습니다.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return '대기중';
      case 'ACCEPTED':
        return '수락';
      case 'REJECTED':
        return '거절';
      case 'EXPIRED':
        return '만료';
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
                      <option value="PENDING">대기중</option>
                      <option value="ACCEPTED">수락</option>
                      <option value="REJECTED">거절</option>
                      <option value="EXPIRED">만료</option>
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
                          <col width="140px"/>
                          <col width="80px"/>
                          <col width="200px"/>
                          <col width="360px"/>
                          <col width="200px"/>
                          <col width="360px"/>
                          <col width="100px"/>
                        </colgroup>
                        <thead>
                          <tr>
                            <th>
                              <input 
                                type="checkbox"
                                checked={selectedIds.length === proposals.length}
                                onChange={() => {
                                  if (selectedIds.length === proposals.length) {
                                    setSelectedIds([]);
                                  } else {
                                    setSelectedIds(proposals.map(proposal => proposal.id));
                                  }
                                }}
                              />
                            </th>
                            <th>번호</th>
                            <th>일시</th>
                            <th>상태</th>
                            <th>아이디</th>
                            <th>채용정보명</th>
                            <th>구직회원</th>
                            <th>이력서명</th>
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
                          <col width="80px"/>
                          <col width="200px"/>
                          <col width="360px"/>
                          <col width="200px"/>
                          <col width="360px"/>
                          <col width="100px"/>
                        </colgroup>
                        <tbody>
                          {proposals.map((proposal, index) => (
                            <tr key={proposal.id}>
                              <td>
                                <input 
                                  type="checkbox"
                                  checked={selectedIds.includes(proposal.id)}
                                  onChange={() => handleCheckboxChange(proposal.id)}
                                />
                              </td>
                              <td>{proposals.length - index}</td>
                              <td>{new Date(proposal.createdAt).toLocaleString()}</td>
                              <td>{getStatusText(proposal.status)}</td>
                              <td>{proposal.employerId}</td>
                              <td>{proposal.jobTitle}</td>
                              <td>{proposal.applicantId}</td>
                              <td>{proposal.resumeTitle}</td>
                              <td>
                                <div className="btn-area">
                                  <button 
                                    type="button" 
                                    className="btn btn-primary btn-small"
                                    onClick={() => navigate(`/admin/position-proposal/${proposal.id}`)}
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

export default PositionProposal; 