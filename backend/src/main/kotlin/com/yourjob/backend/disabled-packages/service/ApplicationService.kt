package com.yourjob.backend.service

import com.yourjob.backend.entity.ApplicationRequest
import com.yourjob.backend.entity.ApplicationResponse
import com.yourjob.backend.entity.Volunteer
import com.yourjob.backend.entity.VolunteerListResponse
import com.yourjob.backend.mapper.ApplicationMapper
import org.springframework.stereotype.Service

@Service
class ApplicationService (private var applicationMapper: ApplicationMapper) {
    fun insertApplication(applicationRequest: ApplicationRequest): Int{
        return applicationMapper.insertApplication(applicationRequest)
    }
    fun selectCntMyApply(applicationRequest: ApplicationRequest): Int{
        return applicationMapper.selectCntMyApply(applicationRequest)
    }
    fun selectListMyApply(mutableMap: MutableMap<String, Any>): List<ApplicationResponse>? {
        return applicationMapper.selectListMyApply(mutableMap)
    }
    fun selectListMyApplyCnt(userid: Int): Int{
        return applicationMapper.selectListMyApplyCnt(userid)
    }
    fun selectApplyListByJobId(jobid: Int): List<Volunteer>{
        return applicationMapper.selectApplyListByJobId(jobid)
    }
    fun selectApplyDetail(applicationId: Int): MutableMap<String, Any>{
        return applicationMapper.selectApplyDetail(applicationId)
    }
    fun updateApplyStatus(mutableMap: MutableMap<String, Any>): Int{
        return applicationMapper.updateApplyStatus(mutableMap)
    }
    fun updateApplyAttchFilesIdx(mutableMap: MutableMap<String, Any>): Int{
        return applicationMapper.updateApplyAttchFilesIdx(mutableMap)
    }
}