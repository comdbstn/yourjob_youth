package com.yourjob.backend.mapper.crawler

import com.yourjob.backend.entity.crawler.*
import org.apache.ibatis.annotations.*
import java.time.LocalDateTime

@Mapper
interface CrawlerMapper {
    
    // =====================================================
    // 크롤러 작업 관리
    // =====================================================
    
    /**
     * 크롤러 작업 조회
     */
    @Select("""
        <script>
        SELECT 
            crawler_id, site_name, original_job_id, original_url, 
            process_status, title, company_name, location, 
            job_category, employment_type, salary, job_description,
            requirements, benefits, contact_info, deadline,
            created_at, updated_at, processed_at, error_message
        FROM crawler_jobs
        <where>
            <if test="siteName != null">AND site_name = #{siteName}</if>
            <if test="status != null">AND process_status = #{status}</if>
        </where>
        ORDER BY created_at DESC
        LIMIT #{limit} OFFSET #{offset}
        </script>
    """)
    fun getCrawlerJobs(
        @Param("siteName") siteName: String?,
        @Param("status") status: String?,
        @Param("limit") limit: Int,
        @Param("offset") offset: Int
    ): List<CrawlerJob>
    
    /**
     * 특정 크롤러 작업 조회
     */
    @Select("""
        SELECT 
            crawler_id, site_name, original_job_id, original_url, 
            process_status, title, company_name, location, 
            job_category, employment_type, salary, job_description,
            requirements, benefits, contact_info, deadline,
            created_at, updated_at, processed_at, error_message
        FROM crawler_jobs 
        WHERE crawler_id = #{crawlerId}
    """)
    fun getCrawlerJobById(@Param("crawlerId") crawlerId: Int): CrawlerJob?
    
    /**
     * 크롤러 작업 생성
     */
    @Insert("""
        INSERT INTO crawler_jobs (
            site_name, original_job_id, original_url, process_status,
            title, company_name, location, job_category, employment_type,
            salary, job_description, requirements, benefits, contact_info,
            deadline, created_at
        ) VALUES (
            #{siteName}, #{originalJobId}, #{originalUrl}, #{processStatus},
            #{title}, #{companyName}, #{location}, #{jobCategory}, #{employmentType},
            #{salary}, #{jobDescription}, #{requirements}, #{benefits}, #{contactInfo},
            #{deadline}, #{createdAt}
        )
        ON DUPLICATE KEY UPDATE
            process_status = #{processStatus},
            title = #{title},
            company_name = #{companyName},
            updated_at = NOW()
    """)
    @Options(useGeneratedKeys = true, keyProperty = "crawlerId")
    fun insertCrawlerJob(job: CrawlerJob): Int
    
    /**
     * 크롤러 작업 상태 업데이트
     */
    @Update("""
        UPDATE crawler_jobs 
        SET 
            process_status = #{status},
            processed_at = #{processedAt},
            error_message = #{errorMessage},
            updated_at = NOW()
        WHERE crawler_id = #{crawlerId}
    """)
    fun updateCrawlerJobStatus(
        @Param("crawlerId") crawlerId: Int,
        @Param("status") status: String,
        @Param("processedAt") processedAt: LocalDateTime?,
        @Param("errorMessage") errorMessage: String?
    ): Int
    
    /**
     * 중복 작업 확인
     */
    @Select("""
        SELECT COUNT(*) 
        FROM crawler_jobs 
        WHERE site_name = #{siteName} 
        AND original_job_id = #{originalJobId}
    """)
    fun checkDuplicateJob(
        @Param("siteName") siteName: String,
        @Param("originalJobId") originalJobId: String
    ): Int
    
    // =====================================================
    // 크롤러 설정 관리
    // =====================================================
    
    /**
     * 사이트별 크롤러 설정 조회
     */
    @Select("""
        SELECT 
            config_id, site_name, base_url, is_active, crawl_interval_minutes,
            max_pages_per_crawl, selectors, request_headers, rate_limit_delay_ms,
            created_at, updated_at
        FROM crawler_configs 
        WHERE site_name = #{siteName}
    """)
    fun getCrawlerConfig(@Param("siteName") siteName: String): CrawlerConfig?
    
    /**
     * 활성화된 모든 크롤러 설정 조회
     */
    @Select("""
        SELECT 
            config_id, site_name, base_url, is_active, crawl_interval_minutes,
            max_pages_per_crawl, selectors, request_headers, rate_limit_delay_ms,
            created_at, updated_at
        FROM crawler_configs 
        WHERE is_active = 1
        ORDER BY site_name
    """)
    fun getActiveCrawlerConfigs(): List<CrawlerConfig>
    
    /**
     * 크롤러 설정 업데이트
     */
    @Update("""
        UPDATE crawler_configs 
        SET 
            base_url = #{baseUrl},
            is_active = #{isActive},
            crawl_interval_minutes = #{crawlIntervalMinutes},
            max_pages_per_crawl = #{maxPagesPerCrawl},
            selectors = #{selectors},
            request_headers = #{requestHeaders},
            rate_limit_delay_ms = #{rateLimitDelayMs},
            updated_at = NOW()
        WHERE config_id = #{configId}
    """)
    fun updateCrawlerConfig(config: CrawlerConfig): Int
    
    // =====================================================
    // 크롤러 실행 로그
    // =====================================================
    
    /**
     * 크롤러 실행 로그 조회
     */
    @Select("""
        <script>
        SELECT 
            log_id, site_name, crawl_status, started_at, completed_at,
            pages_crawled, jobs_found, jobs_processed, jobs_failed,
            error_message, statistics
        FROM crawler_execution_logs
        <where>
            <if test="siteName != null">AND site_name = #{siteName}</if>
            <if test="status != null">AND crawl_status = #{status}</if>
        </where>
        ORDER BY started_at DESC
        LIMIT #{limit} OFFSET #{offset}
        </script>
    """)
    fun getCrawlerLogs(
        @Param("siteName") siteName: String?,
        @Param("status") status: String?,
        @Param("limit") limit: Int,
        @Param("offset") offset: Int
    ): List<CrawlerExecutionLog>
    
