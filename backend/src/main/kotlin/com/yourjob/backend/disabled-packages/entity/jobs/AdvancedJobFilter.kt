package com.yourjob.backend.entity.jobs

import java.math.BigDecimal
import java.time.LocalDate

data class AdvancedJobFilter(
    // 기본 검색 조건
    val query: String? = null,
    val searchType: SearchType? = null,
    
    // 위치 관련
    val country: String? = null,
    val locations: List<String>? = null,
    val workFromHome: Boolean? = null,
    val relocateAccepted: Boolean? = null,
    
    // 직무 및 산업
    val jobTypes: List<String>? = null, // 직무 카테고리
    val industries: List<String>? = null, // 산업 분야
    val jobLevels: List<String>? = null, // 직급
    
    // 고용 형태
    val employmentTypes: List<String>? = null, // 정규직, 계약직 등
    val workTypes: List<String>? = null, // 전일제, 파트타임 등
    
    // 회사 정보
    val companyTypes: List<String>? = null, // 대기업, 스타트업 등
    val companySizes: List<String>? = null, // 직원 수 기준
    
    // 급여 관련
    val minSalary: BigDecimal? = null,
    val maxSalary: BigDecimal? = null,
    val salaryNegotiable: Boolean? = null,
    
    // 경력 관련
    val minExperience: Int? = null,
    val maxExperience: Int? = null,
    val experienceLevel: List<String>? = null, // 신입, 경력, 경력무관
    
    // 스킬 및 기술
    val requiredSkills: List<String>? = null,
    val preferredSkills: List<String>? = null,
    
    // 학력 관련
    val educationLevels: List<String>? = null,
    val majors: List<String>? = null,
    
    // 날짜 관련
    val postedAfter: LocalDate? = null, // 특정 날짜 이후 게시된 공고
    val deadlineBefore: LocalDate? = null, // 마감일이 특정 날짜 이전인 공고
    val hasDeadline: Boolean? = null, // 마감일이 있는지 여부
    
    // 특별 조건
    val urgentOnly: Boolean? = null, // 급구 공고만
    val featuredOnly: Boolean? = null, // 추천 공고만
    val premiumOnly: Boolean? = null, // 프리미엄 공고만
    val hasLogo: Boolean? = null, // 회사 로고가 있는 공고만
    
    // 복리후생
    val benefits: List<String>? = null,
    
    // 언어 요구사항
    val languages: List<String>? = null,
    val languageLevels: Map<String, String>? = null,
    
    // 페이징 및 정렬
    val page: Int = 0,
    val size: Int = 20,
    val sortBy: SortBy? = SortBy.CREATED_AT,
    val sortOrder: SortOrder? = SortOrder.DESC,
    
    // 제외 조건
    val excludeCompanies: List<String>? = null,
    val excludeKeywords: List<String>? = null
)

enum class SearchType {
    TITLE,           // 제목 검색
    COMPANY,         // 회사명 검색
    DESCRIPTION,     // 설명 검색
    ALL             // 전체 검색
}

enum class SortBy {
    CREATED_AT,      // 등록일순
    DEADLINE,        // 마감일순
    SALARY,          // 급여순
    COMPANY_NAME,    // 회사명순
    TITLE,           // 제목순
    VIEWS,           // 조회수순
    APPLICATIONS,    // 지원자수순
    RELEVANCE        // 연관성순 (검색시)
}

enum class SortOrder {
    ASC,            // 오름차순
    DESC            // 내림차순
}

data class JobSearchResult(
    val content: List<JobSearchItem>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
    val first: Boolean,
    val last: Boolean,
    val hasNext: Boolean,
    val hasPrevious: Boolean,
    val searchStats: SearchStats? = null
)

data class JobSearchItem(
    val jobId: Int,
    val title: String,
    val companyName: String,
    val companyLogo: String? = null,
    val location: String? = null,
    val employmentType: String? = null,
    val experienceLevel: String? = null,
    val salary: String? = null,
    val salaryMin: BigDecimal? = null,
    val salaryMax: BigDecimal? = null,
    val deadline: String? = null,
    val createdAt: String,
    val views: Int = 0,
    val applicationsCount: Int = 0,
    val tags: List<String> = emptyList(),
    val isUrgent: Boolean = false,
    val isFeatured: Boolean = false,
    val isPremium: Boolean = false,
    val isScraped: Boolean = false,
    val isApplied: Boolean = false,
    val skills: List<String> = emptyList(),
    val benefits: List<String> = emptyList(),
    val companyInfo: CompanyInfo? = null
)

data class CompanyInfo(
    val companyType: String? = null,
    val industry: String? = null,
    val employeeCount: String? = null,
    val establishedYear: String? = null,
    val website: String? = null
)

data class SearchStats(
    val totalJobs: Long,
    val newJobsToday: Long,
    val avgSalary: BigDecimal? = null,
    val popularSkills: List<SkillCount>,
    val popularCompanies: List<CompanyCount>,
    val popularLocations: List<LocationCount>
)

data class SkillCount(
    val skill: String,
    val count: Int
)

data class CompanyCount(
    val company: String,
    val count: Int
)

data class LocationCount(
    val location: String,
    val count: Int
)