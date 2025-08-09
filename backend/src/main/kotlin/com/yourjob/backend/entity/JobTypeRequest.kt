package com.yourjob.backend.entity

data class JobTypeRequest(
    var jobTypeId: Int? = null,
    var jobTypeName: String,
    var createdAt: String? = null,
    var updatedAt: String? = null
) 