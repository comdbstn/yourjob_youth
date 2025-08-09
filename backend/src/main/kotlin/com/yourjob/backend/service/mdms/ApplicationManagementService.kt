package com.yourjob.backend.service.mdms

import com.yourjob.backend.entity.mdms.*
import com.yourjob.backend.repository.mdms.ApplicationsManagementRepository
import com.yourjob.backend.repository.mdms.UserManagementRepository
import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class ApplicationManagementService(
    private val applicationsManagementRepository: ApplicationsManagementRepository,
    private val userManagementRepository: UserManagementRepository
) {
    @PersistenceContext
    private lateinit var entityManager: EntityManager

    /**
     * 필터링된 입사지원 목록을 조회합니다.
     */
    @Transactional(readOnly = true)
    fun getApplications(filter: ApplicationsManagementSearchFilter): PagedApplicationsManagementResponse {
        // 날짜 변환
        val startDate = filter.startDate?.let { parseToLocalDateTime(it, false) }
        val endDate = filter.endDate?.let { parseToLocalDateTime(it, true) }

        // JPA 메서드 호출로 필터링된 결과 가져오기
        val applications = applicationsManagementRepository.findApplicationsWithFilters(
            status = if (filter.status.isNullOrBlank() || filter.status == "상태") null else filter.status,
            keyword = if (filter.keyword.isNullOrBlank()) null else filter.keyword,
            startDate = startDate,
            endDate = endDate,
            jobId = filter.jobId,
            resumeId = filter.resumeId
        )

        // 페이징 처리
        val pageable = PageRequest.of(filter.page, filter.size, Sort.by(Sort.Direction.DESC, "createdAt"))
        val start = filter.page * filter.size
        val end = minOf(start + filter.size, applications.size)

        val pagedApplications = if (start < applications.size) {
            applications.subList(start, end)
        } else {
            emptyList()
        }

        // DTO 변환
        val dtoList = pagedApplications.map { resultArray ->
            val application = resultArray[0] as ApplicationManagement
            val jobTitle = resultArray[1] as String?
            val resumeTitle = resultArray[2] as String?
            val jobSeekerAccountId = resultArray[3] as String?
            val employerAccountId = resultArray[4] as String?

            ApplicationsManagementDto(
                id = application.id ?: 0,
                jobId = application.jobId ?: 0,
                jobSeekerId = application.jobSeekerId ?: 0,
                resumeId = application.resumeId ?: 0,
                status = application.status ?: "UNREAD",
                createdAt = application.createdAt?.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) ?: "",
                updatedAt = application.updatedAt?.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) ?: "",
                jobInfoTitle = jobTitle,
                jobInfoUrl = if (application.jobId != null) "/job-detail/${application.jobId}" else null,
                jobSeekerAccountId = jobSeekerAccountId,
                employerId = employerAccountId,
                resumeTitle = resumeTitle,
                resumeUrl = if (application.resumeId != null) "/resume-detail/${application.resumeId}" else null
            )
        }

        // 페이징 응답 생성
        val totalPages = (applications.size + filter.size - 1) / filter.size
        val totalElements = applications.size.toLong()

        return PagedApplicationsManagementResponse(
            content = dtoList,
            page = filter.page,
            size = filter.size,
            totalElements = totalElements,
            totalPages = totalPages,
            number = filter.page,
            first = filter.page == 0,
            last = filter.page >= totalPages - 1,
            numberOfElements = dtoList.size,
            empty = dtoList.isEmpty()
        )
    }

    /**
     * Native SQL을 사용한 입사지원 상태 일괄 업데이트
     */
    @Transactional
    fun updateApplicationsStatus(request: BulkStatusUpdateRequest): Boolean {
        try {
            val updateQuery = """
                UPDATE applications
                SET status = :status,
                    updated_at = NOW()
                WHERE application_id IN (:ids)
            """.trimIndent()

            val query = entityManager.createNativeQuery(updateQuery)
            query.setParameter("status", request.status)
            query.setParameter("ids", request.resumeIds)

            val updatedRows = query.executeUpdate()
            return updatedRows > 0
        } catch (e: Exception) {
            e.printStackTrace()
            return false
        }
    }

    /**
     * Native SQL을 사용한 입사지원 정보 일괄 삭제
     */
    @Transactional
    fun deleteApplications(request: BulkDeleteRequest): Boolean {
        try {
            val deleteQuery = """
                DELETE FROM applications
                WHERE application_id IN (:ids)
            """.trimIndent()

            val query = entityManager.createNativeQuery(deleteQuery)
            query.setParameter("ids", request.resumeIds)

            val deletedRows = query.executeUpdate()
            return deletedRows > 0
        } catch (e: Exception) {
            e.printStackTrace()
            return false
        }
    }

    /**
     * 날짜 문자열을 LocalDateTime으로 변환합니다.
     */
    private fun parseToLocalDateTime(dateStr: String, isEndDate: Boolean): LocalDateTime? {
        return try {
            val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
            val localDate = java.time.LocalDate.parse(dateStr, formatter)

            if (isEndDate) {
                localDate.atTime(23, 59, 59)
            } else {
                localDate.atStartOfDay()
            }
        } catch (e: Exception) {
            null
        }
    }
}