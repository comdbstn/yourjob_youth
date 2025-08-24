package com.yourjob.backend.service

import com.yourjob.backend.entity.JobOffer
import com.yourjob.backend.entity.JobOfferCreate
import com.yourjob.backend.entity.JobOfferUpdate
import com.yourjob.backend.entity.payment.Payment
import com.yourjob.backend.mapper.JoboffersMapper
import com.yourjob.backend.repository.payment.PaymentRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class JoboffersService(
    private var joboffersMapper: JoboffersMapper,
    private val paymentRepository: PaymentRepository
) {
    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")

    fun selectJoboffersList(mutableMap: MutableMap<String, Any>): List<JobOffer?>? {
        return joboffersMapper.selectJoboffersList(mutableMap)
    }

    fun selectJobofferProposalList(mutableMap: MutableMap<String, Any>): ArrayList<Any> {
        return joboffersMapper.selectJobofferProposalList(mutableMap)
    }

    fun selectJobofferProposalCnt(mutableMap: MutableMap<String, Any>): Int {
        return joboffersMapper.selectJobofferProposalCnt(mutableMap)
    }

    fun selectJobofferProposalInfo(mutableMap: MutableMap<String, Any>): MutableMap<String, Any> {
        return joboffersMapper.selectJobofferProposalInfo(mutableMap)
    }

    fun selectJobofferProposalInfoByResumeId(mutableMap: MutableMap<String, Any>): MutableMap<String, Any> {
        return joboffersMapper.selectJobofferProposalInfoByResumeId(mutableMap)
    }

    fun selectJoboffersInfo(id: Int): JobOffer {
        return joboffersMapper.selectJoboffersInfo(id)
    }


    @Transactional
    fun insertJoboffer(jobOffer: JobOffer): Int {
        // 포지션 제안 가능 여부 확인
        val offerAvailability = checkPositionOfferAvailability(jobOffer.employerId.toString())

        if (offerAvailability["canOffer"] == false) {
            // 제안 불가능한 경우
            throw IllegalStateException(offerAvailability["reason"].toString())
        }

        // 기존 중복 제안 확인
        val offerDone = selectJobofferDone(jobOffer)
        if (offerDone.isNotEmpty()) {
            throw IllegalStateException("이미 제안한 인재입니다.")
        }

        // 포지션 제안 생성
        val insertCnt = joboffersMapper.insertJoboffer(jobOffer)

        // 제안 성공시 건수 차감
        if (insertCnt > 0) {
            decrementPositionOfferCount(jobOffer.employerId.toString())
        }

        return insertCnt
    }

    fun selectJobofferDone(jobOffer: JobOffer): MutableMap<String, Any> {
        return joboffersMapper.selectJobofferDone(jobOffer) ?: mutableMapOf()
    }

    fun updateJoboffer(jobOfferUpdate: JobOfferUpdate): Int {
        return joboffersMapper.updateJoboffer(jobOfferUpdate)
    }

    fun deleteJoboffer(id: Int): Int {
        return joboffersMapper.deleteJoboffer(id)
    }

    fun updateJobofferStatus(mutableMap: MutableMap<String, Any>): Int {
        return joboffersMapper.updateJobofferStatus(mutableMap)
    }

    fun updateJobofferInterviewStatus(mutableMap: MutableMap<String, Any>): Int {
        return joboffersMapper.updateJobofferInterviewStatus(mutableMap)
    }


    /**
     * 사용자의 유효한 포지션 제안 상품 조회
     */
    fun getActivePositionOfferPayments(userId: String): List<Payment> {
        val today = LocalDate.now().format(dateFormatter)

        return paymentRepository.findAll()
            .filter { it.userId == userId }
            .filter { it.productName.contains("포지션 제안") } // 포지션 제안 상품만 필터링
            .filter { !it.isEnded } // 종료되지 않은 상품만
            .filter { it.status == "paid" } // 결제 완료된 상품만
            .filter { it.endDate >= today } // 종료일이 오늘 이후인 상품만
            .sortedBy { it.endDate } // 종료일 순으로 정렬 (먼저 종료되는 상품 먼저 사용)
    }

    /**
     * 사용자의 포지션 제안 가능 여부 확인
     */
    fun checkPositionOfferAvailability(userId: String): Map<String, Any> {
        val activePayments = getActivePositionOfferPayments(userId)

        if (activePayments.isEmpty()) {
            return mapOf(
                "canOffer" to false,
                "reason" to "포지션 제안 상품을 구매하신 후 이용 가능합니다."
            )
        }

        // 건별 상품을 우선 확인 (기간별 상품은 무제한이므로 건별 상품을 먼저 소진)
        val byCountPayments = activePayments.filter { it.maxExposureCount > 0 && it.exposureCount < it.maxExposureCount }
        val byPeriodPayments = activePayments.filter { it.maxExposureCount == 0 }

        if (byCountPayments.isEmpty() && byPeriodPayments.isEmpty()) {
            return mapOf(
                "canOffer" to false,
                "reason" to "남은 포지션 제안 상품이 없습니다. 추가 구매 후 이용해주세요."
            )
        }

        // 사용할 상품 정보
        val paymentToUse = if (byCountPayments.isNotEmpty()) byCountPayments.first() else byPeriodPayments.first()

        return mapOf(
            "canOffer" to true,
            "paymentId" to paymentToUse.id,
            "productName" to paymentToUse.productName,
            "remainingCount" to if (paymentToUse.maxExposureCount > 0) (paymentToUse.maxExposureCount - paymentToUse.exposureCount) else "무제한",
            "endDate" to paymentToUse.endDate
        )
    }

    /**
     * 포지션 제안 건수 차감
     */
    @Transactional
    fun decrementPositionOfferCount(userId: String): Boolean {
        val activePayments = getActivePositionOfferPayments(userId)

        if (activePayments.isEmpty()) {
            return false
        }

        // 건별 상품을 우선 사용 (기간별 상품은 무제한이므로 건별 상품을 먼저 소진)
        val byCountPayments = activePayments.filter { it.maxExposureCount > 0 && it.exposureCount < it.maxExposureCount }

        if (byCountPayments.isNotEmpty()) {
            // 건별 상품이 있으면 카운트 차감
            val payment = byCountPayments.first()
            payment.exposureCount += 1

            // 최대 건수에 도달하면 종료 처리
            if (payment.exposureCount >= payment.maxExposureCount) {
                payment.isEnded = true
            }

            payment.updatedAt = LocalDateTime.now()
            paymentRepository.save(payment)
            return true
        }

        // 기간별 상품만 있는 경우 (카운트 차감 없음)
        return activePayments.isNotEmpty()
    }

    /**
     * 사용자의 포지션 제안 상품 상태 조회
     */
    fun getPositionOfferStatus(userId: String): Map<String, Any> {
        val activePayments = getActivePositionOfferPayments(userId)

        if (activePayments.isEmpty()) {
            return mapOf(
                "hasActive" to false,
                "message" to "포지션 제안 상품을 구매하신 후 이용 가능합니다."
            )
        }

        // 건별 상품과 기간별 상품 분리
        val byCountPayments = activePayments.filter { it.maxExposureCount > 0 }
        val byPeriodPayments = activePayments.filter { it.maxExposureCount == 0 }

        // 남은 건수 계산
        val totalRemainingCount = byCountPayments.sumOf { it.maxExposureCount - it.exposureCount }

        // 가장 늦게 종료되는 기간을 찾고, null일 가능성 제거
        val lastEndDatePayment = byPeriodPayments.maxByOrNull { it.endDate }
        val unlimitedEndDate = lastEndDatePayment?.endDate ?: ""

        // 모든 null 가능성을 제거하여 Map<String, Any>로 변환
        return mapOf(
            "hasActive" to true,
            "countBasedProducts" to byCountPayments.size,
            "periodBasedProducts" to byPeriodPayments.size,
            "remainingCount" to totalRemainingCount,
            "hasUnlimited" to (byPeriodPayments.isNotEmpty()),
            "unlimitedEndDate" to unlimitedEndDate,
            "activeProducts" to activePayments.map { payment ->
                mapOf(
                    "id" to payment.id,
                    "productName" to payment.productName,
                    "startDate" to payment.startDate,
                    "endDate" to payment.endDate,
                    "maxCount" to payment.maxExposureCount,
                    "usedCount" to payment.exposureCount,
                    "remainingCount" to (if (payment.maxExposureCount > 0)
                        (payment.maxExposureCount - payment.exposureCount).toString()
                    else "무제한")
                )
            }
        )
    }
}