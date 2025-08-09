export interface JobResponse {
  wrkcndtnLctRgnStr?: string;
  jobId: number;
  scrapId: number;
  employerId: number;
  companyName: string;
  logo_url?: string;
  title: string;
  description: string;
  requirements: string;
  status: string;
  location: string;
  countrycode: string;
  jobType: string;
  salary: string;
  salaryType: string;
  views: number;
  scrapes: number;
  url?: string;
  isApply: boolean;
  isScraped?: boolean;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  jobStrtTm?: string;
  jobEndTm?: string;
  isApplied?: boolean;
}

export interface JobListResponse {
  content: JobResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
