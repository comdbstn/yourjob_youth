package com.yourjob.backend.service

import com.yourjob.backend.dto.*
import com.yourjob.backend.repository.mdms.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import com.yourjob.backend.entity.UserType
import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import java.time.temporal.ChronoUnit
import kotlin.math.roundToInt

/**
 * 통계 정보 제공을 위한 서비스
 */
@Service
@Transactional(readOnly = true)
class StatisticsService(
    private val userManagementRepository: UserManagementRepository,
    private val resumeManagementRepository: ResumeManagementRepository,
    private val jobManagementRepository: JobManagementRepository,
    private val jobOfferManagementRepository: JobOfferManagementRepository,
    private val applicationsManagementRepository: ApplicationsManagementRepository,
    @PersistenceContext
    private val entityManager: EntityManager
) {

    /**
     * 대시보드용 요약 통계 정보를 조회합니다.
     * @param period 조회 기간 (7days, 1month, 3months, 6months, 1year, all)
     * @return 통계 요약 정보
     */
    fun getDashboardStatistics(period: String): StatisticsResponse {
        val (startDate, endDate) = getDateRangeForPeriod(period)

        // 사용자 통계 조회
        val userStats = getUserStatistics(startDate, endDate)

        // 이력서 통계 조회
        val resumeStats = getResumeStatistics(startDate, endDate)

        // 채용공고 통계 조회
        val jobStats = getJobStatistics(startDate, endDate)

        // 지원 통계 조회
        val applicationStats = getApplicationStatistics(startDate, endDate)

        // 포지션 제안 통계 조회
        val jobOfferStats = getJobOfferStatistics(startDate, endDate)

        // 통계 응답 생성
        return StatisticsResponse(
            totalUsers = userStats.totalCount,
            individualUsers = userStats.individualCount,
            companyUsers = userStats.companyCount,
            userRatio = UserRatio(
                individualPercentage = userStats.individualPercentage,
                companyPercentage = userStats.companyPercentage
            ),
            dailyNewUsers = userStats.dailyNewCount,
            dailyNewIndividualUsers = userStats.dailyNewIndividualCount,
            dailyNewCompanyUsers = userStats.dailyNewCompanyCount,

            totalResumes = resumeStats.totalCount,
            publicResumes = resumeStats.publicCount,
            privateResumes = resumeStats.privateCount,
            resumeRatio = ResumeRatio(
                publicPercentage = resumeStats.publicPercentage,
                privatePercentage = resumeStats.privatePercentage
            ),

            totalJobs = jobStats.totalCount,
            activeJobs = jobStats.activeCount,
            closedJobs = jobStats.closedCount,
            jobRatio = JobRatio(
                activePercentage = jobStats.activePercentage,
                closedPercentage = jobStats.closedPercentage
            ),

            totalApplications = applicationStats.totalCount,
            activeApplications = applicationStats.activeCount,
            acceptedApplications = applicationStats.acceptedCount,
            rejectedApplications = applicationStats.rejectedCount,
            applicationRatio = ApplicationRatio(
                activePercentage = applicationStats.activePercentage,
                acceptedPercentage = applicationStats.acceptedPercentage,
                rejectedPercentage = applicationStats.rejectedPercentage
            ),

            totalJobOffers = jobOfferStats.totalCount,
            viewedJobOffers = jobOfferStats.viewedCount,
            acceptedJobOffers = jobOfferStats.acceptedCount,
            rejectedJobOffers = jobOfferStats.rejectedCount,
            jobOfferRatio = JobOfferRatio(
                viewedPercentage = jobOfferStats.viewedPercentage,
                acceptedPercentage = jobOfferStats.acceptedPercentage,
                rejectedPercentage = jobOfferStats.rejectedPercentage
            ),

            periodStart = startDate.format(DateTimeFormatter.ISO_DATE),
            periodEnd = endDate.format(DateTimeFormatter.ISO_DATE),
            period = period
        )
    }

    /**
     * 월별 사용자 증가 추이 데이터를 조회합니다.
     * @param months 조회할 개월 수
     * @return 월별 사용자 증가 데이터
     */
    fun getUserGrowthData(months: Int): ChartDataResponse {
        val now = LocalDate.now()
        val startDate = now.minusMonths(months.toLong() - 1).withDayOfMonth(1)

        val labels = mutableListOf<String>()
        val individualData = mutableListOf<Int>()
        val companyData = mutableListOf<Int>()
        val totalData = mutableListOf<Int>()

        var current = startDate
        while (!current.isAfter(now.withDayOfMonth(now.lengthOfMonth()))) {
            val monthEnd = current.withDayOfMonth(current.lengthOfMonth())
            val monthLabel = current.format(DateTimeFormatter.ofPattern("yyyy-MM"))

            // 해당 월에 가입한 사용자 수 조회
            val individualCount = getUserCountByTypeAndMonth(UserType.JOB_SEEKER, current, monthEnd)

            // 기업 회원 수는 COMPANY와 COMPANY_EXCEL 유형의 합계
            val companyCount = getUserCountByTypeAndMonth(UserType.COMPANY, current, monthEnd) +
                    getUserCountByTypeAndMonth(UserType.COMPANY_EXCEL, current, monthEnd)

            labels.add(monthLabel)
            individualData.add(individualCount)
            companyData.add(companyCount)
            totalData.add(individualCount + companyCount)

            current = current.plusMonths(1)
        }

        val datasets = listOf(
            ChartDataset(
                label = "전체 사용자",
                data = totalData,
                borderColor = "#4e73df",
                backgroundColor = listOf("#4e73df20"),
                fill = true
            ),
            ChartDataset(
                label = "개인 사용자",
                data = individualData,
                borderColor = "#36b9cc",
                backgroundColor = listOf("#36b9cc20"),
                fill = true
            ),
            ChartDataset(
                label = "기업 사용자",
                data = companyData,
                borderColor = "#1cc88a",
                backgroundColor = listOf("#1cc88a20"),
                fill = true
            )
        )

        return ChartDataResponse(
            labels = labels,
            datasets = datasets,
            type = "line"
        )
    }

    /**
     * 사용자 유형(개인/기업) 분포 데이터를 조회합니다.
     * @param period 조회 기간
     * @return 사용자 유형 분포 데이터
     */
    fun getUserTypeDistribution(period: String): ChartDataResponse {
        val (startDate, endDate) = getDateRangeForPeriod(period)
        val userStats = getUserStatistics(startDate, endDate)

        val labels = listOf("개인 사용자", "기업 사용자")
        val data = listOf(userStats.individualCount, userStats.companyCount)
        val backgroundColor = listOf("#4e73df", "#1cc88a")

        val datasets = listOf(
            ChartDataset(
                label = "사용자 유형",
                data = data,
                backgroundColor = backgroundColor
            )
        )

        return ChartDataResponse(
            labels = labels,
            datasets = datasets,
            type = "pie"
        )
    }

    /**
     * 채용공고 상태(진행중/마감) 분포 데이터를 조회합니다.
     * @param period 조회 기간
     * @return 채용공고 상태 분포 데이터
     */
    fun getJobStatusDistribution(period: String): ChartDataResponse {
        val (startDate, endDate) = getDateRangeForPeriod(period)
        val jobStats = getJobStatistics(startDate, endDate)

        val labels = listOf("진행중", "마감")
        val data = listOf(jobStats.activeCount, jobStats.closedCount)
        val backgroundColor = listOf("#36b9cc", "#e74a3b")

        val datasets = listOf(
            ChartDataset(
                label = "채용공고 상태",
                data = data,
                backgroundColor = backgroundColor
            )
        )

        return ChartDataResponse(
            labels = labels,
            datasets = datasets,
            type = "pie"
        )
    }

    /**
     * 특정 날짜 범위의 통계 데이터를 조회합니다.
     * @param startDate 시작 날짜
     * @param endDate 종료 날짜
     * @return 날짜 범위 기반 통계 데이터
     */
    fun getStatisticsByDateRange(startDate: LocalDate, endDate: LocalDate): StatisticsResponse {
        val period = "custom"

        // 사용자 통계 조회
        val userStats = getUserStatistics(startDate, endDate)

        // 이력서 통계 조회
        val resumeStats = getResumeStatistics(startDate, endDate)

        // 채용공고 통계 조회
        val jobStats = getJobStatistics(startDate, endDate)

        // 지원 통계 조회
        val applicationStats = getApplicationStatistics(startDate, endDate)

        // 포지션 제안 통계 조회
        val jobOfferStats = getJobOfferStatistics(startDate, endDate)

        // 통계 응답 생성
        return StatisticsResponse(
            totalUsers = userStats.totalCount,
            individualUsers = userStats.individualCount,
            companyUsers = userStats.companyCount,
            userRatio = UserRatio(
                individualPercentage = userStats.individualPercentage,
                companyPercentage = userStats.companyPercentage
            ),
            dailyNewUsers = userStats.dailyNewCount,
            dailyNewIndividualUsers = userStats.dailyNewIndividualCount,
            dailyNewCompanyUsers = userStats.dailyNewCompanyCount,

            totalResumes = resumeStats.totalCount,
            publicResumes = resumeStats.publicCount,
            privateResumes = resumeStats.privateCount,
            resumeRatio = ResumeRatio(
                publicPercentage = resumeStats.publicPercentage,
                privatePercentage = resumeStats.privatePercentage
            ),

            totalJobs = jobStats.totalCount,
            activeJobs = jobStats.activeCount,
            closedJobs = jobStats.closedCount,
            jobRatio = JobRatio(
                activePercentage = jobStats.activePercentage,
                closedPercentage = jobStats.closedPercentage
            ),

            totalApplications = applicationStats.totalCount,
            activeApplications = applicationStats.activeCount,
            acceptedApplications = applicationStats.acceptedCount,
            rejectedApplications = applicationStats.rejectedCount,
            applicationRatio = ApplicationRatio(
                activePercentage = applicationStats.activePercentage,
                acceptedPercentage = applicationStats.acceptedPercentage,
                rejectedPercentage = applicationStats.rejectedPercentage
            ),

            totalJobOffers = jobOfferStats.totalCount,
            viewedJobOffers = jobOfferStats.viewedCount,
            acceptedJobOffers = jobOfferStats.acceptedCount,
            rejectedJobOffers = jobOfferStats.rejectedCount,
            jobOfferRatio = JobOfferRatio(
                viewedPercentage = jobOfferStats.viewedPercentage,
                acceptedPercentage = jobOfferStats.acceptedPercentage,
                rejectedPercentage = jobOfferStats.rejectedPercentage
            ),

            periodStart = startDate.format(DateTimeFormatter.ISO_DATE),
            periodEnd = endDate.format(DateTimeFormatter.ISO_DATE),
            period = period
        )
    }

    //---------------- 내부 도우미 메서드 ----------------//

    /**
     * 기간 문자열에 해당하는 시작 날짜와 종료 날짜를 반환
     */
    private fun getDateRangeForPeriod(period: String): Pair<LocalDate, LocalDate> {
        val endDate = LocalDate.now()

        val startDate = when (period) {
            "7days" -> endDate.minusDays(6)
            "1month" -> endDate.minusMonths(1)
            "3months" -> endDate.minusMonths(3)
            "6months" -> endDate.minusMonths(6)
            "1year" -> endDate.minusYears(1)
            "all" -> LocalDate.of(2025, 3, 1) // 충분히 과거 날짜
            else -> endDate.minusMonths(1) // 기본값은 1개월
        }

        return Pair(startDate, endDate)
    }

    /**
     * 사용자 유형과 날짜 범위로 사용자 수 조회
     */
    private fun getUserCountByTypeAndDateRange(
        userType: UserType,
        startDateTime: LocalDateTime,
        endDateTime: LocalDateTime
    ): Int {
        val query = """
            SELECT COUNT(u.userId) FROM UserManagement u 
            WHERE u.userType = :userType 
            AND u.createdAt BETWEEN :startDateTime AND :endDateTime
        """

        return entityManager.createQuery(query, Long::class.java)
            .setParameter("userType", userType)
            .setParameter("startDateTime", startDateTime)
            .setParameter("endDateTime", endDateTime)
            .singleResult.toInt()
    }

    /**
     * 사용자 유형과 월 범위로 사용자 수 조회 (월별 통계용)
     */
    private fun getUserCountByTypeAndMonth(
        userType: UserType,
        startDate: LocalDate,
        endDate: LocalDate
    ): Int {
        val query = """
            SELECT COUNT(u.userId) FROM UserManagement u 
            WHERE u.userType = :userType 
            AND u.createdAt BETWEEN :startDateTime AND :endDateTime
        """

        return entityManager.createQuery(query, Long::class.java)
            .setParameter("userType", userType)
            .setParameter("startDateTime", startDate.atStartOfDay())
            .setParameter("endDateTime", endDate.atTime(23, 59, 59))
            .singleResult.toInt()
    }

    /**
     * 사용자 통계 정보를 조회
     */
    private fun getUserStatistics(startDate: LocalDate, endDate: LocalDate): UserStatistics {
        val startDateTime = startDate.atStartOfDay()
        val endDateTime = endDate.atTime(23, 59, 59)

        // 개인 사용자 수 조회 (JOB_SEEKER)
        val individualCount = getUserCountByTypeAndDateRange(UserType.JOB_SEEKER, startDateTime, endDateTime)

        // 기업 사용자 수 조회 (COMPANY + COMPANY_EXCEL)
        val companyCount = getUserCountByTypeAndDateRange(UserType.COMPANY, startDateTime, endDateTime) +
                getUserCountByTypeAndDateRange(UserType.COMPANY_EXCEL, startDateTime, endDateTime)

        val totalCount = individualCount + companyCount

        // 일일 신규 가입자 통계 계산
        val totalDays = ChronoUnit.DAYS.between(startDate, endDate).toInt()

        // 기간 내 신규 가입자 전체 수
        val newUserQuery = """
            SELECT COUNT(u.userId) FROM UserManagement u 
            WHERE u.createdAt BETWEEN :startDateTime AND :endDateTime
        """
        val totalNewUsers = entityManager.createQuery(newUserQuery, Long::class.java)
            .setParameter("startDateTime", startDateTime)
            .setParameter("endDateTime", endDateTime)
            .singleResult.toInt()

        // 기간 내 신규 개인 사용자 수
        val newIndividualQuery = """
            SELECT COUNT(u.userId) FROM UserManagement u 
            WHERE u.userType = :userType
            AND u.createdAt BETWEEN :startDateTime AND :endDateTime
        """
        val totalNewIndividuals = entityManager.createQuery(newIndividualQuery, Long::class.java)
            .setParameter("userType", UserType.JOB_SEEKER)
            .setParameter("startDateTime", startDateTime)
            .setParameter("endDateTime", endDateTime)
            .singleResult.toInt()

        // 기간 내 신규 기업 사용자 수
        val newCompanyQuery = """
            SELECT COUNT(u.userId) FROM UserManagement u 
            WHERE (u.userType = :userType1 OR u.userType = :userType2)
            AND u.createdAt BETWEEN :startDateTime AND :endDateTime
        """
        val totalNewCompanies = entityManager.createQuery(newCompanyQuery, Long::class.java)
            .setParameter("userType1", UserType.COMPANY)
            .setParameter("userType2", UserType.COMPANY_EXCEL)
            .setParameter("startDateTime", startDateTime)
            .setParameter("endDateTime", endDateTime)
            .singleResult.toInt()

        // 일평균 계산 (최소 1일로 나눔)
        val dailyNewCount = if (totalDays > 0) (totalNewUsers / totalDays) else totalNewUsers
        val dailyNewIndividualCount = if (totalDays > 0) (totalNewIndividuals / totalDays) else totalNewIndividuals
        val dailyNewCompanyCount = if (totalDays > 0) (totalNewCompanies / totalDays) else totalNewCompanies

        // 백분율 계산 및 반올림
        val individualPercentage = if (totalCount > 0) (individualCount.toDouble() / totalCount * 100).roundToInt().toDouble() else 0.0
        val companyPercentage = if (totalCount > 0) (companyCount.toDouble() / totalCount * 100).roundToInt().toDouble() else 0.0

        return UserStatistics(
            totalCount = totalCount,
            individualCount = individualCount,
            companyCount = companyCount,
            individualPercentage = individualPercentage,
            companyPercentage = companyPercentage,
            dailyNewCount = dailyNewCount,
            dailyNewIndividualCount = dailyNewIndividualCount,
            dailyNewCompanyCount = dailyNewCompanyCount
        )
    }

    /**
     * 이력서 통계 정보를 조회
     */
    private fun getResumeStatistics(startDate: LocalDate, endDate: LocalDate): ResumeStatistics {
        val startDateTime = startDate.atStartOfDay()
        val endDateTime = endDate.atTime(23, 59, 59)

        // 전체 이력서 수 조회
        val totalResumeQuery = """
            SELECT COUNT(r.resumeId) FROM ResumeManagement r 
            WHERE r.createdAt BETWEEN :startDateTime AND :endDateTime
        """
        val totalCount = entityManager.createQuery(totalResumeQuery, Long::class.java)
            .setParameter("startDateTime", startDateTime)
            .setParameter("endDateTime", endDateTime)
            .singleResult.toInt()

        // 공개 이력서 수 조회 (status가 'enable')
        val publicResumeQuery = """
            SELECT COUNT(r.resumeId) FROM ResumeManagement r 
            WHERE r.status = 'enable'
            AND r.createdAt BETWEEN :startDateTime AND :endDateTime
        """
        val publicCount = entityManager.createQuery(publicResumeQuery, Long::class.java)
            .setParameter("startDateTime", startDateTime)
            .setParameter("endDateTime", endDateTime)
            .singleResult.toInt()

        // 비공개 이력서 수 조회 (status가 'disable')
        val privateResumeQuery = """
            SELECT COUNT(r.resumeId) FROM ResumeManagement r 
            WHERE r.status = 'disable'
            AND r.createdAt BETWEEN :startDateTime AND :endDateTime
        """
        val privateCount = entityManager.createQuery(privateResumeQuery, Long::class.java)
            .setParameter("startDateTime", startDateTime)
            .setParameter("endDateTime", endDateTime)
            .singleResult.toInt()

        // 백분율 계산 및 반올림
        val publicPercentage = if (totalCount > 0) (publicCount.toDouble() / totalCount * 100).roundToInt().toDouble() else 0.0
        val privatePercentage = if (totalCount > 0) (privateCount.toDouble() / totalCount * 100).roundToInt().toDouble() else 0.0

        return ResumeStatistics(
            totalCount = totalCount,
            publicCount = publicCount,
            privateCount = privateCount,
            publicPercentage = publicPercentage,
            privatePercentage = privatePercentage
        )
    }

    /**
     * 채용공고 통계 정보를 조회
     */
    private fun getJobStatistics(startDate: LocalDate, endDate: LocalDate): JobStatistics {
        val startDateTime = startDate.atStartOfDay()
        val endDateTime = endDate.atTime(23, 59, 59)

        // 전체 채용공고 수 조회
        val totalJobQuery = """
            SELECT COUNT(j.id) FROM JobManagement j 
            WHERE j.createdAt BETWEEN :startDateTime AND :endDateTime
        """
        val totalCount = entityManager.createQuery(totalJobQuery, Long::class.java)
            .setParameter("startDateTime", startDateTime)
            .setParameter("endDateTime", endDateTime)
            .singleResult.toInt()

        // 진행중 채용공고 수 조회 (status가 '채용중')
        val activeJobQuery = """
            SELECT COUNT(j.id) FROM JobManagement j 
            WHERE j.status = '채용중'
            AND j.createdAt BETWEEN :startDateTime AND :endDateTime
        """
        val activeCount = entityManager.createQuery(activeJobQuery, Long::class.java)
            .setParameter("startDateTime", startDateTime)
            .setParameter("endDateTime", endDateTime)
            .singleResult.toInt()

        // 마감된 채용공고 수 조회 (status가 'close')
        val closedJobQuery = """
            SELECT COUNT(j.id) FROM JobManagement j 
            WHERE j.status = 'close'
            AND j.createdAt BETWEEN :startDateTime AND :endDateTime
        """
        val closedCount = entityManager.createQuery(closedJobQuery, Long::class.java)
            .setParameter("startDateTime", startDateTime)
            .setParameter("endDateTime", endDateTime)
            .singleResult.toInt()

        // 백분율 계산 및 반올림
        val activePercentage = if (totalCount > 0) (activeCount.toDouble() / totalCount * 100).roundToInt().toDouble() else 0.0
        val closedPercentage = if (totalCount > 0) (closedCount.toDouble() / totalCount * 100).roundToInt().toDouble() else 0.0

        return JobStatistics(
            totalCount = totalCount,
            activeCount = activeCount,
            closedCount = closedCount,
            activePercentage = activePercentage,
            closedPercentage = closedPercentage
        )
    }

    /**
     * 지원 통계 정보를 조회
     */
    private fun getApplicationStatistics(startDate: LocalDate, endDate: LocalDate): ApplicationStatistics {
        val startDateTime = startDate.atStartOfDay()
        val endDateTime = endDate.atTime(23, 59, 59)

        // 전체 지원 수 조회
        val totalApplicationQuery = """
            SELECT COUNT(a.id) FROM ApplicationManagement a 
            WHERE a.createdAt BETWEEN :startDateTime AND :endDateTime
        """
        val totalCount = entityManager.createQuery(totalApplicationQuery, Long::class.java)
            .setParameter("startDateTime", startDateTime)
            .setParameter("endDateTime", endDateTime)
            .singleResult.toInt()

        // 진행중 지원 수 조회 (status가 'PENDING' 또는 'UNREAD')
        val activeApplicationQuery = """
            SELECT COUNT(a.id) FROM ApplicationManagement a 
            WHERE (a.status = 'PENDING' OR a.status = 'UNREAD')
            AND a.createdAt BETWEEN :startDateTime AND :endDateTime
        """
        val activeCount = entityManager.createQuery(activeApplicationQuery, Long::class.java)
            .setParameter("startDateTime", startDateTime)
            .setParameter("endDateTime", endDateTime)
            .singleResult.toInt()

        // 수락된 지원 수 조회 (status가 'ACCEPTED')
        val acceptedApplicationQuery = """
            SELECT COUNT(a.id) FROM ApplicationManagement a 
            WHERE a.status = 'ACCEPTED'
            AND a.createdAt BETWEEN :startDateTime AND :endDateTime
        """
        val acceptedCount = entityManager.createQuery(acceptedApplicationQuery, Long::class.java)
            .setParameter("startDateTime", startDateTime)
            .setParameter("endDateTime", endDateTime)
            .singleResult.toInt()

        // 거절된 지원 수 조회 (status가 'REJECTED')
        val rejectedApplicationQuery = """
            SELECT COUNT(a.id) FROM ApplicationManagement a 
            WHERE a.status = 'REJECTED'
            AND a.createdAt BETWEEN :startDateTime AND :endDateTime
        """
        val rejectedCount = entityManager.createQuery(rejectedApplicationQuery, Long::class.java)
            .setParameter("startDateTime", startDateTime)
            .setParameter("endDateTime", endDateTime)
            .singleResult.toInt()

        // 백분율 계산 및 반올림
        val activePercentage = if (totalCount > 0) (activeCount.toDouble() / totalCount * 100).roundToInt().toDouble() else 0.0
        val acceptedPercentage = if (totalCount > 0) (acceptedCount.toDouble() / totalCount * 100).roundToInt().toDouble() else 0.0
        val rejectedPercentage = if (totalCount > 0) (rejectedCount.toDouble() / totalCount * 100).roundToInt().toDouble() else 0.0

        return ApplicationStatistics(
            totalCount = totalCount,
            activeCount = activeCount,
            acceptedCount = acceptedCount,
            rejectedCount = rejectedCount,
            activePercentage = activePercentage,
            acceptedPercentage = acceptedPercentage,
            rejectedPercentage = rejectedPercentage
        )
    }

    /**
     * 포지션 제안 통계 정보를 조회
     */
    private fun getJobOfferStatistics(startDate: LocalDate, endDate: LocalDate): JobOfferStatistics {
        val startDateTime = startDate.atStartOfDay()
        val endDateTime = endDate.atTime(23, 59, 59)

        // 전체 포지션 제안 수 조회
        val totalJobOfferQuery = """
            SELECT COUNT(o.jobOfferId) FROM JobOfferManagement o 
            WHERE o.createdAt BETWEEN :startDateTime AND :endDateTime
        """
        val totalCount = entityManager.createQuery(totalJobOfferQuery, Long::class.java)
            .setParameter("startDateTime", startDateTime)
            .setParameter("endDateTime", endDateTime)
            .singleResult.toInt()

        // 열람된 포지션 제안 수 조회 (status가 'PENDING')
        val viewedJobOfferQuery = """
            SELECT COUNT(o.jobOfferId) FROM JobOfferManagement o 
            WHERE o.status = 'PENDING'
            AND o.createdAt BETWEEN :startDateTime AND :endDateTime
        """
        val viewedCount = entityManager.createQuery(viewedJobOfferQuery, Long::class.java)
            .setParameter("startDateTime", startDateTime)
            .setParameter("endDateTime", endDateTime)
            .singleResult.toInt()

        // 수락된 포지션 제안 수 조회 (status가 'ACCEPTED')
        val acceptedJobOfferQuery = """
            SELECT COUNT(o.jobOfferId) FROM JobOfferManagement o 
            WHERE o.status = 'ACCEPTED'
            AND o.createdAt BETWEEN :startDateTime AND :endDateTime
        """
        val acceptedCount = entityManager.createQuery(acceptedJobOfferQuery, Long::class.java)
            .setParameter("startDateTime", startDateTime)
            .setParameter("endDateTime", endDateTime)
            .singleResult.toInt()

        // 거절된 포지션 제안 수 조회 (status가 'REJECTED')
        val rejectedJobOfferQuery = """
            SELECT COUNT(o.jobOfferId) FROM JobOfferManagement o 
            WHERE o.status = 'REJECTED'
            AND o.createdAt BETWEEN :startDateTime AND :endDateTime
        """
        val rejectedCount = entityManager.createQuery(rejectedJobOfferQuery, Long::class.java)
            .setParameter("startDateTime", startDateTime)
            .setParameter("endDateTime", endDateTime)
            .singleResult.toInt()

        // 백분율 계산 및 반올림
        val viewedPercentage = if (totalCount > 0) (viewedCount.toDouble() / totalCount * 100).roundToInt().toDouble() else 0.0
        val acceptedPercentage = if (totalCount > 0) (acceptedCount.toDouble() / totalCount * 100).roundToInt().toDouble() else 0.0
        val rejectedPercentage = if (totalCount > 0) (rejectedCount.toDouble() / totalCount * 100).roundToInt().toDouble() else 0.0

        return JobOfferStatistics(
            totalCount = totalCount,
            viewedCount = viewedCount,
            acceptedCount = acceptedCount,
            rejectedCount = rejectedCount,
            viewedPercentage = viewedPercentage,
            acceptedPercentage = acceptedPercentage,
            rejectedPercentage = rejectedPercentage
        )
    }
}

