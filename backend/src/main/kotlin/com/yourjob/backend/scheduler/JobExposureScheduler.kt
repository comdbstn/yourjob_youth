package com.yourjob.backend.scheduler

import com.yourjob.backend.service.payment.PaymentService
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.slf4j.LoggerFactory

/**
 * 결제 정보의 만료 상태를 주기적으로 확인하는 스케줄러
 */
@Component
class JobExposureScheduler(private val paymentService: PaymentService) {

    private val logger = LoggerFactory.getLogger(JobExposureScheduler::class.java)

    /**
     * 매일 자정에 실행되는 스케줄러
     * 기간이 만료된 결제 정보를 확인하고 공고 노출 상품을 종료 처리합니다.
     */
    @Scheduled(cron = "0 0 0 * * ?") // 매일 자정에 실행
    fun checkExpiredPayments() {
        logger.info("Starting daily payment expiration check...")

        try {
            paymentService.checkAndUpdateExpiredPayments()
            logger.info("Payment expiration check completed successfully")
        } catch (e: Exception) {
            logger.error("Error during payment expiration check: ${e.message}", e)
        }
    }
}