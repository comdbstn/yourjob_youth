package com.yourjob.backend.controller.payment

import com.yourjob.backend.entity.payment.PaymentRequest
import com.yourjob.backend.entity.payment.PaymentResponse
import com.yourjob.backend.entity.payment.PaymentUpdateRequest
import com.yourjob.backend.entity.payment.PaymentWithUserResponse
import com.yourjob.backend.service.payment.PaymentService
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/payment")
class PaymentController(private val paymentService: PaymentService) {

    @GetMapping
    fun getAllPayments(
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false) productName: String?,
        @RequestParam(required = false) paymentMethod: String?,
        @RequestParam(required = false) depositStatus: String?,
        @RequestParam(required = false) startDate: String?,
        @RequestParam(required = false) endDate: String?,
        @RequestParam(required = false) keyword: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<Any> {
        val response = mapOf(
            "message" to "💳 결제 시스템은 현재 개발 중입니다.",
            "status" to "under_development",
            "content" to emptyList<Any>(),
            "totalElements" to 0,
            "totalPages" to 0
        )
        return ResponseEntity.ok(response)
    }

    @GetMapping("/{id}")
    fun getPaymentById(@PathVariable id: Long): ResponseEntity<PaymentWithUserResponse> {
        val payment = paymentService.getPaymentByIdWithUserInfo(id) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(payment)
    }

    @GetMapping("/payment-id/{paymentId}")
    fun getPaymentByPaymentId(@PathVariable paymentId: String): ResponseEntity<PaymentWithUserResponse> {
        val payment = paymentService.getPaymentByPaymentIdWithUserInfo(paymentId) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(payment)
    }

    @GetMapping("/user/{accountId}")
    fun getPaymentsByAccountId(@PathVariable accountId: String): ResponseEntity<List<PaymentWithUserResponse>> {
        return ResponseEntity.ok(paymentService.getPaymentsByAccountId(accountId))
    }

    @GetMapping("/status/{status}")
    fun getPaymentsByStatus(
        @PathVariable status: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<Any> {
        val pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"))
        val paymentsPage = paymentService.getPaymentsByStatusWithUserInfo(status, pageRequest)
        return ResponseEntity.ok(paymentsPage)
    }

    @GetMapping("/job/{jobId}")
    fun getPaymentsByJobId(@PathVariable jobId: Long): ResponseEntity<List<PaymentResponse>> {
        return ResponseEntity.ok(paymentService.getPaymentsByJobId(jobId))
    }

    @GetMapping("/job/{jobId}/active")
    fun hasActivePaymentForJob(@PathVariable jobId: Long): ResponseEntity<Map<String, Boolean>> {
        val hasActive = paymentService.hasActivePaymentForJob(jobId)
        return ResponseEntity.ok(mapOf("hasActivePayment" to hasActive))
    }

    @PostMapping("/job/{jobId}/increment-exposure")
    fun incrementJobExposureCount(@PathVariable jobId: Long): ResponseEntity<Map<String, Boolean>> {
        val result = paymentService.incrementJobExposureCount(jobId)
        return ResponseEntity.ok(mapOf("success" to result))
    }

    @PostMapping
    fun createPayment(@RequestBody request: PaymentRequest): ResponseEntity<PaymentResponse> {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createPayment(request))
    }

    @PatchMapping("/{id}/status")
    fun updatePaymentStatus(@PathVariable id: Long, @RequestBody request: PaymentUpdateRequest): ResponseEntity<PaymentResponse> {
        val payment = paymentService.updatePaymentStatus(id, request) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(payment)
    }

    @DeleteMapping("/{id}")
    fun deletePayment(@PathVariable id: Long): ResponseEntity<Void> {
        paymentService.deletePayment(id)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/bulk")
    fun bulkDeletePayments(@RequestBody request: BulkDeleteRequest): ResponseEntity<BulkDeleteResponse> {
        val deletedCount = paymentService.bulkDeletePayments(request.ids)
        return ResponseEntity.ok(BulkDeleteResponse(deletedCount))
    }

    @PatchMapping("/bulk/status")
    fun bulkUpdateStatus(@RequestBody request: BulkStatusUpdateRequest): ResponseEntity<BulkUpdateResponse> {
        val updatedCount = paymentService.bulkUpdateStatus(request.ids, request.status)
        return ResponseEntity.ok(BulkUpdateResponse(updatedCount))
    }
}

// 벌크 삭제 요청 및 응답 클래스
data class BulkDeleteRequest(val ids: List<Long>)
data class BulkDeleteResponse(val deletedCount: Int)

// 벌크 상태 업데이트 요청 및 응답 클래스
data class BulkStatusUpdateRequest(val ids: List<Long>, val status: String)
data class BulkUpdateResponse(val updatedCount: Int)