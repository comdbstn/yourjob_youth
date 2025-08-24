import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "./layout/Layout";
import AuthModal from "./auth/AuthModal";
import "./MainSimple.css";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  category: string;
  description: string;
  salary?: string;
  experience?: string;
  employment_type?: string;
  deadline?: string;
  image_url?: string;
  apply_url?: string;
  skills: string[];
  benefits: string[];
  posting_date?: string;
}

const MainSimple: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userInfo = localStorage.getItem('user_info');
    if (token && userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
        const response = await fetch(`${API_BASE_URL}/api/jobs?limit=12`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setJobs(data.data);
        }
      } catch (error) {
        console.error('채용공고 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleAuthSuccess = (user: any, token: string) => {
    setUser(user);
    setIsAuthModalOpen(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>채용공고를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="main-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              꿈이 현실이 되는 곳,<br />
              <span className="highlight">유어잡</span>에서 시작하세요
            </h1>
            <p className="hero-subtitle">
              월 방문자 100만+, 수천 개의 기업이 믿고 사용하는 채용 플랫폼
            </p>
            <div className="hero-search">
              <input 
                type="search" 
                placeholder="직무, 회사를 검색해보세요" 
                className="hero-search-input"
              />
              <button className="hero-search-btn">검색</button>
            </div>
          </div>
          <div className="hero-background"></div>
        </section>

        {/* Job Categories */}
        <section className="categories-section">
          <div className="container">
            <h2 className="section-title">직무별 채용정보</h2>
            <div className="categories-grid">
              <div className="category-card">
                <div className="category-icon">💼</div>
                <div className="category-name">개발·프로그래밍</div>
                <div className="category-count">1,234개</div>
              </div>
              <div className="category-card">
                <div className="category-icon">🎨</div>
                <div className="category-name">디자인</div>
                <div className="category-count">567개</div>
              </div>
              <div className="category-card">
                <div className="category-icon">📱</div>
                <div className="category-name">기획·전략</div>
                <div className="category-count">890개</div>
              </div>
              <div className="category-card">
                <div className="category-icon">📈</div>
                <div className="category-name">마케팅·광고</div>
                <div className="category-count">456개</div>
              </div>
              <div className="category-card">
                <div className="category-icon">💰</div>
                <div className="category-name">영업</div>
                <div className="category-count">789개</div>
              </div>
              <div className="category-card">
                <div className="category-icon">🏢</div>
                <div className="category-name">경영·비즈니스</div>
                <div className="category-count">345개</div>
              </div>
              <div className="category-card">
                <div className="category-icon">⚙️</div>
                <div className="category-name">서비스</div>
                <div className="category-count">612개</div>
              </div>
              <div className="category-card">
                <div className="category-icon">🎓</div>
                <div className="category-name">전문직</div>
                <div className="category-count">234개</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Jobs Section */}
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">모두가 주목하고 있어요!</h2>
              <Link to="/jobs" className="view-all-link">전체보기 →</Link>
            </div>
            <div className="featured-jobs-grid">
              {jobs.slice(0, 4).map((job) => (
                <div 
                  key={job.id}
                  className="featured-job-card"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div className="job-image">
                    <img 
                      src={job.image_url || 'https://via.placeholder.com/300x200?text=Company'}
                      alt={job.company}
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(job.company);
                      }}
                    />
                    <div className="job-badge">신입</div>
                  </div>
                  <div className="job-info">
                    <h3 className="job-title">{job.title}</h3>
                    <p className="job-company">{job.company}</p>
                    <p className="job-location">{job.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Jobs Section */}
        <section className="latest-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">지금 뜨고 있는 포지션</h2>
              <Link to="/jobs" className="view-all-link">전체보기 →</Link>
            </div>
            <div className="latest-jobs-grid">
              {jobs.slice(4, 10).map((job) => (
                <div 
                  key={job.id}
                  className="job-item"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div className="job-logo">
                    <img 
                      src={job.image_url}
                      alt={job.company}
                    />
                  </div>
                  <div className="job-content">
                    <h3 className="job-title">{job.title}</h3>
                    <p className="job-company">{job.company}</p>
                    <div className="job-meta">
                      <span className="job-location">{job.location}</span>
                      <span className="job-experience">{job.experience || '경력무관'}</span>
                    </div>
                  </div>
                  <div className="job-salary">
                    {job.salary || '급여협의'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recommended Jobs by Level */}
        <section className="recommended-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">효과로 검증하는 역량별 포지션</h2>
            </div>
            <div className="level-tabs">
              <button className="level-tab active">신입</button>
              <button className="level-tab">1-3년</button>
              <button className="level-tab">3-5년</button>
              <button className="level-tab">5-10년</button>
            </div>
            <div className="recommended-jobs-grid">
              {jobs.slice(0, 6).map((job) => (
                <div 
                  key={job.id}
                  className="recommended-job-card"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div className="job-header">
                    <img 
                      src={job.image_url}
                      alt={job.company}
                      className="company-logo"
                    />
                    <div>
                      <h3 className="job-title">{job.title}</h3>
                      <p className="job-company">{job.company}</p>
                    </div>
                  </div>
                  <p className="job-description">
                    {job.description.substring(0, 80)}...
                  </p>
                  <div className="job-skills">
                    {job.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                  <div className="job-footer">
                    <span className="job-location">{job.location}</span>
                    <span className="job-salary">{job.salary || '급여협의'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>지금 바로 합류하세요!</h2>
              <p>이미 수십만 명의 직장인이 유어잡을 통해 새로운 기회를 잡았습니다</p>
              <div className="cta-buttons">
                <button 
                  className="cta-btn primary"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  회원가입하고 시작하기
                </button>
                <Link to="/jobs" className="cta-btn secondary">
                  채용공고 둘러보기
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </Layout>
  );
};

export default MainSimple;