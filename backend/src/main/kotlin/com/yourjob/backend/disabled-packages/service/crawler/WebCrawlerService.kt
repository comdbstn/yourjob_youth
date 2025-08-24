package com.yourjob.backend.service.crawler

import com.yourjob.backend.entity.crawler.*
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.jsoup.select.Elements
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.time.LocalDateTime
import java.util.concurrent.TimeUnit

@Service
class WebCrawlerService {
    
    private val logger = LoggerFactory.getLogger(WebCrawlerService::class.java)
    
    @Autowired
    private lateinit var crawlerService: CrawlerService
    
    /**
     * 사이트별 크롤링 실행
     */
    fun crawlSite(siteName: String): CrawlerExecutionResult {
        logger.info("Starting crawl for site: $siteName")
        
        val startTime = LocalDateTime.now()
        val result = when (siteName.lowercase()) {
            "saramin" -> crawlSaramin()
            "jobkorea" -> crawlJobKorea()
            "wanted" -> crawlWanted()
            else -> {
                logger.warn("Unknown site: $siteName")
                CrawlerExecutionResult(
                    siteName = siteName,
                    success = false,
                    jobsFound = 0,
                    error = "Unknown site: $siteName"
                )
            }
        }
        
        val endTime = LocalDateTime.now()
        result.executionTime = java.time.Duration.between(startTime, endTime).seconds
        
        logger.info("Crawl completed for $siteName: ${result.jobsFound} jobs found")
        return result
    }
    
    /**
     * 사람인 크롤링
     */
    private fun crawlSaramin(): CrawlerExecutionResult {
        return try {
            val jobs = mutableListOf<CrawlerJobRequest>()
            val baseUrl = "https://www.saramin.co.kr"
            
            // 검색 키워드별 크롤링
            val keywords = listOf("개발자", "프론트엔드", "백엔드", "풀스택")
            
            for (keyword in keywords) {
                val searchUrl = "$baseUrl/zf_user/search/recruit?search_area=main&search_done=y&search_optional_item=n&searchType=search&searchword=${URLEncoder.encode(keyword, StandardCharsets.UTF_8)}"
                
                logger.info("Crawling Saramin with keyword: $keyword")
                
                val doc = connectWithRetry(searchUrl)
                if (doc != null) {
                    val jobElements = doc.select("div.item_recruit")
                    
                    jobElements.take(10).forEach { element ->
                        try {
                            val titleElement = element.selectFirst("h2.job_tit a")
                            val companyElement = element.selectFirst("strong.corp_name a")
                            val conditionElement = element.selectFirst("div.job_condition")
                            
                            if (titleElement != null && companyElement != null) {
                                val jobUrl = baseUrl + titleElement.attr("href")
                                val jobId = extractJobIdFromUrl(jobUrl, "rec_idx=")
                                
                                val job = CrawlerJobRequest(
                                    siteName = "saramin",
                                    siteUrl = baseUrl,
                                    jobTitle = titleElement.text().trim(),
                                    companyName = companyElement.text().trim(),
                                    location = conditionElement?.selectFirst("span")?.text()?.trim(),
                                    jobType = "정규직", // 기본값
                                    experience = conditionElement?.select("span")?.getOrNull(1)?.text()?.trim(),
                                    salary = conditionElement?.select("span")?.getOrNull(2)?.text()?.trim(),
                                    description = "사람인에서 수집된 채용공고입니다.",
                                    requirements = "자세한 내용은 원본 링크를 확인해주세요.",
                                    benefits = null,
                                    deadline = conditionElement?.selectFirst("span.date")?.text()?.trim(),
                                    originalUrl = jobUrl,
                                    originalJobId = jobId
                                )
                                
                                jobs.add(job)
                                logger.debug("Crawled job: ${job.jobTitle} at ${job.companyName}")
                            }
                        } catch (e: Exception) {
                            logger.warn("Error parsing job element: ${e.message}")
                        }
                    }
                    
                    // 크롤링 간격 준수
                    Thread.sleep(2000)
                }
            }
            
            // DB에 저장
            jobs.forEach { job ->
                try {
                    crawlerService.createCrawlerJob(job)
                } catch (e: Exception) {
                    logger.error("Error saving job: ${e.message}")
                }
            }
            
            CrawlerExecutionResult(
                siteName = "saramin",
                success = true,
                jobsFound = jobs.size
            )
            
        } catch (e: Exception) {
            logger.error("Error crawling Saramin: ${e.message}", e)
            CrawlerExecutionResult(
                siteName = "saramin",
                success = false,
                jobsFound = 0,
                error = e.message
            )
        }
    }
    
