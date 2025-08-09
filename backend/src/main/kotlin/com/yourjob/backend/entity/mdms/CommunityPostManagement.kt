package com.yourjob.backend.entity.mdms

import java.time.LocalDateTime
import jakarta.persistence.*

/**
 * 커뮤니티 게시글 관리를 위한 Entity
 */
@Entity
@Table(name = "community_posts")
data class CommunityPostManagement(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    val postId: Long = 0,

    @Column(name = "user_id")
    val userId: Long,

    @Column(name = "category_id")
    val categoryId: Long,

    @Column(name = "type")
    val type: String,

    @Column(name = "title")
    val title: String,

    @Column(name = "writer")
    val writer: String,

    @Column(name = "content", columnDefinition = "TEXT")
    val content: String,

    @Column(name = "views")
    val views: Int = 0,

    @Column(name = "likes")
    val likes: Int = 0,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: LocalDateTime? = null,

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    val status: PostStatus = PostStatus.ACTIVE
)

/**
 * 게시글 상태 정보
 */
enum class PostStatus {
    ACTIVE,    // 노출
    INACTIVE,  // 비노출
    PENDING    // 대기
}

/**
 * 커뮤니티 게시글 DTO
 */
data class CommunityPostDto(
    val postId: Long,
    val userId: Long,
    val categoryId: Long,
    val categoryName: String?,
    val type: String,
    val title: String,
    val writer: String,
    val content: String,
    val views: Int,
    val likes: Int,
    val status: PostStatus,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime?
)

/**
 * 페이징된 게시글 응답을 위한 DTO
 */
data class CommunityPostPageResponse(
    val content: List<CommunityPostDto>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
    val number: Int,
    val first: Boolean,
    val last: Boolean,
    val numberOfElements: Int,
    val empty: Boolean
)