package com.yourjob.backend.service.banner

import com.yourjob.backend.entity.banner.Banner
import com.yourjob.backend.entity.banner.BannerRequest
import com.yourjob.backend.entity.banner.BannerResponse
import com.yourjob.backend.entity.banner.BannerUpdateRequest
import com.yourjob.backend.entity.payment.Payment
import com.yourjob.backend.repository.banner.BannerRepository
import com.yourjob.backend.repository.payment.PaymentRepository
import jakarta.transaction.Transactional
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class BannerService(
    private val bannerRepository: BannerRepository,
    private val paymentRepository: PaymentRepository
) {

    fun getAllBanners(): List<BannerResponse> {
        return bannerRepository.findAll().map { it.toResponse() }
    }

    fun getBannerById(id: Long): BannerResponse? {
        return bannerRepository.findById(id).orElse(null)?.toResponse()
    }

    fun getBannerByBannerId(bannerId: String): BannerResponse? {
        return bannerRepository.findByBannerId(bannerId)?.toResponse()
    }

    fun getBannersByGroupName(groupName: String): List<BannerResponse> {
        return bannerRepository.findByGroupName(groupName).map { it.toResponse() }
    }

    fun getActiveBanners(currentDate: String): List<BannerResponse> {
        return bannerRepository
            .findByStartDateLessThanEqualAndEndDateGreaterThanEqual(currentDate, currentDate)
            .filter { it.status == "active" } // 활성 상태인 배너만 필터링
            .map { it.toResponse() }
    }

    @Transactional
    fun createBanner(request: BannerRequest, imageUrl: String): BannerResponse {
        val banner = Banner(
            bannerId = request.bannerId,
            startDate = request.startDate,
            endDate = request.endDate,
            imageUrl = imageUrl,
            groupName = request.groupName,
            status = request.status,
            title = request.title,
            linkTarget = request.linkTarget,
            linkTargetType = request.linkTargetType
        )
        return bannerRepository.save(banner).toResponse()
    }

    @Transactional
    fun updateBanner(id: Long, request: BannerUpdateRequest): BannerResponse? {
        val existingBanner = bannerRepository.findById(id).orElse(null) ?: return null

        request.startDate?.let { existingBanner.startDate = it }
        request.status?.let { existingBanner.status = it }
        request.endDate?.let { existingBanner.endDate = it }
        request.imageUrl?.let { existingBanner.imageUrl = it }
        request.groupName?.let { existingBanner.groupName = it }
        request.title?.let { existingBanner.title = it }
        request.linkTarget?.let { existingBanner.linkTarget = it }
        request.linkTargetType?.let { existingBanner.linkTargetType = it }
        existingBanner.updatedAt = LocalDateTime.now()

        return bannerRepository.save(existingBanner).toResponse()
    }

    /**
     * 결제 완료 시 배너 상태를 활성화합니다.
     */
    @Transactional
    fun activateBannerByPaymentId(paymentId: String): BannerResponse? {
        // 결제 ID에 해당하는 배너 ID 찾기
        val bannerId = "BANNER-$paymentId"
        val banner = bannerRepository.findByBannerId(bannerId) ?: return null

        // 상태 업데이트
        banner.status = "active"
        banner.updatedAt = LocalDateTime.now()

        return bannerRepository.save(banner).toResponse()
    }

    /**
     * 결제 ID로 배너 조회
     */
    fun getBannerByPaymentId(paymentId: String): BannerResponse? {
        val bannerId = "BANNER-$paymentId"
        return bannerRepository.findByBannerId(bannerId)?.toResponse()
    }

    @Transactional
    fun deleteBanner(id: Long) {
        bannerRepository.deleteById(id)
    }

    @Transactional
    fun bulkDeleteBanners(ids: List<Long>): Int {
        val bannersToDelete = bannerRepository.findAllById(ids)
        val count = bannersToDelete.size
        bannerRepository.deleteAll(bannersToDelete)
        return count
    }

    /**
     * 결제 ID로 배너 상태 업데이트
     */
    @Transactional
    fun updateBannerStatusByPaymentId(paymentId: String, status: String): BannerResponse? {
        val bannerId = "BANNER-$paymentId"
        val banner = bannerRepository.findByBannerId(bannerId) ?: return null

        banner.status = status
        banner.updatedAt = LocalDateTime.now()

        return bannerRepository.save(banner).toResponse()
    }

    // 필터링된 배너 조회 메서드
    fun getFilteredBanners(
        groupName: String?,
        status: String?,
        keyword: String?,
        pageRequest: PageRequest
    ): Page<BannerResponse> {
        // 레포지토리 호출 - status는 전달하지만 실제 쿼리에서는 사용하지 않음
        val bannersPage = bannerRepository.findWithFilters(groupName, status, keyword, pageRequest)

        // 엔티티를 응답 객체로 변환
        return bannersPage.map { it.toResponse() }
    }

    // 페이징된 모든 배너 조회 메서드
    fun getAllBannersPaged(pageRequest: PageRequest): Page<BannerResponse> {
        val bannersPage = bannerRepository.findAll(pageRequest)
        return bannersPage.map { it.toResponse() }
    }

    // Extension function to convert Entity to Response DTO
    private fun Banner.toResponse(): BannerResponse {
        return BannerResponse(
            id = this.id,
            bannerId = this.bannerId,
            createdAt = this.createdAt,
            updatedAt = this.updatedAt,
            startDate = this.startDate,
            endDate = this.endDate,
            imageUrl = this.imageUrl,
            groupName = this.groupName,
            status = this.status,
            title = this.title,
            linkTarget = this.linkTarget,
            linkTargetType = this.linkTargetType
        )
    }
}