package com.yourjob.backend.entity

class JobListResponse {
    var content: Array<JobResponse?>? = null
    var page: Int? = null
    var size: Int? = null
    var totalElements: Int? = null
    var totalPages: Int? = null
    var total: Int? = null
}