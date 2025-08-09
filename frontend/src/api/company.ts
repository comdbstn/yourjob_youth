import { CompanyProfile } from '../types/company';
import { CompanyInfo } from '../types/corp';
import { axiosInstance } from './axios';
import { getCompanyTypeOptions, CompanyTypeOption } from './getLevelOneCodes';

export const companyApi = {
  getCompanyInfo: async (): Promise<CompanyInfo> => {
    const response = await axiosInstance.get('/api/v1/corpmem/corpinfo');
    return response.data;
  },

  updateCompanyInfo: async (data: FormData): Promise<CompanyInfo> => {
    const response = await axiosInstance.put('/api/v1/corpmem/corpinfo', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  sendVerificationCode: async (email: string): Promise<void> => {
    await axiosInstance.post('/api/v1/corpmem/email/verification', { email });
  },

  verifyEmailCode: async (email: string, code: string): Promise<void> => {
    await axiosInstance.post('/api/v1/corpmem/email/verify', { email, code });
  },

  searchCompany: async (businessNumber: string): Promise<{ companyName: string; representative: string }> => {
    const response = await axiosInstance.get(`/api/v1/corpmem/search?businessNumber=${businessNumber}`);
    return response.data;
  },

  getCompanyProfile: async (): Promise<CompanyProfile> => {
    const response = await axiosInstance.get('/api/v1/corpmem/mydata');
    return response.data;
  },

  updateCompanyProfile: async (data: Partial<CompanyProfile>): Promise<CompanyProfile> => {
    const response = await axiosInstance.put('/api/v1/corpmem/mydata', data);
    return response.data;
  },

  uploadLogoImage: async (file: File): Promise<{ logo_url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post('/api/v1/corpmem/corplogoimg', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getCompanyTypeOptions: async (): Promise<CompanyTypeOption[]> => {
    return await getCompanyTypeOptions();
  },
};