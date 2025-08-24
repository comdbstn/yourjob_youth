package com.yourjob.backend.entity

import java.time.LocalDateTime

data class JobCategoryResponse(
    val jobCategoryId: Int,
    val jobCategoryName: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)