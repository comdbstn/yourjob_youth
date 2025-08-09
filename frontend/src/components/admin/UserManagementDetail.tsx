import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { axiosInstance } from '../../api/axios';

/**
 * 사용자 상세 정보 타입 정의
 */
interface UserDetail {
    id: number;
    username: string;
    email: string;
    name: string;
    userType: 'INDIVIDUAL' | 'CORPORATE';
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
    lastLoginAt: string;
    phone: string;
    address: string;
    companyName?: string;
    companyNumber?: string;
    companyAddress?: string;
}

/**
 * 사용자 관리 상세 페이지 컴포넌트
 * @returns {JSX.Element} 사용자 관리 상세 컴포넌트
 */
const UserManagementDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [formData, setFormData] = useState<Partial<UserDetail>>({
        status: 'ACTIVE',
        phone: '',
        address: '',
        companyName: '',
        companyNumber: '',
        companyAddress: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const userId = searchParams.get('id') || id;
        if (userId) {
            loadUserDetail(userId);
        }
    }, [id, searchParams]);

    const loadUserDetail = async (userId: string) => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get<UserDetail>(`/admin/users/${userId}`);
            setUser(response.data);
            setFormData(response.data);
        } catch (error) {
            setError(error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.'));
            console.error('사용자 상세 정보 조회 실패:', error);
            alert('사용자 정보를 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        
        if (!formData.phone) {
            newErrors.phone = '전화번호를 입력해주세요.';
        }

        if (!formData.address) {
            newErrors.address = '주소를 입력해주세요.';
        }

        if (formData.userType === 'CORPORATE') {
            if (!formData.companyName) {
                newErrors.companyName = '회사명을 입력해주세요.';
            }
            if (!formData.companyNumber) {
                newErrors.companyNumber = '사업자등록번호를 입력해주세요.';
            }
            if (!formData.companyAddress) {
                newErrors.companyAddress = '회사 주소를 입력해주세요.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        try {
            if (user) {
                await axiosInstance.put(`/admin/users/${user.id}`, formData);
            }
            alert('사용자 정보가 저장되었습니다.');
            navigate('/admin/user-management');
        } catch (error) {
            console.error('사용자 정보 저장 실패:', error);
            alert('사용자 정보 저장에 실패했습니다.');
        }
    };

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div className="error-message">데이터 로딩 중 오류가 발생했습니다.</div>;
    if (!user) return <div>사용자 정보를 찾을 수 없습니다.</div>;

    return (
        <div className="main">
            <div className="contents">
                <div className="content">
                    <div className="container">
                        <article className="article-area">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>아이디</label>
                                    <div className="form-control">{user.username}</div>
                                </div>

                                <div className="form-group">
                                    <label>이메일</label>
                                    <div className="form-control">{user.email}</div>
                                </div>

                                <div className="form-group">
                                    <label>이름</label>
                                    <div className="form-control">{user.name}</div>
                                </div>

                                <div className="form-group">
                                    <label>구분</label>
                                    <div className="form-control">
                                        {user.userType === 'INDIVIDUAL' ? '개인' : '기업'}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>상태</label>
                                    <div className="form-radio">
                                        <div className="control">
                                            <input 
                                                type="radio" 
                                                name="status" 
                                                value="ACTIVE"
                                                checked={formData.status === 'ACTIVE'}
                                                onChange={handleInputChange}
                                            />
                                            <span className="text">활성</span>
                                        </div>
                                        <div className="control">
                                            <input 
                                                type="radio" 
                                                name="status" 
                                                value="INACTIVE"
                                                checked={formData.status === 'INACTIVE'}
                                                onChange={handleInputChange}
                                            />
                                            <span className="text">비활성</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>전화번호</label>
                                    <div className="control">
                                        <input 
                                            type="tel" 
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="전화번호를 입력하세요"
                                        />
                                        {errors.phone && <div className="error-message">{errors.phone}</div>}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>주소</label>
                                    <div className="control">
                                        <input 
                                            type="text" 
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="주소를 입력하세요"
                                        />
                                        {errors.address && <div className="error-message">{errors.address}</div>}
                                    </div>
                                </div>

                                {user.userType === 'CORPORATE' && (
                                    <>
                                        <div className="form-group">
                                            <label>회사명</label>
                                            <div className="control">
                                                <input 
                                                    type="text" 
                                                    name="companyName"
                                                    value={formData.companyName}
                                                    onChange={handleInputChange}
                                                    placeholder="회사명을 입력하세요"
                                                />
                                                {errors.companyName && <div className="error-message">{errors.companyName}</div>}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>사업자등록번호</label>
                                            <div className="control">
                                                <input 
                                                    type="text" 
                                                    name="companyNumber"
                                                    value={formData.companyNumber}
                                                    onChange={handleInputChange}
                                                    placeholder="사업자등록번호를 입력하세요"
                                                />
                                                {errors.companyNumber && <div className="error-message">{errors.companyNumber}</div>}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>회사 주소</label>
                                            <div className="control">
                                                <input 
                                                    type="text" 
                                                    name="companyAddress"
                                                    value={formData.companyAddress}
                                                    onChange={handleInputChange}
                                                    placeholder="회사 주소를 입력하세요"
                                                />
                                                {errors.companyAddress && <div className="error-message">{errors.companyAddress}</div>}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="form-group">
                                    <label>가입일</label>
                                    <div className="form-control">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>최근 로그인</label>
                                    <div className="form-control">
                                        {new Date(user.lastLoginAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="btn-area">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                    >
                                        저장
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/admin/user-management')}
                                    >
                                        목록으로
                                    </button>
                                </div>
                            </form>
                        </article>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagementDetail; 