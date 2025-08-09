package com.yourjob.backend.controller.admin

import com.yourjob.backend.entity.product.ProductResponse
import com.yourjob.backend.service.product.ProductService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal

@RestController
@RequestMapping("/api/v1/admin/banner-ads")
class AdminBannerProductController(
    private val productService: ProductService
) {

    /**
     * 배너 광고 상품 목록 조회
     */
    @GetMapping("/products")
    fun getBannerProducts(): ResponseEntity<List<ProductResponse>> {
        val products = productService.getActiveBannerProducts()
        return ResponseEntity.ok(products)
    }

    /**
     * 새 사각형 배너 광고 상품 생성
     */
    @PostMapping("/products/rectangle")
    fun createRectangleBannerProduct(@RequestBody request: CreateBannerProductRequest): ResponseEntity<ProductResponse> {
        val product = productService.createBannerProduct(
            bannerType = "rectangle",
            periodDays = request.periodDays,
            price = request.price,
            description = request.description
        )
        return ResponseEntity.status(HttpStatus.CREATED).body(product)
    }

    /**
     * 새 가로형 배너 광고 상품 생성
     */
    @PostMapping("/products/horizontal")
    fun createHorizontalBannerProduct(@RequestBody request: CreateBannerProductRequest): ResponseEntity<ProductResponse> {
        val product = productService.createBannerProduct(
            bannerType = "horizontal",
            periodDays = request.periodDays,
            price = request.price,
            description = request.description
        )
        return ResponseEntity.status(HttpStatus.CREATED).body(product)
    }

    /**
     * 기존 상품 활성/비활성 상태 변경
     */
    @PatchMapping("/products/{productId}/status")
    fun updateProductStatus(
        @PathVariable productId: Long,
        @RequestBody request: UpdateBannerProductStatusRequest
    ): ResponseEntity<ProductResponse> {
        val product = productService.updateProduct(
            productId,
            com.yourjob.backend.entity.product.ProductUpdateRequest(status = request.status)
        ) ?: return ResponseEntity.notFound().build()

        return ResponseEntity.ok(product)
    }

    /**
     * 상품 가격 업데이트
     */
    @PatchMapping("/products/{productId}/price")
    fun updateProductPrice(
        @PathVariable productId: Long,
        @RequestBody request: UpdateBannerProductPriceRequest
    ): ResponseEntity<ProductResponse> {
        val product = productService.updateProduct(
            productId,
            com.yourjob.backend.entity.product.ProductUpdateRequest(price = request.price)
        ) ?: return ResponseEntity.notFound().build()

        return ResponseEntity.ok(product)
    }

    /**
     * 배너 광고 결제 승인 후 배너 활성화
     */
    @PatchMapping("/payments/{paymentId}/approve")
    fun approveBannerPayment(@PathVariable paymentId: String): ResponseEntity<Map<String, Any>> {
        // 결제 ID로 배너 상태 활성화
        val updatedBanner = productService.activateBannerByPaymentId(paymentId)
            ?: return ResponseEntity.notFound().build()

        return ResponseEntity.ok(mapOf(
            "success" to true,
            "message" to "배너 광고가 승인되었습니다.",
            "bannerId" to updatedBanner.id
        ))
    }
}

/**
 * 배너 광고 상품 생성 요청 DTO
 */
data class CreateBannerProductRequest(
    val periodDays: Int,
    val price: BigDecimal,
    val description: String? = null
)

/**
 * 배너 상품 상태 업데이트 요청 DTO
 */
data class UpdateBannerProductStatusRequest(
    val status: String
)

/**
 * 배너 상품 가격 업데이트 요청 DTO
 */
data class UpdateBannerProductPriceRequest(
    val price: BigDecimal
)