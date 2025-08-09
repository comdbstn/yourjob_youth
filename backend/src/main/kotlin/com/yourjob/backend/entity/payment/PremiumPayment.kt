package com.yourjob.backend.entity.payment

import java.math.BigDecimal
import java.time.LocalDateTime

data class PremiumPayment(
    val paymentId: Int? = null,
    val userId: Int,
    val companyId: Int?, // 기업회원인 경우
    val jobPostingId: Int?, // 채용공고 관련 결제인 경우
    val premiumProductId: Int,
    val paymentKey: String, // 토스페이먼츠 등 PG사 결제키
    val orderId: String, // 주문 ID
    val orderName: String, // 주문명
    val amount: BigDecimal,
    val actualAmount: BigDecimal, // 실제 결제 금액 (할인 적용 후)
    val currency: String = "KRW",
    val paymentMethod: PaymentMethod,
    val paymentStatus: PaymentStatus,
    val pgProvider: String, // TOSS, KAKAOPAY, etc.
    val pgTransactionId: String?, // PG사 거래 ID
    val approvedAt: LocalDateTime?,
    val cancelledAt: LocalDateTime?,
    val cancelReason: String?,
    val failReason: String?,
    val startDate: LocalDateTime?, // 상품 시작일
    val endDate: LocalDateTime?, // 상품 종료일
    val isActive: Boolean = true,
    val exposureCount: Int = 0, // 현재 노출 횟수
    val maxExposureCount: Int?, // 최대 노출 횟수
    val metadata: Map<String, Any>?, // 추가 메타데이터
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)

enum class PaymentMethod {
    CARD,           // 신용카드
    VIRTUAL_ACCOUNT, // 가상계좌
    BANK_TRANSFER,   // 계좌이체
    MOBILE,         // 휴대폰 결제
    KAKAOPAY,       // 카카오페이
    NAVERPAY,       // 네이버페이
    PAYCO,          // 페이코
    TOSS            // 토스페이
}

enum class PaymentStatus {
    PENDING,        // 결제 대기
    IN_PROGRESS,    // 결제 진행중
    COMPLETED,      // 결제 완료
    CANCELLED,      // 결제 취소
    FAILED,         // 결제 실패
    REFUNDED,       // 환불 완료
    PARTIAL_REFUNDED // 부분 환불
}

data class PaymentRequest(
    val premiumProductId: Int,
    val jobPostingId: Int?,
    val paymentMethod: String,
    val successUrl: String,
    val failUrl: String,
    val customerName: String?,
    val customerEmail: String?,
    val customerPhone: String?
)

data class PaymentResponse(
    val paymentId: Int,
    val orderId: String,
    val orderName: String,
    val amount: BigDecimal,
    val paymentMethod: String,
    val paymentStatus: String,
    val paymentUrl: String?, // 결제 URL (결제창 호출용)
    val approvedAt: String?,
    val startDate: String?,
    val endDate: String?,
    val createdAt: String?
)

data class PaymentConfirmRequest(
    val paymentKey: String,
    val orderId: String,
    val amount: BigDecimal
)

data class PaymentCancelRequest(
    val paymentId: Int,
    val cancelReason: String
)