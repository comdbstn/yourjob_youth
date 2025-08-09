package com.yourjob.backend.entity.mdms

// 학교 검색 결과 DTO
data class SchoolSearchResultDto(
    val operationDataId: String,
    val schoolName: String,
    val schoolType: String, // 국내대학, 해외대학
    val level1: String?,    // 대학분류 (대학, 대학원, 전문대학)
    val level2: String?,    // 지역
    val level3: String?,    // 학교명
    val fullPath: String    // 전체 경로 (예: 대학 > 경기 > 가천대학교)
)

// 전공 검색 결과 DTO
data class MajorSearchResultDto(
    val operationDataId: String,
    val majorName: String,
    val majorType: String, // 국내전공, 해외전공
    val level1: String?,   // 전공분류
    val level2: String?,   // 세부분류
    val level3: String?,   // 전공명
    val fullPath: String   // 전체 경로 (예: 공학 > 컴퓨터공학 > 소프트웨어공학)
)

// 통합 검색 결과 DTO
data class UnifiedSearchResultDto(
    val schools: List<SchoolSearchResultDto>,
    val majors: List<MajorSearchResultDto>,
    val totalSchools: Int,
    val totalMajors: Int
)

// 일반 Operation Data 검색 결과 DTO
data class OperationDataSearchResultDto(
    val operationDataId: String,
    val dataType: String,
    val dataTypeName: String,
    val level1: String?,
    val level2: String?,
    val level3: String?,
    val displayValue: String,
    val fullPath: String
)

// 자동완성용 DTO
data class AutocompleteResultDto(
    val id: String,
    val value: String,
    val label: String
)