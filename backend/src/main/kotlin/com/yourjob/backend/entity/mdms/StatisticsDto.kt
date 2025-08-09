package com.yourjob.backend.dto

/**
 * 대시보드용 통계 응답 DTO
 */
data class StatisticsResponse(
    // 사용자 통계
    val totalUsers: Int,
    val individualUsers: Int,
    val companyUsers: Int,
    val userRatio: UserRatio,
    val dailyNewUsers: Int,
    val dailyNewIndividualUsers: Int,
    val dailyNewCompanyUsers: Int,

    // 이력서 통계
    val totalResumes: Int,
    val publicResumes: Int,
    val privateResumes: Int,
    val resumeRatio: ResumeRatio,

    // 채용공고 통계
    val totalJobs: Int,
    val activeJobs: Int,
    val closedJobs: Int,
    val jobRatio: JobRatio,

    // 지원 통계
    val totalApplications: Int,
    val activeApplications: Int,
    val acceptedApplications: Int,
    val rejectedApplications: Int,
    val applicationRatio: ApplicationRatio,

    // 포지션 제안 통계
    val totalJobOffers: Int,
    val viewedJobOffers: Int,
    val acceptedJobOffers: Int,
    val rejectedJobOffers: Int,
    val jobOfferRatio: JobOfferRatio,

    // 기간 정보
    val periodStart: String,
    val periodEnd: String,
    val period: String
)

/**
 * 사용자 비율 정보
 */
data class UserRatio(
    val individualPercentage: Double,
    val companyPercentage: Double
)

/**
 * 이력서 비율 정보
 */
data class ResumeRatio(
    val publicPercentage: Double,
    val privatePercentage: Double
)

/**
 * 채용공고 비율 정보
 */
data class JobRatio(
    val activePercentage: Double,
    val closedPercentage: Double
)

/**
 * 지원 비율 정보
 */
data class ApplicationRatio(
    val activePercentage: Double,
    val acceptedPercentage: Double,
    val rejectedPercentage: Double
)

/**
 * 포지션 제안 비율 정보
 */
data class JobOfferRatio(
    val viewedPercentage: Double,
    val acceptedPercentage: Double,
    val rejectedPercentage: Double
)

/**
 * 차트 데이터 응답 DTO
 */
data class ChartDataResponse(
    val labels: List<String>,
    val datasets: List<ChartDataset>,
    val type: String // line, bar, pie, doughnut 등
)

/**
 * 차트 데이터셋 DTO
 */
data class ChartDataset(
    val label: String,
    val data: List<Number>,
    val backgroundColor: List<String>? = null,
    val borderColor: String? = null,
    val fill: Boolean? = null
)

/**
 * 파이 차트 데이터 항목 DTO
 */
data class PieChartItem(
    val label: String,
    val value: Number,
    val color: String
)