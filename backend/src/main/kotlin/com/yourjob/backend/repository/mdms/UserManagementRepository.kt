package com.yourjob.backend.repository.mdms

import com.yourjob.backend.entity.UserType
import com.yourjob.backend.entity.mdms.UserManagement
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface UserManagementRepository : JpaRepository<UserManagement, Long> {

    fun findByAccountId(accountId: String): UserManagement?
    fun findByUserId(userId: Long): UserManagement?
    fun findAllByAccountIdIn(accountIds: List<String>): List<UserManagement>?
    fun findAllByUserIdIn(userIds: List<Long>): List<UserManagement>?

}