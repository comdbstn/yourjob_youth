package com.yourjob.backend.service

import com.yourjob.backend.service.mdms.JobManagementService
import com.yourjob.backend.service.mdms.CommunityPostManagementService
import com.yourjob.backend.service.successfulResume.SuccessfulResumeService
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import org.springframework.data.domain.PageRequest

@Service
class SitemapService(
    private val jobManagementService: JobManagementService,
    private val communityPostManagementService: CommunityPostManagementService,
    private val successfulResumeService: SuccessfulResumeService
) {
    
    private val baseUrl = "https://urjob.kr"
    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    
    data class SitemapUrl(
        val loc: String,
        val lastmod: String,
        val changefreq: String,
        val priority: String
    )
    
    /**
     * 동적 sitemap XML을 생성합니다.
     */
    fun generateDynamicSitemap(): String {
        val urls = mutableListOf<SitemapUrl>()
        
        // 정적 페이지들 추가
        urls.addAll(getStaticUrls())
        
        // 동적 페이지들 추가
        urls.addAll(getDynamicJobUrls())
        urls.addAll(getDynamicCommunityUrls())
        urls.addAll(getDynamicAcceptUrls())
        
        return generateSitemapXml(urls)
    }
    
    /**
     * 정적 페이지 URL들을 반환합니다.
     */
    private fun getStaticUrls(): List<SitemapUrl> {
        val today = LocalDateTime.now().format(dateFormatter)
        
        return listOf(
            // 메인 페이지
            SitemapUrl("$baseUrl/", today, "daily", "1.0"),
            
            // 마이페이지 관련
            SitemapUrl("$baseUrl/mypage", today, "daily", "0.6"),
            SitemapUrl("$baseUrl/mypage/apply", today, "daily", "0.6"),
            SitemapUrl("$baseUrl/mypage/resume", today, "daily", "0.6"),
            SitemapUrl("$baseUrl/mypage/resume/write", today, "monthly", "0.5"),
            SitemapUrl("$baseUrl/mypage/scrap", today, "daily", "0.6"),
            SitemapUrl("$baseUrl/mypage/profile", today, "monthly", "0.5"),
            SitemapUrl("$baseUrl/mypage/proposal", today, "daily", "0.6"),
            
            // 합격자소서 관련
            SitemapUrl("$baseUrl/accept/acceptlist", today, "daily", "0.7"),
            SitemapUrl("$baseUrl/accept/acceptpost", today, "daily", "0.7"),
            
            // 커뮤니티 관련
            SitemapUrl("$baseUrl/community/bbslist", today, "daily", "0.7"),
            SitemapUrl("$baseUrl/community/bbswrite", today, "monthly", "0.5"),
            SitemapUrl("$baseUrl/community/mentolist", today, "daily", "0.7"),
            SitemapUrl("$baseUrl/community/mentowrite", today, "monthly", "0.5"),
            
            // 기업회원 관련
            SitemapUrl("$baseUrl/corpmem/mypage", today, "daily", "0.6"),
            SitemapUrl("$baseUrl/corpmem/corpmodify", today, "monthly", "0.5"),
            SitemapUrl("$baseUrl/corpmem/jobpost", today, "monthly", "0.5"),
            SitemapUrl("$baseUrl/corpmem/productad", today, "monthly", "0.5"),
            SitemapUrl("$baseUrl/corpmem/productinform", today, "monthly", "0.5"),
            SitemapUrl("$baseUrl/corpmem/productmypage", today, "daily", "0.6"),
            SitemapUrl("$baseUrl/corpmem/search", today, "daily", "0.6"),
            SitemapUrl("$baseUrl/corpmem/positionhuman", today, "daily", "0.6"),
            SitemapUrl("$baseUrl/corpmem/scraphuman", today, "daily", "0.6"),
            SitemapUrl("$baseUrl/corpmem/latesthuman", today, "daily", "0.6"),
            SitemapUrl("$baseUrl/corpmem/applicant", today, "daily", "0.6"),
            
            // 채용공고 관련
            SitemapUrl("$baseUrl/jobs", today, "daily", "0.8"),
            SitemapUrl("$baseUrl/jobpost/joblistover", today, "daily", "0.8"),
            
            // 회원 관련
            SitemapUrl("$baseUrl/member/userlogin", today, "monthly", "0.5"),
            SitemapUrl("$baseUrl/member/corpjoin", today, "monthly", "0.5"),
            SitemapUrl("$baseUrl/member/join", today, "monthly", "0.5"),
            SitemapUrl("$baseUrl/member/findcomplete", today, "monthly", "0.4"),
            SitemapUrl("$baseUrl/member/findidpwd", today, "monthly", "0.4"),
            SitemapUrl("$baseUrl/member/joincomplete", today, "monthly", "0.4"),
            
            // 약관 페이지
            SitemapUrl("$baseUrl/terms", today, "monthly", "0.3"),
            SitemapUrl("$baseUrl/privacy-policy", today, "monthly", "0.3"),
            SitemapUrl("$baseUrl/terms/service", today, "monthly", "0.3"),
            SitemapUrl("$baseUrl/terms/privacy", today, "monthly", "0.3"),
            
            // 모바일 페이지
            SitemapUrl("$baseUrl/m", today, "daily", "0.8"),
            SitemapUrl("$baseUrl/m/termsView", today, "monthly", "0.3"),
            SitemapUrl("$baseUrl/m/mypage", today, "daily", "0.6"),
            SitemapUrl("$baseUrl/m/mypage/editMyPage", today, "monthly", "0.5"),
            SitemapUrl("$baseUrl/m/mypage/resume", today, "daily", "0.6"),
            SitemapUrl("$baseUrl/m/mypage/writeResume", today, "monthly", "0.5"),
            SitemapUrl("$baseUrl/m/mypage/proposal", today, "daily", "0.6"),
            SitemapUrl("$baseUrl/m/mypage/apply", today, "daily", "0.6"),
            SitemapUrl("$baseUrl/m/mypage/scrap", today, "daily", "0.6"),
            SitemapUrl("$baseUrl/m/member/userlogin", today, "monthly", "0.5"),
            SitemapUrl("$baseUrl/m/member/join", today, "monthly", "0.5"),
            SitemapUrl("$baseUrl/m/member/corplogin", today, "monthly", "0.5"),
            SitemapUrl("$baseUrl/m/member/findIdPwd", today, "monthly", "0.4"),
            SitemapUrl("$baseUrl/m/member/corpJoin", today, "monthly", "0.5"),
            SitemapUrl("$baseUrl/m/member/userJoin", today, "monthly", "0.5"),
            SitemapUrl("$baseUrl/m/member/findComplete", today, "monthly", "0.4"),
            SitemapUrl("$baseUrl/m/community", today, "daily", "0.7"),
            SitemapUrl("$baseUrl/m/community/view", today, "daily", "0.7"),
            SitemapUrl("$baseUrl/m/community/writeBoard", today, "monthly", "0.5"),
            SitemapUrl("$baseUrl/m/accept", today, "daily", "0.7"),
            SitemapUrl("$baseUrl/m/accept/view", today, "daily", "0.7"),
            SitemapUrl("$baseUrl/m/jobPost", today, "daily", "0.8"),
            SitemapUrl("$baseUrl/m/jobPost/detail", today, "daily", "0.8"),
            SitemapUrl("$baseUrl/m/company/home", today, "daily", "0.6"),
            SitemapUrl("$baseUrl/m/company/productPage", today, "daily", "0.6"),
            SitemapUrl("$baseUrl/m/company/productPage/positionServiceInfo", today, "monthly", "0.4"),
            SitemapUrl("$baseUrl/m/company/productPage/bannerServiceInfo", today, "monthly", "0.4"),
            SitemapUrl("$baseUrl/m/company/searchTalent", today, "daily", "0.6"),
            SitemapUrl("$baseUrl/m/company/home/edit", today, "monthly", "0.5"),
            SitemapUrl("$baseUrl/m/company/writeRecruit", today, "monthly", "0.5"),
            SitemapUrl("$baseUrl/m/company/managePost", today, "daily", "0.6"),
            SitemapUrl("$baseUrl/m/company/manageTalent", today, "daily", "0.6"),
            SitemapUrl("$baseUrl/m/company/managePost/document", today, "daily", "0.6"),
            
            // 관리자 페이지
            SitemapUrl("$baseUrl/admin", today, "monthly", "0.3"),
            SitemapUrl("$baseUrl/admin/login", today, "monthly", "0.3")
        )
    }
    
    /**
     * 동적 채용공고 URL들을 반환합니다.
     */
    private fun getDynamicJobUrls(): List<SitemapUrl> {
        val urls = mutableListOf<SitemapUrl>()
        
        try {
            // 최근 1000개의 채용공고만 포함 (성능 고려)
            val jobs = jobManagementService.getJobsWithFilters(
                status = "채용중",
                paid = null,
                locationType = null,
                region = null,
                jobType = null,
                startDate = null,
                endDate = null,
                keyword = null,
                page = 0,
                size = 1000
            )
            
            jobs.content.forEach { job ->
                val lastmod = job.registeredDate?.let { 
                    try {
                        LocalDateTime.parse(it, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
                    } catch (e: Exception) {
                        LocalDateTime.now()
                    }
                }?.format(dateFormatter) ?: LocalDateTime.now().format(dateFormatter)
                
                urls.add(SitemapUrl(
                    "$baseUrl/jobs/${job.jobId}",
                    lastmod,
                    "weekly",
                    "0.8"
                ))
            }
        } catch (e: Exception) {
            // 로그 처리
            println("채용공고 URL 생성 중 오류: ${e.message}")
        }
        
        return urls
    }
    
    /**
     * 동적 커뮤니티 게시글 URL들을 반환합니다.
     */
    private fun getDynamicCommunityUrls(): List<SitemapUrl> {
        val urls = mutableListOf<SitemapUrl>()
        
        try {
            // 일반 커뮤니티 게시글 (categoryId: 1-5는 지역별, 0은 멘토)
            val bbsPosts = communityPostManagementService.getPostsWithFilters(
                categoryId = 1L, // 미국
                status = com.yourjob.backend.entity.mdms.PostStatus.ACTIVE,
                keyword = null,
                startDate = null,
                endDate = null,
                page = 0,
                size = 500
            )
            
            bbsPosts.content.forEach { post ->
                val lastmod = post.updatedAt?.format(dateFormatter) ?: LocalDateTime.now().format(dateFormatter)
                urls.add(SitemapUrl(
                    "$baseUrl/community/bbsview/${post.postId}",
                    lastmod,
                    "weekly",
                    "0.7"
                ))
            }
            
            // 멘토 커뮤니티 게시글
            val mentoPosts = communityPostManagementService.getPostsWithFilters(
                categoryId = 0L, // 멘토
                status = com.yourjob.backend.entity.mdms.PostStatus.ACTIVE,
                keyword = null,
                startDate = null,
                endDate = null,
                page = 0,
                size = 500
            )
            
            mentoPosts.content.forEach { post ->
                val lastmod = post.updatedAt?.format(dateFormatter) ?: LocalDateTime.now().format(dateFormatter)
                urls.add(SitemapUrl(
                    "$baseUrl/community/mentoview/${post.postId}",
                    lastmod,
                    "weekly",
                    "0.7"
                ))
            }
        } catch (e: Exception) {
            // 로그 처리
            println("커뮤니티 URL 생성 중 오류: ${e.message}")
        }
        
        return urls
    }
    
    /**
     * 동적 합격자소서 URL들을 반환합니다.
     */
    private fun getDynamicAcceptUrls(): List<SitemapUrl> {
        val urls = mutableListOf<SitemapUrl>()
        
        try {
            // 최근 1000개의 합격자소서만 포함 (성능 고려)
            val resumes = successfulResumeService.getAllResumes(
                keyword = null,
                jobCategories = null,
                countries = null,
                pageable = PageRequest.of(0, 1000)
            )
            
            resumes.content.forEach { resume ->
                val lastmod = resume.updatedAt.format(dateFormatter)
                urls.add(SitemapUrl(
                    "$baseUrl/accept/acceptdetail/${resume.resumeId}",
                    lastmod,
                    "weekly",
                    "0.7"
                ))
            }
        } catch (e: Exception) {
            // 로그 처리
            println("합격자소서 URL 생성 중 오류: ${e.message}")
        }
        
        return urls
    }
    
    /**
     * sitemap XML을 생성합니다.
     */
    private fun generateSitemapXml(urls: List<SitemapUrl>): String {
        val xmlBuilder = StringBuilder()
        xmlBuilder.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n")
        xmlBuilder.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n")
        
        urls.forEach { url ->
            xmlBuilder.append("  <url>\n")
            xmlBuilder.append("    <loc>${url.loc}</loc>\n")
            xmlBuilder.append("    <lastmod>${url.lastmod}</lastmod>\n")
            xmlBuilder.append("    <changefreq>${url.changefreq}</changefreq>\n")
            xmlBuilder.append("    <priority>${url.priority}</priority>\n")
            xmlBuilder.append("  </url>\n")
        }
        
        xmlBuilder.append("</urlset>")
        return xmlBuilder.toString()
    }
} 