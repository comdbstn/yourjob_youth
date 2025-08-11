package com.yourjob.backend.service.crawler

import com.yourjob.backend.entity.crawler.CrawlerJob
import com.yourjob.backend.entity.JobRequest
import com.yourjob.backend.entity.JobResponse
import com.yourjob.backend.service.JobsService
import com.yourjob.backend.mapper.crawler.CrawlerMapper
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.slf4j.LoggerFactory
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.regex.Pattern

@Service
@Transactional
class JobPostingIntegrationService(
    private val jobsService: JobsService,
    private val crawlerMapper: CrawlerMapper
) {
    
    private val logger = LoggerFactory.getLogger(JobPostingIntegrationService::class.java)
    
    /**
     * 크롤러 데이터를 JobPosting으로 변환하여 저장
     */
    fun integrateFromCrawlerJob(crawlerJob: CrawlerJob): Boolean {
        try {
            val jobRequest = convertCrawlerJobToJobRequest(crawlerJob)
            
            // 중복 체크 (회사명 + 제목으로)
            if (isDuplicateJobPosting(jobRequest.title, jobRequest.companyName ?: "")) {
                logger.info("Duplicate job posting found: ${jobRequest.title} at ${jobRequest.companyName}")
                return false
            }
            
            // JobPosting 생성
            val createdJob = jobsService.createJobPosting(jobRequest)
            
            // 출처 정보 저장
            if (createdJob != null) {
                saveJobPostingSource(createdJob.jobId, crawlerJob)
                logger.info("Successfully integrated crawler job ${crawlerJob.crawlerId} -> job posting ${createdJob.jobId}")
                return true
            }
            
            return false
            
        } catch (e: Exception) {
            logger.error("Failed to integrate crawler job ${crawlerJob.crawlerId}: ${e.message}", e)
            return false
        }
    }
    
    /**
     * CrawlerJob을 JobRequest로 변환
     */
    private fun convertCrawlerJobToJobRequest(crawlerJob: CrawlerJob): JobRequest {
        return JobRequest(
            employerId = getSystemUserId(), // 시스템 계정 ID 
            title = cleanText(crawlerJob.jobTitle),
            description = buildJobDescription(crawlerJob),
            requirements = buildJobRequirements(crawlerJob),
            location = cleanLocation(crawlerJob.location),
            countryCode = "KR", // 기본값
            jobType = mapJobType(crawlerJob.jobType),
            salary = extractSalary(crawlerJob.salary),
            deadline = parseDeadline(crawlerJob.deadline),
            status = "OPEN", // 기본값
            companyName = cleanText(crawlerJob.companyName),
            // 추가 필드들
            experienceLevel = mapExperienceLevel(crawlerJob.experience),
            benefits = crawlerJob.benefits,
            originalUrl = crawlerJob.originalUrl,
            sourceSite = crawlerJob.siteName
        )
    }
    
    /**
     * 채용공고 설명 구성
     */
    private fun buildJobDescription(crawlerJob: CrawlerJob): String {
        val parts = mutableListOf<String>()
        
        parts.add("=== 채용 정보 ===")
        parts.add("• 회사: ${crawlerJob.companyName}")
        crawlerJob.location?.let { parts.add("• 근무지: $it") }
        crawlerJob.jobType?.let { parts.add("• 고용형태: $it") }
        crawlerJob.experience?.let { parts.add("• 경력: $it") }
        crawlerJob.salary?.let { parts.add("• 급여: $it") }
        crawlerJob.deadline?.let { parts.add("• 마감일: $it") }
        
        crawlerJob.description?.let {
            parts.add("\n=== 상세 내용 ===")
            parts.add(cleanText(it))
        }
        
        crawlerJob.benefits?.let {
            parts.add("\n=== 복리후생 ===")
            parts.add(cleanText(it))
        }
        
        parts.add("\n=== 원본 출처 ===")
        parts.add("• 출처: ${crawlerJob.siteName}")
        parts.add("• 원본 URL: ${crawlerJob.originalUrl}")
        
        return parts.joinToString("\n")
    }
    
    /**
     * 채용공고 요구사항 구성
     */
    private fun buildJobRequirements(crawlerJob: CrawlerJob): String {
        val parts = mutableListOf<String>()
        
        crawlerJob.requirements?.let {
            parts.add(cleanText(it))
        } ?: run {
            parts.add("상세한 요구사항은 원본 공고를 확인해주세요.")
        }
        
        crawlerJob.experience?.let {
            parts.add("\n경력 요구사항: $it")
        }
        
        return parts.joinToString("\n")
    }
    
    /**
     * 텍스트 정리 (HTML 태그 제거, 특수문자 정리 등)
     */
    private fun cleanText(text: String): String {
        return text
            .replace(Regex("<[^>]*>"), "") // HTML 태그 제거
            .replace(Regex("\\s+"), " ") // 연속된 공백 제거
            .replace(Regex("[\\r\\n]+"), "\n") // 연속된 줄바꿈 정리
            .trim()
    }
    
    /**
     * 위치 정보 정리
     */
    private fun cleanLocation(location: String?): String? {
        if (location.isNullOrBlank()) return null
        
        return location
            .replace(Regex("\\s*,\\s*"), ", ") // 쉼표 주변 공백 정리
            .replace(Regex("\\s+"), " ") // 연속 공백 제거
            .trim()
    }
    
    /**
     * 고용형태 매핑
     */
    private fun mapJobType(jobType: String?): String? {
        if (jobType.isNullOrBlank()) return null
        
        return when (jobType.lowercase()) {
            "정규직", "full-time" -> "정규직"
            "계약직", "contract" -> "계약직"
            "인턴", "intern", "인턴십" -> "인턴"
            "파견직" -> "파견직"
            "프리랜서", "freelance" -> "프리랜서"
            "아르바이트", "part-time" -> "아르바이트"
            else -> jobType
        }
    }
    
    /**
     * 경력 수준 매핑
     */
    private fun mapExperienceLevel(experience: String?): String? {
        if (experience.isNullOrBlank()) return null
        
        return when {
            experience.contains("신입") -> "신입"
            experience.contains("경력") -> "경력"
            experience.contains("무관") -> "경력무관"
            else -> experience
        }
    }
    
    /**
     * 급여 정보 추출 (숫자만 추출)
     */
    private fun extractSalary(salary: String?): Double? {
        if (salary.isNullOrBlank()) return null
        
        try {
            // 숫자와 소수점만 추출
            val numberPattern = Pattern.compile("([0-9,]+(?:\\.[0-9]+)?)")
            val matcher = numberPattern.matcher(salary)
            
            if (matcher.find()) {
                val numberStr = matcher.group(1).replace(",", "")
                val number = numberStr.toDoubleOrNull()
                
                // 단위 추정 (만원 단위로 변환)
                return when {
                    salary.contains("만원") || salary.contains("만") -> number
                    salary.contains("천만") -> number?.times(1000)
                    number != null && number > 10000 -> number / 10000 // 원 단위를 만원으로 변환
                    else -> number
                }
            }
        } catch (e: Exception) {
            logger.warn("Failed to parse salary: $salary", e)
        }
        
        return null
    }
    
    /**
     * 마감일 파싱
     */
    private fun parseDeadline(deadline: String?): LocalDate? {
        if (deadline.isNullOrBlank() || deadline.contains("상시")) return null
        
        try {
            // 다양한 날짜 형식 지원
            val datePatterns = listOf(
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("yyyy.MM.dd"),
                DateTimeFormatter.ofPattern("MM/dd"),
                DateTimeFormatter.ofPattern("yyyy년 MM월 dd일")
            )
            
            for (pattern in datePatterns) {
                try {
                    return LocalDate.parse(deadline.trim(), pattern)
                } catch (e: Exception) {
                    // 다음 패턴 시도
                }
            }
            
            // 상대적 날짜 파싱 (예: "3일 후", "1주일 후")
            when {
                deadline.contains("일 후") -> {
                    val days = Regex("(\\d+)일").find(deadline)?.groupValues?.get(1)?.toIntOrNull()
                    days?.let { return LocalDate.now().plusDays(it.toLong()) }
                }
                deadline.contains("주") -> {
                    val weeks = Regex("(\\d+)주").find(deadline)?.groupValues?.get(1)?.toIntOrNull()
                    weeks?.let { return LocalDate.now().plusWeeks(it.toLong()) }
                }
            }
            
        } catch (e: Exception) {
            logger.warn("Failed to parse deadline: $deadline", e)
        }
        
        return null
    }
    
    /**
     * 중복 채용공고 확인
     */
    private fun isDuplicateJobPosting(title: String, companyName: String): Boolean {
        // 제목과 회사명의 유사도 기반으로 중복 판단
        return crawlerMapper.checkDuplicateJobPosting(title, companyName) > 0
    }
    
    /**
     * 채용공고 출처 정보 저장
     */
    private fun saveJobPostingSource(jobId: Int, crawlerJob: CrawlerJob) {
        crawlerMapper.insertJobPostingSource(
            jobId = jobId,
            crawlerId = crawlerJob.crawlerId,
            sourceType = "CRAWLER",
            originalSite = crawlerJob.siteName,
            originalUrl = crawlerJob.originalUrl,
            originalJobId = crawlerJob.originalJobId
        )
    }
    
    /**
     * 시스템 사용자 ID 반환 (크롤러용 계정)
     */
    private fun getSystemUserId(): Int {
        // 시스템 계정이나 크롤러 전용 계정 ID 반환
        // 실제 구현시에는 시스템 계정을 미리 생성해두고 그 ID를 반환
        return 1 // 임시값
    }
}