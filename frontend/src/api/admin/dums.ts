import { axiosInstance } from '../axios';

export interface DumsIntegratedView {
    id: number;
    dataType: string;
    code: string | null;
    name: string;
    status: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface DumsIntegratedResponse {
    content: DumsIntegratedView[];
    totalElements: number;
    currentPage: number;
}

export interface DumsIntegratedParams {
    page: number;
    size: number;
    keyword?: string;
    dataType?: string;
    sort?: string;
}

/**
 * 통합 뷰 목록 조회
 * @param params 검색 파라미터
 * @returns 통합 뷰 목록
 */
export const getDumsIntegratedList = async (params: DumsIntegratedParams): Promise<DumsIntegratedResponse> => {
    const response = await axiosInstance.get('/api/v1/dums/integrated', { params });
    return response.data;
};

/**
 * 통합 뷰 항목 삭제
 * @param id 삭제할 항목 ID
 */
export const deleteDumsIntegratedItem = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/v1/dums/integrated/${id}`);
};

/**
 * 통합 뷰 항목 일괄 삭제
 * @param ids 삭제할 항목 ID 배열
 */
export const deleteDumsIntegratedItems = async (ids: number[]): Promise<void> => {
    await axiosInstance.delete('/api/v1/dums/integrated/batch', {
        data: { ids }
    });
}; 