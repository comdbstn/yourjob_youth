SET NAMES utf8mb4;

INSERT INTO corporate_types (corporate_type_name, created_at, updated_at)
VALUES 
  ('대기업', NOW(), NOW()),
  ('중소기업', NOW(), NOW()),
  ('공공기관/공기업', NOW(), NOW()),
  ('외국계기업', NOW(), NOW()),
  ('중견기업', NOW(), NOW()),
  ('비영리단체/협회/재단', NOW(), NOW()),
  ('스타트업', NOW(), NOW()),
  ('금융권', NOW(), NOW()),
  ('병원', NOW(), NOW()),
  ('동아리/학생자치단체', NOW(), NOW()),
  ('기타', NOW(), NOW());

INSERT INTO users (user_type, email, password_hash, name, phone, oauth_provider, oauth_provider_id, token, is_active, is_banned, created_at, updated_at)
VALUES 
  ('JOB_SEEKER', 'jobseeker1@example.com', 'hashed_pw_123', 'Alice Kim', '010-1111-2222', NULL, NULL, NULL, 1, 0, NOW(), NOW()),
  ('JOB_SEEKER', 'jobseeker2@example.com', 'hashed_pw_456', 'Bob Lee', '010-3333-4444', NULL, NULL, NULL, 1, 0, NOW(), NOW()),
  ('EMPLOYER', 'employer1@example.com', 'hashed_pw_emp1', 'Acme Corp', '010-5555-6666', NULL, NULL, NULL, 1, 0, NOW(), NOW()),
  ('ADMIN', 'admin@example.com', 'hashed_pw_admin', 'Admin User', '010-7777-8888', NULL, NULL, NULL, 1, 0, NOW(), NOW());

INSERT INTO company_profile (user_id, company_name, business_registration_number, representative_name, business_license_url, corporate_type_id, founding_date, number_of_employees, capital_amount, revenue_amount, net_income, industry, description, address, website, created_at, updated_at)
VALUES
  (3, 'Acme Corp', 'BRN-123456789', 'John Doe', 'http://example.com/license.jpg', 2, '2010-01-01', 100, 50.00, 200.00, 20.00, 'IT', 'Leading IT company', 'Seoul, Korea', 'http://acmecorp.com', NOW(), NOW());

INSERT INTO resumes (job_seeker_id, resume_title, file_path, created_at, updated_at)
VALUES
  (1, 'Resume of Alice', '/resumes/alice.pdf', NOW(), NOW());

INSERT INTO job_postings (employer_id, title, description, requirements, location, country_code, job_type, salary, views, status, deadline, created_at, updated_at)
VALUES
  (3, 'Software Engineer', 'Develop cutting-edge software solutions.', 'Bachelor degree in CS, 3+ years experience', 'Seoul', 'KR', 'FULL_TIME', 5000.00, 0, 'OPEN', '2025-12-31', NOW(), NOW()),
  (3, 'QA Engineer', 'Ensure product quality.', 'Experience in testing required', 'Seoul', 'KR', 'FULL_TIME', 4000.00, 0, 'OPEN', '2025-11-30', NOW(), NOW());

INSERT INTO applications (job_id, job_seeker_id, resume_id, status, cover_letter, created_at, updated_at)
VALUES
  (1, 1, 1, 'SUBMITTED', 'I am very interested in this position.', NOW(), NOW());

INSERT INTO community_categories (name, description, created_at, updated_at)
VALUES
  ('국내 채용', '국내 채용 관련 정보', NOW(), NOW()),
  ('일반 토론', '자유 토론 게시판', NOW(), NOW()),
  ('취업 정보', '취업 팁 및 정보 공유', NOW(), NOW()),
  ('기업 리뷰', '기업 후기 및 면접 경험', NOW(), NOW()),
  ('기타', '기타 정보', NOW(), NOW());

INSERT INTO community_posts (user_id, category_id, title, content, views, likes, status, created_at, updated_at)
VALUES
  (1, 1, '국내 채용 정보 공유합니다', '최근 채용 동향과 기업별 채용 정보를 공유하는 게시글입니다.', 10, 2, 'ACTIVE', NOW(), NOW()),
  (1, 3, '취업 준비 꿀팁 모음', '이력서 작성부터 면접까지 취업 준비에 도움되는 정보들을 정리했습니다.', 20, 5, 'ACTIVE', NOW(), NOW());

INSERT INTO community_comments (post_id, user_id, content, likes, parent_comment_id, created_at, updated_at)
VALUES
  (1, 2, 'Great post!', 1, NULL, NOW(), NOW()),
  (1, 1, 'Thank you!', 0, 1, NOW(), NOW());

INSERT INTO job_offers (employer_id, job_seeker_id, position, message, status, created_at, updated_at)
VALUES
  (3, '1', 'Software Engineer Offer', 'We would like to invite you to an interview.', 'OPEN', NOW(), NOW());

INSERT INTO job_likes (job_id, user_id, created_at)
VALUES
  (1, 2, NOW()),
  (2, 1, NOW());

INSERT INTO community_likes (user_id, post_id, comment_id, created_at)
VALUES
  (2, 1, NULL, NOW()),
  (1, NULL, 1, NOW());

INSERT INTO community_post_tags (post_id, tag)
VALUES
  (1, 'Introduction'),
  (1, 'Welcome'),
  (2, 'JobTips');

INSERT INTO skill_categories (category_name, created_at, updated_at)
VALUES
  ('Programming Languages', NOW(), NOW()),
  ('Frameworks', NOW(), NOW());

INSERT INTO skills (category_id, skill_name, created_at, updated_at)
VALUES
  (1, 'Java', NOW(), NOW()),
  (1, 'Python', NOW(), NOW()),
  (2, 'Spring Boot', NOW(), NOW()),
  (2, 'React', NOW(), NOW());

INSERT INTO core_competencies (competency_name, created_at, updated_at)
VALUES
  ('Teamwork', NOW(), NOW()),
  ('Problem Solving', NOW(), NOW());

INSERT INTO job_posting_skills (job_id, skill_id, created_at, updated_at)
VALUES
  (1, 1, NOW(), NOW()),
  (1, 3, NOW(), NOW()),
  (2, 2, NOW(), NOW()),
  (2, 4, NOW(), NOW());

INSERT INTO job_posting_competencies (job_id, competency_id, created_at, updated_at)
VALUES
  (1, 1, NOW(), NOW()),
  (1, 2, NOW(), NOW()),
  (2, 1, NOW(), NOW());
