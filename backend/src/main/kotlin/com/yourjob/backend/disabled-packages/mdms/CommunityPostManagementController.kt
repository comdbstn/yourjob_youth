package com.yourjob.backend.controller.mdms

import com.yourjob.backend.entity.mdms.CommunityPostDto
import com.yourjob.backend.entity.mdms.CommunityPostPageResponse
import com.yourjob.backend.entity.mdms.PostStatus
import com.yourjob.backend.service.mdms.CommunityPostManagementService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
@RequestMapping("/api/v1/mdms/community-management")
class CommunityPostManagementController(
    private val communityPostService: CommunityPostManagementService
) {

    /**
     * 게시글 페이징 조회
     */
    @GetMapping
    fun getPosts(
        @RequestParam(value = "page", defaultValue = "0") page: Int,
        @RequestParam(value = "size", defaultValue = "10") size: Int,
        @RequestParam(value = "categoryId", required = false) categoryId: Long?,
        @RequestParam(value = "status", required = false) status: String?,
        @RequestParam(value = "keyword", required = false) keyword: String?,
        @RequestParam(value = "startDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") startDate: LocalDate?,
        @RequestParam(value = "endDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") endDate: LocalDate?
    ): ResponseEntity<CommunityPostPageResponse> {
        val postStatus = status?.let { PostStatus.valueOf(it) }
        val response = communityPostService.getPostsWithFilters(
            categoryId, postStatus, keyword, startDate, endDate, page, size
        )
        return ResponseEntity.ok(response)
    }

    /**
     * 게시글 단건 조회
     */
    @GetMapping("/{id}")
    fun getPost(@PathVariable id: Long): ResponseEntity<CommunityPostDto> {
        val post = communityPostService.getPostById(id)
        return if (post != null) {
            ResponseEntity.ok(post)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * 게시글 단건 삭제
     */
    @DeleteMapping("/{id}")
    fun deletePost(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        val isDeleted = communityPostService.deletePost(id)
        return ResponseEntity.ok(communityPostService.createResponseMessage(isDeleted, "삭제"))
    }

    /**
     * 게시글 일괄 삭제
     */
    @DeleteMapping("/bulk-delete")
    fun bulkDeletePosts(@RequestBody ids: List<Long>): ResponseEntity<Map<String, Any>> {
        val count = communityPostService.bulkDeletePosts(ids)
        return ResponseEntity.ok(
            mapOf(
                "success" to (count > 0),
                "message" to "${count}개의 게시글이 삭제되었습니다.",
                "deletedCount" to count
            )
        )
    }

    /**
     * 게시글 상태 변경
     */
    @PutMapping("/{id}/status")
    fun updatePostStatus(
        @PathVariable id: Long,
        @RequestParam("status") status: String
    ): ResponseEntity<Map<String, Any>> {
        try {
            val postStatus = PostStatus.valueOf(status)
            val isUpdated = communityPostService.updatePostStatus(id, postStatus)

            val actionText = when (postStatus) {
                PostStatus.ACTIVE -> "노출"
                PostStatus.INACTIVE -> "비노출"
                PostStatus.PENDING -> "대기"
            }

            return ResponseEntity.ok(
                mapOf(
                    "success" to isUpdated,
                    "message" to if (isUpdated) "게시글이 ${actionText} 상태로 변경되었습니다." else "게시글 상태 변경 중 오류가 발생했습니다."
                )
            )
        } catch (e: IllegalArgumentException) {
            return ResponseEntity.badRequest().body(
                mapOf(
                    "success" to false,
                    "message" to "잘못된 상태 값입니다."
                )
            )
        }
    }

    /**
     * 게시글 상태 일괄 변경
     */
    @PutMapping("/bulk-status")
    fun bulkUpdatePostStatus(
        @RequestParam("status") status: String,
        @RequestBody ids: List<Long>
    ): ResponseEntity<Map<String, Any>> {
        try {
            val postStatus = PostStatus.valueOf(status)
            val count = communityPostService.bulkUpdatePostStatus(ids, postStatus)

            val actionText = when (postStatus) {
                PostStatus.ACTIVE -> "노출"
                PostStatus.INACTIVE -> "비노출"
                PostStatus.PENDING -> "대기"
            }

            return ResponseEntity.ok(
                mapOf(
                    "success" to (count > 0),
                    "message" to "${count}개의 게시글이 ${actionText} 상태로 변경되었습니다.",
                    "updatedCount" to count
                )
            )
        } catch (e: IllegalArgumentException) {
            return ResponseEntity.badRequest().body(
                mapOf(
                    "success" to false,
                    "message" to "잘못된 상태 값입니다."
                )
            )
        }
    }

    /**
     * 게시글 조회수 증가
     */
    @PutMapping("/{id}/views")
    fun incrementPostViews(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        val isUpdated = communityPostService.incrementPostViews(id)
        return ResponseEntity.ok(
            mapOf(
                "success" to isUpdated,
                "message" to if (isUpdated) "조회수가 증가되었습니다." else "조회수 증가 중 오류가 발생했습니다."
            )
        )
    }

    /**
     * 게시글 좋아요 수 증가
     */
    @PutMapping("/{id}/likes")
    fun incrementPostLikes(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        val isUpdated = communityPostService.incrementPostLikes(id)
        return ResponseEntity.ok(
            mapOf(
                "success" to isUpdated,
                "message" to if (isUpdated) "좋아요 수가 증가되었습니다." else "좋아요 수 증가 중 오류가 발생했습니다."
            )
        )
    }
}