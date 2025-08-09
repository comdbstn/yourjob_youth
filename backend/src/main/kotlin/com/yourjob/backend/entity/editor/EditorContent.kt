package com.yourjob.backend.entity.editor

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "editor_contents")
class EditorContent(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val contentId: String, // 외부 참조용 ID

    @Column(columnDefinition = "TEXT", nullable = false)
    var content: String, // HTML 컨텐츠

    @Column(nullable = false)
    var title: String = "",

    @Column(nullable = true)
    var description: String? = null,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    var status: String = "ACTIVE" // ACTIVE, INACTIVE, DELETED 등
)