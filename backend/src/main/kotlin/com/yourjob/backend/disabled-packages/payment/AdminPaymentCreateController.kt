package com.yourjob.backend.controller.admin

import com.yourjob.backend.entity.payment.PaymentResponse
import com.yourjob.backend.entity.product.ProductResponse
import com.yourjob.backend.service.payment.PaymentCreateService
import com.yourjob.backend.service.product.ProductService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/admin/payment/create")
class AdminPaymentCreateController(
    private val paymentCreateService: PaymentCreateService,
    private val productService: ProductService
) {

    /**
     * 상품 목록 조회 API
     */
    @GetMapping("/products")
    fun getProducts(
        @RequestParam(required = false) type: String?,
        @RequestParam(required = false) explosureType: String?,
        @RequestParam(required = false) status: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<Iterable<ProductResponse>> {
        val pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"))

        val products = if (type != null && explosureType != null) {
            productService.getActiveProductsByTypeAndExplosureType(type, explosureType)
        } else if (type != null) {
            productService.getProductsByType(type)
        } else if (explosureType != null) {
            productService.getProductsByExplosureType(explosureType)
        } else {
            productService.getAllProducts(status, type, pageRequest)
        }

        return ResponseEntity.ok(products)
    }

    /**
     * 상품 ID로 결제 생성 API
     */
    @PostMapping("/by-product/{productId}")
    fun createPaymentByProduct(
        @PathVariable productId: Long,
        @RequestBody request: CreatePaymentByProductRequest
    ): ResponseEntity<PaymentResponse> {
        val paymentResponse = paymentCreateService.createPaymentFromProduct(
            productId = productId,
            userId = request.userId,
            jobPostingsId = request.jobPostingsId,
            jobPostingsName = request.jobPostingsName,
            paymentMethod = request.paymentMethod,
            phoneNumber = request.phoneNumber
        )

        return if (paymentResponse != null) {
            ResponseEntity.status(HttpStatus.CREATED).body(paymentResponse)
        } else {
            ResponseEntity.badRequest().build()
        }
    }

    /**
     * 상품 속성으로 결제 생성 API
     */
    @PostMapping("/by-attributes")
    fun createPaymentByAttributes(
        @RequestBody request: CreatePaymentByAttributesRequest
    ): ResponseEntity<PaymentResponse> {
        val paymentResponse = paymentCreateService.createPaymentByProductAttributes(
            productType = request.productType,
            exposureType = request.exposureType,
            periodOrCount = request.periodOrCount,
            userId = request.userId,
            jobPostingsId = request.jobPostingsId,
            jobPostingsName = request.jobPostingsName,
            paymentMethod = request.paymentMethod,
            phoneNumber = request.phoneNumber
        )

        return if (paymentResponse != null) {
            ResponseEntity.status(HttpStatus.CREATED).body(paymentResponse)
        } else {
            ResponseEntity.badRequest().build()
        }
    }
}

/**
 * 상품 ID로 결제 생성 요청 DTO
 */
data class CreatePaymentByProductRequest(
    val userId: String,
    val jobPostingsId: Long,
    val jobPostingsName: String,
    val paymentMethod: String,
    val phoneNumber: String? = null
)

/**
 * 상품 속성으로 결제 생성 요청 DTO
 */
data class CreatePaymentByAttributesRequest(
    val productType: String,
    val exposureType: String,
    val periodOrCount: Int,
    val userId: String,
    val jobPostingsId: Long,
    val jobPostingsName: String,
    val paymentMethod: String,
    val phoneNumber: String? = null
)