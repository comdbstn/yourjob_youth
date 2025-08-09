-- =====================================================
-- DETAILED RESUME TABLES
-- 이력서 상세 정보 테이블들
-- =====================================================

USE yourjobdb;

-- =====================================================
-- RESUME_EDUCATIONS
-- 이력서 학력 정보
-- =====================================================
CREATE TABLE IF NOT EXISTS resume_educations (
    education_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    school_type VARCHAR(50), -- 초등학교/중학교/고등학교/대학교/대학원/기타
    school_name VARCHAR(255) NOT NULL,
    major VARCHAR(255),
    graduation_status VARCHAR(50), -- 졸업/졸업예정/수료/중퇴/휴학
    admission_date DATE,
    graduation_date DATE,
    grade VARCHAR(50), -- 성적
    location VARCHAR(255), -- 학교 소재지
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_educations_resume
        FOREIGN KEY (resume_id)
        REFERENCES resumes(resume_id)
        ON DELETE CASCADE,
    INDEX idx_resume_educations_resume_id (resume_id)
) ENGINE=InnoDB;

-- =====================================================
-- RESUME_CAREERS
-- 이력서 경력 정보
-- =====================================================
CREATE TABLE IF NOT EXISTS resume_careers (
    career_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    department VARCHAR(255),
    job_description TEXT,
    start_date DATE,
    end_date DATE,
    is_working TINYINT(1) DEFAULT 0, -- 현재 재직 중
    salary VARCHAR(100),
    employment_type VARCHAR(50), -- 정규직/계약직/인턴/아르바이트
    company_type VARCHAR(50), -- 대기업/중견기업/중소기업/스타트업
    industry VARCHAR(100),
    achievements TEXT, -- 주요 성과
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_careers_resume
        FOREIGN KEY (resume_id)
        REFERENCES resumes(resume_id)
        ON DELETE CASCADE,
    INDEX idx_resume_careers_resume_id (resume_id)
) ENGINE=InnoDB;

-- =====================================================
-- RESUME_CERTIFICATIONS
-- 이력서 자격증/면허 정보
-- =====================================================
CREATE TABLE IF NOT EXISTS resume_certifications (
    certification_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    certificate_name VARCHAR(255) NOT NULL,
    certificate_number VARCHAR(100),
    issuing_organization VARCHAR(255),
    issue_date DATE,
    expiration_date DATE,
    score VARCHAR(50), -- 점수나 등급
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_certifications_resume
        FOREIGN KEY (resume_id)
        REFERENCES resumes(resume_id)
        ON DELETE CASCADE,
    INDEX idx_resume_certifications_resume_id (resume_id)
) ENGINE=InnoDB;

-- =====================================================
-- RESUME_LANGUAGES
-- 이력서 어학 정보
-- =====================================================
CREATE TABLE IF NOT EXISTS resume_languages (
    language_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    language_name VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(50), -- 초급/중급/고급/원어민
    certificate_name VARCHAR(255), -- TOEIC, TOEFL, JLPT 등
    score VARCHAR(50),
    test_date DATE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_languages_resume
        FOREIGN KEY (resume_id)
        REFERENCES resumes(resume_id)
        ON DELETE CASCADE,
    INDEX idx_resume_languages_resume_id (resume_id)
) ENGINE=InnoDB;

-- =====================================================
-- RESUME_ACTIVITIES
-- 이력서 활동 정보 (동아리, 학회, 봉사활동 등)
-- =====================================================
CREATE TABLE IF NOT EXISTS resume_activities (
    activity_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- 동아리/학회/봉사활동/인턴십/프로젝트/기타
    organization_name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    activity_name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    is_ongoing TINYINT(1) DEFAULT 0,
    achievements TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_activities_resume
        FOREIGN KEY (resume_id)
        REFERENCES resumes(resume_id)
        ON DELETE CASCADE,
    INDEX idx_resume_activities_resume_id (resume_id)
) ENGINE=InnoDB;

-- =====================================================
-- RESUME_AWARDS
-- 이력서 수상내역
-- =====================================================
CREATE TABLE IF NOT EXISTS resume_awards (
    award_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    award_name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255) NOT NULL,
    award_rank VARCHAR(50), -- 대상/금상/은상/동상/우수상
    award_date DATE,
    description TEXT,
    related_activity VARCHAR(255), -- 관련 활동/분야
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_awards_resume
        FOREIGN KEY (resume_id)
        REFERENCES resumes(resume_id)
        ON DELETE CASCADE,
    INDEX idx_resume_awards_resume_id (resume_id)
) ENGINE=InnoDB;

