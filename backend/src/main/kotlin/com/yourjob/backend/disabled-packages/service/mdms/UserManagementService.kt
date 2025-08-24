package com.yourjob.backend.service.mdms

import com.yourjob.backend.entity.mdms.*
import com.yourjob.backend.mapper.mdms.UserManagementMapper
import com.yourjob.backend.repository.mdms.UserManagementRepository
import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserManagementService(
    private val userManagementRepository: UserManagementRepository,
    private val userManagementMapper: UserManagementMapper
) {
    @PersistenceContext
    private lateinit var entityManager: EntityManager

    /**
     * 필터링 조건에 따라 사용자 정보 목록을 페이징하여 조회합니다.
     */
    @Transactional(readOnly = true)
    fun getUsersWithFilters(
        userType: String?,
        email: String?,
        keyword: String?,
        isActive: Boolean?,
        isBanned: Boolean?,
        page: Int,
        size: Int
    ): UserManagementPageResponse {
        // 유효한 필터 값 처리
        val validUserType = if (userType.isNullOrBlank()) null else userType
        val validEmail = if (email.isNullOrBlank()) null else email
        val validKeyword = if (keyword.isNullOrBlank()) null else keyword

        // 페이징 처리
        //val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "userId"))

        // Native SQL 쿼리 구성
        val sqlQuery = """
            SELECT
                user_id as id,
                user_type as userType,
                email,
                name,
                phone,
                account_id as accountId,
                company_name as companyName,
                corpthmb_imgidx as corpthmbImgidx,
                is_active as isActive,
                is_banned as isBanned,
                DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as createdAt,
                DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i') as updatedAt
            FROM users
            WHERE 1=1
        """.trimIndent()

        // WHERE 조건 추가
        val whereClauseSql = StringBuilder()
        val parameters = mutableMapOf<String, Any>()

        if (!validUserType.isNullOrBlank()) {
            whereClauseSql.append(" AND user_type = :userType")
            parameters["userType"] = validUserType
        }

        if (!validEmail.isNullOrBlank()) {
            whereClauseSql.append(" AND email LIKE :email")
            parameters["email"] = "%$validEmail%"
        }

        if (!validKeyword.isNullOrBlank()) {
            whereClauseSql.append("""
                AND (
                    email LIKE :keyword OR
                    name LIKE :keyword OR
                    company_name LIKE :keyword OR
                    account_id LIKE :keyword
                )
            """)
            parameters["keyword"] = "%$validKeyword%"
        }

        if (isActive != null) {
            whereClauseSql.append(" AND is_active = :isActive")
            parameters["isActive"] = if (isActive) 1 else 0
        }

        if (isBanned != null) {
            whereClauseSql.append(" AND is_banned = :isBanned")
            parameters["isBanned"] = if (isBanned) 1 else 0
        }

        // 정렬 추가
        //val orderBy = " ORDER BY created_At DESC"
        val orderBy = " ORDER BY user_id DESC"

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
            UserManagementDto(
                id = (row[0] as Number).toLong(),
                userType = row[1] as String? ?: "",
                email = row[2] as String? ?: "",
                name = row[3] as String?,
                phone = row[4] as String?,
                accountId = row[5] as String?,
                companyName = row[6] as String?,
                corpthmbImgidx = (row[7] as Number?)?.toLong(),
                isActive = row[8] as Boolean?,
                isBanned = row[9] as Boolean?,
                createdAt = row[10] as String? ?: "",
                updatedAt = row[11] as String?
            )
        }

        val usersPage = PageImpl(dtoList, pageable, totalCount)

        // 페이징 응답 생성
        return UserManagementPageResponse(
            content = dtoList,
            page = page,
            size = size,
            totalElements = usersPage.totalElements,
            totalPages = usersPage.totalPages,
            number = usersPage.number,
            first = usersPage.isFirst,
            last = usersPage.isLast,
            numberOfElements = usersPage.numberOfElements,
            empty = usersPage.isEmpty
        )
    }

    /**
     * 사용자 정보를 개별 ID로 조회합니다.
     */
    @Transactional(readOnly = true)
    fun getUserById(userId: Long): UserManagementDto? {
        val sqlQuery = """
            SELECT
                user_id as id,
                user_type as userType,
                email,
                name,
                phone,
                account_id as accountId,
                company_name as companyName,
                corpthmb_imgidx as corpthmbImgidx,
                is_active as isActive,
                is_banned as isBanned,
                DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as createdAt,
                DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i') as updatedAt
            FROM users
            WHERE user_id = :id
        """.trimIndent()

        val query = entityManager.createNativeQuery(sqlQuery)
        query.setParameter("id", userId)

        return try {
            val result = query.singleResult as Array<Any?>

            UserManagementDto(
                id = (result[0] as Number).toLong(),
                userType = result[1] as String? ?: "",
                email = result[2] as String? ?: "",
                name = result[3] as String?,
                phone = result[4] as String?,
                accountId = result[5] as String?,
                companyName = result[6] as String?,
                corpthmbImgidx = (result[7] as Number?)?.toLong(),
                isActive = result[8] as Boolean?,
                isBanned = result[9] as Boolean?,
                createdAt = result[10] as String? ?: "",
                updatedAt = result[11] as String?
            )
        } catch (e: Exception) {
            // 결과가 없는 경우 null 반환
            null
        }
    }

    /**
     * 사용자 상태를 변경합니다 (활성화/비활성화).
     */
    @Transactional
    fun updateUserStatus(userId: Long, isActive: Boolean): Boolean {
        val sqlQuery = """
            UPDATE users
            SET is_active = :isActive,
                updated_at = NOW()
            WHERE user_id = :id
        """.trimIndent()

        val query = entityManager.createNativeQuery(sqlQuery)
        query.setParameter("id", userId)
        query.setParameter("isActive", if (isActive) 1 else 0)

        return try {
            val updatedRows = query.executeUpdate()
            updatedRows > 0
        } catch (e: Exception) {
            false
        }
    }

    /**
     * 사용자 차단 상태를 변경합니다.
     */
    @Transactional
    fun updateUserBanStatus(userId: Long, isBanned: Boolean): Boolean {
        val sqlQuery = """
            UPDATE users
            SET is_banned = :isBanned,
                updated_at = NOW()
            WHERE user_id = :id
        """.trimIndent()

        val query = entityManager.createNativeQuery(sqlQuery)
        query.setParameter("id", userId)
        query.setParameter("isBanned", if (isBanned) 1 else 0)

        return try {
            val updatedRows = query.executeUpdate()
            updatedRows > 0
        } catch (e: Exception) {
            false
        }
    }

    /**
     * 여러 사용자의 상태를 변경합니다.
     */
    @Transactional
    fun updateUsersStatus(userIds: List<Long>, isActive: Boolean): Int {
        var successCount = 0

        userIds.forEach { userId ->
            if (updateUserStatus(userId, isActive)) {
                successCount++
            }
        }

        return successCount
    }

    /**
     * 여러 사용자의 차단 상태를 변경합니다.
     */
    @Transactional
    fun updateUsersBanStatus(userIds: List<Long>, isBanned: Boolean): Int {
        var successCount = 0

        userIds.forEach { userId ->
            if (updateUserBanStatus(userId, isBanned)) {
                successCount++
            }
        }

        return successCount
    }

    /**
     * 사용자 정보를 수정합니다.
     */
    @Transactional
    fun updateUser(userId: Long, userDto: UserManagementUpdateDto): Boolean {
        return try {
            val updateCount = userManagementMapper.updateUser(userId, userDto)
            updateCount > 0
        } catch (e: Exception) {
            false
        }
    }

    /**
     * 새 사용자를 생성합니다.
     */
    @Transactional
    fun createUser(userDto: UserManagementCreateDto): Long? {
        return try {
            val insertCount = userManagementMapper.insertUser(userDto)
            if (insertCount > 0) {
                userDto.userId
            } else {
                null
            }
        } catch (e: Exception) {
            null
        }
    }

    /**
     * 사용자를 삭제합니다.
     */
    @Transactional
    fun deleteUser(userId: Long): Boolean {
        return try {
            val deleteCount = userManagementMapper.deleteUser(userId)
            deleteCount > 0
        } catch (e: Exception) {
            false
        }
    }

    /**
     * 여러 사용자를 삭제합니다.
     */
    @Transactional
    fun deleteUsers(userIds: List<Long>): Int {
        return try {
            if (userIds.isEmpty()) 0
            else userManagementMapper.deleteUsers(userIds)
        } catch (e: Exception) {
            0
        }
    }
}