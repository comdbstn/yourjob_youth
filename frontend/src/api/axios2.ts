import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8082";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // CORS 관련 설정 추가
});

// admin 경로 체크 함수
const isAdminPath = (url: string): boolean => {
  return url.startsWith("/admin");
};

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터
let isRedirecting = false;

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userType");
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("userType");
      alert("세션이 만료되었습니다. 다시 로그인해 주세요.");
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      window.location.href = isMobile
        ? "m/member/userlogin"
        : "/member/userlogin";
    }
    return Promise.reject(error);
  },
);
