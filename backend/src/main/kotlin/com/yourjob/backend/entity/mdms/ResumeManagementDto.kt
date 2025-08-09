package com.yourjob.backend.entity.mdms

data class ResumeManagementResponse(
    val resumeId: Long,
    val accountId: String,
    val title: String,
    val name: String,
    val age: Int,
    val gender: String,
    val experience: String,
    val country: String,
    val countryCode: String,
    val region: String,
    val createdAt: String,
    val status: String,
    val photoUrl: String
)

data class ResumeManagementRequest(
    val resumeId: Long? = null,
    val title: String? = null,
    val createdAt: String? = null,
    val status: String? = null,
    val created_at: String? = null,
    val carrerStartDate: String? = null,
    val carrerEndDate: String? = null,
    val accountId: String? = null,
    val photoUrl: String? = null,
    val name: String? = null,
    val birth: String? = null,
    val gender: String? = null,
    val country: String? = null,
    val region: String? = null
)

// 페이징을 위한 응답 DTO
data class PagedResumeManagementResponse(
    val content: List<ResumeManagementResponse>,
    val totalPages: Int,
    val page: Int,
    val size: Int,
    val totalElements: Int
)

// 검색 필터 DTO
data class ResumeManagementSearchFilter(
    val keyword: String? = null,
    val gender: String? = null,
    val page: Int = 0,
    val size: Int = 10,
    val status: String? = null,
    val country: String? = null,
    val region: String? = null,
    val startDate: String? = null,
    val endDate: String? = null,
    val userId: String? = null
)

// 상태 변경을 위한 요청 DTO
data class BulkStatusUpdateRequest(
    val resumeIds: List<Long>,
    val status: String
)

// 일괄 삭제를 위한 요청 DTO
data class BulkDeleteRequest(
    val resumeIds: List<Long>
)
