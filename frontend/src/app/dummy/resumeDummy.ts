export interface ResumeListResponse {
  id: number;
  title: string;
  date: string;
}

export interface ResumeDetailResponse {
  id: number;
  title: string;
  date: string;
  // detail
  picturePath: string; // 이력서 사진
  name: string; // 이름
  englishName: string; // 영문 이름
  birth: string; // 생년월일
  gender: string; // 성별
  careerType: string; // 경력(신입/경력)
  phone: string; // 전화번호
  address: string; // 주소
  email: string; // 이메일
  nationality: string; // 국적
  visa: string; // 비자
  // 학력
  educations: {
    lastSchool: string; // 최종학교
    schoolName: string; // 학교명
    department: string; // 학과
    admissionDate: string; // 입학년월
    graduationDate: string; // 졸업년월
    graduationStatus: string; // 졸업상태
    totalCredits: number; // 학점총점
    gpa: number; // 학점
    transferStatus: boolean; // 편입여부
    region: string; // 지역
    additionalMajor: string; // 추가전공
  }[];
  // 어학
  languages: {
    language: string; // 외국어
    speakingLevel: string; // 회화수준
    writingLevel: string; // 작문수준
    readingLevel: string; // 독해수준
  }[];
  // 경력
  careers: {
    companyName: string; // 회사명
    jobTitle: string; // 담당직무
    position: string; // 직급/직책
    responsibilities: string; // 담당업무
    startDate: string; // 입사년월
    endDate: string; // 퇴사년월
    isCurrent: boolean; // 재직여부
  }[];
  // 인턴/대외활동
  activities: {
    activityType: string; // 활동구분
    organizationName: string; // 회사/기관/단체명
    startDate: string; // 시작년월
    endDate: string; // 종료년월
    description: string; // 활동내용
  }[];
  // 아포스티유
  apostilles: {
    file: string; // 아포스티유(파일)
  }[];
  // 자격증
  certifications: {
    certificationName: string; // 자격증명
    issuingOrganization: string; // 발행처
    acquisitionDate: string; // 취득년월
  }[];
  // 수상
  awards: {
    awardName: string; // 수상명
    awardingOrganization: string; // 수여기관
    awardYear: string; // 수상연도
    description: string; // 활동내용
  }[];
  // 취업우대/병역
  employmentPreferences: {
    isVeteran: boolean; // 보훈대상여부
    isEmploymentProtected: boolean; // 취업보호대상여부
    isEmploymentSupport: boolean; // 고용지원금대상여부
    isDisabled: boolean; // 장애여부
    disabledGrade: string; // 장애 등급
    hasMilitaryService: boolean; // 병역여부
    militaryServiceStatus: string; // 병역 상태
    militaryServiceJoinDate: string; // 입대일
    militaryServiceOutDate: string; // 제대일
    militaryServiceClass: string; // 제대 계급

  };
  // 자기소개서
  selfIntroductions: {
    title: string; // 자기소개서 제목
    content: string; // 자기소개서 내용
  }[];
}

export interface ResumeListPageResponse {
  content: ResumeListResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const dummyResumeListResponse: ResumeListPageResponse = {
  content: [
    { id: 1, title: 'Resume 1', date: '2023-01-01' },
    { id: 2, title: 'Resume 2', date: '2023-01-02' },
    { id: 3, title: 'Resume 3', date: '2023-01-03' },
    { id: 4, title: 'Resume 4', date: '2023-01-04' },
    { id: 5, title: 'Resume 5', date: '2023-01-05' },
    { id: 6, title: 'Resume 6', date: '2023-01-06' },
    { id: 7, title: 'Resume 7', date: '2023-01-07' },
    { id: 8, title: 'Resume 8', date: '2023-01-08' },
    { id: 9, title: 'Resume 9', date: '2023-01-09' },
    { id: 10, title: 'Resume 10', date: '2023-01-10' },
  ],
  page: 1,
  size: 10,
  totalElements: 10,
  totalPages: 1
};

export const dummyResumeDetailResponse: ResumeDetailResponse = {
  id: 1,
  title: 'Sample Resume',
  date: '2023-01-01',
  picturePath: '/images/sample.jpg',
  name: 'John Doe',
  englishName: 'John Doe',
  birth: '1990-01-01',
  gender: 'male',
  careerType: 'junior',
  phone: '123-456-7890',
  address: '123 Main St, Anytown, USA',
  email: 'john.doe@example.com',
  nationality: 'American',
  visa: 'H1B',
  educations: [
    {
      lastSchool: 'XYZ University',
      schoolName: 'XYZ University',
      department: 'Computer Science',
      admissionDate: '2008-09',
      graduationDate: '2012-06',
      graduationStatus: 'Graduated',
      totalCredits: 120,
      gpa: 3.8,
      transferStatus: false,
      region: 'New York',
      additionalMajor: 'Mathematics'
    }
  ],
  languages: [
    {
      language: 'English',
      speakingLevel: 'Fluent',
      writingLevel: 'Fluent',
      readingLevel: 'Fluent'
    }
  ],
  careers: [
    {
      companyName: 'ABC Corp',
      jobTitle: 'Software Engineer',
      position: 'Senior Developer',
      responsibilities: 'Developing web applications',
      startDate: '2015-01',
      endDate: '2020-12',
      isCurrent: false
    }
  ],
  activities: [
    {
      activityType: 'Internship',
      organizationName: 'DEF Inc',
      startDate: '2013-06',
      endDate: '2013-12',
      description: 'Worked on various projects'
    }
  ],
  apostilles: [
    {
      file: '/documents/apostille.pdf'
    }
  ],
  certifications: [
    {
      certificationName: 'Certified Java Developer',
      issuingOrganization: 'Oracle',
      acquisitionDate: '2014-05'
    }
  ],
  awards: [
    {
      awardName: 'Best Developer Award',
      awardingOrganization: 'XYZ University',
      awardYear: '2012',
      description: 'Awarded for outstanding performance'
    }
  ],
  employmentPreferences: {
    isVeteran: false,
    isEmploymentProtected: false,
    isEmploymentSupport: false,
    isDisabled: false,
    disabledGrade: '',
    hasMilitaryService: false,
    militaryServiceStatus: '',
    militaryServiceJoinDate: '',
    militaryServiceOutDate: '',
    militaryServiceClass: '',
  },
  selfIntroductions: [
    {
      title: 'About Me',
      content: 'I am a passionate software developer with over 10 years of experience...'
    }
  ]
};

export const fnGetResumeList = (page: number, size: number): ResumeListPageResponse => {
  return {
    ...dummyResumeListResponse,
    content: dummyResumeListResponse.content.slice((page - 1) * size, page * size),
    page,
    size,
    totalElements: dummyResumeListResponse.content.length,
    totalPages: Math.ceil(dummyResumeListResponse.content.length / size)
  };
};

export const fnGetResume = (id: number): ResumeDetailResponse | undefined => {
  return dummyResumeDetailResponse;
};


