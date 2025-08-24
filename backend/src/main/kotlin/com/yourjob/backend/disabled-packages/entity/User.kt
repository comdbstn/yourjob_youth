package com.yourjob.backend.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    var id: Int? = null,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "user_type")
    var userType: UserType? = UserType.EMPLOYER,
    
    @Column(name = "email")
    var email: String? = null,
    
    @Column(name = "password")
    var password: String? = null,
    
    @Column(name = "name")
    var name: String? = null,
    
    @Column(name = "phone")
    var phone: String? = null,
    
    @Column(name = "oauth_provider")
    var oauthProvider: String? = null,
    
    @Column(name = "oauth_provider_id")
    var oauthProviderId: String? = null,
    
    @Column(name = "is_active")
    var isActive: Boolean? = null,
    
    @Column(name = "is_banned")
    var isBanned: Boolean? = null,
    
    @Column(name = "profile_image")
    var profileImage: String? = null,
    
    @Column(name = "corp_logo_url")
    var corp_logo_url: String? = null,
    
    @Column(name = "created_at")
    var createdAt: LocalDateTime? = null,
    
    @Column(name = "updated_at")  
    var updatedAt: LocalDateTime? = null
)

enum class UserType {
    EMPLOYER, JOB_SEEKER, COMPANY, COMPANY_EXCEL, ADMIN
}
