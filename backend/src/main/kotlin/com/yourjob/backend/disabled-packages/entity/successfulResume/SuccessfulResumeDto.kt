package com.yourjob.backend.entity.successfulResume

import java.time.LocalDateTime

// DTO 클래스들
data class SuccessfulResumeDto(
    val resumeId: Long,
    val title: String,
    val companyName: String,
    val jobCategory: String,
    val jobTitle: String,
    val schoolRegion: String?,
    val schoolType: String?,
    val major: String?,
    val gpa: String?,
    val gpaScale: String?,
    val awardsCount: Int,
    val clubActivitiesCount: Int,
    val internshipCount: Int,
    val certificationCount: Int,
    val viewCount: Int,
    val corpLogoUrl: String?, // Company logo URL
    val createdAt: LocalDateTime
)

data class ResumeDetailDto(
    val resume: SuccessfulResumeDto,
    val answers: List<SuccessfulResumeQuestionAnswerDto>
)

data class SuccessfulResumeQuestionAnswerDto(
    val questionText: String,
    val answerText: String,
    val characterCount: Int?,
    val byteCount: Int?,
    val questionIdx: Int?
)

data class SuccessfulResumeTemplateDto(
    val templateId: Long,
    val jobPostId: Long?,
    val jobCategory: String?,
    val jobTitle: String?,
    val companyName: String?,
    val questionText: String?,
    val questionIdx: Int?,
    val isRequired: Boolean
)

data class CreateSuccessfulResumeRequest(
    val title: String,
    val jobPostId: Long,
    val schoolRegion: String?,
    val schoolType: String?,
    val major: String?,
    val gpa: String?,
    val gpaScale: String?,
    val awardsCount: Int?,
    val clubActivitiesCount: Int?,
    val internshipCount: Int?,
    val certificationCount: Int?,
    val answers: List<CreateResumeAnswerRequest>
)

data class CreateResumeAnswerRequest(
    val questionText: String,
    val answerText: String,
    val questionIdx: Int?
)

data class CreateSuccessfulResumeResponse(
    val resumeId: Long,
    val message: String = "합격자소서가 성공적으로 등록되었습니다."
)

// 수정된 DTO 클래스들
data class JobPostTemplateGroupDto(
    val jobPostId: Long,
    val jobCategory: String?,
    val jobTitle: String?,
    val companyName: String?,
    val templates: List<TemplateItemDto>
)

data class TemplateItemDto(
    val questionText: String?,
    val questionIdx: Int?,
    val isRequired: Boolean
)

data class UpdateSuccessfulResumeRequest(
    val resumeTitle: String,
    val companyName: String,
    val countryType: String?,
    val companyLogoUrl: String?,
    val jobCategory: String,
    val jobTitle: String,
    val userId: Long?,
    val schoolRegion: String?,
    val schoolType: String?,
    val major: String?,
    val gpa: String?,
    val gpaScale: String?,
    val awardsCount: Int?,
    val clubActivitiesCount: Int?,
    val internshipCount: Int?,
    val certificationCount: Int?,
    val answers: List<UpdateResumeAnswerRequest>
)

data class UpdateResumeAnswerRequest(
    val questionText: String,
    val answerText: String,
    val questionIdx: Int?
)


data class ResumeIdsRequest(
    val resumeIds: List<Long>
)

data class DeleteResultResponse(
    val successCount: Int,
    val failCount: Int
)