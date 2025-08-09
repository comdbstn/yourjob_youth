/*
 * 옵션 더미.
 */

import { ApplicantStatus } from "../../types/jobPost";

export interface Option {
  id: number;
  value: string;
  label: string;

  // 현재 작업된 옵션 필드
  job_id?: number;
  job_type?: string;
  jobtype_id?: number;
}

// 채용 공고 관련 start
// 직무 - 기획·전략
/*export const planningOptions: Option[] = [
  { id: 107, value: 'planning', label: '기획·전략' },
  { id: 108, value: 'legal', label: '법무·사무·총무' },
  { id: 109, value: 'hr', label: '인사·HR' },
  { id: 110, value: 'accounting', label: '회계·세무' },
  { id: 111, value: 'marketing', label: '마케팅·광고·MD' },
  { id: 112, value: 'development', label: '개발·데이터' },
  { id: 113, value: 'design', label: '디자인' },
  { id: 114, value: 'logistics', label: '물류·무역' },
  { id: 101, value: 'business_planning', label: '경영·비즈니스기획' },
  { id: 102, value: 'web_planning', label: '웹기획' },
  { id: 103, value: 'marketing_planning', label: '마케팅기획' },
  { id: 104, value: 'pl_pm_po', label: 'PL·PM·PO' },
  { id: 105, value: 'consultant', label: '컨설턴트' },
  { id: 106, value: 'executive', label: 'CEO·COO·CTO' }
];*/
export const planningOptions: Option[] = [
  { id: 107, value: "planning", label: "기획·전략" },
  { id: 108, value: "legal", label: "법무·사무·총무" },
  { id: 109, value: "hr", label: "인사·HR" },
  { id: 110, value: "accounting", label: "회계·세무" },
  { id: 111, value: "marketing", label: "마케팅·광고·MD" },
  { id: 112, value: "development", label: "개발·데이터" },
  { id: 113, value: "design", label: "디자인" },
  { id: 114, value: "logistics", label: "물류·무역" },
  { id: 101, value: "business_planning", label: "경영·비즈니스기획" },
  { id: 102, value: "web_planning", label: "웹기획" },
  { id: 103, value: "marketing_planning", label: "마케팅기획" },
  { id: 104, value: "pl_pm_po", label: "PL·PM·PO" },
  { id: 105, value: "consultant", label: "컨설턴트" },
  { id: 106, value: "executive", label: "CEO·COO·CTO" },
];

// 직무 - 법무·사무·총무
export const legalAdminOptions: Option[] = [
  { id: 201, value: "management_support", label: "경영지원" },
  { id: 202, value: "office_admin", label: "사무담당자" },
  { id: 203, value: "general_affairs", label: "총무" },
  { id: 204, value: "office_assistant", label: "사무보조" },
  { id: 205, value: "legal_affairs", label: "법무담당자" },
  { id: 206, value: "secretary", label: "비서" },
  { id: 207, value: "lawyer", label: "변호사" },
  { id: 208, value: "judicial_scrivener", label: "법무사" },
];

// 직무 - 회계·세무
export const accountingOptions: Option[] = [
  { id: 301, value: "accountant", label: "회계담당자" },
  { id: 302, value: "bookkeeper", label: "경리" },
  { id: 303, value: "tax_affairs", label: "세무담당자" },
  { id: 304, value: "financial_officer", label: "재무담당자" },
  { id: 305, value: "auditor", label: "감사" },
  { id: 306, value: "ir_disclosure", label: "IR·공시" },
  { id: 307, value: "certified_accountant", label: "회계사" },
  { id: 308, value: "tax_accountant", label: "세무사" },
];

// 직무 - 마케팅·광고·MD
export const marketingOptions: Option[] = [
  { id: 401, value: "advertising_executive", label: "AE(광고기획자)" },
  { id: 402, value: "brand_marketer", label: "브랜드마케터" },
  { id: 403, value: "performance_marketer", label: "퍼포먼스마케터" },
  { id: 404, value: "crm_marketer", label: "CRM마케터" },
  { id: 405, value: "online_marketer", label: "온라인마케터" },
  { id: 406, value: "content_marketer", label: "콘텐츠마케터" },
  { id: 407, value: "pr", label: "홍보" },
  { id: 408, value: "research", label: "설문·리서치" },
];

