package com.yourjob.backend.repository.mdms

import com.yourjob.backend.entity.mdms.ResumeManagement
import com.yourjob.backend.entity.mdms.ResumeCareerManagement
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface ResumeManagementRepository : JpaRepository<ResumeManagement, Long> {
    @Query("""
        SELECT r, u.accountId 
        FROM ResumeManagement r 
        LEFT JOIN UserManagement u ON r.jobSeekerId = u.userId 
        WHERE (:keyword IS NULL OR 
                r.title LIKE %:keyword% OR 
                r.name LIKE %:keyword% OR 
                r.region LIKE %:keyword%)
        AND (:gender IS NULL OR r.gender = :gender)
        AND (:status IS NULL OR r.status = :status)
        AND (:country IS NULL OR r.nationality = :country)
        AND (:region IS NULL OR r.region = :region)
        AND (:jobSeekerId IS NULL OR r.jobSeekerId = :jobSeekerId)
        AND ((:startDate IS NULL OR :endDate IS NULL) OR 
              (r.createdAt BETWEEN :startDate AND :endDate))
        ORDER BY r.createdAt DESC
    """)
    fun findResumesByFilters(
        @Param("keyword") keyword: String?,
        @Param("gender") gender: String?,
        @Param("status") status: String?,
        @Param("country") country: String?,
        @Param("region") region: String?,
        @Param("jobSeekerId") jobSeekerId: String?,
        @Param("startDate") startDate: LocalDateTime?,
        @Param("endDate") endDate: LocalDateTime?
    ): List<Array<Any>>  // Changed return type to include account_id
}