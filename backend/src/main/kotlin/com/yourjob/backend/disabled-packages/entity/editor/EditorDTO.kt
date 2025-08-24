package com.yourjob.backend.entity.editor

import java.time.LocalDateTime

data class EditorContentRequest(
    val title: String,
    val content: String,
    val description: String? = null,
    val status: String = "ACTIVE"
)

data class EditorContentUpdateRequest(
    val title: String? = null,
    val content: String? = null,
    val description: String? = null,
    val status: String? = null
)

data class EditorContentResponse(
    val id: Long,
    val contentId: String,
    val title: String,
    val content: String,
    val description: String?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val status: String
) {
    companion object {
        fun fromEntity(entity: EditorContent): EditorContentResponse {
            return EditorContentResponse(
                id = entity.id,
                contentId = entity.contentId,
                title = entity.title,
                content = entity.content,
                description = entity.description,
                createdAt = entity.createdAt,
                updatedAt = entity.updatedAt,
                status = entity.status
            )
        }
    }
}

data class SummernoteImageUploadResponse(
    val url: String
)