-- =====================================================
-- 실제 사용 가능한 관리자 계정 생성
-- =====================================================

USE yourjobdb;

-- 실제 해시된 비밀번호로 관리자 계정 생성
-- 비밀번호: admin123 (BCrypt 해시)
INSERT INTO users (user_type, email, password_hash, name, phone, salt_yn, is_active, is_banned, created_at, updated_at)
VALUES 
('ADMIN', 'admin@yourjob.com', '$2a$10$N.zmdr9k7uOCQb96VdodqeQ4B5n5IvgN3eO5rg0tOBj5.FLy1H2VG', 'YourJob Admin', '010-1234-5678', 'Y', 1, 0, NOW(), NOW());

-- 테스트용 일반 사용자들 (실제 해시된 비밀번호)
-- 비밀번호: user123
INSERT INTO users (user_type, email, password_hash, name, phone, salt_yn, is_active, is_banned, created_at, updated_at)
VALUES 
('JOB_SEEKER', 'user@yourjob.com', '$2a$10$N.zmdr9k7uOCQb96VdodqeQ4B5n5IvgN3eO5rg0tOBj5.FLy1H2VG', '테스트 구직자', '010-1111-1111', 'Y', 1, 0, NOW(), NOW()),
('EMPLOYER', 'company@yourjob.com', '$2a$10$N.zmdr9k7uOCQb96VdodqeQ4B5n5IvgN3eO5rg0tOBj5.FLy1H2VG', '테스트 기업', '010-2222-2222', 'Y', 1, 0, NOW(), NOW());

-- 테스트 기업 프로필 생성 
INSERT INTO company_profile (
    user_id, 
    company_name, 
    business_registration_number, 
    representative_name, 
    corporate_type_id, 
    founding_date, 
    number_of_employees, 
    industry, 
    description, 
    address, 
    website, 
    created_at, 
    updated_at
)
SELECT 
    u.user_id,
    '테스트 IT 회사',
    '123-45-67890',
    '테스트 대표',
    ct.corporate_type_id,
    '2020-01-01',
    '50-100명',
    'IT/소프트웨어',
    '혁신적인 IT 솔루션을 제공하는 회사입니다.',
    '서울특별시 강남구',
    'https://testcompany.com',
    NOW(),
    NOW()
FROM users u, corporate_types ct
WHERE u.email = 'company@yourjob.com' 
AND ct.corporate_type_name = '스타트업';

-- 샘플 채용공고 생성
INSERT INTO job_postings (
    company_id,
    title,
    job_description,
    requirements,
    preferred_qualifications,
    benefits,
    location,
    job_type,
    employment_type,
    experience_level,
    salary_min,
    salary_max,
    salary_negotiable,
    deadline,
    is_active,
    created_at,
    updated_at
)
SELECT 
    cp.user_id,
    'Senior Backend Developer (Kotlin/Spring)',
    'YourJob 플랫폼의 백엔드 개발을 담당할 시니어 개발자를 모집합니다.',
    '- Kotlin, Spring Boot 3년 이상 경험\n- MySQL, Redis 사용 경험\n- RESTful API 설계 및 구현 경험\n- Docker 컨테이너 환경 경험',
    '- AWS 클라우드 환경 경험\n- 대용량 트래픽 처리 경험\n- MSA 아키텍처 이해\n- 코드리뷰 및 멘토링 경험',
    '- 4대보험 + 퇴직연금\n- 연봉 협의 후 결정\n- 재택근무 가능\n- 교육비 지원\n- 맥북 프로 지급',
    '서울 강남구',
    'IT/개발',
    '정규직',
    '경력 3-7년',
    5000,
    8000,
    1,
    DATE_ADD(NOW(), INTERVAL 30 DAY),
    1,
    NOW(),
    NOW()
FROM company_profile cp
WHERE cp.company_name = '테스트 IT 회사';

-- 추가 샘플 채용공고들
INSERT INTO job_postings (company_id, title, job_description, requirements, location, job_type, employment_type, experience_level, salary_min, salary_max, deadline, is_active, created_at)
SELECT 
    cp.user_id,
    '프론트엔드 개발자 (React/TypeScript)',
    'React 기반 웹 애플리케이션 개발',
    'React, TypeScript, JavaScript 경험 필수',
    '서울 마포구',
    'IT/개발',
    '정규직',
    '경력 2-5년',
    4000,
    6000,
    DATE_ADD(NOW(), INTERVAL 25 DAY),
    1,
    NOW()
FROM company_profile cp
WHERE cp.company_name = '테스트 IT 회사'

UNION ALL

SELECT 
    cp.user_id,
    'DevOps 엔지니어',
    'AWS 기반 인프라 관리 및 CI/CD 구축',
    'AWS, Docker, Kubernetes 경험 필수',
    '서울 성수동',
    'IT/인프라',
    '정규직',
    '경력 3-6년',
    5500,
    7500,
    DATE_ADD(NOW(), INTERVAL 20 DAY),
    1,
    NOW()
FROM company_profile cp
WHERE cp.company_name = '테스트 IT 회사';

-- 관리자 활동 로그 생성
INSERT INTO activity_logs (activity_id, activity_type, description, severity, created_at) VALUES
('ACT_INIT_001', 'ADMIN_ACTION', '시스템 초기화 완료', 'INFO', NOW()),
('ACT_INIT_002', 'USER_REGISTRATION', '관리자 계정 생성', 'INFO', NOW()),
('ACT_INIT_003', 'JOB_POSTING_CREATED', '샘플 채용공고 생성', 'INFO', NOW());

-- 관리자 알림 생성
INSERT INTO admin_alerts (alert_type, title, message, severity, created_at) VALUES
('SYSTEM_ERROR', '시스템 시작', 'YourJob 플랫폼이 성공적으로 시작되었습니다.', 'LOW', NOW()),
('DATA_INTEGRITY_ISSUE', '초기 데이터', '개발용 샘플 데이터가 생성되었습니다.', 'LOW', NOW());