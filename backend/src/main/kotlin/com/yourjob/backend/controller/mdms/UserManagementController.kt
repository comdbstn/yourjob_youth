package com.yourjob.backend.controller.mdms

import com.yourjob.backend.entity.mdms.UserManagementCreateDto
import com.yourjob.backend.entity.mdms.UserManagementDto
import com.yourjob.backend.entity.mdms.UserManagementPageResponse
import com.yourjob.backend.entity.mdms.UserManagementUpdateDto
import com.yourjob.backend.service.mdms.UserManagementService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/mdms/user-management")
class UserManagementController(
    private val userManagementService: UserManagementService
) {

    /**
     * 사용자 정보 페이징 조회
     */
    @GetMapping
    fun getUsers(
        @RequestParam(value = "page", defaultValue = "0") page: Int,
        @RequestParam(value = "size", defaultValue = "10") size: Int,
        @RequestParam(value = "userType", required = false) userType: String?,
        @RequestParam(value = "email", required = false) email: String?,
        @RequestParam(value = "keyword", required = false) keyword: String?,
        @RequestParam(value = "isActive", required = false) isActive: Boolean?,
        @RequestParam(value = "isBanned", required = false) isBanned: Boolean?
    ): ResponseEntity<UserManagementPageResponse> {
        val response = userManagementService.getUsersWithFilters(
            userType, email, keyword, isActive, isBanned, page, size
        )
        return ResponseEntity.ok(response)
    }

    /**
     * 사용자 정보 단건 조회
     */
    @GetMapping("/{id}")
    fun getUser(@PathVariable id: Long): ResponseEntity<UserManagementDto> {
        val user = userManagementService.getUserById(id)
        return if (user != null) {
            ResponseEntity.ok(user)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * 사용자 활성화 상태 변경
     */
    @PutMapping("/{id}/active")
    fun updateUserActiveStatus(
        @PathVariable id: Long,
        @RequestParam("isActive") isActive: Boolean
    ): ResponseEntity<Map<String, Any>> {
        val success = userManagementService.updateUserStatus(id, isActive)
        val actionText = if (isActive) "활성화" else "비활성화"

        return ResponseEntity.ok(
            mapOf(
                "success" to success,
                "message" to if (success) "사용자가 ${actionText}되었습니다." else "사용자 ${actionText} 중 오류가 발생했습니다."
            )
        )
    }

    /**
     * 사용자 차단 상태 변경
     */
    @PutMapping("/{id}/ban")
    fun updateUserBanStatus(
        @PathVariable id: Long,
        @RequestParam("isBanned") isBanned: Boolean
    ): ResponseEntity<Map<String, Any>> {
        val success = userManagementService.updateUserBanStatus(id, isBanned)
        val actionText = if (isBanned) "차단" else "차단 해제"

        return ResponseEntity.ok(
            mapOf(
                "success" to success,
                "message" to if (success) "사용자가 ${actionText}되었습니다." else "사용자 ${actionText} 중 오류가 발생했습니다."
            )
        )
    }

    /**
     * 다수 사용자 활성화 상태 변경
     */
    @PutMapping("/bulk-active")
    fun bulkUpdateActiveStatus(
        @RequestParam("isActive") isActive: Boolean,
        @RequestBody userIds: List<Long>
    ): ResponseEntity<Map<String, Any>> {
        val updatedCount = userManagementService.updateUsersStatus(userIds, isActive)
        val actionText = if (isActive) "활성화" else "비활성화"

        return ResponseEntity.ok(
            mapOf(
                "success" to true,
                "message" to "${updatedCount}명의 사용자가 ${actionText}되었습니다.",
                "updatedCount" to updatedCount
            )
        )
    }

    /**
     * 다수 사용자 차단 상태 변경
     */
    @PutMapping("/bulk-ban")
    fun bulkUpdateBanStatus(
        @RequestParam("isBanned") isBanned: Boolean,
        @RequestBody userIds: List<Long>
    ): ResponseEntity<Map<String, Any>> {
        val updatedCount = userManagementService.updateUsersBanStatus(userIds, isBanned)
        val actionText = if (isBanned) "차단" else "차단 해제"

        return ResponseEntity.ok(
            mapOf(
                "success" to true,
                "message" to "${updatedCount}명의 사용자가 ${actionText}되었습니다.",
                "updatedCount" to updatedCount
            )
        )
    }

    /**
     * 사용자 정보 수정
     */
    @PutMapping("/{id}")
    fun updateUser(
        @PathVariable id: Long,
        @RequestBody userDto: UserManagementUpdateDto
    ): ResponseEntity<Map<String, Any>> {
        val success = userManagementService.updateUser(id, userDto)

        return ResponseEntity.ok(
            mapOf(
                "success" to success,
                "message" to if (success) "회원 정보가 수정되었습니다." else "회원 정보 수정 중 오류가 발생했습니다."
            )
        )
    }

    /**
     * 사용자 삭제
     */
    @DeleteMapping("/{id}")
    fun deleteUser(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        val success = userManagementService.deleteUser(id)

        return ResponseEntity.ok(
            mapOf(
                "success" to success,
                "message" to if (success) "사용자가 삭제되었습니다." else "사용자 삭제 중 오류가 발생했습니다."
            )
        )
    }

    /**
     * 다수 사용자 삭제
     */
    @DeleteMapping("/bulk-delete")
    fun bulkDeleteUsers(@RequestBody userIds: List<Long>): ResponseEntity<Map<String, Any>> {
        val deletedCount = userManagementService.deleteUsers(userIds)

        return ResponseEntity.ok(
            mapOf(
                "success" to true,
                "message" to "${deletedCount}명의 사용자가 삭제되었습니다.",
                "deletedCount" to deletedCount
            )
        )
    }

    /**
     * 사용자 등록
     */
    @PostMapping
    fun createUser(@RequestBody userDto: UserManagementCreateDto): ResponseEntity<Map<String, Any>> {
        val userId = userManagementService.createUser(userDto)

        return ResponseEntity.ok(
            mapOf(
                "success" to (userId != null),
                "message" to if (userId != null) "회원이 등록되었습니다." else "회원 등록 중 오류가 발생했습니다.",
                "userId" to (userId ?: 0)  // null일 경우 0으로 처리
            )
        )
    }
}