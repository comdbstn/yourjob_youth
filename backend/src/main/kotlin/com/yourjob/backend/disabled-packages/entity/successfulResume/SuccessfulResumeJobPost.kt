package com.yourjob.backend.entity.successfulResume

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import java.time.LocalDateTime


@Entity
@Table(name = "successful_resumes_job_posts")
data class SuccessfulResumeJobPost(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "job_post_id")
    val jobPostId: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    val company: SuccessfulResumeCompany,

    @Column(name = "job_category", nullable = false)
    val jobCategory: String,

    @Column(name = "job_title", nullable = false)
    val jobTitle: String,

    @Column(name = "country_type")
    val countryType: String,

    @Column(name = "post_period")
    val postPeriod: String,

    @Column(name = "career_level")
    val careerLevel: String,

    @OneToMany(mappedBy = "jobPost", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @JsonIgnore
    val resumes: List<SuccessfulResume> = mutableListOf(),

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: LocalDateTime = LocalDateTime.now()
)