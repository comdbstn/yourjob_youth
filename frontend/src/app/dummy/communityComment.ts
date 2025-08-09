export interface CommentProps {
  id: number;
  postId: number;
  writer: string;
  date: string;
  content: string;
  likes: number;
  recommentId?: number;
}

export const dummyCommentList: CommentProps[] = [
  { id: 1, postId: 1, writer: "익명1", date: "2024.10.10 13:00", content: "정말 유익한 정보네요. 감사합니다!", likes: 10 },
  { id: 2, postId: 1, writer: "익명2", date: "2024.10.10 14:00", content: "저도 비슷한 경험이 있는데, 많은 도움이 되었습니다.", likes: 8 },
  { id: 3, postId: 1, writer: "익명3", date: "2024.10.10 15:00", content: "더 자세한 정보가 필요합니다. 추가로 알려주실 수 있나요?", likes: 5, recommentId: 1 },
  { id: 4, postId: 2, writer: "익명4", date: "2024.10.11 15:00", content: "좋은 정보 감사합니다. 많은 도움이 되었습니다.", likes: 7 },
  { id: 5, postId: 2, writer: "익명5", date: "2024.10.11 16:00", content: "저도 유학 준비 중인데, 정말 유익한 정보네요.", likes: 6 },
  { id: 6, postId: 2, writer: "익명6", date: "2024.10.11 17:00", content: "추가로 궁금한 점이 있는데, 답변 부탁드립니다.", likes: 4, recommentId: 4 },
  { id: 7, postId: 3, writer: "익명7", date: "2024.10.12 10:00", content: "정말 흥미로운 내용입니다. 감사합니다.", likes: 9 },
  { id: 8, postId: 3, writer: "익명8", date: "2024.10.12 11:00", content: "유익한 정보 감사합니다. 많은 도움이 되었습니다.", likes: 3 },
  { id: 9, postId: 3, writer: "익명9", date: "2024.10.12 12:00", content: "더 많은 정보가 필요합니다. 추가로 알려주실 수 있나요?", likes: 5, recommentId: 7 },
  { id: 10, postId: 4, writer: "익명10", date: "2024.10.13 16:00", content: "좋은 정보 감사합니다. 많은 도움이 되었습니다.", likes: 7 },
  { id: 11, postId: 4, writer: "익명11", date: "2024.10.13 17:00", content: "저도 비슷한 경험이 있는데, 많은 도움이 되었습니다.", likes: 6 },
  { id: 12, postId: 4, writer: "익명12", date: "2024.10.13 18:00", content: "추가로 궁금한 점이 있는데, 답변 부탁드립니다.", likes: 4, recommentId: 10 },
  { id: 13, postId: 5, writer: "익명13", date: "2024.10.14 11:00", content: "정말 유익한 정보네요. 감사합니다!", likes: 10 },
  { id: 14, postId: 5, writer: "익명14", date: "2024.10.14 12:00", content: "저도 비슷한 경험이 있는데, 많은 도움이 되었습니다.", likes: 8 },
  { id: 15, postId: 5, writer: "익명15", date: "2024.10.14 13:00", content: "더 자세한 정보가 필요합니다. 추가로 알려주실 수 있나요?", likes: 5, recommentId: 13 },
  { id: 16, postId: 6, writer: "익명16", date: "2024.10.15 14:00", content: "좋은 정보 감사합니다. 많은 도움이 되었습니다.", likes: 7 },
  { id: 17, postId: 6, writer: "익명17", date: "2024.10.15 15:00", content: "저도 유학 준비 중인데, 정말 유익한 정보네요.", likes: 6 },
  { id: 18, postId: 6, writer: "익명18", date: "2024.10.15 16:00", content: "추가로 궁금한 점이 있는데, 답변 부탁드립니다.", likes: 4, recommentId: 16 },
  { id: 19, postId: 7, writer: "익명19", date: "2024.10.16 10:00", content: "정말 흥미로운 내용입니다. 감사합니다.", likes: 9 },
  { id: 20, postId: 7, writer: "익명20", date: "2024.10.16 11:00", content: "유익한 정보 감사합니다. 많은 도움이 되었습니다.", likes: 3 },
  { id: 21, postId: 7, writer: "익명21", date: "2024.10.16 12:00", content: "더 많은 정보가 필요합니다. 추가로 알려주실 수 있나요?", likes: 5, recommentId: 19 },
  { id: 22, postId: 8, writer: "익명22", date: "2024.10.17 08:00", content: "좋은 정보 감사합니다. 많은 도움이 되었습니다.", likes: 7 },
  { id: 23, postId: 8, writer: "익명23", date: "2024.10.17 09:00", content: "저도 비슷한 경험이 있는데, 많은 도움이 되었습니다.", likes: 6 },
  { id: 24, postId: 8, writer: "익명24", date: "2024.10.17 10:00", content: "추가로 궁금한 점이 있는데, 답변 부탁드립니다.", likes: 4, recommentId: 22 },
  { id: 25, postId: 9, writer: "익명25", date: "2024.10.18 14:00", content: "정말 유익한 정보네요. 감사합니다!", likes: 10 },
  { id: 26, postId: 9, writer: "익명26", date: "2024.10.18 15:00", content: "저도 비슷한 경험이 있는데, 많은 도움이 되었습니다.", likes: 8 },
  { id: 27, postId: 9, writer: "익명27", date: "2024.10.18 16:00", content: "더 자세한 정보가 필요합니다. 추가로 알려주실 수 있나요?", likes: 5, recommentId: 25 },
  { id: 28, postId: 10, writer: "익명28", date: "2024.10.19 11:00", content: "좋은 정보 감사합니다. 많은 도움이 되었습니다.", likes: 7 },
  { id: 29, postId: 10, writer: "익명29", date: "2024.10.19 12:00", content: "저도 유학 준비 중인데, 정말 유익한 정보네요.", likes: 6 },
  { id: 30, postId: 10, writer: "익명30", date: "2024.10.19 13:00", content: "추가로 궁금한 점이 있는데, 답변 부탁드립니다.", likes: 4, recommentId: 28 },
  { id: 31, postId: 11, writer: "익명31", date: "2024.10.20 15:00", content: "정말 유익한 정보네요. 감사합니다!", likes: 10 },
  { id: 32, postId: 11, writer: "익명32", date: "2024.10.20 16:00", content: "저도 비슷한 경험이 있는데, 많은 도움이 되었습니다.", likes: 8 },
  { id: 33, postId: 11, writer: "익명33", date: "2024.10.20 17:00", content: "더 자세한 정보가 필요합니다. 추가로 알려주실 수 있나요?", likes: 5, recommentId: 31 },
  { id: 34, postId: 12, writer: "익명34", date: "2024.10.21 10:00", content: "좋은 정보 감사합니다. 많은 도움이 되었습니다.", likes: 7 },
  { id: 35, postId: 12, writer: "익명35", date: "2024.10.21 11:00", content: "저도 유학 준비 중인데, 정말 유익한 정보네요.", likes: 6 },
  { id: 36, postId: 12, writer: "익명36", date: "2024.10.21 12:00", content: "추가로 궁금한 점이 있는데, 답변 부탁드립니다.", likes: 4, recommentId: 34 },
  { id: 37, postId: 13, writer: "익명37", date: "2024.10.22 12:00", content: "정말 흥미로운 내용입니다. 감사합니다.", likes: 9 },
  { id: 38, postId: 13, writer: "익명38", date: "2024.10.22 13:00", content: "유익한 정보 감사합니다. 많은 도움이 되었습니다.", likes: 3 },
  { id: 39, postId: 13, writer: "익명39", date: "2024.10.22 14:00", content: "더 많은 정보가 필요합니다. 추가로 알려주실 수 있나요?", likes: 5, recommentId: 37 },
  { id: 40, postId: 14, writer: "익명40", date: "2024.10.23 17:00", content: "좋은 정보 감사합니다. 많은 도움이 되었습니다.", likes: 7 },
  { id: 41, postId: 14, writer: "익명41", date: "2024.10.23 18:00", content: "저도 비슷한 경험이 있는데, 많은 도움이 되었습니다.", likes: 6 },
  { id: 42, postId: 14, writer: "익명42", date: "2024.10.23 19:00", content: "추가로 궁금한 점이 있는데, 답변 부탁드립니다.", likes: 4, recommentId: 40 },
  { id: 43, postId: 15, writer: "익명43", date: "2024.10.24 14:00", content: "정말 유익한 정보네요. 감사합니다!", likes: 10 },
  { id: 44, postId: 15, writer: "익명44", date: "2024.10.24 15:00", content: "저도 비슷한 경험이 있는데, 많은 도움이 되었습니다.", likes: 8 },
  { id: 45, postId: 15, writer: "익명45", date: "2024.10.24 16:00", content: "더 자세한 정보가 필요합니다. 추가로 알려주실 수 있나요?", likes: 5, recommentId: 43 },
  { id: 46, postId: 16, writer: "익명46", date: "2024.10.25 13:00", content: "좋은 정보 감사합니다. 많은 도움이 되었습니다.", likes: 7 },
  { id: 47, postId: 16, writer: "익명47", date: "2024.10.25 14:00", content: "저도 유학 준비 중인데, 정말 유익한 정보네요.", likes: 6 },
  { id: 48, postId: 16, writer: "익명48", date: "2024.10.25 15:00", content: "추가로 궁금한 점이 있는데, 답변 부탁드립니다.", likes: 4, recommentId: 46 },
  { id: 49, postId: 17, writer: "익명49", date: "2024.10.26 11:00", content: "정말 흥미로운 내용입니다. 감사합니다.", likes: 9 },
  { id: 50, postId: 17, writer: "익명50", date: "2024.10.26 12:00", content: "유익한 정보 감사합니다. 많은 도움이 되었습니다.", likes: 3 }
];

export const fnGetCommentList = (postId: number): CommentProps[] => {
  return dummyCommentList.filter(comment => comment.postId === postId) || [];
}
