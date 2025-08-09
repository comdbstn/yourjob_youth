import { axiosInstance } from './axios';
import { RegionResponse, CorporateTypeResponse } from '../types/dums';
import { JobTypeResponse, JobCategoryResponse } from '../types/jobPost';

export const getDumsRegionAll = async (): Promise<RegionResponse[]> => {
  const response = await axiosInstance.get('/api/v1/dums/regions/all');
  return response.data;
};

export const getDumsCorporateTypesAll = async (): Promise<CorporateTypeResponse[]> => {
  const response = await axiosInstance.get('/api/v1/dums/corporate-types/all');
  return response.data;
};

/**
 * 모든 채용형태 목록을 조회합니다.
 * @returns 채용형태 목록
 */
export const getDumsJobTypesAll = async (): Promise<JobTypeResponse[]> => {
    const response = await axiosInstance.get('/api/v1/dums/job-types/all');
    return response.data;
};

export const getDumsJobCategoriesAll = async (): Promise<JobCategoryResponse[]> => {
    const response = await axiosInstance.get('/api/v1/dums/job-categories/all');
    return response.data;
}; 