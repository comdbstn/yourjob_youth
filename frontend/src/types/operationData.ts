export interface OperationData {
  operationDataId: string;
  dataType: string;
  level1?: string;
  level2?: string;
  level3?: string;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface OperationDataResponse {
  content: OperationData[];
  pageable: Pageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export type OperationDataType = 
  | '지역'
  | '국가'
  | '대학구분'
  | '국내대학'
  | '국내대학전공'
  | '해외대학'
  | '자격증'
  | '학력구분'
  | '직무'
  | '기업형태'
  | '채용형태'
  | '스킬-디자인'
  | '스킬-개발'
  | '스킬-회계'
  | '스킬-3D'
  | '핵심역량'
  | '직급'
  | '직책'
  | '근무지역-세계'
  | '근무지역-전국'
  | '근무지역-서울'
  | '근무지역-경기'
  | '근무지역-인천'
  | '근무지역-대전'
  | '업종-서비스업'
  | '업종-IT정보통신업'
  | '업종-제조생산화학업'
  | '업종-마케팅광고업'
  | '업종-금융보험업'
  | '우대조건'
  | '우대전공'
  | '비자'
  | '졸업국가'
  | '경력구분'
  | '학교구분'
  | '졸업상태'
  | '외국어'
  | '언어수준'
  | '인턴대외활동'
  | '장애등급'
  | '병역'
  | '계급'
  | '전공유형';

export const OPERATION_DATA_TYPES: Record<OperationDataType, string> = {
  '지역': '0000001',
  '국가': '0000002',
  '대학구분': '0000003',
  '국내대학': '0000004',
  '국내대학전공': '0000005',
  '해외대학': '0000006',
  '자격증': '0000007',
  '학력구분': '0000008',
  '직무': '0000009',
  '기업형태': '0000010',
  '채용형태': '0000011',
  '스킬-디자인': '0000013',
  '스킬-개발': '0000014',
  '스킬-회계': '0000015',
  '스킬-3D': '0000016',
  '핵심역량': '0000017',
  '직급': '0000018',
  '직책': '0000019',
  '근무지역-세계': '0000020',
  '근무지역-전국': '0000021',
  '근무지역-서울': '0000022',
  '근무지역-경기': '0000023',
  '근무지역-인천': '0000024',
  '근무지역-대전': '0000025',
  '업종-서비스업': '0000027',
  '업종-IT정보통신업': '0000028',
  '업종-제조생산화학업': '0000029',
  '업종-마케팅광고업': '0000030',
  '업종-금융보험업': '0000031',
  '우대조건': '0000033',
  '우대전공': '0000034',
  '비자': '0000035',
  '졸업국가': '0000036',
  '경력구분': '0000037',
  '학교구분': '0000038',
  '졸업상태': '0000039',
  '외국어': '0000040',
  '언어수준': '0000041',
  '인턴대외활동': '0000042',
  '장애등급': '0000043',
  '병역': '0000044',
  '계급': '0000045',
  '전공유형': '0000046'
}; 