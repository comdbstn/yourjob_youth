package com.yourjob.backend.entity.successfulResume

import jakarta.persistence.*
import java.time.LocalDateTime


@Entity
@Table(name = "successful_resumes_companies")
data class SuccessfulResumeCompany(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "company_id")
    val companyId: Long = 0,

    @Column(name = "company_name", nullable = false)
    val companyName: String,

    @Column(name = "country_type")
    @Enumerated(EnumType.STRING)
    val countryType: CountryType = CountryType.대한민국,

    @Column(name = "corp_logo_url")
    val corpLogoUrl: String? = null,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: LocalDateTime = LocalDateTime.now()
)

enum class CountryType {
    대한민국, 남아메리카, 미국, 북아메리카, 아시아중동, 아프리카, 오세아니아, 유럽, 일본, 중국홍콩, 기타
}