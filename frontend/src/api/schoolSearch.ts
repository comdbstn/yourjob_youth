export interface SchoolSearchResult {
    operationDataId: string;
    schoolName: string;
    schoolType: string;
    level1?: string;
    level2?: string;
    level3?: string;
    fullPath: string;
}

export interface MajorSearchResult {
    operationDataId: string;
    majorName: string;
    majorType: string;
    level1?: string;
    level2?: string;
    level3?: string;
    fullPath: string;
}

export interface AutocompleteResult {
    id: string;
    value: string;
    label: string;
}

export interface OperationDataResult {
    operationDataId: string;
    dataType: string;
    dataTypeName: string;
    level1?: string;
    level2?: string;
    level3?: string;
    displayValue: string;
    fullPath: string;
}

const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:8082';

class SchoolSearchService {
    private baseUrl = `${API_URL}/api/v1/mdms/search`;
    private operationDataUrl = `${API_URL}/api/v1/mdms/operation-data`;

    // 캐시를 위한 Map
    private dataCache = new Map<string, OperationDataResult[]>();

    async searchSchools(
        keyword: string,
        size: number = 10,
        schoolType?: string,
        level1?: string,
        level2?: string
    ): Promise<SchoolSearchResult[]> {
        /*
        const params = new URLSearchParams({
            keyword,
            size: size.toString(),
        });

        if (schoolType) params.append('schoolType', schoolType);
        if (level1) params.append('level1', level1);
        if (level2) params.append('level2', level2);

        const response = await fetch(`${this.baseUrl}/schools?${params}`);
        if (!response.ok) {
            throw new Error('Failed to search schools');
        }
        return response.json();
        */

        // 국내/해외 대학 모두 검색
        const searchPromises = ['DOMESTIC', 'OVERSEAS'].map(async (type) => {
            const params = new URLSearchParams({
                keyword,
                size: Math.ceil(size / 2).toString(),
                schoolType: type
            });

            if (level1) params.append('level1', level1);
            if (level2) params.append('level2', level2);

            const response = await fetch(`${this.baseUrl}/schools?${params}`);
            if (!response.ok) {
                throw new Error(`Failed to search ${type.toLowerCase()} schools`);
            }
            return response.json();
        });

        try {
            const [domesticResults, overseasResults] = await Promise.all(searchPromises);
            // 결과 합치기
            return [...domesticResults, ...overseasResults];
        } catch (error) {
            console.error('Error searching schools:', error);
            throw error;
        }
    }

    async searchMajors(
        keyword: string,
        size: number = 10,
        majorType?: string,
        level1?: string,
        level2?: string
    ): Promise<MajorSearchResult[]> {
        const params = new URLSearchParams({
            keyword,
            size: size.toString(),
        });

        if (majorType) params.append('majorType', majorType);
        if (level1) params.append('level1', level1);
        if (level2) params.append('level2', level2);

        const response = await fetch(`${this.baseUrl}/majors?${params}`);
        if (!response.ok) {
            throw new Error('Failed to search majors');
        }
        return response.json();
    }

    async searchForAutocomplete(
        keyword: string,
        dataType: string,
        size: number = 10
    ): Promise<AutocompleteResult[]> {
        const params = new URLSearchParams({
            keyword,
            dataType,
            size: size.toString(),
        });

        const response = await fetch(`${this.baseUrl}/autocomplete?${params}`);
        if (!response.ok) {
            throw new Error('Failed to search autocomplete');
        }
        return response.json();
    }

    // 전체 operation data를 가져오는 메서드 (기존 방식과 호환)
    async getOperationData(
        dataType: string,
        keyword: string = '',
        size: number = 99999,
        page: number = 0,
        sort: string = 'id,asc',
        level1?: string,
        level2?: string,
        level3?: string
    ): Promise<OperationDataResult[]> {
        // 캐시 키 생성
        const cacheKey = `${dataType}_${keyword}_${level1}_${level2}_${level3}`;

        // 캐시에서 확인 (키워드가 없을 때만 캐시 사용)
        if (!keyword && this.dataCache.has(cacheKey)) {
            return this.dataCache.get(cacheKey)!;
        }

        const params = new URLSearchParams({
            dataType,
            size: size.toString(),
            page: page.toString(),
            sort,
        });

        if (keyword) params.append('keyword', keyword);
        if (level1) params.append('level1', level1);
        if (level2) params.append('level2', level2);
        if (level3) params.append('level3', level3);

        const response = await fetch(`${this.operationDataUrl}?${params}`);
        if (!response.ok) {
            throw new Error('Failed to fetch operation data');
        }

        const data = await response.json();
        const results = data.content || [];

        // 키워드가 없을 때만 캐시에 저장
        if (!keyword) {
            this.dataCache.set(cacheKey, results);
        }

        return results;
    }

    // dataType별 맞춤 검색 메서드들
    async searchSchoolsByDataType(dataType: string, keyword: string = ''): Promise<OperationDataResult[]> {
        return this.getOperationData(dataType, keyword);
    }

    async searchMajorsByDataType(dataType: string, keyword: string = ''): Promise<OperationDataResult[]> {
        return this.getOperationData(dataType, keyword);
    }
}

export const schoolSearchService = new SchoolSearchService();