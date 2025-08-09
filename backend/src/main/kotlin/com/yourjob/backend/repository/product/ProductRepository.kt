package com.yourjob.backend.repository.product

import com.yourjob.backend.entity.payment.Payment
import com.yourjob.backend.entity.product.Product
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface ProductRepository : JpaRepository<Product, Long> {

    @Query("""
        SELECT p FROM Product p 
        WHERE (:status IS NULL OR p.status = :status)
        AND (:type IS NULL OR p.type = :type)
        ORDER BY p.createdAt DESC
    """)
    fun findAllWithFilters(
        @Param("status") status: String?,
        @Param("type") type: String?,
        pageable: Pageable
    ): Page<Product>

    fun findByProductIdOrderByProductId(productId: String): Product?
    fun findByStatusOrderByCreatedAt(status: String): List<Product>
    fun findByTypeOrderByCreatedAt(type: String): List<Product>

    // 노출 타입에 따른 정렬된 조회
    fun findByExplosureTypeOrderByPeriodDaysAsc(explosureType: String): List<Product>
    fun findByExplosureTypeOrderByExposureCountAsc(explosureType: String): List<Product>

    // 배너(배너·VIP·VVIP·SPECIAL·포지션제안) 상품만
    fun findByTypeAndProductTypeInAndStatusOrderByCreatedAtDesc(
        type: String,
        productType: Collection<String>,
        status: String
    ): List<Product>

    // 포지션 제안 전용
    fun findByTypeAndProductTypeAndStatusOrderByCreatedAtDesc(
        type: String,
        productType: String,
        status: String
    ): List<Product>

    // 활성화된 상품 타입별, 노출 방식별 조회
    fun findByTypeAndExplosureTypeAndStatusOrderByPeriodDaysAsc(
        type: String, explosureType: String, status: String
    ): List<Product>

    fun findByTypeAndExplosureTypeAndStatusOrderByExposureCountAsc(
        type: String, explosureType: String, status: String
    ): List<Product>

    // 특정 타입과 상태의 상품 조회 - 배너, 포지션 제안 등
    fun findByTypeAndStatusOrderByCreatedAt(
        type: String, status: String
    ): List<Product>

    // 특정 기간과 일치하는 상품 조회
    fun findByTypeAndExplosureTypeAndPeriodDaysAndStatus(
        type: String, explosureType: String, periodDays: Int, status: String
    ): Product?

    // 특정 노출 횟수와 일치하는 상품 조회
    fun findByTypeAndExplosureTypeAndExposureCountAndStatus(
        type: String, explosureType: String, exposureCount: Int, status: String
    ): Product?

    @Query("""
        SELECT p FROM Product p 
        WHERE 1=1
        ORDER BY p.createdAt DESC
    """)
    override fun findAll(): List<Product>
}