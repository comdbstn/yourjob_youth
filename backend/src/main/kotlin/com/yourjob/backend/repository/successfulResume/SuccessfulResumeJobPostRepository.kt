package com.yourjob.backend.repository.successfulResume

import com.yourjob.backend.entity.successfulResume.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
@Repository
interface SuccessfulResumeJobPostRepository : JpaRepository<SuccessfulResumeJobPost, Long> {
    fun findByJobCategoryContaining(jobCategory: String, pageable: Pageable): Page<SuccessfulResumeJobPost>

    @Query("SELECT sjp FROM SuccessfulResumeJobPost sjp JOIN sjp.company c WHERE c.companyName = :companyName")
    fun findByCompanyName(@Param("companyName") companyName: String): List<SuccessfulResumeJobPost>

    fun findByCompanyCompanyId(companyId: Long, pageable: Pageable): Page<SuccessfulResumeJobPost>

    @Query("SELECT jp FROM SuccessfulResumeJobPost jp WHERE (:query IS NULL OR jp.jobTitle LIKE %:query% OR jp.company.companyName LIKE %:query%)")
    fun findBySearchConditions(@Param("query") query: String?, pageable: Pageable): Page<SuccessfulResumeJobPost>

    fun findByCompanyAndJobCategoryAndJobTitle(
        company: SuccessfulResumeCompany,
        jobCategory: String,
        jobTitle: String
    ): List<SuccessfulResumeJobPost>
}