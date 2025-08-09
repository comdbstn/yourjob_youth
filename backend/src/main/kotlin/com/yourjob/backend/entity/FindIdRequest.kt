package com.yourjob.backend.entity

data class FindIdRequest(
    val name: String,
    val phone: String
)

data class FindCorpIdRequest(
    val name: String,
    val email: String
)