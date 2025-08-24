import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import axios from 'axios';

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

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    const fetchJobDetail = async () => {
      if (!id) {
        navigate('/jobs');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/jobs/${id}`);
        
        if (response.data.success && response.data.data) {
          setJob(response.data.data);
        } else {
          console.log('Job not found, redirecting to jobs list');
          navigate('/jobs');
          return;
        }
      } catch (err) {
        console.error('Job detail fetch error:', err);
        console.log('Redirecting to jobs list due to error');
        // 채용공고를 찾을 수 없으면 목록 페이지로 리다이렉트
        navigate('/jobs');
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [id, navigate]);

  const formatDate = (dateString?: string) => {
    if (!dateString || dateString === 'nan') return '상시채용';
    try {
      return new Date(dateString).toLocaleDateString('ko-KR');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="job-detail-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>채용공고를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !job) {
    return (
      <Layout>
        <div className="job-detail-container">
          <div className="error-state">
            <p>{error || '채용공고를 찾을 수 없습니다.'}</p>
            <button onClick={() => navigate('/jobs')}>채용공고 목록으로 돌아가기</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="job-detail-container">
        <div className="job-detail-header">
          <button className="back-button" onClick={() => navigate('/jobs')}>
            ← 목록으로 돌아가기
          </button>
        </div>

        <div className="job-detail-content">
          <div className="job-main-info">
            <div className="company-logo">
              {job.image_url && !job.image_url.includes('default.svg') ? (
                <img src={job.image_url} alt={job.company} />
              ) : (
                <div className="logo-fallback">🏢</div>
              )}
            </div>

            <div className="job-basic-info">
              <h1 className="job-title">{job.title}</h1>
              <h2 className="company-name">{job.company}</h2>
              <div className="job-meta">
                <span className="location">📍 {job.location}</span>
                <span className="category">🏷️ {job.category}</span>
                <span className="deadline">⏰ 마감일: {formatDate(job.deadline)}</span>
              </div>
            </div>
          </div>

          <div className="job-details-grid">
            <div className="detail-section">
              <h3>급여</h3>
              <p>{job.salary || '협의'}</p>
            </div>

            <div className="detail-section">
              <h3>경력</h3>
              <p>{job.experience || '미표시'}</p>
            </div>

            <div className="detail-section">
              <h3>고용형태</h3>
              <p>{job.employment_type || '미표시'}</p>
            </div>

            <div className="detail-section">
              <h3>등록일</h3>
              <p>{formatDate(job.posting_date)}</p>
            </div>
          </div>

          <div className="job-description">
            <h3>채용공고 상세</h3>
            <div className="description-content">
              {job.description}
            </div>
          </div>

          {job.skills && job.skills.length > 0 && (
            <div className="job-skills">
              <h3>필요 기술</h3>
              <div className="skills-container">
                {job.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {job.benefits && job.benefits.length > 0 && (
            <div className="job-benefits">
              <h3>복리후생</h3>
              <div className="benefits-container">
                {job.benefits.map((benefit, index) => (
                  <span key={index} className="benefit-tag">{benefit}</span>
                ))}
              </div>
            </div>
          )}

          <div className="job-actions">
            {job.apply_url && (
              <a
                href={job.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="apply-button primary"
              >
                지원하기 🔗
              </a>
            )}
            <button 
              className="back-button secondary"
              onClick={() => navigate('/jobs')}
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>

        <style>{`
          .job-detail-container {
            min-height: 100vh;
            background: #f8fafc;
            padding: 2rem 0;
          }

          .job-detail-header {
            max-width: 1000px;
            margin: 0 auto;
            padding: 0 1rem 1rem;
          }

          .back-button {
            background: none;
            border: 1px solid #e2e8f0;
            color: #4a5568;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s ease;
          }

          .back-button:hover {
            background: #f7fafc;
            border-color: #667eea;
            color: #667eea;
          }

          .back-button.secondary {
            background: #f7fafc;
            margin-left: 1rem;
          }

          .job-detail-content {
            max-width: 1000px;
            margin: 0 auto;
            padding: 0 1rem;
          }

          .job-main-info {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            display: flex;
            gap: 2rem;
            align-items: flex-start;
          }

          .company-logo {
            width: 100px;
            height: 100px;
            flex-shrink: 0;
            border-radius: 8px;
            background: #f7fafc;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .company-logo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 8px;
          }

          .logo-fallback {
            font-size: 2.5rem;
          }

          .job-basic-info {
            flex: 1;
          }

          .job-title {
            font-size: 1.8rem;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 0.5rem;
            line-height: 1.3;
          }

          .company-name {
            font-size: 1.3rem;
            color: #667eea;
            font-weight: 600;
            margin-bottom: 1rem;
          }

          .job-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
          }

          .job-meta span {
            color: #718096;
            font-size: 0.95rem;
          }

          .job-details-grid {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
          }

          .detail-section h3 {
            font-size: 1rem;
            color: #718096;
            margin-bottom: 0.5rem;
            font-weight: 500;
          }

          .detail-section p {
            font-size: 1.1rem;
            color: #2d3748;
            font-weight: 600;
          }

          .job-description,
          .job-skills,
          .job-benefits {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .job-description h3,
          .job-skills h3,
          .job-benefits h3 {
            font-size: 1.3rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 1rem;
          }

          .description-content {
            color: #4a5568;
            line-height: 1.6;
            font-size: 1rem;
          }

          .skills-container,
          .benefits-container {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .skill-tag {
            background: rgba(72, 187, 120, 0.1);
            color: #48bb78;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 500;
          }

          .benefit-tag {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 500;
          }

          .job-actions {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
          }

          .apply-button {
            padding: 1rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            font-size: 1.1rem;
            display: inline-block;
            transition: all 0.2s ease;
          }

          .apply-button.primary {
            background: #48bb78;
            color: white;
          }

          .apply-button.primary:hover {
            background: #38a169;
          }

          .loading-state,
          .error-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            text-align: center;
            background: white;
            border-radius: 12px;
            margin: 2rem auto;
            max-width: 600px;
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
            padding: 0.75rem 1.5rem;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
          }

          .error-state button:hover {
            background: #5a6fd8;
          }

          @media (max-width: 768px) {
            .job-main-info {
              flex-direction: column;
              text-align: center;
            }

            .company-logo {
              align-self: center;
            }

            .job-details-grid {
              grid-template-columns: 1fr;
            }

            .job-meta {
              justify-content: center;
            }

            .job-actions {
              padding: 1.5rem;
            }

            .apply-button {
              width: 100%;
              margin-bottom: 1rem;
            }

            .back-button.secondary {
              width: 100%;
              margin-left: 0;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default JobDetail;