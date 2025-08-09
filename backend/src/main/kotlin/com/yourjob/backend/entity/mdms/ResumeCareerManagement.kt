package com.yourjob.backend.entity.mdms

import jakarta.persistence.*

@Entity
@Table(name = "resume_careers")
data class ResumeCareerManagement(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "careers_id")
    val id: Long? = null,

    @Column(name = "resume_id")
    val resumeId: Long? = null,

    @Column(name = "startDate")
    val startDate: String? = null,

    @Column(name = "endDate")
    val endDate: String? = null
)