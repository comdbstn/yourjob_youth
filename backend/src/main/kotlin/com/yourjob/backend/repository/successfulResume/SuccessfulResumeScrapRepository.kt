package com.yourjob.backend.repository.successfulResume

import com.yourjob.backend.entity.successfulResume.*
import jakarta.transaction.Transactional
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
@Repository
interface SuccessfulResumeScrapRepository : JpaRepository<SuccessfulResumeScrap, Long> {
    fun findByUserId(userId: Long): List<SuccessfulResumeScrap>
    fun findByUserIdAndSuccessfulResumeResumeId(userId: Long, resumeId: Long): SuccessfulResumeScrap?

    @Query("SELECT COUNT(s) FROM SuccessfulResumeScrap s WHERE s.successfulResume.resumeId = :resumeId")
    fun countByResumeId(@Param("resumeId") resumeId: Long): Long

    @Modifying
    @Transactional
    @Query("DELETE FROM SuccessfulResumeScrap s WHERE s.successfulResume.resumeId = :resumeId")
    fun deleteBySuccessfulResumeId(@Param("resumeId") resumeId: Long)
}