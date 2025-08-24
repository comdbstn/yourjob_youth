package com.yourjob.backend.controller.mdms

import com.yourjob.backend.entity.mdms.*
import com.yourjob.backend.service.mdms.SchoolSearchService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/mdms/search")
class SchoolSearchController(private val schoolSearchService: SchoolSearchService) {

    // 학교 검색 (국내대학, 해외대학)
    @GetMapping("/schools")
    fun searchSchools(
        @RequestParam keyword: String,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false) schoolType: String? = null, // "국내대학" 또는 "해외대학"
        @RequestParam(required = false) level1: String? = null,    // 대학분류 (대학, 대학원, 전문대학)
        @RequestParam(required = false) level2: String? = null     // 지역
    ): ResponseEntity<List<SchoolSearchResultDto>> {
        val schools = schoolSearchService.searchSchools(keyword, size, schoolType, level1, level2)
        return ResponseEntity.ok(schools)
    }

    // 전공 검색 (국내전공, 해외전공)
    @GetMapping("/majors")
    fun searchMajors(
        @RequestParam keyword: String,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false) majorType: String? = null, // "국내전공" 또는 "해외전공"
        @RequestParam(required = false) level1: String? = null,    // 전공분류
        @RequestParam(required = false) level2: String? = null     // 세부분류
    ): ResponseEntity<List<MajorSearchResultDto>> {
        val majors = schoolSearchService.searchMajors(keyword, size, majorType, level1, level2)
        return ResponseEntity.ok(majors)
    }

    // 통합 검색 (학교 + 전공)
    @GetMapping("/unified")
    fun unifiedSearch(
        @RequestParam keyword: String,
        @RequestParam(defaultValue = "5") schoolLimit: Int,
        @RequestParam(defaultValue = "5") majorLimit: Int
    ): ResponseEntity<UnifiedSearchResultDto> {
        val result = schoolSearchService.unifiedSearch(keyword, schoolLimit, majorLimit)
        return ResponseEntity.ok(result)
    }

    // 특정 데이터 타입별 검색
    @GetMapping("/by-type")
    fun searchByDataType(
        @RequestParam dataType: String,
        @RequestParam keyword: String,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) level1Filter: String? = null,
        @RequestParam(required = false) level2Filter: String? = null
    ): ResponseEntity<List<OperationDataSearchResultDto>> {
        val results = schoolSearchService.searchByDataType(dataType, keyword, size, level1Filter, level2Filter)
        return ResponseEntity.ok(results)
    }

    // 자동완성용 간단 검색
    @GetMapping("/autocomplete")
    fun searchForAutocomplete(
        @RequestParam keyword: String,
        @RequestParam dataType: String,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<List<AutocompleteResultDto>> {
        val results = schoolSearchService.searchForAutocomplete(keyword, dataType, size)
        return ResponseEntity.ok(results)
    }
}