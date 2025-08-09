package com.yourjob.backend.controller.mdms

import com.yourjob.backend.entity.mdms.JobManagementPageResponse
import com.yourjob.backend.service.mdms.JobManagementService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpSession
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/mdms")
class JobManagementController(private val jobManagementService: JobManagementService) {

    /**
     * 채용 정보 목록 조회 API
     * 필터링 조건에 따라 채용 정보를 페이징하여 반환합니다.
     */
    @GetMapping("/job-management")
    fun getJobs(
        session: HttpSession,
        request: HttpServletRequest,
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false) paid: String?,
        @RequestParam(required = false) locationType: String?,
        @RequestParam(required = false) region: String?,
        @RequestParam(required = false) jobType: String?,
        @RequestParam(required = false) startDate: String?,
        @RequestParam(required = false) endDate: String?,
        @RequestParam(required = false) keyword: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<JobManagementPageResponse> {
        val userId = session.getAttribute("userId")

        // 서비스 호출
        val response = jobManagementService.getJobsWithFilters(
            status, paid, locationType, region, jobType,
            startDate, endDate, keyword, page, size
        )

        return ResponseEntity.ok(response)
    }

    /**
     * 채용 정보 개별 조회 API
     */
    @GetMapping("/job-management/{jobId}")
    fun getJobById(
        @PathVariable jobId: Long
    ): ResponseEntity<Any> {
        val job = jobManagementService.getJobById(jobId)
        return if (job != null) {
            ResponseEntity.ok(job)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * 채용 정보 상태 변경 API
     */
    @PutMapping("/job-management/{jobId}/status")
    fun updateJobStatus(
        @PathVariable jobId: Long,
        @RequestParam status: String
    ): ResponseEntity<Map<String, Any>> {
        val success = jobManagementService.updateJobStatus(jobId, status)

        val response = mapOf(
            "success" to success,
            "message" to if (success) "상태가 변경되었습니다." else "상태 변경에 실패했습니다."
        )

        return ResponseEntity.ok(response)
    }

    /**
     * 채용 정보 일괄 상태 변경 API
     */
    @PutMapping("/job-management/bulk-status")
    fun updateJobsStatus(
        @RequestParam status: String,
        @RequestBody jobIds: List<Long>
    ): ResponseEntity<Map<String, Any>> {
        var successCount = 0

        jobIds.forEach { jobId ->
            if (jobManagementService.updateJobStatus(jobId, status)) {
                successCount++
            }
        }

        val response = mapOf(
            "success" to (successCount == jobIds.size),
            "message" to "총 ${jobIds.size}개 중 ${successCount}개 항목의 상태가 변경되었습니다."
        )

        return ResponseEntity.ok(response)
    }

    /**
     * 채용 정보 삭제 API
     */
    @DeleteMapping("/job-management/{jobId}")
    fun deleteJob(
        @PathVariable jobId: Long
    ): ResponseEntity<Map<String, Any>> {
        val success = jobManagementService.deleteJob(jobId)

        val response = mapOf(
            "success" to success,
            "message" to if (success) "삭제되었습니다." else "삭제에 실패했습니다."
        )

        return ResponseEntity.ok(response)
    }

    /**
     * 채용 정보 일괄 삭제 API
     */
    @DeleteMapping("/job-management/bulk-delete")
    fun deleteJobs(
        @RequestBody jobIds: List<Long>
    ): ResponseEntity<Map<String, Any>> {
        var successCount = 0

        jobIds.forEach { jobId ->
            if (jobManagementService.deleteJob(jobId)) {
                successCount++
            }
        }

        val response = mapOf(
            "success" to (successCount == jobIds.size),
            "message" to "총 ${jobIds.size}개 중 ${successCount}개 항목이 삭제되었습니다."
        )

        return ResponseEntity.ok(response)
    }
}