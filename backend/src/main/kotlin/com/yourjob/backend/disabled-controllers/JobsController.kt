package com.yourjob.backend.controller

import com.yourjob.backend.entity.JobListResponse
import com.yourjob.backend.entity.JobRequest
import com.yourjob.backend.entity.JobResponse
import com.yourjob.backend.entity.SignupResponse
import com.yourjob.backend.repository.mdms.OperationDataRepository
import com.yourjob.backend.service.ApplicationService
import com.yourjob.backend.service.AuthService
import com.yourjob.backend.service.JobsService
import com.yourjob.backend.service.mdms.OperationDataService
import com.yourjob.backend.service.payment.PaymentService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpSession
import org.springdoc.core.service.OperationService
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.io.IOException
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.*
import kotlin.collections.ArrayList
import kotlin.reflect.typeOf

@RestController
@RequestMapping("/api/v1")
class JobsController (
    private var jobsService: JobsService,
    private var authService: AuthService,
    private var applicationService: ApplicationService,
    private var paymentService: PaymentService,
    private var operationDataRepository: OperationDataRepository,
    private var operationDataService: OperationDataService
) {

    var jobType_name_array = arrayOf("", "기획·전략", "법무·사무·총무", "인사·HR", "회계·세무", "마케팅·광고·MD", "개발·데이터", "디자인", "물류·무역", "경영·비즈니스기획", "웹기획", "마케팅기획", "PL·PM·PO", "컨설턴트", "CEO·COO·CTO")
    var location_name_array = arrayOf("", "서울", "경기", "광주", "대구", "대전", "부산", "울산", "인천", "강원", "경남", "경북", "전남", "전북", "충북", "충남", "제주", "전국", "세종")
    var type_name_array = arrayOf("", "정규직", "계약직", "인턴", "파견직", "도급", "프리랜서", "아르바이트", "연수생/교육생", "병역특례", "위촉직/개인사업자")
    var company_name_array = arrayOf("", "대기업", "중소기업", "공공기관/공기업", "외국계기업", "중견기업", "비영리단체/협회/재단", "스타트업", "금융권", "병원", "동아리/학생자치단체", "기타")

    @GetMapping("/jobs")
    fun api_vi_auth_jobs(
        session: HttpSession,
        request: HttpServletRequest,
        @RequestParam searchType: String?,
        @RequestParam query: String?,
        @RequestParam country: String?,
        @RequestParam jobType: String?, //직무 (기획 전략 등)
        @RequestParam location: String?,//근무지역 (서울, 경기 등)
        @RequestParam type: String?,    //채용형태 (정규직, 계약직 등)
        @RequestParam company: String?, //기업형태 (level code로 전달됨 예: 11A00025)
        @RequestParam page: Int,
        @RequestParam size: Int
    ): ResponseEntity<Any> {
        val user_id = session.getAttribute("userId")

        // level code에서 operation_data_id로 변환
        var op_jobType_arr: ArrayList<String>? = null
        var op_location_arr: ArrayList<String>? = null
        var op_type_arr: ArrayList<String>? = null
        var op_company_arr: ArrayList<String>? = null

        // 직무 코드로 operation data ID 찾기
        if (jobType != null && jobType.isNotEmpty()) {
            op_jobType_arr = getOperationDataIdsByLevelCodes(jobType.split(","), "00000009")
        }

        // 위치 코드로 operation data ID 찾기 - 국내/해외 처리
        if (location != null && location.isNotEmpty()) {
            val locationDataType = if (country == "국내") "00000012" else "00000013"
            op_location_arr = getOperationDataIdsByLevelCodes(location.split(","), locationDataType)
        }

        // 채용형태 코드로 operation data ID 찾기
        if (type != null && type.isNotEmpty()) {
            op_type_arr = getOperationDataIdsByLevelCodes(type.split(","), "00000010")
        }

        // 기업형태 코드로 operation data ID 찾기
        if (company != null && company.isNotEmpty()) {
            op_company_arr = getOperationDataIdsByLevelCodes(company.split(","), "00000011")
        }

        // Scrap 정보 가져오기
        var scrapJobIdList = ArrayList<Int>()
        if(user_id != null){
            var mMap = mutableMapOf<String, Any>()
            mMap.put("userId", user_id)
            var scrapList = jobsService.selectJobScrapList(mMap)
            for(scrap in scrapList){
                scrapJobIdList.add(scrap.get("job_id").toString().toInt())
            }
        }

        // 지원 목록 가져오기
        var appliedJobList = ArrayList<Int>()
        if(user_id != null){
            var mMap = mutableMapOf<String, Any>()
            mMap.put("userid", user_id)
            mMap.put("offSetNumb", 0)
            mMap.put("page", 1)
            mMap.put("size", 100)
            var scrapList = applicationService.selectListMyApply(mMap)
            if (scrapList != null) {
                for(scrap in scrapList){
                    if (scrap != null) {
                        appliedJobList.add(scrap.jobId.toString().toInt())
                    }
                }
            }
        }

        var offSetNumb = getOffSetNumb(page, size)

        // 프리미엄 채용공고 조회 로직 (VVIP, VIP, SPECIAL)
        if (searchType != null && (searchType == "vvip" || searchType == "vip" || searchType == "special")) {
            // 현재 날짜 포맷
            val today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))

            // 페이징 객체 생성
            val pageRequest = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "id"))

            // 해당 타입의 활성화된 결제 정보 조회
            val premiumPayments = paymentService.getActivePaymentsByProductType(searchType.uppercase(Locale.getDefault()), pageRequest)

            // 결제 정보에서 공고 ID 추출
            val jobIds = premiumPayments.content.mapNotNull { it.jobPostingsId }

            if (jobIds.isEmpty()) {
                // 해당하는 프리미엄 공고가 없는 경우
                val emptyResponse = JobListResponse()
                emptyResponse.content = arrayOf()
                emptyResponse.page = page
                emptyResponse.size = size
                emptyResponse.totalElements = 0
                emptyResponse.totalPages = 0
                return ResponseEntity.ok(emptyResponse)
            }

            // 추출된 공고 ID로 공고 정보 조회
            val premiumJobs = ArrayList<JobResponse>()

            for (jobId in jobIds) {
                val jobInfo = jobsService.selectJobDetail(jobId.toInt())
                if (jobInfo != null){
                    jobInfo.id = jobInfo.jobId

                    // 스크랩 여부 체크
                    if (user_id != null) {
                        val isScraped = scrapJobIdList.contains(jobInfo.jobId)
                        jobInfo.isScraped = isScraped
                    }
                    // 지원 여부
                    if (user_id != null){
                        val isApplied = appliedJobList.contains(jobInfo.jobId)
                        jobInfo.isApplied = isApplied
                    }

                    // 노출 카운트 증가 (건별 상품인 경우)
                    paymentService.incrementJobExposureCount(jobId)

                    premiumJobs.add(jobInfo)
                }

            }

            // 응답 객체 생성
            val jobListResponse = JobListResponse()
            jobListResponse.content = premiumJobs.toTypedArray()
            jobListResponse.page = page
            jobListResponse.size = size
            jobListResponse.totalElements = premiumPayments.totalElements.toInt()
            jobListResponse.totalPages = premiumPayments.totalPages

            return ResponseEntity.ok(jobListResponse)
        }

        // 일반 채용공고 조회 - operation data ID 사용
        val jobsList = jobsService.selectJobSrchList(op_jobType_arr, op_location_arr, op_type_arr, op_company_arr, country, query, page, size, offSetNumb)

        if (jobsList != null) {
            for(job in jobsList){
                if (job != null) {
                    // 해당 공고에 대한 프리미엄 상품 구매 여부 확인
                    val jobId = job.jobId?.toLong() ?: continue
                    val hasActivePayment = paymentService.hasActivePaymentForJob(jobId)

                    // 프리미엄 상품이 있는 경우, 노출 카운트 증가 (건별 상품인 경우)
                    if (hasActivePayment) {
                        paymentService.incrementJobExposureCount(jobId)
                    }

                    job.isScraped = false
                    var scraped = scrapJobIdList.contains(job.jobId)
                    if(scraped){
                        job.isScraped = true
                    }
                    // 지원 여부
                    if (user_id != null){
                        val isApplied = appliedJobList.contains(job.jobId)
                        job.isApplied = isApplied
                    }
                    job.description = job.position
                    val wrkcndtnSlrTyp = job.wrkcndtnSlrTyp
                    job.salary = ""
                    if (wrkcndtnSlrTyp != null) {
                        if(wrkcndtnSlrTyp == "연봉" ||
                            wrkcndtnSlrTyp == "월급" ||
                            wrkcndtnSlrTyp == "주급" ||
                            wrkcndtnSlrTyp == "일급" ||
                            wrkcndtnSlrTyp == "시급" ||
                            wrkcndtnSlrTyp == "건별" ||
                            wrkcndtnSlrTyp == "회사내규에 따름"){
                            job.salaryType = wrkcndtnSlrTyp
                            job.salary = job.wrkcndtnSlrMin + "~" + job.wrkcndtnSlrMax + "만원"
                        }else if(wrkcndtnSlrTyp.contains("면접 후 결정")){
                            job.salaryType = "면접 후 결정"
                            job.salary = wrkcndtnSlrTyp
                        }else if(wrkcndtnSlrTyp.contains("회사내규에 따름")){
                            job.salaryType = "회사내규에 따름"
                            job.salary = wrkcndtnSlrTyp
                        }else if(wrkcndtnSlrTyp.contains("연봉")){
                            job.salaryType = "연봉"
                            job.salary = wrkcndtnSlrTyp
                        }else if(wrkcndtnSlrTyp.contains("월급")){
                            job.salaryType = "월급"
                            job.salary = wrkcndtnSlrTyp
                        }
                    }
                    //회사내규에 따름
                    job.salary = job.wrkcndtnSlrMin.toString() + "~" + job.wrkcndtnSlrMax + "만원"

                    val rawRegionIds = job.region.orEmpty()
                    if (rawRegionIds.isNotBlank()) {
                        val names = rawRegionIds
                            .split(",")
                            .mapNotNull { id ->
                                try {
                                    val od = operationDataService.getOperationDataById(id.trim())
                                    od.level1 + (od.level2?.let { " $it" } ?: "")
                                } catch (_: Exception) {
                                    null
                                }
                            }
                        job.wrkcndtnLctRgnStr = names.joinToString(", ")
                    }

                    if (job.appMthds == "홈페이지"){
                        val hmpg = job.url
                        if(hmpg != null && hmpg != ""){
                            if(!hmpg.contains("http")){
                                job.url = "http://" + job.url
                            }
                        }
                    }else{
                        job.url = ""
                    }

                }
            }
        }

        // operation data ID로 채용공고 수 조회
        var jobsCnt = jobsService.selectJobSrchListCount(op_jobType_arr, op_location_arr, op_type_arr, op_company_arr, country, query, page, size, offSetNumb)

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

        if(request.queryString.contains("country=all")){ // 메인
            return ResponseEntity(jobsList.toTypedArray(), HttpStatus.OK)
        } else {
            return ResponseEntity(jobListResponse, HttpStatus.OK)
        }
    }

    // level code를 operation_data_id로 변환하는 함수
    private fun getOperationDataIdsByLevelCodes(levelCodes: List<String>, dataType: String): ArrayList<String> {
        val operationDataIds = ArrayList<String>()

        for (levelCode in levelCodes) {
            try {
                val operationData = operationDataRepository.findByDataTypeAndLevel1(dataType, levelCode.trim())

                operationData.forEach { data ->
                    operationDataIds.add(data.operationDataId)
                }
            } catch (e: Exception) {
                // 로깅 추가
                println("Error finding operation data for levelCode: $levelCode, dataType: $dataType, error: ${e.message}")
                continue
            }
        }

        return operationDataIds
    }

    @PostMapping("/jobs")
    fun api_vi_auth_jobs_insert(@RequestBody jobRequest: JobRequest): ResponseEntity<JobResponse?> {
        val insertCnt = jobsService.insertJob(jobRequest)
        val jobResponse = JobResponse()  // 기본 생성자 사용 가능
        jobResponse.jobId = jobRequest.jobid
        jobResponse.employerId = jobRequest.employerid
        jobResponse.content = jobRequest.content
        jobResponse.description = jobRequest.description
        jobResponse.requirements = jobRequest.requirements
        jobResponse.location = jobRequest.location
        jobResponse.countrycode = jobRequest.countryCode
        return ResponseEntity(jobResponse, HttpStatus.OK)
    }

    @GetMapping("/jobs/{jobId}")
    fun api_vi_auth_jobs_view(@PathVariable jobId: Int, session: HttpSession): ResponseEntity<Any?> {
        var user_id = session.getAttribute("userId")

        val jobResponse = JobResponse()

        val job_info = jobsService.selectJobDetail2(jobId)
        var emp_id = job_info.get("employer_id").toString().toInt()
        var user_info = authService.getUserInfoByUserId(emp_id)
        var rtnMapDetail = mutableMapOf<String, Any>()
        rtnMapDetail.put("title", job_info.get("title").toString())

        // 해당 공고에 대한 프리미엄 상품 구매 여부 확인
        val hasActivePayment = paymentService.hasActivePaymentForJob(jobId.toLong())
        rtnMapDetail.put("isPremium", hasActivePayment)

        // 프리미엄 상품이 있는 경우, 노출 카운트 증가 (건별 상품인 경우)
        if (hasActivePayment) {
            paymentService.incrementJobExposureCount(jobId.toLong())
        }

        var companyMap = mutableMapOf<String, Any>()
        var companyName = user_info.get("companyName")
        var qual_edu_lvl = job_info.get("qlfct_edu_lvl").toString()//고등학교졸업
        var qual_lan_str = job_info.get("qlfct_lan_str").toString()
        var career_type = job_info.get("career_type").toString()
        var qual_lan_arr = qual_lan_str.split(",")
        var emp_types_str = job_info.get("emp_types_str").toString()//정규직, 계약직, 인턴 등
        var wrkcndtn_lct_addr = null_checker_for_string(job_info.get("wrkcndtn_lct_addr"))//서울시 광진구
        var wrkcndtn_lct_addr_dtl = null_checker_for_string(job_info.get("wrkcndtn_lct_addr_dtl"))//서울시 광진구
        var wrkcndtn_wrkng_dy_typ = job_info.get("wrkcndtn_wrkng_dy_typ").toString()
        var wrkcndtn_slr_typ = job_info.get("wrkcndtn_slr_typ").toString()
        var wrkcndtn_slr_min = job_info.get("wrkcndtn_slr_min").toString()
        var wrkcndtn_slr_max = job_info.get("wrkcndtn_slr_max").toString()
        var wrkcndtn_slr_min_wg = intToBoolean(job_info.get("wrkcndtn_slr_min_wg"))
        var wrkcndtn_slr_dc = intToBoolean(job_info.get("wrkcndtn_slr_dc"))
        companyMap.put("name", companyName.toString())
        rtnMapDetail.put("companyInfo", companyMap)
        var lvlMap = mutableMapOf<String, Any>()
        var lanMap = mutableMapOf<String, Any>()
        var eduMap = mutableMapOf<String, Any>()
        var career_map = mutableMapOf<String, Any>()
        career_map.put("type", career_type)
        lvlMap.put("level", qual_edu_lvl)
        var lanArray = ArrayList<String>()
        lanArray.add("ENG")
        lanArray.add("KOR")
        rtnMapDetail.put("career", career_map)
        lanMap.put("language", qual_lan_arr)
        eduMap.put("education", lvlMap)
        eduMap.put("preferences", lanMap)
        rtnMapDetail.put("qualification", eduMap)
        rtnMapDetail.put("jobType", emp_types_str)

        var workMap = mutableMapOf<String, Any>()
        var addrMap = mutableMapOf<String, Any>()

        var wrkcndtn_lct_rgn_str = null_checker_for_string(job_info.get("wrkcndtn_lct_rgn_str"))
        var regionName = ""

        if (wrkcndtn_lct_rgn_str.isNotEmpty()) {
            // 쉼표로 구분된 여러 ID가 있을 경우
            if (wrkcndtn_lct_rgn_str.contains(",")) {
                val regionIds = wrkcndtn_lct_rgn_str.split(",")
                val regionNames = mutableListOf<String>()

                for (regionId in regionIds) {
                    try {
                        val operationData = operationDataService.getOperationDataById(regionId.trim())
                        val fullRegionName = operationData.level1 + (if (operationData.level2 != null) " " + operationData.level2 else "")
                        regionNames.add(fullRegionName)
                    } catch (e: Exception) {
                        // 오류 발생 시 해당 ID는 건너뜀
                        continue
                    }
                }

                // 쉼표로 구분하여 연결
                regionName = regionNames.joinToString(", ")
            } else {
                // 단일 ID인 경우
                try {
                    val operationData = operationDataService.getOperationDataById(wrkcndtn_lct_rgn_str)
                    regionName = operationData.level1 + (if (operationData.level2 != null) " " + operationData.level2 else "")
                } catch (e: Exception) {
                    // 오류 발생 시 주소에서 추출
                    var wrkcndtn_lct_addr = null_checker_for_string(job_info.get("wrkcndtn_lct_addr"))
                    if (wrkcndtn_lct_addr != null && wrkcndtn_lct_addr != "") {
                        var wrkcndtn_lct_addr_sub_arr = wrkcndtn_lct_addr.split(" ")
                        regionName = if (wrkcndtn_lct_addr_sub_arr.size >= 2) {
                            wrkcndtn_lct_addr_sub_arr[0] + " " + wrkcndtn_lct_addr_sub_arr[1]
                        } else {
                            wrkcndtn_lct_addr
                        }
                    }
                }
            }
        } else {
            // ID가 없는 경우 주소에서 추출
            var wrkcndtn_lct_addr = null_checker_for_string(job_info.get("wrkcndtn_lct_addr"))
            if (wrkcndtn_lct_addr != null && wrkcndtn_lct_addr != "") {
                var wrkcndtn_lct_addr_sub_arr = wrkcndtn_lct_addr.split(" ")
                regionName = if (wrkcndtn_lct_addr_sub_arr.size >= 2) {
                    wrkcndtn_lct_addr_sub_arr[0] + " " + wrkcndtn_lct_addr_sub_arr[1]
                } else {
                    wrkcndtn_lct_addr
                }
            }
        }

        addrMap.put("address", regionName)
        addrMap.put("type", wrkcndtn_wrkng_dy_typ)
        workMap.put("location", addrMap)
        workMap.put("workingDay", addrMap)
        var salMap = mutableMapOf<String, Any>()
        salMap.put("type", wrkcndtn_slr_typ)
        salMap.put("min", wrkcndtn_slr_min)
        salMap.put("max", wrkcndtn_slr_max)
        salMap.put("isInterviewDecided", wrkcndtn_slr_dc)
        salMap.put("isMinimumWage", wrkcndtn_slr_min_wg)
        workMap.put("salary", salMap)
        rtnMapDetail.put("workConditions", workMap)
        var wrkcndtn_hrs_strt_hr = job_info.get("wrkcndtn_hrs_strt_hr").toString()
        var wrkcndtn_hrs_strt_mn = job_info.get("wrkcndtn_hrs_strt_mn").toString()
        var wrkcndtn_hrs_end_hr = job_info.get("wrkcndtn_hrs_end_hr").toString()
        var wrkcndtn_hrs_end_mn = job_info.get("wrkcndtn_hrs_end_mn").toString()
        var app_strt_tm = job_info.get("app_strt_tm").toString()
        var app_end_tm = job_info.get("app_end_tm").toString()

        var prdMap = mutableMapOf<String, Any>()
        var strtDateMap = mutableMapOf<String, Any>()
        strtDateMap.put("date", app_strt_tm)
        var endDateMap = mutableMapOf<String, Any>()
        endDateMap.put("date", app_end_tm)
        prdMap.put("start", strtDateMap)
        prdMap.put("end", endDateMap)
        rtnMapDetail.put("applicationPeriod", prdMap)

        var hmpgMap = mutableMapOf<String, Any>()
        var applicationMethod_homepage = null_checker_for_string(job_info["app_mthds_hmpg"])
        //접수방법 홈페이지
        if(!applicationMethod_homepage.contains("http")){
            applicationMethod_homepage = "http://"+applicationMethod_homepage
        }
        hmpgMap.put("homepage", applicationMethod_homepage)
        rtnMapDetail.put("applicationMethod", hmpgMap)

        var jobDetailContent = null_checker_for_string(job_info.get("content"))
        if(jobDetailContent.length > 0){
            rtnMapDetail.put("content", jobDetailContent)
        }else{
            rtnMapDetail.put("content", "")
        }
        //접수방법 홈페이지
        rtnMapDetail.put("url", null_checker_for_string(job_info.get("app_mthds_hmpg").toString()))
        rtnMapDetail.put("logo_url", user_info.get("corpLogo_Url")?: "")

        if(user_id != null){
            var mMap = mutableMapOf<String, Any>()
            mMap.put("userId", user_id)
            mMap.put("jobId", jobId)
            var scrapList = jobsService.selectJobScrapList(mMap)
            if(scrapList.size > 0){
                rtnMapDetail.put("isScraped", true)
            }else{
                rtnMapDetail.put("isScraped", false)
            }
        }
        //뷰 카운트 + 1
        var mMap = mutableMapOf<String, Any>()
        mMap.put("jobId", jobId)
        jobsService.incJobViewCnt(mMap)

        return ResponseEntity(rtnMapDetail, HttpStatus.OK)
    }

    @GetMapping("/jobs/{jobId}/jobtyps")
    fun api_v1_auth_jobs_jobtypes(session: HttpSession, @PathVariable jobId: Int): ResponseEntity<Any>{
        var jobtypelist = ArrayList<Any>()
        var mMap = mutableMapOf<String, Any>()
        mMap.put("jobId", jobId)
        jobtypelist = jobsService.selectJobTypeList(mMap)
        for(jobtype in jobtypelist){
            jobtype as MutableMap<String, Any>
            var job_type = jobtype.get("job_type")
            jobtype.put("id", jobtype.get("jobtype_id").toString().toInt())
            jobtype.put("label", job_type.toString())
            jobtype.put("value", job_type.toString())
        }
        jobtypelist as ArrayList<Any>
        return ResponseEntity(jobtypelist, HttpStatus.OK)
    }

    /*
    * 구직자의 채용공고 스크랩 목록
    * */
    @GetMapping("/jobs/scrap")
    fun api_v1_auth_jobs_scrap_list(session: HttpSession, page: Int, size: Int, searchType: String?, query: String?): ResponseEntity<Any>{
        var user_id = session.getAttribute("userId")
        if(user_id == null){
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }else{
            user_id = user_id.toString().toInt()
        }
        var scrapResponse = ArrayList<Any>()
        var mMap = mutableMapOf<String, Any>()
        mMap.put("userId", user_id)
        var scrapList = jobsService.selectJobScrapList(mMap)
        for(scrapel in scrapList){
            //job_id 로 채용공고 정보를 가져와서
            //var employerId = scrapel.get("employer_id")
            var jobId = scrapel.get("job_id")
            // 지원 목록 가져오기
            var appliedJobList = ArrayList<Int>()
            if(user_id != null){
                var mMap = mutableMapOf<String, Any>()
                mMap.put("userid", user_id)
                mMap.put("offSetNumb", 0)
                mMap.put("page", 1)
                mMap.put("size", 100)
                var scrapList = applicationService.selectListMyApply(mMap)
                if (scrapList != null) {
                    for(scrap in scrapList){
                        if (scrap != null) {
                            appliedJobList.add(scrap.jobId.toString().toInt())
                        }
                    }
                }
            }

            var jobScrapId = scrapel.get("job_scrap_id")
            var createdAt = scrapel.get("created_at")
            var jMap = jobsService.selectJobDetail2(jobId.toString().toInt())
            if(jMap != null){
                var emp_id = jMap.get("employer_id")
                var user_info = authService.getUserInfoByUserId(emp_id.toString().toInt())
                var companyName = user_info.get("companyName")
                var title = jMap.get("title")
                var location = jMap.get("wrkcndtn_lct_rgn_str")
                var jobType = null_checker_for_string(jMap.get("job_type_str"))
                var description = jMap.get("qlfct_lic_str")
                var url = jMap.get("app_mthds_hmpg")

                if(url != null && url != ""){
                    if(!url.toString().contains("http")){
                        url = "http://" + url.toString()
                    }
                }

                var jobStrtTm = jMap.get("app_strt_tm")
                var jobEndTm = jMap.get("app_end_tm")
                var sMap = mutableMapOf<String, Any>()

                sMap.put("jobId", jobId.toString().toInt())

                // 지원 여부
                if (user_id != null){
                    val isApplied = appliedJobList.contains(jobId)
                    sMap.put("isApplied", isApplied)
                }

                sMap.put("scrapId", jobScrapId.toString().toInt())
                sMap.put("companyName", companyName.toString())
                sMap.put("title", title.toString())
                sMap.put("location", location.toString())
                sMap.put("jobType", null_checker_for_string(jobType.toString()))
                //sMap.put("description", description.toString())
                sMap.put("url", url.toString())
                sMap.put("createdAt", createdAt.toString())
                sMap.put("jobStrtTm", jobStrtTm.toString())
                sMap.put("jobEndTm", jobEndTm.toString())

                // 해당 공고에 대한 프리미엄 상품 구매 여부 확인
                val hasActivePayment = paymentService.hasActivePaymentForJob(jobId.toString().toLong())
                sMap.put("isPremium", hasActivePayment)

                scrapResponse.add(sMap)
            }
        }
        var scrapCnt = jobsService.selectJobScrapListCnt(mMap)
        var jobProposalCnt = scrapCnt
        var totalElementCnt = jobProposalCnt
        var resp_mMap = mutableMapOf<String, Any>()
        var totalPages = totalElementCnt/size
        if(totalElementCnt%size > 0){
            totalPages = totalPages + 1
        }
        resp_mMap.put("totalPages", totalPages)
        resp_mMap.put("content", scrapResponse.toTypedArray())
        resp_mMap.put("totalElements", totalElementCnt)
        //jobtypelist = jobsService.selectJobTypeList(mMap)
        return ResponseEntity(resp_mMap, HttpStatus.OK)
    }
    /*
    * 구직자 가 채용정보를 스크랩
    *
    * */
    @PostMapping("jobs/{jobId}/scrap")
    fun api_v1_auth_jobs_scrap_insert(session: HttpSession, @PathVariable jobId: Int): ResponseEntity<Any>{
        val user_id = session.getAttribute("userId")
        if(user_id == null){
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }

        //user_id, job_id 로 먼저 스크랩 row 가 있는지 확인한다.
        var mMap = mutableMapOf<String, Any>()
        mMap.put("userId", user_id)
        mMap.put("jobId", jobId)
        var scrapList = jobsService.selectJobScrapList(mMap)

        var isScrapped: Boolean = false;
        if(scrapList.size != 0){
            //구직자 user_id,
            //채용공고 아이디 job_id 로 저장한다.
            for(scrap in scrapList) {
                if (scrap["job_id"].toString() == jobId.toString()) {
                    isScrapped = true;
                }
            }

        }
        if(isScrapped) {
            jobsService.deleteScrapJob(jobId)
        } else{
            val insertCnt = jobsService.insertJobScrap(mMap)
        }
        return ResponseEntity(HttpStatus.OK)
    }
    @PutMapping("/jobs/{jobId}")
    fun api_vi_auth_jobs_edit(
        @PathVariable jobId: Int,
        @RequestBody jobRequest: JobRequest,
        session: HttpSession
    ): ResponseEntity<JobResponse?> {
        try {
            //val job_info = jobsService.selectJobDetail(jobId)
            val rst_val = jobsService.updateJobInfo(jobRequest)
            var jobResponse = JobResponse()
            return ResponseEntity(HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.NOT_FOUND)
        }

    }
    @DeleteMapping("scraps")
    fun api_v1_auth_scraps_del(@RequestBody delMap:MutableMap<String, Any>, session: HttpSession, page:Int?, size: Int?, keyword: String?): ResponseEntity<Any> {
        var user_id = session.getAttribute("userId")
        if (user_id == null) {
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        var jobIds = delMap.get("jobIds")
        jobIds as ArrayList<Int>
        for(jobId in jobIds){
            //jobsService.deleteJob(jobId)
            jobsService.deleteScrapJob(jobId)
            //var update_cnt = joboffersService.deleteJoboffer(jobId)
        }
        return ResponseEntity(HttpStatus.OK)
    }
    @DeleteMapping("/jobs/{jobId}")
    fun api_vi_auth_jobs_del(
        @PathVariable jobId: Int,
        @RequestBody jobRequest: JobRequest,
        session: HttpSession
    ): ResponseEntity<JobResponse?> {
        try {
            var del_rst = jobsService.deleteJob(jobId)
            var jobResponse = JobResponse()
            return ResponseEntity(HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.NOT_FOUND)
        }
    }
    fun getOffSetNumb(page: Int, size: Int):Int{
        return (page - 1) * size
    }
    fun null_checker_for_string(s: Any?): String{
        if(s == null){
            return ""
        }else{
            return s as String
        }
    }
    fun null_checker_for_int(s: Any?): Int{
        try{
            if(s == null){
                return 0
            }else{
                val tyNm = getTypeName(s)
                if(tyNm == "double_type"){
                    s as Double
                    return s.toInt()
                }else if(tyNm == "string_type"){
                    s as String
                    return s.toInt()
                }else{
                    return s.toString().toInt()
                }

            }
        }catch (e: NumberFormatException){
            return 0
        }catch (e: IOException){
            return 0
        }
    }
    fun null_checker_for_int2(s: Any?): Int{
        try{
            if(s == null){
                return 99
            }else{
                val tyNm = getTypeName(s)
                if(tyNm == "double_type"){
                    s as Double
                    return s.toInt()
                }else if(tyNm == "string_type"){
                    s as String
                    return s.toInt()
                }else{
                    return s.toString().toInt()
                }

            }
        }catch (e: NumberFormatException){
            return 0
        }catch (e: IOException){
            return 0
        }
    }
    fun getTypeName(obj: Any):String{
        if(obj == null){
            return ""
        }
        if(obj is Int) {
            return "int_type"
        }else if(obj is String){
            return "string_type"
        }else if(obj is Double){
            return "double_type"
        }else if(obj is Boolean){
            return "boolean_type"
        }else{
            return "another_type"
        }
    }
    fun getStrArrayFromStringComma(jobType: String?, base_arr: Array<String>): ArrayList<String>?{
        var op_jobType_arr = ArrayList<String>()
        if (jobType != null && jobType != "") { // 직무 * 기획 전략 디자인 개발
            if(jobType.contains(",")){
                var jobTypes = jobType.split(",")
                for (jobType in jobTypes){
                    var op_jobType = base_arr.get(null_checker_for_int(jobType))
                    op_jobType_arr.add(op_jobType)
                }
            }else{
                var op_jobType = base_arr.get(null_checker_for_int(jobType))
                op_jobType_arr.add(op_jobType)
            }
        }else{
            return null
        }
        return op_jobType_arr
    }
    fun getIntArrayFromStringComma(jobType: String?): ArrayList<Int>?{
        var op_jobType_arr = ArrayList<Int>()
        if (jobType != null && jobType != "") { // 직무 * 기획 전략 디자인 개발
            if(jobType.contains(",")){
                var jobTypes = jobType.split(",")
                for (jobType in jobTypes){
                    var op_company = null_checker_for_int2(jobType) - 1
                    op_jobType_arr.add(op_company)
                }
            }else{
                var op_company = null_checker_for_int2(jobType) - 1
                op_jobType_arr.add(op_company)
            }
        }else{
            return null
        }
        return op_jobType_arr
    }
    fun intToBoolean(s: Any?): Boolean{
        if(s == null || s == 0){
            return false
        }else{
            return true
        }
    }
    fun null_checker_for_boolean(s: Any?): Boolean{
        if(s == null){
            return false
        }else{
            return s as Boolean
        }
    }
}