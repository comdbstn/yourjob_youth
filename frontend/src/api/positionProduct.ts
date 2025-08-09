import { axiosInstance } from './axios';
import { PositionProduct, PositionOfferStatus, PositionProductResponse, PositionProductApplyResponse } from '../types/positionProduct';

/**
 * 포지션 제안 상품 목록을 가져오는 API
 */
export const getPositionProducts = async (): Promise<PositionProductResponse> => {
  try {
    const response = await axiosInstance.get('/api/v1/client/position/products');
    return response.data;
  } catch (error) {
    console.error('포지션 제안 상품 조회 실패:', error);
    throw error;
  }
};

/**
 * 현재 사용자의 포지션 제안 상태를 조회하는 API
 */
export const getPositionOfferStatus = async (): Promise<PositionOfferStatus> => {
  try {
    const response = await axiosInstance.get('/api/v1/client/position/status');
    return response.data;
  } catch (error) {
    console.error('포지션 제안 상태 조회 실패:', error);
    throw error;
  }
};

/**
 * 포지션 제안 상품 신청 API
 */
export const applyPositionProduct = async (request: {
  productId: number;
  paymentMethod: string;
}): Promise<PositionProductApplyResponse> => {
  try {
    const response = await axiosInstance.post('/api/v1/client/position/purchase', request);
    return response.data;
  } catch (error: any) {
    console.error('포지션 제안 상품 신청 실패:', error);
    return {
      success: false,
      message: error.response?.data?.message || '포지션 제안 상품 신청 중 오류가 발생했습니다.'
    };
  }
};