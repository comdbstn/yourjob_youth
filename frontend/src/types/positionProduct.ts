export interface PositionProduct {
  id: number;
  name: string;
  explosureType: string; // '기간별', '건별'
  periodDays: number;
  exposureCount: number;
  price: number;
  productType: string;
}

export interface PositionProductResponse {
  products?: PositionProduct[];
  [key: string]: any;
}

export interface ActivePositionProduct {
  id: number;
  productName: string;
  startDate: string;
  endDate: string;
  remainingCount: number;
}

export interface PositionOfferStatus {
  hasActive: boolean;
  activeProducts?: ActivePositionProduct[];
}

export interface PositionProductApplyResponse {
  success: boolean;
  paymentInfo?: {
    paymentId: string;
    // 기타 결제 정보
  };
  message?: string;
}