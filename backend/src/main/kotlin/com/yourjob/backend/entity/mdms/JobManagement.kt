package com.yourjob.backend.entity.mdms

import java.time.LocalDateTime
import jakarta.persistence.*

/**
 * 채용 정보를 관리하기 위한 Entity
 */
@Entity
@Table(name = "job_postings")
data class JobManagement(
    @Id
    @Column(name = "job_id")
    val id: Long,

    @Column(name = "employer_id")
    val employerId: Long,

    @Column(name = "title")
    val title: String,

    @Column(name = "position_str")
    val position: String?,

    @Column(name = "wrkcndtn_lct_addr")
    val location: String?,

    @Column(name = "app_strt_tm")
    val startDate: LocalDateTime?,

    @Column(name = "app_end_tm")
    val endDate: LocalDateTime?,

    @Column(name = "created_at")
    val createdAt: LocalDateTime,

    @Column(name = "deadline")
    val deadline: LocalDateTime?,

    @Column(name = "wrkcndtn_lct_typ")
    val locationType: String?,

    @Column(name = "wrkcndtn_lct_rgn_str")
    val region: String?,

    @Column(name = "emp_types_str")
    val jobType: String?,

    @Column(name = "status")
    val status: String,

    @Column(name = "app_mthds_hmpg")
    val url: String?
)

/**
 * 페이징된 채용 정보 응답을 위한 DTO
 */
data class JobManagementPageResponse(
    val content: List<JobManagementDto>,
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