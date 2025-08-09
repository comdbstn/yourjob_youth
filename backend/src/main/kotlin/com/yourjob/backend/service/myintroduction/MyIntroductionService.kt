package com.yourjob.backend.service.myintroduction

import com.yourjob.backend.dto.myintroduction.*
import com.yourjob.backend.entity.myintroduction.MyIntroduction
import com.yourjob.backend.entity.myintroduction.MyIntroductionQuestionAnswer
import com.yourjob.backend.repository.myintroduction.MyIntroductionQuestionAnswerRepository
import com.yourjob.backend.repository.myintroduction.MyIntroductionRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class MyIntroductionService(
    private val myIntroductionRepository: MyIntroductionRepository,
    private val myIntroductionQuestionAnswerRepository: MyIntroductionQuestionAnswerRepository
) {
    @Transactional(readOnly = true)
    fun getMyIntroductions(userId: Any): List<MyIntroductionDto> {
        val userIdLong = userId.toString().toLong()
        val myIntroductions = myIntroductionRepository.findByUserIdOrderByCreatedAtDesc(userIdLong)

        return myIntroductions.map { myIntroduction ->
            MyIntroductionDto(
                myIntroductionId = myIntroduction.myIntroductionId,
                title = myIntroduction.title,
                isFinished = myIntroduction.isFinished,
                createdAt = myIntroduction.createdAt,
                updatedAt = myIntroduction.updatedAt
            )
        }
    }

    @Transactional(readOnly = true)
    fun searchMyIntroductions(
        userId: Any,
        title: String?,
        isFinished: Boolean?,
        pageable: Pageable
    ): Page<MyIntroductionDto> {
        val userIdLong = userId.toString().toLong()
        val myIntroductionsPage = myIntroductionRepository.findByUserIdAndSearchConditions(
            userIdLong, title, isFinished, pageable
        )

        return myIntroductionsPage.map { myIntroduction ->
            MyIntroductionDto(
                myIntroductionId = myIntroduction.myIntroductionId,
                title = myIntroduction.title,
                isFinished = myIntroduction.isFinished,
                createdAt = myIntroduction.createdAt,
                updatedAt = myIntroduction.updatedAt
            )
        }
    }

    @Transactional(readOnly = true)
    fun getMyIntroductionDetail(myIntroductionId: Long, userId: Any): MyIntroductionDetailDto {
        val userIdLong = userId.toString().toLong()
        val myIntroduction = myIntroductionRepository.findById(myIntroductionId)
            .orElseThrow { EntityNotFoundException("My introduction with id $myIntroductionId not found") }

        // 권한 체크
        if (myIntroduction.userId != userIdLong) {
            throw SecurityException("You do not have permission to access this introduction")
        }

        val answers = myIntroductionQuestionAnswerRepository.findByMyIntroductionMyIntroductionIdOrderByQuestionIdx(myIntroductionId)

        val introductionDto = MyIntroductionDto(
            myIntroductionId = myIntroduction.myIntroductionId,
            title = myIntroduction.title,
            isFinished = myIntroduction.isFinished,
            createdAt = myIntroduction.createdAt,
            updatedAt = myIntroduction.updatedAt
        )

        val answerDtos = answers.map { answer ->
            MyIntroductionQuestionAnswerDto(
                answerId = answer.answerId,
                questionText = answer.questionText,
                answerText = answer.answerText,
                characterCount = answer.characterCount,
                byteCount = answer.byteCount,
                questionIdx = answer.questionIdx
            )
        }

        return MyIntroductionDetailDto(introductionDto, answerDtos)
    }

    @Transactional
    fun createMyIntroduction(userId: Any, request: CreateMyIntroductionRequest): MyIntroductionResponse {
        val userIdLong = userId.toString().toLong()

        // 내 자소서 기본 정보 저장
        val myIntroduction = MyIntroduction(
            title = request.title,
            userId = userIdLong,
            isFinished = request.isFinished
        )

        val savedMyIntroduction = myIntroductionRepository.save(myIntroduction)

        // 질문-답변 저장
        request.questions.forEach { questionRequest ->
            val answer = MyIntroductionQuestionAnswer(
                myIntroduction = savedMyIntroduction,
                questionText = questionRequest.questionText,
                answerText = questionRequest.answerText,
                characterCount = questionRequest.answerText.length.takeIf { it > 0 },
                byteCount = questionRequest.answerText.toByteArray().size.takeIf { it > 0 },
                questionIdx = questionRequest.questionIdx
            )

            myIntroductionQuestionAnswerRepository.save(answer)
        }

        return MyIntroductionResponse(savedMyIntroduction.myIntroductionId, "내 자소서가 성공적으로 등록되었습니다.")
    }

    @Transactional
    fun updateMyIntroduction(myIntroductionId: Long, userId: Any, request: UpdateMyIntroductionRequest): MyIntroductionResponse {
        val userIdLong = userId.toString().toLong()

        // 기존 자소서 조회
        val existingIntroduction = myIntroductionRepository.findById(myIntroductionId)
            .orElseThrow { EntityNotFoundException("My introduction with id $myIntroductionId not found") }

        // 권한 체크
        if (existingIntroduction.userId != userIdLong) {
            throw SecurityException("You do not have permission to update this introduction")
        }

        // 업데이트된 자소서 생성
        val updatedIntroduction = existingIntroduction.copy(
            title = request.title ?: existingIntroduction.title,
            isFinished = request.isFinished ?: existingIntroduction.isFinished,
            updatedAt = LocalDateTime.now()
        )

        myIntroductionRepository.save(updatedIntroduction)

        return MyIntroductionResponse(myIntroductionId, "내 자소서가 성공적으로 수정되었습니다.")
    }

    @Transactional
    fun updateMyIntroductionAnswer(answerId: Long, userId: Any, request: UpdateMyIntroductionAnswerRequest): MyIntroductionResponse {
        val userIdLong = userId.toString().toLong()

        // 기존 답변 조회
        val existingAnswer = myIntroductionQuestionAnswerRepository.findById(answerId)
            .orElseThrow { EntityNotFoundException("Answer with id $answerId not found") }

        // 권한 체크
        if (existingAnswer.myIntroduction.userId != userIdLong) {
            throw SecurityException("You do not have permission to update this answer")
        }

        // 업데이트된 답변 생성
        val updatedAnswer = existingAnswer.copy(
            answerText = request.answerText,
            characterCount = request.answerText.length,
            byteCount = request.answerText.toByteArray().size,
            updatedAt = LocalDateTime.now()
        )

        myIntroductionQuestionAnswerRepository.save(updatedAnswer)

        // 부모 자소서의 updatedAt도 갱신
        val myIntroduction = existingAnswer.myIntroduction
        val updatedIntroduction = myIntroduction.copy(updatedAt = LocalDateTime.now())
        myIntroductionRepository.save(updatedIntroduction)

        return MyIntroductionResponse(myIntroduction.myIntroductionId, "답변이 성공적으로 수정되었습니다.")
    }

    @Transactional
    fun deleteMyIntroduction(myIntroductionId: Long, userId: Any): MyIntroductionResponse {
        val userIdLong = userId.toString().toLong()

        // 자소서 조회
        val myIntroduction = myIntroductionRepository.findById(myIntroductionId)
            .orElseThrow { EntityNotFoundException("My introduction with id $myIntroductionId not found") }

        // 권한 체크
        if (myIntroduction.userId != userIdLong) {
            throw SecurityException("You do not have permission to delete this introduction")
        }

        // 연관된 질문-답변 먼저 삭제
        myIntroductionQuestionAnswerRepository.deleteByMyIntroductionMyIntroductionId(myIntroductionId)

        // 자소서 삭제
        myIntroductionRepository.deleteById(myIntroductionId)

        return MyIntroductionResponse(myIntroductionId, "내 자소서가 성공적으로 삭제되었습니다.")
    }

    @Transactional
    fun addQuestion(myIntroductionId: Long, userId: Any, request: AddQuestionRequest): MyIntroductionResponse {
        val userIdLong = userId.toString().toLong()

        // 자소서 조회
        val myIntroduction = myIntroductionRepository.findById(myIntroductionId)
            .orElseThrow { EntityNotFoundException("My introduction with id $myIntroductionId not found") }

        // 권한 체크
        if (myIntroduction.userId != userIdLong) {
            throw SecurityException("You do not have permission to update this introduction")
        }

        // 질문 인덱스 중복 체크
        val existingAnswers = myIntroductionQuestionAnswerRepository
            .findByMyIntroductionMyIntroductionIdOrderByQuestionIdx(myIntroductionId)

        if (existingAnswers.any { it.questionIdx == request.questionIdx }) {
            throw IllegalArgumentException("Question with index ${request.questionIdx} already exists")
        }

        // 새 질문-답변 생성
        val answer = MyIntroductionQuestionAnswer(
            myIntroduction = myIntroduction,
            questionText = request.questionText,
            answerText = request.answerText,
            characterCount = request.answerText.length.takeIf { it > 0 },
            byteCount = request.answerText.toByteArray().size.takeIf { it > 0 },
            questionIdx = request.questionIdx
        )

        myIntroductionQuestionAnswerRepository.save(answer)

        // 자소서 updatedAt 갱신
        val updatedIntroduction = myIntroduction.copy(updatedAt = LocalDateTime.now())
        myIntroductionRepository.save(updatedIntroduction)

        return MyIntroductionResponse(myIntroductionId, "질문이 성공적으로 추가되었습니다.")
    }

    @Transactional
    fun addQuestions(myIntroductionId: Long, userId: Any, request: AddQuestionsRequest): MyIntroductionResponse {
        val userIdLong = userId.toString().toLong()

        // 자소서 조회
        val myIntroduction = myIntroductionRepository.findById(myIntroductionId)
            .orElseThrow { EntityNotFoundException("My introduction with id $myIntroductionId not found") }

        // 권한 체크
        if (myIntroduction.userId != userIdLong) {
            throw SecurityException("You do not have permission to update this introduction")
        }

        // 기존 질문 인덱스 가져오기
        val existingAnswers = myIntroductionQuestionAnswerRepository
            .findByMyIntroductionMyIntroductionIdOrderByQuestionIdx(myIntroductionId)

        val existingIndices = existingAnswers.mapNotNull { it.questionIdx }.toSet()

        // 중복 인덱스 체크
        val duplicateIndices = request.questions
            .mapNotNull { it.questionIdx }
            .filter { it in existingIndices }

        if (duplicateIndices.isNotEmpty()) {
            throw IllegalArgumentException("Questions with indices $duplicateIndices already exist")
        }

        // 새 질문-답변들 생성 및 저장
        request.questions.forEach { questionRequest ->
            val answer = MyIntroductionQuestionAnswer(
                myIntroduction = myIntroduction,
                questionText = questionRequest.questionText,
                answerText = questionRequest.answerText,
                characterCount = questionRequest.answerText.length.takeIf { it > 0 },
                byteCount = questionRequest.answerText.toByteArray().size.takeIf { it > 0 },
                questionIdx = questionRequest.questionIdx
            )

            myIntroductionQuestionAnswerRepository.save(answer)
        }

        // 자소서 updatedAt 갱신
        val updatedIntroduction = myIntroduction.copy(updatedAt = LocalDateTime.now())
        myIntroductionRepository.save(updatedIntroduction)

        return MyIntroductionResponse(myIntroductionId, "${request.questions.size}개의 질문이 성공적으로 추가되었습니다.")
    }

    // 단일 질문 삭제
    @Transactional
    fun deleteQuestion(answerId: Long, userId: Any): MyIntroductionResponse {
        val userIdLong = userId.toString().toLong()

        // 답변 조회
        val answer = myIntroductionQuestionAnswerRepository.findById(answerId)
            .orElseThrow { EntityNotFoundException("Answer with id $answerId not found") }

        // 권한 체크
        if (answer.myIntroduction.userId != userIdLong) {
            throw SecurityException("You do not have permission to delete this question")
        }

        // 질문-답변 삭제
        myIntroductionQuestionAnswerRepository.delete(answer)

        // 자소서 updatedAt 갱신
        val myIntroduction = answer.myIntroduction
        val updatedIntroduction = myIntroduction.copy(updatedAt = LocalDateTime.now())
        myIntroductionRepository.save(updatedIntroduction)

        return MyIntroductionResponse(myIntroduction.myIntroductionId, "질문이 성공적으로 삭제되었습니다.")
    }

    // 여러 질문 일괄 삭제
    @Transactional
    fun deleteQuestions(myIntroductionId: Long, userId: Any, request: DeleteQuestionsRequest): MyIntroductionResponse {
        val userIdLong = userId.toString().toLong()

        // 자소서 조회
        val myIntroduction = myIntroductionRepository.findById(myIntroductionId)
            .orElseThrow { EntityNotFoundException("My introduction with id $myIntroductionId not found") }

        // 권한 체크
        if (myIntroduction.userId != userIdLong) {
            throw SecurityException("You do not have permission to update this introduction")
        }

        if (request.answerIds.isEmpty()) {
            return MyIntroductionResponse(myIntroductionId, "삭제할 질문이 없습니다.")
        }

        // 해당 자소서에 속한 답변인지 확인
        val answers = myIntroductionQuestionAnswerRepository.findAllById(request.answerIds)

        // 요청된 모든 answerId가 존재하는지 확인
        if (answers.size != request.answerIds.size) {
            val foundIds = answers.map { it.answerId }.toSet()
            val missingIds = request.answerIds.filter { it !in foundIds }
            throw IllegalArgumentException("Some answers with ids $missingIds do not exist")
        }

        // 모든 답변이 해당 자소서에 속하는지 확인
        val invalidAnswers = answers.filter { it.myIntroduction.myIntroductionId != myIntroductionId }
        if (invalidAnswers.isNotEmpty()) {
            val invalidIds = invalidAnswers.map { it.answerId }
            throw IllegalArgumentException("Answers with ids $invalidIds do not belong to this introduction")
        }

        // 질문-답변들 삭제
        myIntroductionQuestionAnswerRepository.deleteAll(answers)

        // 자소서 updatedAt 갱신
        val updatedIntroduction = myIntroduction.copy(updatedAt = LocalDateTime.now())
        myIntroductionRepository.save(updatedIntroduction)

        return MyIntroductionResponse(myIntroductionId, "${answers.size}개의 질문이 성공적으로 삭제되었습니다.")
    }
}