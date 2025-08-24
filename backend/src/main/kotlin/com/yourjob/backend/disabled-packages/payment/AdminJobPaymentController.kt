package com.yourjob.backend.controller.admin

import com.yourjob.backend.entity.payment.PaymentResponse
import com.yourjob.backend.entity.payment.PaymentUpdateRequest
import com.yourjob.backend.service.JobsService
import com.yourjob.backend.service.payment.PaymentCreateService
import com.yourjob.backend.service.payment.PaymentService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

/**
 * 관리자 페이지에서 채용공고와 결제를 연동하는 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/admin/job-payment")
class AdminJobPaymentController(
    private val jobsService: JobsService,
    private val paymentService: PaymentService,
    private val paymentCreateService: PaymentCreateService
) {

    /**
     * 특정 채용공고의 결제 이력 조회
     */
    @GetMapping("/job/{jobId}/payments")
    fun getJobPayments(@PathVariable jobId: Long): ResponseEntity<List<PaymentResponse>> {
        val payments = paymentService.getPaymentsByJobId(jobId)
        return ResponseEntity.ok(payments)
    }

    /**
     * 특정 채용공고의 활성화된 결제 정보 조회
     */
    @GetMapping("/job/{jobId}/active-payment")
    fun getActiveJobPayment(@PathVariable jobId: Long): ResponseEntity<Any> {
        val payment = paymentService.getActivePaymentByJobId(jobId)

        return if (payment != null) {
            ResponseEntity.ok(mapOf(
                "hasActivePayment" to true,
                "payment" to PaymentResponse(
                    id = payment.id,
                    paymentId = payment.paymentId,
                    userId = payment.userId,
                    productName = payment.productName,
                    jobPostingsName = payment.jobPostingsName,
                    jobPostingsId = payment.jobPostingsId,
                    startDate = payment.startDate,
                    endDate = payment.endDate,
                    amount = payment.amount,
                    paymentMethod = payment.paymentMethod,
                    status = payment.status,
                    phoneNumber = payment.phoneNumber,
                    exposureCount = payment.exposureCount,
                    maxExposureCount = payment.maxExposureCount,
                    isEnded = payment.isEnded
                )
            ))
        } else {
            ResponseEntity.ok(mapOf("hasActivePayment" to false))
        }
    }

    /**
     * 채용공고에 프리미엄 상품 결제 생성
     */
    @PostMapping("/job/{jobId}/create-payment")
    fun createJobPayment(
        @PathVariable jobId: Long,
        @RequestBody request: JobPaymentRequest
    ): ResponseEntity<PaymentResponse> {
        // 채용공고 조회
        val job = jobsService.selectJobDetail(jobId.toInt())

        if (job == null) {
            return ResponseEntity.notFound().build()
        }

        // 기존 활성화된 결제가 있는지 확인
        if (paymentService.hasActivePaymentForJob(jobId)) {
            // 기존 활성화된 결제가 있는 경우 에러 응답
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .build()
        }

        // 결제 생성
        val paymentResponse = paymentCreateService.createPaymentByProductAttributes(
            productType = request.productType,
            exposureType = request.exposureType,
            periodOrCount = request.periodOrCount,
            userId = job.employerId.toString(),
            jobPostingsId = jobId,
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
     * 기존 결제 종료 및 새 결제 생성 (교체)
     */
    @PostMapping("/job/{jobId}/replace-payment")
    fun replaceJobPayment(
        @PathVariable jobId: Long,
        @RequestBody request: JobPaymentRequest
    ): ResponseEntity<PaymentResponse> {
        // 채용공고 조회
        val job = jobsService.selectJobDetail(jobId.toInt())

        if (job == null) {
            return ResponseEntity.notFound().build()
        }

        // 기존 활성화된 결제가 있는 경우 종료 처리
        val activePayment = paymentService.getActivePaymentByJobId(jobId)
        if (activePayment != null) {
            paymentService.updatePaymentStatus(
                activePayment.id,
                PaymentUpdateRequest(status = activePayment.status, isEnded = true)
            )
        }

        // 새 결제 생성
        val paymentResponse = paymentCreateService.createPaymentByProductAttributes(
            productType = request.productType,
            exposureType = request.exposureType,
            periodOrCount = request.periodOrCount,
            userId = job.employerId.toString(),
            jobPostingsId = jobId,
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
     * 채용공고의 결제 정보 상태 변경 (지불 확인, 취소, 환불 등)
     */
    @PatchMapping("/job/{jobId}/payment-status")
    fun updateJobPaymentStatus(
        @PathVariable jobId: Long,
        @RequestBody request: JobPaymentStatusRequest
    ): ResponseEntity<Any> {
        // 활성화된 결제 조회
        val activePayment = paymentService.getActivePaymentByJobId(jobId) ?:
        return ResponseEntity.notFound().build()

        // 상태 업데이트
        val updatedPayment = paymentService.updatePaymentStatus(
            activePayment.id,
            PaymentUpdateRequest(status = request.status, isEnded = request.isEnded)
        ) ?: return ResponseEntity.badRequest().build()

        return ResponseEntity.ok(updatedPayment)
    }
}

/**
 * 채용공고 결제 생성 요청 DTO
 */
data class JobPaymentRequest(
    val productType: String,
    val exposureType: String,
    val periodOrCount: Int,
    val paymentMethod: String,
    val phoneNumber: String? = null
)

/**
 * 채용공고 결제 상태 변경 요청 DTO
 */
data class JobPaymentStatusRequest(
    val status: String,
    val isEnded: Boolean? = null
)