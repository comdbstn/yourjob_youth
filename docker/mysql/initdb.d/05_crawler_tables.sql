-- =====================================================
-- CRAWLER SYSTEM TABLES
-- 크롤러 시스템 관련 테이블들
-- =====================================================

USE yourjobdb;

-- =====================================================
-- CRAWLER_CONFIGS
-- 크롤러 설정 정보
-- =====================================================
CREATE TABLE IF NOT EXISTS crawler_configs (
    config_id INT AUTO_INCREMENT PRIMARY KEY,
    site_name VARCHAR(100) NOT NULL UNIQUE, -- 'saramin', 'jobkorea', 'wanted' etc.
    base_url VARCHAR(500) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    crawl_interval INT DEFAULT 60, -- 크롤링 간격 (분)
    max_pages INT DEFAULT 10, -- 최대 크롤링 페이지 수
    selectors JSON, -- CSS 선택자 설정 (JSON 형태)
    filters JSON, -- 필터링 조건 (JSON 형태)
    last_crawled_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_crawler_configs_active (is_active),
    INDEX idx_crawler_configs_site (site_name)
) ENGINE=InnoDB;

-- =====================================================
-- CRAWLER_JOBS
-- 크롤링된 채용공고 데이터
-- =====================================================
CREATE TABLE IF NOT EXISTS crawler_jobs (
    crawler_id INT AUTO_INCREMENT PRIMARY KEY,
    site_name VARCHAR(100) NOT NULL,
    site_url VARCHAR(500) NOT NULL,
    job_title VARCHAR(500) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    job_type VARCHAR(100), -- 정규직, 계약직, 인턴 등
    experience VARCHAR(100), -- 신입, 경력 등
    salary VARCHAR(200),
    description TEXT,
    requirements TEXT,
    benefits TEXT,
    deadline VARCHAR(100),
    original_url VARCHAR(1000) NOT NULL, -- 원본 사이트 URL
    original_job_id VARCHAR(200) NOT NULL, -- 원본 사이트의 공고 ID
    crawl_status ENUM('CRAWLED','FAILED','SKIPPED') DEFAULT 'CRAWLED',
    process_status ENUM('PENDING','PROCESSING','SUCCESS','FAILED','DUPLICATE','FILTERED') DEFAULT 'PENDING',
    duplicate_check TINYINT(1) DEFAULT 0,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    crawled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_original_job (site_name, original_job_id), -- 중복 방지
    INDEX idx_crawler_jobs_site (site_name),
    INDEX idx_crawler_jobs_status (process_status),
    INDEX idx_crawler_jobs_crawled (crawled_at),
    INDEX idx_crawler_jobs_company (company_name),
    FULLTEXT INDEX ft_crawler_jobs_search (job_title, company_name, description)
) ENGINE=InnoDB;

-- =====================================================
-- CRAWLER_LOGS
-- 크롤러 실행 로그
-- =====================================================
CREATE TABLE IF NOT EXISTS crawler_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    site_name VARCHAR(100) NOT NULL,
    log_level ENUM('INFO','WARN','ERROR','DEBUG') DEFAULT 'INFO',
    message TEXT NOT NULL,
    details JSON, -- 상세 정보 (JSON 형태)
    execution_time DECIMAL(10,3), -- 실행 시간 (초)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_crawler_logs_site (site_name),
    INDEX idx_crawler_logs_level (log_level),
    INDEX idx_crawler_logs_created (created_at)
) ENGINE=InnoDB;

-- =====================================================
-- CRAWLER_STATISTICS
-- 크롤러 통계 정보
-- =====================================================
CREATE TABLE IF NOT EXISTS crawler_statistics (
    stat_id INT AUTO_INCREMENT PRIMARY KEY,
    site_name VARCHAR(100) NOT NULL,
    stat_date DATE NOT NULL,
    total_crawled INT DEFAULT 0,
    success_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    duplicate_count INT DEFAULT 0,
    filtered_count INT DEFAULT 0,
    avg_processing_time DECIMAL(10,3), -- 평균 처리 시간 (초)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_site_date (site_name, stat_date),
    INDEX idx_crawler_stats_site (site_name),
    INDEX idx_crawler_stats_date (stat_date)
) ENGINE=InnoDB;

