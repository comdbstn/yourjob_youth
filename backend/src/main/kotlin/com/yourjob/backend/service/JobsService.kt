package com.yourjob.backend.service

import com.yourjob.backend.entity.JobRequest
import com.yourjob.backend.entity.JobResponse
import com.yourjob.backend.mapper.JobsMapper
import org.springframework.stereotype.Service

@Service
class JobsService (private var jobsMapper: JobsMapper){
    fun selectJobList(query: String?, location: String?, page: Int, size: Int, offSetNumb: Int): List<JobResponse?>?{
        return jobsMapper.selectJobList(query, location, page, size, offSetNumb)
    }
    fun selectJobSrchList(
        op_jobType_arr: ArrayList<String>?,
        op_location_arr: ArrayList<String>?,
        op_type_arr: ArrayList<String>?,
        op_company_arr: ArrayList<String>?, // Int에서 String으로 변경
        location: String?,
        query: String?,
        page: Int,
        size: Int,
        offSetNumb: Int
    ): List<JobResponse?>? {
        return jobsMapper.selectJobSrchList(op_jobType_arr, op_location_arr, op_type_arr, op_company_arr, location, query, page, size, offSetNumb)
    }

    fun selectJobListCount(query: String?, location: String?, offSetNumb: Int): Int{
        return jobsMapper.selectJobListCount(query, location, offSetNumb)
    }
    fun selectJobSrchListCount(
        op_jobType_arr: ArrayList<String>?,
        op_location_arr: ArrayList<String>?,
        op_type_arr: ArrayList<String>?,
        op_company_arr: ArrayList<String>?, // Int에서 String으로 변경
        location: String?,
        query: String?,
        page: Int,
        size: Int,
        offSetNumb: Int
    ): Int {
        return jobsMapper.selectJobSrchListCount(op_jobType_arr, op_location_arr, op_type_arr, op_company_arr, location, query, page, size, offSetNumb)
    }
    fun selectJobListCorp(mutableMap: MutableMap<String, Any>): List<JobResponse?>?{
        return jobsMapper.selectJobListCorp(mutableMap)
    }
    fun selectJobListCorpCnt(mutableMap: MutableMap<String, Any>): Int{
        return jobsMapper.selectJobListCorpCnt(mutableMap)
    }
    fun selectJobCnt(mutableMap: MutableMap<String, Any>): Int{
        return jobsMapper.selectJobCnt(mutableMap)
    }
    fun selectJobStatusCnt(mutableMap: MutableMap<String, Any>): ArrayList<MutableMap<String, Any>>{
        return jobsMapper.selectJobStatusCnt(mutableMap)
    }
    fun updateJobStatus(mutableMap: MutableMap<String, Any>): Int{
        return jobsMapper.updateJobStatus(mutableMap)
    }
    fun incJobViewCnt(mutableMap: MutableMap<String, Any>): Int{
        return jobsMapper.incJobViewCnt(mutableMap)
    }
    fun insertJob(jobRequest: JobRequest): Int{
        return jobsMapper.insertJob(jobRequest)
    }
    
    /**
     * 크롤러 통합용 채용공고 생성
     */
    fun createJobPosting(jobRequest: JobRequest): JobResponse? {
        val insertedId = jobsMapper.insertJob(jobRequest)
        if (insertedId > 0) {
            // 생성된 채용공고 정보 반환 (임시 구현)
            return JobResponse(
                jobId = insertedId,
                title = jobRequest.title,
                companyName = "", // JobRequest에 없으므로 빈 값
                location = jobRequest.location,
                salary = jobRequest.salary?.toString(),
                status = "OPEN" // 기본값
            )
        }
        return null
    }
    fun insertJobScrap(mutableMap: MutableMap<String, Any>): Int{
        return jobsMapper.insertJobScrap(mutableMap)
    }
    fun selectJobScrapList(mutableMap: MutableMap<String, Any>): ArrayList<MutableMap<String, Any>>{
        return jobsMapper.selectJobScrapList(mutableMap)
    }
    fun selectJobScrapListCnt(mutableMap: MutableMap<String, Any>): Int{
        return jobsMapper.selectJobScrapListCnt(mutableMap)
    }
    fun selectJobTypeList(mutableMap: MutableMap<String, Any>): ArrayList<Any>{
        return jobsMapper.selectJobTypeList(mutableMap)
    }
    fun insertCorpJob(reqMap: MutableMap<String, Any>): Int {
        return jobsMapper.insertCorpJob(reqMap)
    }
    fun updateCorpJob(reqMap: MutableMap<String, Any>): Int {
        return jobsMapper.updateCorpJob(reqMap)
    }
    fun insertEmpJobType(mutableMap: MutableMap<String, Any>): Int{
        return jobsMapper.insertEmpJobType(mutableMap)
    }
    fun deleteEmpJobType(jobId: Int): Int{
        return jobsMapper.deleteEmpJobType(jobId)
    }
    fun deleteJobType(jobId: Int): Int{
        return jobsMapper.deleteJobType(jobId)
    }
    fun insertJobType(mutableMap: MutableMap<String, Any>): Int{
        return jobsMapper.insertJobType(mutableMap)
    }
    fun selectJobDetail(jobId: Int): JobResponse{
        return jobsMapper.selectJobDetail(jobId)
    }
    fun selectJobDetail2(jobId: Int): MutableMap<String, Any>{
        return jobsMapper.selectJobDetail2(jobId)
    }
    fun updateJobInfo(jobRequest: JobRequest): Int{
        return jobsMapper.updateJobInfo(jobRequest)
    }
    fun updateResumeYourJobFileIdx(mutableMap: MutableMap<String, Any>): Int{
        return jobsMapper.updateResumeYourJobFileIdx(mutableMap)
    }
    fun updateResumeCompanyFileIdx(mutableMap: MutableMap<String, Any>): Int{
        return jobsMapper.updateResumeCompanyFileIdx(mutableMap)
    }
    fun deleteJob(jobId: Int): Int{
        return jobsMapper.deleteJob(jobId)
    }
    fun deleteScrapJob(jobId: Int): Int{
        return jobsMapper.deleteScrapJob(jobId)
    }
    fun migrateJobTypeStrToJobType(): Int{
        return jobsMapper.migrateJobTypeStrToJobType()
    }
}