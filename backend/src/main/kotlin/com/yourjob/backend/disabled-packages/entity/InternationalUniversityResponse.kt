package com.yourjob.backend.entity

data class InternationalUniversityResponse(
    val internationalUniversityId: Int,
    val universityName: String,
    val location: String?,
    val region: String?,
    val createdAt: String?,
    val updatedAt: String?
)