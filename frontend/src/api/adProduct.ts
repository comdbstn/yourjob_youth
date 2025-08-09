import { axiosInstance } from './axios';
import { AdProduct, AdProductResponse, AdProductRequest, AdProductApplyResponse } from '../types/adProduct';

/**
 * 광고 상품 목록을 가져오는 API
 */
export const getAdProducts = async (): Promise<AdProductResponse> => {
  try {
    const response = await axiosInstance.get('/api/v1/client/banners/products');
    return response.data;
  } catch (error) {
    console.error('배너 광고 상품 조회 실패:', error);
    throw error;
  }
};

/**
 * 광고 상품 신청 API
 * @param request 광고 상품 신청 데이터
 * @returns 신청 결과
 */
export const applyAdProduct = async (request: AdProductRequest): Promise<AdProductApplyResponse> => {
  try {
    // 배너 상품인 경우 (파일 업로드 필요)
    if ((request.bannerType === 'horizontal' || request.bannerType === 'rectangle') && request.file) {
      // FormData 객체 생성
      const formData = new FormData();

      // 요청 데이터를 JSON으로 변환하여 FormData에 추가
      const requestData = {
        productId: request.productId,
        bannerType: request.bannerType,
        periodDays: request.periodDays,
        startDate: request.startDate,
        paymentMethod: request.paymentMethod,
        title: request.title,
        groupName: request.groupName,
        linkTarget: request.linkTarget,
        linkTargetType: request.linkTargetType
      };

      formData.append('request', new Blob([JSON.stringify(requestData)], {
        type: 'application/json'
      }));

      // 파일 추가
      formData.append('file', request.file);

      const response = await axiosInstance.post('/api/v1/client/banners/purchase', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    }
    // 일반 광고 상품인 경우 (vvip, vip, special)
    else {
      // 파일을 제외한 데이터를 JSON으로 전송
      const requestData = {
        productId: request.productId,
        bannerType: request.bannerType,
        periodDays: request.periodDays,
        startDate: request.startDate,
        paymentMethod: request.paymentMethod,
        title: request.title,
        groupName: request.groupName,
        linkTarget: request.linkTarget,
        linkTargetType: request.linkTargetType
      };

      const response = await axiosInstance.post('/api/v1/client/banners/purchase', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    }
  } catch (error: any) {
    console.error('광고 상품 신청 실패:', error);
    return {
      success: false,
      message: error.response?.data?.message || '광고상품 신청 중 오류가 발생했습니다.'
    };
  }
};