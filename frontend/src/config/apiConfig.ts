// API Configuration
const API_CONFIG = {
  // 기본 API URL - Railway 배포 시 환경변수로 덮어씀
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082',
  BFF_URL: process.env.REACT_APP_BFF_BASE_URL || 'http://localhost:8081',
  
  // OAuth2 리다이렉트 URI
  OAUTH2_REDIRECT_URI: process.env.REACT_APP_OAUTH2_REDIRECT_URI || 'https://www.urjob.kr/oauth2/redirect',
  
  // API 엔드포인트
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      SIGNUP: '/api/auth/signup',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
    },
    JOBS: {
      LIST: '/api/jobs',
      DETAIL: '/api/jobs',
      CREATE: '/api/jobs',
      UPDATE: '/api/jobs',
      DELETE: '/api/jobs',
    },
    USERS: {
      PROFILE: '/api/users/profile',
      UPDATE: '/api/users/profile',
    },
    ADMIN: {
      DASHBOARD: '/api/admin/dashboard',
      USERS: '/api/admin/users',
      STATS: '/api/admin/statistics',
    }
  }
};

export default API_CONFIG;
export const API_URL = API_CONFIG.BASE_URL;
export const BFF_URL = API_CONFIG.BFF_URL;
