package com.yourjob.backend.repository.mdms

import com.yourjob.backend.entity.mdms.JobOfferManagement
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface JobOfferManagementRepository : JpaRepository<JobOfferManagement, Long> {

    /**
     * 상태로 필터링하여 채용 제안 조회
     */
    @Query(value = """
        SELECT * FROM job_offers 
        WHERE (:status IS NULL OR status = :status)
        ORDER BY created_at DESC
    """, nativeQuery = true)
    fun findByStatus(@Param("status") status: String?): List<JobOfferManagement>

    /**
     * 고용주 ID로 채용 제안 조회
     */
    @Query(value = """
        SELECT * FROM job_offers 
        WHERE employer_id = :employerId
        ORDER BY created_at DESC
    """, nativeQuery = true)
    fun findByEmployerId(@Param("employerId") employerId: Long): List<JobOfferManagement>

    /**
     * 구직자 ID로 채용 제안 조회
     */
    @Query(value = """
        SELECT * FROM job_offers 
        WHERE job_seeker_id = :jobSeekerId
        ORDER BY created_at DESC
    """, nativeQuery = true)
    fun findByJobSeekerId(@Param("jobSeekerId") jobSeekerId: Long): List<JobOfferManagement>

    /**
     * 채용공고 ID로 채용 제안 조회
     */
    @Query(value = """
        SELECT * FROM job_offers 
        WHERE job_id = :jobId
        ORDER BY created_at DESC
    """, nativeQuery = true)
    fun findByJobId(@Param("jobId") jobId: Long): List<JobOfferManagement>

    /**
     * 이력서 ID로 채용 제안 조회
     */
    @Query(value = """
        SELECT * FROM job_offers 
        WHERE resume_id = :resumeId
        ORDER BY created_at DESC
    """, nativeQuery = true)
    fun findByResumeId(@Param("resumeId") resumeId: Long): List<JobOfferManagement>

    /**
     * 채용 제안 상태 변경
     */
    @Query(value = """
        UPDATE job_offers
        SET status = :status,
            updated_at = NOW()
        WHERE joboffer_id = :id
    """, nativeQuery = true)
    fun updateStatus(@Param("id") id: Long, @Param("status") status: String): Int

    /**
     * 면접 상태 변경
     */
    @Query(value = """
        UPDATE job_offers
        SET interview_status = :interviewStatus,
            updated_at = NOW()
        WHERE joboffer_id = :id
    """, nativeQuery = true)
    fun updateInterviewStatus(@Param("id") id: Long, @Param("interviewStatus") interviewStatus: String): Int

    /**
     * 날짜 범위로 채용 제안 조회
     */
    @Query(value = """
        SELECT * FROM job_offers 
        WHERE created_at BETWEEN :startDate AND :endDate
        ORDER BY created_at DESC
    """, nativeQuery = true)
    fun findByCreatedAtBetween(
        @Param("startDate") startDate: LocalDateTime,
        @Param("endDate") endDate: LocalDateTime
    ): List<JobOfferManagement>
}