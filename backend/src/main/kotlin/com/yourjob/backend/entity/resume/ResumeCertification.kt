package com.yourjob.backend.entity.resume

import com.fasterxml.jackson.annotation.JsonFormat
import java.time.LocalDate

data class ResumeCertification(
    val certificationId: Int? = null,
    val resumeId: Int,
    val certificateName: String,
    val certificateNumber: String?,
    val issuingOrganization: String?,
    @JsonFormat(pattern = "yyyy-MM-dd")
    val issueDate: LocalDate?,
    @JsonFormat(pattern = "yyyy-MM-dd")
    val expirationDate: LocalDate?,
    val score: String?, // 점수나 등급
    val description: String?,
    val createdAt: String? = null,
    val updatedAt: String? = null
)

data class ResumeCertificationRequest(
    val resumeId: Int,
    val certificateName: String,
    val certificateNumber: String?,
    val issuingOrganization: String?,
    val issueDate: String?,
    val expirationDate: String?,
    val score: String?,
    val description: String?
)

data class ResumeCertificationResponse(
    val certificationId: Int,
    val resumeId: Int,
    val certificateName: String,
    val certificateNumber: String?,
    val issuingOrganization: String?,
    val issueDate: String?,
    val expirationDate: String?,
    val score: String?,
    val description: String?,
    val createdAt: String?,
    val updatedAt: String?
)