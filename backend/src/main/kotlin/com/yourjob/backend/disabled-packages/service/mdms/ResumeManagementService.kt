package com.yourjob.backend.service.mdms

import com.yourjob.backend.entity.mdms.*
import com.yourjob.backend.repository.mdms.ResumeManagementRepository
import com.yourjob.backend.repository.mdms.ResumeCareerManagementRepository
import com.yourjob.backend.repository.mdms.UserManagementRepository
import com.yourjob.backend.repository.mdms.OperationDataLevelCodeRepository
import com.yourjob.backend.repository.mdms.OperationDataRepository
import com.yourjob.backend.entity.mdms.LevelType
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.*
import java.time.format.DateTimeFormatter

@Service
class ResumeManagementService(
    private val resumeManagementRepository: ResumeManagementRepository,
    private val userManagementRepository: UserManagementRepository,
    private val resumeCareerManagementRepository: ResumeCareerManagementRepository,
    private val operationDataLevelCodeRepository: OperationDataLevelCodeRepository,
    private val operationDataRepository: OperationDataRepository
) {

    // level code를 operation_data_id로 변환하는 함수
    private fun getOperationDataIdsByLevelCodes(levelCodes: List<String>, dataType: String): ArrayList<String> {
        val operationDataIds = ArrayList<String>()

        for (levelCode in levelCodes) {
            try {
                val operationData = operationDataRepository.findByDataTypeAndLevel1(dataType, levelCode.trim())

                operationData.forEach { data ->
                    operationDataIds.add(data.operationDataId)
                }
            } catch (e: Exception) {
                // 로깅 추가
                println("Error finding operation data for levelCode: $levelCode, dataType: $dataType, error: ${e.message}")
                continue
            }
        }

        return operationDataIds
    }

    // 국가 코드를 국가명으로 변환하는 메서드
    private fun getCountryNameByCode(countryCode: String): String {
        // 국가 코드가 비어있으면 빈 문자열 반환
        if (countryCode.isBlank()) return ""

        try {
            // 1. operation_data_id로 operation_data 조회
            val operationData = operationDataRepository.findByOperationDataId(countryCode)
                ?: return countryCode // 데이터가 없으면 원래 코드 반환

            // 2. level2 값으로 operation_data_level_code 조회
            val level2Code = operationData.level2
            if (level2Code != null) {
                val levelCode = operationDataLevelCodeRepository.findByCodeAndDataType(level2Code, "00000002")
                if (levelCode != null) {
                    return levelCode.levelValue
                }
            }

            // 조회 실패 시 원래 코드 반환
            return countryCode
        } catch (e: Exception) {
            println("Error finding country name for code: $countryCode, error: ${e.message}")
            return countryCode
        }
    }

    // 기존 MyBatis 호환을 위한 메서드
    fun selectResumeList(params: Map<String, Any>): List<ResumeManagementRequest> {
        // 이 메서드는 기존 코드와의 호환성을 위해 유지합니다.
        // 새로운 구현은 getResumes 메서드를 통해 제공합니다.
        return emptyList()
    }

    @Transactional(readOnly = true)
    fun getResumes(filter: ResumeManagementSearchFilter): PagedResumeManagementResponse {
        // 날짜 변환
        val startDate = filter.startDate?.let { parseToLocalDateTime(it, false) }
        val endDate = filter.endDate?.let { parseToLocalDateTime(it, true) }

        // JPA 쿼리를 사용하여 필터링된 이력서 조회
        val resumeResultList = resumeManagementRepository.findResumesByFilters(
            keyword = if (filter.keyword.isNullOrEmpty()) null else filter.keyword,
            gender = if (filter.gender.isNullOrEmpty() || filter.gender == "성별") null else filter.gender,
            status = if (filter.status.isNullOrEmpty() || filter.status == "상태") null else filter.status,
            country = if (filter.country.isNullOrEmpty() || filter.country == "국가") null else filter.country,
            region = if (filter.region.isNullOrEmpty() || filter.region == "지역") null else filter.region,
            jobSeekerId = if (filter.userId.isNullOrEmpty()) null else filter.userId,
            startDate = startDate,
            endDate = endDate
        )

        // 페이징 처리
        val pageable = PageRequest.of(filter.page, filter.size)
        val start = filter.page * filter.size
        val end = minOf(start + filter.size, resumeResultList.size)

        val pagedResumes = if (start < resumeResultList.size) {
            resumeResultList.subList(start, end)
        } else {
            emptyList()
        }

        // 응답 DTO 생성
        val resumeResponses = pagedResumes.map { resultArray ->
            // resultArray[0] is ResumeManagement, resultArray[1] is accountId
            val resume = resultArray[0] as ResumeManagement
            val accountId = resultArray[1] as String?

            val careers = resume.resumeId?.let { resumeId ->
                resumeCareerManagementRepository.findByResumeId(resumeId)
            } ?: emptyList()

            // 경력 계산
            val experience = if (careers.isNotEmpty()) {
                val career = careers.first()
                calculateExperiencePeriod(career.startDate, career.endDate)
            } else {
                "0년 0개월"
            }

            val nationality = resume.nationality ?: ""
            ResumeManagementResponse(
                resumeId = resume.resumeId ?: 0,
                title = resume.title ?: "",
                name = resume.name ?: "",
                age = calculateKoreanAge(resume.birth),
                gender = resume.gender ?: "",
                experience = experience,
                country = getCountryNameByCode(nationality),
                countryCode = nationality,
                region = resume.region ?: "",
                createdAt = resume.createdAt?.toString() ?: "",
                status = resume.status ?: "closed",
                accountId = accountId ?: "",
                photoUrl = resume.picturePath?: ""
            )
        }

        // 총 페이지 수 계산
        val totalPages = (resumeResultList.size + filter.size - 1) / filter.size

        return PagedResumeManagementResponse(
            content = resumeResponses,
            totalPages = totalPages,
            page = filter.page,
            size = filter.size,
            totalElements = resumeResultList.size
        )
    }

    @Transactional
    fun updateResumeStatus(request: BulkStatusUpdateRequest): Boolean {
        try {
            request.resumeIds.forEach { resumeId ->
                val resume = resumeManagementRepository.findById(resumeId).orElse(null)

                // 이력서가 존재하면 상태 업데이트
                resume?.let {
                    val updatedResume = it.copy(status = request.status)
                    resumeManagementRepository.save(updatedResume)
                }
            }
            return true
        } catch (e: Exception) {
            e.printStackTrace()
            return false
        }
    }

    @Transactional
    fun deleteResumes(request: BulkDeleteRequest): Boolean {
        try {
            request.resumeIds.forEach { resumeId ->
                // 관련 경력 정보 삭제
                val careers = resumeCareerManagementRepository.findByResumeId(resumeId)
                resumeCareerManagementRepository.deleteAll(careers)

                // 이력서 삭제
                resumeManagementRepository.deleteById(resumeId)
            }
            return true
        } catch (e: Exception) {
            e.printStackTrace()
            return false
        }
    }

    /**
     * 단일 이력서 삭제
     */
    @Transactional
    fun deleteResume(resumeId: Long): Boolean {
        return try {
            // 관련 경력 정보 삭제
            val careers = resumeCareerManagementRepository.findByResumeId(resumeId)
            resumeCareerManagementRepository.deleteAll(careers)

            // 이력서 삭제
            resumeManagementRepository.deleteById(resumeId)
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    /**
     * 특정 이력서 조회
     */
    @Transactional(readOnly = true)
    fun getResumeById(resumeId: Long): ResumeManagementResponse? {
        val resume = resumeManagementRepository.findById(resumeId).orElse(null) ?: return null

        val user = resume.jobSeekerId?.let { jobSeekerId ->
            userManagementRepository.findByUserId(jobSeekerId)
        }

        val careers = resumeCareerManagementRepository.findByResumeId(resumeId)

        // 경력 계산
        val experience = if (careers.isNotEmpty()) {
            val career = careers.first()
            calculateExperiencePeriod(career.startDate, career.endDate)
        } else {
            "0년 0개월"
        }

        val nationality = resume.nationality ?: ""
        return ResumeManagementResponse(
            resumeId = resume.resumeId?: 0,
            title = resume.title ?: "",
            name = resume.name ?: "",
            age = calculateKoreanAge(resume.birth),
            gender = resume.gender ?: "",
            experience = experience,
            country = getCountryNameByCode(nationality),
            countryCode = nationality,
            region = resume.region ?: "",
            createdAt = resume.createdAt?.toString() ?: "",
            status = resume.status ?: "closed",
            accountId = user?.accountId ?: "",
            photoUrl = resume.picturePath?: ""
        )
    }

    /**
     * 여러 개의 이력서 조회
     */
    @Transactional(readOnly = true)
    fun getResumesByIds(resumeIds: List<Long>): List<ResumeManagementResponse> {
        val resumes = resumeManagementRepository.findAllById(resumeIds)
        val userMap = fetchUsersForResumes(resumes)
        val careersMap = fetchCareersForResumes(resumes)

        return resumes.map { resume ->
            val user = resume.jobSeekerId?.let { jobSeekerId -> userMap[jobSeekerId.toString()] }
            val careers = resume.resumeId?.let { resumeId -> careersMap[resumeId] } ?: emptyList()

            // 경력 계산
            val experience = if (careers.isNotEmpty()) {
                val career = careers.first()
                calculateExperiencePeriod(career.startDate, career.endDate)
            } else {
                "0년 0개월"
            }

            val nationality = resume.nationality ?: ""
            ResumeManagementResponse(
                resumeId = resume.resumeId?: 0,
                title = resume.title ?: "",
                name = resume.name ?: "",
                age = calculateKoreanAge(resume.birth),
                gender = resume.gender ?: "",
                experience = experience,
                country = getCountryNameByCode(nationality),
                countryCode = nationality,
                region = resume.region ?: "",
                createdAt = resume.createdAt?.toString() ?: "",
                status = resume.status ?: "closed",
                accountId = user?.accountId ?: "",
                photoUrl = resume.picturePath?: ""
            )
        }
    }

    /**
     * 여러 이력서에 대한 사용자 정보를 한 번에 조회 (N+1 문제 방지)
     */
    private fun fetchUsersForResumes(resumes: List<ResumeManagement>): Map<String, UserManagement> {
        val jobSeekerIds = resumes.mapNotNull { it.jobSeekerId }.distinct()
        if (jobSeekerIds.isEmpty()) return emptyMap()

        // UserManagementRepository의 findAllByAccountIdIn 메서드 사용
        val users = userManagementRepository.findAllByUserIdIn(jobSeekerIds) ?: emptyList()
        return users.associateBy { it.accountId ?: "" }
    }

    fun findUserByResumeId(resumeId: Long): UserManagement? {
        val resume = resumeManagementRepository.findById(resumeId).orElse(null)
        return resume?.jobSeekerId?.let { jobSeekerId ->
            userManagementRepository.findByUserId(jobSeekerId)
        }
    }

    /**
     * 여러 이력서에 대한 경력 정보를 한 번에 조회 (N+1 문제 방지)
     */
    private fun fetchCareersForResumes(resumes: List<ResumeManagement>): Map<Long, List<ResumeCareerManagement>> {
        val resumeIds = resumes.mapNotNull { it.resumeId }.distinct()
        if (resumeIds.isEmpty()) return emptyMap()

        val allCareers = resumeCareerManagementRepository.findByResumeIdIn(resumeIds)
        return allCareers.groupBy { it.resumeId ?: 0L }
    }

    // 나이 계산 함수
    private fun calculateKoreanAge(birthDateStr: String?): Int {
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

    // 경력 기간 계산 함수
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

    // 날짜 문자열을 LocalDateTime으로 변환
    private fun parseToLocalDateTime(dateStr: String, isEndDate: Boolean): LocalDateTime? {
        return try {
            val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
            val date = LocalDate.parse(dateStr, formatter)

            if (isEndDate) {
                date.atTime(23, 59, 59) // 종료일은 해당 일자의 마지막 시간으로 설정
            } else {
                date.atStartOfDay() // 시작일은 해당 일자의 시작 시간으로 설정
            }
        } catch (e: Exception) {
            null
        }
    }

    /**
     * 이력서 상태 업데이트 (단일)
     */
    @Transactional
    fun updateResumeStatus(resumeId: Long, status: String): Boolean {
        return try {
            val resume = resumeManagementRepository.findById(resumeId).orElse(null)
                ?: return false

            val updatedResume = resume.copy(status = status)
            resumeManagementRepository.save(updatedResume)
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    /**
     * 이력서 검색 (검색어로 이름, 제목, 내용 검색)
     */
    @Transactional(readOnly = true)
    fun searchResumes(keyword: String, page: Int, size: Int): PagedResumeManagementResponse {
        val filter = ResumeManagementSearchFilter(
            keyword = keyword,
            page = page,
            size = size
        )
        return getResumes(filter)
    }
}
