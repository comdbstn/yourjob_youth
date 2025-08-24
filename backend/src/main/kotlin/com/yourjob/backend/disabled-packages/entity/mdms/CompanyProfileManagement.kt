package com.yourjob.backend.entity.mdms

import java.math.BigDecimal
import java.time.LocalDateTime
import jakarta.persistence.*

/**
 * 관리자 페이지용 기업 정보 Entity (users 테이블 매핑)
 */
@Entity
@Table(name = "users")
data class CompanyProfileManagement(
    @Id
    @Column(name = "user_id")
    val id: Long = 0,

    @Column(name = "account_id")
    val accountId: String? = null,

    @Column(name = "name")
    val name: String? = null,

    @Column(name = "user_type")
    val userType: String?,

    @Column(name = "email")
    val email: String? = null,

    @Column(name = "phone")
    val phone: String? = null,

    @Column(name = "company_name")
    val companyName: String? = null,

    @Column(name = "employ_cnt")
    val employeeCount: Int? = null,

    @Column(name = "capital")
    val capitalAmount: String? = null,

    @Column(name = "revenue")
    val revenueAmount: String? = null,

    @Column(name = "netincome")
    val netIncome: String? = null,

    @Column(name = "company_address")
    val address: String? = null,

    @Column(name = "homepage")
    val website: String? = null,

    @Column(name = "corp_logo_url")
    val logoUrl: String? = null,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: LocalDateTime? = null
)

/**
 * 기업 상세 정보를 위한 DTO
 * 기존 DTO는 그대로 유지
 */
data class CompanyProfileDto(
    val id: Long,
    val userId: Long,
    val accountId: String?,
    val userType: String?,
    val name: String?,
    val email: String?,
    val phone: String?,
    val companyName: String?,
    val employeeCount: Int?,
    val capitalAmount: String?,
    val revenueAmount: String?,
    val netIncome: String?,
    val address: String?,
    val website: String?,
    val logoUrl: String?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime?
)

/**
 * 페이징된 기업 정보 응답을 위한 DTO
 * 기존 DTO 그대로 유지
 */
data class CompanyProfilePageResponse(
    val content: List<CompanyProfileDto>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
    val number: Int,
    val first: Boolean,
    val last: Boolean,
    val numberOfElements: Int,
    val empty: Boolean
)