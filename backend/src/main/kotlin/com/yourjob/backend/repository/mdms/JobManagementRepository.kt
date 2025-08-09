package com.yourjob.backend.repository.mdms

import com.yourjob.backend.entity.mdms.JobManagement
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface JobManagementRepository : JpaRepository<JobManagement, Long> {

    /**
     * 상태로 필터링하여 채용 정보 조회
     */
    @Query(value = """
        SELECT * FROM job_postings 
        WHERE (:status IS NULL OR status = :status)
        ORDER BY created_at DESC
    """, nativeQuery = true)
    fun findByStatus(@Param("status") status: String?): List<JobManagement>

    /**
     * 상태 변경
     */
    @Query(value = """
        UPDATE job_postings
        SET status = :status,
            updated_at = NOW()
        WHERE job_id = :id
    """, nativeQuery = true)
    fun updateStatus(@Param("id") id: Long, @Param("status") status: String): Int
}