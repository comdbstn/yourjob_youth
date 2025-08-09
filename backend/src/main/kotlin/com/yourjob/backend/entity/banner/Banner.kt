package com.yourjob.backend.entity.banner

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "banners")
data class Banner(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "banner_id", nullable = false, length = 100)
    val bannerId: String,

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "status", nullable = false)
    var status: String,

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "start_date", nullable = false, length = 50)
    var startDate: String,

    @Column(name = "end_date", nullable = false, length = 50)
    var endDate: String,

    @Column(name = "image_url", nullable = false, length = 255)
    var imageUrl: String,

    @Column(name = "group_name", nullable = false, length = 100)
    var groupName: String,

    @Column(name = "title", nullable = false, length = 255)
    var title: String,

    @Column(name = "link_target", nullable = true, length = 255)
    var linkTarget: String? = null,

    @Column(name = "link_target_type", nullable = true, length = 50)
    var linkTargetType: String? = null
)