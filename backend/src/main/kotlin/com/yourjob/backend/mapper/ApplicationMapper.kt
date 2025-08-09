package com.yourjob.backend.mapper

import com.yourjob.backend.entity.ApplicationRequest
import com.yourjob.backend.entity.ApplicationResponse
import com.yourjob.backend.entity.Volunteer
import com.yourjob.backend.entity.VolunteerListResponse
import org.apache.ibatis.annotations.Mapper
import org.springframework.stereotype.Repository

@Repository
@Mapper
interface ApplicationMapper {
    fun insertApplication(applicationRequest: ApplicationRequest): Int
    fun selectCntMyApply(applicationRequest: ApplicationRequest): Int
    fun selectListMyApply(mutableMap: MutableMap<String, Any>): List<ApplicationResponse>
    fun selectListMyApplyCnt(userid: Int): Int
    fun selectApplyListByJobId(jobid: Int): List<Volunteer>
    fun selectApplyDetail(applicationId: Int): MutableMap<String, Any>
    fun updateApplyStatus(mutableMap: MutableMap<String, Any>): Int
    fun updateApplyAttchFilesIdx(mutableMap: MutableMap<String, Any>): Int
}