package com.yourjob.backend.entity.mdms

import java.time.LocalDateTime
import jakarta.persistence.*

/**
 * 입사지원 정보를 관리하기 위한 Entity
 */
@Entity
@Table(name = "applications")
data class ApplicationManagement(
    @Id
    @Column(name = "application_id")
    val id: Long? = null,

    @Column(name = "job_id")
    val jobId: Long? = null,

    @Column(name = "job_seeker_id")
    val jobSeekerId: Long? = null,

    @Column(name = "resume_id")
    val resumeId: Long? = null,

    @Column(name = "status")
    val status: String? = null,

    @Column(name = "coverletter")
    val coverLetter: String? = null,

    @Column(name = "attach_files_idx")
    val attachFilesIdx: String? = null,

    @Column(name = "created_at")
    val createdAt: LocalDateTime? = null,

    @Column(name = "updated_at")
    val updatedAt: LocalDateTime? = null
)
