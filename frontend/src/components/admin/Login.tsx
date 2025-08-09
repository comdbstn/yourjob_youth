import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../api/axios';
import '../../styles/admin.css';

/**
 * 로그인 폼 데이터 타입 정의
 */
interface LoginFormData {
    username: string;
    password: string;
}

/**
 * 로그인 페이지 컴포넌트
 * @returns {JSX.Element} 로그인 컴포넌트
 */
const Login: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<LoginFormData>({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState<{
        username?: string;
        password?: string;
    }>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};
        let isValid = true;

        if (!formData.username.trim()) {
            newErrors.username = '아이디를 입력해주세요.';
            isValid = false;
        }

        if (!formData.password.trim()) {
            newErrors.password = '비밀번호를 입력해주세요.';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // 에러 메시지 초기화
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // 개발 데모를 위한 임시 처리
            localStorage.setItem('adminToken', 'demo-token');
            navigate('/admin/dashboard');
        } catch (error) {
            setError(new Error('로그인 중 오류가 발생했습니다.'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleFindPassword = () => {
        // TODO: 비밀번호 찾기 페이지로 이동
        alert('비밀번호 찾기 기능은 준비 중입니다.');
    };

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div className="error-message">로그인 중 오류가 발생했습니다.</div>;

    return (
        <div className="admin-container">
            <div className="container">
                <div className="login-box">
                    <div className="logo">
                        <img src="/admin/assets/images/logo.png" alt="로고" />
                    </div>
                    <span className="title mt-20">유어잡 관리자페이지</span>
                    <form onSubmit={handleSubmit}>
                        <fieldset>
                            <legend>로그인 폼</legend>
                            <div className="control">
                                <input 
                                    type="text"
                                    name="username"
                                    placeholder="아이디를 입력하세요"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                />
                                {errors.username && (
                                    <div className="error-message">{errors.username}</div>
                                )}
                            </div>
                            <div className="control">
                                <input 
                                    type="password"
                                    name="password"
                                    placeholder="비밀번호를 입력하세요"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                />
                                {errors.password && (
                                    <div className="error-message">{errors.password}</div>
                                )}
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary is-fullwidth mt-20"
                            >
                                로그인
                            </button>
                        </fieldset>

                        <div className="password--find">
                            <button 
                                type="button" 
                                className="btn-link"
                                onClick={handleFindPassword}
                            >
                                비밀번호 찾기
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login; 