// 스킬 - 디자인
export const designSkillOptions: Option[] = [
  { id: 501, value: "photoshop", label: "Photoshop" },
  { id: 502, value: "illustrator", label: "Illustrator" },
  { id: 503, value: "figma", label: "Figma" },
  { id: 504, value: "bi_design", label: "BI디자인" },
  { id: 505, value: "ci_design", label: "CI디자인" },
  { id: 506, value: "indesign", label: "Indesign" },
  { id: 507, value: "bx", label: "BX" },
  { id: 508, value: "drc", label: "DRC" },
];

// 스킬 - 개발
export const developmentSkillOptions: Option[] = [
  { id: 601, value: "cocos2d", label: "Cocos2d" },
  { id: 602, value: "cuda", label: "CUDA" },
  { id: 603, value: "firebase", label: "Firebase" },
  { id: 604, value: "intellij", label: "IntelliJ" },
  { id: 605, value: "mdd", label: "MDD" },
  { id: 606, value: "postman", label: "Postman" },
  { id: 607, value: "sqld", label: "SQLD자격" },
  { id: 608, value: "info_processing", label: "정보처리기능사 자격" },
];

// 스킬 - 회계
export const accountingSkillOptions: Option[] = [
  { id: 701, value: "corporate_accounting", label: "기업회계 자격" },
  { id: 702, value: "tax_accounting", label: "세무회계 자격" },
  { id: 703, value: "computer_accounting", label: "전산회계 자격" },
  {
    id: 704,
    value: "computer_accounting_operator",
    label: "전산회계운용사 자격",
  },
  { id: 705, value: "aicpa", label: "AICPA자격" },
  { id: 706, value: "cpa", label: "CPA자격" },
  { id: 707, value: "fat", label: "FAT자격" },
  { id: 708, value: "ifrs", label: "IFRS" },
];

// 스킬 - 3D
export const threeDSkillOptions: Option[] = [
  { id: 801, value: "3ds_max", label: "3Ds max" },
  { id: 802, value: "3d_printer", label: "3D Printer" },
  { id: 803, value: "autodesk", label: "Autodesk" },
  { id: 804, value: "enscape", label: "Enscape" },
  { id: 805, value: "hfss", label: "HFSS" },
  { id: 806, value: "lumion", label: "Lumion" },
  { id: 807, value: "mudbox", label: "MudBox" },
  { id: 808, value: "navisworks", label: "Navisworks" },
];

// 핵심역량
export const coreCapacityOptions: Option[] = [
  { id: 901, value: "planning_ability", label: "계획성" },
  { id: 902, value: "sincerity", label: "성실성" },
  { id: 903, value: "achievement_orientation", label: "성취지향성" },
  { id: 904, value: "self_esteem", label: "자존감" },
  { id: 905, value: "adaptability", label: "적응성" },
  { id: 906, value: "creativity", label: "창의성" },
  { id: 907, value: "stress_management", label: "스트레스관리" },
  { id: 908, value: "ethics", label: "윤리의식" },
  { id: 909, value: "thoroughness", label: "꼼꼼함" },
  { id: 910, value: "metacognition", label: "메타인지" },
  { id: 911, value: "growth_orientation", label: "성장지향성" },
  { id: 912, value: "cooperation", label: "협동심" },
];

// 직급
export const positionOptions: Option[] = [
  { id: 1001, value: "employee", label: "사원급" },
  { id: 1002, value: "deputy_manager", label: "주임~대리급" },
  { id: 1003, value: "manager_deputy", label: "과장~차장급" },
  { id: 1004, value: "general_manager", label: "부장급" },
  { id: 1005, value: "executive", label: "임원~CEO" },
  { id: 1006, value: "after_interview", label: "면접 후 결정" },
];

// 직책
export const roleOptions: Option[] = [
  { id: 1101, value: "team_member", label: "팀원" },
  { id: 1102, value: "team_lead", label: "조장/반장/직장" },
  { id: 1103, value: "part_leader", label: "파트장/그룹장" },
  { id: 1104, value: "team_manager", label: "팀장/매니저/실장" },
  {
    id: 1105,
    value: "branch_manager",
    label: "지점장/지사장/원장/국장/공장장",
  },
  { id: 1106, value: "head_manager", label: "본부장/센터장" },
];

