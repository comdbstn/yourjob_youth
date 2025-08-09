package com.yourjob.backend.util

import jakarta.annotation.PreDestroy
import org.springframework.stereotype.Component

@Component
class SessionCleanup(private val tracker: SessionTracker) {
    @PreDestroy
    fun cleanup(){
        println("서버 종료 - 모든 세션 무효화 작업 시작")
        tracker.invalicateAllSessions()
        println("모든 세션 무효화 작업 완료")
    }
}