    /**
     * 크롤러 실행 로그 생성
     */
    @Insert("""
        INSERT INTO crawler_execution_logs (
            site_name, crawl_status, started_at, pages_crawled,
            jobs_found, jobs_processed, jobs_failed, error_message, statistics
        ) VALUES (
            #{siteName}, #{crawlStatus}, #{startedAt}, #{pagesCrawled},
            #{jobsFound}, #{jobsProcessed}, #{jobsFailed}, #{errorMessage}, #{statistics}
        )
    """)
    @Options(useGeneratedKeys = true, keyProperty = "logId")
    fun insertCrawlerLog(log: CrawlerExecutionLog): Int
    
    /**
     * 크롤러 실행 로그 업데이트
     */
    @Update("""
        UPDATE crawler_execution_logs 
        SET 
            crawl_status = #{crawlStatus},
            completed_at = #{completedAt},
            pages_crawled = #{pagesCrawled},
            jobs_found = #{jobsFound},
            jobs_processed = #{jobsProcessed},
            jobs_failed = #{jobsFailed},
            error_message = #{errorMessage},
            statistics = #{statistics}
        WHERE log_id = #{logId}
    """)
    fun updateCrawlerLog(log: CrawlerExecutionLog): Int
    
    // =====================================================
    // 크롤러 통계
    // =====================================================
    
    /**
     * 크롤러 작업 통계 조회
     */
    @Select("""
        SELECT 
            site_name,
            COUNT(*) as total_jobs,
            COUNT(CASE WHEN process_status = 'SUCCESS' THEN 1 END) as success_jobs,
            COUNT(CASE WHEN process_status = 'FAILED' THEN 1 END) as failed_jobs,
            COUNT(CASE WHEN process_status = 'DUPLICATE' THEN 1 END) as duplicate_jobs,
            COUNT(CASE WHEN process_status = 'PENDING' THEN 1 END) as pending_jobs
        FROM crawler_jobs
        WHERE created_at >= #{startDate}
        GROUP BY site_name
        ORDER BY total_jobs DESC
    """)
    fun getCrawlerStatistics(@Param("startDate") startDate: String): List<Map<String, Any>>
    
    /**
     * 크롤러 성능 통계 조회
     */
    @Select("""
        SELECT 
            site_name,
            AVG(pages_crawled) as avg_pages_crawled,
            AVG(jobs_found) as avg_jobs_found,
            AVG(TIMESTAMPDIFF(MINUTE, started_at, completed_at)) as avg_duration_minutes,
            MAX(completed_at) as last_crawl_time
        FROM crawler_execution_logs
        WHERE crawl_status = 'COMPLETED'
        AND started_at >= #{startDate}
        GROUP BY site_name
    """)
    fun getCrawlerPerformanceStats(@Param("startDate") startDate: String): List<Map<String, Any>>
    
    /**
     * 일별 크롤링 통계 조회
     */
    @Select("""
        SELECT 
            DATE(created_at) as crawl_date,
            site_name,
            COUNT(*) as jobs_crawled,
            COUNT(CASE WHEN process_status = 'SUCCESS' THEN 1 END) as jobs_processed
        FROM crawler_jobs
        WHERE created_at >= #{startDate}
        GROUP BY DATE(created_at), site_name
        ORDER BY crawl_date DESC, site_name
    """)
    fun getDailyCrawlingStats(@Param("startDate") startDate: String): List<Map<String, Any>>
    
    // =====================================================
    // 크롤러 관리 기능
    // =====================================================
    
    /**
     * 실패한 작업 재시도
     */
    @Update("""
        UPDATE crawler_jobs 
        SET 
            process_status = 'PENDING',
            error_message = NULL,
            updated_at = NOW()
        WHERE crawler_id = #{crawlerId} 
        AND process_status = 'FAILED'
    """)
    fun retryFailedJob(@Param("crawlerId") crawlerId: Int): Int
    
    /**
     * 오래된 로그 정리
     */
    @Delete("""
        DELETE FROM crawler_execution_logs 
        WHERE started_at < #{beforeDate}
    """)
    fun cleanupOldLogs(@Param("beforeDate") beforeDate: LocalDateTime): Int
    
    /**
     * 처리된 작업 정리
     */
    @Delete("""
        DELETE FROM crawler_jobs 
        WHERE process_status IN ('SUCCESS', 'DUPLICATE')
        AND processed_at < #{beforeDate}
    """)
    fun cleanupProcessedJobs(@Param("beforeDate") beforeDate: LocalDateTime): Int
    
    /**
     * 사이트별 최근 크롤링 시간 조회
     */
    @Select("""
        SELECT 
            site_name,
            MAX(completed_at) as last_crawl_time
        FROM crawler_execution_logs
        WHERE crawl_status = 'COMPLETED'
        GROUP BY site_name
    """)
    fun getLastCrawlTimes(): List<Map<String, Any>>
    
    /**
     * 크롤러 작업 개수 조회
     */
    @Select("""
        <script>
        SELECT COUNT(*)
        FROM crawler_jobs
        <where>
            <if test="siteName != null">AND site_name = #{siteName}</if>
            <if test="status != null">AND process_status = #{status}</if>
        </where>
        </script>
    """)
    fun countCrawlerJobs(
        @Param("siteName") siteName: String?,
        @Param("status") status: String?
    ): Long
}