// 근무지역 - 세계
export const worldLocationOptions: Option[] = [
  { id: 1201, value: "japan", label: "일본" },
  { id: 1202, value: "uk", label: "영국" },
  { id: 1203, value: "nigeria", label: "나이지리아" },
  { id: 1204, value: "vietnam", label: "베트남" },
  { id: 1205, value: "thailand", label: "태국" },
  { id: 1206, value: "usa", label: "미국" },
  { id: 1207, value: "china", label: "중국" },
  { id: 1208, value: "canada", label: "캐나다" },
];

// 근무지역 - 전국
export const nationwideLocationOptions: Option[] = [
  { id: 1201, value: "seoul", label: "서울" },
  { id: 1202, value: "incheon", label: "인천" },
  { id: 1203, value: "gwangju", label: "광주" },
  { id: 1204, value: "daegu", label: "대구" },
  { id: 1205, value: "busan", label: "부산" },
  { id: 1206, value: "ulsan", label: "울산" },
];

// 근무지역 - 서울
export const seoulLocationOptions: Option[] = [
  { id: 1201, value: "gangnam", label: "강남구" },
  { id: 1202, value: "gangdong", label: "강동구" },
  { id: 1203, value: "gangbuk", label: "강북구" },
  { id: 1204, value: "gangseo", label: "강서구" },
  { id: 1205, value: "gwanak", label: "관악구" },
  { id: 1206, value: "gwangjin", label: "광진구" },
  { id: 1207, value: "guro", label: "구로구" },
  { id: 1208, value: "geumcheon", label: "금천구" },
  { id: 1209, value: "nowon", label: "노원구" },
  { id: 1210, value: "dongdaemun", label: "동대문구" },
  { id: 1211, value: "dongjak", label: "동작구" },
  { id: 1212, value: "mapo", label: "마포구" },
  { id: 1213, value: "seodaemun", label: "서대문구" },
];

// 근무지역 - 경기
export const gyeonggiLocationOptions: Option[] = [
  { id: 1214, value: "suwon", label: "수원시" },
  { id: 1215, value: "seongnam", label: "성남시" },
  { id: 1216, value: "bucheon", label: "부천시" },
  { id: 1217, value: "gwangju", label: "광주시" },
];

// 근무지역 - 인천
export const incheonLocationOptions: Option[] = [
  { id: 1301, value: "bupyeong", label: "부평구" },
  { id: 1302, value: "namdong", label: "남동구" },
  { id: 1303, value: "seo", label: "서구" },
  { id: 1304, value: "dong", label: "동구" },
  { id: 1305, value: "michuhol", label: "미추홀구" },
  { id: 1306, value: "yeonsu", label: "연수구" },
  { id: 1307, value: "gyeyang", label: "계양구" },
  { id: 1308, value: "jung", label: "중구" },
  { id: 1309, value: "ganghwa", label: "강화군" },
  { id: 1310, value: "ongjin", label: "옹진군" },
];

// 근무지역 - 대전
export const daejeonLocationOptions: Option[] = [
  { id: 1401, value: "dong", label: "동구" },
  { id: 1402, value: "jung", label: "중구" },
  { id: 1403, value: "seo", label: "서구" },
  { id: 1404, value: "yuseong", label: "유성구" },
  { id: 1405, value: "daedeok", label: "대덕구" },
];

// 고용형태 (Employment Type)
export const employmentTypeOptions: Option[] = [
  { id: 1301, value: "regular", label: "정규직" },
  { id: 1302, value: "contract", label: "계약직" },
  { id: 1303, value: "intern", label: "인턴" },
  { id: 1304, value: "dispatch", label: "파견직" },
  { id: 1305, value: "contract_work", label: "도급" },
  { id: 1306, value: "freelancer", label: "프리랜서" },
  { id: 1307, value: "part_time", label: "아르바이트" },
  { id: 1308, value: "trainee", label: "연수생/교육생" },
  { id: 1309, value: "military_service", label: "병역특례" },
  { id: 1310, value: "commissioned", label: "위촉직/개인사업자" },
];

// 업종 - 서비스업
export const serviceIndustryOptions: Option[] = [
  { id: 1401, value: "education", label: "교육/학원" },
  { id: 1402, value: "restaurant", label: "요식업" },
  { id: 1403, value: "hotel", label: "숙박/호텔" },
  { id: 1404, value: "travel", label: "여행/관광" },
  { id: 1405, value: "beauty", label: "미용/뷰티" },
  { id: 1406, value: "healthcare", label: "의료/헬스케어" },
  { id: 1407, value: "entertainment", label: "엔터테인먼트" },
  { id: 1408, value: "cleaning", label: "청소/시설관리" },
];

