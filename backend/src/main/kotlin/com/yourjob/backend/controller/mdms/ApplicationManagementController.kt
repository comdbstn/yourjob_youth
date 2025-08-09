package com.yourjob.backend.controller.mdms

import com.yourjob.backend.entity.mdms.BulkDeleteRequest
import com.yourjob.backend.entity.mdms.BulkStatusUpdateRequest
import com.yourjob.backend.entity.mdms.PagedApplicationsManagementResponse
import com.yourjob.backend.entity.mdms.ApplicationsManagementSearchFilter
import com.yourjob.backend.service.mdms.ApplicationManagementService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/mdms")
class ApplicationManagementController(private val applicationsManagementService: ApplicationManagementService) {

    @GetMapping("/applications-management")
    fun getApplications(
        session: HttpSession,
        request: HttpServletRequest,
        @RequestParam(required = false, defaultValue = "") keyword: String,
        @RequestParam(required = false, defaultValue = "") status: String,
        @RequestParam(required = false, defaultValue = "0") page: Int,
        @RequestParam(required = false, defaultValue = "10") size: Int,
        @RequestParam(required = false, defaultValue = "") startDate: String,
        @RequestParam(required = false, defaultValue = "") endDate: String,
        @RequestParam(required = false) jobId: Long?,
        @RequestParam(required = false) resumeId: Long? // 추가: resumeId 파라미터
    ): ResponseEntity<PagedApplicationsManagementResponse> {
        // 세션에서 사용자 ID 가져오기
        //val userId = session.getAttribute("userId")?.toString()

        // 검색 필터 객체 생성
        val filter = ApplicationsManagementSearchFilter(
            keyword = keyword,
            status = status,
            page = page,
            size = size,
            startDate = startDate,
            endDate = endDate,
            userId = null,
            jobId = jobId,
            resumeId = resumeId // 추가: resumeId 설정
        )

        // 서비스 호출하여 입사지원 데이터 가져오기
        val pagedResponse = applicationsManagementService.getApplications(filter)

        return ResponseEntity(pagedResponse, HttpStatus.OK)
    }

    @PostMapping("/applications-management/bulk-status")
    fun updateApplicationsStatus(
        @RequestBody request: BulkStatusUpdateRequest
    ): ResponseEntity<Map<String, Any>> {
        val success = applicationsManagementService.updateApplicationsStatus(request)

        val response = mapOf(
            "success" to success,
            "message" to if (success) "상태가 성공적으로 업데이트되었습니다." else "상태 업데이트 중 오류가 발생했습니다."
        )

        return ResponseEntity(response, if (success) HttpStatus.OK else HttpStatus.INTERNAL_SERVER_ERROR)
    }

    @PostMapping("/applications-management/bulk-delete")
    fun deleteApplications(
        @RequestBody request: BulkDeleteRequest
    ): ResponseEntity<Map<String, Any>> {
        val success = applicationsManagementService.deleteApplications(request)

        val response = mapOf(
            "success" to success,
            "message" to if (success) "입사지원 정보가 성공적으로 삭제되었습니다." else "입사지원 정보 삭제 중 오류가 발생했습니다."
        )

        return ResponseEntity(response, if (success) HttpStatus.OK else HttpStatus.INTERNAL_SERVER_ERROR)
    }

    @DeleteMapping("/applications-management/{id}")
    fun deleteApplication(
        @PathVariable id: Long
    ): ResponseEntity<Map<String, Any>> {
        val request = BulkDeleteRequest(listOf(id))
        val success = applicationsManagementService.deleteApplications(request)

        val response = mapOf(
            "success" to success,
            "message" to if (success) "입사지원 정보가 성공적으로 삭제되었습니다." else "입사지원 정보 삭제 중 오류가 발생했습니다."
        )

        return ResponseEntity(response, if (success) HttpStatus.OK else HttpStatus.INTERNAL_SERVER_ERROR)
    }
}