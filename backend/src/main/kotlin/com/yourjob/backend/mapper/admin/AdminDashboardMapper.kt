package com.yourjob.backend.mapper.admin

import com.yourjob.backend.entity.admin.AdminAlert
import com.yourjob.backend.entity.admin.RecentActivity
import org.apache.ibatis.annotations.*
import java.math.BigDecimal

@Mapper
interface AdminDashboardMapper {
    
    // 대시보드 개요 통계
    @Select("""
        SELECT 
            (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
            (SELECT COUNT(*) FROM users WHERE user_type = 'jobseeker' AND deleted_at IS NULL) as total_job_seekers,
            (SELECT COUNT(*) FROM users WHERE user_type = 'company' AND deleted_at IS NULL) as total_employers,
            (SELECT COUNT(*) FROM job_postings WHERE deleted_at IS NULL) as total_job_postings,
            (SELECT COUNT(*) FROM job_postings WHERE is_active = 1 AND deleted_at IS NULL) as active_job_postings,
            (SELECT COUNT(*) FROM job_applications WHERE deleted_at IS NULL) as total_applications,
            (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'SUCCESS') as total_payments,
            (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE() AND deleted_at IS NULL) as new_users_today,
            (SELECT COUNT(*) FROM job_postings WHERE DATE(created_at) = CURDATE() AND deleted_at IS NULL) as new_job_postings_today,
            (SELECT COUNT(*) FROM job_applications WHERE DATE(created_at) = CURDATE() AND deleted_at IS NULL) as applications_today
    """)
    fun getDashboardOverview(): Map<String, Any>
    
    // 사용자 증가 추이
    @Select("""
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
        FROM users 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL #{days} DAY) 
        AND deleted_at IS NULL
        GROUP BY DATE(created_at) 
        ORDER BY date DESC
    """)
    fun getUserGrowthData(@Param("days") days: Int): List<Map<String, Any>>
    
    // 사용자 타입별 분포
    @Select("""
        SELECT 
            user_type as type,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL), 2) as percentage
        FROM users 
        WHERE deleted_at IS NULL
        GROUP BY user_type
    """)
    fun getUsersByType(): List<Map<String, Any>>
    
    // 지역별 사용자 분포
    @Select("""
        SELECT 
            COALESCE(region, '미지정') as region,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL), 2) as percentage
        FROM users 
        WHERE deleted_at IS NULL
        GROUP BY region
        ORDER BY count DESC
        LIMIT 10
    """)
    fun getUsersByRegion(): List<Map<String, Any>>
    
    // 활성 사용자 수 (최근 N일)
    @Select("""
        SELECT COUNT(DISTINCT user_id) 
        FROM user_sessions 
        WHERE last_activity >= DATE_SUB(NOW(), INTERVAL #{days} DAY)
    """)
    fun getActiveUsersCount(@Param("days") days: Int): Long
    
    // 사용자 리텐션율
    @Select("""
        SELECT 
            ROUND(
                (SELECT COUNT(DISTINCT user_id) FROM user_sessions WHERE last_activity >= DATE_SUB(NOW(), INTERVAL 30 DAY)) * 100.0 / 
                (SELECT COUNT(*) FROM users WHERE created_at <= DATE_SUB(NOW(), INTERVAL 30 DAY) AND deleted_at IS NULL), 
                2
            ) as retention_rate
    """)
    fun getUserRetentionRate(): Double
    
    // 평균 세션 시간 (분)
    @Select("""
        SELECT COALESCE(AVG(TIMESTAMPDIFF(MINUTE, created_at, last_activity)), 0)
        FROM user_sessions
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    """)
    fun getAverageSessionDuration(): Double
    
    // 주요 사용자 행동
    @Select("""
        SELECT 
            action,
            COUNT(*) as count
        FROM activity_logs 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY action 
        ORDER BY count DESC 
        LIMIT #{limit}
    """)
    fun getTopUserActions(@Param("limit") limit: Int): List<Map<String, Any>>
    
    // 채용공고 등록 추이
    @Select("""
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
        FROM job_postings 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL #{days} DAY) 
        AND deleted_at IS NULL
        GROUP BY DATE(created_at) 
        ORDER BY date DESC
    """)
    fun getJobPostingTrends(@Param("days") days: Int): List<Map<String, Any>>
    