// 업종 - IT·정보통신업
export const itIndustryOptions: Option[] = [
  { id: 1501, value: "software", label: "소프트웨어 개발" },
  { id: 1502, value: "web_service", label: "웹 서비스" },
  { id: 1503, value: "app_service", label: "앱 서비스" },
  { id: 1504, value: "system_integration", label: "시스템 통합/SI" },
  { id: 1505, value: "telecom", label: "통신/네트워크" },
  { id: 1506, value: "game", label: "게임" },
  { id: 1507, value: "security", label: "정보보안" },
  { id: 1508, value: "cloud", label: "클라우드/서버" },
];

// 업종 - 제조·생산·화학업
export const manufacturingIndustryOptions: Option[] = [
  { id: 1601, value: "electronics", label: "전자/반도체" },
  { id: 1602, value: "automobile", label: "자동차/기계" },
  { id: 1603, value: "chemical", label: "화학/소재" },
  { id: 1604, value: "steel", label: "철강/금속" },
  { id: 1605, value: "textile", label: "섬유/의류" },
  { id: 1606, value: "food", label: "식품/음료" },
  { id: 1607, value: "pharmaceutical", label: "제약/바이오" },
  { id: 1608, value: "energy", label: "에너지/환경" },
];

// 업종 - 마케팅·광고업
export const marketingIndustryOptions: Option[] = [
  { id: 1701, value: "advertising", label: "광고/홍보" },
  { id: 1702, value: "marketing", label: "마케팅" },
  { id: 1703, value: "pr", label: "홍보/PR" },
  { id: 1704, value: "event", label: "이벤트/전시" },
  { id: 1705, value: "media", label: "미디어/콘텐츠" },
  { id: 1706, value: "design", label: "디자인/크리에이티브" },
  { id: 1707, value: "research", label: "시장조사/리서치" },
  { id: 1708, value: "digital_marketing", label: "디지털마케팅" },
];

// 업종 - 금융·보험업
export const financeIndustryOptions: Option[] = [
  { id: 1801, value: "bank", label: "은행/저축은행" },
  { id: 1802, value: "securities", label: "증권/투자" },
  { id: 1803, value: "insurance", label: "보험" },
  { id: 1804, value: "card", label: "신용카드/캐피탈" },
  { id: 1805, value: "fintech", label: "핀테크" },
  { id: 1806, value: "asset_management", label: "자산관리" },
  { id: 1807, value: "accounting", label: "회계/세무" },
  { id: 1808, value: "real_estate", label: "부동산/임대" },
];

// 채용공고 - 기업형태
export const companyTypeOptions: Option[] = [
  { id: 1801, value: "large_company", label: "대기업" },
  { id: 1802, value: "medium_company", label: "중소기업" },
  { id: 1803, value: "public_company", label: "공공기관/공기업" },
  { id: 1804, value: "foreign_company", label: "외국계기업" },
  { id: 1805, value: "mid_sized_company", label: "중견기업" },
  { id: 1806, value: "non_profit", label: "비영리단체/협회/재단" },
  { id: 1807, value: "startup", label: "스타트업" },
  { id: 1808, value: "financial", label: "금융권" },
  { id: 1809, value: "hospital", label: "병원" },
  { id: 1810, value: "student_org", label: "동아리/학생자치단체" },
  { id: 1811, value: "other", label: "기타" },
];

// 지원자격 - 우대조건
export const preferenceOptions: Option[] = [
  { id: 1901, value: "national_merit", label: "국가유공자" },
  { id: 1902, value: "veterans", label: "보훈대상자" },
  { id: 1903, value: "employment_support", label: "고용촉진지원금 대상자" },
  { id: 1904, value: "employment_protection", label: "취업보호대상자" },
  { id: 1905, value: "disabled", label: "장애인" },
  { id: 1906, value: "military_service", label: "병역특례" },
  { id: 1907, value: "middle_aged", label: "중장년층" },
  { id: 1908, value: "foreigner", label: "외국인" },
];

// 지원자격 - 자격증
export const licenseOptions: Option[] = [
  { id: 2101, value: "computer_skill", label: "컴퓨터활용능력 우수자" },
  { id: 2102, value: "excel_advanced", label: "엑셀 고급능력 보유자" },
  { id: 2103, value: "documentation", label: "문서작성 우수자" },
  { id: 2104, value: "presentation", label: "프리젠테이션 능력 우수자" },
];

