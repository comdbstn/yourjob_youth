package com.yourjob.backend.service.mdms

import com.yourjob.backend.entity.mdms.OperationDataType
import com.yourjob.backend.entity.mdms.OperationDataTypeDto
import com.yourjob.backend.repository.mdms.OperationDataTypeRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.stream.Collectors

@Service
class OperationDataTypeService(private val operationDataTypeRepository: OperationDataTypeRepository) {

    // 모든 데이터 종류 조회
    fun getAllOperationDataTypes(): List<OperationDataTypeDto> {
        return operationDataTypeRepository.findAll().map { convertToDto(it) }
    }

    // 데이터 종류 생성
    @Transactional
    fun createOperationDataType(code: String, name: String): OperationDataTypeDto {
        val existingByCode = operationDataTypeRepository.findByCode(code)
        if (existingByCode != null) {
            throw IllegalArgumentException("이미 존재하는 코드입니다: $code")
        }

        val operationDataType = OperationDataType(
            code = code,
            name = name
        )
        val saved = operationDataTypeRepository.save(operationDataType)
        return convertToDto(saved)
    }

    // OperationDataType 엔티티를 DTO로 변환
    private fun convertToDto(operationDataType: OperationDataType): OperationDataTypeDto {
        return OperationDataTypeDto(
            code = operationDataType.code,
            name = operationDataType.name
        )
    }
}