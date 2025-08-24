package com.yourjob.backend.mapper

import com.yourjob.backend.entity.JobOffer
import com.yourjob.backend.entity.JobOfferCreate
import com.yourjob.backend.entity.JobOfferUpdate
import org.apache.ibatis.annotations.Mapper
import org.springframework.stereotype.Repository

@Repository
@Mapper
interface JoboffersMapper {
    fun selectJoboffersList(mutableMap: MutableMap<String, Any>): List<JobOffer?>?
    fun selectJobofferProposalList(mutableMap: MutableMap<String, Any>): ArrayList<Any>
    fun selectJobofferProposalCnt(mutableMap: MutableMap<String, Any>): Int
    fun selectJobofferProposalInfo(mutableMap: MutableMap<String, Any>): MutableMap<String, Any>
    fun selectJobofferProposalInfoByResumeId(mutableMap: MutableMap<String, Any>): MutableMap<String, Any>
    fun selectJoboffersInfo(int: Int): JobOffer
    fun insertJoboffer(jobOffer: JobOffer): Int
    fun selectJobofferDone(jobOffer: JobOffer): MutableMap<String, Any>?
    fun updateJoboffer(jobOfferUpdate: JobOfferUpdate): Int
    fun deleteJoboffer(id: Int): Int
    fun updateJobofferStatus(mutableMap: MutableMap<String, Any>): Int
    fun updateJobofferInterviewStatus(mutableMap: MutableMap<String, Any>): Int
}