// 지원자격 - 우대전공
export const majorOptions: Option[] = [
  { id: 2201, value: "computer_science", label: "컴퓨터공학" },
  { id: 2202, value: "business_administration", label: "경영학" },
  { id: 2203, value: "marketing", label: "마케팅" },
  { id: 2204, value: "design", label: "디자인" },
  { id: 2205, value: "manufacturing", label: "제조" },
  { id: 2206, value: "finance", label: "금융" },
  { id: 2207, value: "law", label: "법학" },
  { id: 2208, value: "medicine", label: "의학" },
  { id: 2209, value: "other", label: "기타" },
];

// 채용 공고 관련 end

// 이력서 관련 start
// 비자
export enum VisaType {
  D2 = "D-2",
  D10 = "D-10",
  D4 = "D-4",
  E1 = "E-1",
  E2 = "E-2",
  E3 = "E-3",
  E5 = "E-5",
  E6 = "E-6",
  E7 = "E-7",
  F2 = "F-2",
  F4 = "F-4",
  F5 = "F-5",
  F6 = "F-6",
  NONE = "NONE",
}

export const VisaStatusText: Record<VisaType, string> = {
  [VisaType.D2]: "D-2유학",
  [VisaType.D10]: "D-10 구직",
  [VisaType.D4]: "D-4 일반연수",
  [VisaType.E1]: "E-1 교수",
  [VisaType.E2]: "E-2 회화지도",
  [VisaType.E3]: "E-3 연구",
  [VisaType.E5]: "E-5 전문직업",
  [VisaType.E6]: "E-6 예술흥행",
  [VisaType.E7]: "E-7 특정활동",
  [VisaType.F2]: "F-2 거주",
  [VisaType.F4]: "F-4 재외동포",
  [VisaType.F5]: "F-5 영주",
  [VisaType.F6]: "F-6 결혼이민",
  [VisaType.NONE]: "해당없음",
};

export const visaOptions: Option[] = [
  { id: 2301, value: VisaType.D2, label: "D-2유학" },
  { id: 2302, value: VisaType.D10, label: "D-10 구직" },
  { id: 2303, value: VisaType.D4, label: "D-4 일반연수" },
  { id: 2304, value: VisaType.E1, label: "E-1 교수" },
  { id: 2305, value: VisaType.E2, label: "E-2 회화지도" },
  { id: 2306, value: VisaType.E3, label: "E-3 연구" },
  { id: 2307, value: VisaType.E5, label: "E-5 전문직업" },
  { id: 2308, value: VisaType.E6, label: "E-6 예술흥행" },
  { id: 2309, value: VisaType.E7, label: "E-7 특정활동" },
  { id: 2310, value: VisaType.F2, label: "F-2 거주" },
  { id: 2311, value: VisaType.F4, label: "F-4 재외동포" },
  { id: 2312, value: VisaType.F5, label: "F-5 영주" },
  { id: 2313, value: VisaType.F6, label: "F-6 결혼이민" },
  { id: 2314, value: VisaType.NONE, label: "해당없음" },
];

// 합격자소서 - 졸업국가
export const graduationCountryOptions: Option[] = [
  { id: 2301, value: "korea", label: "대한민국" },
  { id: 2302, value: "america", label: "미국" },
  { id: 2303, value: "europe", label: "유럽" },
  { id: 2304, value: "asia", label: "아시아" },
  { id: 2305, value: "oceania", label: "오세아니아" },
  { id: 2306, value: "other", label: "기타" },
];

// 제안 상태
export enum OfferStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}

export const OfferStatusText: Record<OfferStatus, string> = {
  [OfferStatus.PENDING]: "미응답",
  [OfferStatus.ACCEPTED]: "수락",
  [OfferStatus.REJECTED]: "거절",
  [OfferStatus.EXPIRED]: "만료",
};

// 경력구분
export enum CareerType {
  JUNIOR = "JUNIOR",
  SENIOR = "SENIOR",
}

export const CareerTypeText: Record<CareerType, string> = {
  [CareerType.JUNIOR]: "신입",
  [CareerType.SENIOR]: "경력",
};

// 학교구분
export enum SchoolType {
  HIGH = "high",
  UNIV2 = "univ2",
  UNIV4 = "univ4",
  GRAD = "grad"
}

