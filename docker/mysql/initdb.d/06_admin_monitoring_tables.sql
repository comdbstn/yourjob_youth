-- =====================================================
-- 관리자 모니터링 및 시스템 관리 테이블
-- =====================================================

-- 활동 로그 테이블
CREATE TABLE IF NOT EXISTS activity_logs (
    activity_id VARCHAR(100) PRIMARY KEY,
    activity_type ENUM('USER_REGISTRATION','USER_LOGIN','JOB_POSTING_CREATED','JOB_APPLICATION','PAYMENT_COMPLETED','ADMIN_ACTION','SYSTEM_ERROR','SECURITY_ALERT','DATA_EXPORT','USER_SUSPENSION') NOT NULL,
    description TEXT NOT NULL,
    user_id INT,
    metadata JSON,
    severity ENUM('INFO','WARNING','ERROR','CRITICAL') DEFAULT 'INFO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at),
    INDEX idx_user_id (user_id),
    INDEX idx_severity (severity),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 관리자 알림 테이블
CREATE TABLE IF NOT EXISTS admin_alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    alert_type ENUM('SYSTEM_ERROR','HIGH_ERROR_RATE','LOW_DISK_SPACE','SUSPICIOUS_ACTIVITY','PAYMENT_FAILURE','HIGH_TRAFFIC','DATA_INTEGRITY_ISSUE','SECURITY_BREACH','API_RATE_LIMIT_EXCEEDED') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    read_by INT NULL,
    resolved_at TIMESTAMP NULL,
    resolved_by INT NULL,
    INDEX idx_alert_type (alert_type),
    INDEX idx_severity (severity),
    INDEX idx_is_read (is_read),
    INDEX idx_is_resolved (is_resolved),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (read_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 사용자 세션 테이블
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_user_id (user_id),
    INDEX idx_last_activity (last_activity),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API 메트릭 테이블 (응답시간, 에러율 추적)
CREATE TABLE IF NOT EXISTS api_metrics (
    metric_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INT NOT NULL,
    response_time INT NOT NULL, -- 밀리초
    user_id INT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_endpoint (endpoint),
    INDEX idx_status_code (status_code),
    INDEX idx_created_at (created_at),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 검색 로그 테이블
CREATE TABLE IF NOT EXISTS search_logs (
    search_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    query TEXT,
    filters JSON,
    result_count INT NOT NULL DEFAULT 0,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_searched_at (searched_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 시스템 설정 테이블
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT NULL,
    INDEX idx_category (category),
    INDEX idx_is_public (is_public),
    FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 백업 로그 테이블
CREATE TABLE IF NOT EXISTS backup_logs (
    backup_id INT AUTO_INCREMENT PRIMARY KEY,
    backup_type ENUM('FULL','INCREMENTAL','DIFFERENTIAL') NOT NULL,
    file_path VARCHAR(500),
    file_size BIGINT,
    status ENUM('STARTED','IN_PROGRESS','COMPLETED','FAILED') NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    error_message TEXT NULL,
    backup_duration INT NULL, -- 초
    INDEX idx_backup_type (backup_type),
    INDEX idx_status (status),
    INDEX idx_started_at (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 이메일 로그 테이블
CREATE TABLE IF NOT EXISTS email_logs (
    email_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    template_name VARCHAR(100),
    status ENUM('PENDING','SENT','FAILED','BOUNCED') DEFAULT 'PENDING',
    sent_at TIMESTAMP NULL,
    error_message TEXT NULL,
    user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_recipient_email (recipient_email),
    INDEX idx_status (status),
    INDEX idx_sent_at (sent_at),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 사용자 행동 분석 테이블
CREATE TABLE IF NOT EXISTS user_behavior_analytics (
    analytics_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSON,
    page_url VARCHAR(500),
    referrer VARCHAR(500),
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at),
    INDEX idx_session_id (session_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 초기 시스템 설정 데이터
-- =====================================================

INSERT INTO system_settings (setting_key, setting_value, description, category, is_public) VALUES
('site_name', 'YourJob', '사이트 이름', 'general', TRUE),
('site_description', '당신의 꿈의 직장을 찾아보세요', '사이트 설명', 'general', TRUE),
('max_upload_size', '10485760', '최대 업로드 파일 크기 (바이트)', 'upload', FALSE),
('session_timeout', '3600', '세션 타임아웃 (초)', 'security', FALSE),
('password_min_length', '8', '최소 비밀번호 길이', 'security', TRUE),
('max_login_attempts', '5', '최대 로그인 시도 횟수', 'security', FALSE),
('email_verification_required', 'true', '이메일 인증 필수 여부', 'user', TRUE),
('job_posting_approval_required', 'false', '채용공고 승인 필수 여부', 'job', FALSE),
('maintenance_mode', 'false', '점검 모드 활성화 여부', 'system', FALSE),
('api_rate_limit', '1000', 'API 호출 제한 (시간당)', 'api', FALSE),
('notification_email', 'admin@yourjob.com', '알림 수신 이메일', 'notification', FALSE),
('backup_retention_days', '30', '백업 보관 기간 (일)', 'backup', FALSE);

-- =====================================================
-- 샘플 활동 로그 데이터
-- =====================================================

INSERT INTO activity_logs (activity_id, activity_type, description, user_id, severity, created_at) VALUES
('ACT_1732857600_1001', 'USER_REGISTRATION', '새 사용자가 회원가입했습니다', 1, 'INFO', NOW() - INTERVAL 1 HOUR),
('ACT_1732857600_1002', 'JOB_POSTING_CREATED', '새 채용공고가 등록되었습니다', 2, 'INFO', NOW() - INTERVAL 2 HOUR),
('ACT_1732857600_1003', 'JOB_APPLICATION', '새 지원이 접수되었습니다', 3, 'INFO', NOW() - INTERVAL 3 HOUR),
('ACT_1732857600_1004', 'PAYMENT_COMPLETED', '결제가 완료되었습니다', 2, 'INFO', NOW() - INTERVAL 4 HOUR),
('ACT_1732857600_1005', 'SYSTEM_ERROR', '데이터베이스 연결 오류가 발생했습니다', NULL, 'ERROR', NOW() - INTERVAL 5 HOUR);

-- =====================================================
-- 샘플 관리자 알림 데이터
-- =====================================================

INSERT INTO admin_alerts (alert_type, title, message, severity, created_at) VALUES
('HIGH_TRAFFIC', '높은 트래픽 감지', '현재 동시 접속자 수가 평소의 3배를 넘었습니다.', 'MEDIUM', NOW() - INTERVAL 30 MINUTE),
('PAYMENT_FAILURE', '결제 실패율 증가', '최근 1시간 결제 실패율이 5%를 넘었습니다.', 'HIGH', NOW() - INTERVAL 1 HOUR),
('SECURITY_BREACH', '의심스러운 로그인 시도', 'IP 192.168.1.100에서 반복적인 로그인 실패가 감지되었습니다.', 'CRITICAL', NOW() - INTERVAL 2 HOUR);

-- =====================================================
-- 인덱스 최적화
-- =====================================================

-- 복합 인덱스 추가
CREATE INDEX idx_activity_logs_type_date ON activity_logs(activity_type, created_at);
CREATE INDEX idx_admin_alerts_unread ON admin_alerts(is_read, severity, created_at);
CREATE INDEX idx_api_metrics_endpoint_date ON api_metrics(endpoint, created_at);
CREATE INDEX idx_user_sessions_user_active ON user_sessions(user_id, is_active, last_activity);
CREATE INDEX idx_search_logs_user_date ON search_logs(user_id, searched_at);
CREATE INDEX idx_user_behavior_user_event ON user_behavior_analytics(user_id, event_type, created_at);