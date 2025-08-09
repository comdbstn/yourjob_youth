-- =====================================================
-- PREMIUM PRODUCTS & PAYMENTS TABLES
-- 프리미엄 상품 및 결제 관리 테이블들
-- =====================================================

USE yourjobdb;

-- =====================================================
-- PREMIUM_PRODUCTS
-- 프리미엄 상품 정보
-- =====================================================
CREATE TABLE IF NOT EXISTS premium_products (
    premium_product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_code VARCHAR(100) NOT NULL UNIQUE, -- PREMIUM_JOB_POST, TOP_EXPOSURE 등
    name VARCHAR(255) NOT NULL,
    description TEXT,
    product_type ENUM('JOB_POST','RESUME','BANNER','COMPANY','TALENT_SEARCH') NOT NULL,
    exposure_type ENUM('TOP','URGENT','FEATURED','PREMIUM','HIGHLIGHT','BANNER') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2), -- 할인가
    period_days INT NOT NULL DEFAULT 7, -- 노출 기간 (일)
    exposure_count INT, -- 노출 횟수 제한 (NULL이면 무제한)
    features JSON, -- 상품 특징/혜택 목록 (JSON 배열)
    is_active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0, -- 정렬 순서
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_premium_products_type (product_type),
    INDEX idx_premium_products_active (is_active)
) ENGINE=InnoDB;

-- =====================================================
-- PREMIUM_PAYMENTS
-- 프리미엄 상품 결제 정보
-- =====================================================
CREATE TABLE IF NOT EXISTS premium_payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company_id INT, -- 기업회원인 경우 (users 테이블의 user_id와 동일할 수 있음)
    job_posting_id INT, -- 채용공고 관련 결제인 경우
    premium_product_id INT NOT NULL,
    payment_key VARCHAR(255) NOT NULL UNIQUE, -- PG사 결제키
    order_id VARCHAR(255) NOT NULL UNIQUE, -- 주문 ID
    order_name VARCHAR(255) NOT NULL, -- 주문명
    amount DECIMAL(10,2) NOT NULL, -- 원래 금액
    actual_amount DECIMAL(10,2) NOT NULL, -- 실제 결제 금액 (할인 적용 후)
    currency VARCHAR(10) DEFAULT 'KRW',
    payment_method ENUM('CARD','VIRTUAL_ACCOUNT','BANK_TRANSFER','MOBILE','KAKAOPAY','NAVERPAY','PAYCO','TOSS') NOT NULL,
    payment_status ENUM('PENDING','IN_PROGRESS','COMPLETED','CANCELLED','FAILED','REFUNDED','PARTIAL_REFUNDED') DEFAULT 'PENDING',
    pg_provider VARCHAR(50), -- TOSS, KAKAOPAY 등
    pg_transaction_id VARCHAR(255), -- PG사 거래 ID
    approved_at DATETIME,
    cancelled_at DATETIME,
    cancel_reason TEXT,
    fail_reason TEXT,
    start_date DATETIME, -- 상품 시작일
    end_date DATETIME, -- 상품 종료일
    is_active TINYINT(1) DEFAULT 1,
    exposure_count INT DEFAULT 0, -- 현재 노출 횟수
    max_exposure_count INT, -- 최대 노출 횟수
    metadata JSON, -- 추가 메타데이터
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_premium_payments_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_premium_payments_job_posting
        FOREIGN KEY (job_posting_id)
        REFERENCES job_postings(job_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_premium_payments_premium_product
        FOREIGN KEY (premium_product_id)
        REFERENCES premium_products(premium_product_id)
        ON DELETE CASCADE,
    INDEX idx_premium_payments_user (user_id),
    INDEX idx_premium_payments_status (payment_status),
    INDEX idx_premium_payments_active (is_active),
    INDEX idx_premium_payments_dates (start_date, end_date)
) ENGINE=InnoDB;

