import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuth2RedirectHandler: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 모바일 기기 감지
    const isMobileDevice = () => {
        const userAgent = navigator.userAgent;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    };

    // JWT 토큰 디코딩
    const decodeJwt = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map(c => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('토큰 디코딩 오류:', error);
            return null;
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const isNewUser = params.get('isNewUser') === 'true';
        const error = params.get('error');

        if (token) {
            // 토큰 저장
            localStorage.setItem('token', token);

            // 토큰에서 정보 추출
            const decodedToken = decodeJwt(token);

            const userId = decodedToken?.sub || decodedToken?.userId;
            const userType = decodedToken?.role || decodedToken?.userType;
            const email = decodedToken?.email;

            if (userId) sessionStorage.setItem("userId", userId);
            if (userType) sessionStorage.setItem("userType", userType);

            // 모바일 기기 확인 후 리다이렉트
            if (isMobileDevice()) {
                navigate('/m');
            } else {
                navigate('/');
            }
        } else if (error === "access_denied") {
            // 사용자가 로그인 취소한 경우
            const isMobile = location.pathname.startsWith("/m/");
            navigate(isMobile ? "/m/member/userlogin" : "/member/userlogin");
            //navigate("/member/userlogin"); // 또는 모바일이면 "/m/member/userlogin"
        } else {
            navigate('/member/userlogin', {
                state: { from: location, error: error }
            });
        }
    }, [location, navigate]);

    return null;
};

export default OAuth2RedirectHandler;