export const SchoolTypeText: Record<SchoolType, string> = {
  [SchoolType.HIGH]: "고등학교",
  [SchoolType.UNIV2]: "대학(2,3년)",
  [SchoolType.UNIV4]: "대학(4년)",
  [SchoolType.GRAD]: "대학원"
};

// 졸업상태
export enum GraduationStatus {
  GRADUATE = "graduate",
  EXPECTED = "expected",
  ENROLLED = "enrolled",
  DROPOUT = "dropout",
  COMPLETION = "completion",
  LEAVE = "leave",
}

export const GraduationStatusText: Record<GraduationStatus, string> = {
  [GraduationStatus.GRADUATE]: "졸업",
  [GraduationStatus.EXPECTED]: "졸업예정",
  [GraduationStatus.ENROLLED]: "재학중",
  [GraduationStatus.DROPOUT]: "중퇴",
  [GraduationStatus.COMPLETION]: "수료",
  [GraduationStatus.LEAVE]: "휴학",
};

// 언어
export enum LanguageType {
  ENG = "eng",
  JPN = "jpn",
  CHN = "chn",
  FRE = "fre",
  GER = "ger",
  ITA = "ita",
  POR = "por",
  ARB = "arb",
  RUS = "rus",
  KOR = "kor",
  VIE = "vie",
  THA = "tha",
  IND = "ind",
  ETC = "etc",
}

export const LanguageTypeText: Record<LanguageType, string> = {
  [LanguageType.ENG]: "영어",
  [LanguageType.JPN]: "일본어",
  [LanguageType.CHN]: "중국어",
  [LanguageType.FRE]: "프랑스어",
  [LanguageType.GER]: "독일어",
  [LanguageType.ITA]: "이탈리아어",
  [LanguageType.POR]: "포르투갈어",
  [LanguageType.ARB]: "아랍어",
  [LanguageType.RUS]: "러시아어",
  [LanguageType.KOR]: "한국어",
  [LanguageType.VIE]: "베트남어",
  [LanguageType.THA]: "태국어",
  [LanguageType.IND]: "인도네시아어",
  [LanguageType.ETC]: "기타",
};

// 언어수준
export enum LanguageLevel {
  AUTHENTIC = "authentic",
  ADVANCED = "advanced",
  INTERMEDIATE = "intermediate",
  BASIC = "basic",
  BEGINNER = "beginner",
}

export const LanguageLevelText: Record<LanguageLevel, string> = {
  [LanguageLevel.AUTHENTIC]: "Authentic",
  [LanguageLevel.ADVANCED]: "Advanced",
  [LanguageLevel.INTERMEDIATE]: "Intermediate",
  [LanguageLevel.BASIC]: "Basic",
  [LanguageLevel.BEGINNER]: "Beginner",
};

// 인턴/대외활동
export enum InternType {
  INTERN = "intern",
  PART_TIME = "partTime",
  CLUB = "club",
  VOLUNTEER = "volunteer",
  SOCIAL = "social",
  SCHOOL = "school",
  ETC = "etc",
}

export const InternTypeText: Record<InternType, string> = {
  [InternType.INTERN]: "인턴",
  [InternType.PART_TIME]: "아르바이트",
  [InternType.CLUB]: "동아리",
  [InternType.VOLUNTEER]: "자원봉사",
  [InternType.SOCIAL]: "사회활동",
  [InternType.SCHOOL]: "교내활동",
  [InternType.ETC]: "기타",
};

// 장애등급
export enum DisabledLevel {
  SEVERE = "severe",
  MILD = "mild",
  // LEVEL1 = 'level1',
  // LEVEL2 = 'level2',
  // LEVEL3 = 'level3',
  // LEVEL4 = 'level4',
  // LEVEL5 = 'level5',
}

export const DisabledLevelText: Record<DisabledLevel, string> = {
  [DisabledLevel.SEVERE]: "중증",
  [DisabledLevel.MILD]: "경증",
  // [DisabledLevel.LEVEL1]: '1급',
  // [DisabledLevel.LEVEL2]: '2급',
  // [DisabledLevel.LEVEL3]: '3급',
  // [DisabledLevel.LEVEL4]: '4급',
  // [DisabledLevel.LEVEL5]: '5급',
};

// 병역
export enum MilitaryServiceStatus {
  COMPLETED = "completed",
  EXEMPTED = "exempted",
  UNCOMPLETED = "uncompleted",
  NOT_APPLICABLE = "notApplicable",
}

