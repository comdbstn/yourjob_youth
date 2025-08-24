package com.yourjob.backend.controller

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.springframework.core.io.ClassPathResource
import java.io.IOException

// 간소화된 채용공고 데이터 모델
data class SimpleJob(
    val id: Int,
    val title: String,
    val company: String,
    val location: String,
    val category: String,
    val description: String,
    val salary: String? = null,
    val experience: String? = null,
    val employment_type: String? = null,
    val deadline: String? = null,
    val image_url: String? = null,
    val apply_url: String? = null,
    val skills: List<String> = emptyList(),
    val benefits: List<String> = emptyList()
)

data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val message: String? = null,
    val total: Int? = null
)

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = ["*"])
class SimpleJobController {
    
    private val objectMapper = jacksonObjectMapper()
    
    // 종합 채용공고 데이터
    private fun getHardcodedJobs(): List<SimpleJob> {
        return listOf(
            SimpleJob(
                id = 1,
                title = "디지턴 마케팅 매니저 채용",
                company = "마케팅플러스",
                location = "서울 강남구",
                category = "마케팅·홍보",
                description = "디지털 마케팅 전략 수립 및 실행을 담당할 매니저를 모집합니다. 성과 기반의 마케팅 캐페인 기획 및 운영 경험이 있는 분을 우대합니다.",
                salary = "연봉 3500~5000만원",
                experience = "2~5년차",
                employment_type = "정규직",
                deadline = "2025-09-15",
                image_url = "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=300&h=300&fit=crop",
                apply_url = "/jobs/1",
                skills = listOf("디지털마케팅", "GA", "SNS마케팅", "컨텐츠기획"),
                benefits = listOf("성과급", "유연근무", "교육비지원", "4대보험")
            ),
            SimpleJob(
                id = 2,
                title = "프론트엔드 개발자 (React, TypeScript)",
                company = "테크스타트업",
                location = "서울 강남구",
                category = "IT·개발",
                description = "React와 TypeScript를 활용한 웹 서비스 개발을 담당할 프론트엔드 개발자를 채용합니다. 최신 웹 기술 트렌드에 관심이 많은 분을 찾습니다.",
                salary = "연봉 3500~5000만원",
                experience = "2~4년차",
                employment_type = "정규직",
                deadline = "2025-09-20",
                image_url = "https://images.unsplash.com/photo-1560472355-536de3962603?w=300&h=300&fit=crop",
                apply_url = "/jobs/2",
                skills = listOf("React", "TypeScript", "JavaScript", "HTML/CSS"),
                benefits = listOf("재택근무", "유연근무", "장비지원", "4대보험")
            ),
            SimpleJob(
                id = 3,
                title = "국내 영업 경력자 채용 (경력 5년 이상)",
                company = "스마트터치",
                location = "경기",
                category = "영업",
                description = "스마트터치에서 국내 영업을 담당할 경력직 사원을 채용합니다. IT 영업 경험이 있으신 분을 우대합니다.",
                salary = "연봉 4000만원 이상",
                experience = "5~10년차",
                employment_type = "정규직",
                deadline = "2025-08-29",
                image_url = "https://d2juy7qzamcf56.cloudfront.net/company/default.svg",
                apply_url = "/jobs/3",
                skills = listOf("영업경험", "고객관리", "IT지식"),
                benefits = listOf("4대보험", "퇴직금", "연차", "야근수당", "성과급")
            ),
            SimpleJob(
                id = 4,
                title = "프론트엔드 개발자 (React, TypeScript)",
                company = "테크스타트업",
                location = "서울",
                category = "IT·개발",
                description = "React와 TypeScript를 활용한 웹 서비스 개발을 담당할 프론트엔드 개발자를 채용합니다.",
                salary = "연봉 3500~5000만원",
                experience = "2~5년차",
                employment_type = "정규직",
                deadline = "2025-09-15",
                image_url = "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=300&h=300&fit=crop",
                apply_url = "/jobs/4",
                skills = listOf("React", "TypeScript", "JavaScript", "HTML/CSS"),
                benefits = listOf("재택근무", "유연근무", "교육비지원", "간식제공", "건강검진")
            ),
            SimpleJob(
                id = 5,
                title = "백엔드 개발자 (Kotlin, Spring Boot)",
                company = "핀테크솔루션",
                location = "부산",
                category = "IT·개발",
                description = "Kotlin과 Spring Boot를 활용한 서버 개발을 담당할 백엔드 개발자를 채용합니다.",
                salary = "연봉 4000~6000만원",
                experience = "3~7년차",
                employment_type = "정규직",
                deadline = "2025-09-20",
                image_url = "https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&h=300&fit=crop",
                apply_url = "/jobs/5",
                skills = listOf("Kotlin", "Spring Boot", "MySQL", "AWS"),
                benefits = listOf("스톡옵션", "자율출퇴근", "맥북지급", "점심제공")
            ),
            SimpleJob(
                id = 6,
                title = "UX/UI 디자이너",
                company = "모바일에이전시",
                location = "서울",
                category = "디자인",
                description = "모바일 앱과 웹 서비스의 UX/UI 디자인을 담당할 디자이너를 채용합니다.",
                salary = "연봉 3000~4500만원",
                experience = "1~4년차",
                employment_type = "정규직",
                deadline = "2025-09-10",
                image_url = "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=300&h=300&fit=crop",
                apply_url = "/jobs/6",
                skills = listOf("Figma", "Sketch", "Photoshop", "Illustrator"),
                benefits = listOf("개인장비지원", "디자인교육", "크리에이티브환경", "워크샵참여")
            ),
            SimpleJob(
                id = 7,
                title = "마케팅 매니저 (디지털 마케팅)",
                company = "이커머스플랫폼",
                location = "경기",
                category = "마케팅",
                description = "온라인 쇼핑몰의 디지털 마케팅을 총괄할 매니저를 채용합니다.",
                salary = "연봉 3800~5500만원",
                experience = "3~6년차",
                employment_type = "정규직",
                deadline = "2025-09-25",
                image_url = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=300&fit=crop",
                apply_url = "/jobs/7",
                skills = listOf("Google Ads", "Facebook Ads", "데이터분석", "SEO"),
                benefits = listOf("마케팅예산 권한", "성과인센티브", "해외연수기회")
            ),
            SimpleJob(
                id = 8,
                title = "HR 담당자 (신입/경력)",
                company = "글로벌컨설팅",
                location = "서울",
                category = "인사·총무",
                description = "글로벌 컨설팅 회사에서 채용 및 인사관리를 담당할 HR 담당자를 채용합니다.",
                salary = "연봉 2800~4200만원",
                experience = "신입~3년차",
                employment_type = "정규직",
                deadline = "2025-09-05",
                image_url = "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=300&h=300&fit=crop",
                apply_url = "/jobs/8",
                skills = listOf("채용업무", "노무관리", "교육기획", "엑셀활용"),
                benefits = listOf("해외파견기회", "영어교육", "컨설팅교육", "복리후생완비")
            )
        )
    }
    
