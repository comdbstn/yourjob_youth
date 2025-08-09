import { axiosInstance } from "./axios";

export interface LevelCode {
  code: string;
  levelValue: string;
  parentCode: string | null;
}

export interface LevelOneCodesResponse {
  dataType: string;
  dataTypeName: string;
  levelCodes: LevelCode[];
}

export interface Request {
  dataType: string;
}

export default async function getLevelOneCode(
    req: Request,
): Promise<LevelOneCodesResponse> {
  const response = await axiosInstance.get(
      `/api/v1/corpmem/jobpost-data/level1-codes?dataType=${req.dataType}&size=999999`,
  );
  return response.data as LevelOneCodesResponse;
}

export interface CompanyTypeOption {
  id: string;
  value: string;
  label: string;
  operationDataId: string;
}

export async function getCompanyTypeOptions(): Promise<CompanyTypeOption[]> {
  try {
    const response = await getLevelOneCode({ dataType: '00000011' });
    // 동아리/학생자치단체 제외
    return response.levelCodes
    .filter((code) => code.code !== '11A00017')
    .map((code, index) => ({
      id: (index + 1).toString(),
      value: code.code,
      label: code.levelValue,
      operationDataId: code.code
    }));
  } catch (error) {
    console.error('Failed to fetch company type options:', error);
    return [];
  }
}