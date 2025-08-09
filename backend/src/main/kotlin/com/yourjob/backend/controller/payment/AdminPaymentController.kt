package com.yourjob.backend.controller.admin

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
@RequestMapping("/api/v1/admin/payment")
class AdminPaymentController(private val paymentService: PaymentService) {

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
        val pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"))
        val paymentsPage = paymentService.getAllPaymentsWithUserInfo(
            status, productName, paymentMethod, depositStatus, startDate, endDate, keyword, pageRequest
        )
        return ResponseEntity.ok(paymentsPage)
    }

    @GetMapping("/{id}")
    fun getPaymentById(@PathVariable id: Long): ResponseEntity<PaymentWithUserResponse> {
        val payment = paymentService.getPaymentByIdWithUserInfo(id) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(payment)
    }

    @GetMapping("/user/{accountId}")
    fun getPaymentsByAccountId(@PathVariable accountId: String): ResponseEntity<List<PaymentWithUserResponse>> {
        return ResponseEntity.ok(paymentService.getPaymentsByAccountId(accountId))
    }

    @GetMapping("/job/{jobId}")
    fun getPaymentsByJobId(@PathVariable jobId: Long): ResponseEntity<List<PaymentResponse>> {
        return ResponseEntity.ok(paymentService.getPaymentsByJobId(jobId))
    }

    @PostMapping
    fun createPayment(@RequestBody request: PaymentRequest): ResponseEntity<PaymentResponse> {
        // 관리자가 직접 결제 정보를 생성할 수 있는 엔드포인트
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createPayment(request))
    }

    @PutMapping
    fun updatePayment(@RequestBody request: PaymentRequest): ResponseEntity<PaymentResponse> {
        // 관리자가 직접 결제 정보를 생성할 수 있는 엔드포인트
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.updatePayment(request))
    }

    @PatchMapping("/{id}/status")
    fun updatePaymentStatus(@PathVariable id: Long, @RequestBody request: PaymentUpdateRequest): ResponseEntity<PaymentResponse> {
        // 관리자가 결제 상태를 업데이트할 수 있는 엔드포인트 (pending -> paid, paid -> refunded 등)
        val payment = paymentService.updatePaymentStatus(id, request) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(payment)
    }

    @PatchMapping("/{id}/end")
    fun endPayment(@PathVariable id: Long): ResponseEntity<PaymentResponse> {
        // 결제를 강제로 종료시키는 엔드포인트
        val request = PaymentUpdateRequest(status = "paid", isEnded = true)
        val payment = paymentService.updatePaymentStatus(id, request) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(payment)
    }

    @DeleteMapping("/{id}")
    fun deletePayment(@PathVariable id: Long): ResponseEntity<Void> {
        // 관리자가 결제 정보를 삭제할 수 있는 엔드포인트
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

    @PostMapping("/check-expired")
    fun checkAndUpdateExpiredPayments(): ResponseEntity<Map<String, String>> {
        // 만료된 결제 확인 및 업데이트 수동 트리거
        paymentService.checkAndUpdateExpiredPayments()
        return ResponseEntity.ok(mapOf("message" to "Expired payments checked and updated"))
    }
}

// 벌크 삭제 요청 및 응답 클래스
data class BulkDeleteRequest(val ids: List<Long>)
data class BulkDeleteResponse(val deletedCount: Int)

// 벌크 상태 업데이트 요청 및 응답 클래스
data class BulkStatusUpdateRequest(val ids: List<Long>, val status: String)
data class BulkUpdateResponse(val updatedCount: Int)