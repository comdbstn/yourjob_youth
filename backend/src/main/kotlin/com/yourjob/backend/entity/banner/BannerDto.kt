package com.yourjob.backend.entity.banner

import java.time.LocalDateTime

data class BannerRequest(
    val bannerId: String,
    val startDate: String,
    val endDate: String,
    val imageUrl: String?,
    val groupName: String,
    val status: String,
    val title: String,
    val linkTarget: String? = null,
    val linkTargetType: String? = null
)

data class BannerUpdateRequest(
    val startDate: String? = null,
    var status: String,
    val endDate: String? = null,
    val imageUrl: String? = null,
    val groupName: String? = null,
    val title: String? = null,
    val linkTarget: String? = null,
    val linkTargetType: String? = null
)

data class BannerResponse(
    val id: Long,
    val bannerId: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val startDate: String,
    val endDate: String,
    val imageUrl: String,
    val groupName: String,
    val status: String,
    val title: String,
    val linkTarget: String?,
    val linkTargetType: String?
)