    // 외부 데이터 로드 시도 (실패시 기본 데이터 사용)
    private fun loadJobData(): List<SimpleJob> {
        return try {
            val resource = ClassPathResource("external_jobs.json")
            val externalJobs: List<Map<String, Any>> = objectMapper.readValue(
                resource.inputStream, 
                objectMapper.typeFactory.constructCollectionType(List::class.java, Map::class.java)
            )
            
            // 외부 데이터를 SimpleJob으로 변환
            externalJobs.take(50).mapIndexed { index, job ->
                SimpleJob(
                    id = index + 1,
                    title = job["title"]?.toString() ?: "",
                    company = job["company"]?.toString() ?: "",
                    location = job["location"]?.toString() ?: "",
                    category = job["category"]?.toString() ?: "",
                    description = job["description"]?.toString() ?: "",
                    salary = job["salary"]?.toString(),
                    experience = job["experience"]?.toString(),
                    employment_type = job["employment_type"]?.toString(),
                    deadline = job["deadline"]?.toString(),
                    image_url = job["image_url"]?.toString(),
                    apply_url = job["apply_url"]?.toString(),
                    skills = listOf("협업능력", "성실함", "책임감"),
                    benefits = job["benefits"]?.toString()?.split(", ") ?: listOf("4대보험", "퇴직금")
                )
            }
        } catch (e: Exception) {
            println("외부 데이터 로드 실패, 기본 데이터 사용: ${e.message}")
            getHardcodedJobs()
        }
    }
    
