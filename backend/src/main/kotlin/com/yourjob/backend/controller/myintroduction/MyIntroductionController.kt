package com.yourjob.backend.controller.myintroduction

import com.yourjob.backend.controller.resume.ApiResponse
import com.yourjob.backend.dto.myintroduction.*
import com.yourjob.backend.service.myintroduction.MyIntroductionService
import jakarta.persistence.EntityNotFoundException
import jakarta.servlet.http.HttpSession
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/my-introduction")
class MyIntroductionController(
    private val myIntroductionService: MyIntroductionService
) {
    // 내 자소서 목록 조회
    @GetMapping
    fun getMyIntroductions(
        session: HttpSession,
        @RequestParam(required = false) title: String?,
        @RequestParam(required = false) isFinished: Boolean?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(defaultValue = "updatedAt") sortBy: String,
        @RequestParam(defaultValue = "DESC") sortDir: String
    ): ResponseEntity<ApiResponse<Page<MyIntroductionDto>>> {
        val userId = session.getAttribute("userId")
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse(false, "로그인이 필요합니다.", null))

        val direction = if (sortDir.equals("ASC", ignoreCase = true)) Sort.Direction.ASC else Sort.Direction.DESC
        //val pageable = PageRequest.of(page, size, Sort.by(direction, sortBy))
        val pageable = PageRequest.of(page - 1, size, Sort.by(direction, sortBy))

        val myIntroductions = myIntroductionService.searchMyIntroductions(userId, title, isFinished, pageable)
        return ResponseEntity.ok(ApiResponse(true, "내 자소서 목록 조회 성공", myIntroductions))
    }

    // 내 자소서 상세 조회
    @GetMapping("/{myIntroductionId}")
    fun getMyIntroductionDetail(
        session: HttpSession,
        @PathVariable myIntroductionId: Long
    ): ResponseEntity<ApiResponse<MyIntroductionDetailDto>> {
        val userId = session.getAttribute("userId")
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse(false, "로그인이 필요합니다.", null))

        try {
            val myIntroductionDetail = myIntroductionService.getMyIntroductionDetail(myIntroductionId, userId)
            return ResponseEntity.ok(ApiResponse(true, "내 자소서 상세 정보 조회 성공", myIntroductionDetail))
        } catch (e: SecurityException) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse(false, e.message, null))
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, e.message, null))
        }
    }

    // 내 자소서 생성
    @PostMapping
    fun createMyIntroduction(
        session: HttpSession,
        @RequestBody request: CreateMyIntroductionRequest
    ): ResponseEntity<ApiResponse<MyIntroductionResponse>> {
        val userId = session.getAttribute("userId")
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse(false, "로그인이 필요합니다.", null))

        val response = myIntroductionService.createMyIntroduction(userId, request)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse(true, "내 자소서가 성공적으로 등록되었습니다.", response))
    }

    // 내 자소서 기본 정보 수정
    @PutMapping("/{myIntroductionId}")
    fun updateMyIntroduction(
        session: HttpSession,
        @PathVariable myIntroductionId: Long,
        @RequestBody request: UpdateMyIntroductionRequest
    ): ResponseEntity<ApiResponse<MyIntroductionResponse>> {
        val userId = session.getAttribute("userId")
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse(false, "로그인이 필요합니다.", null))

        try {
            val response = myIntroductionService.updateMyIntroduction(myIntroductionId, userId, request)
            return ResponseEntity.ok(ApiResponse(true, "내 자소서가 성공적으로 수정되었습니다.", response))
        } catch (e: SecurityException) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse(false, e.message, null))
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse(false, e.message, null))
        }
    }

    // 내 자소서 답변 수정
    @PutMapping("/answers/{answerId}")
    fun updateMyIntroductionAnswer(
        session: HttpSession,
        @PathVariable answerId: Long,
        @RequestBody request: UpdateMyIntroductionAnswerRequest
    ): ResponseEntity<ApiResponse<MyIntroductionResponse>> {
        val userId = session.getAttribute("userId")
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse(false, "로그인이 필요합니다.", null))

        try {
            val response = myIntroductionService.updateMyIntroductionAnswer(answerId, userId, request)
            return ResponseEntity.ok(ApiResponse(true, "답변이 성공적으로 수정되었습니다.", response))
        } catch (e: SecurityException) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse(false, e.message, null))
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse(false, e.message, null))
        }
    }


    // 내 자소서 삭제
    @DeleteMapping("/{myIntroductionId}")
    fun deleteMyIntroduction(
        session: HttpSession,
        @PathVariable myIntroductionId: Long
    ): ResponseEntity<ApiResponse<MyIntroductionResponse>> {
        val userId = session.getAttribute("userId")
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse(false, "로그인이 필요합니다.", null))

        try {
            val response = myIntroductionService.deleteMyIntroduction(myIntroductionId, userId)
            return ResponseEntity.ok(ApiResponse(true, "내 자소서가 성공적으로 삭제되었습니다.", response))
        } catch (e: SecurityException) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse(false, e.message, null))
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse(false, e.message, null))
        }
    }

    // 단일 질문 추가
    @PostMapping("/{myIntroductionId}/questions")
    fun addQuestion(
        session: HttpSession,
        @PathVariable myIntroductionId: Long,
        @RequestBody request: AddQuestionRequest
    ): ResponseEntity<ApiResponse<MyIntroductionResponse>> {
        val userId = session.getAttribute("userId")
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse(false, "로그인이 필요합니다.", null))

        try {
            val response = myIntroductionService.addQuestion(myIntroductionId, userId, request)
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse(true, "질문이 성공적으로 추가되었습니다.", response))
        } catch (e: SecurityException) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse(false, e.message, null))
        } catch (e: IllegalArgumentException) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse(false, e.message, null))
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse(false, e.message, null))
        }
    }

    // 여러 질문 일괄 추가
    @PostMapping("/{myIntroductionId}/questions/batch")
    fun addQuestions(
        session: HttpSession,
        @PathVariable myIntroductionId: Long,
        @RequestBody request: AddQuestionsRequest
    ): ResponseEntity<ApiResponse<MyIntroductionResponse>> {
        val userId = session.getAttribute("userId")
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse(false, "로그인이 필요합니다.", null))

        try {
            val response = myIntroductionService.addQuestions(myIntroductionId, userId, request)
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse(true, "${request.questions.size}개의 질문이 성공적으로 추가되었습니다.", response))
        } catch (e: SecurityException) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse(false, e.message, null))
        } catch (e: IllegalArgumentException) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse(false, e.message, null))
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse(false, e.message, null))
        }
    }

    // 단일 질문 삭제
    @DeleteMapping("/questions/{answerId}")
    fun deleteQuestion(
        session: HttpSession,
        @PathVariable answerId: Long
    ): ResponseEntity<ApiResponse<MyIntroductionResponse>> {
        val userId = session.getAttribute("userId")
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse(false, "로그인이 필요합니다.", null))

        try {
            val response = myIntroductionService.deleteQuestion(answerId, userId)
            return ResponseEntity.ok(ApiResponse(true, "질문이 성공적으로 삭제되었습니다.", response))
        } catch (e: SecurityException) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse(false, e.message, null))
        } catch (e: EntityNotFoundException) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, e.message, null))
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse(false, e.message, null))
        }
    }

    // 여러 질문 일괄 삭제
    @DeleteMapping("/{myIntroductionId}/questions/batch")
    fun deleteQuestions(
        session: HttpSession,
        @PathVariable myIntroductionId: Long,
        @RequestBody request: DeleteQuestionsRequest
    ): ResponseEntity<ApiResponse<MyIntroductionResponse>> {
        val userId = session.getAttribute("userId")
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse(false, "로그인이 필요합니다.", null))

        try {
            val response = myIntroductionService.deleteQuestions(myIntroductionId, userId, request)
            return ResponseEntity.ok(ApiResponse(true, "${request.answerIds.size}개의 질문이 성공적으로 삭제되었습니다.", response))
        } catch (e: SecurityException) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse(false, e.message, null))
        } catch (e: IllegalArgumentException) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse(false, e.message, null))
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse(false, e.message, null))
        }
    }
}