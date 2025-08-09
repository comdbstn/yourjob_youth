import { axiosInstance } from "./axios";
import {
  Talent,
  JobPosition,
  ProposalRequestData,
  TalentResponse,
  ProposalTalent,
  ProposalTalentResponse,
  ProposalTalentSearchParams,
  ProposalTalentStatusResponse,
  ScrapTalent,
  ScrapTalentResponse,
  ScrapTalentSearchParams,
  LatestTalent,
  LatestTalentResponse,
  LatestTalentSearchParams,
} from "../types/talent";
import axios from "axios";

// 필터 타입 정의
interface TalentSearchParams {
  searchType?: string;
  gender?: string;
  status?: string;
  career?: string;
  workplace?: string;
  keyword?: string;
  page?: number;
  size?: number;
  sortType?: "recommended" | "updated";
}

// 인재 목록 조회
export const fetchTalents = async (
  searchParams: TalentSearchParams = {},
): Promise<TalentResponse> => {
  try {
    const response = await axiosInstance.get("/api/v1/talents", {
      params: {
        searchType: searchParams.searchType || "",
        gender: searchParams.gender || "",
        status: searchParams.status || "",
        career: searchParams.career || "",
        workplace: searchParams.workplace || "",
        keyword: searchParams.keyword || "",
        page: searchParams.page || 1,
        size: searchParams.size || 10,
        sortType: searchParams.sortType || "recommended",
      },
    });

    return response.data;
  } catch (error) {
    console.error("인재 목록 조회 API 오류:", error);
    // 오류 발생 시 빈 응답 객체 반환
    return {
      content: [],
      page: 0,
      size: 10,
      totalPages: 0,
      totalElements: 0,
    };
  }
};

// TOP 인재 목록 조회
export const fetchTopTalents = async (): Promise<TalentResponse> => {
  try {
    const response = await axiosInstance.get("/api/v1/talents/top");
    return response.data;
  } catch (error) {
    console.error("TOP 인재 목록 조회 API 오류:", error);
    return {
      content: [],
      page: 0,
      size: 10,
      totalPages: 0,
      totalElements: 0,
    };
  }
};

// 채용 포지션 목록 조회 API
export const fetchJobPositions = async (): Promise<JobPosition[]> => {
  try {
    const response = await axiosInstance.get<JobPosition[]>(
      "/api/v1/corpmem/posts",
    );
    return response.data;
  } catch (err) {
    console.error("채용 포지션 목록 조회 실패:", err);
    throw err;
  }
};

// 인재 스크랩 추가 API
export const addTalentScrap = async (userId: number): Promise<void> => {
  try {
    await axiosInstance.post(`/api/v1/talents/scrap/${userId}`);
  } catch (err) {
    console.error("인재 스크랩 추가 실패:", err);
    throw err;
  }
};

