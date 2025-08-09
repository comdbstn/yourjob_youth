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
interface SuccessfulResumeQuestionAnswerRepository : JpaRepository<SuccessfulResumeQuestionAnswer, Long> {
    fun findByResumeResumeId(resumeId: Long): List<SuccessfulResumeQuestionAnswer>
    fun findByResumeResumeIdOrderByQuestionIdx(resumeId: Long): List<SuccessfulResumeQuestionAnswer>

    @Modifying
    @Transactional
    @Query("DELETE FROM SuccessfulResumeQuestionAnswer qa WHERE qa.resume.resumeId = :resumeId")
    fun deleteByResumeId(@Param("resumeId") resumeId: Long)
}