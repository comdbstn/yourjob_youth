package com.yourjob.backend.service

import com.yourjob.backend.mapper.FileUtilMapper
import org.springframework.stereotype.Service

@Service
class FileUtilService (private var fileUtilMapper: FileUtilMapper) {
    fun insertJobResumeFileData(mutableMap: MutableMap<String, Any>): Int{
        return fileUtilMapper.insertJobResumeFileData(mutableMap)
    }
    fun getFileDataByIdx(mutableMap: MutableMap<String, Any>): MutableMap<String, Any> {
        return fileUtilMapper.getFileDataByIdx(mutableMap)
    }
}