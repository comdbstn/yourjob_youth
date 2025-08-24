package com.yourjob.backend.entity.successfulResume

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "successful_resumes_templates")
data class SuccessfulResumeTemplate(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "template_id")
    val templateId: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_post_id")
    val jobPost: SuccessfulResumeJobPost? = null,

    @Column(name = "question_text")
    val questionText: String? = null,

    @Column(name = "question_idx")
    val questionIdx: Int? = null,

    @Column(name = "is_required")
    val isRequired: Boolean = true,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: LocalDateTime = LocalDateTime.now()
)