package com.yourjob.backend.entity.resume

import com.fasterxml.jackson.annotation.JsonFormat
import java.time.LocalDate

data class ResumeEmploymentInfo(
    val employmentInfoId: Int? = null,
    val resumeId: Int,
    val militaryService: String?, // 군필/미필/면제/해당없음
    val militaryServiceType: String?, // 현역/공익/기타
    @JsonFormat(pattern = "yyyy-MM-dd")
    val militaryStartDate: LocalDate?,
    @JsonFormat(pattern = "yyyy-MM-dd")
    val militaryEndDate: LocalDate?,
    val militaryRank: String?, // 계급
    val militaryBranch: String?, // 군종
    val disabilityLevel: String?, // 장애 등급
    val veteransAffairs: Boolean = false, // 보훈 대상 여부
    val socialService: Boolean = false, // 사회복무요원 여부
    val overseasTravel: String?, // 해외 출장 가능 여부
    val relocation: String?, // 근무지 이전 가능 여부
    val createdAt: String? = null,
    val updatedAt: String? = null
)

data class ResumeEmploymentInfoRequest(
    val resumeId: Int,
    val militaryService: String?,
    val militaryServiceType: String?,
    val militaryStartDate: String?,
    val militaryEndDate: String?,
    val militaryRank: String?,
    val militaryBranch: String?,
    val disabilityLevel: String?,
    val veteransAffairs: Boolean = false,
    val socialService: Boolean = false,
    val overseasTravel: String?,
    val relocation: String?
)

data class ResumeEmploymentInfoResponse(
    val employmentInfoId: Int,
    val resumeId: Int,
    val militaryService: String?,
    val militaryServiceType: String?,
    val militaryStartDate: String?,
    val militaryEndDate: String?,
    val militaryRank: String?,
    val militaryBranch: String?,
    val disabilityLevel: String?,
    val veteransAffairs: Boolean = false,
    val socialService: Boolean = false,
    val overseasTravel: String?,
    val relocation: String?,
    val createdAt: String?,
    val updatedAt: String?
)