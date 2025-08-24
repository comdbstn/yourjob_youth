package com.yourjob.backend.service.admin

import com.yourjob.backend.entity.admin.SystemHealth
import org.springframework.stereotype.Service
import org.springframework.cache.annotation.Cacheable
import org.slf4j.LoggerFactory
import java.lang.management.ManagementFactory
import java.lang.management.OperatingSystemMXBean
import java.time.LocalDateTime
import javax.sql.DataSource
import java.sql.Connection
import java.sql.SQLException

@Service
class SystemMetricsService(
    private val dataSource: DataSource
) {
    
    private val logger = LoggerFactory.getLogger(SystemMetricsService::class.java)
    private val osBean: OperatingSystemMXBean = ManagementFactory.getOperatingSystemMXBean()
    private val memoryBean = ManagementFactory.getMemoryMXBean()
    private val runtimeBean = ManagementFactory.getRuntimeMXBean()
    
    /**
     * 시스템 상태 정보 조회 (5분 캐시)
     */
    @Cacheable(value = ["systemHealth"], key = "'health'")
    fun getSystemHealth(): SystemHealth {
        try {
            return SystemHealth(
                cpuUsage = getCpuUsage(),
                memoryUsage = getMemoryUsage(),
                diskUsage = getDiskUsage(),
                activeConnections = getActiveConnections(),
                averageResponseTime = getAverageResponseTime(),
                errorRate = getErrorRate(),
                uptime = getUptime(),
                lastHealthCheck = LocalDateTime.now()
            )
        } catch (e: Exception) {
            logger.error("Error getting system health", e)
            return getDefaultSystemHealth()
        }
    }
    
    /**
     * CPU 사용률 조회
     */
    private fun getCpuUsage(): Double {
        return try {
            val cpuUsage = (osBean as? com.sun.management.OperatingSystemMXBean)?.processCpuLoad?.times(100) ?: 0.0
            if (cpuUsage < 0) 0.0 else cpuUsage
        } catch (e: Exception) {
            logger.warn("Failed to get CPU usage", e)
            0.0
        }
    }
    
    /**
     * 메모리 사용률 조회
     */
    private fun getMemoryUsage(): Double {
        return try {
            val memoryUsage = memoryBean.heapMemoryUsage
            val used = memoryUsage.used.toDouble()
            val max = memoryUsage.max.toDouble()
            if (max <= 0) 0.0 else (used / max) * 100
        } catch (e: Exception) {
            logger.warn("Failed to get memory usage", e)
            0.0
        }
    }
    
    /**
     * 디스크 사용률 조회
     */
    private fun getDiskUsage(): Double {
        return try {
            val rootPath = java.io.File("/")
            val totalSpace = rootPath.totalSpace.toDouble()
            val freeSpace = rootPath.freeSpace.toDouble()
            if (totalSpace <= 0) 0.0 else ((totalSpace - freeSpace) / totalSpace) * 100
        } catch (e: Exception) {
            logger.warn("Failed to get disk usage", e)
            0.0
        }
    }
    
    /**
     * 활성 데이터베이스 연결 수 조회
     */
    private fun getActiveConnections(): Int {
        return try {
            dataSource.connection.use { connection ->
                val stmt = connection.createStatement()
                val rs = stmt.executeQuery("SHOW STATUS LIKE 'Threads_connected'")
                if (rs.next()) {
                    rs.getInt("Value")
                } else {
                    0
                }
            }
        } catch (e: Exception) {
            logger.warn("Failed to get active connections", e)
            0
        }
    }
    
    /**
     * 평균 응답 시간 조회 (최근 1시간)
     */
    private fun getAverageResponseTime(): Double {
        return try {
            dataSource.connection.use { connection ->
                val stmt = connection.createStatement()
                val rs = stmt.executeQuery("""
                    SELECT COALESCE(AVG(response_time), 0) as avg_response_time
                    FROM api_metrics 
                    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
                """)
                if (rs.next()) {
                    rs.getDouble("avg_response_time")
                } else {
                    0.0
                }
            }
        } catch (e: Exception) {
            logger.warn("Failed to get average response time", e)
            0.0
        }
    }
    
    /**
     * 에러율 조회 (최근 1시간)
     */
    private fun getErrorRate(): Double {
        return try {
            dataSource.connection.use { connection ->
                val stmt = connection.createStatement()
                val rs = stmt.executeQuery("""
                    SELECT 
                        CASE 
                            WHEN total_requests > 0 
                            THEN (error_requests * 100.0 / total_requests) 
                            ELSE 0 
                        END as error_rate
                    FROM (
                        SELECT 
                            COUNT(*) as total_requests,
                            COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_requests
                        FROM api_metrics 
                        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
                    ) t
                """)
                if (rs.next()) {
                    rs.getDouble("error_rate")
                } else {
                    0.0
                }
            }
        } catch (e: Exception) {
            logger.warn("Failed to get error rate", e)
            0.0
        }
    }
    
    /**
     * 시스템 업타임 조회 (초)
     */
    private fun getUptime(): Long {
        return try {
            runtimeBean.uptime / 1000
        } catch (e: Exception) {
            logger.warn("Failed to get uptime", e)
            0L
        }
    }
    
    /**
     * 기본 시스템 상태 반환 (에러 시)
     */
    private fun getDefaultSystemHealth(): SystemHealth {
        return SystemHealth(
            cpuUsage = 0.0,
            memoryUsage = 0.0,
            diskUsage = 0.0,
            activeConnections = 0,
            averageResponseTime = 0.0,
            errorRate = 0.0,
            uptime = 0L,
            lastHealthCheck = LocalDateTime.now()
        )
    }
    
    /**
     * 데이터베이스 연결 테스트
     */
    fun testDatabaseConnection(): Boolean {
        return try {
            dataSource.connection.use { connection ->
                connection.isValid(5)
            }
        } catch (e: Exception) {
            logger.error("Database connection test failed", e)
            false
        }
    }
    
    /**
     * 상세 시스템 메트릭 조회
     */
    fun getDetailedMetrics(): Map<String, Any> {
        val metrics = mutableMapOf<String, Any>()
        
        try {
            // JVM 메모리 정보
            val heapMemory = memoryBean.heapMemoryUsage
            val nonHeapMemory = memoryBean.nonHeapMemoryUsage
            
            metrics["heap_memory"] = mapOf(
                "used" to heapMemory.used,
                "max" to heapMemory.max,
                "committed" to heapMemory.committed,
                "init" to heapMemory.init
            )
            
            metrics["non_heap_memory"] = mapOf(
                "used" to nonHeapMemory.used,
                "max" to nonHeapMemory.max,
                "committed" to nonHeapMemory.committed,
                "init" to nonHeapMemory.init
            )
            
            // GC 정보
            val gcBeans = ManagementFactory.getGarbageCollectorMXBeans()
            metrics["garbage_collection"] = gcBeans.map { gc ->
                mapOf(
                    "name" to gc.name,
                    "collection_count" to gc.collectionCount,
                    "collection_time" to gc.collectionTime
                )
            }
            
            // 스레드 정보
            val threadBean = ManagementFactory.getThreadMXBean()
            metrics["threads"] = mapOf(
                "thread_count" to threadBean.threadCount,
                "daemon_thread_count" to threadBean.daemonThreadCount,
                "peak_thread_count" to threadBean.peakThreadCount,
                "total_started_thread_count" to threadBean.totalStartedThreadCount
            )
            
            // 클래스 로딩 정보
            val classLoadingBean = ManagementFactory.getClassLoadingMXBean()
            metrics["class_loading"] = mapOf(
                "loaded_class_count" to classLoadingBean.loadedClassCount,
                "total_loaded_class_count" to classLoadingBean.totalLoadedClassCount,
                "unloaded_class_count" to classLoadingBean.unloadedClassCount
            )
            
        } catch (e: Exception) {
            logger.error("Error getting detailed metrics", e)
        }
        
        return metrics
    }
    
    /**
     * 시스템 리소스 알림 임계값 확인
     */
    fun checkResourceThresholds(): List<String> {
        val alerts = mutableListOf<String>()
        
        try {
            val health = getSystemHealth()
            
            if (health.cpuUsage > 90) {
                alerts.add("HIGH_CPU: ${health.cpuUsage}%")
            }
            
            if (health.memoryUsage > 85) {
                alerts.add("HIGH_MEMORY: ${health.memoryUsage}%")
            }
            
            if (health.diskUsage > 90) {
                alerts.add("LOW_DISK: ${health.diskUsage}%")
            }
            
            if (health.errorRate > 5) {
                alerts.add("HIGH_ERROR_RATE: ${health.errorRate}%")
            }
            
            if (health.averageResponseTime > 5000) {
                alerts.add("SLOW_RESPONSE: ${health.averageResponseTime}ms")
            }
            
        } catch (e: Exception) {
            logger.error("Error checking resource thresholds", e)
            alerts.add("METRIC_CHECK_FAILED")
        }
        
        return alerts
    }
}