export const MilitaryServiceStatusText: Record<MilitaryServiceStatus, string> =
  {
    [MilitaryServiceStatus.COMPLETED]: "군필",
    [MilitaryServiceStatus.EXEMPTED]: "면제",
    [MilitaryServiceStatus.UNCOMPLETED]: "미필",
    [MilitaryServiceStatus.NOT_APPLICABLE]: "해당없음",
  };

// 계급
export enum MilitaryServiceClass {
  PRIVATE = "private",
  CORPORAL = "corporal",
  SERGEANT = "sergeant",
  SERGEANT_FIRST_CLASS = "sergeantFirstClass",
  WARRANT_OFFICER = "warrantOfficer",
  SECOND_LIEUTENANT = "secondLieutenant",
  FIRST_LIEUTENANT = "firstLieutenant",
  CAPTAIN = "captain",
  MAJOR = "major",
  LIEUTENANT_COLONEL = "lieutenantColonel",
  COLONEL = "colonel",
  BRIGADIER_GENERAL = "brigadierGeneral",
  MAJOR_GENERAL = "majorGeneral",
  LIEUTENANT_GENERAL = "lieutenantGeneral",
  GENERAL = "general",
}

export const MilitaryServiceClassText: Record<MilitaryServiceClass, string> = {
  [MilitaryServiceClass.PRIVATE]: "이병",
  [MilitaryServiceClass.CORPORAL]: "일병",
  [MilitaryServiceClass.SERGEANT]: "상병",
  [MilitaryServiceClass.SERGEANT_FIRST_CLASS]: "병장",
  [MilitaryServiceClass.WARRANT_OFFICER]: "준위",
  [MilitaryServiceClass.SECOND_LIEUTENANT]: "소위",
  [MilitaryServiceClass.FIRST_LIEUTENANT]: "중위",
  [MilitaryServiceClass.CAPTAIN]: "대위",
  [MilitaryServiceClass.MAJOR]: "소령",
  [MilitaryServiceClass.LIEUTENANT_COLONEL]: "중령",
  [MilitaryServiceClass.COLONEL]: "대령",
  [MilitaryServiceClass.BRIGADIER_GENERAL]: "준장",
  [MilitaryServiceClass.MAJOR_GENERAL]: "소장",
  [MilitaryServiceClass.LIEUTENANT_GENERAL]: "중장",
  [MilitaryServiceClass.GENERAL]: "대장",
};

// 옵션 배열
export const careerTypeOptions: Option[] = Object.entries(CareerTypeText).map(
  ([value, label]) => ({
    id: parseInt(value),
    value: value as CareerType,
    label,
  }),
);

export const schoolOptions: Option[] = Object.entries(SchoolTypeText).map(
  ([value, label]) => ({
    id: parseInt(value),
    value: value as SchoolType,
    label,
  }),
);

export const gradStatusOptions: Option[] = Object.entries(
  GraduationStatusText,
).map(([value, label]) => ({
  id: parseInt(value),
  value: value as GraduationStatus,
  label,
}));

export const languageOptions: Option[] = Object.entries(LanguageTypeText).map(
  ([value, label]) => ({
    id: parseInt(value),
    value: value as LanguageType,
    label,
  }),
);

export const languageLevelOptions: Option[] = Object.entries(
  LanguageLevelText,
).map(([value, label]) => ({
  id: parseInt(value),
  value: value as LanguageLevel,
  label,
}));

export const internTypeOptions: Option[] = Object.entries(InternTypeText).map(
  ([value, label]) => ({
    id: parseInt(value),
    value: value as InternType,
    label,
  }),
);

export const disabledLevelOptions: Option[] = Object.entries(
  DisabledLevelText,
).map(([value, label]) => ({
  id: parseInt(value),
  value: value as DisabledLevel,
  label,
}));

export const militaryServiceOptions: Option[] = Object.entries(
  MilitaryServiceStatusText,
).map(([value, label]) => ({
  id: parseInt(value),
  value: value as MilitaryServiceStatus,
  label,
}));

export const militaryServiceClassOptions: Option[] = Object.entries(
  MilitaryServiceClassText,
).map(([value, label]) => ({
  id: parseInt(value),
  value: value as MilitaryServiceClass,
  label,
}));

// 이력서 관련 end

