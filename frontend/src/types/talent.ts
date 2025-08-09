// 인재 정보 인터페이스
export interface Talent {
  id: number;
  jobseekerId: number;
  profileImage?: string;
  name: string;
  gender: string;
  age: number;
  career: {
    years: number;
    months: number;
    company?: string;
    position?: string;
  };
  education?: {
    school: string;
    degree: string;
  };
  location?: string;
  skills: string[];
  isScraped: boolean;
}

// 인재 목록 페이징 응답 인터페이스
export interface TalentResponse {
  content: Talent[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

// 채용 포지션 인터페이스
export interface JobPosition {
  id: number;
  title: string;
}

// 포지션 제안 데이터 인터페이스
export interface ProposalData {
  jobseekerId: number;
  position: string;
  message: string;
  positionInfo?: string;
  manager?: string;
  jobPostId?: number;
}

// 포지션 제안 요청 데이터 인터페이스
export interface ProposalRequestData {
  jobseekerId: number;
  userId: number;
  position: string;
  message: string;
  positionInfo: string;
  manager: string;
  jobPostId: number;
}

// 포지션 제안 인재 정보 인터페이스
export interface ProposalTalent {
  id: number;
  resumeid?: number;
  name: string;
  gender: string;
  age: number;
  career: {
    years: number;
    months: number;
    company?: string;
  };
  education?: {
    school: string;
    degree: string;
  };
  manager: string;
  proposalDate: string;
  responseStatus: "수락" | "거절" | "미응답";
  interviewStatus: string;
}

// 포지션 제안 인재 목록 페이징 응답 인터페이스
export interface ProposalTalentResponse {
  content: ProposalTalent[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

// 포지션 제안 인재 목록 현황 응답 인터페이스
export interface ProposalTalentStatusResponse {
  counts: {
    accept: number;
    reject: number;
    none: number;
  };
}
// 포지션 제안 인재 검색 파라미터 인터페이스
export interface ProposalTalentSearchParams {
  page?: number;
  size?: number;
  status?: string;
  keyword?: string;
}

// 스크랩 인재 인터페이스
export interface ScrapTalent {
  id: number;
  resumeId: number;
  name: string;
  gender: string;
  age: number;
  career: {
    years: number;
    months: number;
    company?: string;
  };
  education?: {
    school: string;
    degree: string;
    major: string;
    gpa: string;
  };
  isPublic: boolean;
  scrapDate: string;
}

// 스크랩 인재 목록 페이징 응답 인터페이스
export interface ScrapTalentResponse {
  content: ScrapTalent[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

// 스크랩 인재 검색 파라미터 인터페이스
export interface ScrapTalentSearchParams {
  page?: number;
  size?: number;
  keyword?: string;
}

// 최근 본 인재 인터페이스
export interface LatestTalent {
  id: number;
  name: string;
  gender: string;
  age: number;
  career: {
    years: number;
    months: number;
    company?: string;
  };
  education?: {
    school: string;
    degree: string;
    major: string;
    gpa: string;
    totalCredits: string;
  };
  isPublic: boolean;
  isScraped: boolean;
  viewDate: string;
}

// 최근 본 인재 목록 페이징 응답 인터페이스
export interface LatestTalentResponse {
  content: LatestTalent[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

// 최근 본 인재 검색 파라미터 인터페이스
export interface LatestTalentSearchParams {
  page?: number;
  size?: number;
}
