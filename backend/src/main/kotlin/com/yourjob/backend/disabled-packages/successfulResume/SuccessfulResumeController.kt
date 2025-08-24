package com.yourjob.backend.controller.resume

import com.yourjob.backend.entity.successfulResume.*
import com.yourjob.backend.service.successfulResume.*
import jakarta.servlet.http.HttpSession
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

// 공통 응답 DTO
data class ApiResponse<T>(
    val success: Boolean,
    val message: String? = null,
    val data: T? = null
)

@RestController
@RequestMapping("/api/v1/successful-resumes")
class SuccessfulResumeController(
    private val resumeService: SuccessfulResumeService,
    private val companyService: SuccessfulResumeCompanyService,
    private val jobPostService: SuccessfulResumeJobPostService,
    private val templateService: SuccessfulResumeTemplateService,
    private val scrapService: SuccessfulResumeScrapService
) {
    // 합격자소서 관련 API
    @GetMapping
    fun getResumes(
        @RequestParam(required = false) query: String?,
        @RequestParam(required = false) field: String?,
        @RequestParam(required = false) country: String?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(defaultValue = "createdAt") sortBy: String,
        @RequestParam(defaultValue = "DESC") sortDir: String
    ): ResponseEntity<ApiResponse<Page<SuccessfulResume>>> {
        val direction = if (sortDir.equals("ASC", ignoreCase = true)) Sort.Direction.ASC else Sort.Direction.DESC
        val pageable = PageRequest.of(page - 1, size, Sort.by(direction, sortBy))

        val resumes = resumeService.getAllResumes(query, field, country, pageable)
        return ResponseEntity.ok(ApiResponse(true, "합격자소서 목록 조회 성공", resumes))
    }

    @GetMapping("/{resumeId}")
    fun getResumeById(
        @PathVariable resumeId: Long,
        session: HttpSession
    ): ResponseEntity<ApiResponse<ResumeDetailDto>> {
        // 세션에서 이미 조회한 합격자소서 ID 목록을 가져옴
        val viewedResumeIds = session.getAttribute("viewedSuccessfulResumeIds") as? MutableSet<Long> ?: mutableSetOf()

        // 해당 합격자소서를 처음 조회하는 경우에만 조회수 증가
        if (!viewedResumeIds.contains(resumeId)) {
            resumeService.incrementViewCount(resumeId)

            // 조회한 합격자소서 ID를 세션에 추가
            viewedResumeIds.add(resumeId)
            session.setAttribute("viewedSuccessfulResumeIds", viewedResumeIds)
        }

        val resumeDetail = resumeService.getResumeDetail(resumeId)
        return ResponseEntity.ok(ApiResponse(true, "합격자소서 상세 정보 조회 성공", resumeDetail))
    }

    @GetMapping("/my")
    fun getMyResumes(session: HttpSession): ResponseEntity<ApiResponse<List<SuccessfulResume>>> {
        var userId = session.getAttribute("userId")
        if (userId == null) {
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        val resumes = resumeService.getMyResumes(userId)
        return ResponseEntity.ok(ApiResponse(true, "내 합격자소서 목록", resumes))
    }

    @PostMapping
    fun createResume(
        session: HttpSession,
        @RequestBody request: CreateSuccessfulResumeRequest
    ): ResponseEntity<ApiResponse<CreateSuccessfulResumeResponse>> {
        var userId = session.getAttribute("userId")
        if (userId == null) {
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        val response = resumeService.createSuccessfulResume(userId, request)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse(true, "합격자소서가 성공적으로 등록되었습니다.", response))
    }

    // 기업 관련 API
    @GetMapping("/companies")
    fun getCompanies(
        @RequestParam(required = false) name: String?,
        @RequestParam(required = false) countryType: CountryType?
    ): ResponseEntity<ApiResponse<List<SuccessfulResumeCompany>>> {
        val companies = companyService.searchCompanies(name, countryType)
        return ResponseEntity.ok(ApiResponse(true, "회사 목록 조회 성공", companies))
    }

    @GetMapping("/companies/{companyId}")
    fun getCompanyById(@PathVariable companyId: Long): ResponseEntity<ApiResponse<SuccessfulResumeCompany>> {
        val company = companyService.getCompanyById(companyId)
        return ResponseEntity.ok(ApiResponse(true, "회사 정보 조회 성공", company))
    }

    // 직무 공고 관련 API
    @GetMapping("/job-posts")
    fun getJobPosts(
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false) query: String?,
        @RequestParam(required = false) jobCategory: String?
    ): ResponseEntity<ApiResponse<Page<SuccessfulResumeJobPost>>> {
        val pageable = PageRequest.of(page - 1, size)

        val jobPosts = jobPostService.searchJobPosts(null, query, pageable)

        return ResponseEntity.ok(ApiResponse(true, "공고 목록 조회 성공", jobPosts))
    }

    @GetMapping("/job-posts/{jobPostId}")
    fun getJobPostById(@PathVariable jobPostId: Long): ResponseEntity<ApiResponse<SuccessfulResumeJobPost>> {
        val jobPost = jobPostService.getJobPostById(jobPostId)
        return ResponseEntity.ok(ApiResponse(true, "공고 정보 조회 성공", jobPost))
    }

    @GetMapping("/job-posts/company/{companyId}")
    fun getJobPostsByCompany(@RequestParam(defaultValue = "1") page: Int,
                             @RequestParam(defaultValue = "10") size: Int,
                             @PathVariable companyId: Long): ResponseEntity<ApiResponse<Page<SuccessfulResumeJobPost>>> {
        val pageable = PageRequest.of(page - 1, size)
        val jobPosts = jobPostService.searchJobPosts(companyId, null, pageable)
        return ResponseEntity.ok(ApiResponse(true, "회사별 공고 목록", jobPosts))
    }

    // 템플릿 관련 API
    @GetMapping("/templates")
    fun getTemplates(
        @RequestParam(required = false) jobPostId: Long?
    ): ResponseEntity<ApiResponse<Any>> {
        return if (jobPostId != null) {
            // 특정 jobPostId에 대한 템플릿 요청
            val groupedTemplate = templateService.getTemplateForJobPostGrouped(jobPostId)
            if (groupedTemplate != null) {
                ResponseEntity.ok(ApiResponse(true, "템플릿 목록 조회 성공", groupedTemplate))
            } else {
                ResponseEntity.ok(ApiResponse(false, "해당 공고에 대한 템플릿이 없습니다.", null))
            }
        } else {
            // 전체 템플릿 요청 - 그룹화해서 반환
            val groupedTemplates = templateService.getAllTemplatesGroupedByJobPost()
            ResponseEntity.ok(ApiResponse(true, "템플릿 목록 조회 성공", groupedTemplates))
        }
    }

    // 스크랩 관련 API
    @PostMapping("/{resumeId}/scrap")
    fun scrapResume(
        session: HttpSession,
        @PathVariable resumeId: Long
    ): ResponseEntity<ApiResponse<Boolean>> {
        var userId = session.getAttribute("userId")
        if (userId == null) {
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        val result = scrapService.scrapResume(userId, resumeId)

        return if (result) {
            ResponseEntity.ok(ApiResponse(true, "합격자소서 스크랩 성공", true))
        } else {
            ResponseEntity.ok(ApiResponse(false, "이미 스크랩한 합격자소서입니다.", false))
        }
    }

    @DeleteMapping("/{resumeId}/scrap")
    fun unscrapResume(
        session: HttpSession,
        @PathVariable resumeId: Long
    ): ResponseEntity<ApiResponse<Boolean>> {
        var userId = session.getAttribute("userId")
        if (userId == null) {
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        val result = scrapService.unscrapResume(userId, resumeId)

        return if (result) {
            ResponseEntity.ok(ApiResponse(true, "합격자소서 스크랩 취소 성공", true))
        } else {
            ResponseEntity.ok(ApiResponse(false, "스크랩하지 않은 합격자소서입니다.", false))
        }
    }

    @GetMapping("/scraps")
    fun getUserScraps(session: HttpSession): ResponseEntity<ApiResponse<List<SuccessfulResumeScrap>>> {
        var userId = session.getAttribute("userId")
        if (userId == null) {
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        val scraps = scrapService.getUserScraps(userId)
        return ResponseEntity.ok(ApiResponse(true, "스크랩 목록 조회 성공", scraps))
    }

    @GetMapping("/{resumeId}/is-scraped")
    fun checkIfScraped(
        session: HttpSession,
        @PathVariable resumeId: Long
    ): ResponseEntity<ApiResponse<Boolean>> {
        var userId = session.getAttribute("userId")
        if (userId == null) {
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        val isScraped = scrapService.checkIfScraped(userId, resumeId)
        return ResponseEntity.ok(ApiResponse(true, "스크랩 여부 확인", isScraped))
    }

    @PutMapping("/{resumeId}")
    fun updateResume(
        @PathVariable resumeId: Long,
        @RequestBody request: UpdateSuccessfulResumeRequest
    ): ResponseEntity<ApiResponse<SuccessfulResume>> {
        val updatedResume = resumeService.updateSuccessfulResume(resumeId, request)
        return ResponseEntity.ok(ApiResponse(true, "합격자소서가 성공적으로 수정되었습니다.", updatedResume))
    }


    // 삭제 API
    @DeleteMapping("/{resumeId}")
    fun deleteResume(@PathVariable resumeId: Long): ResponseEntity<ApiResponse<Boolean>> {
        val result = resumeService.deleteResume(resumeId)
        return ResponseEntity.ok(ApiResponse(result, "합격자소서가 성공적으로 삭제되었습니다.", result))
    }

    // 벌크 삭제 API
    @DeleteMapping("/bulk-delete")
    fun bulkDeleteResumes(@RequestBody request: ResumeIdsRequest): ResponseEntity<ApiResponse<DeleteResultResponse>> {
        val result = resumeService.bulkDeleteResumes(request.resumeIds)
        return ResponseEntity.ok(ApiResponse(
            true,
            "${result.successCount}개의 합격자소서가 성공적으로 삭제되었습니다.",
            result
        ))
    }

    private fun getUserIdFromUserDetails(userDetails: UserDetails): Long {

        return userDetails.username.toLong()
    }
}