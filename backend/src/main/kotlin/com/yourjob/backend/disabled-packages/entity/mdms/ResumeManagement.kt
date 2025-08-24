package com.yourjob.backend.entity.mdms

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "resumes")
data class ResumeManagement(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resume_id")
    val resumeId: Long? = null,

    @Column(name = "title")
    val title: String? = null,

    @Column(name = "status")
    val status: String? = null,

    @Column(name = "created_at")
    val createdAt: LocalDateTime? = null,

    @Column(name = "name")
    val name: String? = null,

    @Column(name = "birth")
    val birth: String? = null,

    @Column(name = "gender")
    val gender: String? = null,

    @Column(name = "nationality")
    val nationality: String? = null,

    @Column(name = "region")
    val region: String? = null,

    @Column(name = "picturePath")
    val picturePath: String? = null,

    @Column(name = "job_seeker_id")
    val jobSeekerId: Long? = null
)