/**
 * 사용자 통계 정보를 담는 내부 클래스
 */
data class UserStatistics(
    val totalCount: Int,
    val individualCount: Int,
    val companyCount: Int,
    val individualPercentage: Double,
    val companyPercentage: Double,
    val dailyNewCount: Int,
    val dailyNewIndividualCount: Int,
    val dailyNewCompanyCount: Int
)

/**
 * 이력서 통계 정보를 담는 내부 클래스
 */
data class ResumeStatistics(
    val totalCount: Int,
    val publicCount: Int,
    val privateCount: Int,
    val publicPercentage: Double,
    val privatePercentage: Double
)

/**
 * 채용공고 통계 정보를 담는 내부 클래스
 */
data class JobStatistics(
    val totalCount: Int,
    val activeCount: Int,
    val closedCount: Int,
    val activePercentage: Double,
    val closedPercentage: Double
)

/**
 * 지원 통계 정보를 담는 내부 클래스
 */
data class ApplicationStatistics(
    val totalCount: Int,
    val activeCount: Int,
    val acceptedCount: Int,
    val rejectedCount: Int,
    val activePercentage: Double,
    val acceptedPercentage: Double,
    val rejectedPercentage: Double
)

/**
 * 포지션 제안 통계 정보를 담는 내부 클래스
 */
data class JobOfferStatistics(
    val totalCount: Int,
    val viewedCount: Int,
    val acceptedCount: Int,
    val rejectedCount: Int,
    val viewedPercentage: Double,
    val acceptedPercentage: Double,
    val rejectedPercentage: Double
)