package com.yourjob.backend.controller.admin

import com.yourjob.backend.service.ResumeService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.text.SimpleDateFormat
import java.time.LocalDate
import java.time.Period
import java.time.Year
import java.time.YearMonth
import java.time.format.DateTimeFormatter

@RestController
@RequestMapping("/api/v1")
class AdminResumesController (private var resumeService: ResumeService){

    //나이 계산 함수
    fun calculateKoreanAge(birthDateStr: String?): Int {
        if (birthDateStr.isNullOrBlank()) return 0

        try {
            val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
            val birthDate = LocalDate.parse(birthDateStr, formatter)
            val currentDate = LocalDate.now()

            // 현재 년도 - 출생 년도 + 1 (현재 만 나이X)
            return currentDate.year - birthDate.year + 1
        } catch (e: Exception) {
            println("생년월일 파싱 오류: $birthDateStr")
            return 0
        }
    }

    // 경력 기간 계산 함수 (개선된 버전)
    fun calculateExperiencePeriod(startDateStr: String?, endDateStr: String?): String {
        if (startDateStr.isNullOrBlank() || endDateStr.isNullOrBlank()) {
            return "0년 0개월"
        }

        try {
            // 여러 날짜 형식을 지원하도록 개선
            val startDate = parseFlexibleDate(startDateStr)
            val endDate = parseFlexibleDate(endDateStr)

            if (startDate == null || endDate == null) {
                println("날짜 파싱 실패: $startDateStr ~ $endDateStr")
                return "0년 0개월"
            }

            val period = Period.between(startDate, endDate)
            val years = period.years
            val months = period.months

            return "${years}년 ${months}개월"
        } catch (e: Exception) {
            println("경력 기간 계산 오류: $startDateStr ~ $endDateStr - ${e.message}")
            return "0년 0개월"
        }
    }

    // 유연한 날짜 파싱 함수
    private fun parseFlexibleDate(dateStr: String): LocalDate? {
        if (dateStr.isBlank()) return null

        // 다양한 날짜 형식 처리
        val formatters = listOf(
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),     // 2025-01-15
            DateTimeFormatter.ofPattern("yyyy-MM"),        // 2025-01 (월의 첫째 날로 처리)
            DateTimeFormatter.ofPattern("yyyy")            // 2025 (년의 첫째 날로 처리)
        )

        for (formatter in formatters) {
            try {
                return when (formatter.toString()) {
                    "Value(YearOfEra,4,19,EXCEEDS_PAD)'-'Value(MonthOfYear,2)'-'Value(DayOfMonth,2)" -> {
                        // yyyy-MM-dd 형식
                        LocalDate.parse(dateStr, formatter)
                    }
                    "Value(YearOfEra,4,19,EXCEEDS_PAD)'-'Value(MonthOfYear,2)" -> {
                        // yyyy-MM 형식 (해당 월의 1일로 처리)
                        val yearMonth = YearMonth.parse(dateStr, formatter)
                        yearMonth.atDay(1)
                    }
                    "Value(YearOfEra,4,19,EXCEEDS_PAD)" -> {
                        // yyyy 형식 (해당 년의 1월 1일로 처리)
                        val year = Year.parse(dateStr, formatter)
                        year.atDay(1)
                    }
                    else -> LocalDate.parse(dateStr, formatter)
                }
            } catch (e: Exception) {
                // 다음 형식으로 시도
                continue
            }
        }

        // 숫자만 있는 경우 (예: "125") - 잘못된 데이터로 처리
        if (dateStr.matches(Regex("^\\d+$")) && dateStr.length <= 4) {
            try {
                val year = dateStr.toInt()
                if (year in 1900..2100) {
                    return LocalDate.of(year, 1, 1)
                }
            } catch (e: Exception) {
                // 무시
            }
        }

