import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../api/axios';

/**
 * 설정 정보 타입 정의
 */
interface Settings {
    siteName: string;
    siteDescription: string;
    siteKeywords: string;
    siteEmail: string;
    sitePhone: string;
    siteAddress: string;
    siteLogo: string;
    siteFavicon: string;
    siteAnalytics: string;
    siteFooter: string;
}

/**
 * 설정 페이지 컴포넌트
 * @returns {JSX.Element} 설정 컴포넌트
 */
const Settings: React.FC = () => {
    const [settings, setSettings] = useState<Settings>({
        siteName: '',
        siteDescription: '',
        siteKeywords: '',
        siteEmail: '',
        sitePhone: '',
        siteAddress: '',
        siteLogo: '',
        siteFavicon: '',
        siteAnalytics: '',
        siteFooter: ''
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get<Settings>('/admin/settings');
            setSettings(response.data);
        } catch (error) {
            setError(error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.'));
            console.error('설정 로드 실패:', error);
            alert('설정을 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axiosInstance.put('/admin/settings', settings);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('설정 저장 실패:', error);
            alert('설정 저장에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div className="error-message">데이터 로딩 중 오류가 발생했습니다.</div>;

    return (
        <div className="main"> 
            <div className="contents">
                <div className="content">
                    <div className="container">
                        <article className="article-area">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="siteName">사이트 이름</label>
                                    <input
                                        type="text"
                                        id="siteName"
                                        name="siteName"
                                        value={settings.siteName}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="siteDescription">사이트 설명</label>
                                    <textarea
                                        id="siteDescription"
                                        name="siteDescription"
                                        value={settings.siteDescription}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="siteKeywords">사이트 키워드</label>
                                    <input
                                        type="text"
                                        id="siteKeywords"
                                        name="siteKeywords"
                                        value={settings.siteKeywords}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="siteEmail">사이트 이메일</label>
                                    <input
                                        type="email"
                                        id="siteEmail"
                                        name="siteEmail"
                                        value={settings.siteEmail}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="sitePhone">사이트 전화번호</label>
                                    <input
                                        type="tel"
                                        id="sitePhone"
                                        name="sitePhone"
                                        value={settings.sitePhone}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="siteAddress">사이트 주소</label>
                                    <input
                                        type="text"
                                        id="siteAddress"
                                        name="siteAddress"
                                        value={settings.siteAddress}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="siteLogo">사이트 로고</label>
                                    <input
                                        type="text"
                                        id="siteLogo"
                                        name="siteLogo"
                                        value={settings.siteLogo}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="siteFavicon">사이트 파비콘</label>
                                    <input
                                        type="text"
                                        id="siteFavicon"
                                        name="siteFavicon"
                                        value={settings.siteFavicon}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="siteAnalytics">사이트 분석 코드</label>
                                    <textarea
                                        id="siteAnalytics"
                                        name="siteAnalytics"
                                        value={settings.siteAnalytics}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="siteFooter">사이트 푸터</label>
                                    <textarea
                                        id="siteFooter"
                                        name="siteFooter"
                                        value={settings.siteFooter}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="btn-area">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={isLoading}
                                    >
                                        저장
                                    </button>
                                </div>

                                {success && (
                                    <div className="success-message">
                                        설정이 저장되었습니다.
                                    </div>
                                )}
                            </form>
                        </article>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings; 