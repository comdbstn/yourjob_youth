import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "./layout/Layout";
import "../../public/css/main.css";

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
      <main>
        {/* 메인 섹션 */}
        <section className="main-section" style={{ padding: '2rem 0', background: '#f8fafc' }}>
          <div className="container">
            <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2.5rem', color: '#2d3748' }}>
              유어잡에서 당신의 꿈을 찾으세요
            </h1>
            <p style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '1.2rem', color: '#718096' }}>
              국내 최고의 채용 플랫폼에서 다양한 기회를 만나보세요
            </p>
          </div>
        </section>

        {/* 채용공고 섹션 */}
        <section className="jobs-section" style={{ padding: '3rem 0' }}>
          <div className="container">
            <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', color: '#2d3748' }}>최신 채용공고</h2>
              <Link 
                to="/jobs" 
                style={{ 
                  color: '#667eea', 
                  textDecoration: 'none', 
                  fontSize: '1.1rem',
                  fontWeight: '500'
                }}
              >
                전체보기 →
              </Link>
            </div>

            <div className="jobs-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem' 
            }}>
              {jobs.map((job) => (
                <div 
                  key={job.id}
                  className="job-card"
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e2e8f0',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '600', 
                      color: '#2d3748',
                      marginBottom: '0.5rem',
                      lineHeight: '1.4'
                    }}>
                      {job.title}
                    </h3>
                    <p style={{ 
                      color: '#4a5568', 
                      fontSize: '1rem',
                      fontWeight: '500',
                      marginBottom: '0.5rem'
                    }}>
                      {job.company}
                    </p>
                    <p style={{ color: '#718096', fontSize: '0.9rem' }}>
                      {job.location} • {job.category}
                    </p>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ 
                      color: '#4a5568', 
                      fontSize: '0.9rem',
                      lineHeight: '1.5'
                    }}>
                      {job.description.substring(0, 100)}{job.description.length > 100 ? '...' : ''}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    {job.skills.slice(0, 3).map((skill, index) => (
                      <span 
                        key={index}
                        style={{
                          background: '#edf2f7',
                          color: '#4a5568',
                          fontSize: '0.8rem',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontWeight: '500'
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    {job.salary && (
                      <span style={{ 
                        color: '#667eea', 
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}>
                        {job.salary}
                      </span>
                    )}
                    <span style={{ 
                      color: '#a0aec0', 
                      fontSize: '0.8rem'
                    }}>
                      {job.deadline || '상시채용'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA 섹션 */}
        <section style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '4rem 0',
          color: 'white',
          textAlign: 'center'
        }}>
          <div className="container">
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
              지금 바로 시작하세요
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: '0.9' }}>
              수많은 기업들이 당신을 기다리고 있습니다
            </p>
            <Link 
              to="/jobs"
              style={{
                display: 'inline-block',
                background: 'white',
                color: '#667eea',
                padding: '1rem 2rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '1.1rem',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              모든 채용공고 보기
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default MainSimple;