import { JobPostForm } from "../components/corpmem/Jobpost";
import { CareerType } from "./resume";

export interface JobPostSearchFilterOption {
  value: string;
  label: string;
}

export enum JobPostStatus {
  ONGOING = "ONGOING",
  CLOSED = "CLOSED",
  ENDED = "ENDED",
  // TEMP = 'TEMP',
}

export enum ApplicantStatus {
  UNREAD = "UNREAD", // 미열람
  PENDING = "PENDING", // 미심사
  PASSED = "PASSED", // 서류합격
  FAILED = "FAILED", // 불합격
  FINAL = "FINAL", // 최종합격
}

export enum ApplicantStep {
  DOCUMENT = "DOCUMENT",
  INTERVIEW = "INTERVIEW",
  FINAL = "FINAL",
  FAILED = "FAILED",
}

export interface JobPost {
  id: number;
  jobId: number;
  employerId: number;
  postNumber: string;
  logo_url: string;
  title: string;
  companyName: string;
  position: string;
  description: string;
  requirements: string;
  address: string;
  location: string;
  jobType: string;
  salary: string;
  countrycode: string;
  wrkcndtnLctRgnStr: string;
  status: JobPostStatus;
  views: number;
  startDate: string;
  endDate: string;
  registeredDate: string;
  createdAt: string;
  updatedAt: string;

  // 지원자 통계 관련 필드
  total_applier: number;
  unread: number;
  pending: number;
  paper_passed: number;
  failed: number;
  final_passed: number;
}

// 공고 목록 페이지 조회
export interface JobPostResponse {
  content: JobPost[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  total: number;
}

// 공고 상태별 개수 조회
// JobPostStatus
export interface JobPostCountResponse {
  [JobPostStatus.ONGOING]: number;
  [JobPostStatus.CLOSED]: number;
  [JobPostStatus.ENDED]: number;
  // [JobPostStatus.TEMP]: number;
}

export interface JobTypeResponse {
  jobTypeId: number;
  jobTypeName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Volunteer {
  applicantId: number | null;
  job_seeker_id: number;
  id: number;
  resumeId: number;
  jobId: number;
  employerId: number;
  companyName: string | null;
  gender: string;
  name: string;
  age: number;
  experience: string;
  careerType: CareerType | null;
  company: string | null;
  education: string;
  schoolName: string;
  major: string;
  gpa: string;
  totalCredits: string;
  expectedSalary: number;
  recentSalary: number | null;
  applicationDate: string;
  status: ApplicantStatus;
}

export interface VolunteerListResponse {
  content: Volunteer[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

export interface JobCategoryResponse {
  jobCategoryId: number;
  jobCategoryName: string;
  jobCategoryDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobPostDetailResponse extends JobPostForm {
  isScraped: boolean;
}
