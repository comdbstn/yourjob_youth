import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { axiosInstance } from '../../api/axios';

/**
 * 옵션 정보 타입 정의
 */
interface Option {
    productId: number;
    type: 'period' | 'click';
    remainingValue: number;
}

/**
 * 상품 정보 타입 정의
 */
interface Product {
    id: number;
    name: string;
    defaultType: 'period' | 'click';
}

/**
 * 유료 옵션 변경 페이지 컴포넌트
 * @returns {JSX.Element} 유료 옵션 변경 컴포넌트
 */
const PremiumOptionChange: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const [options, setOptions] = useState<Option[]>([]);
    const [products] = useState<Product[]>([
        { id: 1, name: '상품 1', defaultType: 'period' },
        { id: 2, name: '상품 2', defaultType: 'period' },
        { id: 3, name: '상품 3', defaultType: 'period' }
    ]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [errors, setErrors] = useState<{ [key: number]: string }>({});

    const targetType = searchParams.get('jobId') ? 'job' : 'resume';
    const targetId = searchParams.get('jobId') || id;

    useEffect(() => {
        if (targetId) {
            loadCurrentOptions();
        }
    }, [targetId]);

    const loadCurrentOptions = async () => {
        setIsLoading(true);
        try {
            const endpoint = targetType === 'job' ? 
                `/admin/jobs/${targetId}/options` : 
                `/admin/resumes/${targetId}/options`;
            
            const response = await axiosInstance.get<Option[]>(endpoint);
            setOptions(response.data);
        } catch (error) {
            setError(error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.'));
            console.error('옵션 로드 실패:', error);
            setOptions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleValueChange = (productId: number, value: string) => {
        const numValue = value === '' ? 0 : parseInt(value);
        if (isNaN(numValue) || numValue < 0) {
            setErrors(prev => ({ ...prev, [productId]: '올바른 숫자를 입력해주세요.' }));
            return;
        }

        setOptions(prev => {
            const existingOption = prev.find(opt => opt.productId === productId);
            if (existingOption) {
                return prev.map(opt => 
                    opt.productId === productId 
                        ? { ...opt, remainingValue: numValue }
                        : opt
                );
            }
            return [...prev, { productId, type: 'period', remainingValue: numValue }];
        });
        setErrors(prev => ({ ...prev, [productId]: '' }));
    };

    const handleSave = async () => {
        // 유효성 검사
        const newErrors: { [key: number]: string } = {};
        let hasError = false;

        options.forEach(option => {
            if (option.remainingValue < 0) {
                newErrors[option.productId] = '올바른 숫자를 입력해주세요.';
                hasError = true;
            }
        });

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        try {
            const endpoint = targetType === 'job' ? 
                `/admin/jobs/${targetId}/options` : 
                `/admin/resumes/${targetId}/options`;
            
            await axiosInstance.put(endpoint, options);
            alert('옵션이 저장되었습니다.');
            navigate('/admin/payment-management');
        } catch (error) {
            console.error('옵션 저장 실패:', error);
            alert('옵션 저장에 실패했습니다.');
        }
    };

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div className="error-message">데이터 로딩 중 오류가 발생했습니다.</div>;

    return (
        <div className="main">
            <div className="contents">
                <div className="content">
                    <div className="container">
                        <article className="article-area nosearch-area">
                            <ul className="list option">
                                {products.map(product => {
                                    const option = options.find(opt => opt.productId === product.id);
                                    return (
                                        <li key={product.id} className="items">
                                            <span className="title">{product.name}</span>
                                            <div className="form-radio">
                                                <div className="control">
                                                    <input 
                                                        type="radio" 
                                                        name={`type_${product.id}`} 
                                                        value="period"
                                                        checked={(option?.type || product.defaultType) === 'period'}
                                                        disabled
                                                    />
                                                    <span className="text">기간</span>
                                                </div>
                                                <div className="control">
                                                    <input 
                                                        type="radio" 
                                                        name={`type_${product.id}`} 
                                                        value="click"
                                                        checked={(option?.type || product.defaultType) === 'click'}
                                                        disabled
                                                    />
                                                    <span className="text">클릭</span>
                                                </div>
                                            </div>
                                            
                                            <div className="control has-text">
                                                <input 
                                                    type="number" 
                                                    value={option?.remainingValue ?? 0}
                                                    min="0"
                                                    onChange={(e) => handleValueChange(product.id, e.target.value)}
                                                    placeholder="남은 수량 입력"
                                                />
                                                <span className="after--text">남음</span>
                                            </div>
                                            {errors[product.id] && (
                                                <div className="error-message">{errors[product.id]}</div>
                                            )}
                                        </li>
                                    );
                                })}
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

export default PremiumOptionChange; 