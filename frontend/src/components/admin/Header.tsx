import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

/**
 * Header 컴포넌트의 Props 타입 정의
 */
interface HeaderProps {
    title: string;
    activeMenu: string;
}

/**
 * 관리자 페이지의 공통 헤더 컴포넌트
 * @param {HeaderProps} props - 컴포넌트 props
 * @returns {JSX.Element} Header 컴포넌트
 */
const Header: React.FC<HeaderProps> = ({ title, activeMenu }) => {
    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <Link to="/admin" className="logo">
                    <img src="/img/logo.png" alt="로고" />
                    <span>관리자</span>
                </Link>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    <li className={activeMenu === 'data-management' ? 'active' : ''}>
                        <Link to="/admin/dashboard/data-management">
                            <i className="fas fa-home"></i>
                            <span>데이터관리</span>
                        </Link>
                    </li>
                    <li className={activeMenu === 'job-info' ? 'active' : ''}>
                        <Link to="/admin/dashboard/job-info">
                            <i className="fas fa-briefcase"></i>
                            <span>채용정보</span>
                        </Link>
                    </li>
                    <li className={activeMenu === 'resume-info' ? 'active' : ''}>
                        <Link to="/admin/dashboard/resume-info">
                            <i className="fas fa-file-alt"></i>
                            <span>이력서정보</span>
                        </Link>
                    </li>
                    <li className={activeMenu === 'job-application' ? 'active' : ''}>
                        <Link to="/admin/dashboard/job-application">
                            <i className="fas fa-clipboard-list"></i>
                            <span>지원관리</span>
                        </Link>
                    </li>
                    <li className={activeMenu === 'position-proposal' ? 'active' : ''}>
                        <Link to="/admin/dashboard/position-proposal">
                            <i className="fas fa-user-tie"></i>
                            <span>포지션제안</span>
                        </Link>
                    </li>
                    <li className={activeMenu === 'company-info' ? 'active' : ''}>
                        <Link to="/admin/dashboard/company-info">
                            <i className="fas fa-building"></i>
                            <span>회사정보</span>
                        </Link>
                    </li>
                    <li className={activeMenu === 'banner-management' ? 'active' : ''}>
                        <Link to="/admin/dashboard/banner-management">
                            <i className="fas fa-image"></i>
                            <span>배너관리</span>
                        </Link>
                    </li>
                    <li className={activeMenu === 'community' ? 'active' : ''}>
                        <Link to="/admin/dashboard/community">
                            <i className="fas fa-comments"></i>
                            <span>커뮤니티</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Header; 