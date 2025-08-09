import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosInstance } from '../../api/axios';

/**
 * 결제 상세 정보 타입 정의
 */
interface PaymentDetail {
    id: number;
    requestedAt: string;
    completedAt: string | null;
    userId: string;
    userType: string;
    productName: string;
    targetTitle: string;
    displayType: string;
    value: number;
    price: number;
    method: string;
    status: string;
    phone: string;
}

/**
 * 결제 관리 상세 페이지 컴포넌트
 * @returns {JSX.Element} 결제 관리 상세 컴포넌트
 */
const PaymentManagementDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [payment, setPayment] = useState<PaymentDetail | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (id) {
            loadPaymentDetail();
        }
    }, [id]);

    const loadPaymentDetail = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get<PaymentDetail>(`/admin/payments/${id}`);
            setPayment(response.data);
        } catch (error) {
            setError(error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.'));
            console.error('결제 상세 정보 조회 실패:', error);
            alert('결제 정보를 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!payment) return;

        try {
            await axiosInstance.put(`/admin/payments/${id}`, payment);
            alert('결제 정보가 저장되었습니다.');
            navigate('/admin/payment-management');
        } catch (error) {
            console.error('결제 정보 저장 실패:', error);
            alert('결제 정보 저장에 실패했습니다.');
        }
    };

    const getUserTypeText = (type: string) => {
        switch (type) {
            case 'USER':
                return '일반회원';
            case 'COMPANY':
                return '기업회원';
            default:
                return type;
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

    const getMethodText = (method: string) => {
        switch (method) {
            case 'CARD':
                return '신용카드';
            case 'BANK':
                return '계좌이체';
            default:
                return method;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING':
                return '입금중';
            case 'COMPLETED':
                return '입금확인';
            default:
                return status;
        }
    };

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div className="error-message">데이터 로딩 중 오류가 발생했습니다.</div>;
    if (!payment) return <div>결제 정보를 찾을 수 없습니다.</div>;

    return (
        <div className="main">            
            <div className="contents">
                <div className="content">
                    <div className="container">
                        <article className="article-area nosearch-area">
                            <ul className="list option">
                                <li className="items">
                                    <span className="title">결제요청일시</span>
                                    <span>{new Date(payment.requestedAt).toLocaleString()}</span>
                                </li>
                                <li className="items">
                                    <span className="title">결제완료일시</span>
                                    <span>
                                        {payment.completedAt 
                                            ? new Date(payment.completedAt).toLocaleString()
                                            : '-'
                                        }
                                    </span>
                                </li>
                                <li className="items">
                                    <span className="title">아이디</span>
                                    <span>{payment.userId}</span>
                                </li>
                                <li className="items">
                                    <span className="title">사용자구분</span>
                                    <span>{getUserTypeText(payment.userType)}</span>
                                </li>
                                <li className="items">
                                    <span className="title">상품명</span>
                                    <div className="control">
                                        <input 
                                            type="text" 
                                            value={payment.productName}
                                            onChange={(e) => setPayment({ ...payment, productName: e.target.value })}
                                        />
                                    </div>
                                </li>
                                <li className="items">
                                    <span className="title">공고/이력서</span>
                                    <span>{payment.targetTitle}</span>
                                </li>
                                <li className="items">
                                    <span className="title">노출구분</span>
                                    <span>{getDisplayTypeText(payment.displayType)}</span>
                                </li>
                                <li className="items">
                                    <span className="title">기간/클릭</span>
                                    <span className="text">{payment.value}:{payment.price}</span>
                                </li>
                                <li className="items">
                                    <span className="title">결제방법</span>
                                    <span>{getMethodText(payment.method)}</span>
                                </li>
                                <li className="items">
                                    <span className="title">입금상태</span>
                                    <span>{getStatusText(payment.status)}</span>
                                </li>
                                <li className="items">
                                    <span className="title">연락처</span>
                                    <span>{payment.phone}</span>
                                </li>
                            </ul>

                            <div className="btn-area">
                                <button 
                                    type="button" 
                                    className="btn btn-success"
                                    onClick={handleSave}
                                >
                                    저장
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={() => navigate('/admin/payment-management')}
                                >
                                    목록으로
                                </button>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentManagementDetail; 