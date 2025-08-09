    package com.yourjob.backend.entity.successfulResume

    import jakarta.persistence.*
    import java.math.BigDecimal
    import java.time.LocalDateTime
    @Entity
    @Table(name = "successful_resumes")
    data class SuccessfulResume(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "resume_id")
        val resumeId: Long = 0,

        @Column(name = "title", nullable = false)
        val title: String,

        @Column(name = "user_id", nullable = false)
        val userId: Long,

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "job_post_id", nullable = false)
        val jobPost: SuccessfulResumeJobPost,

        @OneToMany(mappedBy = "resume")
        var questionAnswers: MutableList<SuccessfulResumeQuestionAnswer> = mutableListOf(),

        @Column(name = "view_count")
        val viewCount: Int = 0,

        // 병합된 applicant_profiles 필드들
        @Column(name = "school_region")
        val schoolRegion: String? = null,

        @Column(name = "school_type")
        val schoolType: String? = null,

        @Column(name = "major")
        val major: String? = null,

        @Column(name = "gpa")
        val gpa: BigDecimal? = null,

        @Column(name = "gpa_scale")
        val gpaScale: BigDecimal? = null,

        @Column(name = "awards_count")
        val awardsCount: Int = 0,

        @Column(name = "club_activities_count")
        val clubActivitiesCount: Int = 0,

        @Column(name = "internship_count")
        val internshipCount: Int = 0,

        @Column(name = "certification_count")
        val certificationCount: Int = 0,

        @Column(name = "created_at")
        val createdAt: LocalDateTime = LocalDateTime.now(),

        @Column(name = "updated_at")
        val updatedAt: LocalDateTime = LocalDateTime.now()
    )
