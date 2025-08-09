import { axiosInstance } from "./axios";

export interface JobpostDataItem extends OperationData {
  createdAt: string;
  updatedAt: string;
}
export interface OperationData {
  operationDataId: string;
  dataType: string;
  level1?: string;
  level2?: string;
  level3?: string;
}
export interface JobpostDataResponse {
  content: JobpostDataItem[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

export const fetchJobpostData = async (
  dataType: string,
): Promise<JobpostDataItem[]> => {
  try {
    const response = await axiosInstance.get<JobpostDataResponse>(
      "/api/v1/corpmem/jobpost-data",
      {
        params: {
          dataType,
          size: 999999,
        },
      },
    );
    return response.data.content;
  } catch (error) {
    console.error(`Error fetching ${dataType} data:`, error);
    return [];
  }
};

// Group data by level1 field
export const groupDataByLevel1 = (
  data: JobpostDataItem[],
): Record<string, JobpostDataItem[]> => {
  const grouped: Record<string, JobpostDataItem[]> = {};

  data.forEach((item) => {
    if (item.level1) {
      if (!grouped[item.level1]) {
        grouped[item.level1] = [];
      }
      grouped[item.level1].push(item);
    }
  });

  return grouped;
};

// Get unique level1 values
export const getUniqueLevel1Values = (data: JobpostDataItem[]): string[] => {
  const uniqueValues = new Set<string>();

  data.forEach((item) => {
    if (item.level1) {
      uniqueValues.add(item.level1);
    }
  });

  return Array.from(uniqueValues);
};
