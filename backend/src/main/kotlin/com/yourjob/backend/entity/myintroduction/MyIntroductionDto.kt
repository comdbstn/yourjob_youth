package com.yourjob.backend.dto.myintroduction

import java.time.LocalDateTime

// 응답 DTO
data class MyIntroductionDto(
    val myIntroductionId: Long,
    val title: String,
    val isFinished: Boolean = false,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class MyIntroductionDetailDto(
    val introduction: MyIntroductionDto,
    val answers: List<MyIntroductionQuestionAnswerDto>
)

data class MyIntroductionQuestionAnswerDto(
    val answerId: Long,
    val questionText: String,
    val answerText: String,
    val characterCount: Int?,
    val byteCount: Int?,
    val questionIdx: Int?
)

// 요청 DTO
data class CreateMyIntroductionRequest(
    val title: String,
    val isFinished: Boolean = false,
    val questions: List<CreateMyIntroductionQuestionRequest>
)

data class CreateMyIntroductionQuestionRequest(
    val questionText: String,
    val answerText: String = "",
    val questionIdx: Int
)

data class UpdateMyIntroductionRequest(
    val title: String? = null,
    val isFinished: Boolean? = null
)

data class UpdateMyIntroductionAnswerRequest(
    val answerText: String
)

// 응답 메시지 DTO
data class MyIntroductionResponse(
    val myIntroductionId: Long,
    val message: String
)

// 단일 질문 추가 요청 DTO
data class AddQuestionRequest(
    val questionText: String,
    val answerText: String = "",
    val questionIdx: Int
)

// 여러 질문 추가 요청 DTO
data class AddQuestionsRequest(
    val questions: List<AddQuestionRequest>
)

data class DeleteQuestionsRequest(
    val answerIds: List<Long>
)