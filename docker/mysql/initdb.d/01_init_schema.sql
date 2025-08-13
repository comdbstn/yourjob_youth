SET NAMES utf8mb4;

-- =====================================================
-- 0. DB creation (if not exists)
-- =====================================================
CREATE DATABASE IF NOT EXISTS yourjobdb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE yourjobdb;

-- =====================================================
-- USERS
--    - All users (employer, job_seeker, admin, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_type ENUM('EMPLOYER','JOB_SEEKER','ADMIN','COMPANY','COMPANY_EXCEL') NOT NULL,  -- changed to ENUM
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    oauth_provider VARCHAR(50),
    oauth_provider_id VARCHAR(255),
    token VARCHAR(255) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    is_banned TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- CORPORATE_TYPES
--    - corporate type reference table (used by company_profile)
--    - Moved upward so that company_profile can reference it
-- =====================================================
CREATE TABLE IF NOT EXISTS corporate_types (
    corporate_type_id INT AUTO_INCREMENT PRIMARY KEY, 
    corporate_type_name VARCHAR(255) NOT NULL UNIQUE, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- COMPANY_PROFILE
--    - 1:1 with users, specifically for employer
-- =====================================================
CREATE TABLE IF NOT EXISTS company_profile (
  user_id INT PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  business_registration_number VARCHAR(50),
  representative_name VARCHAR(255),
  business_license_url VARCHAR(255),
  corporate_type_id INT DEFAULT NULL,  -- NULL 허용으로 변경
  founding_date DATE DEFAULT NULL,
  number_of_employees INT DEFAULT NULL,
  capital_amount DECIMAL(15,2) DEFAULT NULL,
  revenue_amount DECIMAL(15,2) DEFAULT NULL,
  net_income DECIMAL(15,2) DEFAULT NULL,
  industry VARCHAR(255),
  description TEXT,
  address VARCHAR(255),
  website VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_company_profile_user
      FOREIGN KEY (user_id)
      REFERENCES users(user_id)
      ON DELETE CASCADE,
  CONSTRAINT fk_company_profile_corporate_type
      FOREIGN KEY (corporate_type_id)
      REFERENCES corporate_types(corporate_type_id)
      ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- RESUMES
--    - job seeker's resumes
-- =====================================================
CREATE TABLE IF NOT EXISTS resumes (
    resume_id INT AUTO_INCREMENT PRIMARY KEY,
    job_seeker_id INT NOT NULL,
    resume_title VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resumes_user
        FOREIGN KEY (job_seeker_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- JOB_TYPES
--    - job type reference table
-- =====================================================
CREATE TABLE IF NOT EXISTS job_types (
    job_type_id INT AUTO_INCREMENT PRIMARY KEY,
    job_type_name VARCHAR(50) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insert initial job types
INSERT INTO job_types (job_type_name) VALUES
    ('정규직'),
    ('계약직'),
    ('인턴'),
    ('파견직'),
    ('도급'),
    ('프리랜서'),
    ('아르바이트'),
    ('연수생/교육생'),
    ('병역특례'),
    ('위촉직/개인사업자');

-- =====================================================
-- JOB_POSTINGS
--    - job postings with extended columns
--    - job_type changed to reference job_types table
-- =====================================================
CREATE TABLE IF NOT EXISTS job_postings (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    employer_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    location VARCHAR(255),
    country_code VARCHAR(50),
    job_type_id INT DEFAULT NULL,
    salary DECIMAL(10,2) DEFAULT 0.00,
    views INT DEFAULT 0,
    status ENUM('OPEN','CLOSED','DRAFT') DEFAULT 'OPEN',
    deadline DATE DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_postings_employer
        FOREIGN KEY (employer_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_job_postings_job_type
        FOREIGN KEY (job_type_id)
        REFERENCES job_types(job_type_id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- JOB_LIKES
--    - track 'likes' of job postings by users
-- =====================================================
CREATE TABLE IF NOT EXISTS job_likes (
    like_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_likes_job
        FOREIGN KEY (job_id)
        REFERENCES job_postings(job_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_job_likes_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- APPLICATIONS
--    - job applications
-- =====================================================
CREATE TABLE IF NOT EXISTS applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    job_seeker_id INT NOT NULL,
    resume_id INT NOT NULL,
    status ENUM('SUBMITTED','REVIEW','INTERVIEW','HIRED','REJECTED') DEFAULT 'SUBMITTED',
    cover_letter TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_applications_job
        FOREIGN KEY (job_id)
        REFERENCES job_postings(job_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_applications_jobseeker
        FOREIGN KEY (job_seeker_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_applications_resume
        FOREIGN KEY (resume_id)
        REFERENCES resumes(resume_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- COMMUNITY_CATEGORIES
--    - community board categories
-- =====================================================
CREATE TABLE IF NOT EXISTS community_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- COMMUNITY_POSTS
--    - community posts
-- =====================================================
CREATE TABLE IF NOT EXISTS community_posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    status ENUM('ACTIVE','DELETED','HIDDEN') DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_community_posts_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_community_posts_category
        FOREIGN KEY (category_id)
        REFERENCES community_categories(category_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- COMMUNITY_COMMENTS
--    - comments on community posts
-- =====================================================
CREATE TABLE IF NOT EXISTS community_comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    likes INT DEFAULT 0,
    parent_comment_id INT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_community_comments_post
        FOREIGN KEY (post_id)
        REFERENCES community_posts(post_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_community_comments_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_community_comments_parent
        FOREIGN KEY (parent_comment_id)
        REFERENCES community_comments(comment_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- COMMUNITY_LIKES
--     - likes on community posts/comments
-- =====================================================
CREATE TABLE IF NOT EXISTS community_likes (
    like_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NULL,
    comment_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_community_likes_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_community_likes_post
        FOREIGN KEY (post_id)
        REFERENCES community_posts(post_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_community_likes_comment
        FOREIGN KEY (comment_id)
        REFERENCES community_comments(comment_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- COMMUNITY_POST_TAGS
--     - tags (keywords) for community posts
-- =====================================================
CREATE TABLE IF NOT EXISTS community_post_tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    tag    VARCHAR(255) NOT NULL,
    CONSTRAINT fk_community_post_tags_post
        FOREIGN KEY (post_id)
        REFERENCES community_posts(post_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- SKILL_CATEGORIES
--     - categories for skills
-- =====================================================
CREATE TABLE IF NOT EXISTS skill_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- SKILLS
--     - actual skill names
-- =====================================================
CREATE TABLE IF NOT EXISTS skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    skill_name VARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_skills_category
        FOREIGN KEY (category_id)
        REFERENCES skill_categories(category_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- CORE_COMPETENCIES
--     - list of core competencies
-- =====================================================
CREATE TABLE IF NOT EXISTS core_competencies (
    competency_id INT AUTO_INCREMENT PRIMARY KEY,
    competency_name VARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- JOB_POSTING_SKILLS
--     - N:N linking table for job_postings and skills
-- =====================================================
CREATE TABLE IF NOT EXISTS job_posting_skills (
    job_posting_skill_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    skill_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_posting_skills_job
        FOREIGN KEY (job_id)
        REFERENCES job_postings(job_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_job_posting_skills_skill
        FOREIGN KEY (skill_id)
        REFERENCES skills(skill_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- JOB_POSTING_COMPETENCIES
--     - N:N linking table for job_postings and competencies
-- =====================================================
CREATE TABLE IF NOT EXISTS job_posting_competencies (
    job_posting_competency_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    competency_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_posting_competencies_job
        FOREIGN KEY (job_id)
        REFERENCES job_postings(job_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_job_posting_competencies_competency
        FOREIGN KEY (competency_id)
        REFERENCES core_competencies(competency_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;



-- =====================================================
-- TALENT_POOL
--     - talent pool management for employers
-- =====================================================
CREATE TABLE IF NOT EXISTS talent_pool (
    talent_pool_id INT AUTO_INCREMENT PRIMARY KEY,
    employer_id INT NOT NULL,
    job_seeker_id INT NOT NULL,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_talent_pool_employer
        FOREIGN KEY (employer_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_talent_pool_job_seeker
        FOREIGN KEY (job_seeker_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- =====================================================
-- Scraps
-- =====================================================
CREATE TABLE IF NOT EXISTS scrap_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_scrap_jobs_job
        FOREIGN KEY (job_id)
        REFERENCES job_postings(job_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job_offers (
    joboffer_id INT AUTO_INCREMENT PRIMARY KEY,
    employer_id INT NOT NULL,
    job_seeker_id INT,
    position VARCHAR(255) NOT NULL,
    message TEXT,
    status VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_offers_employer FOREIGN KEY (employer_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_job_offers_jobseeker FOREIGN KEY (job_seeker_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS domestic_university (
    university_id INT AUTO_INCREMENT PRIMARY KEY,
    year_of_survey VARCHAR(10),
    survey_round VARCHAR(10),
    university_name VARCHAR(255) NOT NULL,
    university_code VARCHAR(50),
    university_category VARCHAR(50),
    branch_type VARCHAR(50),
    university_type VARCHAR(50),
    region VARCHAR(100),
    college_name VARCHAR(255),
    college_code VARCHAR(50),
    department_code VARCHAR(50),
    department_name VARCHAR(255),
    day_night_type VARCHAR(50),
    department_characteristics VARCHAR(255),
    department_status VARCHAR(50),
    major_category VARCHAR(100),
    mid_category VARCHAR(100),
    sub_category VARCHAR(100),
    internal_category VARCHAR(100),
    course_duration VARCHAR(10),
    degree_program VARCHAR(50),
    department_location VARCHAR(255),
    department_location_detail VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS international_university (
    international_university_id INT AUTO_INCREMENT PRIMARY KEY,
    university_name VARCHAR(255) NOT NULL,  
    location VARCHAR(255),                  
    region VARCHAR(255),                    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS major (
    major_id INT AUTO_INCREMENT PRIMARY KEY,
    major_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certificate_list (
    certificate_id INT AUTO_INCREMENT PRIMARY KEY,
    certificate_name VARCHAR(255) NOT NULL,  
    certificate_type VARCHAR(255),           
    certificate_issuer VARCHAR(255),         
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS graduation_status (
    graduation_status_id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS region (
    region_id INT AUTO_INCREMENT PRIMARY KEY,
    region_name VARCHAR(255) NOT NULL,
    region_type ENUM('domestic','international') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS country (
    country_id INT AUTO_INCREMENT PRIMARY KEY,
    country_code VARCHAR(50) NOT NULL,
    country_name VARCHAR(255) NOT NULL,
    nation VARCHAR(255),
    continent VARCHAR(100),
    country_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


INSERT INTO skill_categories (category_name) VALUES
('디자인'), ('개발'), ('회계'), ('3D');

INSERT INTO skills (category_id, skill_name) VALUES 
(1, 'photoshop'), (1, 'illustrator'), (1, 'figma'),
(2, 'Cocos2d'), (2, 'CUDA'), (2, 'Firebase'),
(3, '기업회계 자격'), (3, '세무회계 자격'), (3, '전산회계 자격'),
(4, '3Ds max'), (4, '3D Printer'), (4, 'Autodesk');

INSERT INTO core_competencies (competency_name) VALUES
('계획성'), ('성실성'), ('성취지향성'),
('자율감'), ('적응성'), ('창의성'),
('스트레스관리'), ('윤리의식'), ('꼼꼼함'),
('메타인지'), ('성장지향성'), ('협동심');