    // 직무별 채용공고 분포
    @Select("""
        SELECT 
            COALESCE(job_category, '기타') as category,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM job_postings WHERE deleted_at IS NULL), 2) as percentage
        FROM job_postings 
        WHERE deleted_at IS NULL
        GROUP BY job_category
        ORDER BY count DESC
        LIMIT 10
    """)
    fun getJobsByCategory(): List<Map<String, Any>>
    
    // 지역별 채용공고 분포
    @Select("""
        SELECT 
            COALESCE(location, '미지정') as location,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM job_postings WHERE deleted_at IS NULL), 2) as percentage
        FROM job_postings 
        WHERE deleted_at IS NULL
        GROUP BY location
        ORDER BY count DESC
        LIMIT 10
    """)
    fun getJobsByLocation(): List<Map<String, Any>>
    
    // 기업 유형별 채용공고 분포
    @Select("""
        SELECT 
            COALESCE(cp.company_type, '미지정') as company_type,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM job_postings WHERE deleted_at IS NULL), 2) as percentage
        FROM job_postings jp
        LEFT JOIN company_profiles cp ON jp.company_id = cp.company_id
        WHERE jp.deleted_at IS NULL
        GROUP BY cp.company_type
        ORDER BY count DESC
    """)
    fun getJobsByCompanyType(): List<Map<String, Any>>
    
    // 평균 채용 소요 시간 (일)
    @Select("""
        SELECT COALESCE(AVG(DATEDIFF(updated_at, created_at)), 0)
        FROM job_postings 
        WHERE status = 'CLOSED' 
        AND closed_reason = 'HIRED'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
    """)
    fun getAverageTimeToFill(): Double
    
    // 인기 채용공고 (조회수 기준)
    @Select("""
        SELECT 
            jp.job_id,
            jp.title,
            cp.company_name,
            jp.views as view_count
        FROM job_postings jp
        LEFT JOIN company_profiles cp ON jp.company_id = cp.company_id
        WHERE jp.deleted_at IS NULL
        ORDER BY jp.views DESC
        LIMIT #{limit}
    """)
    fun getMostViewedJobs(@Param("limit") limit: Int): List<Map<String, Any>>
    
    // 채용 완료율
    @Select("""
        SELECT 
            ROUND(
                COUNT(CASE WHEN status = 'CLOSED' AND closed_reason = 'HIRED' THEN 1 END) * 100.0 / COUNT(*), 
                2
            )
        FROM job_postings 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
        AND deleted_at IS NULL
    """)
    fun getJobCompletionRate(): Double
    
    // 공고당 평균 지원자 수
    @Select("""
        SELECT COALESCE(AVG(application_count), 0)
        FROM (
            SELECT COUNT(*) as application_count
            FROM job_applications ja
            INNER JOIN job_postings jp ON ja.job_id = jp.job_id
            WHERE ja.deleted_at IS NULL AND jp.deleted_at IS NULL
            GROUP BY ja.job_id
        ) t
    """)
    fun getAverageApplicationsPerJob(): Double
    
    // 지원 추이
    @Select("""
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
        FROM job_applications 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL #{days} DAY) 
        AND deleted_at IS NULL
        GROUP BY DATE(created_at) 
        ORDER BY date DESC
    """)
    fun getApplicationTrends(@Param("days") days: Int): List<Map<String, Any>>
    
    // 지원 상태별 분포
    @Select("""
        SELECT 
            status,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM job_applications WHERE deleted_at IS NULL), 2) as percentage
        FROM job_applications 
        WHERE deleted_at IS NULL
        GROUP BY status
    """)
    fun getApplicationsByStatus(): List<Map<String, Any>>
    
    // 지원-합격 전환율
    @Select("""
        SELECT 
            ROUND(
                COUNT(CASE WHEN status IN ('ACCEPTED', 'HIRED') THEN 1 END) * 100.0 / COUNT(*), 
                2
            )
        FROM job_applications 
        WHERE deleted_at IS NULL
        AND created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
    """)
    fun getApplicationConversionRate(): Double
    
