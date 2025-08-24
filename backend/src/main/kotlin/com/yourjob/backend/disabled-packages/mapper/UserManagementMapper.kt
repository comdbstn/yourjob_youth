package com.yourjob.backend.mapper.mdms

import com.yourjob.backend.entity.mdms.UserManagementCreateDto
import com.yourjob.backend.entity.mdms.UserManagementUpdateDto
import org.apache.ibatis.annotations.*
import org.springframework.stereotype.Repository

@Repository
@Mapper
interface UserManagementMapper {

    fun insertUser(userDto: UserManagementCreateDto): Int

    fun updateUser(@Param("userId") userId: Long, @Param("dto") userDto: UserManagementUpdateDto): Int

    fun deleteUser(@Param("userId") userId: Long): Int

    fun deleteUsers(@Param("userIds") userIds: List<Long>): Int
}