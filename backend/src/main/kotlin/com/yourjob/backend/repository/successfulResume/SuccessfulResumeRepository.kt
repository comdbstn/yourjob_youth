package com.yourjob.backend.repository.successfulResume

import com.yourjob.backend.entity.successfulResume.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface SuccessfulResumeRepository : JpaRepository<SuccessfulResume, Long> {
    fun findByUserId(userId: Long): List<SuccessfulResume>
    fun findByJobPostJobPostId(jobPostId: Long): List<SuccessfulResume>

    @Query("SELECT sr FROM SuccessfulResume sr JOIN sr.jobPost jp JOIN jp.company c WHERE c.companyId = :companyId")
    fun findByCompanyId(@Param("companyId") companyId: Long): List<SuccessfulResume>

    @Query("SELECT sr FROM SuccessfulResume sr JOIN sr.jobPost jp WHERE jp.jobCategory = :jobCategory")
    fun findByJobCategory(@Param("jobCategory") jobCategory: String): List<SuccessfulResume>

    @Query("""
        SELECT sr FROM SuccessfulResume sr 
        JOIN sr.jobPost jp 
        JOIN jp.company c 
        WHERE (:keyword IS NULL OR c.companyName LIKE %:keyword% OR sr.title LIKE %:keyword% OR jp.jobTitle LIKE %:keyword%)
        AND (:#{#fields == null} = true OR jp.jobCategory IN :fields)
        AND (:#{#countries == null} = true OR sr.schoolRegion IN :countries)
        ORDER BY sr.createdAt DESC
    """)
    fun findBySearchConditions(
        @Param("keyword") keyword: String?,
        @Param("fields") fields: List<String>?,
        @Param("countries") countries: List<String>?,
        pageable: Pageable
    ): Page<SuccessfulResume>
}