package com.yourjob.backend.entity.successfulResume

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "question_categories")
data class QuestionCategory(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    val categoryId: Long = 0,

    @Column(name = "category_name", nullable = false)
    val categoryName: String,

    @Column(name = "description")
    val description: String? = null,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: LocalDateTime = LocalDateTime.now()
)