    // 사용자당 평균 지원 수
    @Select("""
        SELECT COALESCE(AVG(application_count), 0)
        FROM (
            SELECT COUNT(*) as application_count
            FROM job_applications
            WHERE deleted_at IS NULL
            GROUP BY user_id
        ) t
    """)
    fun getAverageApplicationsPerUser(): Double
    
    // 지원 몰리는 시간대
    @Select("""
        SELECT 
            HOUR(created_at) as hour,
            COUNT(*) as count
        FROM job_applications 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND deleted_at IS NULL
        GROUP BY HOUR(created_at)
        ORDER BY count DESC
    """)
    fun getPeakApplicationTimes(): List<Map<String, Any>>
    
    // 결제 추이
    @Select("""
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
        FROM payments 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL #{days} DAY) 
        AND status = 'SUCCESS'
        GROUP BY DATE(created_at) 
        ORDER BY date DESC
    """)
    fun getPaymentTrends(@Param("days") days: Int): List<Map<String, Any>>
    
    // 상품별 매출
    @Select("""
        SELECT 
            pp.product_name as product,
            SUM(p.amount) as amount,
            ROUND(SUM(p.amount) * 100.0 / (SELECT SUM(amount) FROM payments WHERE status = 'SUCCESS'), 2) as percentage
        FROM payments p
        INNER JOIN premium_products pp ON p.product_id = pp.premium_product_id
        WHERE p.status = 'SUCCESS'
        GROUP BY pp.premium_product_id, pp.product_name
        ORDER BY amount DESC
    """)
    fun getRevenueByProduct(): List<Map<String, Any>>
    
    // 결제 방법별 분포
    @Select("""
        SELECT 
            payment_method as method,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM payments WHERE status = 'SUCCESS'), 2) as percentage
        FROM payments 
        WHERE status = 'SUCCESS'
        GROUP BY payment_method
    """)
    fun getPaymentMethodDistribution(): List<Map<String, Any>>
    
    // 평균 주문 금액
    @Select("""
        SELECT COALESCE(AVG(amount), 0)
        FROM payments 
        WHERE status = 'SUCCESS'
    """)
    fun getAverageOrderValue(): BigDecimal
    
    // 월 반복 매출 (구독형 상품)
    @Select("""
        SELECT COALESCE(SUM(amount), 0)
        FROM payments p
        INNER JOIN premium_products pp ON p.product_id = pp.premium_product_id
        WHERE p.status = 'SUCCESS'
        AND pp.is_subscription = 1
        AND p.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    """)
    fun getMonthlyRecurringRevenue(): BigDecimal
    
    // 환불율
    @Select("""
        SELECT 
            ROUND(
                COUNT(CASE WHEN status = 'REFUNDED' THEN 1 END) * 100.0 / COUNT(*), 
                2
            )
        FROM payments
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
    """)
    fun getRefundRate(): Double
    
    // 최근 활동 조회
    @Select("""
        SELECT 
            al.activity_id as id,
            al.activity_type as type,
            al.description,
            al.user_id,
            u.name as user_name,
            al.metadata as details,
            al.created_at as timestamp,
            COALESCE(al.severity, 'INFO') as severity
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.user_id
        ORDER BY al.created_at DESC
        LIMIT #{limit}
    """)
    fun getRecentActivities(@Param("limit") limit: Int): List<Map<String, Any>>
    
    // 관리자 알림 조회
    @Select("""
        <script>
        SELECT 
            alert_id,
            alert_type as type,
            title,
            message,
            severity,
            is_read,
            is_resolved,
            metadata,
            created_at,
            resolved_at,
            resolved_by
        FROM admin_alerts
        <where>
            <if test="onlyUnread">
                AND is_read = 0
            </if>
        </where>
        ORDER BY created_at DESC
        LIMIT #{limit}
        </script>
    """)
    fun getAdminAlerts(@Param("onlyUnread") onlyUnread: Boolean, @Param("limit") limit: Int): List<Map<String, Any>>
    
    // 알림 읽음 처리
    @Update("""
        UPDATE admin_alerts 
        SET is_read = 1, read_at = NOW(), read_by = #{adminId}
        WHERE alert_id = #{alertId}
    """)
    fun markAlertAsRead(@Param("alertId") alertId: Int, @Param("adminId") adminId: Int): Int
    
