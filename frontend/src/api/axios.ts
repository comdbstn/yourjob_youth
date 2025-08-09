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
const excludeUrls = ["/", "/m"];
const sessionCreateUrl = "/api/v1/auth/admin/create-session";


// 관리자 세션 생성 함수
const createAdminSession = async () => {
    try {
        const adminData = {
            userId: sessionStorage.getItem("userId"),
            accountId: sessionStorage.getItem("accountId"),
            userType: sessionStorage.getItem("userType"),
            userName: sessionStorage.getItem("userName"),
            userCompanyName: sessionStorage.getItem("userCompanyName") || ""
        };

        if (adminData.userType === "ADMIN" && adminData.userId) {
            const response = await axios.post(
                `${API_BASE_URL}${sessionCreateUrl}`,
                adminData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
};

// 요청 인터셉터
axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
        /*if (config.url && excludeUrls.some((u) => config.url!.startsWith(u))) {
          return config;
        }*/
        const token = localStorage.getItem("token");
        const userType = sessionStorage.getItem("userType");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (userType === "ADMIN") {
            // 세션 생성 시도
            const sessionCreated = await createAdminSession();
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
  (response: AxiosResponse) => {
      return response;
  },
  async (error) => {
    const { response, config } = error;
    const requestUrl = config?.url || "";
    const userType = sessionStorage.getItem("userType");

    // 401 에러이고 ADMIN 사용자인 경우
      if (response?.status === 401 && userType === "ADMIN") {
          const sessionCreated = await createAdminSession();

          if (sessionCreated) {
              // 세션 생성 성공 시 원래 요청 재시도
              return axiosInstance.request(config);
          }


      } else if (
          response?.status === 401 &&
          !isRedirecting &&
          !excludeUrls.includes(requestUrl) &&
          requestUrl !== sessionCreateUrl
      ) {
          isRedirecting = true;
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("userType");
          sessionStorage.removeItem("userId");
          sessionStorage.removeItem("userType");
          alert("로그인 후 이용 가능 합니다. 로그인 페이지로 이동합니다.");
          const isMobile = /Mobi|Android/i.test(navigator.userAgent);

          window.location.href = isMobile
              ? "/m/member/userlogin"
              : "/member/userlogin";

      }
    return Promise.reject(error);
  },
);
