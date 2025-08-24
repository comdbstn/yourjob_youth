import React, { useState } from 'react';
import axios from 'axios';
import './AuthModal.css';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'JOBSEEKER' | 'COMPANY';
  profileImage?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User, token: string) => void;
}

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  userType: 'JOBSEEKER' | 'COMPANY';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: ''
  });
  
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    userType: 'JOBSEEKER'
  });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: loginForm.email,
        password: loginForm.password
      });

      if (response.data.success) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_info', JSON.stringify(response.data.user));
        onAuthSuccess(response.data.user, response.data.token);
        onClose();
        resetForms();
      } else {
        setError(response.data.message || '로그인에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('로그인 오류:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 입력 검증
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    if (registerForm.password.length < 6) {
      setError('비밀번호는 6자리 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        email: registerForm.email,
        password: registerForm.password,
        name: registerForm.name,
        phone: registerForm.phone,
        userType: registerForm.userType
      });

      if (response.data.success) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_info', JSON.stringify(response.data.user));
        onAuthSuccess(response.data.user, response.data.token);
        onClose();
        resetForms();
      } else {
        setError(response.data.message || '회원가입에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('회원가입 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setLoginForm({ email: '', password: '' });
    setRegisterForm({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: '',
      userType: 'JOBSEEKER'
    });
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setError('');
  };

  const handleLoginFormChange = (field: keyof LoginForm, value: string) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleRegisterFormChange = (field: keyof RegisterForm, value: string) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={handleClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => switchTab('login')}
            >
              로그인
            </button>
            <button 
              className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => switchTab('register')}
            >
              회원가입
            </button>
          </div>
          <button className="auth-close" onClick={handleClose}>✕</button>
        </div>

        <div className="auth-modal-content">
          {error && (
            <div className="auth-error">
              <span>⚠️ {error}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="login-email">이메일</label>
                <input
                  type="email"
                  id="login-email"
                  value={loginForm.email}
                  onChange={(e) => handleLoginFormChange('email', e.target.value)}
                  placeholder="이메일을 입력하세요"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">비밀번호</label>
                <input
                  type="password"
                  id="login-password"
                  value={loginForm.password}
                  onChange={(e) => handleLoginFormChange('password', e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? '로그인 중...' : '로그인'}
              </button>

              <div className="auth-demo-accounts">
                <p><strong>테스트 계정:</strong></p>
                <div className="demo-account">
                  <span>구직자: test@yourjob.com / password123</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setLoginForm({
                        email: 'test@yourjob.com',
                        password: 'password123'
                      });
                    }}
                    className="demo-fill-btn"
                  >
                    자동입력
                  </button>
                </div>
                <div className="demo-account">
                  <span>기업: company@yourjob.com / company123</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setLoginForm({
                        email: 'company@yourjob.com',
                        password: 'company123'
                      });
                    }}
                    className="demo-fill-btn"
                  >
                    자동입력
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label htmlFor="register-usertype">회원 유형</label>
                <div className="user-type-selection">
                  <label className="user-type-option">
                    <input
                      type="radio"
                      name="userType"
                      value="JOBSEEKER"
                      checked={registerForm.userType === 'JOBSEEKER'}
                      onChange={(e) => handleRegisterFormChange('userType', e.target.value)}
                    />
                    <span>🔍 구직자</span>
                  </label>
                  <label className="user-type-option">
                    <input
                      type="radio"
                      name="userType"
                      value="COMPANY"
                      checked={registerForm.userType === 'COMPANY'}
                      onChange={(e) => handleRegisterFormChange('userType', e.target.value)}
                    />
                    <span>🏢 기업</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-name">이름</label>
                <input
                  type="text"
                  id="register-name"
                  value={registerForm.name}
                  onChange={(e) => handleRegisterFormChange('name', e.target.value)}
                  placeholder={registerForm.userType === 'COMPANY' ? '회사명을 입력하세요' : '이름을 입력하세요'}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-email">이메일</label>
                <input
                  type="email"
                  id="register-email"
                  value={registerForm.email}
                  onChange={(e) => handleRegisterFormChange('email', e.target.value)}
                  placeholder="이메일을 입력하세요"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-phone">전화번호</label>
                <input
                  type="tel"
                  id="register-phone"
                  value={registerForm.phone}
                  onChange={(e) => handleRegisterFormChange('phone', e.target.value)}
                  placeholder="전화번호를 입력하세요 (선택사항)"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-password">비밀번호</label>
                <input
                  type="password"
                  id="register-password"
                  value={registerForm.password}
                  onChange={(e) => handleRegisterFormChange('password', e.target.value)}
                  placeholder="비밀번호를 입력하세요 (6자리 이상)"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-confirm-password">비밀번호 확인</label>
                <input
                  type="password"
                  id="register-confirm-password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => handleRegisterFormChange('confirmPassword', e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                  disabled={loading}
                />
                {registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword && (
                  <span className="password-mismatch">비밀번호가 일치하지 않습니다.</span>
                )}
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? '가입 중...' : '회원가입'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;