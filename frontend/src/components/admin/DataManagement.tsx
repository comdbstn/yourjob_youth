import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDumsIntegratedList, deleteDumsIntegratedItem, deleteDumsIntegratedItems, DumsIntegratedView } from '../../api/admin/dums';
import './DataManagement.css';

/**
 * 데이터 항목 타입 정의
 */
interface DataItem {
    id: number;
    dataType: string;
    code: string;
    name: string;
    status: string;
}

/**
 * API 응답 타입 정의
 */
interface ApiResponse {
    content: DumsIntegratedView[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

/**
 * 데이터 관리 컴포넌트
 * @returns {JSX.Element} 데이터 관리 컴포넌트
 */
const DataManagement: React.FC = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [keyword, setKeyword] = useState<string>('');
    const [selectedDataType, setSelectedDataType] = useState<string>('CERTIFICATE');
    const [selected, setSelected] = useState<number[]>([]);
    const [data, setData] = useState<ApiResponse>({
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 10
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const dataTypeOptions = [
        { value: 'CERTIFICATE', label: '자격증' },
        { value: 'DOMESTIC_UNIVERSITY', label: '국내 대학' },
        { value: 'INTERNATIONAL_UNIVERSITY', label: '해외 대학' },
        { value: 'MAJOR', label: '전공' },
        { value: 'UNIVERSITY_CLASSIFICATION', label: '대학 구분' },
        { value: 'GRADUATION_STATUS', label: '졸업 상태' },
        { value: 'REGION', label: '지역' },
        { value: 'COUNTRY', label: '국가' }
    ];

    // 데이터 목록 조회
    const loadDataItems = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const result = await getDumsIntegratedList({
                page: page + 1,
                size: rowsPerPage,
                keyword,
                dataType: selectedDataType,
                sort: 'id,asc' // 번호(id) 기준 오름차순 정렬
            });
            
            setData({
                content: result.content,
                totalElements: result.totalElements,
                totalPages: Math.ceil(result.totalElements / rowsPerPage),
                number: page,
                size: rowsPerPage
            });
        } catch (err) {
            setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
            console.error('데이터 목록 조회 실패:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDataItems();
    }, [page, rowsPerPage, keyword, selectedDataType]);

    function handleChangePage(event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) {
        setPage(newPage);
        loadDataItems();
    }

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>): void => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setKeyword(event.target.value);
        setPage(0);
    };

    // 전체 선택/해제 핸들러
    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = data.content.map(item => item.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    // 개별 체크박스 선택/해제 핸들러
    const handleCheckboxClick = (id: number) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: number[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
    };

    // 선택된 항목 일괄 삭제 핸들러
    const handleBulkDelete = async () => {
        if (selected.length === 0) {
            alert('삭제할 항목을 선택해주세요.');
            return;
        }

        if (window.confirm(`선택한 ${selected.length}개의 항목을 삭제하시겠습니까?`)) {
            try {
                await deleteDumsIntegratedItems(selected);
                setSelected([]); // 선택 초기화
                loadDataItems(); // 목록 새로고침
            } catch (err) {
                console.error('일괄 삭제 실패:', err);
                alert('삭제 중 오류가 발생했습니다.');
            }
        }
    };

    const getDataTypeLabel = (dataType: string): string => {
        const labels: Record<string, string> = {
            CERTIFICATE: '자격증',
            DOMESTIC_UNIVERSITY: '국내 대학',
            INTERNATIONAL_UNIVERSITY: '해외 대학',
            MAJOR: '전공',
            UNIVERSITY_CLASSIFICATION: '대학 구분',
            GRADUATION_STATUS: '졸업 상태',
            REGION: '지역',
            COUNTRY: '국가'
        };
        return labels[dataType] || dataType;
    };

    const handleDataTypeChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
        setSelectedDataType(event.target.value);
        setPage(0);
        setSelected([]); // 선택된 항목 초기화
        loadDataItems(); // 데이터 새로 로드
    };

    const handleDelete = async (id: number): Promise<void> => {
        if (window.confirm('이 데이터를 삭제하시겠습니까?')) {
            try {
                await deleteDumsIntegratedItem(id);
                loadDataItems(); // 목록 새로고침
            } catch (err) {
                console.error('삭제 실패:', err);
                alert('삭제 중 오류가 발생했습니다.');
            }
        }
    };

