package com.yourjob.backend.entity.payment

import jakarta.persistence.*
import lombok.Getter
import lombok.Setter
import java.time.LocalDateTime

@Entity
@Getter
@Setter
@Table(name = "payments")
data class Payment(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "payment_id", nullable = false, length = 100)
    val paymentId: String,

    @Column(name = "user_id", nullable = false, length = 100)
    val userId: String,

    @Column(name = "product_name", nullable = false, length = 255)
    val productName: String,

    @Column(name = "job_postings_name", nullable = true, length = 255)
    val jobPostingsName: String?,

    @Column(name = "job_postings_id", nullable = true)
    val jobPostingsId: Long?,

    @Column(name = "start_date", nullable = false, length = 50)
    val startDate: String,

    @Column(name = "end_date", nullable = false, length = 50)
    val endDate: String,

    @Column(name = "amount", nullable = false, length = 50)
    val amount: String,

    @Column(name = "payment_method", nullable = false, length = 50)
    val paymentMethod: String,

    @Column(name = "status", nullable = false, length = 50)
    var status: String,

    @Column(name = "phone_number", nullable = true, length = 50)
    val phoneNumber: String?,

    @Column(name = "exposure_count", nullable = false)
    var exposureCount: Int = 0,

    @Column(name = "max_exposure_count", nullable = false)
    val maxExposureCount: Int = 0,

    @Column(name = "is_ended", nullable = false)
    var isEnded: Boolean = false,

    @Column(name = "banner_image_url", nullable = true, length = 500)
    val bannerImageUrl: String? = null,

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)