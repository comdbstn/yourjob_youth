package com.yourjob.backend.controller.mdms

import com.yourjob.backend.entity.mdms.CompanyProfileDto
import com.yourjob.backend.entity.mdms.CompanyProfileManagement
import com.yourjob.backend.entity.mdms.CompanyProfilePageResponse
import com.yourjob.backend.service.mdms.CompanyProfileManagementService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/v1/mdms/company-management")
class CompanyProfileManagementController(
    private val companyProfileService: CompanyProfileManagementService
) {

    /**
     * 기업 정보 페이징 조회
     */
    @GetMapping
    fun getCompanies(
        @RequestParam(value = "page", defaultValue = "0") page: Int,
        @RequestParam(value = "size", defaultValue = "10") size: Int,
        @RequestParam(value = "keyword", required = false) keyword: String?
    ): ResponseEntity<CompanyProfilePageResponse> {
        val response = companyProfileService.getCompanies(page, size, keyword)
        return ResponseEntity.ok(response)
    }

    /**
     * 기업 정보 단건 조회
     */
    @GetMapping("/{id}")
    fun getCompany(@PathVariable id: Long): ResponseEntity<CompanyProfileDto> {
        val company = companyProfileService.getCompanyById(id)
        return if (company != null) {
            ResponseEntity.ok(company)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * 기업 정보 수정
     */
    @PutMapping("/{id}")
    fun updateCompany(
        @PathVariable id: Long,
        @RequestBody request: CompanyProfileUpdateRequest
    ): ResponseEntity<Map<String, Any>> {
        // ID 일치 확인
        if (id != request.id) {
            return ResponseEntity.badRequest().body(
                mapOf(
                    "success" to false,
                    "message" to "요청 경로의 ID와 요청 데이터의 ID가 일치하지 않습니다."
                )
            )
        }

        val isUpdated = companyProfileService.updateCompany(request)
        return ResponseEntity.ok(companyProfileService.createResponseMessage(isUpdated, "수정"))
    }

    /**
     * 기업 정보 단건 삭제
     */
    @DeleteMapping("/{id}")
    fun deleteCompany(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        val isDeleted = companyProfileService.deleteCompany(id)
        return ResponseEntity.ok(companyProfileService.createResponseMessage(isDeleted, "삭제"))
    }

    /**
     * 기업 정보 일괄 삭제
     */
    @DeleteMapping("/bulk-delete")
    fun bulkDeleteCompanies(@RequestBody ids: List<Long>): ResponseEntity<Map<String, Any>> {
        val count = companyProfileService.bulkDeleteCompanies(ids)
        return ResponseEntity.ok(
            mapOf(
                "success" to true,
                "message" to "${count}개의 기업 정보가 삭제되었습니다.",
                "deletedCount" to count
            )
        )
    }
}

/**
 * 기업 정보 수정 요청을 위한 DTO
 */
data class CompanyProfileUpdateRequest(
    val id: Long,
    val accountId: String?,
    val name: String?,
    val email: String?,
    val phone: String?,
    val companyName: String,
    val employeeCount: Int?,
    val capitalAmount: String?,
    val revenueAmount: String?,
    val netIncome: String?,
    val address: String?,
    val website: String?,
    val logoUrl: String?
    // userType은 항상 'company'로 유지되므로 요청에서 제외
)