-- =====================================================
-- RESUME_SELFINTRODUCTIONS
-- 이력서 자기소개서
-- =====================================================
CREATE TABLE IF NOT EXISTS resume_selfintroductions (
    self_intro_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    question_title VARCHAR(255) NOT NULL, -- 질문 제목
    question_content TEXT, -- 질문 내용
    answer_content TEXT NOT NULL, -- 답변 내용
    word_limit INT, -- 글자 제한
    order_number INT DEFAULT 1, -- 순서
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_selfintroductions_resume
        FOREIGN KEY (resume_id)
        REFERENCES resumes(resume_id)
        ON DELETE CASCADE,
    INDEX idx_resume_selfintroductions_resume_id (resume_id)
) ENGINE=InnoDB;

-- =====================================================
-- RESUME_EMPLOYMENT_INFO
-- 이력서 취업관련사항 (병역, 장애여부 등)
-- =====================================================
CREATE TABLE IF NOT EXISTS resume_employment_info (
    employment_info_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    military_service VARCHAR(50), -- 군필/미필/면제/해당없음
    military_service_type VARCHAR(50), -- 현역/공익/기타
    military_start_date DATE,
    military_end_date DATE,
    military_rank VARCHAR(50), -- 계급
    military_branch VARCHAR(50), -- 군종
    disability_level VARCHAR(50), -- 장애 등급
    veterans_affairs TINYINT(1) DEFAULT 0, -- 보훈 대상 여부
    social_service TINYINT(1) DEFAULT 0, -- 사회복무요원 여부
    overseas_travel VARCHAR(50), -- 해외출장 가능 여부
    relocation VARCHAR(50), -- 근무지 이전 가능 여부
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_employment_info_resume
        FOREIGN KEY (resume_id)
        REFERENCES resumes(resume_id)
        ON DELETE CASCADE,
    INDEX idx_resume_employment_info_resume_id (resume_id)
) ENGINE=InnoDB;

-- =====================================================
-- RESUME_SKILLS
-- 이력서 보유 기술/스킬
-- =====================================================
CREATE TABLE IF NOT EXISTS resume_skills (
    resume_skill_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency_level VARCHAR(50), -- 초급/중급/고급/전문가
    experience_years INT, -- 경험 년수
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_skills_resume
        FOREIGN KEY (resume_id)
        REFERENCES resumes(resume_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_resume_skills_skill
        FOREIGN KEY (skill_id)
        REFERENCES skills(skill_id)
        ON DELETE CASCADE,
    INDEX idx_resume_skills_resume_id (resume_id),
    UNIQUE KEY unique_resume_skill (resume_id, skill_id)
) ENGINE=InnoDB;

-- =====================================================
-- RESUME_PORTFOLIO_FILES
-- 이력서 포트폴리오 첨부 파일
-- =====================================================
CREATE TABLE IF NOT EXISTS resume_portfolio_files (
    portfolio_file_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- portfolio/certificate/award_document 등
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    description TEXT,
    order_number INT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_portfolio_files_resume
        FOREIGN KEY (resume_id)
        REFERENCES resumes(resume_id)
        ON DELETE CASCADE,
    INDEX idx_resume_portfolio_files_resume_id (resume_id)
) ENGINE=InnoDB;

-- Add some sample data
INSERT INTO resume_educations (resume_id, school_type, school_name, major, graduation_status, graduation_date, grade) VALUES
(1, '대학교', '서울대학교', '컴퓨터공학과', '졸업', '2023-02-28', '3.8/4.5'),
(1, '고등학교', '서울고등학교', NULL, '졸업', '2019-02-28', '전교 10등');

INSERT INTO resume_certifications (resume_id, certificate_name, issuing_organization, issue_date, score) VALUES
(1, 'TOEIC', 'ETS', '2023-01-15', '890'),
(1, '정보처리기사', '한국산업인력공단', '2022-11-18', '합격');

INSERT INTO resume_activities (resume_id, activity_type, organization_name, activity_name, description, start_date, end_date) VALUES
(1, '동아리', '서울대학교', '프로그래밍 동아리', '웹 개발 프로젝트 참여', '2020-03-01', '2022-12-31'),
(1, '봉사활동', '사랑의열매', '코딩 교육 봉사', '초등학생 대상 코딩 교육', '2021-06-01', '2022-08-31');