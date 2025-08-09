package com.yourjob.backend.controller.position

import com.yourjob.backend.entity.payment.PaymentResponse
import com.yourjob.backend.entity.product.ProductResponse
import com.yourjob.backend.service.payment.PaymentCreateService
import com.yourjob.backend.service.payment.PaymentService
import com.yourjob.backend.service.product.ProductService
import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

/**
 * 포지션 제안 관련 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/client/position")
class PositionOfferPaymentController(
    private val paymentService: PaymentService,
    private val productService: ProductService,
    private val paymentCreateService: PaymentCreateService
) {

    /**
     * 포지션 제안 상품 목록 조회
     */
    @GetMapping("/products")
    fun getPositionProducts(): ResponseEntity<List<ProductResponse>> {
        val products = productService.getActivePositionOfferProducts()
        return ResponseEntity.ok(products)
    }

    /**
     * 포지션 제안 사용 현황 조회
     */
    @GetMapping("/status")
    fun getPositionOfferStatus(session: HttpSession): ResponseEntity<Any> {
        val userId = session.getAttribute("userId")?.toString() ?:
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        // 활성화된 포지션 제안 결제 내역 조회
        val activePayments = paymentService.getActivePositionOfferPayments(userId)

        if (activePayments.isEmpty()) {
            return ResponseEntity.ok(mapOf("hasActive" to false))
        }

        // 활성화된 상품 정보 구성
        val activeProducts = activePayments.map { payment ->
            val totalCount = payment.maxExposureCount
            val usedCount = payment.exposureCount
            val remainingCount = if (totalCount > 0) totalCount - usedCount else 0

            mapOf(
                "id" to payment.id,
                "productName" to payment.productName,
                "startDate" to payment.startDate,
                "endDate" to payment.endDate,
                "remainingCount" to remainingCount
            )
        }

        return ResponseEntity.ok(mapOf(
            "hasActive" to true,
            "activeProducts" to activeProducts
        ))
    }

    /**
     * 포지션 제안 상품 구매
     */
    @PostMapping("/purchase")
    fun purchasePositionOffer(
        @RequestBody request: PositionOfferRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        val userId = session.getAttribute("userId")?.toString() ?:
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        try {
            // 상품 정보 조회
            val product = productService.getProductById(request.productId)
                ?: return ResponseEntity.badRequest().body(mapOf(
                    "success" to false,
                    "message" to "상품을 찾을 수 없습니다."
                ))

            // 포지션 제안 상품인지 확인
            if (product.productType != "position_offer") {
                return ResponseEntity.badRequest().body(mapOf(
                    "success" to false,
                    "message" to "포지션 제안 상품이 아닙니다."
                ))
            }

            // 날짜 설정
            val startDate = LocalDate.now().toString()

            // 결제 생성
            val paymentResponse = paymentCreateService.createPositionOfferPayment(
                productId = request.productId,
                userId = userId,
                paymentMethod = request.paymentMethod,
                phoneNumber = null
            )

            return if (paymentResponse != null) {
                ResponseEntity.status(HttpStatus.CREATED).body(mapOf(
                    "success" to true,
                    "paymentInfo" to paymentResponse,
                    "message" to "포지션 제안 상품 신청이 완료되었습니다."
                ))
            } else {
                ResponseEntity.badRequest().body(mapOf(
                    "success" to false,
                    "message" to "포지션 제안 상품 신청에 실패했습니다."
                ))
            }
        } catch (e: Exception) {
            return ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to "처리 중 오류가 발생했습니다: ${e.message}"
            ))
        }
    }

    /**
     * 포지션 제안 이용내역 조회
     */
    @GetMapping("/history")
    fun getPositionOfferHistory(session: HttpSession): ResponseEntity<List<PaymentResponse>> {
        val userId = session.getAttribute("userId")?.toString() ?:
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        // 포지션 제안 관련 결제 내역 조회
        val payments = paymentService.getPaymentsByUserId(userId)
            .filter { it.productName.contains("포지션 제안") }

        return ResponseEntity.ok(payments)
    }
}

/**
 * 포지션 제안 상품 구매 요청 DTO
 */
data class PositionOfferRequest(
    val productId: Long,
    val paymentMethod: String
)