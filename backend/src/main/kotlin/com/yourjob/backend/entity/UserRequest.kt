package com.yourjob.backend.entity

import com.yourjob.backend.entity.UserType

data class UserRequest(
    val email: String,
    val password: String? = null,
    val name: String,
    val phone: String,
    val userType: UserType = UserType.JOB_SEEKER,
    var profileImage: String? = null,
    val oauthProvider: String? = null,
    val oauthProviderId: String? = null
)
