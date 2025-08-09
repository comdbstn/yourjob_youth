package com.yourjob.backend.repository.editor

import com.yourjob.backend.entity.editor.EditorContent
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface EditorContentRepository : JpaRepository<EditorContent, Long> {
    fun findByContentId(contentId: String): EditorContent?

    @Query("SELECT e FROM EditorContent e WHERE (:keyword IS NULL OR e.title LIKE %:keyword% OR e.content LIKE %:keyword%) AND (:status IS NULL OR e.status = :status)")
    fun findByFilters(
        @Param("keyword") keyword: String?,
        @Param("status") status: String?,
        pageable: Pageable
    ): Page<EditorContent>

    fun findAllByStatus(status: String, pageable: Pageable): Page<EditorContent>

    fun findAllByOrderByCreatedAtDesc(): List<EditorContent>
}