package com.yourjob.backend.entity.crawler

import java.time.LocalDateTime

data class CrawlerExecutionLog(
    val id: Long? = null,
    val siteName: String,
    val executionType: String, // SCHEDULED, MANUAL, etc.
    val status: CrawlerStatus,
    val startTime: LocalDateTime,
    val endTime: LocalDateTime? = null,
    val totalProcessed: Int = 0,
    val successCount: Int = 0,
    val failCount: Int = 0,
    val errorMessage: String? = null,
    val processedAt: LocalDateTime = LocalDateTime.now(),
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)

enum class CrawlerStatus {
    RUNNING,
    COMPLETED,
    FAILED,
    CANCELLED
}