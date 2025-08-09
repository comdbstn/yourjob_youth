package com.yourjob.backend.service

import com.yourjob.backend.entity.ApplicationResponse
import com.yourjob.backend.entity.CompanyInfo
import com.yourjob.backend.entity.JobResponse
import com.yourjob.backend.entity.UserResponse
import com.yourjob.backend.mapper.CorpmemMapper
import org.springframework.stereotype.Service

@Service
class CorpmemService (private var corpmemMapper: CorpmemMapper) {
    fun selectListJobApply(jobid: Int?): List<MutableMap<String, Any>>?{
        return corpmemMapper.selectListJobApply(jobid)
    }
    fun selectMyJobList(userId: Int): List<JobResponse>{
        return corpmemMapper.selectMyJobList(userId)
    }
    fun selectMyJobCnt(userId: Int): Int{
        return corpmemMapper.selectMyJobCnt(userId)
    }
    fun insertResumeView(mutableMap: MutableMap<String, Any>): Int{
        return corpmemMapper.insertResumeView(mutableMap)
    }
    fun selectMyJobApplierCnt(mutableMap: MutableMap<String, Any>): Int{
        return corpmemMapper.selectMyJobApplierCnt(mutableMap)
    }
    fun selectMyJobApplierCntStatus(mutableMap: MutableMap<String, Any>): Int{
        return corpmemMapper.selectMyJobApplierCntStatus(mutableMap)
    }
    fun selectMyJobOffersCnt(userId: Int): Int{
        return corpmemMapper.selectMyJobOffersCnt(userId)
    }
    fun selectCompanyInfo(userId: Int): CompanyInfo {
        return corpmemMapper.selectCompanyInfo(userId)
    }
    fun updateUserInfo(mutableMap: MutableMap<String, Any>): Int{
        return corpmemMapper.updateUserInfo(mutableMap)
    }
    fun updateCorpThmbImgIdx(mutableMap: MutableMap<String, Any>): Int{
        return corpmemMapper.updateCorpThmbImgIdx(mutableMap)
    }
    fun updateCorpCertImgIdx(mutableMap: MutableMap<String, Any>): Int {
        return corpmemMapper.updateCorpCertImgIdx(mutableMap)
    }
    fun updateCompanyInfo(companyInfo: CompanyInfo): Int{
        return corpmemMapper.updateCompanyInfo(companyInfo)
    }
    fun updateCompanyInfoLogoUrl(companyInfo: CompanyInfo): Int{
        return corpmemMapper.updateCompanyInfoLogoUrl(companyInfo)
    }

    fun getCompanyInfo(userId: Int): CompanyInfo? {
        return corpmemMapper.selectCompanyInfo(userId)
    }
}