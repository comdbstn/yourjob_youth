package com.yourjob.backend.entity.mdms

import com.yourjob.backend.entity.UserType
import java.time.LocalDateTime
import jakarta.persistence.*

/**
 * 관리자 페이지용 유저 정보 Entity
 */
@Entity
@Table(name = "users")
data class UserManagement(
    @Id
    @Column(name = "user_id")
    val userId: Long,

    @Column(name = "user_type")
    @Enumerated(EnumType.STRING)
    val userType: UserType,

    @Column(name = "email")
    val email: String,

    @Column(name = "name")
    val name: String?,

    @Column(name = "phone")
    val phone: String?,

    @Column(name = "account_id")
    val accountId: String,

    @Column(name = "company_name")
    val companyName: String?,

    @Column(name = "corpthmb_imgidx")
    val corpthmbImgidx: Long?,

    @Column(name = "is_active")
    val isActive: Boolean?,

    @Column(name = "is_banned")
    val isBanned: Boolean?,

    @Column(name = "created_at")
    val createdAt: LocalDateTime,

    @Column(name = "updated_at")
    val updatedAt: LocalDateTime?
)

/**
 * 관리자 페이지용 유저 DTO
 */
data class UserManagementDto(
    val id: Long,
    val userType: String,
    val email: String,
    val name: String?,
    val phone: String?,
    val accountId: String?,
    val companyName: String?,
    val corpthmbImgidx: Long?,
    val isActive: Boolean?,
    val isBanned: Boolean?,
    val createdAt: String,
    val updatedAt: String?
)

/**
 * 페이징된 유저 정보 응답을 위한 DTO
 */
data class UserManagementPageResponse(
    val content: List<UserManagementDto>,
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

data class UserManagementUpdateDto(
    val accountId: String,
    val name: String,
    val phone: String,
    val email: String,
    val userType: String,
    val password: String?,
    val companyName: String?,
    val isActive: Boolean,
    val isBanned: Boolean
)

data class UserManagementCreateDto(
    var userId: Long? = null,
    val accountId: String,
    val name: String,
    val phone: String,
    val email: String,
    val userType: String,
    val password: String,
    val companyName: String?,
    val isActive: Boolean = true,
    val isBanned: Boolean = false
)