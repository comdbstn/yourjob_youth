package com.yourjob.backend.service.successfulResume

import com.yourjob.backend.entity.editor.SummernoteImageUploadResponse
import com.yourjob.backend.entity.successfulResume.*
import com.yourjob.backend.repository.successfulResume.*
import com.yourjob.backend.util.FileUtils
import jakarta.persistence.EntityNotFoundException
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDate
import java.time.LocalDateTime

@Service
class SuccessfulResumeService(
    private val resumeRepository: SuccessfulResumeRepository,
    private val jobPostRepository: SuccessfulResumeJobPostRepository,
    private val questionAnswerRepository: SuccessfulResumeQuestionAnswerRepository,
    private val successfulResumeCompanyRepository: SuccessfulResumeCompanyRepository,
    private val templateRepository: SuccessfulResumeTemplateRepository,
    private val scrapRepository: SuccessfulResumeScrapRepository
) {
    @Transactional(readOnly = true)
    fun getAllResumes(
        keyword: String?,
        jobCategories: List<String>?,
        countries: List<String>?,
        pageable: Pageable
    ): Page<SuccessfulResume> {
        val nonEmptyJobCategories =
            if (jobCategories.isNullOrEmpty()) null else jobCategories.filter { it.isNotEmpty() }
        val nonEmptyCountries = if (countries.isNullOrEmpty()) null else countries.filter { it.isNotEmpty() }

        if (nonEmptyJobCategories?.isEmpty() == true && nonEmptyCountries?.isEmpty() == true) {
            return resumeRepository.findBySearchConditions(
                keyword,
                null,
                null,
                pageable
            )
        }

        return resumeRepository.findBySearchConditions(
            keyword,
            nonEmptyJobCategories,
            nonEmptyCountries,
            pageable
        )
    }

    @Transactional(readOnly = true)
    fun getAllResumes(
        keyword: String?,
        jobCategory: String?,
        country: String?,
        pageable: Pageable
    ): Page<SuccessfulResume> {
        val jobCategories = jobCategory?.let {
            if (it.contains('|')) it.split('|').filter { cat -> cat.isNotEmpty() }
            else listOf(it)
        }

        val countries = country?.let {
            if (it.contains('|')) it.split('|').filter { cntry -> cntry.isNotEmpty() }
            else listOf(it)
        }

        return getAllResumes(keyword, jobCategories, countries, pageable)
    }

    @Transactional(readOnly = true)
    fun getResumeById(resumeId: Long): SuccessfulResume {
        return resumeRepository.findById(resumeId)
            .orElseThrow { EntityNotFoundException("Resume with id $resumeId not found") }
    }

    @Transactional(readOnly = true)
    fun getMyResumes(userId: Any): List<SuccessfulResume> {
        return resumeRepository.findByUserId(userId.toString().toLong())
    }

    @Transactional(readOnly = true)
    fun getResumesByUserId(userId: Any): List<SuccessfulResume> {
        return resumeRepository.findByUserId(userId.toString().toLong())
    }

    @Transactional(readOnly = true)
    fun getResumeDetail(resumeId: Long): ResumeDetailDto {
        val resume = getResumeById(resumeId)
        val answers = questionAnswerRepository.findByResumeResumeIdOrderByQuestionIdx(resumeId)

        val resumeDto = SuccessfulResumeDto(
            resumeId = resume.resumeId,
            title = resume.title,
            companyName = resume.jobPost.company.companyName,
            jobCategory = resume.jobPost.jobCategory,
            jobTitle = resume.jobPost.jobTitle,
            schoolRegion = resume.schoolRegion,
            schoolType = resume.schoolType,
            major = resume.major,
            gpa = resume.gpa?.toString(),
            gpaScale = resume.gpaScale?.toString(),
            awardsCount = resume.awardsCount,
            clubActivitiesCount = resume.clubActivitiesCount,
            internshipCount = resume.internshipCount,
            certificationCount = resume.certificationCount,
            viewCount = resume.viewCount,
            corpLogoUrl = resume.jobPost.company.corpLogoUrl,
            createdAt = resume.createdAt
        )

        val answerDtos = answers.map { answer ->
            SuccessfulResumeQuestionAnswerDto(
                questionText = answer.questionText,
                answerText = answer.answerText,
                characterCount = answer.characterCount,
                byteCount = answer.byteCount,
                questionIdx = answer.questionIdx
            )
        }

        return ResumeDetailDto(resumeDto, answerDtos)
    }

    @Transactional
    fun incrementViewCount(resumeId: Long) {
        val resume = getResumeById(resumeId)
        val updatedResume = resume.copy(viewCount = resume.viewCount + 1)
        resumeRepository.save(updatedResume)
    }

    @Transactional
    fun createSuccessfulResume(userId: Any, request: CreateSuccessfulResumeRequest): CreateSuccessfulResumeResponse {
        val jobPost = jobPostRepository.findById(request.jobPostId)
            .orElseThrow { EntityNotFoundException("Job post with id ${request.jobPostId} not found") }

        val resume = SuccessfulResume(
            title = request.title,
            userId = userId.toString().toLong(),
            jobPost = jobPost,
            schoolRegion = request.schoolRegion,
            schoolType = request.schoolType,
            major = request.major,
            gpa = request.gpa?.toBigDecimalOrNull(),
            gpaScale = request.gpaScale?.toBigDecimalOrNull(),
            awardsCount = request.awardsCount ?: 0,
            clubActivitiesCount = request.clubActivitiesCount ?: 0,
            internshipCount = request.internshipCount ?: 0,
            certificationCount = request.certificationCount ?: 0
        )

        val savedResume = resumeRepository.save(resume)

        request.answers.forEach { answerRequest ->
            val answer = SuccessfulResumeQuestionAnswer(
                resume = savedResume,
                questionText = answerRequest.questionText,
                answerText = answerRequest.answerText,
                characterCount = answerRequest.answerText.length,
                byteCount = answerRequest.answerText.toByteArray().size,
                questionIdx = answerRequest.questionIdx
            )
            savedResume.questionAnswers.add(answer)
            questionAnswerRepository.save(answer)
        }

        return CreateSuccessfulResumeResponse(savedResume.resumeId)
    }

    @Transactional
    fun updateSuccessfulResume(resumeId: Long, request: UpdateSuccessfulResumeRequest): SuccessfulResume {
        val resume = getResumeById(resumeId)
        val existingJobPost = resume.jobPost
        val existingCompany = existingJobPost.company

        val shouldUpdateCompany = existingCompany.companyName != request.companyName
        val shouldUpdateJobPost = existingJobPost.jobCategory != request.jobCategory ||
                existingJobPost.jobTitle != request.jobTitle ||
                (request.countryType != null && existingJobPost.countryType != request.countryType)

        val company = if (shouldUpdateCompany) {
            val existingCompanyWithName =
                successfulResumeCompanyRepository.findByCompanyNameContaining(request.companyName)
                    .firstOrNull()

            if (existingCompanyWithName != null) {
                if (request.companyLogoUrl != null && existingCompanyWithName.corpLogoUrl != request.companyLogoUrl) {
                    val updatedCompany = existingCompanyWithName.copy(
                        corpLogoUrl = request.companyLogoUrl,
                        updatedAt = LocalDateTime.now()
                    )
                    successfulResumeCompanyRepository.save(updatedCompany)
                } else {
                    existingCompanyWithName
                }
            } else {
                val newCompany = SuccessfulResumeCompany(
                    companyName = request.companyName,
                    countryType = CountryType.대한민국,
                    corpLogoUrl = request.companyLogoUrl,
                    createdAt = LocalDateTime.now(),
                    updatedAt = LocalDateTime.now()
                )
                successfulResumeCompanyRepository.save(newCompany)
            }
        } else if (request.companyLogoUrl != null && existingCompany.corpLogoUrl != request.companyLogoUrl) {
            val updatedCompany = existingCompany.copy(
                corpLogoUrl = request.companyLogoUrl,
                updatedAt = LocalDateTime.now()
            )
            successfulResumeCompanyRepository.save(updatedCompany)
        } else {
            existingCompany
        }

        val jobPost = if (shouldUpdateJobPost || shouldUpdateCompany) {
            val existingJobPostWithInfo = jobPostRepository.findByCompanyAndJobCategoryAndJobTitle(
                company,
                request.jobCategory,
                request.jobTitle
            ).firstOrNull()

            if (existingJobPostWithInfo != null) {
                existingJobPostWithInfo
            } else {
                val newJobPost = SuccessfulResumeJobPost(
                    company = company,
                    jobCategory = request.jobCategory,
                    jobTitle = request.jobTitle,
                    countryType = request.countryType ?: existingJobPost.countryType,
                    postPeriod = existingJobPost.postPeriod,
                    careerLevel = existingJobPost.careerLevel,
                    createdAt = LocalDateTime.now(),
                    updatedAt = LocalDateTime.now()
                )
                jobPostRepository.save(newJobPost)
            }
        } else {
            existingJobPost
        }

        val updatedResume = resume.copy(
            title = request.resumeTitle,
            jobPost = jobPost,
            schoolRegion = request.schoolRegion,
            schoolType = request.schoolType,
            major = request.major,
            gpa = request.gpa?.toBigDecimalOrNull(),
            gpaScale = request.gpaScale?.toBigDecimalOrNull(),
            awardsCount = request.awardsCount ?: 0,
            clubActivitiesCount = request.clubActivitiesCount ?: 0,
            internshipCount = request.internshipCount ?: 0,
            certificationCount = request.certificationCount ?: 0,
            updatedAt = LocalDateTime.now()
        )

        val savedResume = resumeRepository.save(updatedResume)

        questionAnswerRepository.deleteAll(resume.questionAnswers)

        val newAnswers = request.answers.map { answerRequest ->
            SuccessfulResumeQuestionAnswer(
                resume = savedResume,
                questionText = answerRequest.questionText,
                answerText = answerRequest.answerText,
                characterCount = answerRequest.answerText.length,
                byteCount = answerRequest.answerText.toByteArray().size,
                questionIdx = answerRequest.questionIdx,
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now()
            )
        }

        questionAnswerRepository.saveAll(newAnswers)

        return savedResume
    }

    @Transactional
    fun deleteResume(resumeId: Long): Boolean {
        return try {
            val resume = resumeRepository.findById(resumeId)
                .orElseThrow { EntityNotFoundException("Resume with id $resumeId not found") }

            questionAnswerRepository.deleteByResumeId(resumeId)
            scrapRepository.deleteBySuccessfulResumeId(resumeId)
            resumeRepository.deleteById(resumeId)

            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    @Transactional
    fun bulkDeleteResumes(resumeIds: List<Long>): DeleteResultResponse {
        var successCount = 0
        var failCount = 0

        resumeIds.forEach { resumeId ->
            if (deleteResume(resumeId)) {
                successCount++
            } else {
                failCount++
            }
        }

        return DeleteResultResponse(successCount, failCount)
    }
}