import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../api/axios';

/**
 * 사용자 정보 타입 정의
 */
interface User {
    id: number;
    username: string;
    email: string;
    name: string;
    userType: 'INDIVIDUAL' | 'CORPORATE';
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
    lastLoginAt: string;
}

/**
 * API 응답 데이터 타입 정의
 */
interface ApiResponse {
    content: User[];
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
    keyword: string;
    page: number;
    size: number;
}

/**
 * 사용자 관리 페이지 컴포넌트
 * @returns {JSX.Element} 사용자 관리 컴포넌트
 */
const UserManagement: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchParams, setSearchParams] = useState<SearchParams>({
        userType: '',
        status: '',
        keyword: '',
        page: 0,
        size: 10
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        loadUsers();
    }, [currentPage, searchParams]);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get<ApiResponse>('/admin/users', {
                params: {
                    ...searchParams,
                    page: currentPage
                }
            });
            setUsers(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            setError(error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.'));
            console.error('사용자 목록 조회 실패:', error);
            alert('사용자 목록을 불러오는데 실패했습니다.');
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
            setSelectedIds(users.map(user => user.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) {
            alert('삭제할 사용자를 선택해주세요.');
            return;
        }

        if (!window.confirm('선택한 사용자를 삭제하시겠습니까?')) {
            return;
        }

        try {
            await axiosInstance.delete('/admin/users/bulk', {
                data: selectedIds
            });
            alert('선택한 사용자가 삭제되었습니다.');
            setSelectedIds([]);
            loadUsers();
        } catch (error) {
            console.error('사용자 삭제 실패:', error);
            alert('사용자 삭제에 실패했습니다.');
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        loadUsers();
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
                return '활성';
            case 'INACTIVE':
                return '비활성';
            default:
                return status;
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
                                            <option value="ACTIVE">활성</option>
                                            <option value="INACTIVE">비활성</option>
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
                                                    <col width="120px"/>
                                                    <col width="100px"/>
                                                    <col width="100px"/>
                                                    <col width="150px"/>
                                                    <col width="150px"/>
                                                    <col width="180px"/>
                                                </colgroup>
                                                <thead>
                                                    <tr>
                                                        <th>
                                                            <div className="control">
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="checked--all"
                                                                    checked={selectedIds.length === users.length}
                                                                    onChange={handleCheckAll}
                                                                />
                                                            </div>
                                                        </th>
                                                        <th>번호</th>
                                                        <th>아이디</th>
                                                        <th>이메일</th>
                                                        <th>이름</th>
                                                        <th>구분</th>
                                                        <th>가입일</th>
                                                        <th>최근로그인</th>
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
                                                    <col width="120px"/>
                                                    <col width="100px"/>
                                                    <col width="100px"/>
                                                    <col width="150px"/>
                                                    <col width="150px"/>
                                                    <col width="180px"/>
                                                </colgroup>
                                                <tbody>
                                                    {users.map((user, index) => (
                                                        <tr key={user.id}>
                                                            <td>
                                                                <div className="control">
                                                                    <input 
                                                                        type="checkbox"
                                                                        checked={selectedIds.includes(user.id)}
                                                                        onChange={() => handleCheckboxChange(user.id)}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td>{users.length - index}</td>
                                                            <td>{user.username}</td>
                                                            <td>{user.email}</td>
                                                            <td>{user.name}</td>
                                                            <td>
                                                                <span className={`status ${user.status.toLowerCase()}`}>
                                                                    {getStatusText(user.status)}
                                                                </span>
                                                            </td>
                                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                            <td>{new Date(user.lastLoginAt).toLocaleDateString()}</td>
                                                            <td>
                                                                <div className="btn-area">
                                                                    <button 
                                                                        type="button" 
                                                                        className="btn btn-warning btn-small"
                                                                        onClick={() => navigate(`/admin/user-management/detail?id=${user.id}`)}
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

export default UserManagement; 