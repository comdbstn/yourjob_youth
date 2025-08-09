import { axiosInstance } from '../api/axios';
import { OperationData, OperationDataType, OperationDataResponse } from '../types/operationData';


export const getOperationData = async (dataType: OperationDataType, level1?: string, level2?: string, level3?: string, keyword?: string, size: Number = 100): Promise<OperationData[]> => {
  try {
    const response = await axiosInstance.get<OperationDataResponse>("/api/v1/mdms/operation-data", {
      params: {
        dataType,
        level1,
        level2,
        level3,
        keyword,
        size: size,
        page: 0,
        sort: 'id,asc'
      },
    });
    return response.data.content;
  } catch (error) {
    console.error('Error fetching operation data:', error);
    throw error;
  }
}; 