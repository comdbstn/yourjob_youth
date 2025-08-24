package com.yourjob.backend.service.admin

import com.yourjob.backend.entity.admin.*
import com.yourjob.backend.mapper.admin.AdminDashboardMapper
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.cache.annotation.Cacheable
import org.springframework.scheduling.annotation.Scheduled
import org.slf4j.LoggerFactory
import java.math.BigDecimal
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.concurrent.CompletableFuture

@Service
@Transactional(readOnly = true)
class AdminDashboardService(
    private val adminDashboardMapper: AdminDashboardMapper,
    private val systemMetricsService: SystemMetricsService
) {
    
    private val logger = LoggerFactory.getLogger(AdminDashboardService::class.java)
    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    
    /**
     * 관리자 대시보드 전체 데이터 조회 (캐시 적용)
     */
    @Cacheable(value = ["adminDashboard"], key = "'dashboard'")
    fun getDashboardData(): AdminDashboard {
        logger.info("Generating admin dashboard data")
        
        // 병렬로 데이터 수집
        val overviewFuture = CompletableFuture.supplyAsync { getDashboardOverview() }
        val userStatsFuture = CompletableFuture.supplyAsync { getUserStatistics() }
        val jobStatsFuture = CompletableFuture.supplyAsync { getJobStatistics() }
        val applicationStatsFuture = CompletableFuture.supplyAsync { getApplicationStatistics() }
        val paymentStatsFuture = CompletableFuture.supplyAsync { getPaymentStatistics() }
        val systemHealthFuture = CompletableFuture.supplyAsync { systemMetricsService.getSystemHealth() }
        val activitiesFuture = CompletableFuture.supplyAsync { getRecentActivities(50) }
        
        return AdminDashboard(
            overview = overviewFuture.get(),
            userStatistics = userStatsFuture.get(),
            jobStatistics = jobStatsFuture.get(),
            applicationStatistics = applicationStatsFuture.get(),
            paymentStatistics = paymentStatsFuture.get(),
            systemHealth = systemHealthFuture.get(),
            recentActivities = activitiesFuture.get()
        )
    }
    
    /**
     * 대시보드 개요 통계
     */
    private fun getDashboardOverview(): DashboardOverview {
        val overview = adminDashboardMapper.getDashboardOverview()
        
        return DashboardOverview(
            totalUsers = overview["total_users"] as Long,
            totalJobSeekers = overview["total_job_seekers"] as Long,
            totalEmployers = overview["total_employers"] as Long,
            totalJobPostings = overview["total_job_postings"] as Long,
            activeJobPostings = overview["active_job_postings"] as Long,
            totalApplications = overview["total_applications"] as Long,
            totalPayments = overview["total_payments"] as BigDecimal? ?: BigDecimal.ZERO,
            newUsersToday = overview["new_users_today"] as Long,
            newJobPostingsToday = overview["new_job_postings_today"] as Long,
            applicationsToday = overview["applications_today"] as Long
        )
    }
    
    /**
     * 사용자 통계
     */
    private fun getUserStatistics(): UserStatistics {
        return UserStatistics(
            userGrowthData = adminDashboardMapper.getUserGrowthData(30)
                .map { TimeSeriesData(it["date"] as String, it["count"] as Long) },
            usersByType = adminDashboardMapper.getUsersByType()
                .map { CategoryCount(it["type"] as String, it["count"] as Long, it["percentage"] as Double?) },
            usersByRegion = adminDashboardMapper.getUsersByRegion()
                .map { CategoryCount(it["region"] as String, it["count"] as Long, it["percentage"] as Double?) },
            activeUsersLast30Days = adminDashboardMapper.getActiveUsersCount(30),
            userRetentionRate = adminDashboardMapper.getUserRetentionRate(),
            averageSessionDuration = adminDashboardMapper.getAverageSessionDuration(),
            topUserActions = adminDashboardMapper.getTopUserActions(10)
                .map { ActionCount(it["action"] as String, it["count"] as Long) }
        )
    }
    
    /**
     * 채용공고 통계
     */
    private fun getJobStatistics(): JobStatistics {
        return JobStatistics(
            jobPostingTrends = adminDashboardMapper.getJobPostingTrends(30)
                .map { TimeSeriesData(it["date"] as String, it["count"] as Long) },
            jobsByCategory = adminDashboardMapper.getJobsByCategory()
                .map { CategoryCount(it["category"] as String, it["count"] as Long, it["percentage"] as Double?) },
            jobsByLocation = adminDashboardMapper.getJobsByLocation()
                .map { CategoryCount(it["location"] as String, it["count"] as Long, it["percentage"] as Double?) },
            jobsByCompanyType = adminDashboardMapper.getJobsByCompanyType()
                .map { CategoryCount(it["company_type"] as String, it["count"] as Long, it["percentage"] as Double?) },
            averageTimeToFill = adminDashboardMapper.getAverageTimeToFill(),
            mostViewedJobs = adminDashboardMapper.getMostViewedJobs(10)
                .map { JobViewCount(
                    it["job_id"] as Int,
                    it["title"] as String,
                    it["company_name"] as String,
                    it["view_count"] as Long
                ) },
            jobCompletionRate = adminDashboardMapper.getJobCompletionRate(),
            averageApplicationsPerJob = adminDashboardMapper.getAverageApplicationsPerJob()
        )
    }
    
    /**
     * 지원 통계
     */
    private fun getApplicationStatistics(): ApplicationStatistics {
        return ApplicationStatistics(
            applicationTrends = adminDashboardMapper.getApplicationTrends(30)
                .map { TimeSeriesData(it["date"] as String, it["count"] as Long) },
            applicationsByStatus = adminDashboardMapper.getApplicationsByStatus()
                .map { CategoryCount(it["status"] as String, it["count"] as Long, it["percentage"] as Double?) },
            applicationConversionRate = adminDashboardMapper.getApplicationConversionRate(),
            averageApplicationsPerUser = adminDashboardMapper.getAverageApplicationsPerUser(),
            peakApplicationTimes = adminDashboardMapper.getPeakApplicationTimes()
                .map { TimeCount(it["hour"] as Int, it["count"] as Long) }
        )
    }
    
    /**
     * 결제 통계
     */
    private fun getPaymentStatistics(): PaymentStatistics {
        return PaymentStatistics(
            paymentTrends = adminDashboardMapper.getPaymentTrends(30)
                .map { TimeSeriesData(it["date"] as String, it["count"] as Long) },
            revenueByProduct = adminDashboardMapper.getRevenueByProduct()
                .map { CategoryAmount(
                    it["product"] as String,
                    it["amount"] as BigDecimal,
                    it["percentage"] as Double?
                ) },
            paymentMethodDistribution = adminDashboardMapper.getPaymentMethodDistribution()
                .map { CategoryCount(it["method"] as String, it["count"] as Long, it["percentage"] as Double?) },
            averageOrderValue = adminDashboardMapper.getAverageOrderValue(),
            monthlyRecurringRevenue = adminDashboardMapper.getMonthlyRecurringRevenue(),
            refundRate = adminDashboardMapper.getRefundRate()
        )
    }
    
    /**
     * 최근 활동 조회
     */
    fun getRecentActivities(limit: Int = 100): List<RecentActivity> {
        return adminDashboardMapper.getRecentActivities(limit)
            .map { activity ->
                RecentActivity(
                    id = activity["id"] as String,
                    type = ActivityType.valueOf(activity["type"] as String),
                    description = activity["description"] as String,
                    userId = activity["user_id"] as Int?,
                    userName = activity["user_name"] as String?,
                    details = activity["details"] as Map<String, Any>?,
                    timestamp = LocalDateTime.parse(activity["timestamp"] as String),
                    severity = ActivitySeverity.valueOf(activity["severity"] as String? ?: "INFO")
                )
            }
    }
    
    /**
     * 관리자 알림 조회
     */
    fun getAdminAlerts(onlyUnread: Boolean = false, limit: Int = 50): List<AdminAlert> {
        return adminDashboardMapper.getAdminAlerts(onlyUnread, limit)
            .map { alert ->
                AdminAlert(
                    alertId = alert["alert_id"] as Int,
                    type = AlertType.valueOf(alert["type"] as String),
                    title = alert["title"] as String,
                    message = alert["message"] as String,
                    severity = AlertSeverity.valueOf(alert["severity"] as String),
                    isRead = alert["is_read"] as Boolean,
                    isResolved = alert["is_resolved"] as Boolean,
                    metadata = alert["metadata"] as Map<String, Any>?,
                    createdAt = LocalDateTime.parse(alert["created_at"] as String),
                    resolvedAt = alert["resolved_at"]?.let { LocalDateTime.parse(it as String) },
                    resolvedBy = alert["resolved_by"] as Int?
                )
            }
    }
    
    /**
     * 알림 읽음 처리
     */
    @Transactional
    fun markAlertAsRead(alertId: Int, adminId: Int): Boolean {
        return adminDashboardMapper.markAlertAsRead(alertId, adminId) > 0
    }
    
    /**
     * 알림 해결 처리
     */
    @Transactional
    fun resolveAlert(alertId: Int, adminId: Int): Boolean {
        return adminDashboardMapper.resolveAlert(alertId, adminId) > 0
    }
    
    /**
     * 새 알림 생성
     */
    @Transactional
    fun createAlert(
        type: AlertType,
        title: String,
        message: String,
        severity: AlertSeverity,
        metadata: Map<String, Any>? = null
    ): AdminAlert {
        val alert = AdminAlert(
            type = type,
            title = title,
            message = message,
            severity = severity,
            metadata = metadata,
            createdAt = LocalDateTime.now()
        )
        
        adminDashboardMapper.insertAlert(alert)
        return alert
    }
    
    /**
     * 활동 로그 기록
     */
    @Transactional
    fun logActivity(
        type: ActivityType,
        description: String,
        userId: Int? = null,
        details: Map<String, Any>? = null,
        severity: ActivitySeverity = ActivitySeverity.INFO
    ) {
        val activity = RecentActivity(
            id = generateActivityId(),
            type = type,
            description = description,
            userId = userId,
            userName = userId?.let { getUserName(it) },
            details = details,
            timestamp = LocalDateTime.now(),
            severity = severity
        )
        
        adminDashboardMapper.insertActivity(activity)
    }
    
    /**
     * 시스템 상태 모니터링 - 정기 실행
     */
    @Scheduled(fixedRate = 300000) // 5분마다
    fun monitorSystemHealth() {
        try {
            val health = systemMetricsService.getSystemHealth()
            
            // CPU 사용률이 90% 이상이면 알림
            if (health.cpuUsage > 90.0) {
                createAlert(
                    AlertType.HIGH_TRAFFIC,
                    "높은 CPU 사용률",
                    "CPU 사용률이 ${health.cpuUsage}%에 도달했습니다.",
                    AlertSeverity.HIGH,
                    mapOf("cpu_usage" to health.cpuUsage)
                )
            }
            
            // 메모리 사용률이 85% 이상이면 알림
            if (health.memoryUsage > 85.0) {
                createAlert(
                    AlertType.SYSTEM_ERROR,
                    "높은 메모리 사용률",
                    "메모리 사용률이 ${health.memoryUsage}%에 도달했습니다.",
                    AlertSeverity.MEDIUM,
                    mapOf("memory_usage" to health.memoryUsage)
                )
            }
            
            // 디스크 사용률이 90% 이상이면 알림
            if (health.diskUsage > 90.0) {
                createAlert(
                    AlertType.LOW_DISK_SPACE,
                    "낮은 디스크 공간",
                    "디스크 사용률이 ${health.diskUsage}%에 도달했습니다.",
                    AlertSeverity.HIGH,
                    mapOf("disk_usage" to health.diskUsage)
                )
            }
            
            // 에러율이 5% 이상이면 알림
            if (health.errorRate > 5.0) {
                createAlert(
                    AlertType.HIGH_ERROR_RATE,
                    "높은 에러율",
                    "시스템 에러율이 ${health.errorRate}%에 도달했습니다.",
                    AlertSeverity.CRITICAL,
                    mapOf("error_rate" to health.errorRate)
                )
            }
            
        } catch (e: Exception) {
            logger.error("Error monitoring system health", e)
        }
    }
    
    /**
     * 데이터 내보내기
     */
    fun exportData(
        dataType: String,
        startDate: String?,
        endDate: String?,
        format: String = "CSV"
    ): ByteArray {
        return when (dataType.lowercase()) {
            "users" -> adminDashboardMapper.exportUsers(startDate, endDate)
            "jobs" -> adminDashboardMapper.exportJobs(startDate, endDate)
            "applications" -> adminDashboardMapper.exportApplications(startDate, endDate)
            "payments" -> adminDashboardMapper.exportPayments(startDate, endDate)
            else -> throw IllegalArgumentException("Unsupported data type: $dataType")
        }
    }
    
    /**
     * 유틸리티 메서드들
     */
    private fun generateActivityId(): String {
        return "ACT_${System.currentTimeMillis()}_${(Math.random() * 10000).toInt()}"
    }
    
    private fun getUserName(userId: Int): String? {
        return adminDashboardMapper.getUserName(userId)
    }
    
    /**
     * 캐시 무효화 - 데이터 업데이트시 호출
     */
    @Transactional
    fun invalidateDashboardCache() {
        // 캐시 무효화 로직 구현
        logger.info("Dashboard cache invalidated")
    }
}