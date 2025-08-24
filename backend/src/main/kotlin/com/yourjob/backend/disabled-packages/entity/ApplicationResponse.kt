package com.yourjob.backend.entity

class ApplicationResponse {
    var id: Int? = null
    var jobId: Int? = null
    var employerId: Int? = null
    var jobseekerId: Int? = null
    var companyName: String? = null
    var gender: String? = null
    var resumeId: Int? = null
    var status: String? = null
    var coverLetter: String? = null
    var attach_files_idx: String? = null
    var createdAt: String? = null
    var applyDate: String? = null
    var position: String? = null
    var title: String? = null
    var applierInfo: ApplierInfo? = null
    var attachments: ArrayList<Any>? = null
}