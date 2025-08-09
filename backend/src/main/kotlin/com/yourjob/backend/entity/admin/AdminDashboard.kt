package com.yourjob.backend.entity.admin

import java.math.BigDecimal
import java.time.LocalDateTime

data class AdminDashboard(
    val overview: DashboardOverview,
    val userStatistics: UserStatistics,
    val jobStatistics: JobStatistics,
    val applicationStatistics: ApplicationStatistics,
    val paymentStatistics: PaymentStatistics,
    val systemHealth: SystemHealth,
    val recentActivities: List<RecentActivity>
)

data class DashboardOverview(
    val totalUsers: Long,
    val totalJobSeekers: Long,
    val totalEmployers: Long,
    val totalJobPostings: Long,
    val activeJobPostings: Long,
    val totalApplications: Long,
    val totalPayments: BigDecimal,
    val newUsersToday: Long,
    val newJobPostingsToday: Long,
    val applicationsToday: Long
)

data class UserStatistics(
    val userGrowthData: List<TimeSeriesData>, // 사용자 증가 추이
    val usersByType: List<CategoryCount>, // 사용자 타입별 분포
    val usersByRegion: List<CategoryCount>, // 지역별 사용자 분포
    val activeUsersLast30Days: Long,
    val userRetentionRate: Double, // 사용자 리텐션율
    val averageSessionDuration: Double, // 평균 세션 시간 (분)
    val topUserActions: List<ActionCount> // 주요 사용자 행동
)

data class JobStatistics(
    val jobPostingTrends: List<TimeSeriesData>, // 채용공고 등록 추이
    val jobsByCategory: List<CategoryCount>, // 직무별 분포
    val jobsByLocation: List<CategoryCount>, // 지역별 분포
    val jobsByCompanyType: List<CategoryCount>, // 기업 유형별 분포
    val averageTimeToFill: Double, // 평균 채용 소요 시간 (일)
    val mostViewedJobs: List<JobViewCount>, // 인기 채용공고
    val jobCompletionRate: Double, // 채용 완료율
    val averageApplicationsPerJob: Double // 공고당 평균 지원자 수
)

data class ApplicationStatistics(
    val applicationTrends: List<TimeSeriesData>, // 지원 추이
    val applicationsByStatus: List<CategoryCount>, // 지원 상태별 분포
    val applicationConversionRate: Double, // 지원-합격 전환율
    val averageApplicationsPerUser: Double, // 사용자당 평균 지원 수
    val peakApplicationTimes: List<TimeCount> // 지원 몰리는 시간대
)

data class PaymentStatistics(
    val paymentTrends: List<TimeSeriesData>, // 결제 추이
    val revenueByProduct: List<CategoryAmount>, // 상품별 매출
    val paymentMethodDistribution: List<CategoryCount>, // 결제 방법별 분포
    val averageOrderValue: BigDecimal, // 평균 주문 금액
    val monthlyRecurringRevenue: BigDecimal, // 월 반복 매출
    val refundRate: Double // 환불율
)

data class SystemHealth(
    val cpuUsage: Double,
    val memoryUsage: Double,
    val diskUsage: Double,
    val activeConnections: Int,
    val averageResponseTime: Double, // 밀리초
    val errorRate: Double, // 에러율 (%)
    val uptime: Long, // 업타임 (초)
    val lastHealthCheck: LocalDateTime
)

data class RecentActivity(
    val id: String,
    val type: ActivityType,
    val description: String,
    val userId: Int?,
    val userName: String?,
    val details: Map<String, Any>?,
    val timestamp: LocalDateTime,
    val severity: ActivitySeverity = ActivitySeverity.INFO
)

enum class ActivityType {
    USER_REGISTRATION,
    USER_LOGIN,
    JOB_POSTING_CREATED,
    JOB_APPLICATION,
    PAYMENT_COMPLETED,
    ADMIN_ACTION,
    SYSTEM_ERROR,
    SECURITY_ALERT,
    DATA_EXPORT,
    USER_SUSPENSION
}

enum class ActivitySeverity {
    INFO,
    WARNING,
    ERROR,
    CRITICAL
}

data class TimeSeriesData(
    val date: String,
    val value: Long
)

data class CategoryCount(
    val category: String,
    val count: Long,
    val percentage: Double? = null
)

data class CategoryAmount(
    val category: String,
    val amount: BigDecimal,
    val percentage: Double? = null
)

data class ActionCount(
    val action: String,
    val count: Long
)

data class JobViewCount(
    val jobId: Int,
    val title: String,
    val companyName: String,
    val viewCount: Long
)

data class TimeCount(
    val hour: Int,
    val count: Long
)

data class AdminAlert(
    val alertId: Int? = null,
    val type: AlertType,
    val title: String,
    val message: String,
    val severity: AlertSeverity,
    val isRead: Boolean = false,
    val isResolved: Boolean = false,
    val metadata: Map<String, Any>? = null,
    val createdAt: LocalDateTime,
    val resolvedAt: LocalDateTime? = null,
    val resolvedBy: Int? = null
)

enum class AlertType {
    SYSTEM_ERROR,
    HIGH_ERROR_RATE,
    LOW_DISK_SPACE,
    SUSPICIOUS_ACTIVITY,
    PAYMENT_FAILURE,
    HIGH_TRAFFIC,
    DATA_INTEGRITY_ISSUE,
    SECURITY_BREACH,
    API_RATE_LIMIT_EXCEEDED
}

enum class AlertSeverity {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}