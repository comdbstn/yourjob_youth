package com.yourjob.backend.mapper

import com.yourjob.backend.entity.JobRequest
import com.yourjob.backend.entity.JobResponse
import org.apache.ibatis.annotations.Mapper
import org.springframework.stereotype.Repository

@Repository
@Mapper
interface JobsMapper {
    fun selectJobList(query: String?, location: String?, page: Int, size: Int, offSetNumb: Int): List<JobResponse?>?

    fun selectJobSrchList(
        op_jobType_arr: ArrayList<String>?,
        op_location_arr: ArrayList<String>?,
        op_type_arr: ArrayList<String>?,
        op_company_arr: ArrayList<String>?, // operation_data_id 리스트
        location: String?,
        query: String?,
        page: Int,
        size: Int,
        offSetNumb: Int
    ): List<JobResponse?>?

    fun selectJobListCount(query: String?, location: String?, offSetNumb: Int): Int

    fun selectJobSrchListCount(
        op_jobType_arr: ArrayList<String>?,
        op_location_arr: ArrayList<String>?,
        op_type_arr: ArrayList<String>?,
        op_company_arr: ArrayList<String>?, // operation_data_id 리스트
        location: String?,
        query: String?,
        page: Int,
        size: Int,
        offSetNumb: Int
    ): Int

    fun selectJobListCorp(mutableMap: MutableMap<String, Any>): List<JobResponse?>?
    fun selectJobListCorpCnt(mutableMap: MutableMap<String, Any>): Int
    fun selectJobCnt(mutableMap: MutableMap<String, Any>): Int
    fun selectJobStatusCnt(mutableMap: MutableMap<String, Any>): ArrayList<MutableMap<String, Any>>
    fun updateJobStatus(mutableMap: MutableMap<String, Any>): Int
    fun incJobViewCnt(mutableMap: MutableMap<String, Any>): Int
    fun insertJob(jobRequest: JobRequest): Int
    fun insertJobScrap(mutableMap: MutableMap<String, Any>): Int
    fun selectJobScrapList(mutableMap: MutableMap<String, Any>): ArrayList<MutableMap<String, Any>>
    fun selectJobScrapListCnt(mutableMap: MutableMap<String, Any>): Int
    fun selectJobTypeList(mutableMap: MutableMap<String, Any>): ArrayList<Any>
    fun insertCorpJob(reqMap: MutableMap<String, Any>): Int
    fun updateCorpJob(reqMap: MutableMap<String, Any>): Int
    fun insertJobType(mutableMap: MutableMap<String, Any>): Int
    fun insertEmpJobType(mutableMap: MutableMap<String, Any>): Int
    fun deleteEmpJobType(jobId: Int): Int
    fun deleteJobType(jobId: Int): Int
    fun selectJobDetail(jobId: Int): JobResponse
    fun selectJobDetail2(jobId: Int): MutableMap<String, Any>
    fun updateJobInfo(jobRequest: JobRequest): Int
    fun updateResumeYourJobFileIdx(mutableMap: MutableMap<String, Any>): Int
    fun updateResumeCompanyFileIdx(mutableMap: MutableMap<String, Any>): Int
    fun deleteJob(int: Int): Int
    fun deleteScrapJob(int: Int): Int
    fun migrateJobTypeStrToJobType(): Int
}