package com.yourjob.backend.controller.admin

import com.yourjob.backend.entity.product.ProductResponse
import com.yourjob.backend.service.product.ProductService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal

@RestController
@RequestMapping("/api/v1/admin/job-offers")
class AdminJobOfferController(
    private val productService: ProductService
) {

    /**
     * 포지션 제안 상품 목록 조회
     */
    @GetMapping("/products")
    fun getPositionOfferProducts(): ResponseEntity<List<ProductResponse>> {
        val products = productService.getActivePositionOfferProducts()
        return ResponseEntity.ok(products)
    }

    /**
     * 새 건별 포지션 제안 상품 생성
     */
    @PostMapping("/products/by-count")
    fun createPositionOfferProductByCount(@RequestBody request: CreatePositionOfferByCountRequest): ResponseEntity<ProductResponse> {
        val product = productService.createPositionOfferProduct(
            exposureType = "건별",
            periodOrCount = request.offerCount,
            price = request.price,
            description = request.description
        )
        return ResponseEntity.status(HttpStatus.CREATED).body(product)
    }

    /**
     * 새 기간별 포지션 제안 상품 생성
     */
    @PostMapping("/products/by-period")
    fun createPositionOfferProductByPeriod(@RequestBody request: CreatePositionOfferByPeriodRequest): ResponseEntity<ProductResponse> {
        val product = productService.createPositionOfferProduct(
            exposureType = "기간별",
            periodOrCount = request.periodDays,
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
        @RequestBody request: UpdateProductStatusRequest
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
        @RequestBody request: UpdateProductPriceRequest
    ): ResponseEntity<ProductResponse> {
        val product = productService.updateProduct(
            productId,
            com.yourjob.backend.entity.product.ProductUpdateRequest(price = request.price)
        ) ?: return ResponseEntity.notFound().build()

        return ResponseEntity.ok(product)
    }
}

/**
 * 건별 포지션 제안 상품 생성 요청 DTO
 */
data class CreatePositionOfferByCountRequest(
    val offerCount: Int,
    val price: BigDecimal,
    val description: String? = null
)

/**
 * 기간별 포지션 제안 상품 생성 요청 DTO
 */
data class CreatePositionOfferByPeriodRequest(
    val periodDays: Int,
    val price: BigDecimal,
    val description: String? = null
)

/**
 * 상품 상태 업데이트 요청 DTO
 */
data class UpdateProductStatusRequest(
    val status: String
)

/**
 * 상품 가격 업데이트 요청 DTO
 */
data class UpdateProductPriceRequest(
    val price: BigDecimal
)