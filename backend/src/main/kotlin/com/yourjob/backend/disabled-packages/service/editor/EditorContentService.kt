package com.yourjob.backend.service.editor

import com.yourjob.backend.entity.editor.EditorContent
import com.yourjob.backend.entity.editor.EditorContentRequest
import com.yourjob.backend.entity.editor.EditorContentResponse
import com.yourjob.backend.entity.editor.EditorContentUpdateRequest
import com.yourjob.backend.entity.editor.SummernoteImageUploadResponse
import com.yourjob.backend.repository.editor.EditorContentRepository
import com.yourjob.backend.util.FileUtils
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

@Service
class EditorContentService(
    private val editorContentRepository: EditorContentRepository,
    private val fileUtils: FileUtils
) {

    @Transactional(readOnly = true)
    fun getAllEditorContents(): List<EditorContentResponse> {
        return editorContentRepository.findAllByOrderByCreatedAtDesc().map { EditorContentResponse.fromEntity(it) }
    }

    @Transactional(readOnly = true)
    fun getAllEditorContentsPaged(pageable: Pageable): Page<EditorContentResponse> {
        return editorContentRepository.findAll(pageable).map { EditorContentResponse.fromEntity(it) }
    }

    @Transactional(readOnly = true)
    fun getFilteredEditorContents(
        keyword: String?,
        status: String?,
        pageable: Pageable
    ): Page<EditorContentResponse> {
        return editorContentRepository.findByFilters(keyword, status, pageable)
            .map { EditorContentResponse.fromEntity(it) }
    }

    @Transactional(readOnly = true)
    fun getEditorContentById(id: Long): EditorContentResponse? {
        val content = editorContentRepository.findById(id).orElse(null) ?: return null
        return EditorContentResponse.fromEntity(content)
    }

    @Transactional(readOnly = true)
    fun getEditorContentByContentId(contentId: String): EditorContentResponse? {
        val content = editorContentRepository.findByContentId(contentId) ?: return null
        return EditorContentResponse.fromEntity(content)
    }

    @Transactional
    fun createEditorContent(request: EditorContentRequest): EditorContentResponse {
        val contentId = UUID.randomUUID().toString()

        val editorContent = EditorContent(
            contentId = contentId,
            title = request.title,
            content = request.content,
            description = request.description,
            status = request.status,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )

        val savedContent = editorContentRepository.save(editorContent)
        return EditorContentResponse.fromEntity(savedContent)
    }

    @Transactional
    fun updateEditorContent(id: Long, request: EditorContentUpdateRequest): EditorContentResponse? {
        val existingContent = editorContentRepository.findById(id).orElse(null) ?: return null

        // 값이 있는 필드만 업데이트
        request.title?.let { existingContent.title = it }
        request.content?.let { existingContent.content = it }
        request.description?.let { existingContent.description = it }
        request.status?.let { existingContent.status = it }

        existingContent.updatedAt = LocalDateTime.now()

        val updatedContent = editorContentRepository.save(existingContent)
        return EditorContentResponse.fromEntity(updatedContent)
    }

    @Transactional
    fun deleteEditorContent(id: Long) {
        editorContentRepository.deleteById(id)
    }

    @Transactional
    fun uploadSummernoteImage(file: MultipartFile): SummernoteImageUploadResponse {
        val rootPath = "uploads"
        val type = "summernote"
        val yearDate = LocalDate.now().toString()

        // FileUtils를 사용하여 파일 저장 및 UUID 얻기
        val uuid = fileUtils.fileSave(rootPath, type, yearDate, file)

        // 이미지 URL 생성
        val imageUrl = fileUtils.getFileUrl(rootPath, type, yearDate, uuid, file.originalFilename ?: "unnamed")

        return SummernoteImageUploadResponse(url = imageUrl)
    }

    @Transactional
    fun bulkDeleteEditorContents(ids: List<Long>): Int {
        var deletedCount = 0
        ids.forEach { id ->
            try {
                editorContentRepository.deleteById(id)
                deletedCount++
            } catch (e: Exception) {
                // 로그 처리 (실패한 ID에 대한 정보)
            }
        }
        return deletedCount
    }
}