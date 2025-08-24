package com.yourjob.backend.service.payment

import com.yourjob.backend.entity.payment.Payment
import com.yourjob.backend.entity.payment.PaymentRequest
import com.yourjob.backend.entity.payment.PaymentResponse
import com.yourjob.backend.entity.product.Product
import com.yourjob.backend.entity.product.ProductResponse
import com.yourjob.backend.repository.payment.PaymentRepository
import com.yourjob.backend.repository.product.ProductRepository
import com.yourjob.backend.service.banner.BannerService
import com.yourjob.backend.util.FileUtils
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDate
import java.time.format.DateTimeFormatter

/**
 * 상품과 결제를 연동하는 서비스
 */
@Service
class PaymentCreateService(
    private val paymentRepository: PaymentRepository,
    private val productRepository: ProductRepository,
    private val paymentService: PaymentService,
    private val bannerService: BannerService,
    private val fileUtils: FileUtils
) {

    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")

    /**
     * 상품 ID로 결제 정보를 생성합니다.
     *
     * @param productId 상품 ID
     * @param userId 사용자 ID
     * @param jobPostingsId 채용공고 ID
     * @param jobPostingsName 채용공고 이름
     * @param paymentMethod 결제 방법
     * @param phoneNumber 연락처
     * @return 생성된 결제 정보
     */
    @Transactional
    fun createPaymentFromProduct(
        productId: Long,
        userId: String,
        jobPostingsId: Long,
        jobPostingsName: String,
        paymentMethod: String,
        phoneNumber: String? = null
    ): PaymentResponse? {
        // 상품 조회
        val product = productRepository.findById(productId).orElse(null) ?: return null

        // 시작일, 종료일 계산
        val today = LocalDate.now()
        val startDate = today.format(dateFormatter)

        // 종료일 계산 (기간별인 경우 기간 더하기, 건별인 경우 3개월 기본 설정)
        val endDate = if (product.explosureType == "기간별" && product.periodDays > 0) {
            today.plusDays(product.periodDays.toLong()).format(dateFormatter)
        } else {
            // 건별인 경우 기본적으로 3개월 유효 기간 설정
            today.plusMonths(12).format(dateFormatter)
        }

        // 결제 ID 생성 (예: PAY-VVIP-20250401-001)
        val productPrefix = when {
            product.name.contains("VVIP") -> "VVIP"
            product.name.contains("VIP") -> "VIP"
            product.name.contains("SPECIAL") -> "SPECIAL"
            else -> "REGULAR"
        }
        val dateStr = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"))
        val sequence = String.format("%03d", (Math.random() * 999).toInt() + 1)
        val paymentId = "PAY-$productPrefix-$dateStr-$sequence"

        // 결제 요청 객체 생성
        val paymentRequest = PaymentRequest(
            paymentId = paymentId,
            userId = userId,
            productName = product.name,
            jobPostingsName = jobPostingsName,
            jobPostingsId = jobPostingsId,
            startDate = startDate,
            endDate = endDate,
            amount = product.price.toString(),
            paymentMethod = paymentMethod,
            status = "pending", // 초기 상태는 결제 대기 상태
            phoneNumber = phoneNumber,
            maxExposureCount = if (product.explosureType == "건별") product.exposureCount else 0
        )

        // 결제 생성
        return paymentService.createPayment(paymentRequest)
    }

    /**
     * 상품 속성에 맞는 결제 정보를 생성합니다.
     * 이 메서드는 호환성을 위해 유지하되, 내부적으로 새로운 메서드를 사용합니다.
     */
    @Transactional
    fun createPaymentByProductAttributes(
        productType: String,
        exposureType: String,
        periodOrCount: Int,
        userId: String,
        jobPostingsId: Long? = null,
        jobPostingsName: String? = null,
        paymentMethod: String,
        phoneNumber: String? = null,
        requestStartDate: String? = null,
        imageUrl: String? = null,
        bannerTitle: String? = null,
        bannerGroupName: String? = null,
        linkTarget: String? = null,
        linkTargetType: String? = null
    ): PaymentResponse? {
        // 현재 날짜 기준 또는 요청된 날짜 사용
        val startDate = requestStartDate ?: LocalDate.now().format(dateFormatter)
        val startLocalDate = LocalDate.parse(startDate, dateFormatter)

        var endDate = startLocalDate.plusDays(periodOrCount.toLong()).format(dateFormatter)

        if (exposureType == "건별") {
            endDate = startLocalDate.plusDays(365).format(dateFormatter)
        }

        // 결제 ID 생성
        val prefix = when {
            productType.contains("VVIP") -> "VVIP"
            productType.contains("VIP") -> "VIP"
            productType.contains("SPECIAL") -> "SPECIAL"
            productType.contains("BANNER") -> "BANNER"
            else -> "REGULAR"
        }
        val dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
        val sequence = String.format("%03d", (Math.random() * 999).toInt() + 1)
        val paymentId = "PAY-$prefix-$dateStr-$sequence"

        // 상품 이름 생성
        val productName = if (productType.contains("BANNER")) {
            "배너광고: ${bannerTitle ?: ""} ${periodOrCount}일"
        } else {
            "광고상품: $productType ${periodOrCount}일"
        }

        // PaymentRequest 객체 생성
        val paymentRequest = PaymentRequest(
            paymentId = paymentId,
            userId = userId,
            productName = productName,
            jobPostingsId = if (linkTargetType == "job") linkTarget?.toLongOrNull() else jobPostingsId,
            jobPostingsName = jobPostingsName ?: bannerTitle,
            startDate = startDate,
            endDate = endDate,
            amount = "0", // 금액은 관리자가 설정할 수 있도록 기본값 설정
            paymentMethod = paymentMethod,
            status = "pending",
            phoneNumber = phoneNumber,
            maxExposureCount = if (exposureType == "건별") periodOrCount else 0,
            bannerImageUrl = imageUrl
        )

        // 결제 생성
        return paymentService.createPayment(paymentRequest)
    }

    /**
     * 배너 결제 생성 (기존 메서드 유지)
     */
    @Transactional
    fun createBannerPayment(
        productId: Long,
        userId: String,
        startDate: String,
        periodDays: Int,
        paymentMethod: String,
        phoneNumber: String?,
        bannerFile: MultipartFile?
    ): PaymentResponse? {
        // 1) 상품 조회
        val product = productRepository.findById(productId).orElse(null) ?: return null

        // 이미지 URL 처리
        var bannerImageUrl = ""
        if (bannerFile != null && !bannerFile.isEmpty) {
            // 파일 저장 처리
            val rootPath = "uploads"
            val type = "banners"
            val yearDate = LocalDate.now().toString()

            // FileUtils를 사용하여 파일 저장 및 UUID 얻기
            val uuid = fileUtils.fileSave(rootPath, type, yearDate, bannerFile)

            // 이미지 URL 생성
            bannerImageUrl = fileUtils.getFileUrl(rootPath, type, yearDate, uuid, bannerFile.originalFilename ?: "unnamed")
        }

        // 3) 종료일 계산
        val today = LocalDate.parse(startDate, dateFormatter)
        val endDate = if (product.explosureType == "기간별") {
            today.plusDays(periodDays.toLong()).format(dateFormatter)
        } else {
            today.plusMonths(3).format(dateFormatter)
        }

        // 4) 결제 ID 생성
        val prefix = product.name.takeWhile { !it.isDigit() }.trim().let {
            when {
                it.contains("VVIP")    -> "VVIP"
                it.contains("VIP")     -> "VIP"
                it.contains("SPECIAL") -> "SPECIAL"
                else                   -> "BANNER"
            }
        }
        val dateStr = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"))
        val seq     = "%03d".format((Math.random() * 999).toInt() + 1)
        val paymentId = "PAY-$prefix-$dateStr-$seq"

        // 5) PaymentRequest 조립
        val req = PaymentRequest(
            paymentId        = paymentId,
            userId           = userId,
            productName      = product.name,
            jobPostingsName  = null,
            jobPostingsId    = null,
            startDate        = startDate,
            endDate          = endDate,
            amount           = product.price.toString(),
            paymentMethod    = paymentMethod,
            status           = "pending",
            phoneNumber      = phoneNumber,
            maxExposureCount = if (product.explosureType == "건별") product.exposureCount else 0,
            bannerImageUrl   = bannerImageUrl
        )

        // 6) 저장 (위에서 수정한 createPayment을 통해 bannerImageUrl도 반영됨)
        return paymentService.createPayment(req)
    }

    @Transactional
    fun createPositionOfferPayment(
        productId: Long,
        userId: String,
        paymentMethod: String,
        phoneNumber: String? = null
    ): PaymentResponse? {
        // 상품 조회
        val product = productRepository.findById(productId).orElse(null) ?: return null

        // 포지션 제안 상품인지 확인
        if (product.productType != "position_offer") {
            return null
        }

        // 시작일, 종료일 계산
        val today = LocalDate.now()
        val startDate = today.format(dateFormatter)

        // 종료일 계산 (기간별인 경우 기간 더하기, 건별인 경우 3개월 기본 설정)
        val endDate = if (product.explosureType == "기간별" && product.periodDays > 0) {
            today.plusDays(product.periodDays.toLong()).format(dateFormatter)
        } else {
            // 건별인 경우 기본적으로 3개월 유효 기간 설정
            today.plusMonths(3).format(dateFormatter)
        }

        // 결제 ID 생성 (예: PAY-POSITION-20250401-001)
        val dateStr = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"))
        val sequence = String.format("%03d", (Math.random() * 999).toInt() + 1)
        val paymentId = "PAY-POSITION-$dateStr-$sequence"

        // 결제 요청 객체 생성
        val paymentRequest = PaymentRequest(
            paymentId = paymentId,
            userId = userId,
            productName = product.name,
            jobPostingsName = null,  // 포지션 제안은 공고와 연결되지 않음
            jobPostingsId = null,    // 포지션 제안은 공고와 연결되지 않음
            startDate = startDate,
            endDate = endDate,
            amount = product.price.toString(),
            paymentMethod = paymentMethod,
            status = "pending",      // 초기 상태는 결제 대기 상태
            phoneNumber = phoneNumber,
            maxExposureCount = if (product.explosureType == "건별") product.exposureCount else 0
        )

        // 결제 생성
        return paymentService.createPayment(paymentRequest)
    }
}