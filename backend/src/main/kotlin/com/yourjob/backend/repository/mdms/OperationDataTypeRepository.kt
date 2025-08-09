package com.yourjob.backend.repository.mdms

import com.yourjob.backend.entity.mdms.OperationDataType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface OperationDataTypeRepository : JpaRepository<OperationDataType, Int> {

    // code로 조회
    fun findByCode(code: String): OperationDataType?

    // name으로 조회
    fun findByName(name: String): OperationDataType?
}