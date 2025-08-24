package com.yourjob.backend.service.mdms

import com.yourjob.backend.entity.mdms.*
import com.yourjob.backend.repository.mdms.*
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.slf4j.LoggerFactory

@Service
class SchoolSearchService(
    private val operationDataRepository: OperationDataRepository,
    private val operationDataTypeRepository: OperationDataTypeRepository,
    private val operationDataLevelCodeRepository: OperationDataLevelCodeRepository
) {

    private val logger = LoggerFactory.getLogger(SchoolSearchService::class.java)

    // 학교 검색
    fun searchSchools(
        keyword: String,
        size: Int,
        schoolType: String?,
        level1Filter: String?,
        level2Filter: String?
    ): List<SchoolSearchResultDto> {
        val dataTypes = mutableListOf<String>()

        // 학교 타입에 따른 데이터 타입 결정
        when (schoolType) {
            "국내대학" -> dataTypes.add("00000004")
            "해외대학" -> dataTypes.add("00000006")
            else -> {
                dataTypes.add("00000004")
                dataTypes.add("00000006")
            }
        }

        val results = mutableListOf<SchoolSearchResultDto>()

        dataTypes.forEach { dataType ->
            try {
                val pageable = PageRequest.of(0, size)

                val page = operationDataRepository.findSchoolOperationDataWithJoin(
                    dataType = dataType,
                    keyword = keyword,
                    pageable = pageable
                )

                val searchResults =  page.content

                searchResults.forEach { result ->
                    results.add(SchoolSearchResultDto(
                        operationDataId = result.operationDataId,
                        schoolName = result.level3 ?: result.level2 ?: result.level1 ?: "",
                        schoolType = getDataTypeName(dataType),
                        level1 = result.level1,
                        level2 = result.level2,
                        level3 = result.level3,
                        fullPath = "${result.level1 ?: ""} > ${result.level2 ?: ""} > ${result.level3 ?: ""}".replace(" >  > ", " > ").replace(" > $", "")
                    ))
                }
            } catch (e: Exception) {
                logger.error("Error searching schools for dataType: $dataType", e)
            }
        }

        return results.take(size)
    }

    // 전공 검색
    fun searchMajors(
        keyword: String,
        size: Int,
        majorType: String?,
        level1Filter: String?,
        level2Filter: String?
    ): List<MajorSearchResultDto> {
        val dataTypes = mutableListOf<String>()

        // 전공 타입에 따른 데이터 타입 결정
        when (majorType) {
            "국내전공" -> dataTypes.add("00000005")
            "해외전공" -> dataTypes.add("00000005")
            else -> {
                dataTypes.add("00000005")
            }
        }

        val results = mutableListOf<MajorSearchResultDto>()

        dataTypes.forEach { dataType ->
            try {
                val pageable = PageRequest.of(0, size)

                val page = operationDataRepository.findMajorOperationDataWithJoin(
                    dataType = dataType,
                    keyword = keyword,
                    pageable = pageable
                )

                val searchResults =  page.content

                searchResults.forEach { result ->
                    results.add(MajorSearchResultDto(
                        operationDataId = result.operationDataId,
                        majorName = result.level2 ?: result.level1 ?: "",  // level2를 majorName으로 사용
                        majorType = getDataTypeName(dataType),
                        level1 = result.level1,
                        level2 = result.level2,
                        level3 = result.level3,
                        fullPath = "${result.level1 ?: ""} > ${result.level2 ?: ""} > ${result.level3 ?: ""}".replace(" >  > ", " > ").replace(" > $", "")
                    ))
                }
            } catch (e: Exception) {
                logger.error("Error searching majors for dataType: $dataType", e)
            }
        }

        return results.take(size)
    }

    // 전공용 별도 검색
    private fun searchOperationDataByKeywordForMajor(
        dataType: String,
        keyword: String,
        size: Int,
        level1Filter: String?,
        level2Filter: String?
    ): List<OperationDataResponseDto> {
        val pageable = PageRequest.of(0, size)

        // level1Filter, level2Filter를 코드로 변환
        val level1Code = if (level1Filter != null) {
            operationDataLevelCodeRepository.findByDataTypeAndLevelTypeAndLevelValue(dataType, LevelType.level1, level1Filter)?.code
        } else null

        val level2Code = if (level2Filter != null) {
            operationDataLevelCodeRepository.findByDataTypeAndLevelTypeAndLevelValue(dataType, LevelType.level2, level2Filter)?.code
        } else null

        // 전공은 level2에서 검색하므로 level2에 keyword를 전달
        val page = operationDataRepository.findOperationDataWithJoin(
            dataType = dataType,
            level1 = level1Code,
            level2 = level2Code,
            level3 = null,
            keyword = keyword,
            pageable = pageable
        )

        return page.content
    }

    // 통합 검색
    fun unifiedSearch(keyword: String, schoolLimit: Int, majorLimit: Int): UnifiedSearchResultDto {
        val schools = searchSchools(keyword, schoolLimit, null, null, null)
        val majors = searchMajors(keyword, majorLimit, null, null, null)

        return UnifiedSearchResultDto(
            schools = schools,
            majors = majors,
            totalSchools = schools.size,
            totalMajors = majors.size
        )
    }

    // 특정 데이터 타입별 검색
    fun searchByDataType(
        dataType: String,
        keyword: String,
        size: Int,
        level1Filter: String?,
        level2Filter: String?
    ): List<OperationDataSearchResultDto> {
        val results = searchOperationDataByKeyword(dataType, keyword, size, level1Filter, level2Filter)
        return results.map { result ->
            OperationDataSearchResultDto(
                operationDataId = result.operationDataId,
                dataType = result.dataType,
                dataTypeName = result.dataTypeName ?: "",
                level1 = result.level1,
                level2 = result.level2,
                level3 = result.level3,
                displayValue = result.level3 ?: result.level2 ?: result.level1 ?: "",
                fullPath = "${result.level1 ?: ""} > ${result.level2 ?: ""} > ${result.level3 ?: ""}".replace(" >  > ", " > ").replace(" > $", "")
            )
        }
    }

    // 자동완성용 검색
    fun searchForAutocomplete(keyword: String, dataType: String, size: Int): List<AutocompleteResultDto> {
        val results = searchOperationDataByKeyword(dataType, keyword, size, null, null)
        return results.map { result ->
            AutocompleteResultDto(
                id = result.operationDataId,
                value = result.level3 ?: result.level2 ?: result.level1 ?: "",
                label = "${result.level1 ?: ""} > ${result.level2 ?: ""} > ${result.level3 ?: ""}".replace(" >  > ", " > ").replace(" > $", "")
            )
        }
    }

    // 내부 메서드: 키워드로 Operation Data 검색
    private fun searchOperationDataByKeyword(
        dataType: String,
        keyword: String,
        size: Int,
        level1Filter: String?,
        level2Filter: String?
    ): List<OperationDataResponseDto> {
        val pageable = PageRequest.of(0, size)

        // level1Filter, level2Filter를 코드로 변환
        val level1Code = if (level1Filter != null) {
            operationDataLevelCodeRepository.findByDataTypeAndLevelTypeAndLevelValue(dataType, LevelType.level1, level1Filter)?.code
        } else null

        val level2Code = if (level2Filter != null) {
            operationDataLevelCodeRepository.findByDataTypeAndLevelTypeAndLevelValue(dataType, LevelType.level2, level2Filter)?.code
        } else null

        val page = operationDataRepository.findOperationDataWithJoin(
            dataType = dataType,
            level1 = level1Code,
            level2 = level2Code,
            level3 = null,
            keyword = keyword,
            pageable = pageable
        )

        return page.content
    }

    // 데이터 타입 코드로 이름 조회
    private fun getDataTypeName(dataTypeCode: String): String {
        return operationDataTypeRepository.findByCode(dataTypeCode)?.name ?: dataTypeCode
    }
}