    // 알림 해결 처리
    @Update("""
        UPDATE admin_alerts 
        SET is_resolved = 1, resolved_at = NOW(), resolved_by = #{adminId}
        WHERE alert_id = #{alertId}
    """)
    fun resolveAlert(@Param("alertId") alertId: Int, @Param("adminId") adminId: Int): Int
    
    // 새 알림 생성
    @Insert("""
        INSERT INTO admin_alerts (alert_type, title, message, severity, metadata, created_at)
        VALUES (#{type}, #{title}, #{message}, #{severity}, #{metadata}, #{createdAt})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "alertId")
    fun insertAlert(alert: AdminAlert): Int
    
    // 활동 로그 기록
    @Insert("""
        INSERT INTO activity_logs (activity_id, activity_type, description, user_id, metadata, created_at, severity)
        VALUES (#{id}, #{type}, #{description}, #{userId}, #{details}, #{timestamp}, #{severity})
    """)
    fun insertActivity(activity: RecentActivity): Int
    
    // 사용자 이름 조회
    @Select("SELECT name FROM users WHERE user_id = #{userId} AND deleted_at IS NULL")
    fun getUserName(@Param("userId") userId: Int): String?
    
    // 데이터 내보내기 - 사용자
    @Select("""
        <script>
        SELECT 
            user_id, email, name, user_type, region, created_at, last_login_at
        FROM users 
        WHERE deleted_at IS NULL
        <if test="startDate != null">
            AND created_at >= #{startDate}
        </if>
        <if test="endDate != null">
            AND created_at <= #{endDate}
        </if>
        ORDER BY created_at DESC
        </script>
    """)
    fun exportUsers(@Param("startDate") startDate: String?, @Param("endDate") endDate: String?): ByteArray
    
    // 데이터 내보내기 - 채용공고
    @Select("""
        <script>
        SELECT 
            jp.job_id, jp.title, cp.company_name, jp.location, jp.job_category, 
            jp.employment_type, jp.salary, jp.views, jp.created_at
        FROM job_postings jp
        LEFT JOIN company_profiles cp ON jp.company_id = cp.company_id
        WHERE jp.deleted_at IS NULL
        <if test="startDate != null">
            AND jp.created_at >= #{startDate}
        </if>
        <if test="endDate != null">
            AND jp.created_at <= #{endDate}
        </if>
        ORDER BY jp.created_at DESC
        </script>
    """)
    fun exportJobs(@Param("startDate") startDate: String?, @Param("endDate") endDate: String?): ByteArray
    
    // 데이터 내보내기 - 지원
    @Select("""
        <script>
        SELECT 
            ja.application_id, u.name as applicant_name, jp.title as job_title, 
            cp.company_name, ja.status, ja.applied_at
        FROM job_applications ja
        INNER JOIN users u ON ja.user_id = u.user_id
        INNER JOIN job_postings jp ON ja.job_id = jp.job_id
        LEFT JOIN company_profiles cp ON jp.company_id = cp.company_id
        WHERE ja.deleted_at IS NULL
        <if test="startDate != null">
            AND ja.applied_at >= #{startDate}
        </if>
        <if test="endDate != null">
            AND ja.applied_at <= #{endDate}
        </if>
        ORDER BY ja.applied_at DESC
        </script>
    """)
    fun exportApplications(@Param("startDate") startDate: String?, @Param("endDate") endDate: String?): ByteArray
    
    // 데이터 내보내기 - 결제
    @Select("""
        <script>
        SELECT 
            p.payment_id, u.name as user_name, pp.product_name, p.amount, 
            p.payment_method, p.status, p.created_at
        FROM payments p
        INNER JOIN users u ON p.user_id = u.user_id
        INNER JOIN premium_products pp ON p.product_id = pp.premium_product_id
        <if test="startDate != null">
            AND p.created_at >= #{startDate}
        </if>
        <if test="endDate != null">
            AND p.created_at <= #{endDate}
        </if>
        ORDER BY p.created_at DESC
        </script>
    """)
    fun exportPayments(@Param("startDate") startDate: String?, @Param("endDate") endDate: String?): ByteArray
}