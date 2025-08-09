export interface SearchParamsMentorPost {
  category?: string;
  keyword?: string;
  type?: string;
}

export interface MentorPostResponse {
  id: number;
  category: string;
  subTitle: string;
  title: string;
  content: string;
  writer: string;
  date: string;
  views: number;
  isNotice?: boolean;
}

export interface MentorPostListResponse {
  content: MentorPostResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const dummyMentorPostListResponse: MentorPostListResponse = {
  content: [
    {
      id: 1,
      category: "europe",
      subTitle: "O성전자",
      title: "취업 준비에 대한 조언 부탁드립니다.",
      content: "O성전자에 취업하기 위해 어떤 준비를 해야 할까요?",
      writer: "홍길동",
      date: "2024.10.10 12:36",
      views: 1000,
      isNotice: false
    },
    {
      id: 2,
      category: "america",
      subTitle: "L전자",
      title: "미국 유학 후 취업 가능성",
      content: "L전자에서 미국 유학 후 취업할 수 있는 가능성은 얼마나 될까요?",
      writer: "김철수",
      date: "2024.10.11 14:20",
      views: 850,
      isNotice: false
    },
    {
      id: 3,
      category: "asia",
      subTitle: "현O자동차",
      title: "일본에서의 생활과 취업",
      content: "현O자동차에서 일본에서의 생활과 취업 기회에 대해 알고 싶습니다.",
      writer: "이영희",
      date: "2024.10.12 09:15",
      views: 920,
      isNotice: false
    },
    {
      id: 4,
      category: "oceania",
      subTitle: "SK하O닉스",
      title: "호주 유학 후 취업",
      content: "SK하O닉스에서 호주 유학 후 취업할 수 있는 방법에 대해 알려주세요.",
      writer: "박민수",
      date: "2024.10.13 16:45",
      views: 780,
      isNotice: false
    },
    {
      id: 5,
      category: "other",
      subTitle: "네O버",
      title: "기타 지역에서의 취업 기회",
      content: "네O버에서 다양한 지역에서의 취업 기회에 대해 알고 싶습니다.",
      writer: "최지우",
      date: "2024.10.14 11:30",
      views: 600,
      isNotice: false
    },
    {
      id: 6,
      category: "europe",
      subTitle: "카O오",
      title: "독일 유학 후 취업",
      content: "카O오에서 독일 유학 후 취업할 수 있는 방법에 대해 조언 부탁드립니다.",
      writer: "홍길동",
      date: "2024.10.15 13:50",
      views: 1100,
      isNotice: false
    },
    {
      id: 7,
      category: "america",
      subTitle: "포O코",
      title: "미국 대학원 입학과 취업",
      content: "포O코에서 미국 대학원 입학 후 취업할 수 있는 가능성에 대해 알고 싶습니다.",
      writer: "김철수",
      date: "2024.10.16 10:25",
      views: 950,
      isNotice: false
    },
    {
      id: 8,
      category: "asia",
      subTitle: "한O",
      title: "중국 유학 후 취업",
      content: "한O에서 중국 유학 후 취업할 수 있는 방법에 대해 조언 부탁드립니다.",
      writer: "이영희",
      date: "2024.10.17 08:40",
      views: 870,
      isNotice: false
    },
    {
      id: 9,
      category: "oceania",
      subTitle: "롯O",
      title: "뉴질랜드 유학 후 취업",
      content: "롯O에서 뉴질랜드 유학 후 취업할 수 있는 방법에 대해 알고 싶습니다.",
      writer: "박민수",
      date: "2024.10.18 15:10",
      views: 720,
      isNotice: false
    },
    {
      id: 10,
      category: "other",
      subTitle: "CJ제O제당",
      title: "기타 지역에서의 취업 팁",
      content: "CJ제O제당에서 기타 지역에서의 취업 팁을 공유해 주세요.",
      writer: "최지우",
      date: "2024.10.19 12:00",
      views: 650,
      isNotice: false
    },
    {
      id: 11,
      category: "europe",
      subTitle: "O성전자",
      title: "프랑스 유학 후 취업",
      content: "O성전자에서 프랑스 유학 후 취업할 수 있는 방법에 대해 조언 부탁드립니다.",
      writer: "홍길동",
      date: "2024.10.20 14:30",
      views: 1150,
      isNotice: false
    },
    {
      id: 12,
      category: "america",
      subTitle: "L전자",
      title: "미국 생활비와 취업",
      content: "L전자에서 미국 생활비와 취업 가능성에 대해 알고 싶습니다.",
      writer: "김철수",
      date: "2024.10.21 09:45",
      views: 890,
      isNotice: false
    },
    {
      id: 13,
      category: "asia",
      subTitle: "현O자동차",
      title: "한국 유학 후 취업",
      content: "현O자동차에서 한국 유학 후 취업할 수 있는 방법에 대해 조언 부탁드립니다.",
      writer: "이영희",
      date: "2024.10.22 11:20",
      views: 930,
      isNotice: false
    },
    {
      id: 14,
      category: "oceania",
      subTitle: "SK하O닉스",
      title: "호주 유학 비용과 취업",
      content: "SK하O닉스에서 호주 유학 비용과 취업 가능성에 대해 알고 싶습니다.",
      writer: "박민수",
      date: "2024.10.23 16:00",
      views: 800,
      isNotice: false
    },
    {
      id: 15,
      category: "other",
      subTitle: "네O버",
      title: "기타 지역 유학 후 취업",
      content: "네O버에서 기타 지역 유학 후 취업할 수 있는 방법에 대해 조언 부탁드립니다.",
      writer: "최지우",
      date: "2024.10.24 13:10",
      views: 670,
      isNotice: false
    },
    {
      id: 16,
      category: "europe",
      subTitle: "카O오",
      title: "스페인 유학 후 취업",
      content: "카O오에서 스페인 유학 후 취업할 수 있는 방법에 대해 알고 싶습니다.",
      writer: "홍길동",
      date: "2024.10.25 12:50",
      views: 1200,
      isNotice: false
    },
    {
      id: 17,
      category: "america",
      subTitle: "포O코",
      title: "미국 대학 생활과 취업",
      content: "포O코에서 미국 대학 생활 후 취업할 수 있는 방법에 대해 조언 부탁드립니다.",
      writer: "김철수",
      date: "2024.10.26 10:30",
      views: 920,
      isNotice: false
    },
    {
      id: 18,
      category: "asia",
      subTitle: "한O",
      title: "일본 유학 비용과 취업",
      content: "한O에서 일본 유학 비용과 취업 가능성에 대해 알고 싶습니다.",
      writer: "이영희",
      date: "2024.10.27 09:00",
      views: 880,
      isNotice: false
    },
    {
      id: 19,
      category: "oceania",
      subTitle: "롯O",
      title: "뉴질랜드 유학 준비와 취업",
      content: "롯O에서 뉴질랜드 유학 준비와 취업할 수 있는 방법에 대해 조언 부탁드립니다.",
      writer: "박민수",
      date: "2024.10.28 15:40",
      views: 750,
      isNotice: false
    },
    {
      id: 20,
      category: "other",
      subTitle: "CJ제O제당",
      title: "기타 지역 유학 생활과 취업",
      content: "CJ제O제당에서 기타 지역 유학 생활과 취업에 대해 알고 싶습니다.",
      writer: "최지우",
      date: "2024.10.29 11:50",
      views: 680,
      isNotice: false
    }
  ],
  page: 1,
  size: 30,
  totalElements: 20,
  totalPages: 1
};

export const fnGetMentorPostList = (searchParams: SearchParamsMentorPost, page: number, size: number): MentorPostListResponse => {

  const filteredPosts = dummyMentorPostListResponse.content.filter(post => {
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
    ...dummyMentorPostListResponse,
    content: filteredPosts.slice((page - 1) * size, page * size),
    page,
    size,
    totalElements: filteredPosts.length,
    totalPages: Math.ceil(filteredPosts.length / size)
  };
};

export const fnGetMentorPost = (searchParams: SearchParamsMentorPost, id: number): MentorPostResponse | undefined => {
  const filteredPosts = dummyMentorPostListResponse.content.filter(post => {
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

  return filteredPosts.find(post => post.id === id);
};
