import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosInstance } from '../../api/axios';

/**
 * 데이터 관리 항목 타입 정의
 */
interface DataItem {
    id: number;
    dataType: string;
    code: string;
    name: string;
    status: string;
}

/**
 * 데이터 관리 상세 페이지 컴포넌트
 * @returns {JSX.Element} 데이터 관리 상세 컴포넌트
 */
const DataManagementDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [formData, setFormData] = useState<Omit<DataItem, 'id'>>({
        dataType: 'JOB_CATEGORY',
        code: '',
        name: '',
        status: 'ACTIVE'
    });
    const [errors, setErrors] = useState<{
        code?: string;
        name?: string;
    }>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (id) {
            loadDataDetail();
        }
    }, [id]);

    const loadDataDetail = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get<DataItem>(`/admin/data/${id}`);
            setFormData({
                dataType: response.data.dataType,
                code: response.data.code,
                name: response.data.name,
                status: response.data.status
            });
        } catch (error) {
            setError(error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.'));
            console.error('데이터 상세 정보 조회 실패:', error);
            alert('데이터 정보를 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};
        let isValid = true;

        if (!formData.code.trim()) {
            newErrors.code = '코드번호를 입력해주세요.';
            isValid = false;
        }

        if (!formData.name.trim()) {
            newErrors.name = '명칭을 입력해주세요.';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // 에러 메시지 초기화
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            if (id) {
                await axiosInstance.put(`/admin/data/${id}`, formData);
            } else {
                await axiosInstance.post('/admin/data', formData);
            }
            alert('저장되었습니다.');
            navigate('/admin/data-management');
        } catch (error) {
            console.error('저장 실패:', error);
            alert('저장에 실패했습니다.');
        } finally {
            setIsLoading(false);
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
                                    <span className="title">데이터종류</span>
                                    <div className="select-box">
                                        <div className="control">
                                            <select 
                                                className="select"
                                                name="dataType"
                                                value={formData.dataType}
                                                onChange={handleInputChange}
                                            >
                                                <option value="JOB_CATEGORY">직무분류</option>
                                                <option value="INDUSTRY">산업분류</option>
                                                <option value="LOCATION">지역</option>
                                                <option value="EDUCATION">학력</option>
                                                <option value="CAREER_LEVEL">경력</option>
                                            </select>
                                        </div>
                                    </div>
                                </li>
                                <li className="items">
                                    <span className="title">코드번호</span>
                                    <div className="control">
                                        <input 
                                            type="text"
                                            name="code"
                                            placeholder="코드번호를 입력하세요"
                                            value={formData.code}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    {errors.code && (
                                        <div className="error-message">{errors.code}</div>
                                    )}
                                </li>
                                <li className="items">
                                    <span className="title">명칭</span>
                                    <div className="control">
                                        <input 
                                            type="text"
                                            name="name"
                                            placeholder="명칭을 입력하세요"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    {errors.name && (
                                        <div className="error-message">{errors.name}</div>
                                    )}
                                </li>
                                <li className="items">
                                    <span className="title">노출여부</span>
                                    <div className="form-radio">
                                        <div className="control">
                                            <input 
                                                type="radio"
                                                name="status"
                                                value="ACTIVE"
                                                checked={formData.status === 'ACTIVE'}
                                                onChange={handleInputChange}
                                            />
                                            <span className="text">출력</span>
                                        </div>
                                        <div className="control">
                                            <input 
                                                type="radio"
                                                name="status"
                                                value="INACTIVE"
                                                checked={formData.status === 'INACTIVE'}
                                                onChange={handleInputChange}
                                            />
                                            <span className="text">출력안함</span>
                                        </div>
                                    </div>
                                </li>
                            </ul>

                            <div className="btn-area">
                                <button 
                                    type="button" 
                                    className="btn btn-success"
                                    onClick={handleSubmit}
                                >
                                    저장
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={() => navigate('/admin/data-management')}
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

export default DataManagementDetail; 