// 통계 API 서버리스 함수
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
    // 통계 데이터 (실제로는 jobs API에서 계산)
    const stats = {
      total_jobs: 8,
      categories: {
        "IT·개발": 4,
        "디자인": 1,
        "마케팅": 1,
        "인사·총무": 1,
        "영업": 1
      },
      locations: {
        "서울": 6,
        "경기": 1,
        "대구": 1
      },
      employment_types: {
        "정규직": 8
      }
    };
    
    return res.status(200).json({
      success: true,
      data: stats,
      message: null
    });
    
  } catch (error) {
    console.error('통계 API 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      data: null
    });
  }
}