-- =====================================================
-- JOB_POSTING_PREMIUM
-- 채용공고별 프리미엄 서비스 적용 현황
-- =====================================================
CREATE TABLE IF NOT EXISTS job_posting_premium (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_posting_id INT NOT NULL,
    payment_id INT NOT NULL,
    premium_product_id INT NOT NULL,
    exposure_type ENUM('TOP','URGENT','FEATURED','PREMIUM','HIGHLIGHT','BANNER') NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    current_exposure_count INT DEFAULT 0,
    max_exposure_count INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_posting_premium_job
        FOREIGN KEY (job_posting_id)
        REFERENCES job_postings(job_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_job_posting_premium_payment
        FOREIGN KEY (payment_id)
        REFERENCES premium_payments(payment_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_job_posting_premium_product
        FOREIGN KEY (premium_product_id)
        REFERENCES premium_products(premium_product_id)
        ON DELETE CASCADE,
    UNIQUE KEY unique_job_payment (job_posting_id, payment_id),
    INDEX idx_job_posting_premium_active (is_active, start_date, end_date),
    INDEX idx_job_posting_premium_exposure (exposure_type)
) ENGINE=InnoDB;

-- =====================================================
-- PAYMENT_HISTORY
-- 결제 이력 로그
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    status_from ENUM('PENDING','IN_PROGRESS','COMPLETED','CANCELLED','FAILED','REFUNDED','PARTIAL_REFUNDED'),
    status_to ENUM('PENDING','IN_PROGRESS','COMPLETED','CANCELLED','FAILED','REFUNDED','PARTIAL_REFUNDED') NOT NULL,
    reason TEXT,
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_history_payment
        FOREIGN KEY (payment_id)
        REFERENCES premium_payments(payment_id)
        ON DELETE CASCADE,
    INDEX idx_payment_history_payment (payment_id),
    INDEX idx_payment_history_created (created_at)
) ENGINE=InnoDB;

-- Insert sample premium products
INSERT INTO premium_products (product_code, name, description, product_type, exposure_type, price, discount_price, period_days, exposure_count, features, sort_order) VALUES
('TOP_JOB_POST_7D', '채용공고 최상단 노출 (7일)', '채용공고를 7일간 최상단에 노출시켜 더 많은 지원자를 유치하세요', 'JOB_POST', 'TOP', 50000.00, 45000.00, 7, NULL, '["최상단 고정 노출", "검색 결과 우선 노출", "모바일 우선 노출"]', 1),
('TOP_JOB_POST_14D', '채용공고 최상단 노출 (14일)', '채용공고를 14일간 최상단에 노출', 'JOB_POST', 'TOP', 90000.00, 80000.00, 14, NULL, '["최상단 고정 노출", "검색 결과 우선 노출", "모바일 우선 노출", "14일 장기 노출"]', 2),
('URGENT_JOB_POST', '급구 채용공고', '급구 마크로 긴급성을 어필하여 빠른 지원을 유도', 'JOB_POST', 'URGENT', 30000.00, NULL, 7, NULL, '["급구 아이콘 표시", "긴급 채용 섹션 노출", "알림톡 발송"]', 3),
('FEATURED_JOB_POST', '추천 채용공고', '추천 공고 섹션에 노출되어 더 많은 관심을 받으세요', 'JOB_POST', 'FEATURED', 35000.00, 30000.00, 7, NULL, '["추천 섹션 노출", "메인페이지 노출", "검색 우선순위"]', 4),
('PREMIUM_JOB_POST', '프리미엄 채용공고', '다양한 프리미엄 혜택이 포함된 종합 상품', 'JOB_POST', 'PREMIUM', 100000.00, 90000.00, 14, NULL, '["최상단 노출", "급구 표시", "추천 섹션", "하이라이트 효과", "무료 채용 컨설팅"]', 5),
('BANNER_AD_7D', '배너 광고 (7일)', '사이트 상단 배너 영역에 기업 광고 노출', 'BANNER', 'BANNER', 200000.00, 180000.00, 7, 10000, '["메인페이지 배너", "모든 페이지 노출", "클릭 통계 제공"]', 6),
('TALENT_SEARCH_30D', '인재검색 서비스 (30일)', '30일간 무제한 이력서 검색 및 스카우트 제안', 'TALENT_SEARCH', 'PREMIUM', 150000.00, 130000.00, 30, NULL, '["무제한 이력서 검색", "스카우트 제안 무제한", "인재 관리 도구"]', 7);

-- Insert sample payments (for testing)
INSERT INTO premium_payments (user_id, premium_product_id, payment_key, order_id, order_name, amount, actual_amount, payment_method, payment_status, start_date, end_date, max_exposure_count) VALUES
(1, 1, 'test_payment_key_001', 'ORDER_20250101_001', '채용공고 최상단 노출 (7일)', 50000.00, 45000.00, 'CARD', 'COMPLETED', '2025-01-01 10:00:00', '2025-01-08 23:59:59', NULL),
(1, 3, 'test_payment_key_002', 'ORDER_20250101_002', '급구 채용공고', 30000.00, 30000.00, 'KAKAOPAY', 'COMPLETED', '2025-01-01 15:00:00', '2025-01-08 23:59:59', NULL);