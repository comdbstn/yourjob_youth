package com.yourjob.backend.service.mdms

import com.yourjob.backend.controller.mdms.CompanyProfileUpdateRequest
import com.yourjob.backend.entity.mdms.CompanyProfileDto
import com.yourjob.backend.entity.mdms.CompanyProfileManagement
import com.yourjob.backend.entity.mdms.CompanyProfilePageResponse
import com.yourjob.backend.repository.mdms.CompanyProfileManagementRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDateTime

@Service
class CompanyProfileManagementService(
    private val companyProfileRepository: CompanyProfileManagementRepository
) {

    /**
     * 기업 정보 페이징 조회
     */
    @Transactional(readOnly = true)
    fun getCompanies(
        page: Int,
        size: Int,
        keyword: String?
    ): CompanyProfilePageResponse {
        val pageable: Pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"))

        val companyPage: Page<CompanyProfileDto> = companyProfileRepository.findCompaniesWithUserInfo(
            keyword,
            pageable
        )

        return CompanyProfilePageResponse(
            content = companyPage.content,
            page = page,
            size = size,
            totalElements = companyPage.totalElements,
            totalPages = companyPage.totalPages,
            number = companyPage.number,
            first = companyPage.isFirst,
            last = companyPage.isLast,
            numberOfElements = companyPage.numberOfElements,
            empty = companyPage.isEmpty
        )
    }

    /**
     * 기업 정보 단건 조회
     */
    @Transactional(readOnly = true)
    fun getCompanyById(id: Long): CompanyProfileDto? {
        val company = companyProfileRepository.findById(id).orElse(null) ?: return null

        // 이제 users 테이블에 모든 정보가 있으므로 별도 조인 없이 DTO 변환
        return CompanyProfileDto(
            id = company.id,
            userId = company.id, // user_id가 이제 PK이므로 동일
            accountId = company.accountId,
            name = company.name,
            userType = "company", // userType은 항상 'company'로 유지
            email = company.email,
            phone = company.phone,
            companyName = company.companyName ?: "",
            employeeCount = company.employeeCount,
            capitalAmount = company.capitalAmount,
            revenueAmount = company.revenueAmount,
            netIncome = company.netIncome,
            address = company.address,
            website = company.website,
            logoUrl = company.logoUrl,
            createdAt = company.createdAt,
            updatedAt = company.updatedAt
        )
    }

    /**
     * 기업 정보 수정
     */
    @Transactional
    fun updateCompany(request: CompanyProfileUpdateRequest): Boolean {
        val company = companyProfileRepository.findById(request.id).orElse(null) ?: return false

        // company_profile 엔티티는 불변(val)이므로 새 객체 생성 후 저장
        val updatedCompany = CompanyProfileManagement(
            id = company.id,
            accountId = request.accountId,
            name = request.name,
            userType = "company", // userType은 항상 'company'로 유지
            email = request.email,
            phone = request.phone,
            companyName = request.companyName,
            employeeCount = request.employeeCount,
            capitalAmount = request.capitalAmount,
            revenueAmount = request.revenueAmount,
            netIncome = request.netIncome,
            address = request.address,
            website = request.website,
            logoUrl = request.logoUrl,
            createdAt = company.createdAt,
            updatedAt = LocalDateTime.now()
        )

        companyProfileRepository.save(updatedCompany)
        return true
    }

    /**
     * 기업 정보 삭제
     */
    @Transactional
    fun deleteCompany(id: Long): Boolean {
        if (companyProfileRepository.existsById(id)) {
            companyProfileRepository.deleteById(id)
            return true
        }
        return false
    }

    /**
     * 기업 정보 일괄 삭제
     */
    @Transactional
    fun bulkDeleteCompanies(ids: List<Long>): Int {
        val entities = companyProfileRepository.findAllById(ids)
        companyProfileRepository.deleteAll(entities)
        return entities.size
    }

    /**
     * 응답 메시지 생성
     */
    fun createResponseMessage(success: Boolean, action: String): Map<String, Any> {
        return mapOf(
            "success" to success,
            "message" to if (success) "성공적으로 ${action}되었습니다." else "${action} 중 오류가 발생했습니다."
        )
    }
}
