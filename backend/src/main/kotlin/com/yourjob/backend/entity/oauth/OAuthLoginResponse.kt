package com.yourjob.backend.entity.oauth

import com.yourjob.backend.entity.UserType

data class OAuthLoginResponse(
    val token: String,
    val userId: Int,
    val name: String,
    val email: String,
    val userType: UserType,
    val isNewUser: Boolean
)