// 인재 스크랩 삭제 API
export const removeTalentScrap = async (talentId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/v1/talents/scrap/${talentId}`);
  } catch (err) {
    console.error("인재 스크랩 삭제 실패:", err);
    throw err;
  }
};

// 포지션 제안 API
export const sendPositionProposal = async (
  data: ProposalRequestData,
): Promise<void> => {
  try {
    await axiosInstance.post("/api/v1/corpmem/job-offers", data);
  } catch (err) {
    if (err instanceof axios.AxiosError) {
      if (err.response?.status === 409) {
        alert("포지션 제안 실패: 이미 제안된 인재 및 공고입니다.");
        throw new Error("포지션 제안 실패: 이미 제안된 인재 및 공고입니다.");
      } else if (err.response?.data) {
        // 서버에서 반환한 에러 메시지를 사용
        const errorMessage = err.response.data.message;
        alert(errorMessage);
        throw new Error(errorMessage);
      } else {
        alert("포지션 제안 전송에 실패했습니다. 다시 시도해주세요.");
      }
    }

    console.error("포지션 제안 실패:", err);
    throw err;
  }
};

// 포지션 제안 인재 목록 조회
export const fetchPositionProposals = async (
  searchParams: ProposalTalentSearchParams = {},
): Promise<ProposalTalentResponse> => {
  try {
    const response = await axiosInstance.get("/api/v1/corpmem/job-offers", {
      params: {
        page: searchParams.page || 1,
        size: searchParams.size || 10,
        status: searchParams.status || "",
        keyword: searchParams.keyword || "",
      },
    });

    return response.data;
  } catch (error) {
    console.error("포지션 제안 인재 목록 조회 API 오류:", error);
    // 오류 발생 시 빈 응답 객체 반환
    return {
      content: [],
      page: 0,
      size: 10,
      totalPages: 0,
      totalElements: 0,
    };
  }
};

// 포지션 제안 인재 목록 현황 조회
export const fetchProposalTalentStatus =
  async (): Promise<ProposalTalentStatusResponse> => {
    try {
      const response = await axiosInstance.get(
        "/api/v1/corpmem/job-offers/status",
      );
      return response.data;
    } catch (error) {
      console.error("포지션 제안 인재 목록 현황 조회 API 오류:", error);
      throw error;
    }
  };

// 면접 상태 변경 API
export const updateInterviewStatus = async (
  talentId: number,
  status: string,
): Promise<void> => {
  try {
    await axiosInstance.put(
      `/api/v1/corpmem/job-offers/${talentId}/interview-status`,
      { status },
    );
  } catch (err) {
    console.error("면접 상태 변경 실패:", err);
    throw err;
  }
};

// 포지션 제안 인재 삭제 API
export const deletePositionProposals = async (
  talentIds: number[],
): Promise<void> => {
  try {
    await axiosInstance.delete("/api/v1/corpmem/job-offers", {
      data: { talentIds },
    });
  } catch (err) {
    console.error("포지션 제안 인재 삭제 실패:", err);
    throw err;
  }
};

// 스크랩 인재 목록 조회
export const fetchScrapTalents = async (
  searchParams: ScrapTalentSearchParams = {},
): Promise<ScrapTalentResponse> => {
  try {
    const response = await axiosInstance.get("/api/v1/talents/scrap", {
      params: {
        page: searchParams.page || 1,
        size: searchParams.size || 10,
        keyword: searchParams.keyword || "",
      },
    });

    return response.data;
  } catch (error) {
    console.error("스크랩 인재 목록 조회 API 오류:", error);
    // 오류 발생 시 빈 응답 객체 반환
    return {
      content: [],
      page: 0,
      size: 10,
      totalPages: 0,
      totalElements: 0,
    };
  }
};

// 스크랩 인재 삭제 API
export const deleteScrapTalents = async (
  talentIds: number[],
): Promise<void> => {
  try {
    await axiosInstance.delete("/api/v1/talents/scrap", {
      data: { talentIds },
    });
  } catch (err) {
    console.error("스크랩 인재 삭제 실패:", err);
    throw err;
  }
};

// 최근 본 인재 목록 조회
export const fetchLatestTalents = async (
  searchParams: LatestTalentSearchParams = {},
): Promise<LatestTalentResponse> => {
  try {
    const response = await axiosInstance.get("/api/v1/talents/recent", {
      params: {
        page: searchParams.page || 1,
        size: searchParams.size || 10,
      },
    });

    return response.data;
  } catch (error) {
    console.error("최근 본 인재 목록 조회 API 오류:", error);
    // 오류 발생 시 빈 응답 객체 반환
    return {
      content: [],
      page: 0,
      size: 10,
      totalPages: 0,
      totalElements: 0,
    };
  }
};

// 임시 데이터 (API 연동 전까지 사용)
export const getMockTalents = (): Talent[] => {
  return [
    {
      id: 1,
      jobseekerId: 1,
      name: "홍길동",
      gender: "남",
      age: 30,
      career: {
        years: 2,
        months: 8,
        company: "ABC 회사",
        position: "마케팅팀 주임",
      },
      education: { school: "서울대학교", degree: "졸업" },
      location: "서울",
      skills: ["담당직무", "거래처관리", "MD"],
      isScraped: false,
    },
    {
      id: 2,
      jobseekerId: 2,
      name: "김철수",
      gender: "남",
      age: 28,
      career: {
        years: 1,
        months: 6,
        company: "XYZ 회사",
        position: "개발팀 사원",
      },
      education: { school: "연세대학교", degree: "졸업" },
      location: "경기",
      skills: ["개발", "프로그래밍", "Java"],
      isScraped: true,
    },
    {
      id: 3,
      jobseekerId: 3,
      name: "이영희",
      gender: "여",
      age: 32,
      career: {
        years: 3,
        months: 4,
        company: "DEF 회사",
        position: "디자인팀 과장",
      },
      education: { school: "홍익대학교", degree: "졸업" },
      location: "서울",
      skills: ["디자인", "UI/UX", "그래픽"],
      isScraped: false,
    },
  ];
};

// 임시 채용 포지션 데이터
export const getMockJobPositions = (): JobPosition[] => {
  return [
    { id: 1, title: "[(주)유어잡]문구, 캐릭터 디자인 정규직 채용(경력&신입)" },
    { id: 2, title: "[(주)유어잡]패키지 디자이너 채용" },
    { id: 3, title: "[(주)유어잡]기획 경력직 채용" },
    { id: 4, title: "[(주)유어잡]개발자 상시채용" },
  ];
};

// 임시 데이터 (API 연동 전까지 사용)
export const getMockProposalTalents = (): ProposalTalent[] => {
  return [
    {
      id: 1,
      name: "홍길동",
      gender: "남",
      age: 30,
      career: { years: 2, months: 8, company: "ABC 회사" },
      education: { school: "서울대학교", degree: "졸업" },
      manager: "홍길동",
      proposalDate: "2024-01-01",
      responseStatus: "수락",
      interviewStatus: "면접중",
    },
    {
      id: 2,
      name: "김철수",
      gender: "남",
      age: 28,
      career: { years: 1, months: 6, company: "XYZ 회사" },
      education: { school: "연세대학교", degree: "졸업" },
      manager: "홍길동",
      proposalDate: "2024-01-01",
      responseStatus: "거절",
      interviewStatus: "면접중",
    },
    {
      id: 3,
      name: "이영희",
      gender: "여",
      age: 32,
      career: { years: 3, months: 4, company: "DEF 회사" },
      education: { school: "홍익대학교", degree: "졸업" },
      manager: "홍길동",
      proposalDate: "2024-01-01",
      responseStatus: "미응답",
      interviewStatus: "면접중",
    },
  ];
};

// 임시 데이터 (API 연동 전까지 사용)
export const getMockScrapTalents = (): ScrapTalent[] => {
  return [
    {
      id: 1,
      name: "홍길동",
      gender: "남",
      age: 30,
      career: { years: 2, months: 8, company: "ABC 회사" },
      education: {
        school: "서울대학교",
        degree: "졸업",
        major: "컴퓨터공학",
        gpa: "3.5",
      },
      isPublic: true,
      scrapDate: "2024-01-01",
      resumeId: 0,
    },
    {
      id: 2,
      name: "김철수",
      gender: "남",
      age: 28,
      career: { years: 1, months: 6, company: "XYZ 회사" },
      education: {
        school: "연세대학교",
        degree: "졸업",
        major: "컴퓨터공학",
        gpa: "3.5",
      },
      isPublic: false,
      scrapDate: "2024-01-01",
      resumeId: 0,
    },
  ];
};

// 임시 데이터 (API 연동 전까지 사용)
export const getMockLatestTalents = (): LatestTalent[] => {
  return [
    {
      id: 1,
      name: "홍길동",
      gender: "남",
      age: 30,
      career: { years: 2, months: 8, company: "ABC 회사" },
      education: {
        school: "서울대학교",
        degree: "졸업",
        major: "컴퓨터공학",
        gpa: "3.5",
        totalCredits: "4.0",
      },
      isPublic: true,
      isScraped: false,
      viewDate: "2024-01-01",
    },
    {
      id: 2,
      name: "김철수",
      gender: "남",
      age: 28,
      career: { years: 1, months: 6, company: "XYZ 회사" },
      education: {
        school: "연세대학교",
        degree: "졸업",
        major: "컴퓨터공학",
        gpa: "3.5",
        totalCredits: "4.0",
      },
      isPublic: false,
      isScraped: true,
      viewDate: "2024-01-01",
    },
  ];
};
