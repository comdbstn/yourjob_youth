package com.yourjob.backend.controller.admin

import com.yourjob.backend.entity.admin.*
import com.yourjob.backend.service.admin.AdminDashboardService
import com.yourjob.backend.service.admin.SystemMetricsService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.slf4j.LoggerFactory
import jakarta.servlet.http.HttpServletRequest

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
class AdminDashboardController(
    private val adminDashboardService: AdminDashboardService,
    private val systemMetricsService: SystemMetricsService
) {
    
    private val logger = LoggerFactory.getLogger(AdminDashboardController::class.java)
    
    /**
     * 관리자 대시보드 전체 데이터 조회
     */
    @GetMapping
    fun getDashboard(): ResponseEntity<AdminDashboard> {
        return try {
            val dashboard = adminDashboardService.getDashboardData()
            ResponseEntity.ok(dashboard)
        } catch (e: Exception) {
            logger.error("Error getting dashboard data", e)
            ResponseEntity.internalServerError().build()
        }
    }
    
    /**
     * 시스템 상태 조회
     */
    @GetMapping("/system-health")
    fun getSystemHealth(): ResponseEntity<SystemHealth> {
        return try {
            val health = systemMetricsService.getSystemHealth()
            ResponseEntity.ok(health)
        } catch (e: Exception) {
            logger.error("Error getting system health", e)
            ResponseEntity.internalServerError().build()
        }
    }
    
    /**
     * 상세 시스템 메트릭 조회
     */
    @GetMapping("/system-metrics")
    fun getDetailedMetrics(): ResponseEntity<Map<String, Any>> {
        return try {
            val metrics = systemMetricsService.getDetailedMetrics()
            ResponseEntity.ok(metrics)
        } catch (e: Exception) {
            logger.error("Error getting detailed metrics", e)
            ResponseEntity.internalServerError().build()
        }
    }
    
    /**
     * 최근 활동 로그 조회
     */
    @GetMapping("/activities")
    fun getRecentActivities(
        @RequestParam(defaultValue = "100") limit: Int
    ): ResponseEntity<List<RecentActivity>> {
        return try {
            val activities = adminDashboardService.getRecentActivities(limit)
            ResponseEntity.ok(activities)
        } catch (e: Exception) {
            logger.error("Error getting recent activities", e)
            ResponseEntity.internalServerError().build()
        }
    }
    
    /**
     * 관리자 알림 조회
     */
    @GetMapping("/alerts")
    fun getAdminAlerts(
        @RequestParam(defaultValue = "false") onlyUnread: Boolean,
        @RequestParam(defaultValue = "50") limit: Int
    ): ResponseEntity<List<AdminAlert>> {
        return try {
            val alerts = adminDashboardService.getAdminAlerts(onlyUnread, limit)
            ResponseEntity.ok(alerts)
        } catch (e: Exception) {
            logger.error("Error getting admin alerts", e)
            ResponseEntity.internalServerError().build()
        }
    }
    
    /**
     * 알림 읽음 처리
     */
    @PutMapping("/alerts/{alertId}/read")
    fun markAlertAsRead(
        @PathVariable alertId: Int,
        HttpServletRequest request
    ): ResponseEntity<Map<String, Any>> {
        return try {
            val adminId = getAdminIdFromRequest(request)
            val success = adminDashboardService.markAlertAsRead(alertId, adminId)
            
            if (success) {
                // 활동 로그 기록
                adminDashboardService.logActivity(
                    ActivityType.ADMIN_ACTION,
                    "알림을 읽음으로 표시했습니다 (ID: $alertId)",
                    adminId
                )
                ResponseEntity.ok(mapOf("success" to true, "message" to "알림이 읽음으로 처리되었습니다."))
            } else {
                ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "알림 처리에 실패했습니다."))
            }
        } catch (e: Exception) {
            logger.error("Error marking alert as read", e)
            ResponseEntity.internalServerError().body(mapOf("success" to false, "message" to "서버 오류가 발생했습니다."))
        }
    }
    
    /**
     * 알림 해결 처리
     */
    @PutMapping("/alerts/{alertId}/resolve")
    fun resolveAlert(
        @PathVariable alertId: Int,
        HttpServletRequest request
    ): ResponseEntity<Map<String, Any>> {
        return try {
            val adminId = getAdminIdFromRequest(request)
            val success = adminDashboardService.resolveAlert(alertId, adminId)
            
            if (success) {
                // 활동 로그 기록
                adminDashboardService.logActivity(
                    ActivityType.ADMIN_ACTION,
                    "알림을 해결로 표시했습니다 (ID: $alertId)",
                    adminId
                )
                ResponseEntity.ok(mapOf("success" to true, "message" to "알림이 해결로 처리되었습니다."))
            } else {
                ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "알림 해결 처리에 실패했습니다."))
            }
        } catch (e: Exception) {
            logger.error("Error resolving alert", e)
            ResponseEntity.internalServerError().body(mapOf("success" to false, "message" to "서버 오류가 발생했습니다."))
        }
    }
    
    /**
     * 새 알림 생성
     */
    @PostMapping("/alerts")
    fun createAlert(
        @RequestBody alertRequest: CreateAlertRequest,
        HttpServletRequest request
    ): ResponseEntity<AdminAlert> {
        return try {
            val alert = adminDashboardService.createAlert(
                alertRequest.type,
                alertRequest.title,
                alertRequest.message,
                alertRequest.severity,
                alertRequest.metadata
            )
            
            // 활동 로그 기록
            val adminId = getAdminIdFromRequest(request)
            adminDashboardService.logActivity(
                ActivityType.ADMIN_ACTION,
                "새 알림을 생성했습니다: ${alertRequest.title}",
                adminId
            )
            
            ResponseEntity.ok(alert)
        } catch (e: Exception) {
            logger.error("Error creating alert", e)
            ResponseEntity.internalServerError().build()
        }
    }
    
    /**
     * 활동 로그 기록
     */
    @PostMapping("/activities")
    fun logActivity(
        @RequestBody activityRequest: LogActivityRequest,
        HttpServletRequest request
    ): ResponseEntity<Map<String, String>> {
        return try {
            val adminId = getAdminIdFromRequest(request)
            adminDashboardService.logActivity(
                activityRequest.type,
                activityRequest.description,
                activityRequest.userId ?: adminId,
                activityRequest.details,
                activityRequest.severity
            )
            
            ResponseEntity.ok(mapOf("message" to "활동 로그가 기록되었습니다."))
        } catch (e: Exception) {
            logger.error("Error logging activity", e)
            ResponseEntity.internalServerError().body(mapOf("error" to "활동 로그 기록에 실패했습니다."))
        }
    }
    
    /**
     * 데이터 내보내기
     */
    @GetMapping("/export/{dataType}")
    fun exportData(
        @PathVariable dataType: String,
        @RequestParam(required = false) startDate: String?,
        @RequestParam(required = false) endDate: String?,
        @RequestParam(defaultValue = "CSV") format: String,
        HttpServletRequest request
    ): ResponseEntity<ByteArray> {
        return try {
            val data = adminDashboardService.exportData(dataType, startDate, endDate, format)
            
            // 활동 로그 기록
            val adminId = getAdminIdFromRequest(request)
            adminDashboardService.logActivity(
                ActivityType.DATA_EXPORT,
                "데이터를 내보냈습니다: $dataType ($format)",
                adminId,
                mapOf(
                    "dataType" to dataType,
                    "format" to format,
                    "startDate" to (startDate ?: ""),
                    "endDate" to (endDate ?: "")
                )
            )
            
            val filename = "${dataType}_export_${System.currentTimeMillis()}.$format"
            val headers = HttpHeaders().apply {
                contentType = when (format.uppercase()) {
                    "CSV" -> MediaType.parseMediaType("text/csv")
                    "EXCEL" -> MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    else -> MediaType.APPLICATION_OCTET_STREAM
                }
                set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"$filename\"")
            }
            
            ResponseEntity.ok()
                .headers(headers)
                .body(data)
                
        } catch (e: IllegalArgumentException) {
            logger.error("Invalid data type for export: $dataType", e)
            ResponseEntity.badRequest().build()
        } catch (e: Exception) {
            logger.error("Error exporting data", e)
            ResponseEntity.internalServerError().build()
        }
    }
    
    /**
     * 시스템 리소스 알림 임계값 확인
     */
    @GetMapping("/resource-alerts")
    fun getResourceAlerts(): ResponseEntity<List<String>> {
        return try {
            val alerts = systemMetricsService.checkResourceThresholds()
            ResponseEntity.ok(alerts)
        } catch (e: Exception) {
            logger.error("Error checking resource alerts", e)
            ResponseEntity.internalServerError().build()
        }
    }
    
    /**
     * 데이터베이스 연결 상태 확인
     */
    @GetMapping("/database-health")
    fun checkDatabaseHealth(): ResponseEntity<Map<String, Any>> {
        return try {
            val isHealthy = systemMetricsService.testDatabaseConnection()
            val status = if (isHealthy) "healthy" else "unhealthy"
            
            ResponseEntity.ok(mapOf(
                "status" to status,
                "timestamp" to System.currentTimeMillis()
            ))
        } catch (e: Exception) {
            logger.error("Error checking database health", e)
            ResponseEntity.ok(mapOf(
                "status" to "error",
                "error" to e.message,
                "timestamp" to System.currentTimeMillis()
            ))
        }
    }
    
    /**
     * 캐시 무효화
     */
    @PostMapping("/cache/invalidate")
    fun invalidateCache(HttpServletRequest request): ResponseEntity<Map<String, String>> {
        return try {
            adminDashboardService.invalidateDashboardCache()
            
            // 활동 로그 기록
            val adminId = getAdminIdFromRequest(request)
            adminDashboardService.logActivity(
                ActivityType.ADMIN_ACTION,
                "대시보드 캐시를 무효화했습니다",
                adminId
            )
            
            ResponseEntity.ok(mapOf("message" to "캐시가 무효화되었습니다."))
        } catch (e: Exception) {
            logger.error("Error invalidating cache", e)
            ResponseEntity.internalServerError().body(mapOf("error" to "캐시 무효화에 실패했습니다."))
        }
    }
    
    /**
     * 요청에서 관리자 ID 추출
     */
    private fun getAdminIdFromRequest(request: HttpServletRequest): Int {
        // JWT 토큰에서 사용자 ID 추출하는 로직
        // 실제 구현에서는 JWT 파싱 로직이 필요함
        return request.getAttribute("userId") as? Int ?: 1
    }
}

/**
 * 알림 생성 요청 DTO
 */
data class CreateAlertRequest(
    val type: AlertType,
    val title: String,
    val message: String,
    val severity: AlertSeverity,
    val metadata: Map<String, Any>? = null
)

/**
 * 활동 로그 기록 요청 DTO
 */
data class LogActivityRequest(
    val type: ActivityType,
    val description: String,
    val userId: Int? = null,
    val details: Map<String, Any>? = null,
    val severity: ActivitySeverity = ActivitySeverity.INFO
)