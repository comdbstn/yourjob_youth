export interface Product {
  id: number;
  name: string;
  detail: string;
  remainingDays: number;
  type: 'premium' | 'banner' | 'position_offer';
  startDate: string;
  endDate: string;
}

export interface PaymentHistory {
  id: number;
  paymentId: string;
  productName: string;
  amount: string;
  paymentMethod: string;
  purchaseDate?: string;
  expiryDate: string;
  status: string;
  isEnded: boolean;
}

export interface PaymentHistoryResponse {
  content: PaymentHistory[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ProductResponse {
  products: Product[];
}