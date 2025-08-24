package com.yourjob.backend.mapper

import com.yourjob.backend.entity.JobResponse
import org.apache.ibatis.annotations.Mapper
import org.springframework.stereotype.Repository

@Repository
@Mapper
interface EmployerMapper {
    fun selectJobListByEmp(map: MutableMap<String, Any>): List<JobResponse?>?
    fun selectJobCntByEmp(employerId: Int): Int
    fun selectJobStatusByEmp(map: MutableMap<String, Any>): JobResponse
    fun updateJobStatusByEmp(map: MutableMap<String, Any>): Int
}