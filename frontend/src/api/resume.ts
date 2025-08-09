import { axiosInstance } from './axios';
import { ResumeForm } from '../types/resume';

export const resumeApi = {
  // 이력서 목록 조회
  getResumes: async (params: { page: number, size: number }) => {
    const response = await axiosInstance.get('/api/v1/resumes', { params });
    return response.data;
  },

  // 이력서 상세 조회
  getResumeDetail: async (id: number) => {
    const response = await axiosInstance.get(`/api/v1/resumes/${id}`);
    return response.data;
  },

  // 이력서 생성
  createResume: async (formData: FormData) => {
    const response = await axiosInstance.post('/api/v1/resumes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 이력서 수정
  updateResume: async (id: number, formData: FormData) => {
    const response = await axiosInstance.put(`/api/v1/resumes/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 이력서 삭제
  deleteResume: async (id: number) => {
    const response = await axiosInstance.delete(`/api/v1/resumes/${id}`);
    return response.data;
  },

  // 이력서 프로필 사진 업로드
  uploadResumeProfileImage: async (id: number, file: File): Promise<{ picturePath: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post(`/api/v1/resumes/${id}/profile-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}; 