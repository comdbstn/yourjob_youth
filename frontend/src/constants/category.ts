export const categoryIdMap: {
  [key: number]: string;
} = {
  0: "all",
  1: "general",
  2: "question", 
  3: "career",
  4: "interview",
  5: "company",
  6: "news",
  7: "tip",
};

export const categoryMap: { 
  [key: string]: { 
    subTitle: string; 
    description: string; 
  } 
} = {
  'all': { subTitle: '전체글', description: '모든 게시글을 확인하세요' },
  'general': { subTitle: '일반', description: '자유로운 주제의 게시글을 공유하세요' },
  'question': { subTitle: '질문', description: '궁금한 것이 있다면 질문해보세요' },
  'career': { subTitle: '커리어', description: '커리어 관련 정보와 경험을 나누세요' },
  'interview': { subTitle: '면접후기', description: '면접 경험과 팁을 공유하세요' },
  'company': { subTitle: '회사리뷰', description: '회사에 대한 생생한 리뷰를 확인하세요' },
  'news': { subTitle: '취업뉴스', description: '최신 취업 관련 뉴스와 정보' },
  'tip': { subTitle: '꿀팁', description: '취업에 도움이 되는 유용한 팁들' },
}; 