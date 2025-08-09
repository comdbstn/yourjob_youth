package com.yourjob.backend.entity.successfulResume

import jakarta.persistence.*
import java.time.LocalDateTime
@Entity
@Table(name = "successful_resumes_scraps")
data class SuccessfulResumeScrap(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "scrap_id")
    val scrapId: Long = 0,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "successful_resume_id", nullable = false)
    val successfulResume: SuccessfulResume,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: LocalDateTime = LocalDateTime.now()
)