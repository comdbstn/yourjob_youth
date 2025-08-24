import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyPage.css';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'JOBSEEKER' | 'COMPANY';
  profileImage?: string;
  phone?: string;
}

interface UserProfile extends User {
  skills?: string[];
  experience?: string;
  location?: string;
  companySize?: string;
  businessType?: string;
  companyDescription?: string;
}

const MyPage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://simple-backend-77yddgdmr-comdbstns-projects.vercel.app';

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUser(response.data.user);
      } else {
        setError('사용자 정보를 불러올 수 없습니다.');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error('프로필 로드 오류:', error);
      setError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    window.location.href = '/';
  };

  const handleEdit = () => {
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.put(`${API_BASE_URL}/api/auth/profile`, user, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSuccess('프로필이 성공적으로 업데이트되었습니다.');
        setEditing(false);
        localStorage.setItem('user_info', JSON.stringify(user));
      } else {
        setError(response.data.message || '프로필 업데이트에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('프로필 업데이트 오류:', error);
      setError('프로필 업데이트 중 오류가 발생했습니다.');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setError('');
    setSuccess('');
    loadUserProfile();
  };

  const handleInputChange = (field: string, value: string) => {
    setUser(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSkillsChange = (skills: string) => {
    const skillArray = skills.split(',').map(skill => skill.trim()).filter(skill => skill);
    setUser(prev => prev ? { ...prev, skills: skillArray } : null);
  };

  if (loading) {
    return (
      <div className="mypage-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mypage-container">
        <div className="error">사용자 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <div className="user-avatar">
          {user.profileImage ? (
            <img src={user.profileImage} alt="프로필" />
          ) : (
            <div className="avatar-placeholder">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="user-basic-info">
          <h1>{user.name}</h1>
          <p className="user-type">
            {user.userType === 'COMPANY' ? '🏢 기업 회원' : '🔍 개인 회원'}
          </p>
          <p className="user-email">{user.email}</p>
        </div>
        <div className="header-actions">
          {!editing ? (
            <>
              <button className="edit-btn" onClick={handleEdit}>
                편집하기
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button className="save-btn" onClick={handleSave}>
                저장
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                취소
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <div className="profile-content">
        <div className="profile-section">
          <h2>기본 정보</h2>
          <div className="form-group">
            <label>이름 / 회사명</label>
            {editing ? (
              <input
                type="text"
                value={user.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={user.userType === 'COMPANY' ? '회사명을 입력하세요' : '이름을 입력하세요'}
              />
            ) : (
              <p>{user.name}</p>
            )}
          </div>
          
          <div className="form-group">
            <label>이메일</label>
            <p>{user.email}</p>
            <small>이메일은 변경할 수 없습니다.</small>
          </div>

          <div className="form-group">
            <label>전화번호</label>
            {editing ? (
              <input
                type="tel"
                value={user.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="전화번호를 입력하세요"
              />
            ) : (
              <p>{user.phone || '등록되지 않음'}</p>
            )}
          </div>

          <div className="form-group">
            <label>지역</label>
            {editing ? (
              <select
                value={user.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
              >
                <option value="">지역을 선택하세요</option>
                <option value="서울">서울</option>
                <option value="경기">경기</option>
                <option value="인천">인천</option>
                <option value="부산">부산</option>
                <option value="대구">대구</option>
                <option value="광주">광주</option>
                <option value="대전">대전</option>
                <option value="울산">울산</option>
                <option value="세종">세종</option>
                <option value="강원">강원</option>
                <option value="충북">충북</option>
                <option value="충남">충남</option>
                <option value="전북">전북</option>
                <option value="전남">전남</option>
                <option value="경북">경북</option>
                <option value="경남">경남</option>
                <option value="제주">제주</option>
                <option value="전국">전국</option>
              </select>
            ) : (
              <p>{user.location || '등록되지 않음'}</p>
            )}
          </div>
        </div>

        {user.userType === 'JOBSEEKER' ? (
          <div className="profile-section">
            <h2>구직자 정보</h2>
            <div className="form-group">
              <label>스킬</label>
              {editing ? (
                <input
                  type="text"
                  value={user.skills?.join(', ') || ''}
                  onChange={(e) => handleSkillsChange(e.target.value)}
                  placeholder="JavaScript, React, Node.js (쉼표로 구분)"
                />
              ) : (
                <div className="skills-list">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))
                  ) : (
                    <p>등록된 스킬이 없습니다.</p>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>경력</label>
              {editing ? (
                <select
                  value={user.experience || ''}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                >
                  <option value="">경력을 선택하세요</option>
                  <option value="신입">신입</option>
                  <option value="1년 이하">1년 이하</option>
                  <option value="1-3년">1-3년</option>
                  <option value="3-5년">3-5년</option>
                  <option value="5-10년">5-10년</option>
                  <option value="10년 이상">10년 이상</option>
                </select>
              ) : (
                <p>{user.experience || '등록되지 않음'}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="profile-section">
            <h2>기업 정보</h2>
            <div className="form-group">
              <label>회사 규모</label>
              {editing ? (
                <select
                  value={user.companySize || ''}
                  onChange={(e) => handleInputChange('companySize', e.target.value)}
                >
                  <option value="">회사 규모를 선택하세요</option>
                  <option value="스타트업 (1-10명)">스타트업 (1-10명)</option>
                  <option value="소규모 (11-50명)">소규모 (11-50명)</option>
                  <option value="중간규모 (51-200명)">중간규모 (51-200명)</option>
                  <option value="대규모 (201-1000명)">대규모 (201-1000명)</option>
                  <option value="대기업 (1000명 이상)">대기업 (1000명 이상)</option>
                </select>
              ) : (
                <p>{user.companySize || '등록되지 않음'}</p>
              )}
            </div>

            <div className="form-group">
              <label>업종</label>
              {editing ? (
                <select
                  value={user.businessType || ''}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                >
                  <option value="">업종을 선택하세요</option>
                  <option value="IT·소프트웨어">IT·소프트웨어</option>
                  <option value="제조업">제조업</option>
                  <option value="금융업">금융업</option>
                  <option value="건설업">건설업</option>
                  <option value="서비스업">서비스업</option>
                  <option value="유통업">유통업</option>
                  <option value="교육업">교육업</option>
                  <option value="의료업">의료업</option>
                  <option value="기타">기타</option>
                </select>
              ) : (
                <p>{user.businessType || '등록되지 않음'}</p>
              )}
            </div>

            <div className="form-group">
              <label>회사 소개</label>
              {editing ? (
                <textarea
                  value={user.companyDescription || ''}
                  onChange={(e) => handleInputChange('companyDescription', e.target.value)}
                  placeholder="회사에 대한 간단한 소개를 입력하세요"
                  rows={4}
                />
              ) : (
                <p>{user.companyDescription || '등록된 소개가 없습니다.'}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;