package com.yourjob.backend.controller.resume

import com.yourjob.backend.entity.editor.SummernoteImageUploadResponse
import com.yourjob.backend.entity.successfulResume.*
import com.yourjob.backend.repository.successfulResume.SuccessfulResumeJobPostRepository
import com.yourjob.backend.service.successfulResume.*
import com.yourjob.backend.util.FileUtils
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDate

@RestController
@RequestMapping("/api/v1/bulk-import")
class SuccessfulResumeBulkImporter(
    private val resumeService: SuccessfulResumeService,
    private val companyService: SuccessfulResumeCompanyService,
    private val jobPostService: SuccessfulResumeJobPostService,
    private val templateService: SuccessfulResumeTemplateService,
    private val jobPostRepository: SuccessfulResumeJobPostRepository,
    private val fileUtils: FileUtils
) {
    // 기업 벌크 등록 API
    @PostMapping("/companies")
    fun importCompanies(
        @RequestBody companies: List<CompanyImportRequest>
    ): ResponseEntity<ApiResponse<List<SuccessfulResumeCompany>>> {
        val savedCompanies = companies.map { request ->
            val company = SuccessfulResumeCompany(
                companyName = request.companyName,
                countryType = request.countryType,
                corpLogoUrl = request.corpLogoUrl
            )
            companyService.createCompany(company)
        }

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse(true, "기업 ${savedCompanies.size}개 등록 완료", savedCompanies))
    }

    // 공고 벌크 등록 API
    @PostMapping("/job-posts")
    fun importJobPosts(
        @RequestBody jobPosts: List<JobPostImportRequest>
    ): ResponseEntity<ApiResponse<List<JobPostImportResponse>>> {
        val responses = mutableListOf<JobPostImportResponse>()

        jobPosts.forEach { request ->
            try {
                val company = companyService.getCompanyById(request.companyId)

                val jobPost = SuccessfulResumeJobPost(
                    company = company,
                    jobCategory = request.jobCategory,
                    jobTitle = request.jobTitle,
                    countryType = request.countryType ?: "대한민국",
                    postPeriod = request.postPeriod ?: "",
                    careerLevel = request.careerLevel ?: ""
                )

                // JobPostService에 저장 기능 추가 필요
                val savedJobPost = jobPostRepository.save(jobPost)

                // 템플릿 등록 (선택적)
                if (request.templates != null && request.templates.isNotEmpty()) {
                    request.templates.forEachIndexed { index, templateText ->
                        templateService.createTemplate(
                            savedJobPost.jobPostId,
                            templateText,
                            index,
                            true
                        )
                    }
                }

                responses.add(JobPostImportResponse(savedJobPost.jobPostId, true, null))
            } catch (e: Exception) {
                responses.add(JobPostImportResponse(null, false, e.message))
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse(true, "공고 ${responses.count { it.success }} / ${responses.size}개 등록 완료", responses))
    }

    // 합격자소서 벌크 등록 API
    @PostMapping("/successful-resumes")
    fun importSuccessfulResumes(
        @RequestBody resumes: List<ResumeImportRequest>
    ): ResponseEntity<ApiResponse<List<ResumeImportResponse>>> {
        val responses = mutableListOf<ResumeImportResponse>()

        resumes.forEach { request ->
            try {
                val createRequest = CreateSuccessfulResumeRequest(
                    title = request.title,
                    jobPostId = request.jobPostId,
                    schoolRegion = request.schoolRegion,
                    schoolType = request.schoolType,
                    major = request.major,
                    gpa = request.gpa,
                    gpaScale = request.gpaScale,
                    awardsCount = request.awardsCount,
                    clubActivitiesCount = request.clubActivitiesCount,
                    internshipCount = request.internshipCount,
                    certificationCount = request.certificationCount,
                    answers = request.answers.map { answer ->
                        CreateResumeAnswerRequest(
                            questionText = answer.questionText,
                            answerText = answer.answerText,
                            questionIdx = answer.questionIdx
                        )
                    }
                )

                val userId = request.userId ?: 1L // 기본값 설정 (크롤링 데이터용)
                val response = resumeService.createSuccessfulResume(userId, createRequest)
                responses.add(ResumeImportResponse(response.resumeId, true, null))
            } catch (e: Exception) {
                responses.add(ResumeImportResponse(null, false, e.message))
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse(true, "합격자소서 ${responses.count { it.success }} / ${responses.size}개 등록 완료", responses))
    }

    @PostMapping("/uploadimage")
    fun uploadSummernoteImage(@RequestParam("file") file: MultipartFile): ResponseEntity<SummernoteImageUploadResponse> {
        // 파일 저장 처리
        val rootPath = "uploads"
        val type = "companies"
        val yearDate = LocalDate.now().toString()

        // FileUtils를 사용하여 파일 저장 및 UUID 얻기
        val uuid = fileUtils.fileSave(rootPath, type, yearDate, file)

        // 이미지 URL 생성 (S3 또는 로컬 경로)
        val imageUrl = fileUtils.getFileUrl(rootPath, type, yearDate, uuid, file.originalFilename ?: "unnamed")

        return ResponseEntity.ok(SummernoteImageUploadResponse(url = imageUrl))
    }

    // 올인원 등록 API (한번에 모든 데이터 입력)
    @PostMapping("/all-in-one")
    fun importAllInOne(
        @RequestBody request: AllInOneImportRequest
    ): ResponseEntity<ApiResponse<AllInOneImportResponse>> {
        val company = companyService.createCompany(
            SuccessfulResumeCompany(
                companyName = request.companyName,
                countryType = request.countryType ?: CountryType.대한민국,
                corpLogoUrl = request.corpLogoUrl
            )
        )

        val jobPost = SuccessfulResumeJobPost(
            company = company,
            jobCategory = request.jobCategory,
            jobTitle = request.jobTitle,
            countryType = request.countryType?.name ?: "대한민국",
            postPeriod = request.postPeriod ?: "",
            careerLevel = request.careerLevel ?: ""
        )

        val savedJobPost = jobPostRepository.save(jobPost)

        // 템플릿 생성 (자소서 문항으로부터)
        request.answers.forEachIndexed { index, answer ->
            templateService.createTemplate(
                savedJobPost.jobPostId,
                answer.questionText,
                index,
                true
            )
        }

        // 합격자소서 생성
        val createRequest = CreateSuccessfulResumeRequest(
            title = request.resumeTitle,
            jobPostId = savedJobPost.jobPostId,
            schoolRegion = request.schoolRegion,
            schoolType = request.schoolType,
            major = request.major,
            gpa = request.gpa,
            gpaScale = request.gpaScale,
            awardsCount = request.awardsCount,
            clubActivitiesCount = request.clubActivitiesCount,
            internshipCount = request.internshipCount,
            certificationCount = request.certificationCount,
            answers = request.answers.map { answer ->
                CreateResumeAnswerRequest(
                    questionText = answer.questionText,
                    answerText = answer.answerText,
                    questionIdx = answer.questionIdx
                )
            }
        )

        val userId = request.userId ?: 40L
        val response = resumeService.createSuccessfulResume(userId, createRequest)

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse(true, "등록 완료", AllInOneImportResponse(
                companyId = company.companyId,
                jobPostId = savedJobPost.jobPostId,
                resumeId = response.resumeId
            )))
    }

}

