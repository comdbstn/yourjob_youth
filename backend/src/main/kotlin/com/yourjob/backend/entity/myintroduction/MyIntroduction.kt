package com.yourjob.backend.entity.myintroduction

import jakarta.persistence.*
import java.time.LocalDateTime

/**
 * 내 자소서 기본 정보 Entity (간소화)
 */
@Entity
@Table(name = "my_introduction")
data class MyIntroduction(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "my_introduction_id")
    val myIntroductionId: Long = 0,

    @Column(name = "title", nullable = false)
    val title: String,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @Column(name = "is_finished")
    val isFinished: Boolean = false,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: LocalDateTime = LocalDateTime.now()
)

/**
 * 내 자소서 질문-답변 Entity
 */
@Entity
@Table(name = "my_introduction_questions_answers")
data class MyIntroductionQuestionAnswer(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "answer_id")
    val answerId: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "my_introduction_id", nullable = false)
    val myIntroduction: MyIntroduction,

    @Column(name = "question_text", nullable = false)
    val questionText: String,

    @Column(name = "answer_text")
    val answerText: String = "",

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