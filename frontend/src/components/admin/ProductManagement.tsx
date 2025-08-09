import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../api/axios';

/**
 * 상품 정보 타입 정의
 */
interface Product {
    id: number;
    userType: 'INDIVIDUAL' | 'CORPORATE';
    status: 'ACTIVE' | 'INACTIVE';
    displayType: 'PERIOD' | 'CLICK';
    name: string;
    priceSettings: Array<{
        value: number;
        price: number;
    }>;
}

/**
 * API 응답 데이터 타입 정의
 */
interface ApiResponse {
    content: Product[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

/**
 * 검색 파라미터 타입 정의
 */
interface SearchParams {
    userType: string;
    status: string;
    displayType: string;
    keyword: string;
    page: number;
    size: number;
}

/**
 * 상품 관리 페이지 컴포넌트
 * @returns {JSX.Element} 상품 관리 컴포넌트
 */
const ProductManagement: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchParams, setSearchParams] = useState<SearchParams>({
        userType: '',
        status: '',
        displayType: '',
        keyword: '',
        page: 0,
        size: 10
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        loadProducts();
    }, [currentPage, searchParams]);

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get<ApiResponse>('/admin/products', {
                params: {
                    ...searchParams,
                    page: currentPage
                }
            });
            setProducts(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            setError(error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.'));
            console.error('상품 목록 조회 실패:', error);
            alert('상품 목록을 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckboxChange = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) 
                ? prev.filter(selectedId => selectedId !== id)
                : [...prev, id]
        );
    };

    const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(products.map(product => product.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) {
            alert('삭제할 상품을 선택해주세요.');
            return;
        }

        if (!window.confirm('선택한 상품을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await axiosInstance.delete('/admin/products/bulk', {
                data: selectedIds
            });
            alert('선택한 상품이 삭제되었습니다.');
            setSelectedIds([]);
            loadProducts();
        } catch (error) {
            console.error('상품 삭제 실패:', error);
            alert('상품 삭제에 실패했습니다.');
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        loadProducts();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const getUserTypeText = (type: string) => {
        switch (type) {
            case 'INDIVIDUAL':
                return '개인';
            case 'CORPORATE':
                return '기업';
            default:
                return type;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return '사용중';
            case 'INACTIVE':
                return '사용중지';
            default:
                return status;
        }
    };

    const getDisplayTypeText = (type: string) => {
        switch (type) {
            case 'PERIOD':
                return '기간별';
            case 'CLICK':
                return '클릭별';
            default:
                return type;
        }
    };

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div className="error-message">데이터 로딩 중 오류가 발생했습니다.</div>;

    return (
        <div className="main">
            <div className="contents">
                <div className="content">
                    <div className="container">
                        <article className="article-area">
                            <div className="btn-area--top">
                                <button 
                                    type="button" 
                                    className="btn btn-danger btn-small"
                                    onClick={handleBulkDelete}
                                >
                                    삭제
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-success btn-small"
                                    onClick={() => navigate('/admin/product-management/detail')}
                                >
                                    상품등록
                                </button>
                            </div>

                            <div className="search-area">
                                <div className="search--select select-box">
                                    <div className="control">
                                        <select 
                                            name="userType" 
                                            className="select"
                                            value={searchParams.userType}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">사용자구분</option>
                                            <option value="INDIVIDUAL">개인</option>
                                            <option value="CORPORATE">기업</option>
                                        </select>
                                    </div>
                                    <div className="control">
                                        <select 
                                            name="status" 
                                            className="select"
                                            value={searchParams.status}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">상태</option>
                                            <option value="ACTIVE">사용중</option>
                                            <option value="INACTIVE">사용중지</option>
                                        </select>
                                    </div>
                                    <div className="control">
                                        <select 
                                            name="displayType" 
                                            className="select"
                                            value={searchParams.displayType}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">노출형식</option>
                                            <option value="PERIOD">기간별</option>
                                            <option value="CLICK">클릭별</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="search--text">
                                    <div className="control">
                                        <input 
                                            type="text"
                                            name="keyword"
                                            placeholder="검색어를 입력하세요"
                                            value={searchParams.keyword}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        className="btn btn-primary"
                                        onClick={handleSearch}
                                    >
                                        검색
                                    </button>
                                </div>
                            </div>

                            <div className="table-wrapper">
                                <div className="table-scroll">
                                    <section className="table-area">
                                        <div className="table-header">
                                            <table>
                                                <colgroup>
                                                    <col width="44px"/>
                                                    <col width="70px"/>
                                                    <col width="120px"/>
                                                    <col width="100px"/>
                                                    <col width="120px"/>
                                                    <col width="200px"/>
                                                    <col width="200px"/>
                                                    <col width="180px"/>
                                                </colgroup>
                                                <thead>
                                                    <tr>
                                                        <th>
                                                            <div className="control">
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="checked--all"
                                                                    checked={selectedIds.length === products.length}
                                                                    onChange={handleCheckAll}
                                                                />
                                                            </div>
                                                        </th>
                                                        <th>번호</th>
                                                        <th>사용자구분</th>
                                                        <th>상태</th>
                                                        <th>노출형식</th>
                                                        <th>상품명</th>
                                                        <th>금액설정</th>
                                                        <th>관리자툴</th>
                                                    </tr>
                                                </thead>
                                            </table>
                                        </div>
                                        <div className="table-content">
                                            <table>
                                                <colgroup>
                                                    <col width="44px"/>
                                                    <col width="70px"/>
                                                    <col width="120px"/>
                                                    <col width="100px"/>
                                                    <col width="120px"/>
                                                    <col width="200px"/>
                                                    <col width="200px"/>
                                                    <col width="180px"/>
                                                </colgroup>
                                                <tbody>
                                                    {products.map((product, index) => (
                                                        <tr key={product.id}>
                                                            <td>
                                                                <div className="control">
                                                                    <input 
                                                                        type="checkbox"
                                                                        checked={selectedIds.includes(product.id)}
                                                                        onChange={() => handleCheckboxChange(product.id)}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td>{products.length - index}</td>
                                                            <td>{getUserTypeText(product.userType)}</td>
                                                            <td>
                                                                <span className={`status ${product.status.toLowerCase()}`}>
                                                                    {getStatusText(product.status)}
                                                                </span>
                                                            </td>
                                                            <td>{getDisplayTypeText(product.displayType)}</td>
                                                            <td>{product.name}</td>
                                                            <td>
                                                                {product.priceSettings.map((setting, idx) => (
                                                                    <div key={idx}>
                                                                        {setting.value}:{setting.price}원
                                                                    </div>
                                                                ))}
                                                            </td>
                                                            <td>
                                                                <div className="btn-area">
                                                                    <button 
                                                                        type="button" 
                                                                        className="btn btn-warning btn-small"
                                                                        onClick={() => navigate(`/admin/product-management/detail?id=${product.id}`)}
                                                                    >
                                                                        수정
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

                            <div className="pagination-area">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        className={`page-btn ${currentPage === i ? 'active' : ''}`}
                                        onClick={() => handlePageChange(i)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </article>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductManagement; 