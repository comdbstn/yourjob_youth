package com.yourjob.backend.controller.mdms

import com.yourjob.backend.entity.mdms.BulkDeleteRequest
import com.yourjob.backend.entity.mdms.BulkStatusUpdateRequest
import com.yourjob.backend.entity.mdms.PagedResumeManagementResponse
import com.yourjob.backend.entity.mdms.ResumeManagementSearchFilter
import com.yourjob.backend.service.mdms.ResumeManagementService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/mdms")
class ResumeManagementController(private val resumeManagementService: ResumeManagementService) {

    @GetMapping("/resume-management")
    fun getResumes(
        session: HttpSession,
        request: HttpServletRequest,
        @RequestParam(required = false, defaultValue = "") keyword: String,
        @RequestParam(required = false, defaultValue = "") gender: String,
        @RequestParam(required = false, defaultValue = "0") page: Int,
        @RequestParam(required = false, defaultValue = "10") size: Int,
        @RequestParam(required = false, defaultValue = "") state: String,
        @RequestParam(required = false, defaultValue = "") nationality: String,
        @RequestParam(required = false, defaultValue = "") region: String,
        @RequestParam(required = false, defaultValue = "") startDate: String,
        @RequestParam(required = false, defaultValue = "") endDate: String
    ): ResponseEntity<PagedResumeManagementResponse> {
        // 세션에서 사용자 ID 가져오기
        //val userId = session.getAttribute("userId")?.toString()

        // 검색 필터 객체 생성
        val filter = ResumeManagementSearchFilter(
            keyword = keyword,
            gender = gender,
            page = page,
            size = size,
            status = state,  // state 매개변수를 status 필드에 매핑
            country = nationality,  // nationality 매개변수를 country 필드에 매핑
            region = region,
            startDate = startDate,
            endDate = endDate,
            userId = null
        )

        // 서비스 호출하여 이력서 데이터 가져오기
        val pagedResponse = resumeManagementService.getResumes(filter)

        return ResponseEntity(pagedResponse, HttpStatus.OK)
    }

    @PostMapping("/resume-management/bulk-status")
    fun updateResumeStatus(
        @RequestBody request: BulkStatusUpdateRequest
    ): ResponseEntity<Map<String, Any>> {
        val success = resumeManagementService.updateResumeStatus(request)

        val response = mapOf(
            "success" to success,
            "message" to if (success) "상태가 성공적으로 업데이트되었습니다." else "상태 업데이트 중 오류가 발생했습니다."
        )

        return ResponseEntity(response, if (success) HttpStatus.OK else HttpStatus.INTERNAL_SERVER_ERROR)
    }

    @PostMapping("/resume-management/bulk-delete")
    fun deleteResumes(
        @RequestBody request: BulkDeleteRequest
    ): ResponseEntity<Map<String, Any>> {
        val success = resumeManagementService.deleteResumes(request)

        val response = mapOf(
            "success" to success,
            "message" to if (success) "이력서가 성공적으로 삭제되었습니다." else "이력서 삭제 중 오류가 발생했습니다."
        )

        return ResponseEntity(response, if (success) HttpStatus.OK else HttpStatus.INTERNAL_SERVER_ERROR)
    }

    @DeleteMapping("/resume-management/{id}")
    fun deleteResume(
        @PathVariable id: Long
    ): ResponseEntity<Map<String, Any>> {
        val request = BulkDeleteRequest(listOf(id))
        val success = resumeManagementService.deleteResumes(request)

        val response = mapOf(
            "success" to success,
            "message" to if (success) "이력서가 성공적으로 삭제되었습니다." else "이력서 삭제 중 오류가 발생했습니다."
        )

        return ResponseEntity(response, if (success) HttpStatus.OK else HttpStatus.INTERNAL_SERVER_ERROR)
    }
}