package com.yourjob.backend.entity.product

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "products")
data class Product(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "product_id", nullable = false, length = 100)
    val productId: String,

    @Column(name = "status", nullable = false, length = 50)
    var status: String,

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "type", nullable = false, length = 50)
    var type: String,

    @Column(name = "product_type", nullable = false, length = 50)
    var productType: String,

    @Column(name = "name", nullable = false, length = 255)
    var name: String,

    @Column(name = "explosure_type", nullable = false, length = 100)
    var explosureType: String,

    @Column(name = "period_days", nullable = false)
    var periodDays: Int = 0,

    @Column(name = "exposure_count", nullable = false)
    var exposureCount: Int = 0,

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    var price: BigDecimal = BigDecimal.ZERO
)