package com.yourjob.backend.service.mdms

import com.yourjob.backend.entity.mdms.ResumeCareerManagement
import com.yourjob.backend.repository.mdms.ResumeCareerManagementRepository
import com.yourjob.backend.repository.mdms.ResumeManagementRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.Period
import java.time.format.DateTimeFormatter
import java.util.*

/**
 * 이력서 경력 관리 서비스
 */
@Service
class ResumeCareerManagementService(
    private val resumeCareerManagementRepository: ResumeCareerManagementRepository,
    private val resumeManagementRepository: ResumeManagementRepository
) {

    /**
     * 이력서의 총 경력 기간 계산 (문자열 형식: "X년 Y개월")
     */
    @Transactional(readOnly = true)
    fun calculateTotalExperience(resumeId: Long): String {
        val careers = resumeCareerManagementRepository.findByResumeId(resumeId)

        if (careers.isEmpty()) {
            return "0년 0개월"
        }

        var totalMonths = 0

        careers.forEach { career ->
            totalMonths += calculateMonthsBetween(career.startDate, career.endDate)
        }

        val years = totalMonths / 12
        val months = totalMonths % 12

        return "${years}년 ${months}개월"
    }

    /**
     * 두 날짜 사이의 개월 수 계산
     */
    private fun calculateMonthsBetween(startDateStr: String?, endDateStr: String?): Int {
        if (startDateStr.isNullOrBlank() || endDateStr.isNullOrBlank()) {
            return 0
        }

        try {
            // 날짜 정규화 (yyyy-MM-dd 형식으로 변환)
            val normalizedStartDate = normalizeDate(startDateStr)
            val normalizedEndDate = normalizeDate(endDateStr)

            if (normalizedStartDate == null || normalizedEndDate == null) {
                return 0
            }

            val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
            val startDate = LocalDate.parse(normalizedStartDate, formatter)
            val endDate = LocalDate.parse(normalizedEndDate, formatter)

            val period = Period.between(startDate, endDate)
            return period.years * 12 + period.months
        } catch (e: Exception) {
            println("경력 개월 수 계산 오류: $startDateStr ~ $endDateStr")
            return 0
        }
    }

    // 날짜 정규화 함수 (동일한 함수 사용)
    private fun normalizeDate(dateStr: String): String? {
        if (dateStr.isBlank()) return null

        return when {
            // yyyy-MM-dd 형식은 그대로 반환
            dateStr.matches(Regex("^\\d{4}-\\d{2}-\\d{2}$")) -> dateStr

            // yyyy-MM 형식을 yyyy-MM-01로 변환
            dateStr.matches(Regex("^\\d{4}-\\d{2}$")) -> "$dateStr-01"

            // yyyy 형식을 yyyy-01-01로 변환
            dateStr.matches(Regex("^\\d{4}$")) -> "$dateStr-01-01"

            // 잘못된 형식의 경우 null 반환
            else -> {
                println("지원하지 않는 날짜 형식: $dateStr")
                null
            }
        }
    }

    /**
     * 경력 시작일과 종료일의 유효성 검사
     */
    private fun validateCareerDates(startDateStr: String?, endDateStr: String?) {
        if (startDateStr.isNullOrBlank() || endDateStr.isNullOrBlank()) {
            throw IllegalArgumentException("경력 시작일과 종료일은 필수입니다.")
        }

        try {
            val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
            val startDate = LocalDate.parse(startDateStr, formatter)
            val endDate = LocalDate.parse(endDateStr, formatter)

            if (startDate.isAfter(endDate)) {
                throw IllegalArgumentException("경력 시작일은 종료일보다 이전이어야 합니다.")
            }

            if (endDate.isAfter(LocalDate.now())) {
                throw IllegalArgumentException("경력 종료일은 현재 날짜보다 이후일 수 없습니다.")
            }
        } catch (e: Exception) {
            if (e is IllegalArgumentException) {
                throw e
            }
            throw IllegalArgumentException("날짜 형식은 YYYY-MM-DD 형식이어야 합니다.")
        }
    }

    /**
     * 특정 기간 내에 경력을 가진 이력서 ID 목록 조회
     */
    @Transactional(readOnly = true)
    fun findResumeIdsWithCareersBetween(startDate: String, endDate: String): List<Long> {
        validateDateFormat(startDate)
        validateDateFormat(endDate)

        val resumeIdsWithStartDate = resumeCareerManagementRepository.findResumeIdsByStartDateBetween(startDate, endDate)
        val resumeIdsWithEndDate = resumeCareerManagementRepository.findResumeIdsByEndDateBetween(startDate, endDate)

        return (resumeIdsWithStartDate + resumeIdsWithEndDate).distinct()
    }

    /**
     * 최소 경력 개월 수를 충족하는 이력서 ID 목록 조회
     */
    @Transactional(readOnly = true)
    fun findResumeIdsWithMinimumExperience(minimumMonths: Int): List<Long> {
        return resumeCareerManagementRepository.findResumeIdsWithExperienceMonthsGreaterThanEqual(minimumMonths)
    }

    /**
     * 날짜 형식 유효성 검사
     */
    private fun validateDateFormat(date: String) {
        try {
            LocalDate.parse(date, DateTimeFormatter.ofPattern("yyyy-MM-dd"))
        } catch (e: Exception) {
            throw IllegalArgumentException("날짜 형식은 YYYY-MM-DD 형식이어야 합니다.")
        }
    }

    /**
     * 이력서 ID와 기간으로 경력 정보 찾기
     */
    @Transactional(readOnly = true)
    fun findCareerByResumeIdAndPeriod(resumeId: Long, startDate: String, endDate: String): ResumeCareerManagement? {
        validateDateFormat(startDate)
        validateDateFormat(endDate)

        return resumeCareerManagementRepository
            .findByResumeIdAndStartDateAndEndDate(resumeId, startDate, endDate)
            .orElse(null)
    }

    /**
     * 여러 이력서 ID에 대한 총 경력 계산 (Map 형태로 반환)
     */
    @Transactional(readOnly = true)
    fun calculateTotalExperienceForMultipleResumes(resumeIds: List<Long>): Map<Long, String> {
        val result = mutableMapOf<Long, String>()

        resumeIds.forEach { resumeId ->
            result[resumeId] = calculateTotalExperience(resumeId)
        }

        return result
    }
}