package com.yourjob.backend.controller.crawler

import com.yourjob.backend.service.crawler.CrawlerService
import com.yourjob.backend.service.crawler.WebCrawlerService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/crawler")
class CrawlerController(
    private val crawlerService: CrawlerService,
    private val webCrawlerService: WebCrawlerService
) {
    
    /**
     * 수동 크롤링 실행
     */
    @PostMapping("/run/{siteName}")
    fun runCrawler(@PathVariable siteName: String): ResponseEntity<Map<String, Any>> {
        return try {
            val result = webCrawlerService.crawlSite(siteName)
            
            val response: Map<String, Any> = mapOf(
                "success" to result.success,
                "siteName" to result.siteName,
                "jobsFound" to result.jobsFound,
                "executionTime" to "${result.executionTime}초",
                "message" to if (result.success) "크롤링이 성공적으로 완료되었습니다." else "크롤링 중 오류가 발생했습니다.",
                "error" to (result.error ?: "")
            )
            
            ResponseEntity.ok(response)
        } catch (e: Exception) {
            val response = mapOf(
                "success" to false,
                "siteName" to siteName,
                "jobsFound" to 0,
                "message" to "크롤링 실행 중 오류가 발생했습니다: ${e.message}"
            )
            ResponseEntity.ok(response)
        }
    }
    
    /**
     * 모든 사이트 크롤링 실행
     */
    @PostMapping("/run/all")
    fun runAllCrawlers(): ResponseEntity<Map<String, Any>> {
        return try {
            val sites = listOf("saramin", "jobkorea", "wanted")
            val results = mutableListOf<Map<String, Any>>()
            var totalJobs = 0
            
            for (site in sites) {
                val result = webCrawlerService.crawlSite(site)
                totalJobs += result.jobsFound
                
                results.add(mapOf(
                    "siteName" to result.siteName,
                    "success" to result.success,
                    "jobsFound" to result.jobsFound,
                    "executionTime" to "${result.executionTime}초",
                    "error" to (result.error ?: "")
                ))
            }
            
            val response: Map<String, Any> = mapOf(
                "success" to true,
                "message" to "전체 사이트 크롤링이 완료되었습니다.",
                "totalJobsFound" to totalJobs,
                "results" to results
            )
            
            ResponseEntity.ok(response)
        } catch (e: Exception) {
            val response = mapOf(
                "success" to false,
                "message" to "전체 크롤링 실행 중 오류가 발생했습니다: ${e.message}",
                "results" to emptyList<Any>()
            )
            ResponseEntity.ok(response)
        }
    }
    
    /**
     * 크롤링 작업 상태 조회
     */
    @GetMapping("/jobs")
    fun getCrawlerJobs(
        @RequestParam(required = false) siteName: String?,
        @RequestParam(required = false) status: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<List<*>> {
        val jobs = crawlerService.getCrawlerJobs(siteName, null, size, page * size)
        return ResponseEntity.ok(jobs)
    }
    
    /**
     * 크롤링 통계 조회
     */
    @GetMapping("/stats")
    fun getCrawlerStats(@RequestParam(required = false) siteName: String?): ResponseEntity<List<*>> {
        val stats = crawlerService.getCrawlerStats(siteName)
        return ResponseEntity.ok(stats)
    }
    
    /**
     * 실패한 크롤링 작업 재시도
     */
    @PostMapping("/retry/failed")
    fun retryFailedJobs(): ResponseEntity<Map<String, Any>> {
        return try {
            crawlerService.processAllPendingJobs()
            
            val response = mapOf(
                "success" to true,
                "message" to "실패한 작업들의 재처리가 시작되었습니다."
            )
            
            ResponseEntity.ok(response)
        } catch (e: Exception) {
            val response = mapOf(
                "success" to false,
                "message" to "재처리 실행 중 오류가 발생했습니다: ${e.message}"
            )
            ResponseEntity.ok(response)
        }
    }
    
    /**
     * 크롤링 설정 조회
     */
    @GetMapping("/config")
    fun getCrawlerConfigs(): ResponseEntity<List<*>> {
        val configs = crawlerService.getCrawlerConfigs()
        return ResponseEntity.ok(configs)
    }
}