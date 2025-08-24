package com.yourjob.backend.controller.mdms

import com.yourjob.backend.entity.mdms.*
import com.yourjob.backend.service.mdms.JobOfferManagementService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/admin/job-offers")
class JobOfferManagementController(
    private val jobOfferManagementService: JobOfferManagementService
) {


    @GetMapping
    fun getJobOffers(
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false) interviewStatus: String?,
        @RequestParam(required = false) keyword: String?,
        @RequestParam(required = false) employerId: Long?,
        @RequestParam(required = false) jobSeekerId: Long?,
        @RequestParam(required = false) jobId: Long?,
        @RequestParam(required = false) resumeId: Long?,
        @RequestParam(required = false) startDate: String?,
        @RequestParam(required = false) endDate: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<JobOfferManagementPageResponse> {
        val result = jobOfferManagementService.getJobOffersWithFilters(
            status, interviewStatus, keyword, employerId, jobSeekerId, jobId, resumeId, startDate, endDate, page, size
        )
        return ResponseEntity.ok(result)
    }

    /**
     * 채용공고 ID로 채용 제안 조회
     */
    @GetMapping("/job/{jobId}")
    fun getJobOffersByJobId(
        @PathVariable jobId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<JobOfferManagementPageResponse> {
        val result = jobOfferManagementService.getJobOffersByJobId(jobId, page, size)
        return ResponseEntity.ok(result)
    }

    /**
     * 이력서 ID로 채용 제안 조회
     */
    @GetMapping("/resume/{resumeId}")
    fun getJobOffersByResumeId(
        @PathVariable resumeId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<JobOfferManagementPageResponse> {
        val result = jobOfferManagementService.getJobOffersByResumeId(resumeId, page, size)
        return ResponseEntity.ok(result)
    }

    @PutMapping("/status{jobOfferId}")
    fun updateJobOfferStatus(
        @PathVariable jobOfferId: Long,
        @RequestBody request: Map<String, String>
    ): ResponseEntity<Any> {
        val status = request["status"] ?: return ResponseEntity.badRequest().body("Status is required")
        val success = jobOfferManagementService.updateJobOfferStatus(jobOfferId, status)

        return if (success) {
            ResponseEntity.ok(mapOf("message" to "Status updated successfully"))
        } else {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update status")
        }
    }
}