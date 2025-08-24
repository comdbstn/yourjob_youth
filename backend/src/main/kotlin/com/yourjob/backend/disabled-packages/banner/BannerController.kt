package com.yourjob.backend.controller.banner

import com.yourjob.backend.entity.banner.BannerRequest
import com.yourjob.backend.entity.banner.BannerResponse
import com.yourjob.backend.entity.banner.BannerUpdateRequest
import com.yourjob.backend.entity.payment.PaymentRequest
import com.yourjob.backend.entity.payment.PaymentResponse
import com.yourjob.backend.entity.product.ProductResponse
import com.yourjob.backend.service.banner.BannerService
import com.yourjob.backend.service.payment.PaymentCreateService
import com.yourjob.backend.service.payment.PaymentService
import com.yourjob.backend.service.product.ProductService
import com.yourjob.backend.util.FileUtils
import jakarta.servlet.http.HttpSession
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.*

@RestController
@RequestMapping("/api/v1")
class BannerController(
    private val bannerService: BannerService,
    private val fileUtils: FileUtils,
    private val paymentService: PaymentService,
    private val paymentCreateService: PaymentCreateService,
    private val productService: ProductService
) {

    /**
     * 배너 광고 상품 목록 조회
     */
    @GetMapping("/client/banners/products")
    fun getBannerProducts(): ResponseEntity<List<ProductResponse>> {
        val products = productService.getActiveBannerProducts()
        return ResponseEntity.ok(products)
    }

    /**
     * 기업 사용자용 배너 구매 및 등록 API - Multipart 요청 처리
     * 파일 업로드가 포함된 경우 사용
     */
    @PostMapping("/client/banners/purchase", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun purchaseBannerWithFile(
        @RequestPart(value = "file", required = false) file: MultipartFile?,
        @RequestPart("request") request: BannerProductRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        val userId = session.getAttribute("userId")?.toString()
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        // 이미지 URL 처리
        var imageUrl = ""
        if (file != null && !file.isEmpty) {
            // 파일 저장 처리
            val rootPath = "uploads"
            val type = "banners"
            val yearDate = LocalDate.now().toString()

            // FileUtils를 사용하여 파일 저장 및 UUID 얻기
            val uuid = fileUtils.fileSave(rootPath, type, yearDate, file)

            // 이미지 URL 생성
            imageUrl = fileUtils.getFileUrl(rootPath, type, yearDate, uuid, file.originalFilename ?: "unnamed")
        }

        return processBannerPurchase(userId, request, imageUrl)
    }

    /**
     * 기업 사용자용 배너 구매 및 등록 API - JSON 요청 처리
     * 파일 업로드가 없는 경우 사용
     */
    @PostMapping("/client/banners/purchase", consumes = [MediaType.APPLICATION_JSON_VALUE])
    fun purchaseBannerWithoutFile(
        @RequestBody request: BannerProductRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        val userId = session.getAttribute("userId")?.toString()
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        // JSON 요청에서는 이미지 URL은 빈 문자열
        return processBannerPurchase(userId, request, "")
    }

    /**
     * 공통 처리 로직을 분리한 비공개 메서드
     */
    private fun processBannerPurchase(
        userId: String,
        request: BannerProductRequest,
        imageUrl: String
    ): ResponseEntity<Any> {
        try {
            // 상품 정보 조회 (productId가 있으면 상품 정보 조회, 없으면 기본값 사용)
            var productName = ""
            var amount = "0"

            var fixedPeriodDays = request.periodDays
            if (request.productId != null && request.productId > 0) {
                // 상품 정보 가져오기
                val product = productService.getProductById(request.productId)

                if (product != null) {
                    // 상품 정보를 PaymentRequest에 사용
                    productName = product.name
                    amount = product.price.toString()

                    if(product.explosureType == "건별") {
                        fixedPeriodDays = 3650;
                    }
                } else {
                    // 상품을 찾을 수 없는 경우 기본값 설정
                    productName = when (request.bannerType) {
                        "vvip" -> "VVIP 광고 ${request.periodDays}일"
                        "vip" -> "VIP 광고 ${request.periodDays}일"
                        "special" -> "SPECIAL 광고 ${request.periodDays}일"
                        "horizontal" -> "가로 배너 광고 ${request.periodDays}일"
                        "rectangle" -> "사각형 배너 광고 ${request.periodDays}일"
                        else -> "광고상품: ${request.bannerType.uppercase()} ${request.periodDays}일"
                    }
                }
            } else {
                // productId가 없는 경우 상품 유형에 따른 기본 이름 생성
                productName = when (request.bannerType) {
                    "vvip" -> "VVIP 광고 ${request.periodDays}일"
                    "vip" -> "VIP 광고 ${request.periodDays}일"
                    "special" -> "SPECIAL 광고 ${request.periodDays}일"
                    "horizontal" -> "가로 배너 광고 ${request.periodDays}일"
                    "rectangle" -> "사각형 배너 광고 ${request.periodDays}일"
                    else -> "광고상품: ${request.bannerType.uppercase()} ${request.periodDays}일"
                }
            }

            // 상품 타입에 따른 접두사 결정
            val productPrefix = when (request.bannerType) {
                "vvip" -> "VVIP"
                "vip" -> "VIP"
                "special" -> "SPECIAL"
                else -> "BANNER-${request.bannerType.uppercase()}"
            }

            // 날짜 형식 지정
            val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")

            // 시작일 & 종료일 계산
            val startDate = request.startDate
            val startLocalDate = LocalDate.parse(startDate, dateFormatter)

            val endDate = startLocalDate.plusDays(fixedPeriodDays.toLong()).format(dateFormatter)

            // 결제 ID 생성 (예: PAY-BANNER-RECT-20250401-001)
            val dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
            val sequence = String.format("%03d", (Math.random() * 999).toInt() + 1)
            val paymentId = "PAY-$productPrefix-$dateStr-$sequence"

            // 링크 타겟 처리
            val jobPostingsId = if (request.linkTargetType == "job") {
                request.linkTarget?.toLongOrNull()
            } else {
                null
            }

            // PaymentRequest 객체 생성
            val paymentRequest = PaymentRequest(
                paymentId = paymentId,
                userId = userId,
                productName = productName,
                jobPostingsName = request.title,
                jobPostingsId = jobPostingsId,
                startDate = startDate,
                endDate = endDate,
                amount = amount, // 상품에서 가져온 금액 정보
                paymentMethod = request.paymentMethod,
                status = "pending",
                phoneNumber = null,
                maxExposureCount = 0, // 배너는 기간별 상품
                bannerImageUrl = imageUrl
            )

            // 결제 생성
            val paymentResponse = paymentService.createPayment(paymentRequest)

            return if (paymentResponse != null) {
                ResponseEntity.status(HttpStatus.CREATED).body(
                    mapOf(
                        "success" to true,
                        "paymentInfo" to paymentResponse,
                        "message" to "배너 광고 신청이 완료되었습니다. 관리자 승인 후 게시됩니다."
                    )
                )
            } else {
                ResponseEntity.badRequest().body(
                    mapOf(
                        "success" to false,
                        "error" to "배너 광고 신청에 실패했습니다. 관리자에게 문의하세요."
                    )
                )
            }
        } catch (e: Exception) {
            return ResponseEntity.badRequest().body(
                mapOf(
                    "success" to false,
                    "error" to "처리 중 오류가 발생했습니다: ${e.message}"
                )
            )
        }
    }

    // 관리자용 배너 승인 API
    @PatchMapping("/admin/banners/payment/{paymentId}/approve")
    fun approveBannerPayment(@PathVariable paymentId: String): ResponseEntity<Any> {
        // 해당 결제 ID로 배너 활성화
        val banner = bannerService.activateBannerByPaymentId(paymentId)
            ?: return ResponseEntity.notFound().build()

        return ResponseEntity.ok(
            mapOf(
                "bannerInfo" to banner,
                "message" to "배너가 활성화되었습니다."
            )
        )
    }

    // 일반 배너 조회 및 관리 API들
    @GetMapping("/banners")
    fun getAllBanners(
        @RequestParam(required = false) groupName: String?,
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false) keyword: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<Any> {
        // 필터링 파라미터가 있는 경우
        if (groupName != null || status != null || keyword != null) {
            val pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
            val bannersPage = bannerService.getFilteredBanners(
                groupName?.replace(" ", ""), status?.lowercase(Locale.getDefault()), keyword, pageRequest
            )
            return ResponseEntity.ok(bannersPage)
        }
        // 필터링 없이 전체 배너 조회 (페이징 적용)
        else if (page > 0) {
            val pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
            val bannersPage = bannerService.getAllBannersPaged(pageRequest)
            return ResponseEntity.ok(bannersPage)
        }
        // 필터링 없이 전체 배너 조회
        else {
            val banners = bannerService.getAllBanners()
            val sortedBanners = banners.sortedByDescending { it.createdAt }
            return ResponseEntity.ok(sortedBanners)
        }
    }

    @GetMapping("/banners/{id}")
    fun getBannerById(@PathVariable id: Long): ResponseEntity<BannerResponse> {
        val banner = bannerService.getBannerById(id) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(banner)
    }

    @GetMapping("/banners/banner-id/{bannerId}")
    fun getBannerByBannerId(@PathVariable bannerId: String): ResponseEntity<BannerResponse> {
        val banner = bannerService.getBannerByBannerId(bannerId) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(banner)
    }

    @GetMapping("/banners/group/{groupName}")
    fun getBannersByGroupName(@PathVariable groupName: String): ResponseEntity<List<BannerResponse>> {
        return ResponseEntity.ok(bannerService.getBannersByGroupName(groupName))
    }

    @GetMapping("/banners/active")
    fun getActiveBanners(@RequestParam(required = false) currentDate: String?): ResponseEntity<List<BannerResponse>> {
        val date = currentDate ?: LocalDate.now().toString()
        return ResponseEntity.ok(bannerService.getActiveBanners(date))
    }

    // 관리자용 배너 직접 생성 API
    @PostMapping("/admin/banners")
    fun createBanner(
        @RequestPart("file") file: MultipartFile,
        @RequestPart("request") request: BannerRequest
    ): ResponseEntity<BannerResponse> {
        // 파일 저장 처리
        val rootPath = "uploads"
        val type = "banners"
        val yearDate = LocalDate.now().toString()

        // FileUtils를 사용하여 파일 저장 및 UUID 얻기
        val uuid = fileUtils.fileSave(rootPath, type, yearDate, file)

        // 이미지 URL 생성 (S3 또는 로컬 경로)
        val imageUrl = fileUtils.getFileUrl(rootPath, type, yearDate, uuid, file.originalFilename ?: "unnamed")

        // BannerRequest 객체 내의 imageUrl을 업데이트된 값으로 설정
        val updatedRequest = BannerRequest(
            bannerId = request.bannerId,
            startDate = request.startDate,
            endDate = request.endDate,
            imageUrl = imageUrl,
            groupName = request.groupName,
            status = request.status.lowercase(Locale.getDefault()),
            title = request.title,
            linkTarget = request.linkTarget,
            linkTargetType = request.linkTargetType
        )

        return ResponseEntity.status(HttpStatus.CREATED).body(bannerService.createBanner(updatedRequest, imageUrl))
    }

    @PutMapping("/admin/banners/{id}")
    fun updateBanner(
        @PathVariable id: Long,
        @RequestPart("request") request: BannerUpdateRequest,
        @RequestPart(value = "file", required = false) file: MultipartFile?
    ): ResponseEntity<BannerResponse> {
        var updatedRequest = request

        var imageUrl: String? = null

        // 파일이 있을 경우에만 파일 처리 및 imageUrl 업데이트
        if (file != null && !file.isEmpty) {
            val rootPath = "uploads"
            val type = "banners"
            val yearDate = LocalDate.now().toString()

            // FileUtils를 사용하여 파일 저장
            val uuid = fileUtils.fileSave(rootPath, type, yearDate, file)

            // 이미지 URL 생성
            imageUrl = fileUtils.getFileUrl(rootPath, type, yearDate, uuid, file.originalFilename ?: "unnamed")

            // 새로운 BannerUpdateRequest 객체 생성하여 imageUrl 업데이트
            updatedRequest = BannerUpdateRequest(
                startDate = request.startDate,
                endDate = request.endDate,
                imageUrl = imageUrl,
                groupName = request.groupName,
                title = request.title,
                status = request.status,
                linkTarget = request.linkTarget,
                linkTargetType = request.linkTargetType
            )
        }

        val banner = bannerService.updateBanner(id, updatedRequest) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(banner)
    }

    @DeleteMapping("/admin/banners/{id}")
    fun deleteBanner(@PathVariable id: Long): ResponseEntity<Void> {
        bannerService.deleteBanner(id)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/admin/banners/bulk")
    fun bulkDeleteBanners(@RequestBody request: Map<String, List<Long>>): ResponseEntity<Map<String, Any>> {
        val ids = request["ids"] ?: return ResponseEntity.badRequest().body(mapOf("error" to "IDs are required"))
        val count = bannerService.bulkDeleteBanners(ids)
        return ResponseEntity.ok(mapOf("deletedCount" to count))
    }
}

/**
 * 배너 상품 구매 요청 DTO
 */
data class BannerProductRequest(
    val bannerType: String, // "rectangle", "horizontal", "vvip", "vip", "special"
    val periodDays: Int,
    val startDate: String,
    val paymentMethod: String,
    val title: String,
    val groupName: String,
    val linkTarget: String? = null,
    val linkTargetType: String? = null,
    val productId: Long? = null // 상품 ID 추가
)