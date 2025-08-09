package com.yourjob.backend.entity.crawler

import java.time.LocalDateTime

data class CrawlerJob(
    val crawlerId: Int? = null,
    val siteName: String, // 'saramin', 'jobkorea', 'wanted' etc.
    val siteUrl: String,
    val jobTitle: String,
    val companyName: String,
    val location: String?,
    val jobType: String?, // 정규직, 계약직 등
    val experience: String?, // 신입, 경력 등
    val salary: String?,
    val description: String?,
    val requirements: String?,
    val benefits: String?,
    val deadline: String?,
    val originalUrl: String, // 원본 사이트 URL
    val originalJobId: String, // 원본 사이트의 공고 ID
    val crawlStatus: CrawlStatus = CrawlStatus.CRAWLED,
    val processStatus: ProcessStatus = ProcessStatus.PENDING,
    val duplicateCheck: Boolean = false,
    val errorMessage: String?,
    val retryCount: Int = 0,
    val maxRetries: Int = 3,
    val crawledAt: LocalDateTime = LocalDateTime.now(),
    val processedAt: LocalDateTime?,
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)

enum class CrawlStatus {
    CRAWLED,    // 크롤링 완료
    FAILED,     // 크롤링 실패
    SKIPPED     // 스킵됨 (중복 등)
}

enum class ProcessStatus {
    PENDING,    // 처리 대기
    PROCESSING, // 처리 중
    SUCCESS,    // 처리 완료 (DB 저장 성공)
    FAILED,     // 처리 실패
    DUPLICATE,  // 중복으로 인한 스킵
    FILTERED    // 필터링으로 인한 제외
}

data class CrawlerJobRequest(
    val siteName: String,
    val siteUrl: String,
    val jobTitle: String,
    val companyName: String,
    val location: String?,
    val jobType: String?,
    val experience: String?,
    val salary: String?,
    val description: String?,
    val requirements: String?,
    val benefits: String?,
    val deadline: String?,
    val originalUrl: String,
    val originalJobId: String
)

data class CrawlerJobResponse(
    val crawlerId: Int,
    val siteName: String,
    val jobTitle: String,
    val companyName: String,
    val location: String?,
    val originalUrl: String,
    val crawlStatus: String,
    val processStatus: String,
    val crawledAt: String,
    val processedAt: String?,
    val errorMessage: String?
)

data class CrawlerConfig(
    val configId: Int? = null,
    val siteName: String,
    val baseUrl: String,
    val isActive: Boolean = true,
    val crawlInterval: Int = 60, // 크롤링 간격 (분)
    val maxPages: Int = 10, // 최대 페이지 수
    val selectors: Map<String, String>, // CSS 선택자 설정
    val filters: Map<String, Any>?, // 필터링 조건
    val lastCrawledAt: LocalDateTime?,
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)

data class CrawlerStats(
    val siteName: String,
    val totalCrawled: Int,
    val successCount: Int,
    val failedCount: Int,
    val duplicateCount: Int,
    val lastCrawledAt: LocalDateTime?,
    val avgProcessingTime: Double? // 평균 처리 시간 (초)
)