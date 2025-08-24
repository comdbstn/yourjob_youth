package com.yourjob.backend.entity.mdms

import jakarta.persistence.*
import java.time.LocalDateTime

/**
 * 채용 제안을 관리하기 위한 Entity
 */
@Entity
@Table(name = "job_offers")
data class JobOfferManagement(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "joboffer_id")
    val jobOfferId: Long? = null,

    @Column(name = "job_id")
    val jobId: Long? = null,

    @Column(name = "employer_id")
    val employerId: Long? = null,

    @Column(name = "job_seeker_id")
    val jobSeekerId: Long? = null,

    @Column(name = "resume_id")
    val resumeId: Long? = null,

    @Column(name = "message")
    val message: String? = null,

    @Column(name = "position")
    val position: String? = null,

    @Column(name = "positionInfo")
    val positionInfo: String? = null,

    @Column(name = "status")
    val status: String? = null,

    @Column(name = "interview_status")
    val interviewStatus: String? = null,

    @Column(name = "manager")
    val manager: String? = null,

    @Column(name = "created_at")
    val createdAt: LocalDateTime? = null,

    @Column(name = "updated_at")
    val updatedAt: LocalDateTime? = null
)

/**
 * 채용 제안 정보 응답을 위한 DTO
 */
data class JobOfferManagementDto(
    val jobOfferId: Long,
    val jobId: Long?,
    val employerId: String?, // 구직회원명 (users 테이블의 account_id)
    val jobSeekerId: Long?,
    val jobSeekerAccountId: String?, // 구직회원명 (users 테이블의 account_id)
    val resumeId: Long?,
    val message: String?,
    val position: String?,
    val positionInfo: String?,
    val status: String?,
    val interviewStatus: String?,
    val manager: String?,
    val createdAt: String?,
    val updatedAt: String?,
    // 조인된 추가 정보
    val jobInfoTitle: String?, // job_postings의 title
    val resumeTitle: String?  // resumes의 title
)

/**
 * 페이징된 채용 제안 정보 응답을 위한 DTO
 */
data class JobOfferManagementPageResponse(
    val content: List<JobOfferManagementDto>,
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
 * 채용 제안 필터링을 위한 DTO
 */
data class JobOfferManagementSearchFilter(
    val status: String? = null,
    val interviewStatus: String? = null,
    val keyword: String? = null,
    val employerId: Long? = null,
    val jobSeekerId: Long? = null,
    val startDate: String? = null,
    val endDate: String? = null,
    val page: Int = 0,
    val size: Int = 10
)

/**
 * 채용 제안 상태 변경 요청을 위한 DTO
 */
data class JobOfferStatusUpdateRequest(
    val jobOfferIds: List<Long>,
    val status: String
)

/**
 * 면접 상태 변경 요청을 위한 DTO
 */
data class InterviewStatusUpdateRequest(
    val jobOfferIds: List<Long>,
    val interviewStatus: String
)

/**
 * 채용 제안 삭제 요청을 위한 DTO
 */
data class JobOfferDeleteRequest(
    val jobOfferIds: List<Long>
)