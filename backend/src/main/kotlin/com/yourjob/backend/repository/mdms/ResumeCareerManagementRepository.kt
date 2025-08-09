package com.yourjob.backend.repository.mdms

import com.yourjob.backend.entity.mdms.ResumeCareerManagement
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.*

@Repository
interface ResumeCareerManagementRepository : JpaRepository<ResumeCareerManagement, Long> {

    /**
     * 이력서 ID로 경력 정보 조회
     */
    fun findByResumeId(resumeId: Long): List<ResumeCareerManagement>

    /**
     * 이력서 ID 목록으로 경력 정보 조회
     */
    fun findByResumeIdIn(resumeIds: List<Long>): List<ResumeCareerManagement>

    /**
     * 시작일 범위로 경력 정보 조회
     */
    fun findByStartDateBetween(startDate: String, endDate: String): List<ResumeCareerManagement>

    /**
     * 종료일 범위로 경력 정보 조회
     */
    fun findByEndDateBetween(startDate: String, endDate: String): List<ResumeCareerManagement>

    /**
     * 이력서 ID로 경력 정보 삭제
     */
    @Modifying
    @Query("DELETE FROM ResumeCareerManagement rc WHERE rc.resumeId = :resumeId")
    fun deleteByResumeId(@Param("resumeId") resumeId: Long): Int

    /**
     * 이력서 ID 목록으로 경력 정보 삭제
     */
    @Modifying
    @Query("DELETE FROM ResumeCareerManagement rc WHERE rc.resumeId IN :resumeIds")
    fun deleteByResumeIdIn(@Param("resumeIds") resumeIds: List<Long>): Int

    /**
     * 특정 기간 내에 시작된 경력을 가진 이력서 ID 목록 조회
     */
    @Query("SELECT DISTINCT rc.resumeId FROM ResumeCareerManagement rc WHERE rc.startDate BETWEEN :start AND :end")
    fun findResumeIdsByStartDateBetween(@Param("start") start: String, @Param("end") end: String): List<Long>

    /**
     * 특정 기간 내에 종료된 경력을 가진 이력서 ID 목록 조회
     */
    @Query("SELECT DISTINCT rc.resumeId FROM ResumeCareerManagement rc WHERE rc.endDate BETWEEN :start AND :end")
    fun findResumeIdsByEndDateBetween(@Param("start") start: String, @Param("end") end: String): List<Long>

    /**
     * 특정 이력서의 총 경력 기간을 계산 (년, 월)
     */
    @Query("""
        SELECT SUM(
            YEAR(STR_TO_DATE(rc.endDate, '%Y-%m-%d')) * 12 + MONTH(STR_TO_DATE(rc.endDate, '%Y-%m-%d')) -
            (YEAR(STR_TO_DATE(rc.startDate, '%Y-%m-%d')) * 12 + MONTH(STR_TO_DATE(rc.startDate, '%Y-%m-%d')))
        )
        FROM ResumeCareerManagement rc 
        WHERE rc.resumeId = :resumeId
    """, nativeQuery = true)
    fun calculateTotalMonthsExperienceByResumeId(@Param("resumeId") resumeId: Long): Int?

    /**
     * 경력 기간이 특정 개월 수 이상인 이력서 ID 목록 조회
     */
    @Query("""
        SELECT rc.resumeId 
        FROM ResumeCareerManagement rc 
        GROUP BY rc.resumeId 
        HAVING SUM(
            YEAR(STR_TO_DATE(rc.endDate, '%Y-%m-%d')) * 12 + MONTH(STR_TO_DATE(rc.endDate, '%Y-%m-%d')) -
            (YEAR(STR_TO_DATE(rc.startDate, '%Y-%m-%d')) * 12 + MONTH(STR_TO_DATE(rc.startDate, '%Y-%m-%d')))
        ) >= :months
    """, nativeQuery = true)
    fun findResumeIdsWithExperienceMonthsGreaterThanEqual(@Param("months") months: Int): List<Long>

    /**
     * 경력이 있는 이력서의 ID만 조회
     */
    @Query("SELECT DISTINCT rc.resumeId FROM ResumeCareerManagement rc")
    fun findAllResumeIdsWithCareers(): List<Long>

    /**
     * 이력서 ID와 시작일, 종료일로 경력 정보 조회
     */
    fun findByResumeIdAndStartDateAndEndDate(
        resumeId: Long,
        startDate: String,
        endDate: String
    ): Optional<ResumeCareerManagement>
}