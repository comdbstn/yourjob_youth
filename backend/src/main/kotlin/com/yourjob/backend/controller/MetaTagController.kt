package com.yourjob.backend.controller

import com.yourjob.backend.entity.MetaTagResponse
import com.yourjob.backend.service.MetaTagService
import com.yourjob.backend.service.MetaTagHtmlService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory

@RestController
@RequestMapping("/api/v1/seo")
class MetaTagController(
    private val metaTagService: MetaTagService,
    private val metaTagHtmlService: MetaTagHtmlService
) {

    private val baseUrl = "https://www.urjob.kr"

    /**
     * 채용공고 메타태그 HTML 생성 (크롤링 봇용)
     */
    @GetMapping("/jobs/{jobId}/html", produces = [MediaType.TEXT_HTML_VALUE])
    fun getJobMetaTagHtml(
        @PathVariable jobId: Long,
        request: HttpServletRequest
    ): ResponseEntity<String> {

        val metaTag = metaTagService.generateJobMetaTag(jobId, baseUrl)

        return if (metaTag != null) {
            val html = metaTagHtmlService.generateFullHtmlPage(metaTag)
            ResponseEntity.ok(html)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * 지원 상세 메타태그 HTML 생성 (크롤링 봇용)
     */
    @GetMapping("/accept/acceptdetail/{acceptId}/html", produces = [MediaType.TEXT_HTML_VALUE])
    fun getAcceptMetaTagHtml(
        @PathVariable acceptId: Long,
        request: HttpServletRequest
    ): ResponseEntity<String> {


        try {
            val metaTag = metaTagService.generateAcceptMetaTag(acceptId, baseUrl)

            return if (metaTag != null) {
                val html = metaTagHtmlService.generateFullHtmlPage(metaTag)
                ResponseEntity.ok(html)
            } else {
                ResponseEntity.notFound().build()
            }
        } catch (e: Exception) {
            return ResponseEntity.status(500).body("Internal Server Error: ${e.message}")
        }
    }

    /**
     * 커뮤니티 게시글 메타태그 HTML 생성 (크롤링 봇용)
     */
    @GetMapping("/community/bbsview/{postId}/html", produces = [MediaType.TEXT_HTML_VALUE])
    fun getCommunityMetaTagHtml(
        @PathVariable postId: Long,
        request: HttpServletRequest
    ): ResponseEntity<String> {
        val metaTag = metaTagService.generateCommunityMetaTag(postId, baseUrl)
        return if (metaTag != null) {
            val html = metaTagHtmlService.generateFullHtmlPage(metaTag)
            ResponseEntity.ok(html)
        } else {
            ResponseEntity.notFound().build()
        }
    }

        @GetMapping("/community/mentoview/{postId}/html", produces = [MediaType.TEXT_HTML_VALUE])
    fun getCommunityMentoMetaTagHtml(
        @PathVariable postId: Long,
        request: HttpServletRequest
    ): ResponseEntity<String> {
        val metaTag = metaTagService.generateCommunityMentoMetaTag(postId, baseUrl)
        return if (metaTag != null) {
            val html = metaTagHtmlService.generateFullHtmlPage(metaTag)
            ResponseEntity.ok(html)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    
}