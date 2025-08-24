package com.yourjob.backend.service.mdms

import com.yourjob.backend.entity.mdms.*
import com.yourjob.backend.repository.mdms.OperationDataRepository
import com.yourjob.backend.repository.mdms.OperationDataTypeRepository
import com.yourjob.backend.repository.mdms.OperationDataLevelCodeRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import org.slf4j.LoggerFactory

@Service
class OperationDataService(
    private val operationDataRepository: OperationDataRepository,
    private val operationDataTypeRepository: OperationDataTypeRepository,
    private val operationDataLevelCodeRepository: OperationDataLevelCodeRepository
) {

    private val logger = LoggerFactory.getLogger(OperationDataService::class.java)

    // 페이징 및 필터링을 적용한 데이터 조회
    fun getOperationDataPaging(
        page: Int,
        size: Int,
        keyword: String?,
        dataType: String?,
        level1: String?,
        level2: String?,
        level3: String?,
        sort: String?
    ): Page<OperationDataResponseDto> {

        logger.debug("Service - Received parameters - dataType: '{}', level1: '{}', level2: '{}', level3: '{}'",
            dataType, level1, level2, level3)

        val sortProperty = sort?.split(",")?.get(0) ?: "created_at"
        val sortDirection = if (sort?.split(",")?.getOrNull(1)?.equals("desc", ignoreCase = true) == true)
            Sort.Direction.DESC else Sort.Direction.ASC

        val pageable: Pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortProperty))

        // 모든 parameter는 이미 코드로 전달됨
        val operationDataPage = operationDataRepository.findOperationDataWithJoin(
            dataType,
            level1,
            level2,
            level3,
            keyword,
            pageable
        )

        logger.debug("Service - Found {} records", operationDataPage.content.size)

        return operationDataPage
    }

    // operationDataId로 단일 데이터 조회
    fun getOperationDataById(operationDataId: String): OperationDataResponseDto {
        return operationDataRepository.findOperationDataWithJoinById(operationDataId)
            ?: throw EntityNotFoundException("operationDataId가 일치하는 데이터를 찾을 수 없습니다.")
    }

    // 데이터 생성 - 모든 값이 이미 코드로 전달됨
    @Transactional
    fun createOperationData(request: OperationDataCreateRequestDto): OperationDataResponseDto {
        // ID 중복 체크
        val existingData = operationDataRepository.findByOperationDataId(request.operationDataId)
        if (existingData != null) {
            throw IllegalArgumentException("이미 존재하는 ID입니다: ${request.operationDataId}")
        }

        // dataType 유효성 검증 (코드로 받은 값 검증)
        val dataType = operationDataTypeRepository.findByCode(request.dataType)
            ?: throw IllegalArgumentException("유효하지 않은 data_type입니다: ${request.dataType}")

        // level 코드들 유효성 검증 (필요한 경우)
        if (request.level1 != null) {
            operationDataLevelCodeRepository.findByCodeAndDataType(request.level1, request.dataType)
                ?: throw IllegalArgumentException("유효하지 않은 level1 코드입니다: ${request.level1}")
        }

        if (request.level2 != null) {
            operationDataLevelCodeRepository.findByCodeAndDataType(request.level2, request.dataType)
                ?: throw IllegalArgumentException("유효하지 않은 level2 코드입니다: ${request.level2}")
        }

        if (request.level3 != null) {
            operationDataLevelCodeRepository.findByCodeAndDataType(request.level3, request.dataType)
                ?: throw IllegalArgumentException("유효하지 않은 level3 코드입니다: ${request.level3}")
        }

        val operationData = OperationData(
            operationDataId = request.operationDataId,
            dataType = request.dataType,  // 이미 코드
            level1 = request.level1,      // 이미 코드
            level2 = request.level2,      // 이미 코드
            level3 = request.level3       // 이미 코드
        )

        operationDataRepository.save(operationData)
        return getOperationDataById(request.operationDataId)
    }

    // 데이터 수정 - 모든 값이 이미 코드로 전달됨
    @Transactional
    fun updateOperationData(request: OperationDataUpdateRequestDto): ResponseMessageDto {
        val operationData = operationDataRepository.findByOperationDataId(request.operationDataId)
            ?: throw EntityNotFoundException("operationDataId가 ${request.operationDataId}인 데이터를 찾을 수 없습니다.")

        // dataType 유효성 검증 (코드로 받은 값 검증)
        val dataType = operationDataTypeRepository.findByCode(request.dataType)
            ?: throw IllegalArgumentException("유효하지 않은 data_type입니다: ${request.dataType}")

        // level 코드들 유효성 검증 (필요한 경우)
        if (request.level1 != null) {
            operationDataLevelCodeRepository.findByCodeAndDataType(request.level1, request.dataType)
                ?: throw IllegalArgumentException("유효하지 않은 level1 코드입니다: ${request.level1}")
        }

        if (request.level2 != null) {
            operationDataLevelCodeRepository.findByCodeAndDataType(request.level2, request.dataType)
                ?: throw IllegalArgumentException("유효하지 않은 level2 코드입니다: ${request.level2}")
        }

        if (request.level3 != null) {
            operationDataLevelCodeRepository.findByCodeAndDataType(request.level3, request.dataType)
                ?: throw IllegalArgumentException("유효하지 않은 level3 코드입니다: ${request.level3}")
        }

        val updatedData = OperationData(
            id = operationData.id,
            operationDataId = operationData.operationDataId,
            dataType = request.dataType,  // 이미 코드
            level1 = request.level1,      // 이미 코드
            level2 = request.level2,      // 이미 코드
            level3 = request.level3,      // 이미 코드
            createdAt = operationData.createdAt,
            updatedAt = LocalDateTime.now()
        )

        operationDataRepository.save(updatedData)
        return ResponseMessageDto("Data updated successfully.")
    }

    // data_type별 level1 코드 목록 조회
    fun getLevel1CodesByDataType(dataType: String): LevelCodeListDto {
        val dataTypeEntity = operationDataTypeRepository.findByCode(dataType)
            ?: throw IllegalArgumentException("유효하지 않은 data_type입니다: $dataType")

        val levelCodes = operationDataLevelCodeRepository.findByDataTypeAndLevelTypeOrderByCode(dataType, LevelType.level1)
            .map { LevelCodeDto(it.code, it.levelValue) }

        return LevelCodeListDto(
            dataType = dataType,
            dataTypeName = dataTypeEntity.name,
            levelCodes = levelCodes
        )
    }

    // data_type별 level2 코드 목록 조회
    fun getLevel2CodesByDataType(dataType: String): LevelCodeListDto {
        val dataTypeEntity = operationDataTypeRepository.findByCode(dataType)
            ?: throw IllegalArgumentException("유효하지 않은 data_type입니다: $dataType")

        val levelCodes = operationDataLevelCodeRepository.findByDataTypeAndLevelTypeOrderByCode(dataType, LevelType.level2)
            .map { LevelCodeDto(it.code, it.levelValue) }

        return LevelCodeListDto(
            dataType = dataType,
            dataTypeName = dataTypeEntity.name,
            levelCodes = levelCodes
        )
    }

    // data_type별 level3 코드 목록 조회
    fun getLevel3CodesByDataType(dataType: String): LevelCodeListDto {
        val dataTypeEntity = operationDataTypeRepository.findByCode(dataType)
            ?: throw IllegalArgumentException("유효하지 않은 data_type입니다: $dataType")

        val levelCodes = operationDataLevelCodeRepository.findByDataTypeAndLevelTypeOrderByCode(dataType, LevelType.level3)
            .map { LevelCodeDto(it.code, it.levelValue) }

        return LevelCodeListDto(
            dataType = dataType,
            dataTypeName = dataTypeEntity.name,
            levelCodes = levelCodes
        )
    }

    // 특정 level1에 속한 level2 코드 목록 조회
    fun getLevel2CodesByDataTypeAndLevel1(dataType: String, level1Code: String): LevelCodeListDto {
        val dataTypeEntity = operationDataTypeRepository.findByCode(dataType)
            ?: throw IllegalArgumentException("유효하지 않은 data_type입니다: $dataType")

        val levelCodes = operationDataLevelCodeRepository.findByDataTypeAndLevelTypeAndParentCodeOrderByCode(
            dataType, LevelType.level2, level1Code
        ).map { LevelCodeDto(it.code, it.levelValue) }

        return LevelCodeListDto(
            dataType = dataType,
            dataTypeName = dataTypeEntity.name,
            levelCodes = levelCodes
        )
    }

    // 특정 level2에 속한 level3 코드 목록 조회
    fun getLevel3CodesByDataTypeAndLevel2(dataType: String, level2Code: String): LevelCodeListDto {
        val dataTypeEntity = operationDataTypeRepository.findByCode(dataType)
            ?: throw IllegalArgumentException("유효하지 않은 data_type입니다: $dataType")

        val levelCodes = operationDataLevelCodeRepository.findByDataTypeAndLevelTypeAndParentCodeOrderByCode(
            dataType, LevelType.level3, level2Code
        ).map { LevelCodeDto(it.code, it.levelValue) }

        return LevelCodeListDto(
            dataType = dataType,
            dataTypeName = dataTypeEntity.name,
            levelCodes = levelCodes
        )
    }

    // 데이터 삭제
    @Transactional
    fun deleteOperationData(operationDataId: String): ResponseMessageDto {
        val operationData = operationDataRepository.findByOperationDataId(operationDataId)
            ?: throw EntityNotFoundException("operationDataId가 일치하는 데이터를 찾을 수 없습니다.")

        operationDataRepository.delete(operationData)
        return ResponseMessageDto("Data deleted successfully.")
    }

    // 새로운 level 코드 생성
    @Transactional
    fun createNewLevelCode(request: LevelCodeCreateDto): LevelCodeDto {
        // 데이터 타입 유효성 검증
        val dataTypeEntity = operationDataTypeRepository.findByCode(request.dataType)
            ?: throw IllegalArgumentException("유효하지 않은 data_type입니다: ${request.dataType}")

        // 데이터 타입 코드 뒷 2자리 추출
        val dataTypeCode = dataTypeEntity.code.takeLast(2)

        // 레벨 코드 생성 (A, B, C)
        val levelCode = when (request.levelType) {
            LevelType.level1 -> "A"
            LevelType.level2 -> "B"
            LevelType.level3 -> "C"
        }

        // 마지막 번호 조회하여 자동 증가
        val lastCode = operationDataLevelCodeRepository
            .findByDataTypeAndLevelTypeOrderByCode(request.dataType, request.levelType)
            .lastOrNull()
            ?.code

        val nextNumber = if (lastCode != null) {
            val numberPart = lastCode.takeLast(5).toInt() + 1
            String.format("%05d", numberPart)
        } else {
            // 첫 번째 코드인 경우
            "00001"
        }

        // 코드 조합 (8자리)
        // 형식: [데이터타입2자리][레벨1자리][번호5자리]
        // 예: 01A00001, 01B00001, 01C00001
        val newCode = "$dataTypeCode$levelCode$nextNumber"

        // 새 레벨 코드 생성
        val newLevelCode = OperationDataLevelCode(
            dataType = request.dataType,
            levelType = request.levelType,
            code = newCode,
            levelValue = request.levelValue,
            parentCode = request.parentCode
        )

        val saved = operationDataLevelCodeRepository.save(newLevelCode)
        return LevelCodeDto(
            code = saved.code,
            levelValue = saved.levelValue,
            parentCode = saved.parentCode
        )
    }

    // 코드로 레벨 데이터 조회
    fun getLevelDataByCode(dataType: String, code: String): OperationDataLevelCode? {
        return operationDataLevelCodeRepository.findByCodeAndDataType(code, dataType)
    }

    // 다음 operation_data_id 생성
    fun getNextOperationDataId(dataType: String): NextIdResponseDto {
        try {
            // 데이터 타입 정보 조회
            val dataTypeEntity = operationDataTypeRepository.findByCode(dataType)
                ?: throw IllegalArgumentException("유효하지 않은 data_type입니다: $dataType")

            // 해당 데이터 타입의 가장 큰 operation_data_id 조회 (숫자만)
            val lastOperationData = operationDataRepository.findFirstByDataTypeOrderByOperationDataIdDesc(dataType)

            val nextId = if (lastOperationData != null) {
                // 기존 ID에서 숫자 부분만 추출하여 증가
                val currentId = lastOperationData.operationDataId
                try {
                    // operation_data_id가 숫자인지 확인
                    val numericId = currentId.toLong()
                    val nextNumber = numericId + 1
                    String.format("%08d", nextNumber)
                } catch (e: NumberFormatException) {
                    // 숫자가 아닌 경우 에러 로그 출력 후 기본값 생성
                    logger.error("Non-numeric operation_data_id found: $currentId for dataType: $dataType")
                    // 데이터 타입의 마지막 2자리 + 000001로 기본값 생성
                    val dataTypeCode = dataTypeEntity.code.takeLast(2)
                    "${dataTypeCode}000001"
                }
            } else {
                // 첫 번째 ID인 경우 - 데이터 타입 코드 뒷 2자리 + 000001
                val dataTypeCode = dataTypeEntity.code.takeLast(2)
                "${dataTypeCode}000001"
            }

            return NextIdResponseDto(nextId)
        } catch (ex: Exception) {
            logger.error("Failed to generate next ID for dataType: $dataType", ex)
            // 에러 시 기본값 반환
            val dataTypeCode = try {
                val dataTypeEntity = operationDataTypeRepository.findByCode(dataType)
                dataTypeEntity?.code?.takeLast(2) ?: "00"
            } catch (e: Exception) {
                "00"
            }
            return NextIdResponseDto("${dataTypeCode}000001")
        }
    }

    @Transactional
    fun deleteLevelCode(code: String): ResponseMessageDto {
        try {
            // code로 직접 조회 (id로 조회하면 안됨 - code는 String이고 id는 Long)
            val foundLevelCode = operationDataLevelCodeRepository.findByCode(code)
                ?: throw EntityNotFoundException("코드를 찾을 수 없습니다: $code")

            // 해당 코드를 참조하는 operation_data가 있는지 확인
            val referencingData = when (foundLevelCode.levelType) {
                LevelType.level1 -> operationDataRepository.findByLevel1(code)
                LevelType.level2 -> operationDataRepository.findByLevel2(code)
                LevelType.level3 -> operationDataRepository.findByLevel3(code)
            }

            if (referencingData.isNotEmpty()) {
                throw IllegalStateException("이 분류를 사용하는 ${referencingData.size}개의 데이터가 있어 삭제할 수 없습니다.")
            }

            // 하위 레벨 코드가 있는지 확인
            when (foundLevelCode.levelType) {
                LevelType.level1 -> {
                    val childCodes = operationDataLevelCodeRepository.findByDataTypeAndLevelTypeAndParentCodeOrderByCode(
                        foundLevelCode.dataType, LevelType.level2, code
                    )
                    if (childCodes.isNotEmpty()) {
                        throw IllegalStateException("이 분류에 속한 하위 분류가 ${childCodes.size}개 있어 삭제할 수 없습니다.")
                    }
                }
                LevelType.level2 -> {
                    val childCodes = operationDataLevelCodeRepository.findByDataTypeAndLevelTypeAndParentCodeOrderByCode(
                        foundLevelCode.dataType, LevelType.level3, code
                    )
                    if (childCodes.isNotEmpty()) {
                        throw IllegalStateException("이 분류에 속한 하위 분류가 ${childCodes.size}개 있어 삭제할 수 없습니다.")
                    }
                }
                LevelType.level3 -> {
                    // level3은 최하위이므로 하위 코드 확인 불필요
                }
            }

            // 삭제 실행
            operationDataLevelCodeRepository.delete(foundLevelCode)

            return ResponseMessageDto("분류가 성공적으로 삭제되었습니다.")
        } catch (e: EntityNotFoundException) {
            throw e
        } catch (e: IllegalStateException) {
            throw e
        } catch (e: Exception) {
            logger.error("Failed to delete level code: $code", e)
            throw RuntimeException("분류 삭제 중 오류가 발생했습니다.")
        }
    }
}