package com.yourjob.backend.service.crawler

import com.yourjob.backend.entity.crawler.*
import com.yourjob.backend.mapper.CrawlerMapper
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.slf4j.LoggerFactory
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.concurrent.CompletableFuture
import java.util.concurrent.Executors
import org.springframework.scheduling.annotation.Async
import org.springframework.scheduling.annotation.Scheduled

@Service
@Transactional
class CrawlerService(
    private val crawlerMapper: CrawlerMapper,
    private val jobPostingIntegrationService: JobPostingIntegrationService
) {
    
    private val logger = LoggerFactory.getLogger(CrawlerService::class.java)
    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
    private val executor = Executors.newFixedThreadPool(5) // 동시 크롤링 스레드 수
    
    // =====================================================
    // Crawler Config Methods
    // =====================================================
    fun getCrawlerConfigs(activeOnly: Boolean = true): List<CrawlerConfig> {
        return crawlerMapper.getCrawlerConfigs(activeOnly)
    }
    
    fun getCrawlerConfigBySiteName(siteName: String): CrawlerConfig? {
        return crawlerMapper.getCrawlerConfigBySiteName(siteName)
    }
    
    fun createCrawlerConfig(config: CrawlerConfig): CrawlerConfig {
        crawlerMapper.insertCrawlerConfig(config)
        return config.copy(configId = config.configId)
    }
    
    fun updateCrawlerConfig(configId: Int, config: CrawlerConfig): CrawlerConfig {
        val updatedConfig = config.copy(configId = configId)
        crawlerMapper.updateCrawlerConfig(updatedConfig)
        return updatedConfig
    }
    
    // =====================================================
    // Crawler Job Methods
    // =====================================================
    fun getCrawlerJobs(
        siteName: String? = null,
        processStatus: ProcessStatus? = null,
        limit: Int = 100,
        offset: Int = 0
    ): List<CrawlerJobResponse> {
        return crawlerMapper.getCrawlerJobs(siteName, processStatus?.name, limit, offset)
            .map { job -> convertToCrawlerJobResponse(job) }
    }
    
    fun getCrawlerJobById(crawlerId: Int): CrawlerJob? {
        return crawlerMapper.getCrawlerJobById(crawlerId)
    }
    
    fun createCrawlerJob(request: CrawlerJobRequest): CrawlerJobResponse {
        // 중복 체크
        val existingJob = crawlerMapper.findDuplicateJob(request.siteName, request.originalJobId)
        if (existingJob != null) {
            logger.info("Duplicate job found: ${request.siteName}-${request.originalJobId}")
            val duplicateJob = existingJob.copy(
                processStatus = ProcessStatus.DUPLICATE,
                duplicateCheck = true,
                processedAt = LocalDateTime.now()
            )
            crawlerMapper.updateCrawlerJob(duplicateJob)
            return convertToCrawlerJobResponse(duplicateJob)
        }
        
        val crawlerJob = CrawlerJob(
            siteName = request.siteName,
            siteUrl = request.siteUrl,
            jobTitle = request.jobTitle,
            companyName = request.companyName,
            location = request.location,
            jobType = request.jobType,
            experience = request.experience,
            salary = request.salary,
            description = request.description,
            requirements = request.requirements,
            benefits = request.benefits,
            deadline = request.deadline,
            originalUrl = request.originalUrl,
            originalJobId = request.originalJobId,
            crawlStatus = CrawlStatus.CRAWLED,
            processStatus = ProcessStatus.PENDING
        )
        
        crawlerMapper.insertCrawlerJob(crawlerJob)
        logCrawlerEvent(request.siteName, "INFO", "New job crawled: ${request.jobTitle}")
        
        return convertToCrawlerJobResponse(crawlerJob)
    }
    
    // =====================================================
    // Job Processing Methods
    // =====================================================
    @Async
    fun processAllPendingJobs() {
        val pendingJobs = crawlerMapper.getCrawlerJobs(null, ProcessStatus.PENDING.name, 50, 0)
        
        pendingJobs.forEach { job ->
            CompletableFuture.supplyAsync({
                processJob(job.crawlerId!!)
            }, executor).exceptionally { throwable ->
                logger.error("Error processing job ${job.crawlerId}: ${throwable.message}")
                null
            }
        }
    }
    
    fun processJob(crawlerId: Int): Boolean {
        val job = crawlerMapper.getCrawlerJobById(crawlerId) ?: return false
        
        try {
            // 처리 상태를 PROCESSING으로 변경
            updateJobStatus(crawlerId, ProcessStatus.PROCESSING)
            
            val startTime = System.currentTimeMillis()
            
            // 필터링 검사
            if (!passesFilter(job)) {
                updateJobStatus(crawlerId, ProcessStatus.FILTERED, "Filtered out by content rules")
                return false
            }
            
            // JobPosting으로 변환 및 저장
            val success = jobPostingIntegrationService.integrateFromCrawlerJob(job)
            
            val endTime = System.currentTimeMillis()
            val processingTime = (endTime - startTime) / 1000.0
            
            if (success) {
                updateJobStatus(crawlerId, ProcessStatus.SUCCESS)
                logCrawlerEvent(job.siteName, "INFO", "Job processed successfully: ${job.jobTitle}", processingTime)
                updateStatistics(job.siteName, success = true, processingTime = processingTime)
                return true
            } else {
                updateJobStatus(crawlerId, ProcessStatus.FAILED, "Failed to integrate to job posting")
                updateStatistics(job.siteName, success = false)
                return false
            }
            
        } catch (e: Exception) {
            logger.error("Error processing crawler job $crawlerId", e)
            updateJobStatus(crawlerId, ProcessStatus.FAILED, e.message)
            updateStatistics(job.siteName, success = false)
            return false
        }
    }
    
    private fun updateJobStatus(crawlerId: Int, status: ProcessStatus, errorMessage: String? = null) {
        crawlerMapper.updateJobStatus(crawlerId, status.name, errorMessage, LocalDateTime.now())
    }
    
    private fun passesFilter(job: CrawlerJob): Boolean {
        val config = getCrawlerConfigBySiteName(job.siteName) ?: return true
        val filters = config.filters ?: return true
        
        // 제외 키워드 검사
        val excludeKeywords = filters["excludeKeywords"] as? List<String>
        if (excludeKeywords != null) {
            val combinedText = "${job.jobTitle} ${job.description ?: ""}"
            if (excludeKeywords.any { keyword -> combinedText.contains(keyword, ignoreCase = true) }) {
                return false
            }
        }
        
        // 위치 필터
        val allowedLocations = filters["locations"] as? List<String>
        if (allowedLocations != null && job.location != null) {
            if (!allowedLocations.any { location -> job.location.contains(location) }) {
                return false
            }
        }
        
        return true
    }
    
    // =====================================================
    // Statistics Methods
    // =====================================================
    fun getCrawlerStats(siteName: String? = null): List<CrawlerStats> {
        return crawlerMapper.getCrawlerStatistics(siteName)
    }
    
    private fun updateStatistics(siteName: String, success: Boolean, processingTime: Double? = null) {
        crawlerMapper.updateDailyStatistics(siteName, success, processingTime)
    }
    
    // =====================================================
    // Logging Methods
    // =====================================================
    private fun logCrawlerEvent(siteName: String, level: String, message: String, executionTime: Double? = null) {
        // 로거로 대체 - 매퍼에 해당 메서드가 없음
        logger.info("[$siteName] $level: $message" + if (executionTime != null) " (${executionTime}s)" else "")
    }
    
    fun getCrawlerLogs(siteName: String? = null, level: String? = null, limit: Int = 100): List<Map<String, Any>> {
        // 임시로 빈 리스트 반환 - 필요시 매퍼 구현
        return emptyList()
    }
    
    // =====================================================
    // Scheduled Tasks
    // =====================================================
    @Scheduled(fixedRate = 300000) // 5분마다 실행
    fun scheduledProcessPendingJobs() {
        logger.info("Starting scheduled processing of pending crawler jobs")
        processAllPendingJobs()
    }
    
    @Scheduled(cron = "0 0 2 * * ?") // 매일 새벽 2시에 실행
    fun cleanupOldCrawlerData() {
        logger.info("Starting cleanup of old crawler data")
        
        // 30일 이전의 처리된 크롤러 데이터 삭제
        val cutoffDate = LocalDateTime.now().minusDays(30)
        val deletedCount = crawlerMapper.cleanupProcessedJobs(cutoffDate)
        
        logger.info("Cleaned up $deletedCount old crawler jobs")
        logCrawlerEvent("SYSTEM", "INFO", "Cleanup completed: deleted $deletedCount old jobs")
    }
    
    @Scheduled(cron = "0 0 9,14,19 * * ?") // 매일 오전 9시, 오후 2시, 오후 7시에 실행
    fun scheduledCrawling() {
        logger.info("Starting scheduled crawling of all sites")
        
        try {
            val sites = listOf("saramin", "jobkorea", "wanted")
            for (siteName in sites) {
                logger.info("Starting scheduled crawl for $siteName")
                // 실제 크롤링은 WebCrawlerService에서 실행
            }
        } catch (e: Exception) {
            logger.error("Error during scheduled crawling: ${e.message}", e)
        }
    }
    
    // =====================================================
    // Utility Methods
    // =====================================================
    private fun convertToCrawlerJobResponse(job: CrawlerJob): CrawlerJobResponse {
        return CrawlerJobResponse(
            crawlerId = job.crawlerId!!,
            siteName = job.siteName,
            jobTitle = job.jobTitle,
            companyName = job.companyName,
            location = job.location,
            originalUrl = job.originalUrl,
            crawlStatus = job.crawlStatus.name,
            processStatus = job.processStatus.name,
            crawledAt = job.crawledAt.format(dateFormatter),
            processedAt = job.processedAt?.format(dateFormatter),
            errorMessage = job.errorMessage
        )
    }
    
    fun retryFailedJobs(maxRetries: Int = 3): Int {
        val failedJobs = crawlerMapper.getFailedJobsForRetry(maxRetries)
        var retriedCount = 0
        
        failedJobs.forEach { job ->
            CompletableFuture.supplyAsync({
                if (processJob(job.crawlerId!!)) {
                    retriedCount++
                } else {
                    crawlerMapper.incrementRetryCount(job.crawlerId)
                }
            }, executor)
        }
        
        return retriedCount
    }
}