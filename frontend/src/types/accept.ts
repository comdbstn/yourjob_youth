export interface SearchParams {
  page: number;
  size: number;
  searchType?: string;
  query?: string;
  field?: string | string[]; // 문자열 또는 문자열 배열을 모두 허용
  country?: string | string[]; // 문자열 또는 문자열 배열을 모두 허용
  sortBy?: string;
  sortDir?: string;
}

export interface AcceptListItem {
  id: number;
  companyName: string;
  logo_url: string;
  question: string;
  answer: string;
  period: string;
  career: string;
  position: string;
}

export interface AcceptListResponse {
  content: AcceptListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AcceptDetailType {
  resume: {
    resumeId: number;
    title: string;
    companyName: string;
    jobCategory: string;
    jobTitle: string;
    schoolRegion: string;
    schoolType: string;
    major: string;
    gpa: string;
    gpaScale: string;
    awardsCount: number;
    clubActivitiesCount: number;
    internshipCount: number;
    certificationCount: number;
    viewCount: number;
    createdAt: string;
  };
  answers: {
    questionText: string;
    answerText: string;
    characterCount: number;
    byteCount: number;
    questionIdx: number;
  }[];
}

export interface AcceptItem {
  title: string;
  content: string;
}

export interface AcceptPostItem {
  jobPostId: number;
  company: {
    companyId: number;
    companyName: string;
    countryType: string;
    corpLogoUrl: string;
    createdAt: string;
    updatedAt: string;
  };
  jobCategory: string;
  jobTitle: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcceptQuestionItem {
  questionText: string;
  answerText: string;
  characterCount: number;
  byteCount: number;
}

export interface AcceptPostRequest {
  title: string;
  items: AcceptItem[];
}

export interface AcceptPostTab {
  id: string;
  label: string;
}

export interface MyAcceptPostItem {
  id: number;
  title: string;
  items: AcceptItem[];
  createdAt: string;
}

export interface AcceptOtherPostItem {
  resumeId: number;
  title: string;
  userId: number;
  createdAt: string;
  schoolType: string;
  schoolRegion: string;
  major: string;
  gpa: number;
  gpaScale: number;
  awardsCount: number;
  clubActivitiesCount: number;
  internshipCount: number;
  certificationCount: number;
  viewCount: number;
  jobPost: {
    jobTitle: string;
    company: {
      companyName: string;
      corpLogoUrl: string;
    };
  };
}

export interface MyIntroductionQuestion {
  questionText: string;
  answerText: string;
  questionIdx: number;
  answerId?: number;
  isFromApi?: boolean;
  isModified?: boolean;
  originalAnswerText?: string;
}

export interface MyIntroductionRequest {
  title: string;
  isFinished: boolean;
  questions?: MyIntroductionQuestion[];
}

export interface SuccessfulResumeListResponse {
  content: SuccessfulResumeItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
export interface QnAItem {
  answerId: number;
  questionText: string;
  answerText: string;
}
export interface SuccessfulResumeItem {
  resumeId: number;
  title: string;
  userId: number;
  questionAnswers: QnAItem[];
  jobPost: {
    postPeriod: string;
    careerLevel: string;

    jobPostId: number;
    company: {
      companyId: number;
      companyName: string;
      countryType: string;
      corpLogoUrl: string;
      createdAt: string;
      updatedAt: string;
    };
    jobCategory: string;
    jobTitle: string;
    createdAt: string;
    updatedAt: string;
  };
  viewCount: number;
  schoolRegion: string;
  schoolType: string;
  major: string;
  gpa: number;
  gpaScale: number;
  awardsCount: number;
  clubActivitiesCount: number;
  internshipCount: number;
  certificationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MyIntroductionDto {
  myIntroductionId: number;
  title: string;
  isFinished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MyIntroductionQuestionAnswerDto {
  answerId: number;
  questionText: string;
  answerText: string;
  characterCount?: number;
  byteCount?: number;
  questionIdx?: number;
}

export interface MyIntroductionDetail {
  introduction: MyIntroductionDto;
  answers: MyIntroductionQuestionAnswerDto[];
}

export interface MyIntroductionListResponse {
  content: MyIntroductionDto[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}