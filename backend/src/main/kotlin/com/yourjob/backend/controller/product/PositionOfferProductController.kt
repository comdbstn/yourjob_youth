package com.yourjob.backend.controller.product

import com.yourjob.backend.entity.product.ProductResponse
import com.yourjob.backend.service.product.ProductService
import com.yourjob.backend.service.payment.PaymentCreateService
import com.yourjob.backend.entity.payment.PaymentResponse
import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/client/position-offers")
class PositionOfferProductController(
    private val productService: ProductService,
    private val paymentCreateService: PaymentCreateService
) {

    /**
     * 포지션 제안 상품 목록 조회 (기업 사용자용)
     */
    @GetMapping("/products")
    fun getPositionOfferProducts(): ResponseEntity<List<ProductResponse>> {
        val products = productService.getActivePositionOfferProducts()
        return ResponseEntity.ok(products)
    }

    /**
     * 포지션 제안 상품 구매 (무통장 입금 대기)
     */
    /*@PostMapping("/purchase")
    fun purchasePositionOffer(
        @RequestBody request: PositionOfferPurchaseRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        // 세션에서 로그인된 userId 가져오기
        val userId = session.getAttribute("userId")?.toString()
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        // 상품 정보 조회
        val product = productService.getProductById(request.productId)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "존재하지 않는 상품입니다."))

        // 노출 타입과 값 결정
        val exposType    = product.explosureType    // "기간별" 또는 "건별"
        val periodOrCount = if (exposType == "기간별") product.periodDays else product.exposureCount

        // 결제 생성 (무통장 입금)
        val paymentInfo: PaymentResponse? = paymentCreateService.createPaymentByProductAttributes(
            productType     = "POSITION-OFFER",
            exposureType    = exposType,
            periodOrCount   = periodOrCount,
            userId          = userId,
            paymentMethod   = "bank",
            requestStartDate= null
        )

        return if (paymentInfo != null) {
            ResponseEntity.status(HttpStatus.CREATED).body(
                mapOf(
                    "paymentInfo" to paymentInfo,
                    "message"     to "포지션 제안 상품 구매 신청이 완료되었습니다. 무통장 입금 계좌를 확인해주세요."
                )
            )
        } else {
            ResponseEntity.badRequest().body(
                mapOf("error" to "포지션 제안 상품 구매에 실패했습니다.")
            )
        }
    }*/
}

/**
 * 포지션 제안 구매 요청 DTO
 */
data class PositionOfferPurchaseRequest(
    val productId: Long,
    val paymentMethod: String    // 클라이언트 요청 시 무통장(bank)으로 고정해도 되고, 확장성을 위해 필드로 둡니다.
)
