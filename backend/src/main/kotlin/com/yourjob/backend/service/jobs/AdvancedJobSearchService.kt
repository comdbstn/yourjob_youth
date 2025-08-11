package com.yourjob.backend.service.jobs

import com.yourjob.backend.entity.jobs.*
import com.yourjob.backend.mapper.JobsMapper
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.slf4j.LoggerFactory
import java.math.BigDecimal
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
@Transactional(readOnly = true)
class AdvancedJobSearchService(
    private val jobsMapper: JobsMapper
) {
    
    private val logger = LoggerFactory.getLogger(AdvancedJobSearchService::class.java)
    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    
    /**
     * 고급 검색 기능
     */
    fun searchJobs(filter: AdvancedJobFilter, userId: Int? = null): JobSearchResult {
        try {
            val searchParams = buildSearchParams(filter, userId)
            
            // 총 개수 조회
            // TODO: countJobsWithAdvancedFilter 메서드 구현 필요
            val totalCount = 0
            
            // 페이징 처리
            val offset = filter.page * filter.size
            searchParams["offset"] = offset
            searchParams["limit"] = filter.size
            
            // 정렬 조건 추가
            addSortingParams(searchParams, filter.sortBy, filter.sortOrder)
            
            // 검색 실행
            // TODO: searchJobsWithAdvancedFilter 메서드 구현 필요
            val jobs = emptyList<Map<String, Any>>()
            
            // 결과 변환
            val jobItems = jobs.map { convertToJobSearchItem(it, userId) }
            
            // 페이징 정보 계산
            val totalPages = ((totalCount + filter.size - 1) / filter.size).toInt()
            val hasNext = filter.page < totalPages - 1
            val hasPrevious = filter.page > 0
            
            // 검색 통계 정보 (첫 페이지일 때만)
            val searchStats = if (filter.page == 0) {
                generateSearchStats(filter, totalCount.toLong())
            } else null
            
            return JobSearchResult(
                content = jobItems,
                page = filter.page,
                size = filter.size,
                totalElements = totalCount.toLong(),
                totalPages = totalPages,
                first = filter.page == 0,
                last = filter.page >= totalPages - 1,
                hasNext = hasNext,
                hasPrevious = hasPrevious,
                searchStats = searchStats
            )
            
        } catch (e: Exception) {
            logger.error("Error in advanced job search", e)
            throw e
        }
    }
    
    /**
     * 검색 파라미터 구성
     */
    private fun buildSearchParams(filter: AdvancedJobFilter, userId: Int?): MutableMap<String, Any> {
        val params = mutableMapOf<String, Any>()
        
        // 사용자 ID
        userId?.let { params["userId"] = it }
        
        // 기본 검색 조건
        filter.query?.let { 
            params["query"] = it
            params["searchType"] = filter.searchType?.name ?: SearchType.ALL.name
        }
        
        // 위치 관련
        filter.country?.let { params["country"] = it }
        filter.locations?.let { if (it.isNotEmpty()) params["locations"] = it }
        filter.workFromHome?.let { params["workFromHome"] = it }
        filter.relocateAccepted?.let { params["relocateAccepted"] = it }
        
        // 직무 및 산업
        filter.jobTypes?.let { if (it.isNotEmpty()) params["jobTypes"] = it }
        filter.industries?.let { if (it.isNotEmpty()) params["industries"] = it }
        filter.jobLevels?.let { if (it.isNotEmpty()) params["jobLevels"] = it }
        
        // 고용 형태
        filter.employmentTypes?.let { if (it.isNotEmpty()) params["employmentTypes"] = it }
        filter.workTypes?.let { if (it.isNotEmpty()) params["workTypes"] = it }
        
        // 회사 정보
        filter.companyTypes?.let { if (it.isNotEmpty()) params["companyTypes"] = it }
        filter.companySizes?.let { if (it.isNotEmpty()) params["companySizes"] = it }
        
        // 급여 관련
        filter.minSalary?.let { params["minSalary"] = it }
        filter.maxSalary?.let { params["maxSalary"] = it }
        filter.salaryNegotiable?.let { params["salaryNegotiable"] = it }
        
        // 경력 관련
        filter.minExperience?.let { params["minExperience"] = it }
        filter.maxExperience?.let { params["maxExperience"] = it }
        filter.experienceLevel?.let { if (it.isNotEmpty()) params["experienceLevel"] = it }
        
        // 스킬 및 기술
        filter.requiredSkills?.let { if (it.isNotEmpty()) params["requiredSkills"] = it }
        filter.preferredSkills?.let { if (it.isNotEmpty()) params["preferredSkills"] = it }
        
        // 학력 관련
        filter.educationLevels?.let { if (it.isNotEmpty()) params["educationLevels"] = it }
        filter.majors?.let { if (it.isNotEmpty()) params["majors"] = it }
        
        // 날짜 관련
        filter.postedAfter?.let { params["postedAfter"] = it.format(dateFormatter) }
        filter.deadlineBefore?.let { params["deadlineBefore"] = it.format(dateFormatter) }
        filter.hasDeadline?.let { params["hasDeadline"] = it }
        
        // 특별 조건
        filter.urgentOnly?.let { if (it) params["urgentOnly"] = true }
        filter.featuredOnly?.let { if (it) params["featuredOnly"] = true }
        filter.premiumOnly?.let { if (it) params["premiumOnly"] = true }
        filter.hasLogo?.let { params["hasLogo"] = it }
        
        // 복리후생
        filter.benefits?.let { if (it.isNotEmpty()) params["benefits"] = it }
        
        // 언어 요구사항
        filter.languages?.let { if (it.isNotEmpty()) params["languages"] = it }
        filter.languageLevels?.let { if (it.isNotEmpty()) params["languageLevels"] = it }
        
        // 제외 조건
        filter.excludeCompanies?.let { if (it.isNotEmpty()) params["excludeCompanies"] = it }
        filter.excludeKeywords?.let { if (it.isNotEmpty()) params["excludeKeywords"] = it }
        
        return params
    }
    
    /**
     * 정렬 파라미터 추가
     */
    private fun addSortingParams(params: MutableMap<String, Any>, sortBy: SortBy?, sortOrder: SortOrder?) {
        val sortColumn = when (sortBy) {
            SortBy.CREATED_AT -> "jp.created_at"
            SortBy.DEADLINE -> "jp.deadline"
            SortBy.SALARY -> "jp.salary"
            SortBy.COMPANY_NAME -> "cp.company_name"
            SortBy.TITLE -> "jp.title"
            SortBy.VIEWS -> "jp.views"
            SortBy.APPLICATIONS -> "application_count"
            SortBy.RELEVANCE -> "relevance_score"
            else -> "jp.created_at"
        }
        
        val sortDirection = when (sortOrder) {
            SortOrder.ASC -> "ASC"
            SortOrder.DESC -> "DESC"
            else -> "DESC"
        }
        
        params["sortColumn"] = sortColumn
        params["sortDirection"] = sortDirection
    }
    
    /**
     * JobSearchItem 변환
     */
    private fun convertToJobSearchItem(jobData: Map<String, Any>, userId: Int?): JobSearchItem {
        return JobSearchItem(
            jobId = (jobData["job_id"] as Number).toInt(),
            title = jobData["title"] as String,
            companyName = jobData["company_name"] as String,
            companyLogo = jobData["company_logo"] as String?,
            location = jobData["location"] as String?,
            employmentType = jobData["employment_type"] as String?,
            experienceLevel = jobData["experience_level"] as String?,
            salary = formatSalary(jobData["salary"] as BigDecimal?),
            salaryMin = jobData["salary_min"] as BigDecimal?,
            salaryMax = jobData["salary_max"] as BigDecimal?,
            deadline = formatDate(jobData["deadline"] as String?),
            createdAt = formatDate(jobData["created_at"] as String) ?: "",
            views = (jobData["views"] as Number?)?.toInt() ?: 0,
            applicationsCount = (jobData["applications_count"] as Number?)?.toInt() ?: 0,
            tags = parseStringList(jobData["tags"] as String?),
            isUrgent = (jobData["is_urgent"] as Boolean?) ?: false,
            isFeatured = (jobData["is_featured"] as Boolean?) ?: false,
            isPremium = (jobData["is_premium"] as Boolean?) ?: false,
            isScraped = (jobData["is_scraped"] as Boolean?) ?: false,
            isApplied = (jobData["is_applied"] as Boolean?) ?: false,
            skills = parseStringList(jobData["skills"] as String?),
            benefits = parseStringList(jobData["benefits"] as String?),
            companyInfo = buildCompanyInfo(jobData)
        )
    }
    
    /**
     * 회사 정보 구성
     */
    private fun buildCompanyInfo(jobData: Map<String, Any>): CompanyInfo? {
        return CompanyInfo(
            companyType = jobData["company_type"] as String?,
            industry = jobData["industry"] as String?,
            employeeCount = jobData["employee_count"] as String?,
            establishedYear = jobData["established_year"] as String?,
            website = jobData["website"] as String?
        )
    }
    
    /**
     * 검색 통계 생성
     */
    private fun generateSearchStats(filter: AdvancedJobFilter, totalCount: Long): SearchStats {
        val searchParams = buildSearchParams(filter, null)
        
        return SearchStats(
            totalJobs = totalCount,
            newJobsToday = 0, // TODO: countNewJobsToday 구현 필요
            avgSalary = BigDecimal.ZERO, // TODO: getAverageSalary 구현 필요
            popularSkills = emptyList(), // TODO: getPopularSkills 구현 필요
            popularCompanies = emptyList(), // TODO: getPopularCompanies 구현 필요
            popularLocations = emptyList() // TODO: getPopularLocations 구현 필요
        )
    }
    
    /**
     * 자동완성 기능
     */
    fun getAutoCompleteResults(query: String, type: String, limit: Int = 10): List<String> {
        // TODO: 자동완성 매퍼 메서드들 구현 필요
        return emptyList()
        /*
        return when (type) {
            "company" -> jobsMapper.getCompanyAutoComplete(query, limit)
            "skill" -> jobsMapper.getSkillAutoComplete(query, limit)
            "location" -> jobsMapper.getLocationAutoComplete(query, limit)
            "title" -> jobsMapper.getTitleAutoComplete(query, limit)
            else -> emptyList()
        }
        */
    }
    
    /**
     * 추천 검색어 기능
     */
    fun getRecommendedSearchTerms(userId: Int? = null): List<String> {
        // TODO: 추천 검색어 매퍼 메서드들 구현 필요
        return emptyList()
        /*
        return if (userId != null) {
            jobsMapper.getPersonalizedRecommendations(userId, 10)
        } else {
            jobsMapper.getPopularSearchTerms(10)
        }
        */
    }
    
    /**
     * 유틸리티 메서드들
     */
    private fun formatSalary(salary: BigDecimal?): String? {
        return salary?.let { "${it.toInt()}만원" }
    }
    
    private fun formatDate(dateString: String?): String? {
        return dateString?.let { 
            try {
                LocalDate.parse(it.substring(0, 10)).format(dateFormatter)
            } catch (e: Exception) {
                it
            }
        }
    }
    
    private fun parseStringList(str: String?): List<String> {
        return str?.split(",")?.map { it.trim() }?.filter { it.isNotEmpty() } ?: emptyList()
    }
    
    /**
     * 검색 로그 저장
     */
    @Transactional
    fun logSearch(userId: Int?, filter: AdvancedJobFilter, resultCount: Long) {
        try {
            val searchLog = mapOf(
                "userId" to userId,
                "query" to filter.query,
                "filters" to filter.toString(),
                "resultCount" to resultCount,
                "searchedAt" to LocalDate.now().format(dateFormatter)
            )
            
            // TODO: insertSearchLog 매퍼 메서드 구현 필요
            // jobsMapper.insertSearchLog(searchLog)
        } catch (e: Exception) {
            logger.warn("Failed to log search", e)
        }
    }
}