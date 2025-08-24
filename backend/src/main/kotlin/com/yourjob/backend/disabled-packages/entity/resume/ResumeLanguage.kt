package com.yourjob.backend.entity.resume

data class ResumeLanguage(
    val languageId: Int? = null,
    val resumeId: Int,
    val languageName: String,
    val proficiencyLevel: String?, // 초급/중급/고급/원어민 수준
    val certificateName: String?, // TOEIC, TOEFL, JLPT 등
    val score: String?, // 점수 또는 등급
    val testDate: String?,
    val description: String?,
    val createdAt: String? = null,
    val updatedAt: String? = null
)

data class ResumeLanguageRequest(
    val resumeId: Int,
    val languageName: String,
    val proficiencyLevel: String?,
    val certificateName: String?,
    val score: String?,
    val testDate: String?,
    val description: String?
)

data class ResumeLanguageResponse(
    val languageId: Int,
    val resumeId: Int,
    val languageName: String,
    val proficiencyLevel: String?,
    val certificateName: String?,
    val score: String?,
    val testDate: String?,
    val description: String?,
    val createdAt: String?,
    val updatedAt: String?
)