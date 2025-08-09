package com.yourjob.backend.repository.mdms

import com.yourjob.backend.entity.mdms.LevelType
import com.yourjob.backend.entity.mdms.OperationData
import com.yourjob.backend.entity.mdms.OperationDataLevelCode
import com.yourjob.backend.entity.mdms.OperationDataResponseDto
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.List


@Repository
interface OperationDataRepository : JpaRepository<OperationData, Long> {

    fun findByOperationDataId(operationDataId: String): OperationData?

    // dataType별 operation_data_id 내림차순 첫 번째 조회 (최신 ID 찾기용)
    fun findFirstByDataTypeOrderByOperationDataIdDesc(dataType: String): OperationData?

    @Query("""
        SELECT NEW com.yourjob.backend.entity.mdms.OperationDataResponseDto(
            o.operationDataId,
            o.dataType,
            dt.name,
            o.level1,
            COALESCE(lc1.levelValue, ''),
            o.level2,
            COALESCE(lc2.levelValue, ''),
            o.level3,
            COALESCE(lc3.levelValue, ''),
            o.createdAt,
            o.updatedAt
        )
        FROM OperationData o
        LEFT JOIN OperationDataType dt ON o.dataType = dt.code
        LEFT JOIN OperationDataLevelCode lc1 ON o.level1 = lc1.code AND lc1.levelType = 'level1'
        LEFT JOIN OperationDataLevelCode lc2 ON o.level2 = lc2.code AND lc2.levelType = 'level2'
        LEFT JOIN OperationDataLevelCode lc3 ON o.level3 = lc3.code AND lc3.levelType = 'level3'
        WHERE (:dataType IS NULL OR o.dataType = :dataType)
        AND (:level1 IS NULL OR o.level1 = :level1)
        AND (:level2 IS NULL OR o.level2 = :level2)
        AND (:level3 IS NULL OR o.level3 = :level3)
        AND (:keyword IS NULL OR 
              o.operationDataId LIKE %:keyword% OR
              lc1.levelValue LIKE %:keyword% OR
              lc2.levelValue LIKE %:keyword% OR
              lc3.levelValue LIKE %:keyword%)
        ORDER BY o.createdAt DESC
    """)
    fun findOperationDataWithJoin(
        @Param("dataType") dataType: String?,
        @Param("level1") level1: String?,
        @Param("level2") level2: String?,
        @Param("level3") level3: String?,
        @Param("keyword") keyword: String?,
        pageable: Pageable
    ): Page<OperationDataResponseDto>

    // School용 (level3만) - 수정된 버전
    @Query("""
        SELECT NEW com.yourjob.backend.entity.mdms.OperationDataResponseDto(
            o.operationDataId,
            o.dataType,
            dt.name,
            '',
            '',
            '',
            '',
            o.level3,
            COALESCE(lc3.levelValue, ''),
            o.createdAt,
            o.updatedAt
        )
        FROM OperationData o
        LEFT JOIN OperationDataType dt ON o.dataType = dt.code
        LEFT JOIN OperationDataLevelCode lc3 ON o.level3 = lc3.code AND lc3.levelType = 'level3'
        WHERE (:dataType IS NULL OR o.dataType = :dataType)
        AND (:keyword IS NULL OR lc3.levelValue LIKE %:keyword%)
        ORDER BY o.createdAt DESC
    """)
    fun findSchoolOperationDataWithJoin(
        @Param("dataType") dataType: String?,
        @Param("keyword") keyword: String?,
        pageable: Pageable
    ): Page<OperationDataResponseDto>

