package com.yourjob.backend.entity.resume

import com.fasterxml.jackson.annotation.JsonFormat
import java.time.LocalDate

data class ResumeCareer(
    val careerId: Int? = null,
    val resumeId: Int,
    val companyName: String,
    val position: String?,
    val department: String?,
    val jobDescription: String?,
    @JsonFormat(pattern = "yyyy-MM-dd")
    val startDate: LocalDate?,
    @JsonFormat(pattern = "yyyy-MM-dd") 
    val endDate: LocalDate?,
    val isWorking: Boolean = false,
    val salary: String?,
    val employmentType: String?, // 정규직/계약직/인턴/아르바이트 등
    val companyType: String?, // 대기업/중견기업/중소기업/스타트업 등
    val industry: String?,
    val achievements: String?, // 주요 성과
    val createdAt: String? = null,
    val updatedAt: String? = null
)

data class ResumeCareerRequest(
    val resumeId: Int,
    val companyName: String,
    val position: String?,
    val department: String?,
    val jobDescription: String?,
    val startDate: String?,
    val endDate: String?,
    val isWorking: Boolean = false,
    val salary: String?,
    val employmentType: String?,
    val companyType: String?,
    val industry: String?,
    val achievements: String?
)

data class ResumeCareerResponse(
    val careerId: Int,
    val resumeId: Int,
    val companyName: String,
    val position: String?,
    val department: String?,
    val jobDescription: String?,
    val startDate: String?,
    val endDate: String?,
    val isWorking: Boolean = false,
    val salary: String?,
    val employmentType: String?,
    val companyType: String?,
    val industry: String?,
    val achievements: String?,
    val createdAt: String?,
    val updatedAt: String?
)