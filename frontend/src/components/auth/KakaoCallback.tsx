import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const KakaoCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('카카오 로그인 오류:', error);
        alert('카카오 로그인 중 오류가 발생했습니다.');
        navigate('/');
        return;
      }

      if (code) {
        // 카카오 인증 코드를 받았지만, 실제로는 JavaScript SDK를 사용하므로
        // 이 페이지는 사용되지 않을 수 있습니다.
        console.log('카카오 인증 코드:', code);
        navigate('/');
      } else {
        console.error('카카오 인증 코드를 받지 못했습니다.');
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div>카카오 로그인 처리 중...</div>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default KakaoCallback;