export interface AdProduct {
  id: number;
  name: string;
  productType: string; // 'horizontal', 'rectangle', 'vvip', 'vip', 'special'
  explosureType: string; // '기간별', '건별'
  periodDays: number;
  exposureCount: number;
  price: number;
  size: string;
  maxRolling?: number;
}

export interface AdProductResponse {
  products?: AdProduct[];
  [key: string]: any;
}

export interface AdProductRequest {
  productId: number;         // 상품 ID - 백엔드에서 상품 정보 조회에 사용
  bannerType: string;        // 'horizontal', 'rectangle', 'vvip', 'vip', 'special'
  periodDays: number;        // 이용기간 (일)
  startDate: string;         // 시작날짜 (YYYY-MM-DD)
  paymentMethod: string;     // 결제방법 ('card' 등)
  title: string;             // 상품 제목/이름
  groupName: string;         // 그룹명
  linkTarget?: string;       // 연결된 채용공고 ID
  linkTargetType?: string;   // 'job' 등 연결 타입
  file?: File;               // 배너 이미지 파일
}

export interface AdProductApplyResponse {
  success: boolean;
  paymentInfo?: {
    paymentId: string;
    // 기타 결제 정보
  };
  message?: string;
}

export interface PaymentInfo {
  paymentId: string;
  amount: string;
  status: string;
  startDate: string;
  endDate: string;
}