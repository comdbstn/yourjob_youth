package com.yourjob.backend.entity.mdms

import com.fasterxml.jackson.annotation.JsonFormat
import jakarta.persistence.Column
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime

data class OperationDataResponseDto(
    val operationDataId: String,
    val dataType: String,
    val dataTypeName: String?,
    val level1Code: String?,
    val level1: String?,
    val level2Code: String? = null,  // 항상 null
    val level2: String?,
    val level3Code: String? = null,  // 항상 null
    val level3: String?,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    val createdAt: LocalDateTime?,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    val updatedAt: LocalDateTime?
) {

    constructor(
        operationDataId: String,
        dataType: String,
        dataTypeName: String?,
        level1Code: String?,
        level1: String,
        level2: String?,
        level3: String?,
        createdAt: LocalDateTime?,
        updatedAt: LocalDateTime?
    ) : this(
        operationDataId = operationDataId,
        dataType = dataType,
        dataTypeName = dataTypeName,
        level1Code = level1Code,
        level1 = level1,
        level2Code = null,
        level2 = level2,
        level3Code = null,
        level3 = level3,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}

data class NextIdResponseDto(
    val nextId: String,
    val message: String = "다음 분류코드가 생성되었습니다."
)

data class LevelCodeDto(
    val code: String,
    val levelValue: String,
    val parentCode: String? = null
)

data class LevelCodeListDto(
    val dataType: String,
    val dataTypeName: String,
    val levelCodes: List<LevelCodeDto>
)

data class LevelCodeCreateDto(
    val dataType: String,
    val levelType: LevelType,
    val levelValue: String,
    val parentCode: String? = null
)

data class OperationDataCreateRequestDto(
    val operationDataId: String,
    val dataType: String,
    val level1: String? = null,  // 이제 값으로 받음 (코드로 변환됨)
    val level2: String? = null,
    val level3: String? = null
)


data class OperationDataUpdateRequestDto(
    val operationDataId: String,
    val dataType: String,
    val level1: String? = null,  // 이제 값으로 받음 (코드로 변환됨)
    val level2: String? = null,
    val level3: String? = null
)

// 공통 응답 메시지 DTO
data class ResponseMessageDto(
    val message: String
)