    /**
     * 잡코리아 크롤링
     */
    private fun crawlJobKorea(): CrawlerExecutionResult {
        return try {
            val jobs = mutableListOf<CrawlerJobRequest>()
            val baseUrl = "https://www.jobkorea.co.kr"
            
            val keywords = listOf("개발자", "프론트엔드", "백엔드")
            
            for (keyword in keywords) {
                val searchUrl = "$baseUrl/Search/?stext=${URLEncoder.encode(keyword, StandardCharsets.UTF_8)}"
                
                logger.info("Crawling JobKorea with keyword: $keyword")
                
                val doc = connectWithRetry(searchUrl)
                if (doc != null) {
                    val jobElements = doc.select("div.post-list-info")
                    
                    jobElements.take(10).forEach { element ->
                        try {
                            val titleElement = element.selectFirst("a.title")
                            val companyElement = element.selectFirst("a.name")
                            val locationElement = element.selectFirst("span.option span")
                            val salaryElement = element.selectFirst("span.salary")
                            
                            if (titleElement != null && companyElement != null) {
                                val jobUrl = baseUrl + titleElement.attr("href")
                                val jobId = extractJobIdFromUrl(jobUrl, "GI_IDX=")
                                
                                val job = CrawlerJobRequest(
                                    siteName = "jobkorea",
                                    siteUrl = baseUrl,
                                    jobTitle = titleElement.text().trim(),
                                    companyName = companyElement.text().trim(),
                                    location = locationElement?.text()?.trim(),
                                    jobType = "정규직",
                                    experience = null,
                                    salary = salaryElement?.text()?.trim(),
                                    description = "잡코리아에서 수집된 채용공고입니다.",
                                    requirements = "자세한 내용은 원본 링크를 확인해주세요.",
                                    benefits = null,
                                    deadline = null,
                                    originalUrl = jobUrl,
                                    originalJobId = jobId
                                )
                                
                                jobs.add(job)
                                logger.debug("Crawled job: ${job.jobTitle} at ${job.companyName}")
                            }
                        } catch (e: Exception) {
                            logger.warn("Error parsing job element: ${e.message}")
                        }
                    }
                    
                    Thread.sleep(2000)
                }
            }
            
            // DB에 저장
            jobs.forEach { job ->
                try {
                    crawlerService.createCrawlerJob(job)
                } catch (e: Exception) {
                    logger.error("Error saving job: ${e.message}")
                }
            }
            
            CrawlerExecutionResult(
                siteName = "jobkorea",
                success = true,
                jobsFound = jobs.size
            )
            
        } catch (e: Exception) {
            logger.error("Error crawling JobKorea: ${e.message}", e)
            CrawlerExecutionResult(
                siteName = "jobkorea",
                success = false,
                jobsFound = 0,
                error = e.message
            )
        }
    }
    
    /**
     * 원티드 크롤링 (API 기반)
     */
    private fun crawlWanted(): CrawlerExecutionResult {
        return try {
            logger.info("Crawling Wanted...")
            
            // 원티드는 API를 사용하거나 다른 방식으로 구현
            // 현재는 간단한 더미 데이터로 구현
            val jobs = listOf(
                CrawlerJobRequest(
                    siteName = "wanted",
                    siteUrl = "https://www.wanted.co.kr",
                    jobTitle = "프론트엔드 개발자",
                    companyName = "테크 스타트업",
                    location = "서울 강남구",
                    jobType = "정규직",
                    experience = "경력 1-3년",
                    salary = "4000-6000만원",
                    description = "원티드에서 수집된 채용공고입니다.",
                    requirements = "React, TypeScript 경험",
                    benefits = "유연근무, 교육비 지원",
                    deadline = "상시채용",
                    originalUrl = "https://www.wanted.co.kr/wd/12345",
                    originalJobId = "wanted_12345"
                )
            )
            
            jobs.forEach { job ->
                try {
                    crawlerService.createCrawlerJob(job)
                } catch (e: Exception) {
                    logger.error("Error saving job: ${e.message}")
                }
            }
            
            CrawlerExecutionResult(
                siteName = "wanted",
                success = true,
                jobsFound = jobs.size
            )
            
        } catch (e: Exception) {
            logger.error("Error crawling Wanted: ${e.message}", e)
            CrawlerExecutionResult(
                siteName = "wanted",
                success = false,
                jobsFound = 0,
                error = e.message
            )
        }
    }
    
    /**
     * 안전한 웹 연결 (재시도 포함)
     */
    private fun connectWithRetry(url: String, maxRetries: Int = 3): Document? {
        repeat(maxRetries) { attempt ->
            try {
                return Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(10000)
                    .followRedirects(true)
                    .get()
            } catch (e: Exception) {
                logger.warn("Connection attempt ${attempt + 1} failed for $url: ${e.message}")
                if (attempt < maxRetries - 1) {
                    Thread.sleep(5000) // 5초 대기 후 재시도
                }
            }
        }
        return null
    }
    
    /**
     * URL에서 공고 ID 추출
     */
    private fun extractJobIdFromUrl(url: String, pattern: String): String {
        return try {
            val regex = "$pattern([^&]+)".toRegex()
            val matchResult = regex.find(url)
            matchResult?.groupValues?.get(1) ?: url.hashCode().toString()
        } catch (e: Exception) {
            url.hashCode().toString()
        }
    }
}

/**
 * 크롤링 실행 결과
 */
data class CrawlerExecutionResult(
    val siteName: String,
    val success: Boolean,
    val jobsFound: Int,
    val error: String? = null,
    var executionTime: Long = 0
)