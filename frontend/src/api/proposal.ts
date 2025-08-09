import { ProposalListResponse, ProposalStatus, ProposalDetail } from '../types/proposal';
import { axiosInstance } from './axios';

export const proposalApi = {
  // 받은 제안 목록 조회
  getProposals: async (params: { 
    page: number; 
    size: number;
    keyword?: string;
  }): Promise<ProposalListResponse> => {
    const response = await axiosInstance.get('/api/v1/proposals', { params });
    return response.data;
  },

  // 제안 상태 변경 (수락/거절)
  updateProposalStatus: async (
    proposalId: number, 
    status: ProposalStatus,
    rejectReason?: string
  ): Promise<void> => {
    await axiosInstance.put(`/api/v1/proposals/${proposalId}/status`, { 
      status,
      rejectReason
    });
  },

  // 제안 상세 조회
  getProposalDetail: async (proposalId: number): Promise<ProposalDetail> => {
    const response = await axiosInstance.get(`/api/v1/proposals/${proposalId}`);
    return response.data;
  }
};

export const getDummyProposals = (): ProposalDetail[] => {
  return [
    {
      id: 1,
      proposalDate: '2024.03.15',
      expiryDate: '2024.03.22',
      companyName: '(주)테크솔루션',
      position: '프론트엔드 개발자',
      status: ProposalStatus.PENDING,
      title: '프론트엔드 개발자 포지션에 적합해 보여 연락드립니다.',
      message: `안녕하세요. 테크솔루션입니다.
  
  저희가 찾고 있는 프론트엔드 개발자 포지션에 적합하다고 판단되어 제안 드립니다.
  긍정적인 검토 부탁드리며, 답변 마감일까지 해당 포지션의 제안을 수락한 경우에 한해서 기업에 지원자의
  이력서 및 개인정보가 전달되어 다음 전형 안내를 받으실 수 있습니다.
  
  감사합니다.`,
      positionInfo: '- React, TypeScript 기반 웹 서비스 개발\n- 3년 이상의 프론트엔드 개발 경력\n- 연봉: 4,500~6,000만원',
      manager: '인사팀 김철수',
      proposalUpdatedAt: '2024.03.15'
    },
    {
      id: 2,
      proposalDate: '2024.03.14',
      expiryDate: '2024.03.21',
      companyName: '(주)디지털이노베이션',
      position: '시니어 웹 개발자',
      status: ProposalStatus.ACCEPTED,
      title: '시니어 웹 개발자 포지션을 제안드립니다.',
      message: `안녕하세요. 디지털이노베이션입니다.
      
  귀하의 프로필을 보고 저희 회사의 시니어 웹 개발자 포지션에 적합하다고 판단하여 연락드립니다.
  우수한 개발 실력과 경험을 갖추신 분을 모시고 싶습니다.`,
      positionInfo: '- 풀스택 개발 가능자 우대\n- 5년 이상의 웹 개발 경력\n- 연봉: 5,500~7,000만원',
      manager: '개발팀 박지성',
      proposalUpdatedAt: '2024.03.14'
    },
    {
      id: 3,
      proposalDate: '2024.03.13',
      expiryDate: '2024.03.20',
      companyName: '(주)스타트업허브',
      position: 'React 개발자',
      status: ProposalStatus.REJECTED,
      title: 'React 개발자 포지션 제안',
      message: '당신의 React 개발 경험이 저희 팀에 큰 도움이 될 것 같습니다.',
      positionInfo: '- React, Redux 사용 경험\n- 2년 이상의 React 개발 경력\n- 연봉: 4,000~5,000만원',
      manager: '인사팀 이영희',
      proposalUpdatedAt: '2024.03.13'
    },
    {
      id: 4,
      proposalDate: '2024.03.12',
      expiryDate: '2024.03.19',
      companyName: '(주)넥스트레벨',
      position: '프론트엔드 리드 개발자',
      status: ProposalStatus.EXPIRED,
      title: '프론트엔드 리드 개발자 포지션에 적합해 보입니다.',
      message: '저희 팀의 프론트엔드 리드 개발자로 모시고 싶습니다.',
      positionInfo: '- 팀 리드 경험\n- 7년 이상의 개발 경력\n- 연봉: 7,000~9,000만원',
      manager: 'CTO 강동원',
      proposalUpdatedAt: '2024.03.12'
    }
  ];
};
