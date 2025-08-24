package com.yourjob.backend.mapper

import org.apache.ibatis.annotations.Mapper
import org.springframework.stereotype.Repository

@Repository
@Mapper
interface FileUtilMapper {
    fun insertJobResumeFileData(mutableMap: MutableMap<String, Any>): Int
    fun getFileDataByIdx(mutableMap: MutableMap<String, Any>): MutableMap<String, Any>
}