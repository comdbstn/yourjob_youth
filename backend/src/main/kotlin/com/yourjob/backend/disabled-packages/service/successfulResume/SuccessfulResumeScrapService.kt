package com.yourjob.backend.service.successfulResume

import com.yourjob.backend.entity.successfulResume.*
import com.yourjob.backend.repository.successfulResume.*
import jakarta.persistence.EntityNotFoundException
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
@Service
class SuccessfulResumeScrapService(
    private val scrapRepository: SuccessfulResumeScrapRepository,
    private val resumeRepository: SuccessfulResumeRepository
) {
    @Transactional(readOnly = true)
    fun getUserScraps(userId: Any): List<SuccessfulResumeScrap> {
        return scrapRepository.findByUserId(userId.toString().toLong())
    }

    @Transactional(readOnly = true)
    fun checkIfScraped(userId: Any, resumeId: Long): Boolean {
        return scrapRepository.findByUserIdAndSuccessfulResumeResumeId(userId.toString().toLong(), resumeId) != null
    }

    @Transactional(readOnly = true)
    fun getScrapCount(resumeId: Long): Long {
        return scrapRepository.countByResumeId(resumeId)
    }

    @Transactional
    fun scrapResume(userId: Any, resumeId: Long): Boolean {
        // 이미 스크랩한 경우 중복 방지
        if (checkIfScraped(userId, resumeId)) {
            return false
        }

        val resume = resumeRepository.findById(resumeId)
            .orElseThrow { EntityNotFoundException("Resume with id $resumeId not found") }

        val scrap = SuccessfulResumeScrap(
            userId = userId.toString().toLong(),
            successfulResume = resume
        )

        scrapRepository.save(scrap)
        return true
    }

    @Transactional
    fun unscrapResume(userId: Any, resumeId: Long): Boolean {
        val scrap = scrapRepository.findByUserIdAndSuccessfulResumeResumeId(userId.toString().toLong(), resumeId)
            ?: return false

        scrapRepository.delete(scrap)
        return true
    }
}
