import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://13.125.187.22:8082';

/**
 * DUMS 통합 데이터 목록을 조회합니다.
 * @param {Object} params - 조회 파라미터
 * @param {string} [params.keyword] - 검색 키워드
 * @param {number} [params.page=1] - 페이지 번호
 * @param {number} [params.size=10] - 페이지 크기
 * @returns {Promise<Object>} 통합 데이터 목록과 페이지 정보
 */
export const getDumsIntegratedList = async (params) => {
    try {
        const response = await axios.get(`${API_URL}/api/v1/dums/integrated`, { params });
        return response.data;
    } catch (error) {
        console.error('DUMS 통합 데이터 조회 중 오류 발생:', error);
        throw error;
    }
}; 