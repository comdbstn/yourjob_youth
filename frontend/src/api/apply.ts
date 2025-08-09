import { ApplyListResponse } from '../types/apply';
import { axiosInstance } from './axios';

export const applyApi = {
  // 지원 목록 조회
  getApplies: async (params: { 
    page: number; 
    size: number;
  }): Promise<ApplyListResponse> => {
    const response = await axiosInstance.get('/api/v1/applies', { params });
    return response.data;
  }
};
