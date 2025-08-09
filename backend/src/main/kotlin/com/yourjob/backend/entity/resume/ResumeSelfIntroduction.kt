package com.yourjob.backend.entity.resume

data class ResumeSelfIntroduction(
    val selfIntroId: Int? = null,
    val resumeId: Int,
    val questionTitle: String, // 자소서 항목 제목 (예: 지원동기, 성장과정, 성격의 장단점 등)
    val questionContent: String?, // 질문 내용
    val answerContent: String, // 답변 내용
    val wordLimit: Int?, // 글자 제한
    val orderNumber: Int = 1, // 순서
    val createdAt: String? = null,
    val updatedAt: String? = null
)

data class ResumeSelfIntroductionRequest(
    val resumeId: Int,
    val questionTitle: String,
    val questionContent: String?,
    val answerContent: String,
    val wordLimit: Int?,
    val orderNumber: Int = 1
)

data class ResumeSelfIntroductionResponse(
    val selfIntroId: Int,
    val resumeId: Int,
    val questionTitle: String,
    val questionContent: String?,
    val answerContent: String,
    val wordLimit: Int?,
    val orderNumber: Int,
    val createdAt: String?,
    val updatedAt: String?
)