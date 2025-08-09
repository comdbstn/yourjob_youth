import { InternType, VisaType } from "../app/dummy/options";

// 기본 이력서 폼 타입
export interface ResumeForm {
  title: string;
  picturePath: string;
  name: string;
  englishName: string;
  birth: string;
  gender: string;
  careerType: CareerType;
  phone: string;
  address: string;
  email: string;
  nationality: string;
  visa: VisaType[];
  educations: Education[];
  languages: Language[];
  careers: Career[];
  activities: Activity[];
  apostilles: Apostille[];
  certifications: Certification[];
  awards: Award[];
  employmentPreferences: EmploymentPreferences;
  selfIntroductions: SelfIntroduction[];
}

// 기업 사용자 조회 시 이력서 타입
export interface CorporateResumeForm extends ResumeForm {
  responseStatus: string;
  blind?: boolean;
}

// 학력 정보
export interface Education {
  lastSchool: string;
  schoolName: string;
  department: string;
  admissionDate: string;
  graduationDate: string;
  graduationStatus: string;
  totalCredits: number | string;
  gpa: number | string;
  transferStatus: boolean;
  region: string;
  additionalMajor: string;
  additionalMajorType: string;
}

// 어학능력 정보
export interface Language {
  language: string;
  speakingLevel: string;
  writingLevel: string;
  readingLevel: string;
}

// 경력 정보
export interface Career {
  companyName: string;
  jobTitle: string;
  position: string;
  responsibilities: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

// 대외활동 정보
export interface Activity {
  activityType: string;
  organizationName: string;
  startDate: string;
  endDate: string;
  description: string;
}

// 아포스티유 정보
export interface Apostille {
  file?: File | null;
  apo_file_nm?: string;
  apo_download_url?: string;
}

// 자격증 정보
export interface Certification {
  certificationName: string;
  issuingOrganization: string;
  acquisitionDate: string;
}

// 수상 정보
export interface Award {
  awardName: string;
  awardingOrganization: string;
  awardYear: string;
  description: string;
}

// 취업우대사항
export interface EmploymentPreferences {
  isVeteran: boolean;
  isEmploymentProtected: boolean;
  isEmploymentSupport: boolean;
  isDisabled: boolean;
  disabledGrade: string;
  hasMilitaryService: boolean;
  militaryServiceStatus: string;
  militaryServiceJoinDate: string;
  militaryServiceOutDate: string;
  militaryServiceClass: string;
}

// 자기소개서
export interface SelfIntroduction {
  title: string;
  content: string;
}

// 이력서 목록 페이지 관련 타입
export interface ResumePage {
  content: ResumeItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 이력서 목록 아이템
export interface ResumeItem {
  id: number;
  title: string;
  date: string;
  status: "ACTIVE" | "INACTIVE";
  isPublic: boolean;
}

// 셀렉트박스 옵션 타입
export interface SelectOption {
  value: string;
  label: string;
}

// 경력 타입 정의
export const CAREER_TYPE = {
  JUNIOR: "JUNIOR",
  SENIOR: "SENIOR",
} as const;

export type CareerType = (typeof CAREER_TYPE)[keyof typeof CAREER_TYPE];

export const CAREER_TYPE_TEXT: Record<CareerType, string> = {
  [CAREER_TYPE.JUNIOR]: "신입",
  [CAREER_TYPE.SENIOR]: "경력",
} as const;

export const getCareerTypeText = (careerType: CareerType): string => {
  return CAREER_TYPE_TEXT[careerType.toLocaleUpperCase() as CareerType];
};

// 장애 등급 타입 정의
export const DISABLED_GRADE = {
  SEVERE: "SEVERE",
  MILD: "MILD",
  LEVEL1: "LEVEL1",
  LEVEL2: "LEVEL2",
  LEVEL3: "LEVEL3",
  LEVEL4: "LEVEL4",
  LEVEL5: "LEVEL5",
} as const;

export type DisabledGrade =
  (typeof DISABLED_GRADE)[keyof typeof DISABLED_GRADE];

export const DISABLED_GRADE_TEXT: Record<DisabledGrade, string> = {
  [DISABLED_GRADE.SEVERE]: "중증",
  [DISABLED_GRADE.MILD]: "경증",
  [DISABLED_GRADE.LEVEL1]: "1급",
  [DISABLED_GRADE.LEVEL2]: "2급",
  [DISABLED_GRADE.LEVEL3]: "3급",
  [DISABLED_GRADE.LEVEL4]: "4급",
  [DISABLED_GRADE.LEVEL5]: "5급",
} as const;

export const getDisabledGradeText = (disabledGrade: DisabledGrade): string => {
  return DISABLED_GRADE_TEXT[
    disabledGrade.toLocaleUpperCase() as DisabledGrade
  ];
};

// 인턴/대외활동 타입 텍스트 정의
export const INTERN_TYPE_TEXT: Record<InternType, string> = {
  [InternType.INTERN]: "인턴",
  [InternType.PART_TIME]: "아르바이트",
  [InternType.CLUB]: "동아리",
  [InternType.VOLUNTEER]: "자원봉사",
  [InternType.SOCIAL]: "사회활동",
  [InternType.SCHOOL]: "교내활동",
  [InternType.ETC]: "기타",
} as const;

export const getInternTypeText = (internType: InternType): string => {
  return INTERN_TYPE_TEXT[internType];
};
