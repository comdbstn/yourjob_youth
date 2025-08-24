package com.yourjob.backend.entity.payment

data class PaymentRequest(
    val paymentId: String,
    val userId: String,
    val productName: String,
    val jobPostingsName: String? = null,
    val jobPostingsId: Long? = null,
    val startDate: String,
    val endDate: String,
    val amount: String,
    val paymentMethod: String,
    val status: String,
    val phoneNumber: String? = null,
    val maxExposureCount: Int = 0,
    val bannerImageUrl: String? = null
)

data class PaymentUpdateRequest(
    val status: String,
    val isEnded: Boolean? = null,
    val bannerImageUrl: String? = null
)

data class PaymentResponse(
    val id: Long,
    val paymentId: String,
    val userId: String,
    val productName: String,
    val jobPostingsName: String?,
    val jobPostingsId: Long?,
    val startDate: String,
    val endDate: String,
    val amount: String,
    val paymentMethod: String,
    val status: String,
    val phoneNumber: String?,
    val exposureCount: Int,
    val maxExposureCount: Int,
    val isEnded: Boolean,
    val bannerImageUrl: String? = null
)

data class PaymentWithUserResponse(
    val id: Long,
    val paymentId: String,
    val userId: String,
    val accountId: String?,
    val productName: String,
    val jobPostingsName: String?,
    val jobPostingsId: Long?,
    val startDate: String,
    val endDate: String,
    val amount: String,
    val paymentMethod: String,
    val status: String,
    val phoneNumber: String?,
    val exposureCount: Int = 0,
    val maxExposureCount: Int = 0,
    val isEnded: Boolean = false,
    val bannerImageUrl: String? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null
)

// 페이징 응답을 위한 클래스
data class PaymentPageResponse(
    val content: List<PaymentWithUserResponse>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
    val number: Int,
    val first: Boolean,
    val last: Boolean,
    val numberOfElements: Int,
    val empty: Boolean
)