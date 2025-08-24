package com.yourjob.backend.controller.mdms

import com.yourjob.backend.service.mdms.OperationDataExcelImportService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/v1/mdms")
class OperationDataExcelImportController(private val operationDataExcelImportService: OperationDataExcelImportService) {

    @PostMapping("/import-excel")
    fun importExcelData(@RequestParam("file") file: MultipartFile): ResponseEntity<Map<String, Any>> {
        if (file.isEmpty) {
            return ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "errors" to listOf("파일이 비어 있습니다.")
            ))
        }

        // 파일 확장자 확인
        val originalFilename = file.originalFilename ?: ""
        if (!originalFilename.endsWith(".xlsx") && !originalFilename.endsWith(".xls")) {
            return ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "errors" to listOf("Excel 파일(.xlsx 또는 .xls)만 지원합니다.")
            ))
        }

        val result = operationDataExcelImportService.importExcelData(file)

        return if (result["success"] as Boolean) {
            ResponseEntity.ok(result)
        } else {
            ResponseEntity.badRequest().body(result)
        }
    }
}