package com.yourjob.backend.service.mdms

import com.yourjob.backend.entity.mdms.CommunityPostDto
import com.yourjob.backend.entity.mdms.CommunityPostManagement
import com.yourjob.backend.entity.mdms.CommunityPostPageResponse
import com.yourjob.backend.entity.mdms.PostStatus
import com.yourjob.backend.repository.mdms.CommunityPostManagementRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

@Service
class CommunityPostManagementService(
    private val communityPostRepository: CommunityPostManagementRepository
) {

    /**
     * 게시글 페이징 조회
     */
    @Transactional(readOnly = true)
    fun getPostsWithFilters(
        categoryId: Long?,
        status: PostStatus?,
        keyword: String?,
        startDate: LocalDate?,
        endDate: LocalDate?,
        page: Int,
        size: Int
    ): CommunityPostPageResponse {
        val pageable: Pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))

        // 날짜 범위 설정
        val startDateTime = startDate?.atStartOfDay()
        val endDateTime = endDate?.atTime(LocalTime.MAX)

        val postsPage = communityPostRepository.searchPosts(
            keyword,
            status,
            categoryId,
            startDateTime,
            endDateTime,
            pageable
        )

        // DTO 변환 및 카테고리명 설정
        val postDtos = postsPage.content.map { convertToDto(it) }

        return CommunityPostPageResponse(
            content = postDtos,
            page = page,
            size = size,
            totalElements = postsPage.totalElements,
            totalPages = postsPage.totalPages,
            number = postsPage.number,
            first = postsPage.isFirst,
            last = postsPage.isLast,
            numberOfElements = postsPage.numberOfElements,
            empty = postsPage.isEmpty
        )
    }

    /**
     * 게시글 단건 조회
     */
    @Transactional(readOnly = true)
    fun getPostById(id: Long): CommunityPostDto? {
        val post = communityPostRepository.findById(id).orElse(null) ?: return null
        return convertToDto(post)
    }

    /**
     * 게시글 삭제
     */
    @Transactional
    fun deletePost(id: Long): Boolean {
        if (communityPostRepository.existsById(id)) {
            communityPostRepository.deleteById(id)
            return true
        }
        return false
    }

    /**
     * 게시글 일괄 삭제
     */
    @Transactional
    fun bulkDeletePosts(ids: List<Long>): Int {
        val postsToDelete = communityPostRepository.findAllById(ids)
        if (postsToDelete.isEmpty()) {
            return 0
        }

        communityPostRepository.deleteAll(postsToDelete)
        return postsToDelete.size
    }

    /**
     * 게시글 상태 변경
     */
    @Transactional
    fun updatePostStatus(id: Long, status: PostStatus): Boolean {
        val post = communityPostRepository.findById(id).orElse(null) ?: return false

        // 새로운 게시글 인스턴스 생성 (data class는 불변)
        val updatedPost = post.copy(
            status = status,
            updatedAt = LocalDateTime.now()
        )

        communityPostRepository.save(updatedPost)
        return true
    }

    /**
     * 게시글 상태 일괄 변경
     */
    @Transactional
    fun bulkUpdatePostStatus(ids: List<Long>, status: PostStatus): Int {
        return communityPostRepository.updateStatusByIds(ids, status)
    }

    /**
     * 게시글 조회수 증가
     */
    @Transactional
    fun incrementPostViews(id: Long): Boolean {
        return communityPostRepository.incrementViews(id) > 0
    }

    /**
     * 게시글 좋아요 수 증가
     */
    @Transactional
    fun incrementPostLikes(id: Long): Boolean {
        return communityPostRepository.incrementLikes(id) > 0
    }

    /**
     * Entity를 DTO로 변환
     */
    private fun convertToDto(post: CommunityPostManagement): CommunityPostDto {
        // 실제 구현에서는 카테고리 정보를 조회하여 설정
        val categoryName = getCategoryName(post.categoryId)

        return CommunityPostDto(
            postId = post.postId,
            userId = post.userId,
            categoryId = post.categoryId,
            categoryName = categoryName,
            type = post.type,
            title = post.title,
            writer = post.writer,
            content = post.content,
            views = post.views,
            likes = post.likes,
            status = post.status,
            createdAt = post.createdAt,
            updatedAt = post.updatedAt
        )
    }

    /**
     * 카테고리명 조회 (실제 구현에서는 카테고리 레포지토리를 사용하여 조회)
     */
    private fun getCategoryName(categoryId: Long): String {
        // 임시 구현: 실제로는 카테고리 레포지토리 사용
        return when (categoryId) {
            1L -> "미국"
            2L -> "유럽"
            3L -> "아시아"
            4L -> "오세아니아"
            0L -> "대기업 인사담당자 Q&A"
            else -> "기타"
        }
    }

    /**
     * 응답 메시지 생성
     */
    fun createResponseMessage(success: Boolean, action: String): Map<String, Any> {
        return mapOf(
            "success" to success,
            "message" to if (success) "성공적으로 ${action}되었습니다." else "${action} 중 오류가 발생했습니다."
        )
    }
}