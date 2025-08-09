import { JobListResponse } from '../app/dummy/jobPost';
import { axiosInstance } from './axios';


export const jobpostApi = {
  // 채용공고 목록 조회
  getJobposts: async (params: {
    page: number;
    size: number;
    searchType: string;
    query: string;
    country?: string;
    jobType?: string;
    location?: string;
    type?: string;
    company?: string;
  }) => {
    const response = await axiosInstance.get('/api/v1/jobs', { params });
    return response.data;
  },

  // 해당 채용공고의 직무 목록 조회
  getJobpostTypes: async (jobId: number) => {
    const response = await axiosInstance.get(`/api/v1/jobs/${jobId}/jobtyps`);
    return response.data;
  },

  // 스크랩 목록 조회
  getScraps: async (params: {
    page: number;
    size: number;
    searchType: string;
    query: string;
  }) => {
    const response = await axiosInstance.get('/api/v1/jobs/scrap', { params });
    return response.data;
  },

  // 스크랩 삭제
  deleteScraps: async (jobIds: number[]) => {
    return axiosInstance.delete('/api/v1/scraps', {
      data: { jobIds }
    });
  },

  // 스크랩 토글
  toggleScrap: async (jobId: number) => {
    return axiosInstance.post(`/api/v1/jobs/${jobId}/scrap`);
  }
};

export const getDummyJobposts = (): JobListResponse => {
  return {
    content: [
      {
        jobId: 1,
        scrapId: 1,
        employerId: 1,
        companyName: '주식회사 데이터솔루션',
        title: '프론트엔드 개발자 (React) 채용',
        description: '프론트엔드 개발자를 모집합니다',
        requirements: '경력 3년 이상',
        status: 'ACTIVE',
        location: '서울 강남구',
        countrycode: 'KR',
        jobType: '정규직',
        salary: '1,000~2,000만원',
        salaryType: '월급',
        views: 150,
        scrapes: 25,
        isApply: false,
        isScraped: true,
        endDate: '2024-04-30',
        createdAt: '2024-03-15',
        updatedAt: '2024-03-15'
      },
      {
        jobId: 2,
        scrapId: 2,
        employerId: 2,
        companyName: '(주)테크이노베이션',
        title: '백엔드 개발자 (Java/Spring) 채용',
        description: '백엔드 개발자를 모집합니다',
        requirements: '신입/경력',
        status: 'ACTIVE',
        location: '서울 서초구',
        countrycode: 'KR',
        jobType: '정규직',
        salary: '3,500~4,500만원',
        salaryType: '월급',
        views: 200,
        scrapes: 30,
        url: 'https://company.example.com/careers',
        isApply: false,
        isScraped: false,
        endDate: '2024-04-15',
        createdAt: '2024-03-10',
        updatedAt: '2024-03-10'
      },
      {
        jobId: 3,
        scrapId: 3,
        employerId: 3,
        companyName: '(주)클라우드시스템즈',
        title: '클라우드 엔지니어 채용',
        description: 'AWS/Azure 클라우드 엔지니어를 모집합니다',
        requirements: '경력 5년 이상',
        status: 'ACTIVE',
        location: '경기 성남시',
        countrycode: 'KR',
        jobType: '계약직',
        salary: '4,500~5,500만원',
        salaryType: '월급',
        views: 180,
        scrapes: 20,
        isApply: false,
        isScraped: true,
        endDate: '2024-05-15',
        createdAt: '2024-03-20',
        updatedAt: '2024-03-20'
      },
      {
        jobId: 4,
        scrapId: 4,
        employerId: 4,
        companyName: '(주)모바일솔루션',
        title: '모바일 앱 개발자 (React Native)',
        description: '모바일 앱 개발자를 모집합니다',
        requirements: '경력 무관',
        status: 'ACTIVE',
        location: '서울 영등포구',
        countrycode: 'KR',
        jobType: '정규직',
        salary: '3,000~4,000만원',
        salaryType: '월급',
        views: 120,
        scrapes: 15,
        url: 'https://mobile.example.com/jobs',
        isApply: false,
        isScraped: false,
        endDate: '2024-04-20',
        createdAt: '2024-03-12',
        updatedAt: '2024-03-12'
      }
    ],
    page: 0,
    size: 10,
    totalPages: 1,
    totalElements: 4
  };
};
