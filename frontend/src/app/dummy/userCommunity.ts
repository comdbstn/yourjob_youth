export interface SearchParamsCommunityPost {
  category?: string;
  keyword?: string;
  type?: string;
}

export interface CommunityPostResponse {
  id: number;
  category: string;
  subTitle: string;
  title: string;
  content: string;
  writer: string;
  date: string;
  views: number;
  likes: number;
  isNotice?: boolean;
}

export interface CommunityPostListResponse {
  content: CommunityPostResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const dummyCommunityPostListResponse: CommunityPostListResponse = {
  content: [
    {
      id: 1,
      category: "europe",
      subTitle: "유럽",
      title: "취업하기에 적합한가요?",
      content: "피드백 해주세요",
      writer: "홍길동",
      date: "2024.10.10 12:36",
      views: 1000,
      likes: 1500
    },
    {
      id: 2,
      category: "america",
      subTitle: "미국",
      title: "미국 유학 준비",
      content: "어떤 준비가 필요할까요?",
      writer: "김철수",
      date: "2024.10.11 14:20",
      views: 850,
      likes: 1200
    },
    {
      id: 3,
      category: "asia",
      subTitle: "아시아",
      title: "일본에서의 생활",
      content: "생활비는 얼마나 드나요?",
      writer: "이영희",
      date: "2024.10.12 09:15",
      views: 920,
      likes: 1100
    },
    {
      id: 4,
      category: "oceania",
      subTitle: "오세아니아",
      title: "호주 유학 경험",
      content: "호주에서의 유학 생활을 공유합니다.",
      writer: "박민수",
      date: "2024.10.13 16:45",
      views: 780,
      likes: 950
    },
    {
      id: 5,
      category: "other",
      subTitle: "기타",
      title: "기타 지역 유학 정보",
      content: "다양한 지역의 유학 정보를 나눠요.",
      writer: "최지우",
      date: "2024.10.14 11:30",
      views: 600,
      likes: 700
    },
    {
      id: 6,
      category: "europe",
      subTitle: "유럽",
      title: "독일 유학 준비",
      content: "독일 유학에 필요한 서류는?",
      writer: "홍길동",
      date: "2024.10.15 13:50",
      views: 1100,
      likes: 1300
    },
    {
      id: 7,
      category: "america",
      subTitle: "미국",
      title: "미국 대학원 입학",
      content: "입학 절차와 준비 사항",
      writer: "김철수",
      date: "2024.10.16 10:25",
      views: 950,
      likes: 1150
    },
    {
      id: 8,
      category: "asia",
      subTitle: "아시아",
      title: "중국 유학 생활",
      content: "중국에서의 유학 생활은 어떤가요?",
      writer: "이영희",
      date: "2024.10.17 08:40",
      views: 870,
      likes: 1050
    },
    {
      id: 9,
      category: "oceania",
      subTitle: "오세아니아",
      title: "뉴질랜드 유학",
      content: "뉴질랜드 유학에 대해 궁금한 점",
      writer: "박민수",
      date: "2024.10.18 15:10",
      views: 720,
      likes: 900
    },
    {
      id: 10,
      category: "other",
      subTitle: "기타",
      title: "기타 지역 유학 팁",
      content: "유학 생활에 도움이 되는 팁",
      writer: "최지우",
      date: "2024.10.19 12:00",
      views: 650,
      likes: 800
    },
    {
      id: 11,
      category: "europe",
      subTitle: "유럽",
      title: "프랑스 유학 준비",
      content: "프랑스 유학에 필요한 정보",
      writer: "홍길동",
      date: "2024.10.20 14:30",
      views: 1150,
      likes: 1400
    },
    {
      id: 12,
      category: "america",
      subTitle: "미국",
      title: "미국 생활비",
      content: "미국에서의 생활비는 얼마나 드나요?",
      writer: "김철수",
      date: "2024.10.21 09:45",
      views: 890,
      likes: 1250
    },
    {
      id: 13,
      category: "asia",
      subTitle: "아시아",
      title: "한국 유학",
      content: "한국에서의 유학 생활",
      writer: "이영희",
      date: "2024.10.22 11:20",
      views: 930,
      likes: 1080
    },
    {
      id: 14,
      category: "oceania",
      subTitle: "오세아니아",
      title: "호주 유학 비용",
      content: "호주 유학에 드는 비용",
      writer: "박민수",
      date: "2024.10.23 16:00",
      views: 800,
      likes: 950
    },
    {
      id: 15,
      category: "other",
      subTitle: "기타",
      title: "기타 지역 유학 준비",
      content: "유학 준비에 필요한 정보",
      writer: "최지우",
      date: "2024.10.24 13:10",
      views: 670,
      likes: 750
    },
    {
      id: 16,
      category: "europe",
      subTitle: "유럽",
      title: "스페인 유학",
      content: "스페인에서의 유학 생활",
      writer: "홍길동",
      date: "2024.10.25 12:50",
      views: 1200,
      likes: 1450
    },
    {
      id: 17,
      category: "america",
      subTitle: "미국",
      title: "미국 대학 생활",
      content: "미국 대학 생활에 대해",
      writer: "김철수",
      date: "2024.10.26 10:30",
      views: 920,
      likes: 1300
    },
    {
      id: 18,
      category: "asia",
      subTitle: "아시아",
      title: "일본 유학 비용",
      content: "일본 유학에 드는 비용",
      writer: "이영희",
      date: "2024.10.27 09:00",
      views: 880,
      likes: 1100
    },
    {
      id: 19,
      category: "oceania",
      subTitle: "오세아니아",
      title: "뉴질랜드 유학 준비",
      content: "뉴질랜드 유학에 필요한 정보",
      writer: "박민수",
      date: "2024.10.28 15:40",
      views: 750,
      likes: 950
    },
    {
      id: 20,
      category: "other",
      subTitle: "기타",
      title: "기타 지역 유학 생활",
      content: "유학 생활에 대한 경험 공유",
      writer: "최지우",
      date: "2024.10.29 11:50",
      views: 680,
      likes: 800
    },
    {
      id: 21,
      category: "europe",
      subTitle: "유럽",
      title: "이탈리아 유학",
      content: "이탈리아에서의 유학 생활",
      writer: "홍길동",
      date: "2024.10.30 14:10",
      views: 1250,
      likes: 1500
    },
    {
      id: 22,
      category: "america",
      subTitle: "미국",
      title: "미국 유학 생활",
      content: "미국에서의 유학 생활",
      writer: "김철수",
      date: "2024.10.31 09:20",
      views: 910,
      likes: 1350
    },
    {
      id: 23,
      category: "asia",
      subTitle: "아시아",
      title: "중국 유학 비용",
      content: "중국 유학에 드는 비용",
      writer: "이영희",
      date: "2024.11.01 08:50",
      views: 870,
      likes: 1150
    },
    {
      id: 24,
      category: "oceania",
      subTitle: "오세아니아",
      title: "호주 유학 생활",
      content: "호주에서의 유학 생활",
      writer: "박민수",
      date: "2024.11.02 16:20",
      views: 790,
      likes: 1000
    },
    {
      id: 25,
      category: "other",
      subTitle: "기타",
      title: "기타 지역 유학 정보",
      content: "유학 정보를 나눠요",
      writer: "최지우",
      date: "2024.11.03 12:30",
      views: 660,
      likes: 850
    },
    {
      id: 26,
      category: "europe",
      subTitle: "유럽",
      title: "영국 유학 준비",
      content: "영국 유학에 필요한 정보",
      writer: "홍길동",
      date: "2024.11.04 13:40",
      views: 1300,
      likes: 1550
    },
    {
      id: 27,
      category: "america",
      subTitle: "미국",
      title: "미국 대학원 생활",
      content: "미국 대학원 생활에 대해",
      writer: "김철수",
      date: "2024.11.05 10:10",
      views: 940,
      likes: 1400
    },
    {
      id: 28,
      category: "asia",
      subTitle: "아시아",
      title: "한국 유학 준비",
      content: "한국 유학에 필요한 정보",
      writer: "이영희",
      date: "2024.11.06 09:30",
      views: 890,
      likes: 1200
    },
    {
      id: 29,
      category: "oceania",
      subTitle: "오세아니아",
      title: "뉴질랜드 유학 생활",
      content: "뉴질랜드에서의 유학 생활",
      writer: "박민수",
      date: "2024.11.07 15:50",
      views: 770,
      likes: 1050
    },
    {
      id: 30,
      category: "other",
      subTitle: "기타",
      title: "기타 지역 유학 팁",
      content: "유학 생활에 도움이 되는 팁",
      writer: "최지우",
      date: "2024.11.08 11:40",
      views: 690,
      likes: 900
    }
  ],
  page: 1,
  size: 30,
  totalElements: 30,
  totalPages: 1
};

export const fnGetCommunityPostList = (searchParams: SearchParamsCommunityPost, page: number, size: number): CommunityPostListResponse => {

  const filteredPosts = dummyCommunityPostListResponse.content.filter(post => {
    return (
      (searchParams.category === 'all' || post.category === searchParams.category) &&
      (!searchParams.keyword ||
        (searchParams.type === 'title' && post.title.includes(searchParams.keyword)) ||
        (searchParams.type === 'content' && post.content.includes(searchParams.keyword)) ||
        (searchParams.type === 'title+content' && (post.title.includes(searchParams.keyword) || post.content.includes(searchParams.keyword))) ||
        (searchParams.type === 'writer' && post.writer.includes(searchParams.keyword))
      )
    );
  });

  return {
    ...dummyCommunityPostListResponse,
    content: filteredPosts.slice((page - 1) * size, page * size),
    page,
    size,
    totalElements: filteredPosts.length,
    totalPages: Math.ceil(filteredPosts.length / size)
  };
};

export const fnGetCommunityPost = (id: number): CommunityPostResponse | undefined => {
  return dummyCommunityPostListResponse.content.find(post => post.id === id);
};


