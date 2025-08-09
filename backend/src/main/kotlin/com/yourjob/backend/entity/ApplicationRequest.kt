package com.yourjob.backend.entity

import org.springframework.web.multipart.MultipartFile

class ApplicationRequest {
    var applicationId: Int? = null
    var jobId: Int? = null
    var jobseekerId: Int? = null
    var jobType: String? = null
    var resumeId: Int? = null
    var status: String? = null
    var coverLetter: String? = null
    var title: String? = null
    var content: String? = null
}