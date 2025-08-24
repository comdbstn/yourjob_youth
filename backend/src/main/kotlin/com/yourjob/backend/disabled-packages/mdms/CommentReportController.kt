package com.yourjob.backend.controller

import com.yourjob.backend.entity.CommunityCommentCreate
import com.yourjob.backend.entity.CommentReportItem
import com.yourjob.backend.service.CommunityService
import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/api/v1/community")
class CommentReportController(private val communityService: CommunityService) {

    data class PageResponse<T>(
        val content: List<T>,
        val totalElements: Int,
        val totalPages: Int,
        val number: Int,
        val size: Int
    )

    data class BulkDeleteRequest(val reportIds: List<Int>)

    data class CommentDeleteRequest(
        val reportId: Int,
        val commentId: Int
    )

    data class ApiResponse(
        val success: Boolean,
        val message: String
    )

    @GetMapping("/comment-reports")
    fun getCommentReports(
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false) keyword: String?,
        @RequestParam(required = false) status: String?
    ): ResponseEntity<PageResponse<CommentReportItem>> {
        val offset = (page - 1) * size

        val params = mutableMapOf<String, Any>()
        params["offset"] = offset
        params["size"] = size

        if (!keyword.isNullOrEmpty()) {
            params["keyword"] = keyword
        }

        if (!status.isNullOrEmpty()) {
            params["status"] = status
        }

        val reports = communityService.selectCommentReports(params)
        val totalCount = communityService.selectCommentReportsCount(params)
        val totalPages = if (totalCount % size == 0) totalCount / size else (totalCount / size) + 1

        val response = PageResponse(
            content = reports,
            totalElements = totalCount,
            totalPages = totalPages,
            number = page,
            size = size
        )

        return ResponseEntity(response, HttpStatus.OK)
    }

    @PutMapping("/comment-reports/{reportId}/complete")
    fun completeCommentReport(
        @PathVariable reportId: Int,
        session: HttpSession
    ): ResponseEntity<ApiResponse> {

        try {
            val completeCount = communityService.completeCommentReport(reportId)
            return if (completeCount > 0) {
                ResponseEntity(
                    ApiResponse(true, "신고가 성공적으로 처리되었습니다"),
                    HttpStatus.OK
                )
            } else {
                ResponseEntity(
                    ApiResponse(false, "처리할 신고 내역을 찾을 수 없습니다"),
                    HttpStatus.NOT_FOUND
                )
            }
        } catch (e: Exception) {
            return ResponseEntity(
                ApiResponse(false, "처리 중 오류가 발생했습니다: ${e.message}"),
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @DeleteMapping("/comment-reports/{reportId}")
    fun deleteCommentReport(
        @PathVariable reportId: Int,
        session: HttpSession
    ): ResponseEntity<ApiResponse> {

        try {
            val deleteCount = communityService.deleteCommentReport(reportId)
            return if (deleteCount > 0) {
                ResponseEntity(
                    ApiResponse(true, "신고 내역이 성공적으로 삭제되었습니다"),
                    HttpStatus.OK
                )
            } else {
                ResponseEntity(
                    ApiResponse(false, "삭제할 신고 내역을 찾을 수 없습니다"),
                    HttpStatus.NOT_FOUND
                )
            }
        } catch (e: Exception) {
            return ResponseEntity(
                ApiResponse(false, "삭제 중 오류가 발생했습니다: ${e.message}"),
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @DeleteMapping("/comment-reports/bulk-delete")
    fun bulkDeleteCommentReports(
        @RequestBody request: BulkDeleteRequest,
        session: HttpSession
    ): ResponseEntity<ApiResponse> {

        try {
            if (request.reportIds.isEmpty()) {
                return ResponseEntity(
                    ApiResponse(false, "삭제할 항목이 지정되지 않았습니다"),
                    HttpStatus.BAD_REQUEST
                )
            }

            val deleteCount = communityService.bulkDeleteCommentReports(request.reportIds)
            return ResponseEntity(
                ApiResponse(true, "신고 내역이 삭제되었습니다"),
                HttpStatus.OK
            )
        } catch (e: Exception) {
            return ResponseEntity(
                ApiResponse(false, "일괄 삭제 중 오류가 발생했습니다: ${e.message}"),
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @PostMapping("/posts/comments/delete-by-admin")
    fun deleteCommentByAdmin(
        @RequestBody request: CommentDeleteRequest,
        session: HttpSession
    ): ResponseEntity<ApiResponse> {

        try {
            // 댓글 존재 여부 확인
            val comment = communityService.selectCommunityCommentDetail(request.commentId)

            // 댓글이 존재하지 않는 경우 (이미 삭제된 경우)
            if (comment == null || comment.id == 0) {
                // 신고를 처리 완료로 변경
                communityService.completeCommentReport(request.reportId)
                return ResponseEntity(
                    ApiResponse(true, "댓글이 이미 삭제된 상태입니다. 신고를 처리 완료로 변경합니다."),
                    HttpStatus.OK
                )
            }

            // 댓글 삭제를 위한 요청 객체 생성
            val commentDeleteRequest = CommunityCommentCreate().apply {
                id = request.commentId
                commentId = request.commentId
                // 사용자 ID와 작성자는 실제 값으로 설정
                userId = (userId as? Int) ?: 0 // null이면 0으로 기본값 설정
                writer = session.getAttribute("userName")?.toString() ?: ""
            }

            // 댓글 삭제 처리
            val deleteResult = communityService.deleteCommunityComment(commentDeleteRequest)

            // 댓글 삭제 후 신고 완료 처리
            if (deleteResult > 0) {
                communityService.completeCommentReport(request.reportId)
                return ResponseEntity(
                    ApiResponse(true, "댓글이 성공적으로 삭제되었습니다"),
                    HttpStatus.OK
                )
            } else {
                return ResponseEntity(
                    ApiResponse(false, "댓글 삭제에 실패했습니다"),
                    HttpStatus.INTERNAL_SERVER_ERROR
                )
            }
        } catch (e: Exception) {
            return ResponseEntity(
                ApiResponse(false, "댓글 삭제 중 오류가 발생했습니다: ${e.message}"),
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}