package com.yourjob.backend.repository.mdms

import com.yourjob.backend.entity.mdms.CommunityPostManagement
import com.yourjob.backend.entity.mdms.PostStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface CommunityPostManagementRepository : JpaRepository<CommunityPostManagement, Long> {

    /**
     * 상태별 게시글 조회
     */
    fun findAllByStatus(status: PostStatus, pageable: Pageable): Page<CommunityPostManagement>

    /**
     * 카테고리별 게시글 조회
     */
    fun findAllByCategoryId(categoryId: Long, pageable: Pageable): Page<CommunityPostManagement>

    /**
     * 상태 및 카테고리별 게시글 조회
     */
    fun findAllByStatusAndCategoryId(status: PostStatus, categoryId: Long, pageable: Pageable): Page<CommunityPostManagement>

    /**
     * 키워드로 게시글 검색 (제목, 내용, 작성자명으로 검색)
     */
    @Query("""
        SELECT p FROM CommunityPostManagement p
        WHERE (:keyword IS NULL OR 
               p.title LIKE %:keyword% OR 
               p.content LIKE %:keyword% OR
               p.writer LIKE %:keyword%)
        AND (:status IS NULL OR p.status = :status)
        AND (:categoryId IS NULL OR p.categoryId = :categoryId)
        AND (:startDate IS NULL OR p.createdAt >= :startDate)
        AND (:endDate IS NULL OR p.createdAt <= :endDate)
        ORDER BY p.createdAt DESC
    """)
    fun searchPosts(
        @Param("keyword") keyword: String?,
        @Param("status") status: PostStatus?,
        @Param("categoryId") categoryId: Long?,
        @Param("startDate") startDate: LocalDateTime?,
        @Param("endDate") endDate: LocalDateTime?,
        pageable: Pageable
    ): Page<CommunityPostManagement>

    /**
     * 게시글 상태 일괄 변경
     */
    @Modifying
    @Query("UPDATE CommunityPostManagement p SET p.status = :status WHERE p.postId IN :ids")
    fun updateStatusByIds(@Param("ids") ids: List<Long>, @Param("status") status: PostStatus): Int

    /**
     * 게시글 조회수 증가
     */
    @Modifying
    @Query("UPDATE CommunityPostManagement p SET p.views = p.views + 1 WHERE p.postId = :id")
    fun incrementViews(@Param("id") id: Long): Int

    /**
     * 게시글 좋아요 수 증가
     */
    @Modifying
    @Query("UPDATE CommunityPostManagement p SET p.likes = p.likes + 1 WHERE p.postId = :id")
    fun incrementLikes(@Param("id") id: Long): Int
}