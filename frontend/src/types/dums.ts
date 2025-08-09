export interface RegionResponse {
  regionId: number;
  regionName: string;
  regionType: 'domestic' | 'international';
  createdAt: string;
  updatedAt: string;
}

export interface CorporateTypeResponse {
  corporateTypeId: number;
  corporateTypeName: string;
  createdAt: string;
  updatedAt: string;
} 