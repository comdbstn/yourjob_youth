package com.yourjob.backend.entity.product

import java.math.BigDecimal
import java.time.LocalDateTime

data class PremiumProduct(
    val premiumProductId: Int? = null,
    val productCode: String, // PREMIUM_JOB_POST, TOP_EXPOSURE, URGENT_HIRING, etc.
    val name: String,
    val description: String?,
    val productType: ProductType, // JOB_POST, RESUME, BANNER, etc.
    val exposureType: ExposureType, // TOP, URGENT, FEATURED, PREMIUM, etc.
    val price: BigDecimal,
    val discountPrice: BigDecimal?,
    val periodDays: Int, // 노출 기간 (일)
    val exposureCount: Int?, // 노출 횟수 제한 (null이면 무제한)
    val features: List<String>?, // 상품 특징/혜택 목록
    val isActive: Boolean = true,
    val sortOrder: Int = 0,
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)

enum class ProductType {
    JOB_POST,      // 채용공고 관련 상품
    RESUME,        // 이력서 관련 상품  
    BANNER,        // 배너 광고 상품
    COMPANY,       // 기업 프로필 관련 상품
    TALENT_SEARCH  // 인재 검색 관련 상품
}

enum class ExposureType {
    TOP,        // 최상단 노출
    URGENT,     // 급구 표시
    FEATURED,   // 추천 공고
    PREMIUM,    // 프리미엄 공고
    HIGHLIGHT,  // 하이라이트
    BANNER      // 배너형
}

data class PremiumProductRequest(
    val productCode: String,
    val name: String,
    val description: String?,
    val productType: String,
    val exposureType: String,
    val price: BigDecimal,
    val discountPrice: BigDecimal?,
    val periodDays: Int,
    val exposureCount: Int?,
    val features: List<String>?,
    val isActive: Boolean = true,
    val sortOrder: Int = 0
)

data class PremiumProductResponse(
    val premiumProductId: Int,
    val productCode: String,
    val name: String,
    val description: String?,
    val productType: String,
    val exposureType: String,
    val price: BigDecimal,
    val discountPrice: BigDecimal?,
    val finalPrice: BigDecimal, // 할인가 또는 정가
    val periodDays: Int,
    val exposureCount: Int?,
    val features: List<String>?,
    val isActive: Boolean,
    val sortOrder: Int,
    val createdAt: String?,
    val updatedAt: String?
)