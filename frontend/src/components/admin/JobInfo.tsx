import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../api/axios';

/**
 * 채용 정보 타입 정의
 */
interface JobInfo {
    id: number;
    createdAt: string;
    deadline: string;
    status: string;
    userId: string;
    companyName: string;
    title: string;
    locationType: string;
    region: string;
    jobType: string;
}

/**
 * API 응답 데이터 타입 정의
 */
interface ApiResponse {
    content: JobInfo[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

/**
 * 검색 파라미터 타입 정의
 */
interface SearchParams {
    status: string;
    paid: string;
    locationType: string;
    region: string;
    jobType: string;
    startDate: string;
    endDate: string;
    keyword: string;
    page: number;
    size: number;
}

/**
 * 채용정보 관리 페이지 컴포넌트
 * @returns {JSX.Element} 채용정보 관리 컴포넌트
 */

const JobInfo: React.FC = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<JobInfo[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchParams, setSearchParams] = useState<SearchParams>({
        status: '',
        paid: '',
        locationType: '',
        region: '',
        jobType: '',
        startDate: '',
        endDate: '',
        keyword: '',
        page: 0,
        size: 10
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        loadJobs();
    }, [currentPage, searchParams]);


    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
        if (e.target.checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(jobId => jobId !== id));
        }
    };

    const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(jobs.map(job => job.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        loadJobs();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleBulkUpdateStatus = async (status: string) => {
        if (selectedIds.length === 0) {
            alert('처리할 채용정보를 선택해주세요.');
            return;
        }

        if (!window.confirm(`선택한 채용정보를 ${status === 'delete' ? '삭제' : status === 'enable' ? '노출' : '비노출'}하시겠습니까?`)) {
            return;
        }

        try {
            await axiosInstance.patch('/admin/jobs/bulk/status', {
                ids: selectedIds,
                status
            });
            alert('선택한 채용정보가 처리되었습니다.');
            setSelectedIds([]);
            loadJobs();
        } catch (error) {
            console.error('채용정보 상태 변경 실패:', error);
            alert('채용정보 상태 변경에 실패했습니다.');
        }
    };

    // 옵션 값들을 저장할 상태 추가
    const [locationTypeOptions, setLocationTypeOptions] = useState<string[]>([]);
    const [regionOptions, setRegionOptions] = useState<string[]>([]);
    const [jobTypeOptions, setJobTypeOptions] = useState<string[]>([]);

// 데이터에서 옵션 값들 추출하는 함수
    const extractOptionsFromJobs = (jobs: JobInfo[]) => {
        // 중복 제거를 위해 Set 사용
        const locationTypes = new Set<string>();
        const regions = new Set<string>();
        const jobTypes = new Set<string>();

        jobs.forEach(job => {
            // locationType 추출
            if (job.locationType) {
                locationTypes.add(job.locationType);
            }

            // region 추출
            if (job.region) {
                job.region.split(',').forEach(r => regions.add(r.trim()));
            }

            // jobType 추출
            if (job.jobType) {
                job.jobType.split(',').forEach(jt => jobTypes.add(jt.trim()));
            }
        });

        // Set을 배열로 변환하여 상태 업데이트
        setLocationTypeOptions(Array.from(locationTypes));
        setRegionOptions(Array.from(regions));
        setJobTypeOptions(Array.from(jobTypes));
    };

    // API 호출 및 데이터 로드 후 옵션 추출
    const loadJobs = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get<ApiResponse>('/api/v1/admin/jobs', {
                params: {
                    ...searchParams,
                    page: currentPage
                }
            });
            setJobs(response.data.content);
            setTotalPages(response.data.totalPages);

            // 초기 데이터 로드 시에만 옵션 추출
            if (locationTypeOptions.length === 0 || regionOptions.length === 0 || jobTypeOptions.length === 0) {
                extractOptionsFromJobs(response.data.content);
            }
        } catch (error) {
            setError(error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.'));
            console.error('채용정보 목록 조회 실패:', error);
            alert('채용정보 목록을 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, [currentPage, searchParams]);

    const loadAllJobOptions = async () => {
        try {
            // 필터 없이 데이터 요청 (모든 옵션을 가져오기 위한 요청)
            const response = await axiosInstance.get<ApiResponse>('/api/v1/admin/jobs', {
                params: {
                    page: 0,
                    size: 100 // 충분한 데이터를 가져오기 위해 큰 크기 설정
                }
            });
            extractOptionsFromJobs(response.data.content);
        } catch (error) {
            console.error('옵션 데이터 로드 실패:', error);
        }
    };

    useEffect(() => {
        loadAllJobOptions();
    }, []);

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div className="error-message">데이터 로딩 중 오류가 발생했습니다.</div>;

    /* 너무 안맞는 데이터가 많아서 임시 제거
    <div className="control">
                                        <select
                                            name="locationType"
                                            className="select"
                                            value={searchParams.locationType}
                                            onChange={handleInputChange}
                                        >
                                            <option value="all">국가</option>
                                            <option value="all">국내</option>
                                            <option value="all">해외</option>
                                        </select>
                                    </div>
                                    <div className="control">
                                        <select
                                            name="region"
                                            className="select"
                                            value={searchParams.region}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">지역</option>
                                            <option value="seoul">서울</option>
                                            <option value="busan">부산</option>
                                        </select>
                                    </div>
                                    <div className="control">
                                        <select
                                            name="jobType"
                                            className="select"
                                            value={searchParams.jobType}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">직종</option>
                                            <option value="정규직">정규직</option>
                                            <option value="계약직">계약직</option>
                                            <option value="인턴">인턴</option>
                                            <option value="파견직">파견직</option>
                                            <option value="도급">도급</option>
                                            <option value="프리랜서">프리랜서</option>
                                            <option value="아르바이트">아르바이트</option>
                                            <option value="연수생/교육생">연수생/교육생</option>
                                            <option value="병역특례">병역특례</option>
                                            <option value="위촉직/개인사업자">위촉직/개인사업자</option>
                                        </select>
                                    </div>
     */

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
                                    onClick={() => handleBulkUpdateStatus('delete')}
                                >
                                    삭제
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-success btn-small"
                                    onClick={() => handleBulkUpdateStatus('enable')}
                                >
                                    노출
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-warning btn-small"
                                    onClick={() => handleBulkUpdateStatus('disable')}
                                >
                                    비노출
                                </button>
                            </div>

                            <div className="search-area">
                                <div className="search--select select-box">
                                    <div className="control">
                                        <select 
                                            name="status" 
                                            className="select"
                                            value={searchParams.status}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">상태</option>
                                            <option value="close">close</option>
                                            <option value="채용중">채용중</option>
                                        </select>
                                    </div>
                                    <div className="control">
                                        <select 
                                            name="paid" 
                                            className="select"
                                            value={searchParams.paid}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">유료</option>
                                            <option value="item1">상품1</option>
                                            <option value="item2">상품2</option>
                                            <option value="item3">상품3</option>
                                        </select>
                                    </div>
                                    <div className="control">
                                        <select
                                            name="locationType"
                                            className="select"
                                            value={searchParams.locationType}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">국가</option>
                                            {locationTypeOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="control">
                                        <select
                                            name="region"
                                            className="select"
                                            value={searchParams.region}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">지역</option>
                                            {regionOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="control">
                                        <select
                                            name="jobType"
                                            className="select"
                                            value={searchParams.jobType}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">직종</option>
                                            {jobTypeOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
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
                                                    <col width="44px"/>
                                                    <col width="70px"/>
                                                    <col width="140px"/>
                                                    <col width="100px"/>
                                                    <col width="60px"/>
                                                    <col width="130px"/>
                                                    <col width="150px"/>
                                                    <col width="200px"/>
                                                    <col width="110px"/>
                                                    <col width="130px"/>
                                                    <col width="140px"/>
                                                    <col width="336px"/>
                                                </colgroup>
                                                <thead>
                                                    <tr>
                                                        <th>
                                                            <div className="control">
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="checked--all"
                                                                    checked={selectedIds.length === jobs.length}
                                                                    onChange={handleCheckAll}
                                                                />
                                                            </div>
                                                        </th>
                                                        <th>번호</th>
                                                        <th>등록일시</th>
                                                        <th>마감일</th>
                                                        <th>상태</th>
                                                        <th>아이디</th>
                                                        <th>기업명</th>
                                                        <th>제목</th>
                                                        <th>국가</th>
                                                        <th>지역</th>
                                                        <th>직종</th>
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
                                                    <col width="140px"/>
                                                    <col width="100px"/>
                                                    <col width="60px"/>
                                                    <col width="130px"/>
                                                    <col width="150px"/>
                                                    <col width="200px"/>
                                                    <col width="110px"/>
                                                    <col width="130px"/>
                                                    <col width="140px"/>
                                                    <col width="330px"/>
                                                </colgroup>
                                                <tbody>
                                                    {jobs.map((job, index) => (
                                                        <tr key={job.id}>
                                                            <td>
                                                                <div className="control">
                                                                    <input 
                                                                        type="checkbox"
                                                                        checked={selectedIds.includes(job.id)}
                                                                        onChange={(e) => handleCheckboxChange(e, job.id)}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td>{jobs.length - index}</td>
                                                            <td>{new Date(job.createdAt).toLocaleString()}</td>
                                                            <td>{new Date(job.deadline).toLocaleDateString()}</td>
                                                            <td>
                                                                <span className={`status ${job.status}`}>
                                                                    {job.status}
                                                                </span>
                                                            </td>
                                                            <td>{job.userId}</td>
                                                            <td>{job.companyName}</td>
                                                            <td>{job.title}</td>
                                                            <td>{job.locationType}</td>
                                                            <td>{job.region}</td>
                                                            <td>{job.jobType}</td>
                                                            <td>
                                                                <div className="btn-area">
                                                                    <button 
                                                                        type="button" 
                                                                        className="btn btn-primary btn-small"
                                                                        onClick={() => handleBulkUpdateStatus(job.status === 'enable' ? 'disable' : 'enable')}
                                                                    >
                                                                        {job.status === 'enable' ? '비노출' : '노출'}
                                                                    </button>
                                                                    <button 
                                                                        type="button" 
                                                                        className="btn btn-danger btn-small"
                                                                        onClick={() => handleBulkUpdateStatus('delete')}
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

export default JobInfo; 