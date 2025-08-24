package com.yourjob.backend.mapper

import com.yourjob.backend.entity.ApplicationRequest
import com.yourjob.backend.entity.ApplicationResponse
import com.yourjob.backend.entity.Volunteer
import com.yourjob.backend.entity.VolunteerListResponse
import org.apache.ibatis.annotations.Mapper
import org.apache.ibatis.annotations.Param
import org.springframework.stereotype.Repository

@Repository
@Mapper
interface ApplicationMapper {
    fun insertApplication(@Param("applicationRequest") applicationRequest: ApplicationRequest): Int
    fun selectCntMyApply(@Param("applicationRequest") applicationRequest: ApplicationRequest): Int
    fun selectListMyApply(@Param("mutableMap") mutableMap: MutableMap<String, Any>): List<ApplicationResponse>
    fun selectListMyApplyCnt(@Param("userid") userid: Int): Int
    fun selectApplyListByJobId(@Param("jobid") jobid: Int): List<Volunteer>
    fun selectApplyDetail(@Param("applicationId") applicationId: Int): MutableMap<String, Any>
    fun updateApplyStatus(@Param("mutableMap") mutableMap: MutableMap<String, Any>): Int
    fun updateApplyAttchFilesIdx(@Param("mutableMap") mutableMap: MutableMap<String, Any>): Int
}