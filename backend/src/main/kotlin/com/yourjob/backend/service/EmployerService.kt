package com.yourjob.backend.service

import com.yourjob.backend.entity.JobResponse
import com.yourjob.backend.mapper.EmployerMapper
import org.springframework.stereotype.Service

@Service
class EmployerService (private var employerMapper: EmployerMapper){
    fun selectJobListByEmp(mMap: MutableMap<String, Any>): List<JobResponse?>? {
        return employerMapper.selectJobListByEmp(mMap)
    }
    fun selectJobCntByEmp(employerId: Int): Int{
        return employerMapper.selectJobCntByEmp(employerId)
    }
    fun selectJobStatusByEmp(mMap: MutableMap<String, Any>): JobResponse{
        return employerMapper.selectJobStatusByEmp(mMap)
    }
    fun updateJobStatusByEmp(mMap: MutableMap<String, Any>): Int{
        return employerMapper.updateJobStatusByEmp(mMap)
    }
}