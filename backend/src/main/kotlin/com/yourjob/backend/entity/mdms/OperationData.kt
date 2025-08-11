package com.yourjob.backend.entity.mdms

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime

@Entity
@Table(name = "operation_data")
data class OperationData(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "operation_data_id", unique = true, nullable = false)
    val operationDataId: String,

    @Column(name = "data_type", nullable = false)
    val dataType: String,

    @Column(name = "level1")
    val level1: String? = null,

    @Column(name = "level2")
    val level2: String? = null,

    @Column(name = "level3")
    val level3: String? = null,

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)