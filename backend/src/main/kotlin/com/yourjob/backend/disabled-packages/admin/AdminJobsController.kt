package com.yourjob.backend.controller.admin

import com.yourjob.backend.entity.JobListResponse
import com.yourjob.backend.service.JobsService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.text.SimpleDateFormat

@RestController
@RequestMapping("/api/v1")
class AdminJobsController (private var jobsService: JobsService){
    @GetMapping("/admin/jobs")
    fun api_v1_admin_jobs_list(session: HttpSession, request: HttpServletRequest, status: String, paid: String, locationType: String, region: String, jobType: String, startDate: String, endDate: String, keyword: String, page: Int, size: Int): ResponseEntity<Any>{
        val user_id = session.getAttribute("userId")
        if(user_id == null){
            //return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        var req_page = 1
        var req_size = 10
        if(page != null && size != null && size > 0){
            req_page = page + 1
            req_size = size
        }
        var re = request.queryString
        var offSetNumb = getOffSetNumb(req_page, req_size)
        var jobsList = jobsService.selectJobList(keyword, locationType, page, size, offSetNumb)

        if (jobsList != null) {
            // 필터링 로직 구현
            jobsList = jobsList.filter { job ->
                var includeJob = true

                if (job != null) {
                    // 상태 필터링
                    if (status != "" && status != "상태") {
                        includeJob = includeJob && job.status == status
                    }

                    // locationType 필터링
                    if (locationType != "" && locationType != "국가") {
                        includeJob = includeJob && job.locationType == locationType
                    }

                    // 지역 필터링
                    if (region != "" && region != "지역") {
                        val regionList = job.region?.split(",")?.map { it.trim() } ?: emptyList()
                        includeJob = includeJob && regionList.contains(region)
                    }

                    // 직종 필터링
                    if (jobType != "" && jobType != "직종") {
                        // 쉼표로 구분된 직종 목록을 분리하여 리스트로 변환
                        val jobTypeList = job.jobType?.split(",")?.map { it.trim() } ?: emptyList()
                        // 입력된 jobType이 리스트에 포함되어 있는지 확인
                        includeJob = includeJob && jobTypeList.contains(jobType)
                    }

                    // 날짜 필터링
                    if (startDate != "" && endDate != "") {
                        try {
                            val format = SimpleDateFormat("yyyy-MM-dd")
                            val requestStartDate = format.parse(startDate)
                            val requestEndDate = format.parse(endDate)

                            // job.startDate와 job.endDate를 Date 객체로 변환
                            val jobStartDate = job.startDate?.let { format.parse(it) }
                            val jobEndDate = job.endDate?.let { format.parse(it) }

                            // 채용공고의 기간이 선택된 기간과 겹치는지 확인
                            if (jobStartDate != null && jobEndDate != null) {
                                includeJob =
                                    includeJob && (jobStartDate <= requestEndDate && jobEndDate >= requestStartDate)
                            }
                        } catch (e: Exception) {
                            // 날짜 형식이 잘못된 경우 필터링 무시
                        }
                    }

                    // 키워드 필터링 (이미 서비스에서 필터링했을 수 있지만 추가 검사)
                    if (keyword != "") {
                        includeJob = includeJob && (
                                job.title?.contains(keyword, ignoreCase = true) == true ||
                                        job.companyName?.contains(keyword, ignoreCase = true) == true ||
                                        job.description?.contains(keyword, ignoreCase = true) == true ||
                                        job.position?.contains(keyword, ignoreCase = true) == true
                                )
                    }
                }

                includeJob
            }
            for (job in jobsList) {
                if (job != null) {
                    job.logo_url = "http://localhost:8082/api/v1/image/show/" + job.corpthmbImgidx.toString()
                    job.description = job.position
                }
            }
        }

        var sMap = mutableMapOf<String, Any>()
        var jobsCnt = jobsService.selectJobListCount(keyword, locationType, offSetNumb)
        //jobsCnt = 90
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

        if(re.contains("country=all")){//메인
            return ResponseEntity(jobsList.toTypedArray(), HttpStatus.OK)
        }else{
            return ResponseEntity(jobListResponse, HttpStatus.OK)
        }
        return ResponseEntity(HttpStatus.OK)
    }
    fun getOffSetNumb(page: Int, size: Int):Int{
        return (page - 1) * size
    }
}