        return null
    }

    @GetMapping("/admin/resumes")
    fun api_v1_admin_resumes_list(
        session: HttpSession,
        request: HttpServletRequest,
        keyword: String,
        gender: String,
        page: Int,
        size: Int,
        status: String,
        country: String,
        region: String,
        startDate: String,
        endDate: String
    ): ResponseEntity<Any> {
        var user_id = session.getAttribute("userId")
        if (user_id == null) {
            //return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }

        var req_page = 1
        var req_size = 10
        if (page != null && size != null && size > 0) {
            req_page = page + 1
            req_size = size
        }

        var nMap = mutableMapOf<String, Any>()
        if (user_id != null) {
            nMap.put("userId", user_id)
        }

        // 검색 파라미터 추가
        if (keyword != "") {
            nMap.put("keyword", keyword)
        }

        if (gender != "" && gender != "성별") {
            nMap.put("gender", gender)
        }

        if (status != "" && status != "상태") {
            nMap.put("status", status)
        }

        if (country != "" && country != "국가") {
            nMap.put("country", country)
        }

        if (region != "" && region != "지역") {
            nMap.put("region", region)
        }

        // 날짜 검색 파라미터 처리
        if (startDate != "" && endDate != "") {
            nMap.put("startDate", startDate)
            nMap.put("endDate", endDate)
        }

        nMap.put("size", req_size)
        var offSetNumb = getOffSetNumb(req_page, req_size)
        nMap.put("offSetNumb", offSetNumb)

        var resumeList = resumeService.selectResumeList(nMap)

        // 데이터베이스에서 검색 조건으로 필터링하지 못한 경우를 위한 메모리 내 필터링
        var filteredResumeList = resumeList.filter { resume ->
            var includeResume = true

            // 키워드 필터링 (이름, 제목, 지역 등에서 검색)
            if (keyword != "") {
                includeResume = includeResume && (
                        resume.title?.contains(keyword, ignoreCase = true) == true ||
                                resume.name?.contains(keyword, ignoreCase = true) == true ||
                                resume.region?.contains(keyword, ignoreCase = true) == true
                        )
            }

            // 성별 필터링
            if (gender != "" && gender != "성별") {
                includeResume = includeResume && resume.gender == gender
            }

            // 상태 필터링
            if (status != "" && status != "상태") {
                includeResume = includeResume && resume.status == status
            }

            // 국가 필터링
            if (country != "" && country != "국가") {
                includeResume = includeResume && resume.country == country
            }

            // 지역 필터링
            if (region != "" && region != "지역") {
                includeResume = includeResume && resume.region == region
            }

            // 날짜 필터링
            if (startDate != "" && endDate != "") {
                try {
                    val format = SimpleDateFormat("yyyy-MM-dd")
                    val resumeDate = resume.created_at?.let { format.parse(it.toString()) }
                    val start = format.parse(startDate)
                    val end = format.parse(endDate)

                    if (resumeDate != null) {
                        includeResume = includeResume && (resumeDate >= start && resumeDate <= end)
                    }
                } catch (e: Exception) {
                    // 날짜 형식이 잘못된 경우 필터링 무시
                }
            }

            includeResume
        }

        // 필터링된 결과로 응답 생성
        var list = ArrayList<Any>()
        for (resume in filteredResumeList) {
            var nMap = mutableMapOf<String, Any>()
            nMap.put("id", resume.resumeId.toString().toInt())
            nMap.put("title", resume.title.toString())
            nMap.put("name", resume.name.toString())
            nMap.put("age", calculateKoreanAge(resume.birth.toString()))
            nMap.put("gender", resume.gender.toString())
            nMap.put("experience", calculateExperiencePeriod(resume.carrerStartDate, resume.carrerEndDate))
            nMap.put("country", resume.country.toString())
            nMap.put("region", resume.region.toString())
            nMap.put("createdAt", resume.created_at.toString())
            nMap.put("status", resume.status ?: "closed")
            nMap.put("userId", resume.userId.toString())

            // 이미지 URL 처리
            if (resume.photoUrl != null) {
                nMap.put("photoUrl", "http://localhost:8082/api/v1/image/show/" + resume.photoUrl.toString())
            } else {
                nMap.put("photoUrl", "")
            }

            list.add(nMap)
        }

        var resumeListCnt = filteredResumeList.size
        var totalPages = resumeListCnt / size
        if (resumeListCnt % size > 0) {
            totalPages = totalPages + 1
        }

        var resp_mMap = mutableMapOf<String, Any>()
        resp_mMap.put("totalPages", totalPages)
        resp_mMap.put("page", page)
        resp_mMap.put("size", size)
        resp_mMap.put("content", list)
        resp_mMap.put("totalElements", resumeListCnt)

        return ResponseEntity(resp_mMap, HttpStatus.OK)
    }

    fun getOffSetNumb(page: Int, size: Int): Int {
        return (page - 1) * size
    }
}