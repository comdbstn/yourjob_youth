package com.yourjob.backend.repository.successfulResume

import com.yourjob.backend.entity.successfulResume.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
@Repository
interface SuccessfulResumeTemplateRepository : JpaRepository<SuccessfulResumeTemplate, Long> {
    fun findByJobPostJobPostId(jobPostId: Long): List<SuccessfulResumeTemplate>
    fun findByJobPostJobPostIdOrderByQuestionIdx(jobPostId: Long): List<SuccessfulResumeTemplate>

    @Query("SELECT srt FROM SuccessfulResumeTemplate srt JOIN srt.jobPost jp JOIN jp.company c " +
            "WHERE c.companyId = :companyId")
    fun findByCompanyId(@Param("companyId") companyId: Long): List<SuccessfulResumeTemplate>
}
