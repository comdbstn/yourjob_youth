package com.yourjob.backend.entity

import java.time.LocalDateTime

class User(
    var id: Int? = null,
    var userType: UserType? = UserType.EMPLOYER,
    var email: String? = null,
    var password: String? = null,
    var name: String? = null,
    var phone: String? = null,
    var oauthProvider: String? = null,
    var oauthProviderId: String? = null,
    var isActive: Boolean? = null,
    var isBanned: Boolean? = null,
    var profileImage: String? = null,
    var corp_logo_url: String? = null,
    var createdAt: LocalDateTime? = null,
    var updatedAt: LocalDateTime? = null
)

enum class UserType {
    EMPLOYER, JOB_SEEKER, COMPANY, COMPANY_EXCEL, ADMIN
}
