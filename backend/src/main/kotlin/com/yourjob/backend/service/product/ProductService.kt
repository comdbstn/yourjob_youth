package com.yourjob.backend.service.product

import com.yourjob.backend.entity.banner.BannerResponse
import com.yourjob.backend.entity.product.Product
import com.yourjob.backend.entity.product.ProductRequest
import com.yourjob.backend.entity.product.ProductResponse
import com.yourjob.backend.entity.product.ProductUpdateRequest
import com.yourjob.backend.repository.product.ProductRepository
import com.yourjob.backend.service.banner.BannerService
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import org.springframework.web.bind.annotation.RequestParam
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class ProductService(
    private val productRepository: ProductRepository,
    private val bannerService: BannerService
) {

    private val dateFormatter = DateTimeFormatter.ofPattern("yyyyMMdd")

    fun getAllProducts(status: String?, type: String?, pageable: Pageable): Page<ProductResponse> {
        return productRepository.findAllWithFilters(status, type, pageable).map { it.toResponse() }
    }

    fun getProductById(id: Long): ProductResponse? {
        return productRepository.findById(id).orElse(null)?.toResponse()
    }

    fun getProductByProductId(productId: String): ProductResponse? {
        return productRepository.findByProductIdOrderByProductId(productId)?.toResponse()
    }

    fun getProductsByStatus(status: String): List<ProductResponse> {
        return productRepository.findByStatusOrderByCreatedAt(status).map { it.toResponse() }
    }

    fun getProductsByType(type: String): List<ProductResponse> {
        return productRepository.findByTypeOrderByCreatedAt(type).map { it.toResponse() }
    }

    fun getProductsByExplosureType(explosureType: String): List<ProductResponse> {
        return productRepository.findByExplosureTypeOrderByPeriodDaysAsc(explosureType).map { it.toResponse() }
    }

    fun getActiveProductsByTypeAndExplosureType(type: String, explosureType: String): List<ProductResponse> {
        return productRepository.findByTypeAndExplosureTypeAndStatusOrderByPeriodDaysAsc(
            type, explosureType, "active"
        ).map { it.toResponse() }
    }

    /**
     * 배너 상품 목록 조회
     */
    fun getActiveBannerProducts(): List<ProductResponse> {
        val bannerTypes = listOf("horizontal", "rectangle", "vip", "vvip", "special")
        return productRepository
            .findByTypeAndProductTypeInAndStatusOrderByCreatedAtDesc(
                type = "company",
                productType = bannerTypes,
                status = "active"
            )
            .map { it.toResponse() }
    }

    /**
     * 포지션 제안 상품 목록 조회
     */
    fun getActivePositionOfferProducts(): List<ProductResponse> {
        return productRepository
            .findByTypeAndProductTypeAndStatusOrderByCreatedAtDesc(
                type = "company",
                productType = "position_offer",
                status = "active"
            )
            .map { it.toResponse() }
    }

    /**
     * 결제 ID로 배너 활성화
     * 관리자가 결제를 승인할 때 사용됩니다.
     */
    @Transactional
    fun activateBannerByPaymentId(paymentId: String): BannerResponse? {
        return bannerService.activateBannerByPaymentId(paymentId)
    }

    /**
     * 새 배너 상품 생성
     */
    @Transactional
    fun createBannerProduct(
        bannerType: String, // "rectangle", "horizontal"
        periodDays: Int,
        price: BigDecimal,
        description: String? = null
    ): ProductResponse {
        val today = LocalDateTime.now().format(dateFormatter)
        val sequence = String.format("%03d", (Math.random() * 999).toInt() + 1)
        val productId = "BANNER-${bannerType.toUpperCase()}-$today-$sequence"

        val name = when (bannerType) {
            "rectangle" -> "사각형 배너 광고 ${periodDays}일"
            "horizontal" -> "가로 배너 광고 ${periodDays}일"
            else -> "배너 광고 ${periodDays}일"
        }

        val request = ProductRequest(
            productId = productId,
            status = "active",
            type = "company",
            productType = bannerType,
            name = name,
            explosureType = "기간별",
            periodDays = periodDays,
            exposureCount = 0,
            price = price
        )

        return createProduct(request)
    }

    /**
     * 새 포지션 제안 상품 생성
     */
    @Transactional
    fun createPositionOfferProduct(
        exposureType: String, // "기간별" 또는 "건별"
        periodOrCount: Int,
        price: BigDecimal,
        description: String? = null
    ): ProductResponse {
        val today = LocalDateTime.now().format(dateFormatter)
        val sequence = String.format("%03d", (Math.random() * 999).toInt() + 1)
        val productId = "POSITION-OFFER-$today-$sequence"

        val name = if (exposureType == "기간별") {
            "포지션 제안 ${periodOrCount}일"
        } else {
            "포지션 제안 ${periodOrCount}건"
        }

        val request = ProductRequest(
            productId = productId,
            status = "active",
            type = "company",
            productType = "position_offer",
            name = name,
            explosureType = exposureType,
            periodDays = if (exposureType == "기간별") periodOrCount else 90, // 기간별이면 입력값, 건별이면 90일 유효기간
            exposureCount = if (exposureType == "건별") periodOrCount else 0, // 건별이면 입력값, 기간별이면 0
            price = price
        )

        return createProduct(request)
    }

    @Transactional
    fun createProduct(request: ProductRequest): ProductResponse {
        val product = Product(
            productId = request.productId,
            status = request.status,
            type = request.type,
            productType = request.productType,
            name = request.name,
            explosureType = request.explosureType,
            periodDays = request.periodDays,
            exposureCount = request.exposureCount,
            price = request.price
        )
        return productRepository.save(product).toResponse()
    }

    @Transactional
    fun updateProduct(id: Long, request: ProductUpdateRequest): ProductResponse? {
        val existingProduct = productRepository.findById(id).orElse(null) ?: return null

        request.status?.let { existingProduct.status = it }
        request.type?.let { existingProduct.type = it }
        request.name?.let { existingProduct.name = it }
        request.explosureType?.let { existingProduct.explosureType = it }
        request.periodDays?.let { existingProduct.periodDays = it }
        request.exposureCount?.let { existingProduct.exposureCount = it }
        request.price?.let { existingProduct.price = it }
        existingProduct.updatedAt = LocalDateTime.now()

        return productRepository.save(existingProduct).toResponse()
    }

    @Transactional
    fun deleteProduct(id: Long) {
        productRepository.deleteById(id)
    }

    // Extension function to convert Entity to Response DTO
    private fun Product.toResponse(): ProductResponse {
        return ProductResponse(
            id = this.id,
            productId = this.productId,
            status = this.status,
            createdAt = this.createdAt,
            updatedAt = this.updatedAt,
            type = this.type,
            productType = this.productType,
            name = this.name,
            explosureType = this.explosureType,
            periodDays = this.periodDays,
            exposureCount = this.exposureCount,
            price = this.price
        )
    }
}