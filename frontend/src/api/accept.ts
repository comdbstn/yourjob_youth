import { axiosInstance } from './axios';
import {
  AcceptListResponse,
  SearchParams,
  AcceptDetailType,
  AcceptPostRequest,
  MyAcceptPostItem,
  AcceptOtherPostItem,
  AcceptPostItem,
  AcceptQuestionItem,
  MyIntroductionRequest,
  SuccessfulResumeListResponse,
  MyIntroductionDetail,
  MyIntroductionQuestion
} from '../types/accept';

export const acceptApi = {
  // 합격 자소서 목록 조회
  getAcceptList: async (params: SearchParams) => {
    const response = await axiosInstance.get<AcceptListResponse>('/api/v1/accepts', { params });
    return response.data;
  },

  // 합격 자소서 상세 조회
  getAcceptDetail: async (id: number): Promise<AcceptDetailType> => {
    const response = await axiosInstance.get(`/api/v1/successful-resumes/${id}`);
    return response.data.data;
  },

  // 채용공고 목록 조회
  getAcceptPosts: async (params: SearchParams): Promise<AcceptPostItem[]> => {
    const response = await axiosInstance.get('/api/v1/successful-resumes/job-posts', { params });
    return response.data.data.content;
  },

  // 채용공고 질문 조회
  getAcceptQuestions: async (id: number): Promise<{ templates: AcceptQuestionItem[] }> => {
    const response = await axiosInstance.get(`/api/v1/successful-resumes/templates?jobPostId=${id}`);
    return response.data.data;
  },

  // 합격자소서 목록 조회 (다중 필터링 지원)
  getSuccessfulResumes: async (params: SearchParams): Promise<SuccessfulResumeListResponse> => {
    // 요청 파라미터 복사
    const queryParams = { ...params };

    // field 파라미터 처리 - 배열인 경우 파이프로 연결된 문자열로 변환
    if (Array.isArray(queryParams.field)) {
      queryParams.field = queryParams.field.join('|');
    }

    // country 파라미터 처리 - 배열인 경우 파이프로 연결된 문자열로 변환
    if (Array.isArray(queryParams.country)) {
      queryParams.country = queryParams.country.join('|');
    }

    const response = await axiosInstance.get('/api/v1/successful-resumes', {
      params: queryParams
    });
    return response.data.data;
  },

  // 합격자소서 상세 조회
  getSuccessfulResumeDetail: async (id: number): Promise<AcceptDetailType> => {
    const response = await axiosInstance.get(`/api/v1/successful-resumes/${id}`);
    return response.data.data;
  },

  // 내 자소서 목록 조회
  getMyIntroductions: async (params: { page: number; size: number; sortBy?: string; sortDir?: string; title?: string }) => {
    const response = await axiosInstance.get('/api/v1/my-introduction', { params });
    return response.data.data;
  },

  // 내 자소서 상세 조회
  getMyIntroductionDetail: async (id: number): Promise<MyIntroductionDetail> => {
    const response = await axiosInstance.get(`/api/v1/my-introduction/${id}`);
    return response.data.data;
  },

  // 내 자소서 저장
  saveMyIntroduction: async (data: MyIntroductionRequest) => {
    const response = await axiosInstance.post('/api/v1/my-introduction', data);
    return response.data.data;
  },

  // 내 자소서 삭제
  deleteMyIntroduction: async (id: number) => {
    const response = await axiosInstance.delete(`/api/v1/my-introduction/${id}`);
    return response.data.data;
  },

  // 내 자소서 수정
  updateMyIntroduction: async (id: number, data: MyIntroductionRequest) => {
    const response = await axiosInstance.put(`/api/v1/my-introduction/${id}`, data);
    return response.data.data;
  },

  // 내 자소서 질문 일괄 추가
  addMyIntroductionQuestions: async (myIntroductionId: number, questions: MyIntroductionQuestion[]) => {
    const response = await axiosInstance.post(`/api/v1/my-introduction/${myIntroductionId}/questions/batch`, { questions });
    return response.data.data;
  },

  // 내 자소서 질문 삭제
  deleteMyIntroductionQuestion: async (myIntroductionId: number, questionId: number) => {
    const response = await axiosInstance.delete(`/api/v1/my-introduction/${myIntroductionId}/questions/${questionId}`);
    return response.data.data;
  },

  // 내 자소서 답변 수정
  updateMyIntroductionAnswer: async (answerId: number, answerText: string) => {
    const response = await axiosInstance.put(`/api/v1/my-introduction/answers/${answerId}`, { answerText });
    return response.data;
  },

  // 합격자소서 스크랩
  scrapResume: async (resumeId: number) => {
    const response = await axiosInstance.post(`/api/v1/successful-resumes/${resumeId}/scrap`);
    return response.data.data;
  },

  // 합격자소서 스크랩 취소
  unscrapResume: async (resumeId: number) => {
    const response = await axiosInstance.delete(`/api/v1/successful-resumes/${resumeId}/scrap`);
    return response.data.data;
  },

  // 스크랩 여부 확인
  checkScrapStatus: async (resumeId: number) => {
    const response = await axiosInstance.get(`/api/v1/successful-resumes/${resumeId}/is-scraped`);
    return response.data.data;
  },

  // 스크랩 목록 조회
  getScraps: async () => {
    const response = await axiosInstance.get(`/api/v1/successful-resumes/scraps`);
    return response.data.data;
  }
};