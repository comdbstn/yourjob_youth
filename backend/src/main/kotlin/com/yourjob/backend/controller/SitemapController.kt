package com.yourjob.backend.controller

import com.yourjob.backend.service.SitemapService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1")
class SitemapController(
    private val sitemapService: SitemapService
) {
    
    /**
     * 동적 sitemap을 XML 형식으로 제공합니다.
     */
    @GetMapping("/sitemap.xml", produces = [MediaType.APPLICATION_XML_VALUE])
    fun getSitemap(): ResponseEntity<String> {
        val sitemapXml = sitemapService.generateDynamicSitemap()
        return ResponseEntity.ok(sitemapXml)
    }
    
    /**
     * 루트 경로에서도 sitemap에 접근할 수 있도록 합니다.
     */
    @GetMapping("/sitemap", produces = [MediaType.APPLICATION_XML_VALUE])
    fun getSitemapAlternative(): ResponseEntity<String> {
        val sitemapXml = sitemapService.generateDynamicSitemap()
        return ResponseEntity.ok(sitemapXml)
    }
} 