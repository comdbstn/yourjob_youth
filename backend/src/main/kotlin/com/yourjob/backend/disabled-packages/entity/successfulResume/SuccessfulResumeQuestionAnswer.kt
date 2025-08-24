package com.yourjob.backend.entity.successfulResume

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "successful_resume_questions_answers")
data class SuccessfulResumeQuestionAnswer(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "answer_id")
    val answerId: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    @JsonIgnore  // 이 부분 추가
    val resume: SuccessfulResume,

    @Column(name = "question_text", nullable = false)
    val questionText: String,

    @Column(name = "answer_text", nullable = false)
    val answerText: String,

    @Column(name = "character_count")
    val characterCount: Int? = null,

    @Column(name = "byte_count")
    val byteCount: Int? = null,

    @Column(name = "question_idx")
    val questionIdx: Int? = null,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: LocalDateTime = LocalDateTime.now()
)