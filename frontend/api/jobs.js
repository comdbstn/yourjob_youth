// Vercel 서버리스 함수로 변환된 채용공고 API
import { JSDOM } from 'jsdom';

// 간단한 크롤링 함수 (Node.js 환경)
async function crawlSaramin() {
  const jobs = [];
  
  try {
    // 사람인 크롤링 (간단한 버전)
    const keyword = encodeURIComponent('개발자');
    const searchUrl = `https://www.saramin.co.kr/zf_user/search/recruit?search_area=main&search_done=y&searchword=${keyword}`;
    
    // 실제 환경에서는 puppeteer나 playwright 사용 권장
    console.log('크롤링 시도:', searchUrl);
    
    // 데모용 하드코딩 데이터
    const demoJobs = [
      {
        id: 1,
        title: "프론트엔드 개발자 (React, TypeScript)",
        company: "테크스타트업",
        location: "서울",
        category: "IT·개발",
        description: "React와 TypeScript를 활용한 웹 서비스 개발을 담당할 프론트엔드 개발자를 채용합니다.",
        salary: "연봉 3500~5000만원",
        experience: "2~5년차",
        employment_type: "정규직",
        deadline: "2025-09-15",
        image_url: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=300&h=300&fit=crop",
        apply_url: "mailto:hr@techstartup.co.kr",
        skills: ["React", "TypeScript", "JavaScript", "HTML/CSS"],
        benefits: ["재택근무", "유연근무", "교육비지원", "간식제공"],
        posting_date: "2025-08-20"
      },
      {
        id: 2,
        title: "백엔드 개발자 (Java, Spring)",
        company: "핀테크솔루션",
        location: "서울",
        category: "IT·개발",
        description: "Java와 Spring을 활용한 서버 개발을 담당할 백엔드 개발자를 채용합니다.",
        salary: "연봉 4000~6000만원",
        experience: "3~7년차",
        employment_type: "정규직",
        deadline: "2025-09-20",
        image_url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&h=300&fit=crop",
        apply_url: "https://fintech-solution.co.kr/careers",
        skills: ["Java", "Spring Boot", "MySQL", "AWS"],
        benefits: ["스톡옵션", "자율출퇴근", "맥북지급", "점심제공"],
        posting_date: "2025-08-19"
      },
      {
        id: 3,
        title: "UX/UI 디자이너",
        company: "모바일에이전시", 
        location: "서울",
        category: "디자인",
        description: "모바일 앱과 웹 서비스의 UX/UI 디자인을 담당할 디자이너를 채용합니다.",
        salary: "연봉 3000~4500만원",
        experience: "1~4년차",
        employment_type: "정규직",
        deadline: "2025-09-10",
        image_url: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=300&h=300&fit=crop",
        apply_url: "https://mobile-agency.co.kr/jobs",
        skills: ["Figma", "Sketch", "Photoshop", "Illustrator"],
        benefits: ["개인장비지원", "디자인교육", "크리에이티브환경"],
        posting_date: "2025-08-12"
      },
      {
        id: 4,
        title: "마케팅 매니저 (디지털 마케팅)",
        company: "이커머스플랫폼",
        location: "경기", 
        category: "마케팅",
        description: "온라인 쇼핑몰의 디지털 마케팅을 총괄할 매니저를 채용합니다.",
        salary: "연봉 3800~5500만원",
        experience: "3~6년차",
        employment_type: "정규직",
        deadline: "2025-09-25",
        image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=300&fit=crop",
        apply_url: "https://ecommerce-platform.co.kr/careers",
        skills: ["Google Ads", "Facebook Ads", "데이터분석", "SEO"],
        benefits: ["마케팅예산 권한", "성과인센티브", "해외연수기회"],
        posting_date: "2025-08-08"
      },
      {
        id: 5,
        title: "HR 담당자 (신입/경력)",
        company: "글로벌컨설팅",
        location: "서울",
        category: "인사·총무",
        description: "글로벌 컨설팅 회사에서 채용 및 인사관리를 담당할 HR 담당자를 채용합니다.",
        salary: "연봉 2800~4200만원",
        experience: "신입~3년차",
        employment_type: "정규직", 
        deadline: "2025-09-05",
        image_url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=300&h=300&fit=crop",
        apply_url: "https://global-consulting.co.kr/hr",
        skills: ["채용업무", "노무관리", "교육기획", "엑셀활용"],
        benefits: ["해외파견기회", "영어교육", "컨설팅교육"],
        posting_date: "2025-08-18"
      },
      {
        id: 6,
        title: "데이터 사이언티스트",
        company: "AI테크놀로지",
        location: "서울",
        category: "IT·개발",
        description: "머신러닝과 데이터 분석을 통해 비즈니스 인사이트를 도출할 데이터 사이언티스트를 채용합니다.",
        salary: "연봉 5000~7000만원",
        experience: "3~8년차",
        employment_type: "정규직",
        deadline: "2025-09-30",
        image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=300&fit=crop",
        apply_url: "https://ai-technology.co.kr/jobs",
        skills: ["Python", "R", "SQL", "TensorFlow", "PyTorch"],
        benefits: ["GPU서버제공", "컨퍼런스참가", "연구환경"],
        posting_date: "2025-08-03"
      },
      {
        id: 7,
        title: "영업 매니저 (B2B)",
        company: "산업솔루션",
        location: "대구",
        category: "영업",
        description: "B2B 영업을 담당할 매니저를 채용합니다. 기존 고객 관리와 신규 고객 발굴을 통해 매출 확대에 기여해주실 분을 찾습니다.",
        salary: "연봉 3500~5000만원 + 인센티브",
        experience: "2~7년차",
        employment_type: "정규직",
        deadline: "2025-09-12",
        image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
        apply_url: "https://industrial-solutions.co.kr/recruit",
        skills: ["B2B영업", "고객관리", "제안서작성", "협상"],
        benefits: ["영업수당", "법인차량", "출장비", "성과급"],
        posting_date: "2025-08-14"
      },
      {
        id: 8,
        title: "풀스택 개발자 (Node.js + React)",
        company: "스타트업플랫폼",
        location: "서울",
        category: "IT·개발", 
        description: "Node.js 백엔드와 React 프론트엔드를 모두 다룰 수 있는 풀스택 개발자를 채용합니다.",
        salary: "연봉 4500~6500만원",
        experience: "3~6년차",
        employment_type: "정규직",
        deadline: "2025-09-18",
        image_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=300&fit=crop",
        apply_url: "https://startup-platform.co.kr/jobs",
        skills: ["Node.js", "React", "MongoDB", "Docker", "AWS"],
        benefits: ["스톡옵션", "유연근무", "최신장비지원", "간식무제한"],
        posting_date: "2025-08-16"
      }
    ];
    
    return demoJobs;
    
  } catch (error) {
    console.error('크롤링 오류:', error);
    return jobs;
  }
}

// 메인 API 핸들러
export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { page = 1, limit = 12, search = '', category = 'all', location = 'all' } = req.query;
    
    // 채용공고 데이터 가져오기
    let jobs = await crawlSaramin();
    
    // 검색 필터
    if (search) {
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // 카테고리 필터
    if (category && category !== 'all') {
      jobs = jobs.filter(job => 
        job.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    // 지역 필터
    if (location && location !== 'all') {
      jobs = jobs.filter(job => 
        job.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // 페이지네이션
    const totalItems = jobs.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = Math.min(startIndex + parseInt(limit), totalItems);
    
    const paginatedJobs = jobs.slice(startIndex, endIndex);
    
    return res.status(200).json({
      success: true,
      data: paginatedJobs,
      total: totalItems,
      message: null
    });
    
  } catch (error) {
    console.error('API 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      data: null
    });
  }
}