package com.yourjob.backend.service.mdms

import com.yourjob.backend.entity.mdms.*
import com.yourjob.backend.repository.mdms.JobManagementRepository
import com.yourjob.backend.repository.mdms.JobOfferManagementRepository
import com.yourjob.backend.repository.mdms.ResumeManagementRepository
import com.yourjob.backend.repository.mdms.UserManagementRepository
import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.text.SimpleDateFormat
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class JobOfferManagementService(
    private val jobOfferManagementRepository: JobOfferManagementRepository,
    private val userManagementRepository: UserManagementRepository,
    private val jobManagementRepository: JobManagementRepository,
    private val resumeManagementRepository: ResumeManagementRepository
) {
    @PersistenceContext
    private lateinit var entityManager: EntityManager

    /**
     * 필터링 조건에 따라 채용 제안 정보 목록을 페이징하여 조회합니다.
     */
    @Transactional(readOnly = true)
    fun getJobOffersWithFilters(
        status: String?,
        interviewStatus: String?,
        keyword: String?,
        employerId: Long?,
        jobSeekerId: Long?,
        jobId: Long?,
        resumeId: Long?,
        startDate: String?,
        endDate: String?,
        page: Int,
        size: Int
    ): JobOfferManagementPageResponse {
        // 유효한 필터 값 처리
        val validStatus = if (status.isNullOrBlank() || status == "상태") null else status
        val validInterviewStatus = if (interviewStatus.isNullOrBlank() || interviewStatus == "면접 상태") null else interviewStatus
        val validKeyword = if (keyword.isNullOrBlank()) null else keyword

        // 날짜 형식 검증
        val validStartDate = validateDate(startDate)
        val validEndDate = validateDate(endDate)

        // 페이징 처리
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))

        // Native SQL 쿼리 구성
        val sqlQuery = """
            SELECT
                jo.joboffer_id,
                jo.job_id,
                jo.employer_id,
                jo.job_seeker_id,
                jo.resume_id,
                jo.message,
                jo.position,
                jo.positionInfo,
                jo.status,
                jo.interview_status,
                jo.manager,
                DATE_FORMAT(jo.created_at, '%Y-%m-%d %H:%i') as created_at,
                DATE_FORMAT(jo.updated_at, '%Y-%m-%d %H:%i') as updated_at,
                jp.title as job_title,
                r.title as resume_title,
                eu.account_id as employer_account_id,
                jsu.account_id as job_seeker_account_id
            FROM job_offers jo
            LEFT JOIN job_postings jp ON jo.job_id = jp.job_id
            LEFT JOIN resumes r ON jo.resume_id = r.resume_id
            LEFT JOIN users eu ON jo.employer_id = eu.user_id
            LEFT JOIN users jsu ON jo.job_seeker_id = jsu.user_id
            WHERE 1=1
        """.trimIndent()

        // WHERE 조건 추가
        val whereClauseSql = StringBuilder()
        val parameters = mutableMapOf<String, Any>()

        if (!validStatus.isNullOrBlank()) {
            whereClauseSql.append(" AND jo.status = :status")
            parameters["status"] = validStatus
        }

        if (!validInterviewStatus.isNullOrBlank()) {
            whereClauseSql.append(" AND jo.interview_status = :interviewStatus")
            parameters["interviewStatus"] = validInterviewStatus
        }

        if (!validKeyword.isNullOrBlank()) {
            whereClauseSql.append("""
                AND (
                    jp.title LIKE :keyword OR
                    r.title LIKE :keyword OR
                    jo.position LIKE :keyword OR
                    jo.positionInfo LIKE :keyword OR
                    eu.account_id LIKE :keyword OR
                    jsu.account_id LIKE :keyword
                )
            """)
            parameters["keyword"] = "%$validKeyword%"
        }

        if (employerId != null) {
            whereClauseSql.append(" AND jo.employer_id = :employerId")
            parameters["employerId"] = employerId
        }

        if (jobSeekerId != null) {
            whereClauseSql.append(" AND jo.job_seeker_id = :jobSeekerId")
            parameters["jobSeekerId"] = jobSeekerId
        }

        // jobId 필터링 조건
        if (jobId != null) {
            whereClauseSql.append(" AND jo.job_id = :jobId")
            parameters["jobId"] = jobId
        }

        // resumeId 필터링 조건
        if (resumeId != null) {
            whereClauseSql.append(" AND jo.resume_id = :resumeId")
            parameters["resumeId"] = resumeId
        }

        if (!validStartDate.isNullOrBlank() && !validEndDate.isNullOrBlank()) {
            whereClauseSql.append(" AND (jo.created_at BETWEEN :startDate AND :endDate)")
            parameters["startDate"] = validStartDate
            parameters["endDate"] = validEndDate
        }

        // 정렬 추가
        val orderBy = " ORDER BY jo.created_at DESC"

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
            JobOfferManagementDto(
                jobOfferId = (row[0] as Number).toLong(),
                jobId = (row[1] as Number?)?.toLong(),
                employerId = row[15] as String?, // employer_account_id
                jobSeekerId = (row[3] as Number?)?.toLong(),
                jobSeekerAccountId = row[16] as String?, // job_seeker_account_id
                resumeId = (row[4] as Number?)?.toLong(),
                message = row[5] as String?,
                position = row[6] as String?,
                positionInfo = row[7] as String?,
                status = row[8] as String?,
                interviewStatus = row[9] as String?,
                manager = row[10] as String?,
                createdAt = row[11] as String?,
                updatedAt = row[12] as String?,
                jobInfoTitle = row[13] as String?, // job_title
                resumeTitle = row[14] as String?  // resume_title
            )
        }

        val jobOffersPage = PageImpl(dtoList, pageable, totalCount)

        // 페이징 응답 생성
        return JobOfferManagementPageResponse(
            content = dtoList,
            page = page,
            size = size,
            totalElements = jobOffersPage.totalElements,
            totalPages = jobOffersPage.totalPages,
            number = jobOffersPage.number,
            first = jobOffersPage.isFirst,
            last = jobOffersPage.isLast,
            numberOfElements = jobOffersPage.numberOfElements,
            empty = jobOffersPage.isEmpty
        )
    }


    /**
     * 채용 제안 정보를 개별 ID로 조회합니다.
     */
    @Transactional(readOnly = true)
    fun getJobOfferById(jobOfferId: Long): JobOfferManagementDto? {
        val sqlQuery = """
            SELECT
                jo.joboffer_id,
                jo.job_id,
                jo.employer_id,
                jo.job_seeker_id,
                jo.resume_id,
                jo.message,
                jo.position,
                jo.positionInfo,
                jo.status,
                jo.interview_status,
                jo.manager,
                DATE_FORMAT(jo.created_at, '%Y-%m-%d %H:%i') as created_at,
                DATE_FORMAT(jo.updated_at, '%Y-%m-%d %H:%i') as updated_at,
                jp.title as job_title,
                r.title as resume_title,
                eu.account_id as employer_account_id,
                jsu.account_id as job_seeker_account_id
            FROM job_offers jo
            LEFT JOIN job_postings jp ON jo.job_id = jp.job_id
            LEFT JOIN resumes r ON jo.resume_id = r.resume_id
            LEFT JOIN users eu ON jo.employer_id = eu.user_id
            LEFT JOIN users jsu ON jo.job_seeker_id = jsu.user_id
            WHERE jo.joboffer_id = :id
        """.trimIndent()

        val query = entityManager.createNativeQuery(sqlQuery)
        query.setParameter("id", jobOfferId)

        return try {
            val result = query.singleResult as Array<Any?>

            JobOfferManagementDto(
                jobOfferId = (result[0] as Number).toLong(),
                jobId = (result[1] as Number?)?.toLong(),
                employerId = result[15] as String?, // employer_account_id
                jobSeekerId = (result[3] as Number?)?.toLong(),
                jobSeekerAccountId = result[16] as String?, // job_seeker_account_id
                resumeId = (result[4] as Number?)?.toLong(),
                message = result[5] as String?,
                position = result[6] as String?,
                positionInfo = result[7] as String?,
                status = result[8] as String?,
                interviewStatus = result[9] as String?,
                manager = result[10] as String?,
                createdAt = result[11] as String?,
                updatedAt = result[12] as String?,
                jobInfoTitle = result[13] as String?, // job_title
                resumeTitle = result[14] as String?  // resume_title
            )
        } catch (e: Exception) {
            // 결과가 없는 경우 null 반환
            null
        }
    }

    /**
     * 채용 제안 상태를 변경합니다.
     */
    @Transactional
    fun updateJobOfferStatus(jobOfferId: Long, status: String): Boolean {
        val sqlQuery = """
            UPDATE job_offers
            SET status = :status,
                updated_at = NOW()
            WHERE joboffer_id = :id
        """.trimIndent()

        val query = entityManager.createNativeQuery(sqlQuery)
        query.setParameter("id", jobOfferId)
        query.setParameter("status", status)

        return try {
            val updatedRows = query.executeUpdate()
            updatedRows > 0
        } catch (e: Exception) {
            false
        }
    }

    /**
     * 면접 상태를 변경합니다.
     */
    @Transactional
    fun updateInterviewStatus(jobOfferId: Long, interviewStatus: String): Boolean {
        val sqlQuery = """
            UPDATE job_offers
            SET interview_status = :interviewStatus,
                updated_at = NOW()
            WHERE joboffer_id = :id
        """.trimIndent()

        val query = entityManager.createNativeQuery(sqlQuery)
        query.setParameter("id", jobOfferId)
        query.setParameter("interviewStatus", interviewStatus)

        return try {
            val updatedRows = query.executeUpdate()
            updatedRows > 0
        } catch (e: Exception) {
            false
        }
    }

    /**
     * 채용 제안을 삭제합니다.
     */
    @Transactional
    fun deleteJobOffer(jobOfferId: Long): Boolean {
        val sqlQuery = """
            DELETE FROM job_offers
            WHERE joboffer_id = :id
        """.trimIndent()

        val query = entityManager.createNativeQuery(sqlQuery)
        query.setParameter("id", jobOfferId)

        return try {
            val deletedRows = query.executeUpdate()
            deletedRows > 0
        } catch (e: Exception) {
            false
        }
    }

    /**
     * 여러 채용 제안의 상태를 변경합니다.
     */
    @Transactional
    fun updateJobOffersStatus(jobOfferIds: List<Long>, status: String): Int {
        var successCount = 0

        jobOfferIds.forEach { jobOfferId ->
            if (updateJobOfferStatus(jobOfferId, status)) {
                successCount++
            }
        }

        return successCount
    }

    /**
     * 여러 채용 제안의 면접 상태를 변경합니다.
     */
    @Transactional
    fun updateInterviewStatuses(jobOfferIds: List<Long>, interviewStatus: String): Int {
        var successCount = 0

        jobOfferIds.forEach { jobOfferId ->
            if (updateInterviewStatus(jobOfferId, interviewStatus)) {
                successCount++
            }
        }

        return successCount
    }

    /**
     * 여러 채용 제안을 삭제합니다.
     */
    @Transactional
    fun deleteJobOffers(jobOfferIds: List<Long>): Int {
        var successCount = 0

        jobOfferIds.forEach { jobOfferId ->
            if (deleteJobOffer(jobOfferId)) {
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

    /**
     * 채용 제안 검색 (검색어로 제목, 포지션, 계정 등 검색)
     */
    @Transactional(readOnly = true)
    fun searchJobOffers(keyword: String, page: Int, size: Int): JobOfferManagementPageResponse {
        return getJobOffersWithFilters(
            status = null,
            interviewStatus = null,
            keyword = keyword,
            employerId = null,
            jobSeekerId = null,
            jobId = null,
            resumeId = null,
            startDate = null,
            endDate = null,
            page = page,
            size = size
        )
    }

    /**
     * 고용주 ID로 채용 제안 조회
     */
    @Transactional(readOnly = true)
    fun getJobOffersByEmployerId(employerId: Long, page: Int, size: Int): JobOfferManagementPageResponse {
        return getJobOffersWithFilters(
            status = null,
            interviewStatus = null,
            keyword = null,
            employerId = employerId,
            jobSeekerId = null,
            jobId = null,
            resumeId = null,
            startDate = null,
            endDate = null,
            page = page,
            size = size
        )
    }

    /**
     * 구직자 ID로 채용 제안 조회
     */
    @Transactional(readOnly = true)
    fun getJobOffersByJobSeekerId(jobSeekerId: Long, page: Int, size: Int): JobOfferManagementPageResponse {
        return getJobOffersWithFilters(
            status = null,
            interviewStatus = null,
            keyword = null,
            employerId = null,
            jobSeekerId = jobSeekerId,
            jobId = null,
            resumeId = null,
            startDate = null,
            endDate = null,
            page = page,
            size = size
        )
    }

    /**
     * 채용공고 ID로 채용 제안 조회
     */
    @Transactional(readOnly = true)
    fun getJobOffersByJobId(jobId: Long, page: Int, size: Int): JobOfferManagementPageResponse {
        return getJobOffersWithFilters(
            status = null,
            interviewStatus = null,
            keyword = null,
            employerId = null,
            jobSeekerId = null,
            jobId = jobId,
            resumeId = null,
            startDate = null,
            endDate = null,
            page = page,
            size = size
        )
    }

    @Transactional(readOnly = true)
    fun getJobOffersByResumeId(resumeId: Long, page: Int, size: Int): JobOfferManagementPageResponse {
        return getJobOffersWithFilters(
            status = null,
            interviewStatus = null,
            keyword = null,
            employerId = null,
            jobSeekerId = null,
            jobId = null,
            resumeId = resumeId,
            startDate = null,
            endDate = null,
            page = page,
            size = size
        )
    }
}