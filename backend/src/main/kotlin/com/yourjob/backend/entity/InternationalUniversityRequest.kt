package com.yourjob.backend.entity

data class InternationalUniversityRequest(
    var internationalUniversityId: Int? = null,
    val universityName: String = "",
    val country: String = "",
    val region: String = "",
    val establishedYear: Int? = null,
    val universityType: String = "",
    val studentCount: Int? = null,
    val ranking: Int? = null,
    val description: String? = null,
    val website: String? = null,
    val logoUrl: String? = null
)