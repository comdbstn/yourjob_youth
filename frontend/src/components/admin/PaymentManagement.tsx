import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../api/axios';

/**
 * 결제 정보 타입 정의
 */
interface Payment {
    id: number;
    requestedAt: string;
    completedAt: string | null;
    status: string;
    method: string;
    userId: string;
    productName: string;
    amount: number;
    description: string;
}

/**
 * API 응답 데이터 타입 정의
 */
interface ApiResponse {
    content: Payment[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

/**
 * 검색 파라미터 타입 정의
 */
interface SearchParams {
    paymentStatus: string;
    paymentMethod: string;
    keyword: string;
    startDate: string;
    endDate: string;
    page: number;
    size: number;
}

/**
 * 결제 관리 페이지 컴포넌트
 * @returns {JSX.Element} 결제 관리 컴포넌트
 */
const PaymentManagement: React.FC = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchParams, setSearchParams] = useState<SearchParams>({
        paymentStatus: '',
        paymentMethod: '',
        keyword: '',
        startDate: '',
        endDate: '',
        page: 0,
        size: 10
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        loadPayments();
    }, [currentPage, searchParams]);

    const loadPayments = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get<ApiResponse>('/admin/payments', {
                params: {
                    ...searchParams,
                    page: currentPage
                }
            });
            setPayments(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            setError(error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.'));
            console.error('결제 목록 조회 실패:', error);
            alert('결제 목록을 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        loadPayments();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleCancelPayment = async (id: number) => {
        if (!window.confirm('이 결제를 취소하시겠습니까?')) {
            return;
        }

        try {
            await axiosInstance.post(`/admin/payments/${id}/cancel`);
            alert('결제가 취소되었습니다.');
            loadPayments();
        } catch (error) {
            console.error('결제 취소 실패:', error);
            alert('결제 취소에 실패했습니다.');
        }
    };

    const handleRefundPayment = async (id: number) => {
        if (!window.confirm('이 결제를 환불하시겠습니까?')) {
            return;
        }

        try {
            await axiosInstance.post(`/admin/payments/${id}/refund`);
            alert('결제가 환불되었습니다.');
            loadPayments();
        } catch (error) {
            console.error('결제 환불 실패:', error);
            alert('결제 환불에 실패했습니다.');
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
                            <div className="search-area">
                                <div className="search--select select-box">
                                    <div className="control">
                                        <select 
                                            name="paymentStatus" 
                                            className="select"
                                            value={searchParams.paymentStatus}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">결제상태</option>
                                            <option value="PENDING">결제대기</option>
                                            <option value="COMPLETED">결제완료</option>
                                            <option value="CANCELLED">결제취소</option>
                                            <option value="FAILED">결제실패</option>
                                        </select>
                                    </div>
                                    <div className="control">
                                        <select 
                                            name="paymentMethod" 
                                            className="select"
                                            value={searchParams.paymentMethod}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">결제수단</option>
                                            <option value="CARD">신용카드</option>
                                            <option value="BANK">계좌이체</option>
                                        </select>
                                    </div>
                                    <div className="select--date">
                                        <div className="control">
                                            <input 
                                                type="date"
                                                name="startDate"
                                                className="select"
                                                value={searchParams.startDate}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="control">
                                            <input 
                                                type="date"
                                                name="endDate"
                                                className="select"
                                                value={searchParams.endDate}
                                                onChange={handleInputChange}
                                            />
                                        </div>
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
                                                    <col width="70px"/>
                                                    <col width="140px"/>
                                                    <col width="140px"/>
                                                    <col width="100px"/>
                                                    <col width="120px"/>
                                                    <col width="150px"/>
                                                    <col width="200px"/>
                                                    <col width="100px"/>
                                                    <col width="100px"/>
                                                    <col width="180px"/>
                                                </colgroup>
                                                <thead>
                                                    <tr>
                                                        <th>번호</th>
                                                        <th>결제요청일시</th>
                                                        <th>결제완료일시</th>
                                                        <th>결제상태</th>
                                                        <th>결제수단</th>
                                                        <th>아이디</th>
                                                        <th>상품명</th>
                                                        <th>결제금액</th>
                                                        <th>결제내용</th>
                                                        <th>관리자툴</th>
                                                    </tr>
                                                </thead>
                                            </table>
                                        </div>
                                        <div className="table-content">
                                            <table>
                                                <colgroup>
                                                    <col width="70px"/>
                                                    <col width="140px"/>
                                                    <col width="140px"/>
                                                    <col width="100px"/>
                                                    <col width="120px"/>
                                                    <col width="150px"/>
                                                    <col width="200px"/>
                                                    <col width="100px"/>
                                                    <col width="100px"/>
                                                    <col width="180px"/>
                                                </colgroup>
                                                <tbody>
                                                    {payments.map((payment, index) => (
                                                        <tr key={payment.id}>
                                                            <td>{payments.length - index}</td>
                                                            <td>{new Date(payment.requestedAt).toLocaleString()}</td>
                                                            <td>
                                                                {payment.completedAt 
                                                                    ? new Date(payment.completedAt).toLocaleString()
                                                                    : '-'
                                                                }
                                                            </td>
                                                            <td>
                                                                <span className={`status ${payment.status.toLowerCase()}`}>
                                                                    {payment.status === 'PENDING' ? '결제대기' :
                                                                     payment.status === 'COMPLETED' ? '결제완료' :
                                                                     payment.status === 'CANCELLED' ? '결제취소' :
                                                                     '결제실패'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {payment.method === 'CARD' ? '신용카드' : '계좌이체'}
                                                            </td>
                                                            <td>{payment.userId}</td>
                                                            <td>{payment.productName}</td>
                                                            <td>{payment.amount.toLocaleString()}원</td>
                                                            <td>{payment.description}</td>
                                                            <td>
                                                                <div className="btn-area">
                                                                    {payment.status === 'COMPLETED' && (
                                                                        <>
                                                                            <button 
                                                                                type="button" 
                                                                                className="btn btn-warning btn-small"
                                                                                onClick={() => handleCancelPayment(payment.id)}
                                                                            >
                                                                                취소
                                                                            </button>
                                                                            <button 
                                                                                type="button" 
                                                                                className="btn btn-danger btn-small"
                                                                                onClick={() => handleRefundPayment(payment.id)}
                                                                            >
                                                                                환불
                                                                            </button>
                                                                        </>
                                                                    )}
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

export default PaymentManagement; 