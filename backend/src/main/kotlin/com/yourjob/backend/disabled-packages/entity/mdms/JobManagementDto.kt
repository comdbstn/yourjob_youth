package com.yourjob.backend.entity.mdms

/**
 * 채용 정보 조회를 위한 DTO
 * 생성자 파라미터 순서와 타입이 중요합니다!
 */
data class JobManagementDto(
    val id: Long,
    val jobId: Long,
    val employerId: Long,
    val userId: String,
    val url: String?,
    val title: String,
    val position: String?,
    val location: String?,
    val address: String?,
    val startDate: String?,
    val endDate: String?,
    val registeredDate: String,
    val deadline: String?,
    val locationType: String?,
    val region: String?,
    val regionCode: String?,
    val jobType: String?,
    val jobTypeCode: String?,
    val status: String,
    val companyName: String?,
    val corpthmbImgidx: Long?
) {
    // 후처리를 위한 필드들
    var logoUrl: String? = null
    var description: String? = null
}
