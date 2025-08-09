package com.yourjob.backend.entity

data class CorpLoginRequest(
    var accountId: String? = null,
    var password: String? = null
)
