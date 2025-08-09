package com.yourjob.backend.service.successfulResume

import com.yourjob.backend.entity.successfulResume.*
import com.yourjob.backend.repository.successfulResume.*
import jakarta.persistence.EntityNotFoundException
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
@Service
class SuccessfulResumeTemplateService(
    private val templateRepository: SuccessfulResumeTemplateRepository,
    private val jobPostRepository: SuccessfulResumeJobPostRepository
) {
    @Transactional(readOnly = true)
    fun getAllTemplates(): List<SuccessfulResumeTemplate> {
        return templateRepository.findAll()
    }

    @Transactional(readOnly = true)
    fun getAllTemplatesAsDto(): List<SuccessfulResumeTemplateDto> {
        val templates = templateRepository.findAll()
        return templates.map { template ->
            SuccessfulResumeTemplateDto(
                templateId = template.templateId,
                jobPostId = template.jobPost?.jobPostId,
                jobCategory = template.jobPost?.jobCategory,
                jobTitle = template.jobPost?.jobTitle,
                companyName = template.jobPost?.company?.companyName,
                questionText = template.questionText,
                questionIdx = template.questionIdx,
                isRequired = template.isRequired
            )
        }
    }

    @Transactional(readOnly = true)
    fun getAllTemplatesGroupedByJobPost(): List<JobPostTemplateGroupDto> {
        val templates = templateRepository.findAll()

        // 템플릿을 jobPostId로 그룹화
        return templates
            .groupBy { it.jobPost?.jobPostId }
            .mapNotNull { (jobPostId, templateList) ->
                if (jobPostId == null) return@mapNotNull null

                // 해당 jobPostId의 첫 번째 템플릿에서 공통 정보 추출
                val firstTemplate = templateList.first()
                JobPostTemplateGroupDto(
                    jobPostId = jobPostId,
                    jobCategory = firstTemplate.jobPost?.jobCategory,
                    jobTitle = firstTemplate.jobPost?.jobTitle,
                    companyName = firstTemplate.jobPost?.company?.companyName,
                    // questionIdx로 정렬된 템플릿 목록
                    templates = templateList
                        .sortedBy { it.questionIdx }
                        .map { template ->
                            TemplateItemDto(
                                questionText = template.questionText,
                                questionIdx = template.questionIdx,
                                isRequired = template.isRequired
                            )
                        }
                )
            }
    }

    @Transactional(readOnly = true)
    fun getTemplateById(templateId: Long): SuccessfulResumeTemplate {
        return templateRepository.findById(templateId)
            .orElseThrow { EntityNotFoundException("Template with id $templateId not found") }
    }

    @Transactional(readOnly = true)
    fun getTemplatesByJobPostId(jobPostId: Long): List<SuccessfulResumeTemplate> {
        return templateRepository.findByJobPostJobPostIdOrderByQuestionIdx(jobPostId)
    }

    @Transactional(readOnly = true)
    fun getTemplatesByCompanyId(companyId: Long): List<SuccessfulResumeTemplate> {
        return templateRepository.findByCompanyId(companyId)
    }

    @Transactional(readOnly = true)
    fun getTemplatesForJobPostAsDto(jobPostId: Long): List<SuccessfulResumeTemplateDto> {
        val templates = templateRepository.findByJobPostJobPostIdOrderByQuestionIdx(jobPostId)
        return templates.map { template ->
            SuccessfulResumeTemplateDto(
                templateId = template.templateId,
                jobPostId = template.jobPost?.jobPostId,
                jobCategory = template.jobPost?.jobCategory,
                jobTitle = template.jobPost?.jobTitle,
                companyName = template.jobPost?.company?.companyName,
                questionText = template.questionText,
                questionIdx = template.questionIdx,
                isRequired = template.isRequired
            )
        }
    }

    @Transactional(readOnly = true)
    fun getTemplateForJobPostGrouped(jobPostId: Long): JobPostTemplateGroupDto? {
        val templates = templateRepository.findByJobPostJobPostIdOrderByQuestionIdx(jobPostId)
        if (templates.isEmpty()) return null

        val firstTemplate = templates.first()
        return JobPostTemplateGroupDto(
            jobPostId = jobPostId,
            jobCategory = firstTemplate.jobPost?.jobCategory,
            jobTitle = firstTemplate.jobPost?.jobTitle,
            companyName = firstTemplate.jobPost?.company?.companyName,
            templates = templates.map { template ->
                TemplateItemDto(
                    questionText = template.questionText,
                    questionIdx = template.questionIdx,
                    isRequired = template.isRequired
                )
            }
        )
    }

    @Transactional
    fun createTemplate(
        jobPostId: Long?,
        questionContent: String,
        questionIdx: Int,
        isRequired: Boolean
    ): SuccessfulResumeTemplate {
        val jobPost = jobPostId?.let {
            jobPostRepository.findById(it)
                .orElseThrow { EntityNotFoundException("Job post with id $it not found") }
        }

        val template = SuccessfulResumeTemplate(
            jobPost = jobPost,
            questionText = questionContent,
            questionIdx = questionIdx,
            isRequired = isRequired
        )

        return templateRepository.save(template)
    }
}