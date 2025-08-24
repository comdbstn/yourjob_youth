import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../layout/Layout';
import axios from 'axios';
import '../../../public/css/jobpost.css';
import './JobList.css';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  category: string;
  description: string;
  apply_url?: string;
  image_url?: string;
  salary?: string;
  experience?: string;
  skills: string[];
  employment_type?: string;
  deadline?: string;
  posting_date?: string;
  benefits: string[];
}

interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

interface JobStats {
  total_jobs: number;
  categories: { [key: string]: number };
  locations: { [key: string]: number };
  employment_types: { [key: string]: number };
}

const JoblistDom: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // 실제 크롤링 API 사용
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  // URL에서 검색 파라미터 읽기
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get('keyword');
    if (keyword) {
      setSearchTerm(keyword);
    }
  }, [location.search]);

  // 통계 데이터 로드
  useEffect(() => {
    loadStats();
  }, []);

  // 채용공고 로드
  useEffect(() => {
    loadJobs();
  }, [currentPage, searchTerm, selectedCategory, selectedLocation]);

  // 실시간 업데이트 - 1분마다 새로운 데이터 확인
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('채용공고 데이터 업데이트 중...');
      loadJobs();
      loadStats();
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, [searchTerm, selectedCategory, selectedLocation, currentPage]);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/stats`);
      if (response.data.success) {
        setStats(response.data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('통계 로드 실패:', err);
      // 실패시 기본 통계 표시
      setStats({
        total_jobs: 0,
        categories: {},
        locations: {},
        employment_types: {}
      });
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedLocation !== 'all') params.append('location', selectedLocation);

      const response = await axios.get(`${API_BASE_URL}/api/jobs?${params}`);
      
      if (response.data.success) {
        setJobs(response.data.data);
        const totalPages = Math.ceil((response.data.total || 0) / 12);
        setPagination({
          current_page: currentPage,
          total_pages: totalPages,
          total_items: response.data.total || 0,
          items_per_page: 12
        });
        setLastUpdated(new Date());
      } else {
        setError(response.data.message || '채용공고를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('채용공고 로드 실패:', err);
      setError('실제 크롤링 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadJobs();
    
    // URL 업데이트
    if (searchTerm.trim()) {
      navigate(`/jobs?keyword=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/jobs');
    }
  };

  const handleJobClick = async (jobId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/jobs/${jobId}`);
      if (response.data.success) {
        setSelectedJob(response.data.data);
        setShowModal(true);
      }
    } catch (err) {
      console.error('채용공고 상세 정보 로드 실패:', err);
      const job = jobs.find(job => job.id === jobId);
      if (job) {
        setSelectedJob(job);
        setShowModal(true);
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString || dateString === 'nan') return '상시채용';
    try {
      return new Date(dateString).toLocaleDateString('ko-KR');
    } catch {
      return dateString;
    }
  };

  return (
    <Layout>
      <div className="jobs-container">
        {/* 헤더 섹션 */}
        <div className="jobs-header">
          <div className="container">
            <div className="header-content">
              <h1>채용공고</h1>
              <p>🔥 실시간으로 크롤링된 사람인, 잡코리아의 최신 채용공고</p>
              {lastUpdated && (
                <p className="update-time">
                  마지막 업데이트: {lastUpdated.toLocaleString('ko-KR')}
                </p>
              )}
            </div>
            
            {stats && (
              <div className="stats-bar">
                <div className="stat-item">
                  <span className="stat-number">{stats.total_jobs}</span>
                  <span className="stat-label">총 채용공고</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{Object.keys(stats.categories).length}</span>
                  <span className="stat-label">직군</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{Object.keys(stats.locations).length}</span>
                  <span className="stat-label">지역</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 검색 및 필터 섹션 */}
        <div className="search-filter-section">
          <div className="container">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="회사명, 직무명으로 검색하세요"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-button">
                  검색
                </button>
              </div>
              
              <div className="filter-group">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="filter-select"
                >
                  <option value="all">모든 직군</option>
                  {stats && Object.keys(stats.categories).slice(0, 10).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="filter-select"
                >
                  <option value="all">모든 지역</option>
                  {stats && Object.keys(stats.locations).slice(0, 10).map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </form>
          </div>
        </div>

        {/* 채용공고 리스트 */}
        <div className="jobs-main">
          <div className="container">
            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>채용공고를 불러오는 중...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <p>{error}</p>
                <button onClick={() => loadJobs()}>다시 시도</button>
              </div>
            )}

            {!loading && !error && jobs.length === 0 && (
              <div className="empty-state">
                <p>검색 조건에 맞는 채용공고가 없습니다.</p>
              </div>
            )}

            {!loading && !error && jobs.length > 0 && (
              <>
                <div className="jobs-grid">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="job-card"
                      onClick={() => handleJobClick(job.id)}
                    >
                      <div className="job-header">
                        <div className="job-image">
                          {job.image_url && !job.image_url.includes('default.svg') ? (
                            <img src={job.image_url} alt={job.company} />
                          ) : (
                            <div className="job-image-fallback">🏢</div>
                          )}
                        </div>
                        <div className="job-info">
                          <h3 className="job-title">{job.title}</h3>
                          <p className="job-company">{job.company}</p>
                          <p className="job-location">📍 {job.location}</p>
                        </div>
                      </div>

                      <div className="job-details">
                        {job.category && (
                          <span className="job-tag category">{job.category}</span>
                        )}
                        {job.employment_type && (
                          <span className="job-tag employment">{job.employment_type}</span>
                        )}
                        {job.experience && (
                          <span className="job-tag experience">{job.experience}</span>
                        )}
                      </div>

                      <div className="job-footer">
                        <div className="job-deadline">
                          마감: {formatDate(job.deadline)}
                        </div>
                        <div className="apply-status">
                          {job.apply_url ? (
                            <span className="status available">✅ 지원가능</span>
                          ) : (
                            <span className="status external">🔗 외부링크</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 페이지네이션 */}
                {pagination && pagination.total_pages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="page-button"
                    >
                      이전
                    </button>
                    
                    {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                      const page = i + Math.max(1, currentPage - 2);
                      return page <= pagination.total_pages ? (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`page-button ${page === currentPage ? 'active' : ''}`}
                        >
                          {page}
                        </button>
                      ) : null;
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(pagination.total_pages, currentPage + 1))}
                      disabled={currentPage === pagination.total_pages}
                      className="page-button"
                    >
                      다음
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 상세보기 모달 */}
        {showModal && selectedJob && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedJob.title}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  ✕
                </button>
              </div>
              
              <div className="modal-body">
                <div className="job-detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">회사명</span>
                    <span className="detail-value">{selectedJob.company}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">근무지역</span>
                    <span className="detail-value">{selectedJob.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">직군</span>
                    <span className="detail-value">{selectedJob.category || '미표시'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">고용형태</span>
                    <span className="detail-value">{selectedJob.employment_type || '미표시'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">급여</span>
                    <span className="detail-value">{selectedJob.salary || '미표시'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">경력</span>
                    <span className="detail-value">{selectedJob.experience || '미표시'}</span>
                  </div>
                </div>

                {selectedJob.description && (
                  <div className="detail-section">
                    <h4>채용공고 상세</h4>
                    <p>{selectedJob.description}</p>
                  </div>
                )}

                {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                  <div className="detail-section">
                    <h4>복리후생</h4>
                    <div className="tags-container">
                      {selectedJob.benefits.map((benefit, index) => (
                        <span key={index} className="benefit-tag">{benefit}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedJob.skills && selectedJob.skills.length > 0 && (
                  <div className="detail-section">
                    <h4>필요 기술</h4>
                    <div className="tags-container">
                      {selectedJob.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="modal-actions">
                  {selectedJob.apply_url && (
                    <a
                      href={selectedJob.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="apply-button primary"
                    >
                      지원하기 🔗
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .jobs-container {
            min-height: 100vh;
            background: #f8fafc;
          }

          .jobs-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 3rem 0;
          }

          .header-content {
            text-align: center;
            margin-bottom: 2rem;
          }

          .header-content h1 {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
          }

          .header-content p {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 0.5rem;
          }

          .update-time {
            font-size: 0.9rem;
            opacity: 0.7;
          }

          .stats-bar {
            display: flex;
            justify-content: center;
            gap: 3rem;
            margin-top: 2rem;
          }

          .stat-item {
            text-align: center;
          }

          .stat-number {
            display: block;
            font-size: 2rem;
            font-weight: bold;
          }

          .stat-label {
            font-size: 0.9rem;
            opacity: 0.8;
          }

          .search-filter-section {
            background: white;
            padding: 2rem 0;
            border-bottom: 1px solid #e2e8f0;
          }

          .search-form {
            display: flex;
            gap: 1rem;
            align-items: center;
            flex-wrap: wrap;
          }

          .search-box {
            display: flex;
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
            flex: 1;
            min-width: 300px;
          }

          .search-input {
            flex: 1;
            padding: 0.75rem 1rem;
            border: none;
            outline: none;
            font-size: 1rem;
          }

          .search-button {
            padding: 0.75rem 1.5rem;
            background: #667eea;
            color: white;
            border: none;
            cursor: pointer;
            font-weight: 500;
          }

          .search-button:hover {
            background: #5a6fd8;
          }

          .filter-group {
            display: flex;
            gap: 0.5rem;
          }

          .filter-select {
            padding: 0.75rem 1rem;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            min-width: 150px;
          }

          .jobs-main {
            padding: 3rem 0;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
          }

          .loading-state, .error-state, .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            text-align: center;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e2e8f0;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .error-state button {
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }

          .jobs-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .job-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid #e2e8f0;
          }

          .job-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          }

          .job-header {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .job-image {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            background: #f7fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .job-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 8px;
          }

          .job-image-fallback {
            font-size: 1.5rem;
          }

          .job-info {
            flex: 1;
          }

          .job-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 0.5rem;
            line-height: 1.3;
          }

          .job-company {
            color: #667eea;
            font-weight: 500;
            margin-bottom: 0.25rem;
          }

          .job-location {
            color: #718096;
            font-size: 0.9rem;
          }

          .job-details {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
          }

          .job-tag {
            background: #f7fafc;
            color: #4a5568;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
          }

          .job-tag.category {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
          }

          .job-tag.employment {
            background: rgba(72, 187, 120, 0.1);
            color: #48bb78;
          }

          .job-tag.experience {
            background: rgba(237, 137, 54, 0.1);
            color: #ed8936;
          }

          .job-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 1rem;
            border-top: 1px solid #e2e8f0;
            font-size: 0.9rem;
          }

          .job-deadline {
            color: #718096;
          }

          .status.available {
            color: #48bb78;
            font-weight: 500;
          }

          .status.external {
            color: #ed8936;
            font-weight: 500;
          }

          .pagination {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin-top: 2rem;
          }

          .page-button {
            padding: 0.5rem 1rem;
            border: 2px solid #e2e8f0;
            background: white;
            color: #4a5568;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .page-button:hover:not(:disabled) {
            background: #667eea;
            color: white;
            border-color: #667eea;
          }

          .page-button.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
          }

          .page-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
          }

          .modal-content {
            background: white;
            border-radius: 12px;
            max-width: 600px;
            max-height: 80vh;
            width: 100%;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #e2e8f0;
          }

          .modal-header h2 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #2d3748;
            margin: 0;
          }

          .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #718096;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 4px;
          }

          .modal-close:hover {
            background: #f7fafc;
          }

          .modal-body {
            padding: 1.5rem;
          }

          .job-detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1.5rem;
          }

          .detail-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .detail-label {
            font-size: 0.9rem;
            color: #718096;
            font-weight: 500;
          }

          .detail-value {
            font-weight: 600;
            color: #2d3748;
          }

          .detail-section {
            margin-bottom: 1.5rem;
          }

          .detail-section h4 {
            font-size: 1.1rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 0.5rem;
          }

          .detail-section p {
            color: #4a5568;
            line-height: 1.6;
          }

          .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .benefit-tag, .skill-tag {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 500;
          }

          .skill-tag {
            background: rgba(72, 187, 120, 0.1);
            color: #48bb78;
          }

          .modal-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e2e8f0;
          }

          .apply-button {
            flex: 1;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            text-align: center;
            transition: all 0.2s ease;
          }

          .apply-button.primary {
            background: #48bb78;
            color: white;
          }

          .apply-button.primary:hover {
            background: #38a169;
          }

          @media (max-width: 768px) {
            .jobs-header {
              padding: 2rem 0;
            }

            .header-content h1 {
              font-size: 2rem;
            }
            
            .stats-bar {
              flex-direction: column;
              gap: 1rem;
            }
            
            .search-form {
              flex-direction: column;
            }
            
            .search-box {
              min-width: 100%;
            }
            
            .jobs-grid {
              grid-template-columns: 1fr;
            }
            
            .job-detail-grid {
              grid-template-columns: 1fr;
            }
            
            .modal-actions {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default JoblistDom;