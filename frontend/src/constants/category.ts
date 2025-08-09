export const categoryIdMap: {
  [key: number]: string;
} = {
  0: "all",
  1: "america",
  2: "europe",
  3: "asia",
  4: "oceania",
  5: "other",
};

export const categoryMap: { 
  [key: string]: { 
    subTitle: string; 
    description: string; 
  } 
} = {
  'all': { subTitle: '전체글', description: '모든 게시글을 확인하세요' },
  'america': { subTitle: '미주', description: '미주 지역 유학생들의 이야기' },
  'europe': { subTitle: '유럽', description: '유럽 지역 유학생들의 이야기' },
  'asia': { subTitle: '아시아', description: '아시아 지역 유학생들의 이야기' },
  'oceania': { subTitle: '오세아니아', description: '오세아니아 지역 유학생들의 이야기' },
  'other': { subTitle: '기타', description: '기타 지역 유학생들의 이야기' },
}; 