    // 페이지네이션 관련 함수 추가
    const getPageNumbers = (): number[] => {
        const totalPages = data.totalPages;
        const currentPage = page;
        const pageNumbers: number[] = [];
        
        // 현재 페이지를 기준으로 앞뒤 5페이지씩 보여주기
        const startPage = Math.max(0, currentPage - 4);
        const endPage = Math.min(totalPages - 1, currentPage + 5);
        
        // 시작 페이지가 0보다 크면 "..." 표시
        if (startPage > 0) {
            pageNumbers.push(0);
            if (startPage > 1) {
                pageNumbers.push(-1); // -1은 "..."를 의미
            }
        }
        
        // 페이지 번호 추가
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        
        // 마지막 페이지가 totalPages-1보다 작으면 "..." 표시
        if (endPage < totalPages - 1) {
            if (endPage < totalPages - 2) {
                pageNumbers.push(-1); // -1은 "..."를 의미
            }
            pageNumbers.push(totalPages - 1);
        }
        
        return pageNumbers;
    };

    if (isLoading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error-message">데이터 로딩 중 오류가 발생했습니다.</div>;

    return (
        <div className="dataManagement content">
            <div className="container">
                <article className="article-area">
                    {/* 검색 영역 */}
                    <div className="search-area">
                        <div className="bulk-action-container">
                            <div className="selected-count">
                                {selected.length > 0 && (
                                    <span>{selected.length}개 항목 선택됨</span>
                                )}
                            </div>
                            <div className="bulk-actions">
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleBulkDelete}
                                    disabled={selected.length === 0}
                                >
                                    선택 항목 삭제
                                </button>
                            </div>
                        </div>
                        <div className="search-container">
                            <div className="search--select">
                                <select
                                    className="select"
                                    value={selectedDataType}
                                    onChange={handleDataTypeChange}
                                >
                                    {dataTypeOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="search--text">
                                <div className="control">
                                    <input
                                        type="text"
                                        className="input"
                                        value={keyword}
                                        onChange={handleSearch}
                                        placeholder="검색어를 입력하세요"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 테이블 */}
                    <div className="table-wrapper">
                        <div className="table-scroll">
                            <section className="table-area">
                                <div className="table-header">
                                    <table>
                                        <colgroup>
                                            <col width="40px"/>
                                            <col width="60px"/>
                                            <col width="150px"/>
                                            <col width="auto"/>
                                            <col width="120px"/>
                                        </colgroup>
                                        <thead>
                                            <tr>
                                                <th className="checkbox-column">
                                                    <label className="checkbox-wrapper">
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox"
                                                            checked={data.content.length > 0 && selected.length === data.content.length}
                                                            onChange={handleSelectAllClick}
                                                            style={{ visibility: data.content.length > 0 ? 'visible' : 'hidden' }}
                                                        />
                                                        <span className="checkbox-custom"></span>
                                                    </label>
                                                </th>
                                                <th>번호</th>
                                                <th>데이터종류</th>
                                                <th>명칭</th>
                                                <th>관리자툴</th>
                                            </tr>
                                        </thead>
                                    </table>
                                </div>
                                <div className="table-content">
                                    <table>
                                        <colgroup>
                                            <col width="40px"/>
                                            <col width="60px"/>
                                            <col width="150px"/>
                                            <col width="auto"/>
                                            <col width="120px"/>
                                        </colgroup>
                                        <tbody>
                                            {data.content.map((row) => (
                                                <tr key={`${row.dataType}-${row.id}`}>
                                                    <td className="checkbox-column">
                                                        <label className="checkbox-wrapper">
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox"
                                                                checked={selected.includes(row.id)}
                                                                onChange={() => handleCheckboxClick(row.id)}
                                                            />
                                                            <span className="checkbox-custom"></span>
                                                        </label>
                                                    </td>
                                                    <td>{row.id}</td>
                                                    <td>{getDataTypeLabel(row.dataType)}</td>
                                                    <td>{row.name}</td>
                                                    <td>
                                                        <div className="admin--tool">
                                                            <button
                                                                type="button"
                                                                className="btn btn-edit"
                                                                onClick={() => navigate(`/admin/data/${row.id}`)}
                                                            >
                                                                수정
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-delete"
                                                                onClick={() => handleDelete(row.id)}
                                                            >
                                                                삭제
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* 페이지네이션 */}
                    <div className="pagination-area">
                        {getPageNumbers().map((pageNumber, index) => (
                            pageNumber === -1 ? (
                                <span key={`ellipsis-${index}`} className="page-ellipsis">...</span>
                            ) : (
                                <button
                                    key={pageNumber}
                                    className={`page-btn ${page === pageNumber ? 'active' : ''}`}
                                    onClick={(event) => handleChangePage(event, pageNumber)}
                                >
                                    {pageNumber + 1}
                                </button>
                            )
                        ))}
                    </div>
                </article>
            </div>
        </div>
    );
};

export default DataManagement; 