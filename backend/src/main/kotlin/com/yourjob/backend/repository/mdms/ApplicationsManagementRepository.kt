package com.yourjob.backend.repository.mdms

import com.yourjob.backend.entity.mdms.ApplicationManagement
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface ApplicationsManagementRepository : JpaRepository<ApplicationManagement, Long> {

    /**
     * 필터링 조건에 따라 입사지원 정보 조회
     * JPA 기반의 객체지향 쿼리 사용
     */
    @Query("""
        SELECT a, j.title, r.title, ju.accountId, eu.accountId
        FROM ApplicationManagement a
        LEFT JOIN JobManagement j ON a.jobId = j.id
        LEFT JOIN ResumeManagement r ON a.resumeId = r.resumeId
        LEFT JOIN UserManagement ju ON a.jobSeekerId = ju.userId
        LEFT JOIN UserManagement eu ON j.employerId = eu.userId
        WHERE 
            (:status IS NULL OR a.status = :status)
            AND (:keyword IS NULL OR 
                j.title LIKE %:keyword% OR 
                r.title LIKE %:keyword% OR 
                ju.accountId LIKE %:keyword% OR 
                eu.accountId LIKE %:keyword%)
            AND ((:startDate IS NULL OR :endDate IS NULL) OR 
                (a.createdAt BETWEEN :startDate AND :endDate))
            AND (:jobId IS NULL OR a.jobId = :jobId)
            AND (:resumeId IS NULL OR a.resumeId = :resumeId)
        ORDER BY a.createdAt DESC
    """)
    fun findApplicationsWithFilters(
        @Param("status") status: String?,
        @Param("keyword") keyword: String?,
        @Param("startDate") startDate: LocalDateTime?,
        @Param("endDate") endDate: LocalDateTime?,
        @Param("jobId") jobId: Long?,
        @Param("resumeId") resumeId: Long?
    ): List<Array<Any>>

    /**
     * 여러 개의 ID로 일괄 삭제
     */
    fun deleteByIdIn(ids: List<Long>)

    /**
     * 이력서 ID를 기준으로 입사지원 정보 조회
     */
    @Query("""
        SELECT a
        FROM ApplicationManagement a
        WHERE a.resumeId = :resumeId
        ORDER BY a.createdAt DESC
    """)
    fun findByResumeId(@Param("resumeId") resumeId: Long): List<ApplicationManagement>
}