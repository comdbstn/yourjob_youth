package com.yourjob.backend.entity.mdms

class OperationDataExcelImportResponseDto (
        val success: Boolean,
        val message: String? = null,
        val errors: List<String>? = null,
        val inserted: Int = 0,
        val updated: Int = 0
)