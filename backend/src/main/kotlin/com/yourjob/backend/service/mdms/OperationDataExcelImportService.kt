package com.yourjob.backend.service.mdms

import com.yourjob.backend.entity.mdms.OperationData
import com.yourjob.backend.entity.mdms.OperationDataType
import com.yourjob.backend.repository.mdms.OperationDataRepository
import com.yourjob.backend.repository.mdms.OperationDataTypeRepository
import jakarta.transaction.Transactional
import org.apache.poi.ss.usermodel.CellType
import org.apache.poi.ss.usermodel.WorkbookFactory
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDateTime
import java.util.concurrent.atomic.AtomicInteger

@Service
class OperationDataExcelImportService(
    private val operationDataTypeRepository: OperationDataTypeRepository,
    private val operationDataRepository: OperationDataRepository
) {

    // Excel 파일을 처리하여 데이터를 DB에 저장하는 메서드
    @Transactional
    fun importExcelData(file: MultipartFile): Map<String, Any> {
        val result = mutableMapOf<String, Any>()
        val errors = mutableListOf<String>()
        val totalInserted = AtomicInteger(0)
        val totalUpdated = AtomicInteger(0)

        try {
            val workbook = WorkbookFactory.create(file.inputStream)

            // 데이터 종류 시트 먼저 처리 (다른 시트의 dataType 참조를 위해)
            val dataTypeSheetName = "데이터종류"
            val dataTypeSheet = workbook.getSheet(dataTypeSheetName)

            if (dataTypeSheet == null) {
                errors.add("'데이터종류' 시트를 찾을 수 없습니다.")
                result["success"] = false
                result["errors"] = errors
                return result
            }

            // 데이터 종류 처리
            val dataTypeResult = processDataTypeSheet(dataTypeSheet)
            errors.addAll(dataTypeResult.second)
            totalInserted.addAndGet(dataTypeResult.first.first)
            totalUpdated.addAndGet(dataTypeResult.first.second)

            // 모든 데이터 타입을 캐싱 (나중에 유효성 검사용)
            val allDataTypes = operationDataTypeRepository.findAll()
            val dataTypeCodes = allDataTypes.map { it.name }.toSet()

            // 나머지 시트들 처리
            val sheetNames = listOf(
                "지역(0000001)", "국가(0000002)", "대학구분(0000003)",
                "국내대학(0000004)", "국내대학전공(0000005)", "해외대학(0000006)",
                "자격증(0000007)", "학력구분(0000008)"
            )

            for (sheetName in sheetNames) {
                val sheet = workbook.getSheet(sheetName)
                if (sheet == null) {
                    errors.add("'$sheetName' 시트를 찾을 수 없습니다.")
                    continue
                }

                // 데이터 종류 추출 (예: "지역(0000001)" -> "0000001")
                val dataType = sheetName.substringBefore("(")

                // 유효한 데이터 종류인지 확인
                if (!dataTypeCodes.contains(dataType)) {
                    errors.add("'$sheetName' 시트의 데이터 종류($dataType)가 유효하지 않습니다.")
                    continue
                }

                // 운영 데이터 처리
                val sheetResult = processOperationDataSheet(sheet, dataType)
                errors.addAll(sheetResult.second)
                totalInserted.addAndGet(sheetResult.first.first)
                totalUpdated.addAndGet(sheetResult.first.second)
            }

            workbook.close()

            if (errors.isEmpty()) {
                result["success"] = true
                result["message"] = "데이터 가져오기 성공"
            } else {
                result["success"] = errors.isEmpty()
                result["errors"] = errors
            }

            result["inserted"] = totalInserted.get()
            result["updated"] = totalUpdated.get()

        } catch (e: Exception) {
            result["success"] = false
            result["errors"] = listOf("파일 처리 중 오류 발생: ${e.message}")
        }

        return result
    }

    // 데이터 종류 시트 처리 메서드
    private fun processDataTypeSheet(sheet: org.apache.poi.ss.usermodel.Sheet): Pair<Pair<Int, Int>, List<String>> {
        val errors = mutableListOf<String>()
        var inserted = 0
        var updated = 0

        // 첫 번째 행은 헤더이므로 두 번째 행부터 처리
        for (i in 1..sheet.lastRowNum) {
            val row = sheet.getRow(i) ?: continue

            try {
                // 빈 행인지 확인
                if (isEmptyRow(row)) continue

                // 필수 값 확인
                val codeCell = row.getCell(0) // A열
                val nameCell = row.getCell(1) // B열

                if (codeCell == null || nameCell == null) {
                    errors.add("데이터종류 시트 ${i+1}행: 코드 또는 이름이 없습니다.")
                    continue
                }

                val code = getCellValueAsString(codeCell).substringBefore(".")
                val name = getCellValueAsString(nameCell)

                if (code.isBlank() || name.isBlank()) {
                    errors.add("데이터종류 시트 ${i+1}행: 코드 또는 이름이 비어 있습니다.")
                    continue
                }

                // 코드 길이 체크 (7자리)
                if (code.length != 7) {
                    errors.add("데이터종류 시트 ${i+1}행: 코드는 정확히 7자리여야 합니다. (현재: $code)")
                    continue
                }

                // 데이터 저장 또는 업데이트
                val existingDataType = operationDataTypeRepository.findByCode(code)

                if (existingDataType != null) {
                    // 이름이 변경된 경우에만 업데이트
                    if (existingDataType.name != name) {
                        val updatedDataType = OperationDataType(
                            id = existingDataType.id,
                            code = existingDataType.code,
                            name = name,
                            createdAt = existingDataType.createdAt,
                            updatedAt = LocalDateTime.now()
                        )
                        operationDataTypeRepository.save(updatedDataType)
                        updated++
                    }
                } else {
                    val newDataType = OperationDataType(
                        code = code,
                        name = name
                    )
                    operationDataTypeRepository.save(newDataType)
                    inserted++
                }

            } catch (e: Exception) {
                errors.add("데이터종류 시트 ${i+1}행 처리 중 오류: ${e.message}")
            }
        }

        return Pair(Pair(inserted, updated), errors)
    }

    // 운영 데이터 시트 처리 메서드
    private fun processOperationDataSheet(sheet: org.apache.poi.ss.usermodel.Sheet, dataType: String): Pair<Pair<Int, Int>, List<String>> {
        val errors = mutableListOf<String>()
        var inserted = 0
        var updated = 0

        // 시트 이름 (로그용)
        val sheetName = sheet.sheetName

        // 첫 번째 행은 헤더이므로 두 번째 행부터 처리
        for (i in 1..sheet.lastRowNum) {
            val row = sheet.getRow(i) ?: continue

            try {
                // 빈 행인지 확인
                if (isEmptyRow(row)) continue

                // 필수 값 확인
                val operationDataIdCell = row.getCell(0) // A열
                val dataTypeCell = row.getCell(1)        // B열

                if (operationDataIdCell == null || dataTypeCell == null) {
                    errors.add("$sheetName 시트 ${i+1}행: 운영 데이터 ID 또는 데이터 타입이 없습니다.")
                    continue
                }

                val operationDataId = getCellValueAsString(operationDataIdCell).substringBefore(".")
                val rowDataType = getCellValueAsString(dataTypeCell)

                if (operationDataId.isBlank()) {
                    errors.add("$sheetName 시트 ${i+1}행: 운영 데이터 ID가 비어 있습니다.")
                    continue
                }

                if (rowDataType.isBlank()) {
                    errors.add("$sheetName 시트 ${i+1}행: 데이터 타입이 비어 있습니다.")
                    continue
                }

                // operationDataId 길이 체크 (7자리)
                if (operationDataId.length != 7) {
                    errors.add("$sheetName 시트 ${i+1}행: 운영 데이터 ID는 정확히 7자리여야 합니다. (현재: $operationDataId)")
                    continue
                }

                // 시트 이름에 있는 데이터 타입과 행에 있는 데이터 타입 일치 확인
                if (rowDataType != dataType) {
                    errors.add("$sheetName 시트 ${i+1}행: 데이터 타입($rowDataType)이 시트 이름의 데이터 타입($dataType)과 일치하지 않습니다.")
                    continue
                }

                // 선택적 값 (null 허용)
                val level1 = getCellValueAsString(row.getCell(2)) // C열
                val level2 = getCellValueAsString(row.getCell(3)) // D열
                val level3 = getCellValueAsString(row.getCell(4)) // E열

                // 데이터 저장 또는 업데이트
                val existingData = operationDataRepository.findByOperationDataId(operationDataId)

                if (existingData != null) {
                    // 데이터가 변경된 경우에만 업데이트
                    if (existingData.dataType != dataType ||
                        existingData.level1 != level1.ifBlank { null } ||
                        existingData.level2 != level2.ifBlank { null } ||
                        existingData.level3 != level3.ifBlank { null }) {

                        val updatedData = OperationData(
                            id = existingData.id,
                            operationDataId = existingData.operationDataId,
                            dataType = dataType,
                            level1 = level1.ifBlank { null },
                            level2 = level2.ifBlank { null },
                            level3 = level3.ifBlank { null },
                            createdAt = existingData.createdAt,
                            updatedAt = LocalDateTime.now()
                        )
                        operationDataRepository.save(updatedData)
                        updated++
                    }
                } else {
                    val newData = OperationData(
                        operationDataId = operationDataId,
                        dataType = dataType,
                        level1 = level1.ifBlank { null },
                        level2 = level2.ifBlank { null },
                        level3 = level3.ifBlank { null }
                    )
                    operationDataRepository.save(newData)
                    inserted++
                }

            } catch (e: Exception) {
                errors.add("$sheetName 시트 ${i+1}행 처리 중 오류: ${e.message}")
            }
        }

        return Pair(Pair(inserted, updated), errors)
    }

    // 빈 행인지 확인하는 헬퍼 메서드
    private fun isEmptyRow(row: org.apache.poi.ss.usermodel.Row): Boolean {
        for (i in 0..4) { // A~E열만 확인
            val cell = row.getCell(i) ?: continue
            if (cell.cellType != CellType.BLANK && getCellValueAsString(cell).isNotBlank()) {
                return false
            }
        }
        return true
    }

    // 셀 값을 문자열로 가져오는 헬퍼 메서드
    private fun getCellValueAsString(cell: org.apache.poi.ss.usermodel.Cell?): String {
        if (cell == null) return ""

        return when (cell.cellType) {
            CellType.STRING -> cell.stringCellValue.trim()
            CellType.NUMERIC -> cell.numericCellValue.toString().trim()
            CellType.BOOLEAN -> cell.booleanCellValue.toString().trim()
            CellType.FORMULA -> {
                try {
                    cell.stringCellValue.trim()
                } catch (e: Exception) {
                    try {
                        cell.numericCellValue.toString().trim()
                    } catch (e: Exception) {
                        ""
                    }
                }
            }
            else -> ""
        }
    }
}