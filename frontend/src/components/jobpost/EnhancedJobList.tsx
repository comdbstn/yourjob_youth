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
  experience_levels: { [key: string]: number };
  recent_postings: number;
}

const EnhancedJobList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // 향상된 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);

  // 필터 옵션 데이터
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  // URL에서 검색 파라미터 읽기
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get('keyword');
    if (keyword) {
      setSearchTerm(keyword);
    }
  }, [location.search]);

  // 초기 데이터 로드
  useEffect(() => {
    loadFilterOptions();
    loadStats();
  }, []);

  // 채용공고 로드
  useEffect(() => {
    loadJobs();
  }, [currentPage, searchTerm, selectedCategory, selectedLocation, selectedExperience, selectedEmploymentType, sortBy, sortOrder]);

  const loadFilterOptions = async () => {
    try {
      const [categoriesRes, locationsRes, experienceLevelsRes, employmentTypesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/categories`),
        axios.get(`${API_BASE_URL}/api/locations`),
        axios.get(`${API_BASE_URL}/api/experience-levels`),
        axios.get(`${API_BASE_URL}/api/employment-types`)
      ]);

      if (categoriesRes.data.success) setCategories(categoriesRes.data.data);
      if (locationsRes.data.success) setLocations(locationsRes.data.data);
      if (experienceLevelsRes.data.success) setExperienceLevels(experienceLevelsRes.data.data);
      if (employmentTypesRes.data.success) setEmploymentTypes(employmentTypesRes.data.data);
    } catch (error) {
      console.error('필터 옵션 로드 실패:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/stats`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('통계 로드 실패:', error);
    }
  };

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sort: sortBy,
        order: sortOrder
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedLocation !== 'all') params.append('location', selectedLocation);
      if (selectedExperience !== 'all') params.append('experience', selectedExperience);
      if (selectedEmploymentType !== 'all') params.append('employment_type', selectedEmploymentType);

      const response = await axios.get(`${API_BASE_URL}/api/jobs?${params}`);
      
      if (response.data.success) {
        setJobs(response.data.data);
        setTotalItems(response.data.total || 0);
      } else {
        setError(response.data.message || '채용공고를 불러오는데 실패했습니다.');
      }
    } catch (error: any) {
      console.error('채용공고 로드 실패:', error);
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadJobs();
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    
    switch (filterType) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'location':
        setSelectedLocation(value);
        break;
      case 'experience':
        setSelectedExperience(value);
        break;
      case 'employment_type':
        setSelectedEmploymentType(value);
        break;
    }
  };

  const handleSortChange = (newSortBy: string, newOrder: string = 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newOrder);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSelectedExperience('all');
    setSelectedEmploymentType('all');
    setSortBy('latest');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const openJobModal = (job: Job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const closeJobModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  const applyToJob = (applyUrl?: string) => {
    if (applyUrl) {
      window.open(applyUrl, '_blank');
    } else {
      alert('지원 링크가 없습니다.');
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Layout>
      <div className="job-list-container">
        {/* 헤더 섹션 */}
        <div className="job-list-header">
          <div className="header-content">
            <h1>채용공고</h1>
            <div className="stats-summary">
              {stats && (
                <div className="stats-info">
                  <span className="total-jobs">전체 {stats.total_jobs.toLocaleString()}개</span>
                  <span className="recent-postings">이번 주 신규 {stats.recent_postings}개</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 검색 및 필터 섹션 */}
        <div className="filters-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="회사명, 직무명 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                🔍 검색
              </button>
            </div>
          </form>

          <div className="filter-row">
            <div className="filter-group">
              <select 
                value={selectedCategory}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="all">전체 카테고리</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select 
                value={selectedLocation}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="filter-select"
              >
                <option value="all">전체 지역</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>

              <select 
                value={selectedExperience}
                onChange={(e) => handleFilterChange('experience', e.target.value)}
                className="filter-select"
              >
                <option value="all">전체 경력</option>
                {experienceLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>

              <select 
                value={selectedEmploymentType}
                onChange={(e) => handleFilterChange('employment_type', e.target.value)}
                className="filter-select"
              >
                <option value="all">전체 고용형태</option>
                {employmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="sort-group">
              <select 
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  handleSortChange(sort, order);
                }}
                className="sort-select"
              >
                <option value="latest-desc">최신순</option>
                <option value="deadline-asc">마감임박순</option>
                <option value="salary-desc">연봉높은순</option>
                <option value="company-asc">회사명순</option>
                <option value="title-asc">직무명순</option>
              </select>
            </div>

            <button onClick={clearAllFilters} className="clear-filters-btn">
              🗑️ 초기화
            </button>
          </div>
        </div>

        {/* 결과 표시 */}
        <div className="results-info">
          <span>
            {totalItems > 0 ? `${startIndex}-${endIndex}` : '0'} / {totalItems.toLocaleString()}개 채용공고
          </span>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>채용공고를 불러오는 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
            <button onClick={loadJobs} className="retry-button">다시 시도</button>
          </div>
        )}

        {/* 채용공고 리스트 */}
        {!loading && !error && (
          <div className="jobs-grid">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <div key={job.id} className="job-card" onClick={() => openJobModal(job)}>
                  <div className="job-card-header">
                    <div className="company-logo">
                      {job.image_url ? (
                        <img src={job.image_url} alt={job.company} />
                      ) : (
                        <div className="company-initial">
                          {job.company.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="job-card-meta">
                      <span className="category-badge">{job.category}</span>
                      {job.employment_type && (
                        <span className="employment-type-badge">{job.employment_type}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="job-card-content">
                    <h3 className="job-title">{job.title}</h3>
                    <p className="company-name">{job.company}</p>
                    <p className="job-location">📍 {job.location}</p>
                    
                    {job.salary && (
                      <p className="job-salary">💰 {job.salary}</p>
                    )}
                    
                    {job.experience && (
                      <p className="job-experience">👨‍💼 {job.experience}</p>
                    )}
                  </div>
                  
                  <div className="job-card-footer">
                    {job.skills.length > 0 && (
                      <div className="skills-tags">
                        {job.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="skill-tag">{skill}</span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="skill-tag more">+{job.skills.length - 3}</span>
                        )}
                      </div>
                    )}
                    
                    <div className="job-footer-info">
                      {job.deadline && (
                        <span className="deadline">📅 {job.deadline}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-jobs-message">
                <p>검색 조건에 맞는 채용공고가 없습니다.</p>
                <button onClick={clearAllFilters} className="clear-filters-btn">
                  필터 초기화하기
                </button>
              </div>
            )}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              이전
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              다음
            </button>
          </div>
        )}

        {/* 채용공고 상세 모달 */}
        {showModal && selectedJob && (
          <div className="job-modal-overlay" onClick={closeJobModal}>
            <div className="job-modal" onClick={(e) => e.stopPropagation()}>
              <div className="job-modal-header">
                <div className="company-info">
                  <div className="company-logo-large">
                    {selectedJob.image_url ? (
                      <img src={selectedJob.image_url} alt={selectedJob.company} />
                    ) : (
                      <div className="company-initial-large">
                        {selectedJob.company.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2>{selectedJob.title}</h2>
                    <h3>{selectedJob.company}</h3>
                    <p>📍 {selectedJob.location}</p>
                  </div>
                </div>
                <button className="close-modal" onClick={closeJobModal}>✕</button>
              </div>
              
              <div className="job-modal-content">
                <div className="job-details">
                  <div className="detail-row">
                    <strong>카테고리:</strong> {selectedJob.category}
                  </div>
                  {selectedJob.salary && (
                    <div className="detail-row">
                      <strong>급여:</strong> {selectedJob.salary}
                    </div>
                  )}
                  {selectedJob.experience && (
                    <div className="detail-row">
                      <strong>경력:</strong> {selectedJob.experience}
                    </div>
                  )}
                  {selectedJob.employment_type && (
                    <div className="detail-row">
                      <strong>고용형태:</strong> {selectedJob.employment_type}
                    </div>
                  )}
                  {selectedJob.deadline && (
                    <div className="detail-row">
                      <strong>마감일:</strong> {selectedJob.deadline}
                    </div>
                  )}
                </div>
                
                <div className="job-description">
                  <h4>채용 내용</h4>
                  <p>{selectedJob.description}</p>
                </div>
                
                {selectedJob.skills.length > 0 && (
                  <div className="job-skills">
                    <h4>요구 기술</h4>
                    <div className="skills-list">
                      {selectedJob.skills.map((skill, index) => (
                        <span key={index} className="skill-badge">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedJob.benefits.length > 0 && (
                  <div className="job-benefits">
                    <h4>복리후생</h4>
                    <div className="benefits-list">
                      {selectedJob.benefits.map((benefit, index) => (
                        <span key={index} className="benefit-badge">{benefit}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="job-modal-footer">
                <button 
                  onClick={() => applyToJob(selectedJob.apply_url)}
                  className="apply-button"
                >
                  지원하기 🚀
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EnhancedJobList;