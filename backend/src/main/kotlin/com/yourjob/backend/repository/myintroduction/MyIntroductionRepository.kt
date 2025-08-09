package com.yourjob.backend.repository.myintroduction

import com.yourjob.backend.entity.myintroduction.MyIntroduction
import com.yourjob.backend.entity.myintroduction.MyIntroductionQuestionAnswer
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface MyIntroductionRepository : JpaRepository<MyIntroduction, Long> {
    fun findByUserId(userId: Long): List<MyIntroduction>

    fun findByUserIdOrderByCreatedAtDesc(userId: Long): List<MyIntroduction>

    fun findByUserIdAndIsFinished(userId: Long, isFinished: Boolean): List<MyIntroduction>

    @Query("SELECT mi FROM MyIntroduction mi WHERE mi.userId = :userId " +
            "AND (:title IS NULL OR mi.title LIKE %:title%) " +
            "AND (:isFinished IS NULL OR mi.isFinished = :isFinished)")
    fun findByUserIdAndSearchConditions(
        @Param("userId") userId: Long,
        @Param("title") title: String?,
        @Param("isFinished") isFinished: Boolean?,
        pageable: Pageable
    ): Page<MyIntroduction>
}

@Repository
interface MyIntroductionQuestionAnswerRepository : JpaRepository<MyIntroductionQuestionAnswer, Long> {
    fun findByMyIntroductionMyIntroductionId(myIntroductionId: Long): List<MyIntroductionQuestionAnswer>

    fun findByMyIntroductionMyIntroductionIdOrderByQuestionIdx(myIntroductionId: Long): List<MyIntroductionQuestionAnswer>

    fun deleteByMyIntroductionMyIntroductionId(myIntroductionId: Long)
}