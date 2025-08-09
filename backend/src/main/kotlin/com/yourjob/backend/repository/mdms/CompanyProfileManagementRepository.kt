package com.yourjob.backend.repository.mdms

import com.yourjob.backend.entity.mdms.CompanyProfileDto
import com.yourjob.backend.entity.mdms.CompanyProfileManagement
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface CompanyProfileManagementRepository : JpaRepository<CompanyProfileManagement, Long> {

    // 키워드로 기업 검색 (기업명, 사용자 ID 등으로 검색)
    @Query("""
        SELECT c FROM CompanyProfileManagement c
        WHERE c.userType = 'company'
        AND (:keyword IS NULL OR 
                c.companyName LIKE %:keyword% OR
                c.name LIKE %:keyword% OR
                c.email LIKE %:keyword% OR
                c.website LIKE %:keyword%)
    """)
    fun searchCompanies(
        @Param("keyword") keyword: String?,
        pageable: Pageable
    ): Page<CompanyProfileManagement>

    // 사용자 ID로 기업 조회 (company 타입인 것만)
    @Query("SELECT c FROM CompanyProfileManagement c WHERE c.id = :userId AND c.userType = 'company'")
    fun findCompanyByUserId(@Param("userId") userId: Long): CompanyProfileManagement?

    // 복수의 사용자 ID로 기업 조회
    @Query("SELECT c FROM CompanyProfileManagement c WHERE c.id IN :userIds AND c.userType = 'company'")
    fun findAllCompanyByUserIdIn(@Param("userIds") userIds: List<Long>): List<CompanyProfileManagement>

    // 기업 정보 조회 (DTO 매핑)
    @Query("""
        SELECT new com.yourjob.backend.entity.mdms.CompanyProfileDto(
            c.id, c.id, c.accountId, c.userType, c.name, c.email, c.phone, 
            c.companyName, c.employeeCount, c.capitalAmount, c.revenueAmount,
            c.netIncome, c.address, c.website, c.logoUrl, c.createdAt, c.updatedAt
        )
        FROM CompanyProfileManagement c
        WHERE c.userType = 'COMPANY' OR c.userType = 'COMPANY_EXCEL'
        AND (:keyword IS NULL OR 
                c.companyName LIKE %:keyword% OR
                c.accountId LIKE %:keyword% OR
                c.name LIKE %:keyword% OR
                c.email LIKE %:keyword% OR
                c.website LIKE %:keyword%)
        ORDER BY c.id  DESC
    """)
    fun findCompaniesWithUserInfo(
        @Param("keyword") keyword: String?,
        pageable: Pageable
    ): Page<CompanyProfileDto>
}