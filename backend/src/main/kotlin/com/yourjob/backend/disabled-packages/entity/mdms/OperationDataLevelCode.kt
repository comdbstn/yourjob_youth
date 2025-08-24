package com.yourjob.backend.entity.mdms

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime

@Entity
@Table(name = "operation_data_level_code")
data class OperationDataLevelCode(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "code", unique = true, nullable = false)
    val code: String,

    @Column(name = "data_type", nullable = false)
    val dataType: String,

    @Column(name = "level_type", nullable = false)
    @Enumerated(EnumType.STRING)
    val levelType: LevelType,

    @Column(name = "parent_code")
    val parentCode: String? = null,

    @Column(name = "level_value", nullable = false)
    val levelValue: String,

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)

enum class LevelType {
    level1, level2, level3
}