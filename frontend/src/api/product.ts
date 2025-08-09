import { axiosInstance } from './axios';
import { Product, PaymentHistory, PaymentHistoryResponse } from '../types/product';

/**
 * 활성화된 상품 목록을 가져오는 API
 */
export const getActiveProducts = async (): Promise<Product[]> => {
  try {
    // 현재 사용자의 활성 결제 내역(isEnded=false인 것) 가져오기
    const response = await axiosInstance.get('/api/v1/client/payment/my-payments');

    // 결제 내역에서 활성 상품 정보 변환
    const activeProducts = (response.data || [])
        .filter((payment: any) => !payment.isEnded && payment.status === 'paid')
        .map((payment: any) => ({
          id: payment.id,
          name: payment.productName,
          detail: payment.jobPostingsName ? `공고: ${payment.jobPostingsName}` : '',
          remainingDays: calculateRemainingDays(payment.endDate),
          type: payment.productName.includes('배너') ? 'banner' : 'premium',
          startDate: payment.startDate,
          endDate: payment.endDate
        }));

    return activeProducts;
  } catch (error) {
    console.error('활성 상품 조회 실패:', error);
    throw error;
  }
};

/**
 * 결제 내역을 가져오는 API
 */
export const getPaymentHistory = async (page: number = 1, size: number = 10): Promise<PaymentHistoryResponse> => {
  try {
    const response = await axiosInstance.get('/api/v1/client/payment/my-payments', {
      params: { page: page - 1, size }
    });

    // 페이징 처리가 된 응답인 경우
    if (response.data && 'content' in response.data) {
      const pagedData = response.data;

      // 결제 내역 데이터 변환
      const content = (pagedData.content || []).map((payment: any) => ({
        id: payment.id,
        paymentId: payment.paymentId,
        productName: payment.productName,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        purchaseDate: payment.createdAt || new Date(payment.startDate).toISOString(),
        expiryDate: payment.endDate,
        status: payment.status,
        isEnded: payment.isEnded
      }));

      return {
        content,
        page: pagedData.page || page,
        size: pagedData.size || size,
        totalElements: pagedData.totalElements || content.length,
        totalPages: pagedData.totalPages || Math.ceil(content.length / size)
      };
    }
    // 배열 형태로 응답이 온 경우
    else {
      const payments = response.data || [];

      // 결제 내역 데이터 변환
      const content = payments.map((payment: any) => ({
        id: payment.id,
        paymentId: payment.paymentId,
        productName: payment.productName,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        purchaseDate: payment.createdAt || new Date(payment.startDate).toISOString(),
        expiryDate: payment.endDate,
        status: payment.status,
        isEnded: payment.isEnded
      }));

      // 페이징 계산
      const totalElements = content.length;
      const totalPages = Math.ceil(totalElements / size);
      const paginatedContent = content.slice((page - 1) * size, page * size);

      return {
        content: paginatedContent,
        page: page,
        size: size,
        totalElements: totalElements,
        totalPages: totalPages
      };
    }
  } catch (error) {
    console.error('결제 내역 조회 실패:', error);
    throw error;
  }
};

// 남은 일수 계산 함수
const calculateRemainingDays = (endDate: string): number => {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};