// 요청/응답 DTO 클래스들
data class CompanyImportRequest(
    val companyName: String,
    val countryType: CountryType = CountryType.대한민국,
    val corpLogoUrl: String? = null
)

data class JobPostImportRequest(
    val companyId: Long,
    val jobCategory: String,
    val jobTitle: String,
    val countryType: String? = null,
    val postPeriod: String? = null,
    val careerLevel: String? = null,
    val templates: List<String>? = null
)

data class JobPostImportResponse(
    val jobPostId: Long?,
    val success: Boolean,
    val errorMessage: String?
)

data class ResumeImportRequest(
    val title: String,
    val jobPostId: Long,
    val userId: Long? = null,
    val schoolRegion: String? = null,
    val schoolType: String? = null,
    val major: String? = null,
    val gpa: String? = null,
    val gpaScale: String? = null,
    val awardsCount: Int? = null,
    val clubActivitiesCount: Int? = null,
    val internshipCount: Int? = null,
    val certificationCount: Int? = null,
    val answers: List<AnswerImportRequest>
)

data class AnswerImportRequest(
    val questionText: String,
    val answerText: String,
    val questionIdx: Int? = null
)

data class ResumeImportResponse(
    val resumeId: Long?,
    val success: Boolean,
    val errorMessage: String?
)

data class AllInOneImportRequest(
    // 회사 정보
    val companyName: String,
    val countryType: CountryType? = null,
    val corpLogoUrl: String? = null,

    // 공고 정보
    val jobCategory: String,
    val jobTitle: String,
    val postPeriod: String? = null,
    val careerLevel: String? = null,

    // 자소서 정보
    val resumeTitle: String,
    val userId: Long? = null,
    val schoolRegion: String? = null,
    val schoolType: String? = null,
    val major: String? = null,
    val gpa: String? = null,
    val gpaScale: String? = null,
    val awardsCount: Int? = null,
    val clubActivitiesCount: Int? = null,
    val internshipCount: Int? = null,
    val certificationCount: Int? = null,

    // 자소서 문항 및 답변
    val answers: List<AnswerImportRequest>
)

data class AllInOneImportResponse(
    val companyId: Long,
    val jobPostId: Long,
    val resumeId: Long
)