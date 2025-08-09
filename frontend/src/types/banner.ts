export enum BannerGroup {
  MAIN_A = '메인A',
  MAIN_B = '메인B',
  SUB_A = '서브A',
  SUB_B = '서브B',
  CORP_AD = '기업광고'
}

export enum BannerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface Banner {
  id: number;
  groupName: BannerGroup;
  title: string;
  imageUrl: string;
  linkTarget: string;
  linkTargetType: '_blank' | '_self';
  startDate: string;
  endDate: string;
  status: BannerStatus;
} 