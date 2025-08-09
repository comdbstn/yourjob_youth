package com.yourjob.backend.entity.resume

import com.fasterxml.jackson.annotation.JsonFormat
import java.time.LocalDate

data class ResumeActivity(
    val activityId: Int? = null,
    val resumeId: Int,
    val activityType: String, // 동아리/학회/봉사활동/인턴십/프로젝트/기타
    val organizationName: String,
    val position: String?,
    val activityName: String,
    val description: String?,
    @JsonFormat(pattern = "yyyy-MM-dd")
    val startDate: LocalDate?,
    @JsonFormat(pattern = "yyyy-MM-dd")
    val endDate: LocalDate?,
    val isOngoing: Boolean = false,
    val achievements: String?,
    val createdAt: String? = null,
    val updatedAt: String? = null
)

data class ResumeActivityRequest(
    val resumeId: Int,
    val activityType: String,
    val organizationName: String,
    val position: String?,
    val activityName: String,
    val description: String?,
    val startDate: String?,
    val endDate: String?,
    val isOngoing: Boolean = false,
    val achievements: String?
)

data class ResumeActivityResponse(
    val activityId: Int,
    val resumeId: Int,
    val activityType: String,
    val organizationName: String,
    val position: String?,
    val activityName: String,
    val description: String?,
    val startDate: String?,
    val endDate: String?,
    val isOngoing: Boolean = false,
    val achievements: String?,
    val createdAt: String?,
    val updatedAt: String?
)