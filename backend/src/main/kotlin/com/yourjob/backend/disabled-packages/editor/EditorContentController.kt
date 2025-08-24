package com.yourjob.backend.controller.editor

import com.yourjob.backend.entity.editor.EditorContentRequest
import com.yourjob.backend.entity.editor.EditorContentResponse
import com.yourjob.backend.entity.editor.EditorContentUpdateRequest
import com.yourjob.backend.entity.editor.SummernoteImageUploadResponse
import com.yourjob.backend.service.editor.EditorContentService
import com.yourjob.backend.util.FileUtils
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDate

@RestController
@RequestMapping("/api/v1/editor")
class EditorContentController(
    private val editorContentService: EditorContentService,
    private val fileUtils: FileUtils
) {

    @GetMapping
    fun getAllEditorContents(
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false) keyword: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<Any> {
        // 필터링 파라미터가 있는 경우
        if (status != null || keyword != null) {
            val pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"))
            val contentsPage = editorContentService.getFilteredEditorContents(
                keyword, status, pageRequest
            )
            return ResponseEntity.ok(contentsPage)
        }
        // 필터링 없이 전체 조회 (페이징 적용)
        else if (page > 0 || size != 10) {
            val pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"))
            val contentsPage = editorContentService.getAllEditorContentsPaged(pageRequest)
            return ResponseEntity.ok(contentsPage)
        }
        // 필터링 없이 전체 조회 (페이징 없음)
        else {
            return ResponseEntity.ok(editorContentService.getAllEditorContents())
        }
    }

    @GetMapping("/{id}")
    fun getEditorContentById(@PathVariable id: Long): ResponseEntity<EditorContentResponse> {
        val content = editorContentService.getEditorContentById(id) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(content)
    }

    @GetMapping("/content-id/{contentId}")
    fun getEditorContentByContentId(@PathVariable contentId: String): ResponseEntity<EditorContentResponse> {
        val content = editorContentService.getEditorContentByContentId(contentId) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(content)
    }

    @PostMapping
    fun createEditorContent(@RequestBody request: EditorContentRequest): ResponseEntity<EditorContentResponse> {
        return ResponseEntity.status(HttpStatus.CREATED).body(editorContentService.createEditorContent(request))
    }

    @PutMapping("/{id}")
    fun updateEditorContent(
        @PathVariable id: Long,
        @RequestBody request: EditorContentUpdateRequest
    ): ResponseEntity<EditorContentResponse> {
        val content = editorContentService.updateEditorContent(id, request) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(content)
    }

    @DeleteMapping("/{id}")
    fun deleteEditorContent(@PathVariable id: Long): ResponseEntity<Void> {
        editorContentService.deleteEditorContent(id)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/bulk")
    fun bulkDeleteEditorContents(@RequestBody request: Map<String, List<Long>>): ResponseEntity<Map<String, Any>> {
        val ids = request["ids"] ?: return ResponseEntity.badRequest().body(mapOf("error" to "IDs are required"))
        val count = editorContentService.bulkDeleteEditorContents(ids)
        return ResponseEntity.ok(mapOf("deletedCount" to count))
    }

    // Summernote 이미지 업로드 엔드포인트 - S3 스토리지 사용
    @PostMapping("/upload/image")
    fun uploadSummernoteImage(@RequestParam("file") file: MultipartFile): ResponseEntity<SummernoteImageUploadResponse> {
        // 파일 저장 처리
        val rootPath = "uploads"
        val type = "summernote"
        val yearDate = LocalDate.now().toString()

        // FileUtils를 사용하여 파일 저장 및 UUID 얻기
        val uuid = fileUtils.fileSave(rootPath, type, yearDate, file)

        // 이미지 URL 생성 (S3 또는 로컬 경로)
        val imageUrl = fileUtils.getFileUrl(rootPath, type, yearDate, uuid, file.originalFilename ?: "unnamed")

        return ResponseEntity.ok(SummernoteImageUploadResponse(url = imageUrl))
    }
}