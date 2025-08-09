package com.yourjob.backend.controller

import com.yourjob.backend.entity.JobListResponse
import com.yourjob.backend.entity.JobStatusUpdateRequest
import com.yourjob.backend.service.EmployerService
import com.yourjob.backend.service.JobsService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.io.IOException

@RestController
@RequestMapping("/api/v1")
class EmployersController (private var employerService: EmployerService) {
    @GetMapping("/employers/{employerId}/jobs")
    fun api_v1_employers_jobs(@PathVariable employerId: Int, status: String, page: Int, size: Int): ResponseEntity<JobListResponse?> {
        var mMap = mutableMapOf<String, Any>()
        mMap.put("employerid", employerId)
        mMap.put("status", status)
        mMap.put("page", page)
        mMap.put("size", size)
        val jobsList = employerService.selectJobListByEmp(mMap)
        var jobsCnt = employerService.selectJobCntByEmp(employerId)
        jobsCnt = 90
        val jobListResponse = JobListResponse()
        jobListResponse.content = jobsList!!.toTypedArray()
        jobListResponse.page = page
        jobListResponse.size = size
        jobListResponse.totalElements = jobsCnt
        var pageCnt = jobsCnt / size
        var pageCnt_remain = jobsCnt % size
        if (pageCnt_remain > 0) {
            pageCnt = pageCnt + 1
        }
        jobListResponse.totalPages = pageCnt
        return ResponseEntity(jobListResponse, HttpStatus.OK)
    }
    @GetMapping("/employers/{employerId}/jobs/{jobId}/status")
    fun api_v1_employers_job_status(@PathVariable employerId: Int, @PathVariable jobId: Int): ResponseEntity<MutableMap<String, Any>>{
        //var jobsCnt = employerService.selectJobCntByEmp(employerId)
        try {
            var mMap = mutableMapOf<String, Any>()
            mMap.put("employerid", employerId)
            mMap.put("jobid", jobId)
            var jobStatus = employerService.selectJobStatusByEmp(mMap)
            mMap.clear()
            mMap.put("jobId", jobId)
            mMap.put("status", jobStatus.status.toString())
            return ResponseEntity(mMap, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.BAD_REQUEST)
        }
    }
    @PutMapping("/employers/{employerId}/jobs/{jobId}/status")
    fun api_v1_employers_job_status_edit(@PathVariable employerId: Int, @PathVariable jobId: Int, status: String): ResponseEntity<JobStatusUpdateRequest>{
        //var jobsCnt = employerService.selectJobCntByEmp(employerId)
        try {
            var mMap = mutableMapOf<String, Any>()
            mMap.put("employerid", employerId)
            mMap.put("jobid", jobId)
            mMap.put("status", status)
            employerService.updateJobStatusByEmp(mMap)
            var jobStatus = employerService.selectJobStatusByEmp(mMap)
            mMap.clear()
            var jobUpdate_request = JobStatusUpdateRequest()
            jobUpdate_request.status = status
            mMap.put("jobId", jobId)
            mMap.put("status", jobStatus.status.toString())
            return ResponseEntity(jobUpdate_request, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.BAD_REQUEST)
        }
    }
}