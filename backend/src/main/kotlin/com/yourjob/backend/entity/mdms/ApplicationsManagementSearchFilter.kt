package com.yourjob.backend.entity.mdms

//입사지원 관리 검색 필터 데이터 클래스

data class ApplicationsManagementSearchFilter(
    val keyword: String? = null,
    val status: String? = null,
    val page: Int = 0,
    val size: Int = 10,
    val startDate: String? = null,
    val endDate: String? = null,
    val userId: String? = null,
    val jobId: Long? = null,
    val resumeId: Long? = null
)