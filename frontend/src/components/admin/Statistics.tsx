import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../api/axios';

/**
 * 통계 데이터 타입 정의
 */
interface DailyStat {
    date: string;
    users: number;
    jobs: number;
    resumes: number;
    applications: number;
    payments: number;
    revenue: number;
}

interface MonthlyStat {
    month: string;
    users: number;
    jobs: number;
    resumes: number;
    applications: number;
    payments: number;
    revenue: number;
}

interface Statistics {
    totalUsers: number;
    totalJobs: number;
    totalResumes: number;
    totalApplications: number;
    totalPayments: number;
    totalRevenue: number;
    dailyStats: DailyStat[];
    monthlyStats: MonthlyStat[];
}

/**
 * 통계 페이지 컴포넌트
 * @returns {JSX.Element} 통계 컴포넌트
 */
const Statistics: React.FC = () => {
    const [stats, setStats] = useState<Statistics>({
        totalUsers: 0,
        totalJobs: 0,
        totalResumes: 0,
        totalApplications: 0,
        totalPayments: 0,
        totalRevenue: 0,
        dailyStats: [],
        monthlyStats: []
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');

    useEffect(() => {
        loadStatistics();
    }, [period]);

    const loadStatistics = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get<Statistics>(`/admin/statistics?period=${period}`);
            setStats(response.data);
        } catch (error) {
            setError(error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.'));
            console.error('통계 로드 실패:', error);
            alert('통계를 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString();
    };

    const formatCurrency = (num: number) => {
        return `₩${num.toLocaleString()}`;
    };

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div className="error-message">데이터 로딩 중 오류가 발생했습니다.</div>;

    return (
        <div className="main">            
            <div className="contents">
                <div className="content">
                    <div className="container">
                        <article className="article-area">
                            <div className="statistics-summary">
                                <div className="stat-card">
                                    <h3>전체 회원</h3>
                                    <p>{formatNumber(stats.totalUsers)}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>전체 구인구직</h3>
                                    <p>{formatNumber(stats.totalJobs)}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>전체 이력서</h3>
                                    <p>{formatNumber(stats.totalResumes)}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>전체 지원</h3>
                                    <p>{formatNumber(stats.totalApplications)}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>전체 결제</h3>
                                    <p>{formatNumber(stats.totalPayments)}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>전체 매출</h3>
                                    <p>{formatCurrency(stats.totalRevenue)}</p>
                                </div>
                            </div>

                            <div className="statistics-period">
                                <button 
                                    className={`btn ${period === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setPeriod('daily')}
                                >
                                    일별 통계
                                </button>
                                <button 
                                    className={`btn ${period === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setPeriod('monthly')}
                                >
                                    월별 통계
                                </button>
                            </div>

                            <div className="statistics-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>{period === 'daily' ? '날짜' : '월'}</th>
                                            <th>회원</th>
                                            <th>구인구직</th>
                                            <th>이력서</th>
                                            <th>지원</th>
                                            <th>결제</th>
                                            <th>매출</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(period === 'daily' ? stats.dailyStats : stats.monthlyStats).map((stat, index) => (
                                            <tr key={index}>
                                                <td>{period === 'daily' ? (stat as DailyStat).date : (stat as MonthlyStat).month}</td>
                                                <td>{formatNumber(stat.users)}</td>
                                                <td>{formatNumber(stat.jobs)}</td>
                                                <td>{formatNumber(stat.resumes)}</td>
                                                <td>{formatNumber(stat.applications)}</td>
                                                <td>{formatNumber(stat.payments)}</td>
                                                <td>{formatCurrency(stat.revenue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistics; 