-- =====================================================
-- JOB_POSTING_SOURCES
-- 채용공고 출처 추적 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS job_posting_sources (
    source_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    crawler_id INT, -- 크롤러를 통해 수집된 경우
    source_type ENUM('MANUAL','CRAWLER','API','IMPORT') DEFAULT 'MANUAL',
    original_site VARCHAR(100), -- 원본 사이트명
    original_url VARCHAR(1000), -- 원본 URL
    original_job_id VARCHAR(200), -- 원본 사이트 공고 ID
    imported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_posting_sources_job
        FOREIGN KEY (job_id)
        REFERENCES job_postings(job_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_job_posting_sources_crawler
        FOREIGN KEY (crawler_id)
        REFERENCES crawler_jobs(crawler_id)
        ON DELETE SET NULL,
    INDEX idx_job_posting_sources_job (job_id),
    INDEX idx_job_posting_sources_type (source_type),
    INDEX idx_job_posting_sources_site (original_site)
) ENGINE=InnoDB;

-- Insert sample crawler configurations
INSERT INTO crawler_configs (site_name, base_url, is_active, crawl_interval, max_pages, selectors, filters) VALUES
('saramin', 'https://www.saramin.co.kr/zf_user/jobs/list', 1, 30, 5, 
 '{"title": ".job_tit > a", "company": ".corp_name > a", "location": ".job_condition > span:first-child", "deadline": ".job_date"}',
 '{"excludeKeywords": ["아르바이트", "투잡"], "minSalary": null, "locations": ["서울", "경기", "인천"]}'),
('jobkorea', 'https://www.jobkorea.co.kr/recruit/joblist', 1, 45, 3,
 '{"title": ".title > a", "company": ".name > a", "location": ".option > span", "salary": ".salary"}',
 '{"excludeKeywords": ["단순노무", "서빙"], "experienceLevel": ["신입", "경력"]}'),
('wanted', 'https://www.wanted.co.kr/wdlist', 0, 60, 5,
 '{"title": ".job-card-title", "company": ".company-name", "location": ".job-card-location"}',
 '{"techStack": ["Java", "Python", "JavaScript", "React"], "companySize": ["스타트업", "중소기업", "대기업"]}');

-- Insert sample statistics
INSERT INTO crawler_statistics (site_name, stat_date, total_crawled, success_count, failed_count, duplicate_count, avg_processing_time) VALUES
('saramin', CURDATE(), 150, 120, 10, 20, 2.35),
('jobkorea', CURDATE(), 100, 85, 5, 10, 1.95),
('wanted', CURDATE(), 50, 45, 2, 3, 3.12);

-- Insert sample crawler jobs
INSERT INTO crawler_jobs (site_name, site_url, job_title, company_name, location, job_type, experience, salary, description, requirements, deadline, original_url, original_job_id, process_status) VALUES
('saramin', 'https://www.saramin.co.kr', '백엔드 개발자 (Spring Boot)', '테크스타트업', '서울 강남구', '정규직', '경력 2-5년', '4000-6000만원', 'Spring Boot 기반 백엔드 개발', 'Java, Spring Boot, MySQL 경험 필수', '2025-01-31', 'https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=123456', 'saramin_123456', 'SUCCESS'),
('jobkorea', 'https://www.jobkorea.co.kr', '프론트엔드 개발자 (React)', '웹에이전시', '서울 마포구', '정규직', '경력 1-3년', '3500-5000만원', 'React 기반 웹 개발', 'React, TypeScript, CSS 경험', '2025-02-15', 'https://www.jobkorea.co.kr/recruit/jobview?rec_idx=789012', 'jobkorea_789012', 'SUCCESS'),
('wanted', 'https://www.wanted.co.kr', '풀스택 개발자', '핀테크스타트업', '서울 성수동', '정규직', '경력 3-7년', '5000-8000만원', 'Node.js + React 풀스택 개발', 'Node.js, React, AWS 경험 우대', '상시채용', 'https://www.wanted.co.kr/wd/345678', 'wanted_345678', 'PENDING');