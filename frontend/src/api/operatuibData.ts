import { OperationDataResponse } from "../types/operationData";
import { axiosInstance } from "./axios";
// 있는줄 모르고 만들었습니다 ㅜㅜ
export default async function getOperationData(
  dataType: string,
): Promise<OperationDataResponse> {
  const response = await axiosInstance.get(
    `/api/v1/mdms/operation-data?page=0&size=999&sort=id,asc&dataType=${dataType}`,
  );
  return response.data as any;
}
