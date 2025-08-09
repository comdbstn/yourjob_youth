package com.yourjob.backend.mapper

import com.yourjob.backend.entity.User
import org.apache.ibatis.annotations.Mapper
import org.springframework.stereotype.Repository

@Repository
@Mapper
interface UserMapper {
    fun selectUserById(id: Int): User?
    fun insertUser(user: User): Int
    fun updateUser(user: User): Int
    fun deleteUser(id: Int): Int
}