    @GetMapping("/jobs")
    fun getJobs(
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "12") limit: Int,
        @RequestParam(required = false) search: String?,
        @RequestParam(required = false) category: String?,
        @RequestParam(required = false) location: String?
    ): ResponseEntity<ApiResponse<List<SimpleJob>>> {
        
        var jobs = loadJobData()
        
        // 검색 필터
        if (!search.isNullOrBlank()) {
            jobs = jobs.filter { job ->
                job.title.contains(search, ignoreCase = true) ||
                job.company.contains(search, ignoreCase = true) ||
                job.description.contains(search, ignoreCase = true)
            }
        }
        
        // 카테고리 필터
        if (!category.isNullOrBlank() && category != "all") {
            jobs = jobs.filter { job ->
                job.category.contains(category, ignoreCase = true)
            }
        }
        
        // 지역 필터
        if (!location.isNullOrBlank() && location != "all") {
            jobs = jobs.filter { job ->
                job.location.contains(location, ignoreCase = true)
            }
        }
        
        // 페이지네이션
        val totalItems = jobs.size
        val startIndex = (page - 1) * limit
        val endIndex = minOf(startIndex + limit, totalItems)
        
        val paginatedJobs = if (startIndex < totalItems) {
            jobs.subList(startIndex, endIndex)
        } else {
            emptyList()
        }
        
        return ResponseEntity.ok(ApiResponse(
            success = true,
            data = paginatedJobs,
            total = totalItems
        ))
    }
    
    @GetMapping("/jobs/{id}")
    fun getJobById(@PathVariable id: Int): ResponseEntity<ApiResponse<SimpleJob>> {
        val jobs = loadJobData()
        val job = jobs.find { it.id == id }
        
        return if (job != null) {
            ResponseEntity.ok(ApiResponse(
                success = true,
                data = job
            ))
        } else {
            ResponseEntity.status(404).body(ApiResponse(
                success = false,
                message = "채용공고를 찾을 수 없습니다."
            ))
        }
    }
    
    @GetMapping("/categories")
    fun getCategories(): ResponseEntity<ApiResponse<List<String>>> {
        val jobs = loadJobData()
        val categories = jobs.map { it.category }.distinct().sorted()
        
        return ResponseEntity.ok(ApiResponse(
            success = true,
            data = categories
        ))
    }
    
    @GetMapping("/locations")
    fun getLocations(): ResponseEntity<ApiResponse<List<String>>> {
        val jobs = loadJobData()
        val locations = jobs.map { it.location }.distinct().sorted()
        
        return ResponseEntity.ok(ApiResponse(
            success = true,
            data = locations
        ))
    }
    
    @GetMapping("/stats")
    fun getStats(): ResponseEntity<ApiResponse<Map<String, Any>>> {
        val jobs = loadJobData()
        
        val stats = mapOf(
            "total_jobs" to jobs.size,
            "categories" to jobs.groupingBy { it.category }.eachCount(),
            "locations" to jobs.groupingBy { it.location }.eachCount(),
            "employment_types" to jobs.mapNotNull { it.employment_type }.groupingBy { it }.eachCount()
        )
        
        return ResponseEntity.ok(ApiResponse(
            success = true,
            data = stats
        ))
    }
    
    @GetMapping("/health")
    fun healthCheck(): ResponseEntity<ApiResponse<Map<String, Any>>> {
        val jobCount = loadJobData().size
        
        return ResponseEntity.ok(ApiResponse(
            success = true,
            data = mapOf(
                "message" to "YourJob 채용 플랫폼 API가 정상 작동 중입니다.",
                "timestamp" to System.currentTimeMillis(),
                "jobs_loaded" to jobCount
            )
        ))
    }
}