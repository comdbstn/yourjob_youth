package com.yourjob.backend.controller

import org.springframework.core.io.ClassPathResource
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import java.io.IOException

data class ZighangJob(
    val title: String = "",
    val company: String = "",
    val location: String = "",
    val category: String = "",
    val description: String = "",
    val apply_url: String = "",
    val job_url: String = "",
    val image_url: String = "",
    val salary: String? = null,
    val experience: String? = null,
    val skills: String? = null,
    val employment_type: String? = null,
    val education: String? = null,
    val deadline: String? = null,
    val posting_date: String? = null,
    val company_address: String? = null,
    val benefits: String? = null,
    val requirements: String? = null,
    val has_real_apply_link: Boolean = false,
    val has_image: Boolean = false,
    val has_real_uuid_url: Boolean = false,
    val id: Int = 0
)

data class ZighangJobResponse(
    val success: Boolean = true,
    val data: List<ZighangJob> = emptyList(),
    val pagination: PaginationInfo? = null,
    val message: String = ""
)

data class PaginationInfo(
    val current_page: Int,
    val total_pages: Int,
    val total_items: Int,
    val items_per_page: Int
)

data class ZighangStatsResponse(
    val success: Boolean = true,
    val data: ZighangStats? = null,
    val message: String = ""
)

data class ZighangStats(
    val total_jobs: Int = 0,
    val categories: Map<String, Int> = emptyMap(),
    val locations: Map<String, Int> = emptyMap(),
    val companies: Int = 0,
    val employment_types: Map<String, Int> = emptyMap(),
    val with_real_apply_links: Int = 0
)

@RestController
@RequestMapping("/api/zighang")
@CrossOrigin(origins = ["*"])
class ZighangJobController {
    
    private val objectMapper = jacksonObjectMapper()
    private var cachedJobs: List<ZighangJob>? = null
    
    private fun loadZighangJobs(): List<ZighangJob> {
        if (cachedJobs != null) {
            return cachedJobs!!
        }
        
        return try {
            val resource = ClassPathResource("zighang_jobs_for_yourjob.json")
            val jobs: List<ZighangJob> = objectMapper.readValue(resource.inputStream)
            cachedJobs = jobs
            jobs
        } catch (e: IOException) {
            println("직행 채용공고 데이터 로드 실패: ${e.message}")
            emptyList()
        }
    }
    
    @GetMapping("/jobs")
    fun getZighangJobs(
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "20") limit: Int,
        @RequestParam(required = false) search: String?,
        @RequestParam(required = false) category: String?,
        @RequestParam(required = false) location: String?,
        @RequestParam(required = false) company: String?
    ): ResponseEntity<ZighangJobResponse> {
        
        return try {
            val allJobs = loadZighangJobs()
            var filteredJobs = allJobs
            
            // 검색 필터링
            if (!search.isNullOrBlank()) {
                filteredJobs = filteredJobs.filter { job ->
                    job.title.contains(search, ignoreCase = true) ||
                    job.company.contains(search, ignoreCase = true) ||
                    job.description.contains(search, ignoreCase = true)
                }
            }
            
            // 카테고리 필터링
            if (!category.isNullOrBlank() && category != "all") {
                filteredJobs = filteredJobs.filter { job ->
                    job.category.contains(category, ignoreCase = true)
                }
            }
            
            // 지역 필터링
            if (!location.isNullOrBlank() && location != "all") {
                filteredJobs = filteredJobs.filter { job ->
                    job.location.contains(location, ignoreCase = true)
                }
            }
            
            // 회사 필터링
            if (!company.isNullOrBlank()) {
                filteredJobs = filteredJobs.filter { job ->
                    job.company.contains(company, ignoreCase = true)
                }
            }
            
            // 페이지네이션
            val totalItems = filteredJobs.size
            val totalPages = Math.ceil(totalItems.toDouble() / limit).toInt()
            val startIndex = (page - 1) * limit
            val endIndex = Math.min(startIndex + limit, totalItems)
            
            val paginatedJobs = if (startIndex < totalItems) {
                filteredJobs.subList(startIndex, endIndex)
            } else {
                emptyList()
            }
            
            val pagination = PaginationInfo(
                current_page = page,
                total_pages = totalPages,
                total_items = totalItems,
                items_per_page = limit
            )
            
            val response = ZighangJobResponse(
                success = true,
                data = paginatedJobs,
                pagination = pagination
            )
            
            ResponseEntity.ok(response)
            
        } catch (e: Exception) {
            println("직행 채용공고 조회 오류: ${e.message}")
            val response = ZighangJobResponse(
                success = false,
                message = "채용공고 조회 중 오류가 발생했습니다."
            )
            ResponseEntity.status(500).body(response)
        }
    }
    
    @GetMapping("/jobs/{id}")
    fun getZighangJobById(@PathVariable id: Int): ResponseEntity<Map<String, Any>> {
        return try {
            val allJobs = loadZighangJobs()
            val job = allJobs.find { it.id == id }
            
            if (job != null) {
                ResponseEntity.ok(mapOf(
                    "success" to true,
                    "data" to job
                ))
            } else {
                ResponseEntity.status(404).body(mapOf(
                    "success" to false,
                    "message" to "채용공고를 찾을 수 없습니다."
                ))
            }
        } catch (e: Exception) {
            println("직행 채용공고 상세 조회 오류: ${e.message}")
            ResponseEntity.status(500).body(mapOf(
                "success" to false,
                "message" to "채용공고 상세 조회 중 오류가 발생했습니다."
            ))
        }
    }
    
    @GetMapping("/stats")
    fun getZighangStats(): ResponseEntity<ZighangStatsResponse> {
        return try {
            val allJobs = loadZighangJobs()
            
            val categories = allJobs
                .filter { it.category.isNotBlank() }
                .groupingBy { it.category }
                .eachCount()
            
            val locations = allJobs
                .filter { it.location.isNotBlank() }
                .groupingBy { it.location }
                .eachCount()
            
            val employmentTypes = allJobs
                .filter { !it.employment_type.isNullOrBlank() && it.employment_type != "nan" }
                .groupingBy { it.employment_type!! }
                .eachCount()
            
            val withRealApplyLinks = allJobs.count { it.has_real_apply_link }
            val uniqueCompanies = allJobs.map { it.company }.distinct().size
            
            val stats = ZighangStats(
                total_jobs = allJobs.size,
                categories = categories,
                locations = locations,
                companies = uniqueCompanies,
                employment_types = employmentTypes,
                with_real_apply_links = withRealApplyLinks
            )
            
            val response = ZighangStatsResponse(
                success = true,
                data = stats
            )
            
            ResponseEntity.ok(response)
            
        } catch (e: Exception) {
            println("직행 통계 조회 오류: ${e.message}")
            val response = ZighangStatsResponse(
                success = false,
                message = "통계 조회 중 오류가 발생했습니다."
            )
            ResponseEntity.status(500).body(response)
        }
    }
    
    @GetMapping("/health")
    fun healthCheck(): ResponseEntity<Map<String, Any>> {
        return try {
            val jobCount = loadZighangJobs().size
            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to "직행 채용공고 API가 정상 작동 중입니다.",
                "timestamp" to System.currentTimeMillis(),
                "jobs_loaded" to jobCount
            ) as Map<String, Any>)
        } catch (e: Exception) {
            ResponseEntity.status(500).body(mapOf(
                "success" to false,
                "message" to "서비스가 정상적으로 작동하지 않습니다.",
                "error" to (e.message ?: "알 수 없는 오류")
            ) as Map<String, Any>)
        }
    }
}