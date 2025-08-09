import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { axiosInstance } from '../../api/axios';

/**
 * 상품 상세 정보 타입 정의
 */
interface ProductDetail {
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
 * 상품 관리 상세 페이지 컴포넌트
 * @returns {JSX.Element} 상품 관리 상세 컴포넌트
 */
const ProductManagementDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [formData, setFormData] = useState<Partial<ProductDetail>>({
        userType: 'INDIVIDUAL',
        status: 'ACTIVE',
        displayType: 'PERIOD',
        name: '',
        priceSettings: [{ value: 0, price: 0 }]
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const productId = searchParams.get('id') || id;
        if (productId) {
            loadProductDetail(productId);
        }
    }, [id, searchParams]);

    const loadProductDetail = async (productId: string) => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get<ProductDetail>(`/admin/products/${productId}`);
            setProduct(response.data);
            setFormData(response.data);
        } catch (error) {
            setError(error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.'));
            console.error('상품 상세 정보 조회 실패:', error);
            alert('상품 정보를 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        
        if (!formData.name) {
            newErrors.name = '상품명을 입력해주세요.';
        }

        if (!formData.priceSettings || formData.priceSettings.length === 0) {
            newErrors.priceSettings = '금액 설정을 추가해주세요.';
        } else {
            formData.priceSettings.forEach((setting, index) => {
                if (!setting.value || setting.value <= 0) {
                    newErrors[`value_${index}`] = '올바른 기간/클릭 수를 입력해주세요.';
                }
                if (!setting.price || setting.price <= 0) {
                    newErrors[`price_${index}`] = '올바른 금액을 입력해주세요.';
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleRadioChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addPriceSetting = () => {
        setFormData(prev => ({
            ...prev,
            priceSettings: [...(prev.priceSettings || []), { value: 0, price: 0 }]
        }));
    };

    const removePriceSetting = (index: number) => {
        setFormData(prev => ({
            ...prev,
            priceSettings: prev.priceSettings?.filter((_, i) => i !== index) || []
        }));
    };

    const handlePriceSettingChange = (index: number, field: 'value' | 'price', value: string) => {
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 0) {
            setErrors(prev => ({ ...prev, [`${field}_${index}`]: '올바른 숫자를 입력해주세요.' }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            priceSettings: prev.priceSettings?.map((setting, i) => 
                i === index ? { ...setting, [field]: numValue } : setting
            )
        }));
        setErrors(prev => ({ ...prev, [`${field}_${index}`]: '' }));
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            if (product) {
                await axiosInstance.put(`/admin/products/${product.id}`, formData);
            } else {
                await axiosInstance.post('/admin/products', formData);
            }
            alert('상품이 저장되었습니다.');
            navigate('/admin/product-management');
        } catch (error) {
            console.error('상품 저장 실패:', error);
            alert('상품 저장에 실패했습니다.');
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
                                <li className="items">
                                    <span className="title">구분</span>
                                    <div className="form-radio">
                                        <div className="control">
                                            <input 
                                                type="radio" 
                                                name="userType" 
                                                value="INDIVIDUAL"
                                                checked={formData.userType === 'INDIVIDUAL'}
                                                onChange={(e) => handleRadioChange('userType', e.target.value)}
                                            />
                                            <span className="text">개인</span>
                                        </div>
                                        <div className="control">
                                            <input 
                                                type="radio" 
                                                name="userType" 
                                                value="CORPORATE"
                                                checked={formData.userType === 'CORPORATE'}
                                                onChange={(e) => handleRadioChange('userType', e.target.value)}
                                            />
                                            <span className="text">기업</span>
                                        </div>
                                    </div>
                                </li>
                                <li className="items">
                                    <span className="title">상태</span>
                                    <div className="form-radio">
                                        <div className="control">
                                            <input 
                                                type="radio" 
                                                name="status" 
                                                value="ACTIVE"
                                                checked={formData.status === 'ACTIVE'}
                                                onChange={(e) => handleRadioChange('status', e.target.value)}
                                            />
                                            <span className="text">사용중</span>
                                        </div>
                                        <div className="control">
                                            <input 
                                                type="radio" 
                                                name="status" 
                                                value="INACTIVE"
                                                checked={formData.status === 'INACTIVE'}
                                                onChange={(e) => handleRadioChange('status', e.target.value)}
                                            />
                                            <span className="text">사용중지</span>
                                        </div>
                                    </div>
                                </li>
                                <li className="items">
                                    <span className="title">노출형식</span>
                                    <div className="form-radio">
                                        <div className="control">
                                            <input 
                                                type="radio" 
                                                name="displayType" 
                                                value="PERIOD"
                                                checked={formData.displayType === 'PERIOD'}
                                                onChange={(e) => handleRadioChange('displayType', e.target.value)}
                                            />
                                            <span className="text">기간별</span>
                                        </div>
                                        <div className="control">
                                            <input 
                                                type="radio" 
                                                name="displayType" 
                                                value="CLICK"
                                                checked={formData.displayType === 'CLICK'}
                                                onChange={(e) => handleRadioChange('displayType', e.target.value)}
                                            />
                                            <span className="text">클릭별</span>
                                        </div>
                                    </div>
                                </li>
                                <li className="items">
                                    <span className="title">상품명</span>
                                    <div className="control">
                                        <input 
                                            type="text" 
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="상품명을 입력하세요"
                                        />
                                        {errors.name && <div className="error-message">{errors.name}</div>}
                                    </div>
                                </li>
                                <li className="items">
                                    <span className="title">금액설정</span>
                                    <div className="control">
                                        <div id="priceSettingsContainer">
                                            {formData.priceSettings?.map((setting, index) => (
                                                <div key={index} className="price-setting-row">
                                                    <input 
                                                        type="number" 
                                                        value={setting.value}
                                                        onChange={(e) => handlePriceSettingChange(index, 'value', e.target.value)}
                                                        placeholder="기간/클릭 수" 
                                                        min="1"
                                                    />
                                                    <span className="separator">:</span>
                                                    <input 
                                                        type="number" 
                                                        value={setting.price}
                                                        onChange={(e) => handlePriceSettingChange(index, 'price', e.target.value)}
                                                        placeholder="금액" 
                                                        min="0"
                                                    />
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-danger btn-small"
                                                        onClick={() => removePriceSetting(index)}
                                                    >
                                                        삭제
                                                    </button>
                                                    {errors[`value_${index}`] && (
                                                        <div className="error-message">{errors[`value_${index}`]}</div>
                                                    )}
                                                    {errors[`price_${index}`] && (
                                                        <div className="error-message">{errors[`price_${index}`]}</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <button 
                                            type="button" 
                                            className="btn btn-primary btn-small"
                                            onClick={addPriceSetting}
                                        >
                                            금액 추가
                                        </button>
                                        {errors.priceSettings && (
                                            <div className="error-message">{errors.priceSettings}</div>
                                        )}
                                    </div>
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
                                    onClick={() => navigate('/admin/product-management')}
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

export default ProductManagementDetail; 