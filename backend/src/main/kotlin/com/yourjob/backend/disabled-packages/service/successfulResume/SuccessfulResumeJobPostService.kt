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
class SuccessfulResumeJobPostService(
    private val jobPostRepository: SuccessfulResumeJobPostRepository,
    private val companyRepository: SuccessfulResumeCompanyRepository
) {
    @Transactional(readOnly = true)
    fun getAllJobPosts(): List<SuccessfulResumeJobPost> {
        return jobPostRepository.findAll()
    }

    @Transactional(readOnly = true)
    fun getJobPostById(jobPostId: Long): SuccessfulResumeJobPost {
        return jobPostRepository.findById(jobPostId)
            .orElseThrow { EntityNotFoundException("Job post with id $jobPostId not found") }
    }

    @Transactional(readOnly = true)
    fun searchJobPosts(companyId: Long?, query: String?, pageable: Pageable): Page<SuccessfulResumeJobPost> {
        if (companyId != null) {
            return jobPostRepository.findByCompanyCompanyId(companyId, pageable)
        }

        if (query != null) {
            return jobPostRepository.findBySearchConditions(query, pageable)
        }

        return jobPostRepository.findBySearchConditions(null, pageable)
    }

    /*@Transactional
    fun createJobPost(companyId: Long, jobCategory: String, jobTitle: String): SuccessfulResumeJobPost {
        val company = companyRepository.findById(companyId)
            .orElseThrow { EntityNotFoundException("Company with id $companyId not found") }

        val jobPost = SuccessfulResumeJobPost(
            company = company,
            jobCategory = jobCategory,
            jobTitle = jobTitle
        )

        return jobPostRepository.save(jobPost)
    }*/
}