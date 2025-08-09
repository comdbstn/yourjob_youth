import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {axiosInstance} from "./api/axios";
import axios from "axios";

const API_URL =
    process.env.REACT_APP_API_BASE_URL || "http://13.125.187.22:8082";

type SessionInfo = {
    userId: string;
    userType: string;
};

const SessionValidator: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

    // 관리자 세션 생성 함수
    const createAdminSession = async () => {
        try {
            const adminData = {
                userId: sessionStorage.getItem("userId"),
                accountId: sessionStorage.getItem("accountId"),
                userType: sessionStorage.getItem("userType"),
                userName: sessionStorage.getItem("userName") || "관리자",
                userCompanyName: sessionStorage.getItem("userCompanyName") || ""
            };

            if (adminData.userType === "ADMIN" && adminData.userId) {
                const response = await axios.post(
                    `${API_URL}/api/v1/auth/admin/create-session`,
                    adminData,
                    {
                        withCredentials: true,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );

                console.log("Admin session created:", response.data);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to create admin session:", error);
            return false;
        }
    };

    useEffect(() => {
        const validateSession = async () => {
            // 로그인, 회원가입 페이지는 제외
            const skipPaths = ["/oauth2/redirect", "/member/userlogin"];
            const mngrPaths = ["/m/company", "/corpmem", "/corpmodify", "/company/dashboard"]; // 채용자 전용 페이지
            const personPaths = ["/mypage", "/m/mypage"];
            const redirectPaths = ["/mypage", "/corpmodify", "editMyPage"];

            const isManagerPage = mngrPaths.some((path) =>
                location.pathname.startsWith(path)
            );
            const isPersonPage = personPaths.some((path) =>
                location.pathname.startsWith(path)
            );

            const userType = sessionStorage.getItem("userType");



            // 스킵할 경로인 경우 종료
            if (skipPaths.includes(location.pathname)) return;

            // ADMIN 사용자인 경우 세션 다시 생성
            if (userType === "ADMIN") {
                const sessionCreated = await createAdminSession();
            } else {
                try {
                    const response = await fetch(`${API_URL}/api/v1/auth/auth/session-check`, {
                        credentials: "include",
                    });

                    if (!response.ok) {
                        // 세션 없음, 저장소 초기화
                        sessionStorage.clear();
                        localStorage.clear();

                        if (redirectPaths.some(path => location.pathname.startsWith(path))) {
                            const isMobile = location.pathname.startsWith("/m/");
                            navigate(isMobile ? "/m/member/userlogin" : "/member/userlogin");
                        }
                        return;
                    }

                    const data = await response.json() as SessionInfo;

                    // 채용자 페이지 접근 권한 체크
                    if (isManagerPage && data.userType !== "COMPANY" && data.userType !== "EMPLOYER") {
                        console.warn("채용자가 아님 - 접근 불가");
                        sessionStorage.clear();
                        localStorage.clear();
                        const isMobile = location.pathname.startsWith("/m/");
                        navigate(isMobile ? "/m/member/userlogin" : "/member/userlogin");
                    }

                    // 구직자 페이지 접근 권한 체크
                    if (isPersonPage && data.userType !== "JOB_SEEKER") {
                        console.warn("구직자가 아님 - 접근 불가");
                        sessionStorage.clear();
                        localStorage.clear();
                        const isMobile = location.pathname.startsWith("/m/");
                        navigate(isMobile ? "/m/member/userlogin" : "/member/userlogin");
                    }

                } catch (error) {
                    console.error("세션 확인 실패", error);
                    sessionStorage.clear();
                    localStorage.clear();

                    if (redirectPaths.some(path => location.pathname.startsWith(path))) {
                        const isMobile = location.pathname.startsWith("/m/");
                        navigate(isMobile ? "/m/member/userlogin" : "/member/userlogin");
                    }
                }
            }
        };

        // async 함수 실행
        validateSession();
    }, [location, navigate]);

    return null;
};

export default SessionValidator;