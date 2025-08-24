package com.yourjob.backend.entity

data class MetaTagResponse(
    val title: String,
    val description: String,
    val image: String?,
    val url: String,
    val type: String = "website",
    val siteName: String = "URJob",
    val twitterCard: String = "summary_large_image"
) 