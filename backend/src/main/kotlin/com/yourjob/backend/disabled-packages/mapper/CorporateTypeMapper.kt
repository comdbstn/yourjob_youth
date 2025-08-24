package com.yourjob.backend.mapper

import org.apache.ibatis.annotations.Mapper
import org.apache.ibatis.annotations.Select
import org.springframework.stereotype.Repository

@Repository
@Mapper
interface CorporateTypeMapper {
    @Select("SELECT corporate_type_id, corporate_type_name FROM corporate_types")
    fun getCorporateTypes(): List<Map<String, Any>>
}
