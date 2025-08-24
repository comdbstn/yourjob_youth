package com.yourjob.backend.entity

import com.yourjob.backend.entity.UserType

class UserResponse(
    var id: Int? = null,
    var email: String? = null,
    var name: String? = null,
    var phone: String? = null,
    var userType: UserType? = null,
    var oauthProvider: String? = null,
    var oauthProviderId: String? = null,
    var profileImage: String? = null,
    var corp_logo_url: String? = null,
    var isActive: Boolean? = null,
    var isBanned: Boolean? = null
)
