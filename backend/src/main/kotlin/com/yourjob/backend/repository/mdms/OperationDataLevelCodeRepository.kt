package com.yourjob.backend.repository.mdms

import com.yourjob.backend.entity.mdms.LevelType
import com.yourjob.backend.entity.mdms.OperationDataLevelCode
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface OperationDataLevelCodeRepository : JpaRepository<OperationDataLevelCode, Long> {

    fun findByDataTypeAndLevelTypeOrderByCode(
        dataType: String,
        levelType: LevelType
    ): List<OperationDataLevelCode>

    fun findByDataTypeAndLevelTypeAndLevelValue(
        dataType: String,
        levelType: LevelType,
        levelValue: String
    ): OperationDataLevelCode?

    // 새로 추가된 메서드
    fun findByDataTypeAndLevelTypeAndParentCodeOrderByCode(
        dataType: String,
        levelType: LevelType,
        parentCode: String
    ): List<OperationDataLevelCode>

    fun findByCodeAndDataType(
        code: String,
        dataType: String
    ): OperationDataLevelCode?

    // 마지막 코드 조회 (자동 증가를 위한 코드)
    fun findFirstByDataTypeAndLevelTypeOrderByCodeDesc(
        dataType: String,
        levelType: LevelType
    ): OperationDataLevelCode?

    // 특정 데이터 타입과 레벨에서 최대 코드 조회
    @Query("SELECT MAX(o.code) FROM OperationDataLevelCode o WHERE o.dataType = :dataType AND o.levelType = :levelType")
    fun findMaxCodeByDataTypeAndLevelType(
        @Param("dataType") dataType: String,
        @Param("levelType") levelType: LevelType
    ): String?

    fun findByCode(code: String): OperationDataLevelCode?

    // 검색을 위한 새로운 메서드들
    @Query("""
        SELECT o FROM OperationDataLevelCode o 
        WHERE o.dataType = :dataType 
        AND o.levelValue LIKE %:keyword% 
        ORDER BY o.levelValue
    """)
    fun findByDataTypeAndLevelValueContaining(
        @Param("dataType") dataType: String,
        @Param("keyword") keyword: String
    ): List<OperationDataLevelCode>

    @Query("""
        SELECT o FROM OperationDataLevelCode o 
        WHERE o.dataType = :dataType 
        AND o.levelType = :levelType 
        AND o.levelValue LIKE %:keyword% 
        ORDER BY o.levelValue
    """)
    fun findByDataTypeAndLevelTypeAndLevelValueContaining(
        @Param("dataType") dataType: String,
        @Param("levelType") levelType: LevelType,
        @Param("keyword") keyword: String
    ): List<OperationDataLevelCode>
}