package com.yourjob.backend.entity.oauth

import com.yourjob.backend.entity.UserType

data class OAuthLoginRequest(
    val provider: String,
    val code: String,
    val redirectUri: String,
    val userType: UserType = UserType.JOB_SEEKER
)

