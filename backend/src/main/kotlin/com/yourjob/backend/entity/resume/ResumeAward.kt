package com.yourjob.backend.entity.resume

import com.fasterxml.jackson.annotation.JsonFormat
import java.time.LocalDate

data class ResumeAward(
    val awardId: Int? = null,
    val resumeId: Int,
    val awardName: String,
    val issuingOrganization: String,
    val awardRank: String?, // 대상/금상/은상/동상/우수상 등
    @JsonFormat(pattern = "yyyy-MM-dd")
    val awardDate: LocalDate?,
    val description: String?,
    val relatedActivity: String?, // 관련 활동이나 분야
    val createdAt: String? = null,
    val updatedAt: String? = null
)

data class ResumeAwardRequest(
    val resumeId: Int,
    val awardName: String,
    val issuingOrganization: String,
    val awardRank: String?,
    val awardDate: String?,
    val description: String?,
    val relatedActivity: String?
)

data class ResumeAwardResponse(
    val awardId: Int,
    val resumeId: Int,
    val awardName: String,
    val issuingOrganization: String,
    val awardRank: String?,
    val awardDate: String?,
    val description: String?,
    val relatedActivity: String?,
    val createdAt: String?,
    val updatedAt: String?
)