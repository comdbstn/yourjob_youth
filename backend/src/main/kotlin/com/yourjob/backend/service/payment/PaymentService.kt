package com.yourjob.backend.service.payment

import com.yourjob.backend.entity.payment.*
import com.yourjob.backend.repository.mdms.UserManagementRepository
import com.yourjob.backend.repository.payment.PaymentRepository
import com.yourjob.backend.service.banner.BannerService
import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class PaymentService(
    private val paymentRepository: PaymentRepository,
    private val userManagementRepository: UserManagementRepository,
    private val bannerService: BannerService
) {
    @PersistenceContext
    private lateinit var entityManager: EntityManager

    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
    private val dateOnlyFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")

    /**
     * 모든 결제 정보를 조회하고, 사용자 정보(account_id)를 포함하여 반환합니다.
     */
    @Transactional(readOnly = true)
    fun getAllPaymentsWithUserInfo(
        status: String?,
        productName: String?,
        paymentMethod: String?,
        depositStatus: String?,
        startDate: String?,
        endDate: String?,
        keyword: String?,
        pageable: Pageable
    ): PaymentPageResponse {
        // 필터링된 결제 정보 조회
        val paymentsPage = paymentRepository.findAllWithFilters(
            status,
            productName,
            paymentMethod,
            depositStatus,
            startDate,
            endDate,
            keyword,
            pageable
        )

        // 사용자 정보 조회에 필요한 user_id 목록 추출
        val userIds = paymentsPage.content.map { it.userId }

        // 사용자 정보 조회
        val usersMap = userManagementRepository.findAllByUserIdIn(userIds.map { it.toLong() })
            ?.associateBy { it.userId.toString() }
            ?: emptyMap()

        // 결제 정보와 사용자 정보 결합
        val paymentWithUserResponses = paymentsPage.content.map { payment ->
            val user = usersMap[payment.userId]
            PaymentWithUserResponse(
                id = payment.id,
                paymentId = payment.paymentId,
                userId = payment.userId,
                accountId = user?.accountId,
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
                bannerImageUrl = payment.bannerImageUrl,
                isEnded = payment.isEnded,
                createdAt = payment.createdAt?.format(dateFormatter),
                updatedAt = payment.updatedAt?.format(dateFormatter)
            )
        }

        return PaymentPageResponse(
            content = paymentWithUserResponses,
            page = pageable.pageNumber,
            size = pageable.pageSize,
            totalElements = paymentsPage.totalElements,
            totalPages = paymentsPage.totalPages,
            number = paymentsPage.number,
            first = paymentsPage.isFirst,
            last = paymentsPage.isLast,
            numberOfElements = paymentsPage.numberOfElements,
            empty = paymentsPage.isEmpty
        )
    }

    /**
     * ID로 결제 정보를 조회하고, 사용자 정보(account_id)를 포함하여 반환합니다.
     */
    @Transactional(readOnly = true)
    fun getPaymentByIdWithUserInfo(id: Long): PaymentWithUserResponse? {
        val payment = paymentRepository.findById(id).orElse(null) ?: return null
        val user = userManagementRepository.findByUserId(payment.userId.toLong())

        return PaymentWithUserResponse(
            id = payment.id,
            paymentId = payment.paymentId,
            userId = payment.userId,
            accountId = user?.accountId,
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
            bannerImageUrl = payment.bannerImageUrl,
            isEnded = payment.isEnded,
            createdAt = payment.createdAt?.format(dateFormatter),
            updatedAt = payment.updatedAt?.format(dateFormatter)
        )
    }

    /**
     * 결제 ID로 결제 정보를 조회하고, 사용자 정보(account_id)를 포함하여 반환합니다.
     */
    @Transactional(readOnly = true)
    fun getPaymentByPaymentIdWithUserInfo(paymentId: String): PaymentWithUserResponse? {
        val payment = paymentRepository.findByPaymentId(paymentId) ?: return null
        val user = userManagementRepository.findByUserId(payment.userId.toLong())

        return PaymentWithUserResponse(
            id = payment.id,
            paymentId = payment.paymentId,
            userId = payment.userId,
            accountId = user?.accountId,
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
            bannerImageUrl = payment.bannerImageUrl,
            isEnded = payment.isEnded,
            createdAt = payment.createdAt?.format(dateFormatter),
            updatedAt = payment.updatedAt?.format(dateFormatter)
        )
    }

    /**
     * 사용자 계정 ID로 결제 정보를 조회합니다.
     */
    @Transactional(readOnly = true)
    fun getPaymentsByAccountId(accountId: String): List<PaymentWithUserResponse> {
        val payments = paymentRepository.findByUserAccountId(accountId)
        val userIds = payments.map { it.userId.toLong() }.distinct()
        val usersMap = userManagementRepository.findAllByUserIdIn(userIds)
            ?.associateBy { it.userId.toString() }
            ?: emptyMap()

        return payments.map { payment ->
            val user = usersMap[payment.userId]
            PaymentWithUserResponse(
                id = payment.id,
                paymentId = payment.paymentId,
                userId = payment.userId,
                accountId = user?.accountId,
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
                bannerImageUrl = payment.bannerImageUrl,
                isEnded = payment.isEnded,
                createdAt = payment.createdAt?.format(dateFormatter),
                updatedAt = payment.updatedAt?.format(dateFormatter)
            )
        }
    }

    /**
     * 상태별로 결제 정보를 조회하고, 페이징 처리하여 반환합니다.
     */
    @Transactional(readOnly = true)
    fun getPaymentsByStatusWithUserInfo(status: String, pageable: Pageable): PaymentPageResponse {
        val paymentsPage = paymentRepository.findByStatus(status, pageable)

        // 사용자 정보 조회에 필요한 user_id 목록 추출
        val userIds = paymentsPage.content.map { it.userId }

        // 사용자 정보 조회
        val usersMap = userManagementRepository.findAllByUserIdIn(userIds.map { it.toLong() })
            ?.associateBy { it.userId.toString() }
            ?: emptyMap()

        // 결제 정보와 사용자 정보 결합
        val paymentWithUserResponses = paymentsPage.content.map { payment ->
            val user = usersMap[payment.userId]
            PaymentWithUserResponse(
                id = payment.id,
                paymentId = payment.paymentId,
                userId = payment.userId,
                accountId = user?.accountId,
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
                bannerImageUrl = payment.bannerImageUrl,
                isEnded = payment.isEnded,
                createdAt = payment.createdAt?.format(dateFormatter),
                updatedAt = payment.updatedAt?.format(dateFormatter)
            )
        }

        return PaymentPageResponse(
            content = paymentWithUserResponses,
            page = pageable.pageNumber,
            size = pageable.pageSize,
            totalElements = paymentsPage.totalElements,
            totalPages = paymentsPage.totalPages,
            number = paymentsPage.number,
            first = paymentsPage.isFirst,
            last = paymentsPage.isLast,
            numberOfElements = paymentsPage.numberOfElements,
            empty = paymentsPage.isEmpty
        )
    }

    /**
     * 채용공고 ID로 유효한 결제 정보를 조회합니다.
     * 이 메서드는 채용공고가 노출될 수 있는지 확인하는 데 사용됩니다.
     */
    @Transactional(readOnly = true)
    fun getActivePaymentByJobId(jobId: Long): Payment? {
        val today = LocalDate.now().format(dateOnlyFormatter)
        val payments = paymentRepository.findActivePaymentByJobId(jobId, today)
        return payments.firstOrNull()
    }

    /**
     * 상품 타입(VVIP, VIP, SPECIAL)별로 활성화된 결제 정보를 페이징하여 조회합니다.
     */
    @Transactional(readOnly = true)
    fun getActivePaymentsByProductType(productType: String, pageable: Pageable): Page<Payment> {
        val today = LocalDate.now().format(dateOnlyFormatter)
        return paymentRepository.findActivePaymentsByProductType(productType, today, pageable)
    }

    /**
     * 포지션 제안 상품 결제 정보를 조회합니다.
     */
    @Transactional(readOnly = true)
    fun getActivePositionOfferPayments(userId: String): List<Payment> {
        val today = LocalDate.now().format(dateOnlyFormatter)

        return paymentRepository.findAll()
            .filter { it.userId == userId }
            .filter { it.productName.contains("포지션 제안") } // 포지션 제안 상품만 필터링
            .filter { !it.isEnded } // 종료되지 않은 상품만
            .filter { it.status == "paid" } // 결제 완료된 상품만
            .filter { it.endDate >= today } // 종료일이 오늘 이후인 상품만
            .sortedBy { it.endDate } // 종료일 순으로 정렬 (먼저 종료되는 상품 먼저 사용)
    }

    /**
     * 배너 상품 결제 정보를 조회합니다.
     */
    @Transactional(readOnly = true)
    fun getActiveBannerPayments(userId: String): List<Payment> {
        val today = LocalDate.now().format(dateOnlyFormatter)

        return paymentRepository.findAll()
            .filter { it.userId == userId }
            .filter { it.productName.contains("배너 광고") } // 배너 광고 상품만 필터링
            .filter { !it.isEnded } // 종료되지 않은 상품만
            .filter { it.status == "paid" } // 결제 완료된 상품만
            .filter { it.endDate >= today } // 종료일이 오늘 이후인 상품만
    }

    /**
     * 결제 노출 카운트를 증가시킵니다.
     * 클릭 시 호출되는 메서드입니다.
     */
    @Transactional
    fun incrementExposureCount(paymentId: Long): Boolean {
        val payment = paymentRepository.findById(paymentId).orElse(null) ?: return false

        // 이미 종료된 결제인 경우
        if (payment.isEnded) return false

        // 노출 횟수가 최대치에 도달한 경우
        if (payment.maxExposureCount > 0 && payment.exposureCount >= payment.maxExposureCount) {
            payment.isEnded = true
            paymentRepository.save(payment)
            return false
        }

        // 노출 횟수 증가
        paymentRepository.incrementExposureCount(paymentId, LocalDateTime.now())

        // 증가 후 최대치에 도달했는지 확인
        val updatedPayment = paymentRepository.findById(paymentId).orElse(null) ?: return false
        if (updatedPayment.maxExposureCount > 0 && updatedPayment.exposureCount >= updatedPayment.maxExposureCount) {
            updatedPayment.isEnded = true
            paymentRepository.save(updatedPayment)
        }

        return true
    }

    /**
     * 결제 상태를 확인하고 기간이 만료된 결제를 종료 처리합니다.
     * 이 메서드는 스케줄러에 의해 주기적으로 호출될 수 있습니다.
     */
    @Transactional
    fun checkAndUpdateExpiredPayments() {
        val today = LocalDate.now().format(dateOnlyFormatter)
        val allPayments = paymentRepository.findAll()

        allPayments.forEach { payment ->
            // 이미 종료된 결제가 아니고, 상태가 paid이며, 기간 기반 상품인 경우
            if (!payment.isEnded && payment.status == "paid" && payment.maxExposureCount == 0) {
                // 종료일이 오늘보다 이전인 경우
                if (payment.endDate < today) {
                    payment.isEnded = true
                    paymentRepository.save(payment)
                }
            }
        }
    }

    /**
     * 결제 승인 및 관련 서비스 활성화
     * 배너 광고나 포지션 제안 상품의 경우 관련 서비스를 활성화합니다.
     */
    @Transactional
    fun approvePayment(id: Long): PaymentResponse? {
        val payment = paymentRepository.findById(id).orElse(null) ?: return null

        // 결제 상태를 paid로 변경
        payment.status = "paid"
        payment.updatedAt = LocalDateTime.now()

        val updatedPayment = paymentRepository.save(payment)

        // 배너 상품인 경우 배너 활성화
        if (payment.productName.contains("배너 광고")) {
            bannerService.activateBannerByPaymentId(payment.paymentId)
        }

        return updatedPayment.toResponse()
    }

    /**
     * 기존 메소드들 - 이전 코드에서 유지
     */
    fun getAllPayments(): List<PaymentResponse> {
        return paymentRepository.findAll().map { it.toResponse() }
    }

    fun getPaymentById(id: Long): PaymentResponse? {
        return paymentRepository.findById(id).orElse(null)?.toResponse()
    }

    fun getPaymentByPaymentId(paymentId: String): PaymentResponse? {
        return paymentRepository.findByPaymentId(paymentId)?.toResponse()
    }

    fun getPaymentsByUserId(userId: String): List<PaymentResponse> {
        return paymentRepository
            .findByUserIdOrderByCreatedAtDesc(userId)
            .map { it.toResponse() }
    }

    fun getPaymentsByStatus(status: String): List<PaymentResponse> {
        return paymentRepository.findByStatus(status).map { it.toResponse() }
    }

    @Transactional
    fun createPayment(request: PaymentRequest): PaymentResponse {
        val user = userManagementRepository.findByUserId(request.userId.toLong())
            ?: throw Exception("유효하지 않은 사용자입니다.")

        val payment = Payment(
            paymentId        = request.paymentId,
            userId           = user.userId.toString(),
            productName      = request.productName,
            jobPostingsName  = request.jobPostingsName,
            jobPostingsId    = request.jobPostingsId,
            startDate        = request.startDate,
            endDate          = request.endDate,
            amount           = request.amount,
            paymentMethod    = request.paymentMethod,
            status           = request.status,
            phoneNumber      = request.phoneNumber,
            exposureCount    = 0,
            maxExposureCount = request.maxExposureCount,
            isEnded          = false,
            bannerImageUrl   = request.bannerImageUrl   // ← 여기를 추가합니다
        )
        return paymentRepository.save(payment).toResponse()
    }

    @Transactional
    fun updatePayment(request: PaymentRequest): PaymentResponse {

        val optionalPayment = paymentRepository.findById(request.paymentId.toLong())

        if(optionalPayment.isEmpty) {
            throw Exception("유효하지 않은 결제내역입니다.")
        }
        val getPayment = optionalPayment.get();

        val payment = Payment(
            id = getPayment.id,
            paymentId = getPayment.paymentId,
            userId = getPayment.userId.toString(),
            productName = request.productName,
            jobPostingsName = request.jobPostingsName,
            jobPostingsId = request.jobPostingsId,
            startDate = getPayment.startDate,
            endDate = getPayment.endDate,
            amount = request.amount,
            paymentMethod = request.paymentMethod,
            status = request.status,
            phoneNumber = request.phoneNumber,
            maxExposureCount = request.maxExposureCount
        )
        return paymentRepository.save(payment).toResponse()
    }

    @Transactional
    fun updatePaymentStatus(id: Long, request: PaymentUpdateRequest): PaymentResponse? {
        val existingPayment = paymentRepository.findById(id).orElse(null) ?: return null

        existingPayment.status = request.status

        // isEnded 필드가 제공된 경우 업데이트
        request.isEnded?.let {
            existingPayment.isEnded = it
        }

        // 결제 승인(paid)으로 변경되는 경우, 배너 상품이면 배너 활성화
        if (request.status == "paid" && existingPayment.productName.contains("배너 광고")) {
            bannerService.activateBannerByPaymentId(existingPayment.paymentId)
        }

        return paymentRepository.save(existingPayment).toResponse()
    }

    @Transactional
    fun deletePayment(id: Long) {
        paymentRepository.deleteById(id)
    }

    /**
     * 여러 결제 항목을 일괄 삭제합니다.
     */
    @Transactional
    fun bulkDeletePayments(ids: List<Long>): Int {
        return paymentRepository.bulkDeleteByIds(ids)
    }

    /**
     * 여러 결제 항목의 상태를 일괄 변경합니다.
     */
    @Transactional
    fun bulkUpdateStatus(ids: List<Long>, status: String): Int {
        return paymentRepository.bulkUpdateStatus(ids, status, LocalDateTime.now())
    }

    /**
     * 특정 채용공고에 대한 결제 정보를 조회합니다.
     */
    @Transactional(readOnly = true)
    fun getPaymentsByJobId(jobId: Long): List<PaymentResponse> {
        return paymentRepository.findByJobPostingsId(jobId).map { it.toResponse() }
    }

    /**
     * 특정 채용공고에 대한 유효한 결제 건이 있는지 확인합니다.
     * @return 유효한 결제 건이 있으면 true, 없으면 false
     */
    @Transactional(readOnly = true)
    fun hasActivePaymentForJob(jobId: Long): Boolean {
        val today = LocalDate.now().format(dateOnlyFormatter)
        val payments = paymentRepository.findActivePaymentByJobId(jobId, today)
        return payments.isNotEmpty()
    }

    /**
     * 특정 채용공고에 대한 노출 횟수를 증가시킵니다.
     * 건별 상품인 경우 노출 횟수를 증가시키고, 최대 노출 횟수에 도달했는지 확인합니다.
     * @return 노출 가능한 경우 true, 불가능한 경우 false
     */
    @Transactional
    fun incrementJobExposureCount(jobId: Long): Boolean {
        val today = LocalDate.now().format(dateOnlyFormatter)
        val activePayments = paymentRepository.findActivePaymentByJobId(jobId, today)

        if (activePayments.isEmpty()) return false

        val payment = activePayments.first()

        // 기간별 상품인 경우 노출 횟수를 증가시키지 않음
        if (payment.maxExposureCount == 0) return true

        // 건별 상품인 경우 노출 횟수 증가
        return incrementExposureCount(payment.id)
    }

    // Extension function to convert Entity to Response DTO
    private fun Payment.toResponse(): PaymentResponse {
        return PaymentResponse(
            id = this.id,
            paymentId = this.paymentId,
            userId = this.userId,
            productName = this.productName,
            jobPostingsName = this.jobPostingsName,
            jobPostingsId = this.jobPostingsId,
            startDate = this.startDate,
            endDate = this.endDate,
            amount = this.amount,
            paymentMethod = this.paymentMethod,
            status = this.status,
            phoneNumber = this.phoneNumber,
            exposureCount = this.exposureCount,
            maxExposureCount = this.maxExposureCount,
            isEnded = this.isEnded
        )
    }
}