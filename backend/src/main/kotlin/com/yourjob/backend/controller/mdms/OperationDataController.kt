package com.yourjob.backend.controller.mdms

import com.yourjob.backend.entity.mdms.*
import com.yourjob.backend.service.mdms.OperationDataService
import org.springframework.data.domain.Page
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.NoSuchElementException

@RestController
@RequestMapping("/api/v1/mdms")
class OperationDataController(private val operationDataService: OperationDataService) {

    @GetMapping("/operation-data")
    fun getOperationDataPaging(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false) keyword: String?,
        @RequestParam(required = false) operationDataId: String?,
        @RequestParam(required = false) dataType: String?,
        @RequestParam(required = false) level1: String?,
        @RequestParam(required = false) level2: String?,
        @RequestParam(required = false) level3: String?,
        @RequestParam(defaultValue = "id,asc") sort: String
    ): ResponseEntity<Page<OperationDataResponseDto>> {
        val operationDataPage = operationDataService.getOperationDataPaging(
            page, size, keyword, dataType, level1, level2, level3, sort
        )
        return ResponseEntity.ok(operationDataPage)
    }

    // 단일 운영 데이터 조회
    @GetMapping("/operation-data/{operationDataId}")
    fun getOperationDataById(@PathVariable operationDataId: String): ResponseEntity<OperationDataResponseDto> {
        val operationData = operationDataService.getOperationDataById(operationDataId)
        return ResponseEntity.ok(operationData)
    }

    // 운영 데이터 생성
    @PostMapping("/operation-data")
    fun createOperationData(@RequestBody request: OperationDataCreateRequestDto): ResponseEntity<OperationDataResponseDto> {
        val createdData = operationDataService.createOperationData(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(createdData)
    }

    // 운영 데이터 수정
    @PutMapping("/operation-data")
    fun updateOperationData(@RequestBody request: OperationDataUpdateRequestDto): ResponseEntity<ResponseMessageDto> {
        val response = operationDataService.updateOperationData(request)
        return ResponseEntity.ok(response)
    }

    // 운영 데이터 삭제
    @DeleteMapping("/operation-data")
    fun deleteOperationData(@RequestParam operationDataId: String): ResponseEntity<ResponseMessageDto> {
        val response = operationDataService.deleteOperationData(operationDataId)
        return ResponseEntity.ok(response)
    }

    // data_type별 level1 코드 목록 조회
    @GetMapping("/operation-data/level1-codes")
    fun getLevel1CodesByDataType(@RequestParam dataType: String): ResponseEntity<LevelCodeListDto> {
        val levelCodes = operationDataService.getLevel1CodesByDataType(dataType)
        return ResponseEntity.ok(levelCodes)
    }

    // level2 코드 목록 조회
    @GetMapping("/operation-data/level2-codes")
    fun getLevel2CodesByDataType(@RequestParam dataType: String): ResponseEntity<LevelCodeListDto> {
        val levelCodes = operationDataService.getLevel2CodesByDataType(dataType)
        return ResponseEntity.ok(levelCodes)
    }

    // level3 코드 목록 조회
    @GetMapping("/operation-data/level3-codes")
    fun getLevel3CodesByDataType(@RequestParam dataType: String): ResponseEntity<LevelCodeListDto> {
        val levelCodes = operationDataService.getLevel3CodesByDataType(dataType)
        return ResponseEntity.ok(levelCodes)
    }

    // 특정 level1에 속한 level2 코드 목록 조회
    @GetMapping("/operation-data/level2-codes/{dataType}/{level1Code}")
    fun getLevel2CodesByDataTypeAndLevel1(
        @PathVariable dataType: String,
        @PathVariable level1Code: String
    ): ResponseEntity<LevelCodeListDto> {
        val levelCodes = operationDataService.getLevel2CodesByDataTypeAndLevel1(dataType, level1Code)
        return ResponseEntity.ok(levelCodes)
    }

    // 특정 level2에 속한 level3 코드 목록 조회
    @GetMapping("/operation-data/level3-codes/{dataType}/{level2Code}")
    fun getLevel3CodesByDataTypeAndLevel2(
        @PathVariable dataType: String,
        @PathVariable level2Code: String
    ): ResponseEntity<LevelCodeListDto> {
        val levelCodes = operationDataService.getLevel3CodesByDataTypeAndLevel2(dataType, level2Code)
        return ResponseEntity.ok(levelCodes)
    }

    // 새로운 level 코드 생성
    @PostMapping("/operation-data/level-code")
    fun createNewLevelCode(@RequestBody request: LevelCodeCreateDto): ResponseEntity<LevelCodeDto> {
        val createdCode = operationDataService.createNewLevelCode(request)
        return ResponseEntity.ok(createdCode)
    }

    // 다음 operation_data_id 조회 (새 등록용)
    @GetMapping("/operation-data/next-id")
    fun getNextOperationDataId(@RequestParam dataType: String): ResponseEntity<NextIdResponseDto> {
        val nextId = operationDataService.getNextOperationDataId(dataType)
        return ResponseEntity.ok(nextId)
    }

    @DeleteMapping("/operation-data/level-code/{code}")
    fun deleteLevelCode(@PathVariable code: String): ResponseEntity<ResponseMessageDto> {
        val response = operationDataService.deleteLevelCode(code)
        return ResponseEntity.ok(response)
    }
}