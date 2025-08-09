package com.yourjob.backend.controller.payment

import com.yourjob.backend.entity.payment.PaymentResponse
import com.yourjob.backend.entity.product.ProductResponse
import com.yourjob.backend.service.JobsService
import com.yourjob.backend.service.payment.PaymentCreateService
import com.yourjob.backend.service.payment.PaymentService
import com.yourjob.backend.service.product.ProductService
import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

/**
 * 사용자(기업)용 결제 관련 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/client/payment")
class ClientPaymentController(
    private val paymentService: PaymentService,
    private val productService: ProductService,
    private val paymentCreateService: PaymentCreateService,
    private val jobsService: JobsService
) {

    /**
     * 내 결제 이력 조회
     */
    @GetMapping("/my-payments")
    fun getMyPayments(session: HttpSession): ResponseEntity<List<PaymentResponse>> {
        val userId = session.getAttribute("userId")?.toString() ?:
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        val payments = paymentService.getPaymentsByUserId(userId)
        return ResponseEntity.ok(payments)
    }

    /**
     * 프리미엄 상품 목록 조회
     */
    @GetMapping("/products")
    fun getPremiumProducts(
        @RequestParam(required = false) exposureType: String?
    ): ResponseEntity<List<ProductResponse>> {
        val products = if (exposureType != null) {
            productService.getActiveProductsByTypeAndExplosureType("company", exposureType)
        } else {
            productService.getProductsByType("company")
                .filter { it.status == "active" }
        }

        return ResponseEntity.ok(products)
    }

    /**
     * 내 채용공고에 대한 결제 생성
     */
    @PostMapping("/job/{jobId}/create")
    fun createJobPayment(
        @PathVariable jobId: Int,
        @RequestBody request: ClientPaymentRequest,
        session: HttpSession
    ): ResponseEntity<PaymentResponse> {
        val userId = session.getAttribute("userId")?.toString() ?:
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        // 채용공고 조회
        val job = jobsService.selectJobDetail(jobId)

        // 공고 소유자 확인
        if (job.employerId?.toString() != userId) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }

        // 결제 생성
        val paymentResponse = paymentCreateService.createPaymentByProductAttributes(
            productType = request.productType,
            exposureType = request.exposureType,
            periodOrCount = request.periodOrCount,
            userId = userId,
            jobPostingsId = jobId.toLong(),
            jobPostingsName = job.title ?: "제목 없음",
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
     * 결제 취소 (pending 상태인 경우에만 가능)
     */
    @PostMapping("/{paymentId}/cancel")
    fun cancelPayment(
        @PathVariable paymentId: Long,
        session: HttpSession
    ): ResponseEntity<Any> {
        val userId = session.getAttribute("userId")?.toString() ?:
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        // 결제 정보 조회
        val payment = paymentService.getPaymentById(paymentId) ?:
        return ResponseEntity.notFound().build()

        // 본인 결제 확인
        if (payment.userId != userId) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }

        // pending 상태인 경우에만 취소 가능
        if (payment.status != "pending") {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(mapOf("message" to "Can only cancel payments in 'pending' status"))
        }

        // 결제 상태 변경 (cancelled)
        val updatedPayment = paymentService.updatePaymentStatus(
            payment.id,
            com.yourjob.backend.entity.payment.PaymentUpdateRequest(status = "cancelled")
        ) ?: return ResponseEntity.badRequest().build()

        return ResponseEntity.ok(updatedPayment)
    }

    /**
     * 내 채용공고의 결제 상태 확인
     */
    @GetMapping("/job/{jobId}/status")
    fun getJobPaymentStatus(
        @PathVariable jobId: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val userId = session.getAttribute("userId")?.toString() ?:
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        // 채용공고 조회
        val job = jobsService.selectJobDetail(jobId)

        // 공고 소유자 확인
        if (job.employerId?.toString() != userId) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }

        // 결제 정보 조회
        val activePayment = paymentService.getActivePaymentByJobId(jobId.toLong())

        return if (activePayment != null) {
            val premiumType = when {
                activePayment.productName.contains("VVIP") -> "VVIP"
                activePayment.productName.contains("VIP") -> "VIP"
                activePayment.productName.contains("SPECIAL") -> "SPECIAL"
                else -> ""
            }
            val exposureType = if (activePayment.maxExposureCount > 0) "건별" else "기간별"

            ResponseEntity.ok(mapOf(
                "hasActivePayment" to true,
                "premiumType" to premiumType,
                "exposureType" to exposureType,
                "startDate" to activePayment.startDate,
                "endDate" to activePayment.endDate,
                "exposureCount" to activePayment.exposureCount,
                "maxExposureCount" to activePayment.maxExposureCount,
                "status" to activePayment.status,
                "isEnded" to activePayment.isEnded
            ))
        } else {
            ResponseEntity.ok(mapOf("hasActivePayment" to false))
        }
    }
}

/**
 * 클라이언트 결제 생성 요청 DTO
 */
data class ClientPaymentRequest(
    val productType: String,
    val exposureType: String,
    val periodOrCount: Int,
    val paymentMethod: String,
    val phoneNumber: String? = null
)