package com.yourjob.backend.entity

data class CorporateTypeRequest(
    var corporateTypeId: Int? = null,
    var corporateTypeName: String,
    var createdAt: String? = null,
    var updatedAt: String? = null
) 