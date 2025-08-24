package com.yourjob.backend.entity.resume

import com.fasterxml.jackson.annotation.JsonFormat
import java.time.LocalDate

data class ResumeEducation(
    val educationId: Int? = null,
    val resumeId: Int,
    val schoolType: String?, // 초등/중등/고등/대학교/대학원
    val schoolName: String,
    val major: String?,
    val graduationStatus: String?, // 졸업/졸업예정/수료/중퇴/휴학
    @JsonFormat(pattern = "yyyy-MM-dd")
    val admissionDate: LocalDate?,
    @JsonFormat(pattern = "yyyy-MM-dd") 
    val graduationDate: LocalDate?,
    val grade: String?,
    val location: String?,
    val createdAt: String? = null,
    val updatedAt: String? = null
)

data class ResumeEducationRequest(
    val resumeId: Int,
    val schoolType: String?,
    val schoolName: String,
    val major: String?,
    val graduationStatus: String?,
    val admissionDate: String?,
    val graduationDate: String?,
    val grade: String?,
    val location: String?
)

data class ResumeEducationResponse(
    val educationId: Int,
    val resumeId: Int,
    val schoolType: String?,
    val schoolName: String,
    val major: String?,
    val graduationStatus: String?,
    val admissionDate: String?,
    val graduationDate: String?,
    val grade: String?,
    val location: String?,
    val createdAt: String?,
    val updatedAt: String?
)