    // Major용 (level2만) - 수정된 버전
    @Query("""
        SELECT NEW com.yourjob.backend.entity.mdms.OperationDataResponseDto(
            o.operationDataId,
            o.dataType,
            dt.name,
            '',
            '',
            o.level2,
            COALESCE(lc2.levelValue, ''),
            '',
            '',
            o.createdAt,
            o.updatedAt
        )
        FROM OperationData o
        LEFT JOIN OperationDataType dt ON o.dataType = dt.code
        LEFT JOIN OperationDataLevelCode lc2 ON o.level2 = lc2.code AND lc2.levelType = 'level2'
        WHERE (:dataType IS NULL OR o.dataType = :dataType)
        AND (:keyword IS NULL OR lc2.levelValue LIKE %:keyword%)
        ORDER BY o.createdAt DESC
    """)
    fun findMajorOperationDataWithJoin(
        @Param("dataType") dataType: String?,
        @Param("keyword") keyword: String?,
        pageable: Pageable
    ): Page<OperationDataResponseDto>

    @Query("""
        SELECT NEW com.yourjob.backend.entity.mdms.OperationDataResponseDto(
            o.operationDataId,
            o.dataType,
            dt.name,
            o.level1,
            COALESCE(lc1.levelValue, ''),
            o.level2,
            COALESCE(lc2.levelValue, ''),
            o.level3,
            COALESCE(lc3.levelValue, ''),
            o.createdAt,
            o.updatedAt
        )
        FROM OperationData o
        LEFT JOIN OperationDataType dt ON o.dataType = dt.code
        LEFT JOIN OperationDataLevelCode lc1 ON o.level1 = lc1.code AND lc1.levelType = 'level1'
        LEFT JOIN OperationDataLevelCode lc2 ON o.level2 = lc2.code AND lc2.levelType = 'level2'
        LEFT JOIN OperationDataLevelCode lc3 ON o.level3 = lc3.code AND lc3.levelType = 'level3'
        WHERE o.operationDataId = :operationDataId
    """)
    fun findOperationDataWithJoinById(@Param("operationDataId") operationDataId: String): OperationDataResponseDto?

    @Query("""
        SELECT o FROM OperationData o 
        WHERE (:dataType IS NULL OR o.dataType = :dataType)
        AND (:level1 IS NULL OR o.level1 = :level1)
        AND (:level2 IS NULL OR o.level2 = :level2)
        AND (:level3 IS NULL OR o.level3 = :level3)
        AND (:keyword IS NULL OR 
              o.operationDataId LIKE %:keyword% OR
              o.level1 LIKE %:keyword% OR
              o.level2 LIKE %:keyword% OR
              o.level3 LIKE %:keyword%)
        ORDER BY o.createdAt DESC
    """)
    fun findByFiltersAndKeywordPaging(
        @Param("dataType") dataType: String?,
        @Param("level1") level1: String?,
        @Param("level2") level2: String?,
        @Param("level3") level3: String?,
        @Param("keyword") keyword: String?,
        pageable: Pageable
    ): Page<OperationData>

    fun findByLevel1(level1: String): List<OperationData>
    fun findByLevel2(level2: String): List<OperationData>
    fun findByLevel3(level3: String): List<OperationData>

    @Query("""
        SELECT COUNT(o)
        FROM OperationData o
        LEFT JOIN OperationDataLevelCode lc1 ON o.level1 = lc1.code AND lc1.levelType = 'level1'
        LEFT JOIN OperationDataLevelCode lc2 ON o.level2 = lc2.code AND lc2.levelType = 'level2'
        LEFT JOIN OperationDataLevelCode lc3 ON o.level3 = lc3.code AND lc3.levelType = 'level3'
        WHERE (:dataType IS NULL OR o.dataType = :dataType)
        AND (:level1 IS NULL OR o.level1 = :level1)
        AND (:level2 IS NULL OR o.level2 = :level2)
        AND (:level3 IS NULL OR o.level3 = :level3)
        AND (:keyword IS NULL OR 
              o.operationDataId LIKE %:keyword% OR
              lc1.levelValue LIKE %:keyword% OR
              lc2.levelValue LIKE %:keyword% OR
              lc3.levelValue LIKE %:keyword%)
    """)
    fun countByFilters(
        @Param("dataType") dataType: String?,
        @Param("level1") level1: String?,
        @Param("level2") level2: String?,
        @Param("level3") level3: String?,
        @Param("keyword") keyword: String?
    ): Long

    fun findByDataTypeAndLevel1(dataType: String, level1: String): List<OperationData>
}