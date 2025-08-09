import { UserProfile, UpdateUserProfileRequest } from '../types/user';
import { axiosInstance } from './axios';

export const userApi = {
  // 사용자 프로필 조회
  getUserProfile: async (): Promise<UserProfile> => {
    const response = await axiosInstance.get('/api/v1/users/profile');
    return response.data;
  },

  // 사용자 프로필 수정
  updateUserProfile: async (data: UpdateUserProfileRequest): Promise<UserProfile> => {
    const response = await axiosInstance.put('/api/v1/users/profile', data);
    return response.data;
  },

  // 프로필 이미지 업로드
  uploadProfileImage: async (file: File): Promise<{ profileImage: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post('/api/v1/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
}; 