// 지원자 상태별 표시 텍스트
export const APPLICANT_STATUS_TEXT: Record<ApplicantStatus, string> = {
  [ApplicantStatus.UNREAD]: "미열람",
  [ApplicantStatus.PENDING]: "미심사",
  [ApplicantStatus.PASSED]: "면접",
  [ApplicantStatus.FAILED]: "불합격",
  [ApplicantStatus.FINAL]: "최종합격",
};

// 지역
export enum AreaType {
  SEOUL = "seoul",
  INCHEON = "incheon",
  BUSAN = "busan",
  DAEGU = "daegu",
  GWANGJU = "gwangju",
  DAEJEON = "daejeon",
  ULSAN = "ulsan",
  SEJONG = "sejong",
  NATIONAL = "national",
  ASIA = "asia",
  EUROPE = "europe",
  AMERICA = "america",
  AFRICA = "africa",
  OCEANIA = "oceania",
  NORTH_AMERICA = "northAmerica",
  SOUTH_AMERICA = "southAmerica",
  ANTARCTICA = "antarctica",
  OTHER = "other",
}

export const AreaTypeText: Record<AreaType, string> = {
  [AreaType.SEOUL]: "서울",
  [AreaType.INCHEON]: "인천",
  [AreaType.BUSAN]: "부산",
  [AreaType.DAEGU]: "대구",
  [AreaType.GWANGJU]: "광주",
  [AreaType.DAEJEON]: "대전",
  [AreaType.ULSAN]: "울산",
  [AreaType.SEJONG]: "세종",
  [AreaType.NATIONAL]: "전국",
  [AreaType.ASIA]: "아시아",
  [AreaType.EUROPE]: "유럽",
  [AreaType.AMERICA]: "미국",
  [AreaType.AFRICA]: "아프리카",
  [AreaType.OCEANIA]: "오세아니아",
  [AreaType.NORTH_AMERICA]: "북/중미",
  [AreaType.SOUTH_AMERICA]: "남미",
  [AreaType.ANTARCTICA]: "남극대륙",
  [AreaType.OTHER]: "기타해외",
};

// 전공유형
export enum MajorType {
  MAJOR = "major",
  ADDITIONAL = "additional",
  DOUBLE = "double",
  DUAL = "dual",
}

export const MajorTypeText: Record<MajorType, string> = {
  [MajorType.MAJOR]: "전공",
  [MajorType.ADDITIONAL]: "부전공",
  [MajorType.DOUBLE]: "복수전공",
  [MajorType.DUAL]: "이중전공",
};

// 옵션 배열
export const areaOptions: Option[] = Object.entries(AreaTypeText).map(
  ([value, label]) => ({
    id: parseInt(value),
    value: value as AreaType,
    label,
  }),
);

export const majorTypeOptions: Option[] = Object.entries(MajorTypeText).map(
  ([value, label]) => ({
    id: parseInt(value),
    value: value as MajorType,
    label,
  }),
);

interface LevelCode {
  code: string;
  levelValue: string;
  parentCode: string | null;
}

interface LevelCodeListDto {
  dataType: string;
  dataTypeName: string;
  levelCodes: LevelCode[];
}

const API_URL = process.env.REACT_APP_API_BASE_URL || "https://localhost:8082";

export const fetchAreaOptions = async () => {
  try {
    const [response1, response2] = await Promise.all([
      fetch(
        `${API_URL}/api/v1/mdms/operation-data/level1-codes?dataType=00000012`,
      ),
      fetch(
        `${API_URL}/api/v1/mdms/operation-data/level1-codes?dataType=00000013`,
      ),
    ]);

    if (!response1.ok || !response2.ok) {
      throw new Error("API 요청 실패");
    }

    const data1: LevelCodeListDto = await response1.json();
    const data2: LevelCodeListDto = await response2.json();

    const levelCodes1 = data1?.levelCodes || [];
    const levelCodes2 = data2?.levelCodes || [];
    const allLevelCodes = [...levelCodes1, ...levelCodes2];

    const uniqueCodes = allLevelCodes.filter(
      (code, index, self) =>
        index === self.findIndex((c) => c.levelValue === code.levelValue),
    );

    const areaOptions = [
      { id: 0, value: "", label: "희망근무지" },
      ...uniqueCodes.map((code: LevelCode) => ({
        id: parseInt(code.code),
        value: code.levelValue,
        label: code.levelValue,
      })),
    ];

    return areaOptions;
  } catch (error) {
    console.error("지역 옵션 조회 실패:", error);
    return [{ id: 0, value: "", label: "희망근무지" }, ...areaOptions];
  }
};
