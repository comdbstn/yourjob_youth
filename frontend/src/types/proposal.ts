export enum ProposalStatus {
  PENDING = 'PENDING',    // 답변하기
  ACCEPTED = 'ACCEPTED',  // 수락
  REJECTED = 'REJECTED',  // 거절
  EXPIRED = 'EXPIRED'     // 만료
}

export interface Proposal {
  id: number;
  proposalDate: string;
  expiryDate: string;
  companyName: string;
  position: string;
  status: ProposalStatus;
}

export interface ProposalListResponse {
  content: Proposal[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

export interface ProposalDetail extends Proposal {
  title: string;
  message: string;
  positionInfo: string;
  manager: string;
  proposalUpdatedAt: string;
} 