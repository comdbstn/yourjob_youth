package com.yourjob.backend.entity.product

import java.math.BigDecimal
import java.time.LocalDateTime

data class ProductRequest(
    val productId: String,
    val status: String,
    val type: String,
    var productType: String,
    val name: String,
    val explosureType: String,
    val periodDays: Int = 0,
    val exposureCount: Int = 0,
    val price: BigDecimal = BigDecimal.ZERO
)

data class ProductUpdateRequest(
    val status: String? = null,
    val type: String? = null,
    val name: String? = null,
    val explosureType: String? = null,
    val periodDays: Int? = null,
    val exposureCount: Int? = null,
    val price: BigDecimal? = null
)

data class ProductResponse(
    val id: Long,
    val productId: String,
    val status: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val type: String,
    var productType: String,
    val name: String,
    val explosureType: String,
    val periodDays: Int,
    val exposureCount: Int,
    val price: BigDecimal
)