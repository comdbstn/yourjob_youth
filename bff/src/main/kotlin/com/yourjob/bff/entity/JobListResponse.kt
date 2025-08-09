package com.yourjob.bff.entity

class JobListResponse {
    var content: Array<JobResponse?>? = null
    var page: Int? = null
    var size: Int? = null
    var totalElements: Int? = null
    var totalPages: Int? = null
}