package com.yourjob.backend.entity.mdms

import jakarta.persistence.*
import java.time.LocalDateTime




/**
 * 입사지원 검색 필터
 */
data class ApplicationManagementSearchFilter(
    val status: String? = null,
    val startDate: String? = null,
    val endDate: String? = null,
    val keyword: String? = null,
    val page: Int = 0,
    val size: Int = 10
)

/**
 * 일괄 삭제 요청 DTO
 */
data class BulkDeleteApplicationRequest(
    val ids: List<Long>
)

/**
 * 페이징된 입사지원 정보 응답을 위한 DTO
 */
data class ApplicationManagementPageResponse(
    val content: List<ApplicationsManagementDto>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
    val number: Int,
    val first: Boolean,
    val last: Boolean,
    val numberOfElements: Int,
    val empty: Boolean
)
/**
 * 입사지원 정보 DTO
 */
data class ApplicationsManagementDto(
    val id: Long,
    val jobId: Long,
    val jobSeekerId: Long,
    val resumeId: Long,
    val status: String,
    val createdAt: String,
    val updatedAt: String,
    // 조인된 추가 정보
    val jobInfoTitle: String?,
    val jobInfoUrl: String?,
    val jobSeekerAccountId: String?,
    val employerId: String?,
    val resumeTitle: String?,
    val resumeUrl: String?
)

/**
 * 페이징된 입사지원 정보 응답 DTO
 */
data class PagedApplicationsManagementResponse(
    val content: List<ApplicationsManagementDto>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
    val number: Int,
    val first: Boolean,
    val last: Boolean,
    val numberOfElements: Int,
    val empty: Boolean
)