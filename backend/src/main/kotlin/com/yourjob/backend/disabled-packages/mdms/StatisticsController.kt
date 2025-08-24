package com.yourjob.backend.controller

import com.yourjob.backend.service.StatisticsService
import com.yourjob.backend.dto.StatisticsResponse
import com.yourjob.backend.dto.ChartDataResponse
import org.springframework.web.bind.annotation.*
import org.springframework.http.ResponseEntity
import java.time.LocalDate

/**
 * 통계 정보 조회를 위한 Controller
 */
@RestController
@RequestMapping("/api/v1/mdms/statistics")
class StatisticsController(private val statisticsService: StatisticsService) {

    @GetMapping("/dashboard")
    fun getDashboardStatistics(@RequestParam(required = false, defaultValue = "1month") period: String): ResponseEntity<StatisticsResponse> {
        val statistics = statisticsService.getDashboardStatistics(period)
        return ResponseEntity.ok(statistics)
    }

    @GetMapping("/user-growth")
    fun getUserGrowthData(@RequestParam(required = false, defaultValue = "12") months: Int): ResponseEntity<ChartDataResponse> {
        val chartData = statisticsService.getUserGrowthData(months)
        return ResponseEntity.ok(chartData)
    }
    @GetMapping("/user-type-distribution")
    fun getUserTypeDistribution(@RequestParam(required = false, defaultValue = "all") period: String): ResponseEntity<ChartDataResponse> {
        val chartData = statisticsService.getUserTypeDistribution(period)
        return ResponseEntity.ok(chartData)
    }

    @GetMapping("/job-status-distribution")
    fun getJobStatusDistribution(@RequestParam(required = false, defaultValue = "all") period: String): ResponseEntity<ChartDataResponse> {
        val chartData = statisticsService.getJobStatusDistribution(period)
        return ResponseEntity.ok(chartData)
    }

    @GetMapping("/date-range")
    fun getStatisticsByDateRange(
        @RequestParam startDate: String,
        @RequestParam endDate: String
    ): ResponseEntity<StatisticsResponse> {
        val statistics = statisticsService.getStatisticsByDateRange(
            LocalDate.parse(startDate),
            LocalDate.parse(endDate)
        )
        return ResponseEntity.ok(statistics)
    }
}