package com.yourjob.backend.service.mdms

import com.yourjob.backend.entity.mdms.JobManagement
import com.yourjob.backend.entity.mdms.JobManagementDto
import com.yourjob.backend.entity.mdms.JobManagementPageResponse
import com.yourjob.backend.entity.mdms.LevelType
import com.yourjob.backend.repository.mdms.JobManagementRepository
import com.yourjob.backend.repository.mdms.OperationDataLevelCodeRepository
import com.yourjob.backend.repository.mdms.OperationDataRepository
import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.text.SimpleDateFormat
import java.util.*

@Service
class JobManagementService(
    private val jobManagementRepository: JobManagementRepository,
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

    // 지역 코드를 지역명으로 변환하는 메서드
    private fun getRegionNameByCode(regionCode: String?): String {
        // 지역 코드가 비어있으면 빈 문자열 반환
        if (regionCode.isNullOrBlank()) return ""

        // 쉼표로 구분된 여러 코드를 처리
        if (regionCode.contains(",")) {
            val regionCodes = regionCode.split(",").map { it.trim() }
            val regionNames = regionCodes.map { code ->
                getRegionNameBySingleCode(code)
            }
            return regionNames.joinToString(", ")
        }

        // 단일 지역 코드 처리
        return getRegionNameBySingleCode(regionCode)
    }

    // 단일 지역 코드를 지역명으로 변환하는 메서드
    private fun getRegionNameBySingleCode(regionCode: String): String {
        try {
            // 1. operation_data_id로 operation_data 조회
            val operationData = operationDataRepository.findByOperationDataId(regionCode)
                ?: return regionCode // 데이터가 없으면 원래 코드 반환

            // 2. level1 값으로 operation_data_level_code 조회 (변경됨: level2 -> level1)
            val level1Code = operationData.level1
            if (level1Code != null) {
                val levelCode = operationDataLevelCodeRepository.findByCodeAndDataType(level1Code, "00000012")
                if (levelCode != null) {
                    return levelCode.levelValue
                }
            }

            // 조회 실패 시 원래 코드 반환
            return regionCode
        } catch (e: Exception) {
            println("Error finding region name for code: $regionCode, error: ${e.message}")
            return regionCode
        }
    }

    // 직종 코드를 직종명으로 변환하는 메서드
    private fun getJobTypeNameByCode(jobTypeCode: String?): String {
        // 직종 코드가 비어있으면 빈 문자열 반환
        if (jobTypeCode.isNullOrBlank()) return ""

        // 쉼표로 구분된 여러 코드를 처리
        if (jobTypeCode.contains(",")) {
            val jobTypeCodes = jobTypeCode.split(",").map { it.trim() }
            val jobTypeNames = jobTypeCodes.map { code ->
                getJobTypeNameBySingleCode(code)
            }
            return jobTypeNames.joinToString(", ")
        }

        // 단일 직종 코드 처리
        return getJobTypeNameBySingleCode(jobTypeCode)
    }

    // 단일 직종 코드를 직종명으로 변환하는 메서드
    private fun getJobTypeNameBySingleCode(jobTypeCode: String): String {
        try {
            // 1. operation_data_id로 operation_data 조회
            val operationData = operationDataRepository.findByOperationDataId(jobTypeCode)
                ?: return jobTypeCode // 데이터가 없으면 원래 코드 반환

            // 2. level1 값으로 operation_data_level_code 조회
            val level1Code = operationData.level1
            if (level1Code != null) {
                val levelCode = operationDataLevelCodeRepository.findByCodeAndDataType(level1Code, "00000010")
                if (levelCode != null) {
                    return levelCode.levelValue
                }
            }

            // 조회 실패 시 원래 코드 반환
            return jobTypeCode
        } catch (e: Exception) {
            println("Error finding job type name for code: $jobTypeCode, error: ${e.message}")
            return jobTypeCode
        }
    }
    @PersistenceContext
    private lateinit var entityManager: EntityManager

    /**
     * 필터링 조건에 따라 채용 정보 목록을 페이징하여 조회합니다.
     */
    @Transactional(readOnly = true)
    fun getJobsWithFilters(
        status: String?,
        paid: String?,
        locationType: String?,
        region: String?,
        jobType: String?,
        startDate: String?,
        endDate: String?,
        keyword: String?,
        page: Int,
        size: Int
    ): JobManagementPageResponse {
        // 유효한 필터 값 처리
        var validStatus = if (status.isNullOrBlank() || status == "상태") null else status
        if(validStatus == "active") {
            validStatus = "채용중"
        } else if(validStatus == "inactive") {
            validStatus = "close"
        }

        val validLocationType = if (locationType.isNullOrBlank() || locationType == "국가") null else locationType
        val validRegion = if (region.isNullOrBlank() || region == "지역") null else region
        val validJobType = if (jobType.isNullOrBlank() || jobType == "직종") null else jobType
        val validKeyword = if (keyword.isNullOrBlank()) null else keyword

        // 날짜 형식 검증
        val validStartDate = validateDate(startDate)
        val validEndDate = validateDate(endDate)

        // region과 jobType 코드를 operation_data_id로 변환
        var regionOperationDataIds: List<String>? = null
        var jobTypeOperationDataIds: List<String>? = null

        if (!validRegion.isNullOrBlank()) {
            // 쉼표로 구분된 여러 코드 처리
            val regionCodes = validRegion.split(",").map { it.trim() }
            regionOperationDataIds = getOperationDataIdsByLevelCodes(regionCodes, "00000012")
        }

        if (!validJobType.isNullOrBlank()) {
            // 쉼표로 구분된 여러 코드 처리
            val jobTypeCodes = validJobType.split(",").map { it.trim() }
            jobTypeOperationDataIds = getOperationDataIdsByLevelCodes(jobTypeCodes, "00000010")
        }

        // 페이징 처리
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))

        // Native SQL 쿼리 구성
        val sqlQuery = """
            SELECT
                a.job_id as id,
                a.job_id as jobId,
                a.employer_id as employerId,
                b.account_id as userId,
                a.app_mthds_hmpg as url,
                a.title as title,
                a.position_str as position,
                a.wrkcndtn_lct_addr as location,
                a.wrkcndtn_lct_addr as address,
                DATE_FORMAT(a.app_strt_tm, '%Y-%m-%d') as startDate,
                DATE_FORMAT(a.app_end_tm, '%Y-%m-%d') as endDate,
                DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i') as registeredDate,
                DATE_FORMAT(a.deadline, '%Y-%m-%d') as deadline,
                a.wrkcndtn_lct_typ as locationType,
                a.wrkcndtn_lct_rgn_str as region,
                a.emp_types_str as jobType,
                a.status as status,
                b.company_name AS companyName,
                b.corpthmb_imgidx AS corpthmbImgidx
            FROM job_postings a
            LEFT JOIN users b ON a.employer_id = b.user_id
            WHERE 1=1
        """.trimIndent()

        // WHERE 조건 추가
        val whereClauseSql = StringBuilder()
        val parameters = mutableMapOf<String, Any>()

        if (!validStatus.isNullOrBlank()) {
            whereClauseSql.append(" AND a.status = :status")
            parameters["status"] = validStatus
        }

        if (!validLocationType.isNullOrBlank()) {
            whereClauseSql.append(" AND a.wrkcndtn_lct_typ = :locationType")
            parameters["locationType"] = validLocationType
        }

        if (regionOperationDataIds != null && regionOperationDataIds.isNotEmpty()) {
            // 변환된 operation_data_id 값들을 IN 절로 사용
            val regionIds = regionOperationDataIds.joinToString(",") { "'$it'" }
            whereClauseSql.append(" AND a.wrkcndtn_lct_rgn_str IN ($regionIds)")
        } else if (!validRegion.isNullOrBlank()) {
            // 변환에 실패한 경우 기존 방식으로 fallback
            whereClauseSql.append(" AND a.wrkcndtn_lct_rgn_str LIKE :region")
            parameters["region"] = "%$validRegion%"
        }

        if (jobTypeOperationDataIds != null && jobTypeOperationDataIds.isNotEmpty()) {
            // 변환된 operation_data_id 값들을 IN 절로 사용
            val jobTypeIds = jobTypeOperationDataIds.joinToString(",") { "'$it'" }
            whereClauseSql.append(" AND a.emp_types_str IN ($jobTypeIds)")
        } else if (!validJobType.isNullOrBlank()) {
            // 변환에 실패한 경우 기존 방식으로 fallback
            whereClauseSql.append(" AND a.emp_types_str LIKE :jobType")
            parameters["jobType"] = "%$validJobType%"
        }

        if (!validKeyword.isNullOrBlank()) {
            whereClauseSql.append("""
                AND (
                    a.title LIKE :keyword OR
                    b.company_name LIKE :keyword OR
                    a.position_str LIKE :keyword
                )
            """)
            parameters["keyword"] = "%$validKeyword%"
        }

        if (!validStartDate.isNullOrBlank() && !validEndDate.isNullOrBlank()) {
            whereClauseSql.append(" AND (a.app_strt_tm <= :endDate AND a.app_end_tm >= :startDate)")
            parameters["startDate"] = validStartDate
            parameters["endDate"] = validEndDate
        }

        // 정렬 추가
        val orderBy = " ORDER BY a.created_at DESC"

        // 완성된 쿼리
        val fullSql = sqlQuery + whereClauseSql.toString() + orderBy
        val countSql = "SELECT COUNT(*) FROM (" + sqlQuery + whereClauseSql.toString() + ") AS count_table"

        // 쿼리 실행
        val query = entityManager.createNativeQuery(fullSql)
        val countQuery = entityManager.createNativeQuery(countSql)

        // 파라미터 바인딩
        parameters.forEach { (key, value) ->
            query.setParameter(key, value)
            countQuery.setParameter(key, value)
        }

        // 페이징 처리
        query.firstResult = pageable.offset.toInt()
        query.maxResults = pageable.pageSize

        // 결과 처리
        val resultList = query.resultList as List<Array<Any?>>
        val totalCount = (countQuery.singleResult as Number).toLong()

        // DTO로 변환
        val dtoList = resultList.map { row ->
            val regionCode = row[14] as String?
            val jobTypeCode = row[15] as String?

            val dto = JobManagementDto(
                id = (row[0] as Number).toLong(),
                jobId = (row[1] as Number).toLong(),
                employerId = (row[2] as Number).toLong(),
                userId = row[3] as String? ?: "",
                url = row[4] as String?,
                title = row[5] as String? ?: "",
                position = row[6] as String?,
                location = row[7] as String?,
                address = row[8] as String?,
                startDate = row[9] as String?,
                endDate = row[10] as String?,
                registeredDate = row[11] as String? ?: "",
                deadline = row[12] as String?,
                locationType = row[13] as String?,
                region = getRegionNameByCode(regionCode),
                regionCode = regionCode,
                jobType = getJobTypeNameByCode(jobTypeCode),
                jobTypeCode = jobTypeCode,
                status = row[16] as String? ?: "",
                companyName = row[17] as String?,
                corpthmbImgidx = (row[18] as Number?)?.toLong()
            )

            // 후처리: 로고 URL 설정 및 설명 설정
            dto.logoUrl = dto.corpthmbImgidx?.let {
                "http://localhost:8082/api/v1/image/show/$it"
            }
            dto.description = dto.position

            dto
        }

        val jobsPage = PageImpl(dtoList, pageable, totalCount)

        // 페이징 응답 생성
        return JobManagementPageResponse(
            content = dtoList,
            page = page,
            size = size,
            totalElements = jobsPage.totalElements,
            totalPages = jobsPage.totalPages,
            number = jobsPage.number,
            first = jobsPage.isFirst,
            last = jobsPage.isLast,
            numberOfElements = jobsPage.numberOfElements,
            empty = jobsPage.isEmpty
        )
    }

    /**
     * 채용 정보를 개별 ID로 조회합니다.
     */
    @Transactional(readOnly = true)
    fun getJobById(jobId: Long): JobManagementDto? {
        val sqlQuery = """
            SELECT
                a.job_id as id,
                a.job_id as jobId,
                a.employer_id as employerId,
                b.account_id as userId,
                a.app_mthds_hmpg as url,
                a.title as title,
                a.position_str as position,
                a.wrkcndtn_lct_addr as location,
                a.wrkcndtn_lct_addr as address,
                DATE_FORMAT(a.app_strt_tm, '%Y-%m-%d') as startDate,
                DATE_FORMAT(a.app_end_tm, '%Y-%m-%d') as endDate,
                DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i') as registeredDate,
                DATE_FORMAT(a.deadline, '%Y-%m-%d') as deadline,
                a.wrkcndtn_lct_typ as locationType,
                a.wrkcndtn_lct_rgn_str as region,
                a.emp_types_str as jobType,
                a.status as status,
                b.company_name AS companyName,
                b.corpthmb_imgidx AS corpthmbImgidx
            FROM job_postings a
            LEFT JOIN users b ON a.employer_id = b.user_id
            WHERE a.job_id = :id
        """.trimIndent()

        val query = entityManager.createNativeQuery(sqlQuery)
        query.setParameter("id", jobId)

        return try {
            val result = query.singleResult as Array<Any?>

            val regionCode = result[14] as String?
            val jobTypeCode = result[15] as String?

            val dto = JobManagementDto(
                id = (result[0] as Number).toLong(),
                jobId = (result[1] as Number).toLong(),
                employerId = (result[2] as Number).toLong(),
                userId = result[3] as String? ?: "",
                url = result[4] as String?,
                title = result[5] as String? ?: "",
                position = result[6] as String?,
                location = result[7] as String?,
                address = result[8] as String?,
                startDate = result[9] as String?,
                endDate = result[10] as String?,
                registeredDate = result[11] as String? ?: "",
                deadline = result[12] as String?,
                locationType = result[13] as String?,
                region = getRegionNameByCode(regionCode),
                regionCode = regionCode,
                jobType = getJobTypeNameByCode(jobTypeCode),
                jobTypeCode = jobTypeCode,
                status = result[16] as String? ?: "",
                companyName = result[17] as String?,
                corpthmbImgidx = (result[18] as Number?)?.toLong()
            )

            // 후처리
            dto.logoUrl = dto.corpthmbImgidx?.let {
                "http://localhost:8082/api/v1/image/show/$it"
            }
            dto.description = dto.position

            dto
        } catch (e: Exception) {
            // 결과가 없는 경우 null 반환
            null
        }
    }

    /**
     * 채용 정보의 상태를 변경합니다.
     */
    @Transactional
    fun updateJobStatus(jobId: Long, status: String): Boolean {
        val sqlQuery = """
            UPDATE job_postings
            SET status = :status,
                updated_at = NOW()
            WHERE job_id = :id
        """.trimIndent()

        val query = entityManager.createNativeQuery(sqlQuery)
        query.setParameter("id", jobId)
        query.setParameter("status", status)

        return try {
            val updatedRows = query.executeUpdate()
            updatedRows > 0
        } catch (e: Exception) {
            false
        }
    }

    /**
     * 채용 정보를 삭제합니다.
     */
    @Transactional
    fun deleteJob(jobId: Long): Boolean {
        val sqlQuery = """
            DELETE FROM job_postings
            WHERE job_id = :id
        """.trimIndent()

        val query = entityManager.createNativeQuery(sqlQuery)
        query.setParameter("id", jobId)

        return try {
            val deletedRows = query.executeUpdate()
            deletedRows > 0
        } catch (e: Exception) {
            false
        }
    }

    /**
     * 여러 채용 정보의 상태를 변경합니다.
     */
    @Transactional
    fun updateJobsStatus(jobIds: List<Long>, status: String): Int {
        var successCount = 0

        jobIds.forEach { jobId ->
            if (updateJobStatus(jobId, status)) {
                successCount++
            }
        }

        return successCount
    }

    /**
     * 여러 채용 정보를 삭제합니다.
     */
    @Transactional
    fun deleteJobs(jobIds: List<Long>): Int {
        var successCount = 0

        jobIds.forEach { jobId ->
            if (deleteJob(jobId)) {
                successCount++
            }
        }

        return successCount
    }

    /**
     * 날짜 문자열이 유효한지 검증하고 포맷을 통일합니다.
     */
    private fun validateDate(dateStr: String?): String? {
        if (dateStr.isNullOrBlank()) return null

        try {
            val format = SimpleDateFormat("yyyy-MM-dd")
            format.isLenient = false
            val date = format.parse(dateStr)
            return format.format(date)
        } catch (e: Exception) {
            // 유효하지 않은 날짜는 null 반환
            return null
        }
    }
}
