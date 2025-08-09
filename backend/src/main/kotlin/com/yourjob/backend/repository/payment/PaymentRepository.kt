package com.yourjob.backend.repository.payment

import com.yourjob.backend.entity.payment.Payment
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface PaymentRepository : JpaRepository<Payment, Long> {
    fun findByPaymentId(paymentId: String): Payment?
    fun findByUserId(userId: String): List<Payment>
    fun findByUserIdOrderByCreatedAtDesc(userId: String): List<Payment>
    fun findByStatus(status: String): List<Payment>

    // 상태별 페이징 쿼리
    fun findByStatus(status: String, pageable: Pageable): Page<Payment>

    // Job ID로 결제 정보 조회
    fun findByJobPostingsId(jobPostingsId: Long): List<Payment>

    // 활성화된 유효한 결제 정보 조회 (종료되지 않은)
    @Query("""
        SELECT p FROM Payment p
        WHERE p.jobPostingsId = :jobPostingsId
        AND p.status = 'paid'
        AND p.isEnded = false
        AND ((p.maxExposureCount > 0 AND p.exposureCount < p.maxExposureCount) 
             OR (p.maxExposureCount = 0 AND p.endDate >= :currentDate))
    """)
    fun findActivePaymentByJobId(@Param("jobPostingsId") jobPostingsId: Long,
                                 @Param("currentDate") currentDate: String): List<Payment>

    // 상품 타입별 활성화된 결제 정보 조회
    @Query("""
        SELECT p FROM Payment p
        WHERE p.productName LIKE :productType%
        AND p.status = 'paid'
        AND p.isEnded = false
        AND ((p.maxExposureCount > 0 AND p.exposureCount < p.maxExposureCount) 
             OR (p.maxExposureCount = 0 AND p.endDate >= :currentDate))
    """)
    fun findActivePaymentsByProductType(@Param("productType") productType: String,
                                        @Param("currentDate") currentDate: String,
                                        pageable: Pageable): Page<Payment>

    // users 테이블의 account_id로 조회하는 네이티브 쿼리
    @Query(
        value = """
            SELECT p.* FROM payments p 
            JOIN users u ON p.user_id = u.user_id 
            WHERE u.account_id = :accountId
        """,
        nativeQuery = true
    )
    fun findByUserAccountId(@Param("accountId") accountId: String): List<Payment>

    // 필터링 및 검색을 위한 네이티브 쿼리
    @Query(
        value = """
            SELECT p.* FROM payments p 
            JOIN users u ON p.user_id = u.user_id
            WHERE (:status IS NULL OR p.status = :status)
            AND (:productName IS NULL OR p.product_name LIKE CONCAT('%', :productName, '%'))
            AND (:paymentMethod IS NULL OR p.payment_method = :paymentMethod)
            AND (:depositStatus IS NULL OR p.status = :depositStatus)
            AND (:startDate IS NULL OR p.start_date >= :startDate)
            AND (:endDate IS NULL OR p.end_date <= :endDate)
            AND (:keyword IS NULL OR 
                p.product_name LIKE CONCAT('%', :keyword, '%') OR
                p.job_postings_name LIKE CONCAT('%', :keyword, '%') OR
                u.account_id LIKE CONCAT('%', :keyword, '%') OR
                p.payment_id LIKE CONCAT('%', :keyword, '%')
            )
            ORDER BY p.created_at DESC
        """,
        countQuery = """
            SELECT COUNT(*) FROM payments p 
            JOIN users u ON p.user_id = u.user_id
            WHERE (:status IS NULL OR p.status = :status)
            AND (:productName IS NULL OR p.product_name LIKE CONCAT('%', :productName, '%'))
            AND (:paymentMethod IS NULL OR p.payment_method = :paymentMethod)
            AND (:depositStatus IS NULL OR p.status = :depositStatus)
            AND (:startDate IS NULL OR p.start_date >= :startDate)
            AND (:endDate IS NULL OR p.end_date <= :endDate)
            AND (:keyword IS NULL OR 
                p.product_name LIKE CONCAT('%', :keyword, '%') OR
                p.job_postings_name LIKE CONCAT('%', :keyword, '%') OR
                u.account_id LIKE CONCAT('%', :keyword, '%') OR
                p.payment_id LIKE CONCAT('%', :keyword, '%')
            )
        """,
        nativeQuery = true
    )
    fun findAllWithFiltersNative(
        @Param("status") status: String?,
        @Param("productName") productName: String?,
        @Param("paymentMethod") paymentMethod: String?,
        @Param("depositStatus") depositStatus: String?,
        @Param("startDate") startDate: String?,
        @Param("endDate") endDate: String?,
        @Param("keyword") keyword: String?,
        pageable: Pageable
    ): Page<Payment>

    // JPQL을 사용한 필터링 쿼리
    @Query("""
        SELECT p FROM Payment p 
        WHERE (:status IS NULL OR p.status = :status)
        AND (:productName IS NULL OR p.productName LIKE :productName%)
        AND (:paymentMethod IS NULL OR p.paymentMethod = :paymentMethod)
        AND (:depositStatus IS NULL OR p.status = :depositStatus)
        AND (:startDate IS NULL OR p.startDate >= :startDate)
        AND (:endDate IS NULL OR p.endDate <= :endDate)
        AND (:keyword IS NULL OR 
             p.productName LIKE %:keyword% OR
             p.jobPostingsName LIKE %:keyword%)
        ORDER BY p.createdAt DESC
    """)
    fun findAllWithFilters(
        @Param("status") status: String?,
        @Param("productName") productName: String?,
        @Param("paymentMethod") paymentMethod: String?,
        @Param("depositStatus") depositStatus: String?,
        @Param("startDate") startDate: String?,
        @Param("endDate") endDate: String?,
        @Param("keyword") keyword: String?,
        pageable: Pageable
    ): Page<Payment>

    // 결제 상태 업데이트
    @Modifying
    @Query("UPDATE Payment p SET p.status = :status, p.updatedAt = :now WHERE p.id = :id")
    fun updatePaymentStatus(
        @Param("id") id: Long,
        @Param("status") status: String,
        @Param("now") now: LocalDateTime
    ): Int

    // 노출 카운트 증가
    @Modifying
    @Query("UPDATE Payment p SET p.exposureCount = p.exposureCount + 1, p.updatedAt = :now WHERE p.id = :id")
    fun incrementExposureCount(
        @Param("id") id: Long,
        @Param("now") now: LocalDateTime
    ): Int

    // 종료 상태 업데이트
    @Modifying
    @Query("UPDATE Payment p SET p.isEnded = :isEnded, p.updatedAt = :now WHERE p.id = :id")
    fun updateEndedStatus(
        @Param("id") id: Long,
        @Param("isEnded") isEnded: Boolean,
        @Param("now") now: LocalDateTime
    ): Int

    // 벌크 삭제
    @Modifying
    @Query("DELETE FROM Payment p WHERE p.id IN :ids")
    fun bulkDeleteByIds(@Param("ids") ids: List<Long>): Int

    // 벌크 상태 업데이트
    @Modifying
    @Query("UPDATE Payment p SET p.status = :status, p.updatedAt = :now WHERE p.id IN :ids")
    fun bulkUpdateStatus(
        @Param("ids") ids: List<Long>,
        @Param("status") status: String,
        @Param("now") now: LocalDateTime
    ): Int
}