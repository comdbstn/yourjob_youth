import { FileResponse } from "./common";

export enum ApplyStatus {
  UNREAD = 'UNREAD',    // 미열람
  READ = 'READ',        // 열람
  ACCEPTED = 'ACCEPTED', // 합격
  REJECTED = 'REJECTED', // 불합격
  PENDING = 'PENDING', // 미심사
  PASSED = 'PASSED', // 서류합격
  FAILED = 'FAILED', // 불합격
  FINAL = 'FINAL', // 최종합격
}

export enum ApplyStatusText {
  UNREAD = '미열람',
  READ = '열람',
  ACCEPTED = '합격',
  REJECTED = '불합격',
  PENDING = '미심사',
  PASSED = '서류합격',
  FAILED = '불합격',
  FINAL = '최종합격',
}

export interface Apply {
  id: number;
  jobId: number;
  applyDate: string;
  companyName: string;
  position: string;
  title: string;
  status: ApplyStatus;
  attachments: FileResponse[];
}

export interface ApplyListResponse {
  content: Apply[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
} 