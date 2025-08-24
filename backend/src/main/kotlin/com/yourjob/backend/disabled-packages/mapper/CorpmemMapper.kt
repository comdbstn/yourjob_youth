package com.yourjob.backend.mapper

import com.yourjob.backend.entity.ApplicationResponse
import com.yourjob.backend.entity.CompanyInfo
import com.yourjob.backend.entity.JobResponse
import com.yourjob.backend.entity.UserResponse
import org.apache.ibatis.annotations.Mapper
import org.springframework.stereotype.Repository

@Repository
@Mapper
interface CorpmemMapper {
    fun selectListJobApply(jobid: Int?): List<MutableMap<String, Any>>
    fun selectMyJobList(userId: Int?): List<JobResponse>
    fun selectMyJobCnt(userId: Int?): Int
    fun insertResumeView(mutableMap: MutableMap<String, Any>): Int
    fun selectMyJobApplierCnt(mutableMap: MutableMap<String, Any>): Int
    fun selectMyJobApplierCntStatus(mutableMap: MutableMap<String, Any>): Int
    fun selectMyJobOffersCnt(userId: Int?): Int
    fun selectCompanyInfo(userId: Int?): CompanyInfo
    fun updateCompanyInfo(companyInfo: CompanyInfo): Int
    fun updateCompanyInfoLogoUrl(companyInfo: CompanyInfo): Int
    fun updateUserInfo(mutableMap: MutableMap<String, Any>): Int
    fun updateCorpThmbImgIdx(mutableMap: MutableMap<String, Any>): Int
    fun updateCorpCertImgIdx(mutableMap: MutableMap<String, Any>): Int
}