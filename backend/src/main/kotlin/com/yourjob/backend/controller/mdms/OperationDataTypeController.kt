package com.yourjob.backend.controller.mdms

import com.yourjob.backend.entity.mdms.OperationDataTypeDto
import com.yourjob.backend.service.mdms.OperationDataTypeService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/mdms")
class OperationDataTypeController(private val operationDataTypeService: OperationDataTypeService) {

    // 데이터 종류 조회
    @GetMapping("/operation-data-type")
    fun getAllOperationDataTypes(): ResponseEntity<List<OperationDataTypeDto>> {
        val dataTypes = operationDataTypeService.getAllOperationDataTypes()
        return ResponseEntity.ok(dataTypes)
    }
}
