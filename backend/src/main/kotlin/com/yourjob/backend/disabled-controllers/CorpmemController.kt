package com.yourjob.backend.controller

import com.google.gson.Gson
import com.yourjob.backend.entity.*
import com.yourjob.backend.entity.mdms.LevelCodeListDto
import com.yourjob.backend.entity.mdms.OperationDataResponseDto
import com.yourjob.backend.service.*
import com.yourjob.backend.service.mdms.OperationDataService
import com.yourjob.backend.util.EmailService
import com.yourjob.backend.util.FileUtils
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpSession
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.ClassPathResource
import org.springframework.core.io.UrlResource
import org.springframework.data.domain.Page
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.util.UriUtils
import java.io.IOException
import java.nio.charset.StandardCharsets
import java.nio.file.Paths
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*
import kotlin.collections.ArrayList


@RestController
@RequestMapping("/api/v1")
class CorpmemController(
    private var corpmemService: CorpmemService,
    private var jobsService: JobsService,
    private var applicationService: ApplicationService,
    private var authService: AuthService,
    private var talentService: TalentService,
    private var fileUtilService: FileUtilService,
    private var resumeService: ResumeService,
    private var operationDataService: OperationDataService,
    private var fileUtils: FileUtils,
    private var emailService: EmailService) {

    private var save_path: String = "uploads/corpmem"

    /*@GetMapping("/corpmem/jobpost-data")
    fun getOperationDataPaging(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "999999") size: Int,
        @RequestParam(required = false) keyword: String?,
        @RequestParam(required = false) dataType: String?,
        @RequestParam(required = false) level1: String?,
        @RequestParam(required = false) level2: String?,
        @RequestParam(required = false) level3: String?,
        @RequestParam(defaultValue = "id,asc") sort: String
    ): ResponseEntity<Page<OperationDataResponseDto>> {
        val operationDataPage = operationDataService.getOperationDataPaging(
            page, size, keyword, dataType, level1, level2, level3, sort
        )
        return ResponseEntity.ok(operationDataPage)
    }

    @GetMapping("/corpmem/jobpost-data/{operationDataId}")
    fun getOperationDataById(@PathVariable operationDataId: String): ResponseEntity<OperationDataResponseDto> {
        val operationData = operationDataService.getOperationDataById(operationDataId)
        return ResponseEntity.ok(operationData)
    }*/

    @GetMapping("/corpmem/jobpost-data")
    fun getOperationDataPagingForCorpMem(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "999999") size: Int,
        @RequestParam(required = false) keyword: String?,
        @RequestParam(required = false) dataType: String?,
        @RequestParam(required = false) level1: String?,
        @RequestParam(required = false) level2: String?,
        @RequestParam(required = false) level3: String?,
        @RequestParam(defaultValue = "id,asc") sort: String
    ): ResponseEntity<Page<OperationDataResponseDto>> {
        val operationDataPage = operationDataService.getOperationDataPaging(
            page, size, keyword, dataType, level1, level2, level3, sort
        )
        return ResponseEntity.ok(operationDataPage)
    }

    @GetMapping("/corpmem/jobpost-data/{operationDataId}")
    fun getOperationDataByIdForCorpMem(@PathVariable operationDataId: String): ResponseEntity<OperationDataResponseDto> {
        val operationData = operationDataService.getOperationDataById(operationDataId)
        return ResponseEntity.ok(operationData)
    }

    // level1 코드 목록 조회
    @GetMapping("/corpmem/jobpost-data/level1-codes")
    fun getLevel1CodesByDataTypeForCorpMem(@RequestParam dataType: String): ResponseEntity<LevelCodeListDto> {
        val levelCodes = operationDataService.getLevel1CodesByDataType(dataType)
        return ResponseEntity.ok(levelCodes)
    }

    private fun getOperationDataIdByLevel1Code(level1Code: String): String? {
        return try {
            val operationDataPage = operationDataService.getOperationDataPaging(
                0, 999999, null, "00000011", level1Code, null, null, "id,asc"
            )
            operationDataPage.content.firstOrNull()?.operationDataId
        } catch (e: Exception) {
            null
        }
    }
    private fun getLevel1CodeByOperationDataId(operationDataId: String): String? {
        return try {
            val operationData = operationDataService.getOperationDataById(operationDataId)
            operationData.level1Code
        } catch (e: Exception) {
            null
        }
    }

    @GetMapping("/corpmem/applicants")
    fun api_v1_corpmem_applicants(@RequestBody applicationRequest: ApplicationRequest, session: HttpSession): ResponseEntity<Array<MutableMap<String, Any>>> {
        try{
            var user_id = session.getAttribute("userId")
            if (user_id == null){
                //user_id = 2
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            var job_id = applicationRequest.jobId?.toInt()
            var jobApplyList = corpmemService.selectListJobApply(job_id)
            //myApplyList = myApplyList!!.toTypedArray()
            var jobApplyList_arr = jobApplyList?.toTypedArray()
            return ResponseEntity(jobApplyList_arr, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @GetMapping("/corpmem/mydata")
    fun api_v1_corpmem_corpinfo_mydata(session: HttpSession): ResponseEntity<Any> {
        try{
            var user_id = session.getAttribute("userId")

            var user_accountId = session.getAttribute("accountId")
            var user_accountType = session.getAttribute("userType")
            if (user_id == null || user_accountId == null || user_accountType == null || user_accountType == "" ||
                (user_accountType.toString().uppercase() != "COMPANY" && user_accountType.toString().uppercase() != "COMPANY_EXCEL")){
                return ResponseEntity(HttpStatus.NOT_FOUND)
            }
            var company_Info = corpmemService.selectCompanyInfo(user_id.toString().toInt())
            var cMap = mutableMapOf<String, Any>()
            cMap.put("name", company_Info.companyName.toString())

            var corpLoginRequest = CorpLoginRequest()
            corpLoginRequest.accountId = user_accountId.toString()

            var mMap = mutableMapOf<String, Any>()
            var corpInfo = authService.selectCorpUser(corpLoginRequest)
            company_Info.logo_url?.let { mMap.put("logo_url", it) }

            if(corpInfo != null){
                mMap.put("companyName", corpInfo.companyName.toString())
                mMap.put("employeeCount", corpInfo.employeeCount.toString())
                mMap.put("capitalAmount", corpInfo.capital.toString())
                mMap.put("revenueAmount", corpInfo.revenue.toString())
                mMap.put("netIncome", corpInfo.netIncome.toString())
                mMap.put("companyInfo", cMap)

                /*if(corpInfo?.corpthmbImgidx != null){
                    var corpthmbimgidx = corpInfo?.corpthmbImgidx.toString().toInt()
                    mMap.put("fileidx", corpthmbimgidx)
                    var attached_file_inform = fileUtilService.getFileDataByIdx(mMap)
                    var file_type = attached_file_inform.get("type")
                    var file_year_date = attached_file_inform.get("year_date")
                    var file_file_name = attached_file_inform.get("file_name")

                }
                if(corpInfo.companyName != null &&
                    corpInfo.employeeCount != null &&
                    corpInfo.capital != null &&
                    corpInfo.revenue != null &&
                    corpInfo.netIncome != null
                    ){
                    mMap.put("companyName", corpInfo.companyName.toString())
                    mMap.put("logo_url", company_Info.logo_url.toString())
                    mMap.put("employeeCount", corpInfo.employeeCount.toString().toInt())
                    mMap.put("capitalAmount", corpInfo.capital.toString())
                    mMap.put("revenueAmount", corpInfo.revenue.toString())
                    mMap.put("netIncome", corpInfo.netIncome.toString())
                }*/

            }

            return ResponseEntity(mMap, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @PutMapping("/corpmem/corpinfo")
    fun api_v1_corpmem_corpinfo_edit(@RequestParam data:String, @RequestParam businessCertificate:MultipartFile?, session: HttpSession): ResponseEntity<CompanyInfo>{
        try{
            var user_id = session.getAttribute("userId")
            if (user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            var corpcertImgIdx = 0
            var mMap = mutableMapOf<String, Any>()
            if(businessCertificate != null){
                val fileTyp = "corpcert"
                val localDate: LocalDate = LocalDate.now()
                val todaydate = localDate.toString()

                val uuid = fileUtils.fileSave(rootpath = save_path, type = fileTyp, yeardate = todaydate, file = businessCertificate)
                val fileNm = businessCertificate.originalFilename ?: "unnamed"
                val fileExt = fileNm.substring(fileNm.lastIndexOf("."))

                val imageUrl = fileUtils.getFileUrl(save_path, fileTyp, todaydate, uuid, fileNm)

                mMap.put("fileidx", 0)
                mMap.put("user_id", user_id)
                mMap.put("type", fileTyp)
                mMap.put("year_date", todaydate)
                mMap.put("file_name", fileNm)
                mMap.put("file_ext", fileExt)
                mMap.put("file_path_s3", imageUrl)
                var insertCnt = fileUtilService.insertJobResumeFileData(mMap)
                corpcertImgIdx = mMap.get("fileidx") as Int
            }

            val gson = Gson()
            var jobRequest: Map<String, Any> = HashMap()
            jobRequest = Gson().fromJson(data, jobRequest.javaClass)

            val username = jobRequest["username"] as String
            val password = jobRequest["password"] as String
            val managerName = jobRequest["managerName"] as String
            val managerPhone = jobRequest["managerPhone"] as String
            val managerEmail = jobRequest["managerEmail"] as String
            val companyName = jobRequest["companyName"] as String
            val businessNumber = jobRequest["businessNumber"] as String
            val representative = jobRequest["representative"] as String

            // level1 코드를 operation_data_id로 변환
            val level1Code = jobRequest["companyType"] as String
            val operationDataId = getOperationDataIdByLevel1Code(level1Code)
            val companyTypeToSave = operationDataId ?: level1Code // 변환 실패시 원본 값 사용

            val employeeCount = null_checker_for_int_double(jobRequest["employeeCount"])
            val employeeCount_int = employeeCount.toInt()
            val capital = jobRequest["capital"].toString()
            val revenue = jobRequest["revenue"].toString()
            val profit = jobRequest["profit"].toString()

            mMap.clear()
            mMap = mutableMapOf<String, Any>()
            mMap.put("userId", user_id)
            mMap.put("username", username)
            mMap.put("password", password)
            mMap.put("managerName", managerName)
            mMap.put("managerPhone", managerPhone)
            mMap.put("managerEmail", managerEmail)
            mMap.put("companyName", companyName)
            mMap.put("businessNumber", businessNumber)
            mMap.put("representative", representative)
            mMap.put("companyType", companyTypeToSave)
            mMap.put("employeeCount", employeeCount_int)
            if(corpcertImgIdx > 0){
                mMap.put("corpcertImgidx", corpcertImgIdx)
            }
            mMap.put("capital", capital)
            mMap.put("revenue", revenue)
            mMap.put("profit", profit)
            corpmemService.updateUserInfo(mMap)
            var company_Info = corpmemService.selectCompanyInfo(user_id.toString().toInt())
            return ResponseEntity(company_Info, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @PostMapping("/corpmem/thumbnail")
    fun asd(session: HttpSession, @RequestParam thumbnail:MultipartFile): ResponseEntity<Any>{
        var user_id = session.getAttribute("userId")
        if (user_id == null){
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
            //user_id = 30
        }
        val fileTyp = "corpthmb"
        val localDate: LocalDate = LocalDate.now()
        val todaydate = localDate.toString()

        // 이력서 본인 이미지 저장
        val uuid = fileUtils.fileSave(rootpath = save_path, type = fileTyp, yeardate = todaydate, file = thumbnail)
        val fileNm = thumbnail.originalFilename ?: "unnamed"
        val fileExt = fileNm.substring(fileNm.lastIndexOf("."))

        // 이미지 URL 생성
        val imageUrl = fileUtils.getFileUrl(save_path, fileTyp, todaydate, uuid, fileNm)

        var mMap = mutableMapOf<String, Any>()
        mMap.put("fileidx", 0)
        mMap.put("user_id", user_id)
        //mMap.put("job_id", last_insert_job_post_idx.toString().toInt())
        mMap.put("type", fileTyp)
        mMap.put("year_date", todaydate)
        mMap.put("file_name", uuid + "_" + fileNm)
        mMap.put("file_ext", fileExt)
        mMap.put("file_path_s3", imageUrl)
        var insertCnt = fileUtilService.insertJobResumeFileData(mMap)
        val corpthmbImgIdx = mMap.get("fileidx") as Int
        //썸네이 파일 인덱스를 유저정보에 넣는다.
        //corpthmb_imgidx
        mMap.clear()
        mMap.put("userId", user_id)
        mMap.put("thumbimgidx", corpthmbImgIdx)
        //corpmemService.updateUserInfo(mMap)
        corpmemService.updateCorpThmbImgIdx(mMap)
        return ResponseEntity(HttpStatus.OK)
    }
    @GetMapping("/corpmem/corpinfo")
    fun api_v1_corpmem_corpinfo_view(session: HttpSession): ResponseEntity<MutableMap<String, Any>> {
        try{
            var user_id = session.getAttribute("userId")
            var user_accountId = session.getAttribute("accountId")
            if (user_id == null || user_accountId == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }

            var mMap = mutableMapOf<String, Any>()
            var corpLoginRequest = CorpLoginRequest()
            corpLoginRequest.accountId = user_accountId.toString()
            var corpInfo = authService.selectCorpUser(corpLoginRequest)
            if (corpInfo != null) {
                mMap.put("username", corpInfo.accountId.toString())
                mMap.put("password", corpInfo.password.toString())
                mMap.put("managerName", corpInfo.name.toString())
                mMap.put("managerPhone", corpInfo.phone.toString())
                mMap.put("managerEmail", corpInfo.email.toString())
                mMap.put("companyName", corpInfo.companyName.toString())
                mMap.put("businessNumber", corpInfo.businessRegistrationNumber.toString())
                mMap.put("representative", corpInfo.representative.toString())

                var corpcertImgidx = corpInfo.corpcertImgidx
                if (corpcertImgidx != null){
                    var fMap = mutableMapOf<String, Any>()
                    fMap.put("fileidx", corpcertImgidx.toString())
                    var attached_file_inform = fileUtilService.getFileDataByIdx(fMap)
                    if(attached_file_inform != null){
                        var file_attach_id = attached_file_inform.get("file_attach_id")
                        var file_type = attached_file_inform.get("type")
                        var file_year_date = attached_file_inform.get("year_date")
                        var file_file_name = attached_file_inform.get("file_name") as String
                        var apo_download_url = null_checker_for_string(attached_file_inform.get("file_path_s3"))

                        var fMap = mutableMapOf<String, Any>()
                        fMap.put("name", apo_download_url)
                        var fMap2 = mutableMapOf<String, Any>()
                        fMap2.put("file", fMap)
                        fMap2.put("apo_file_nm", apo_download_url)
                        fMap2.put("apo_download_url", apo_download_url)
                        fMap2.put("filename", apo_download_url)
                        fMap2.put("filedownload", apo_download_url)
                        fMap2.put("fileurl", apo_download_url)
                        fMap2.put("filePath", apo_download_url)

                        mMap.put("businessCertificate", fMap2)
                    }
                }

                // operation_data_id를 level1 코드로 변환
                if(corpInfo.corporateType != null){
                    val storedValue = corpInfo.corporateType!!

                    // 숫자인지 확인 (기존 배열 인덱스 방식)
                    val companyTypeValue = try {
                        val index = storedValue.toInt()
                        if (index >= 0 && index < company_type_array.size) {
                            company_type_array[index]
                        } else {
                            // operation_data_id로 level1 코드를 찾기
                            getLevel1CodeByOperationDataId(storedValue) ?: storedValue
                        }
                    } catch (e: NumberFormatException) {
                        // 숫자가 아니면 operation_data_id로 처리
                        getLevel1CodeByOperationDataId(storedValue) ?: storedValue
                    }
                    mMap.put("companyType", companyTypeValue)
                } else {
                    mMap.put("companyType", company_type_array[company_type_array.size-1]) // 기타
                }

                corpInfo.employeeCount?.let { mMap.put("employeeCount", it) }
                mMap.put("capital", corpInfo.capital.toString())
                mMap.put("revenue", corpInfo.revenue.toString())
                mMap.put("profit", corpInfo.netIncome.toString())
            }

            var company_Info = corpmemService.selectCompanyInfo(user_id.toString().toInt())
            return ResponseEntity(mMap, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @PostMapping("/corpmem/corplogoimg")
    fun api_v1_corplogoimg_upload(session: HttpSession, @RequestPart file: MultipartFile):ResponseEntity<Any> {

        var user_id = session.getAttribute("userId")
        var user_accountId = session.getAttribute("accountId")
        if (user_id == null || user_accountId == null){
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
            //user_id = 30
        }

        var company_Info = corpmemService.selectCompanyInfo(user_id.toString().toInt())

        val localDate: LocalDate = LocalDate.now()
        var fileTyp = "corp_logo_img"
        val todaydate = localDate.toString()

        // 이력서 본인 이미지 저장
        val uuid = fileUtils.fileSave(rootpath = save_path, type = fileTyp, yeardate = todaydate, file = file)
        val fileNm = file.originalFilename ?: "unnamed"
        val fileExt = fileNm.substring(fileNm.lastIndexOf("."))

        // 이미지 URL 생성
        val imageUrl = fileUtils.getFileUrl(save_path, fileTyp, todaydate, uuid, fileNm)

        company_Info.logo_url = imageUrl;

        corpmemService.updateCompanyInfoLogoUrl(company_Info);

        return ResponseEntity(imageUrl, HttpStatus.OK)
    }

    @GetMapping("/corpmem/logoimg")
    fun api_v1_corplogoimf_get(session: HttpSession): ResponseEntity<UrlResource> {
        val imageResource = ClassPathResource("C:\\Users\\admin\\dev\\123.png")
        val resource = UrlResource("file:C:\\Users\\admin\\dev\\123.png")
        //한글 파일 이름이나 특수 문자의 경우 깨질 수 있으니 인코딩 한번 해주기
        val encodedUploadFileName: String = UriUtils.encode(
            "uploadFileName",
            StandardCharsets.UTF_8
        )
        //아래 문자를 ResponseHeader에 넣어줘야 한다. 그래야 링크를 눌렀을 때 다운이 된다.
        //정해진 규칙이다.
        val contentDisposition = "attachment; filename=\"$encodedUploadFileName\""
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
            .body<UrlResource>(resource)
    }

    @PutMapping("/corpmem/mydata")
    fun api_v1_corpmem_corpinfo_mydata_update(@RequestBody companyInfo: CompanyInfo, session: HttpSession): ResponseEntity<CompanyInfo> {
        try{
            var user_id = session.getAttribute("userId")
            if (user_id == null){
                //user_id = 2
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            var update_result = corpmemService.updateCompanyInfo(companyInfo)
            //myApplyList = myApplyList!!.toTypedArray()
            return ResponseEntity(HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @GetMapping("/corpmem/dashboard/status")
    fun api_v1_corpmem_dashboard_status(session: HttpSession):ResponseEntity<MutableMap<String, Any>> {
        var user_id = session.getAttribute("userId")
        if (user_id == null){
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        var ad = mutableMapOf<String, Any>()
        var myJobApplyList = corpmemService.selectListJobApply(user_id.toString().toInt())

        var myJobList = corpmemService.selectMyJobList(user_id.toString().toInt())
        val jobIds = myJobList.map { it.jobId }.filterNotNull()

        var srchParams = mutableMapOf<String, Any>()
        srchParams.put("status", "UNREAD")
        srchParams.put("jobIds", jobIds)
        var myJobApplierCnt = 0
        if (jobIds.size > 0){
            myJobApplierCnt = corpmemService.selectMyJobApplierCntStatus(srchParams)
        }
        var sMap = mutableMapOf<String, Any>()
        sMap.put("userId", user_id)
        var sRst = jobsService.selectJobStatusCnt(sMap)
        if(!sRst.isEmpty()) {
            var sRst_first = sRst[0]
            ad.put("ongoingPosts", sRst_first.get("ongoingcnt").toString())
        }else{
            ad.put("ongoingPosts", 0)
        }
        //var myJobCnt = corpmemService.selectMyJobCnt(user_id.toString().toInt())
        //ad.put("ongoingPosts", myJobCnt)  //채용공고(job post) 리스트 가져오기

        ad.put("unreadResumes", myJobApplierCnt) //지원요청(applicant) 리스트
        var myJobOffersCnt = corpmemService.selectMyJobOffersCnt(user_id.toString().toInt())
        ad.put("positionOffers", myJobOffersCnt)//제안요청(job offer) 리스트
        return ResponseEntity(ad, HttpStatus.OK)
    }
    @GetMapping("/corpmem/dashboard/posts")
    fun api_v1_corpmem_dashboard_posts(session: HttpSession): ResponseEntity<ArrayList<Any>> {
        //일반 공고 내역
        //공고 리스트 가져와서
        //공고 별로 지원 갯수, 미열람 갯수
        var user_id = session.getAttribute("userId")
        if (user_id == null){
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        var myJobList = corpmemService.selectMyJobList(user_id.toString().toInt())
        var arrlist = ArrayList<Any>()

        for(job in myJobList){
            var mapobj = mutableMapOf<String, Any>()
            mapobj.put("userId", user_id)
            mapobj.put("jobId", job.jobId.toString().toInt())
            mapobj.put("status", "")
            var applyCnt = corpmemService.selectMyJobApplierCnt(mapobj)
            mapobj.clear()
            mapobj.put("userId", user_id)
            mapobj.put("jobId", job.jobId.toString().toInt())
            mapobj.put("status", "UNREAD")
            var applyCntUNREAD = corpmemService.selectMyJobApplierCnt(mapobj)
            mapobj.clear()
            mapobj.put("id", job.id.toString().toInt())
            mapobj.put("status", job.status.toString())
            mapobj.put("title", job.title.toString())
            mapobj.put("applicantCount", applyCnt)
            mapobj.put("unreadCount", applyCntUNREAD)
            arrlist.add(mapobj)
        }
        return ResponseEntity(arrlist, HttpStatus.OK)

    }
    @GetMapping("/corpmem/dashboard/talents")
    fun api_v1_corpmem_dashboard_talents(session: HttpSession, page: Int?, size: Int?):ResponseEntity<Any> {
        var user_id = session.getAttribute("userId")
        if (user_id == null){
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        var req_page = 1
        var req_size = 5
        if(page != null && page > 0){
            req_page = page
        }
        if(size != null && size > 0){
            req_size = size
        }
        var mMap = mutableMapOf<String, Any>()
        var offSetNumb = getOffSetNumb(req_page, req_size)
        mMap.put("page", req_page)
        mMap.put("size", req_size)
        mMap.put("offSetNumb", offSetNumb)
        val talentList = talentService.selectTalentSearchList(mMap)
        var list = ArrayList<Any>()
        for (talent in talentList){
            talent as MutableMap<String, Any>
            val talentid = talent.get("resume_id")
            val jobSeekerId = talent.get("job_seeker_id")
            var nMap = mutableMapOf<String, Any>()
            nMap.put("id", talentid.toString().toInt())
            nMap.put("jobseekerid", jobSeekerId.toString().toInt())
            nMap.put("name", talent.get("name").toString())
            nMap.put("gender", talent.get("gender").toString())
            nMap.put("age", 38)
            nMap.put("totalExperience", "3년 5개월")
            nMap.put("location", "서울")
            var nMap1 = mutableMapOf<String, Any>()
            nMap1.put("school", talent.get("schoolName").toString())
            nMap1.put("degree", talent.get("lastSchool").toString())
            //nMap.put("education", nMap1) //프론트 Mypage.tsx {talent.education} 오류때문에 아래로 변경함
            nMap.put("education", talent.get("schoolName").toString() + "(" + talent.get("lastSchool").toString() + ")")
            //degree
            var nMap2 = mutableMapOf<String, Any>()
            nMap2.put("company", talent.get("companyName").toString())
            nMap2.put("years", "3")
            nMap2.put("months", "10")
            nMap.put("career", nMap2)
            var nMap3 = mutableMapOf<String, Any>()
            var skill_list = ArrayList<Any>()
            var skill1 = null_checker_for_string(talent.get("certificationName"))
            skill_list.add(skill1)
            var skill2 = null_checker_for_string(talent.get("department"))
            skill_list.add(skill2)
            var skill3 = null_checker_for_string(talent.get("jobTitle"))
            skill_list.add(skill3)
            nMap.put("skills", skill_list)
            list.add(nMap)
        }
        return ResponseEntity(list, HttpStatus.OK)
    }
    @GetMapping("/corpmem/posts")
    fun api_v1_auth_posts_list(session: HttpSession, request: HttpServletRequest, status: String?, query: String?, keyword: String?, location: String?, page: Int?, size: Int?): ResponseEntity<Any> {
        var user_id = session.getAttribute("userId")
        if (user_id == null){
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        var req_page = 1
        var req_size = 10
        var jobsList : List<JobResponse?>?
        if(page != null && page > 0 && size != null && size > 0){
            req_page = page
            req_size = size
        }
        var mMap = mutableMapOf<String, Any>()
        if (status != null) {
            mMap.put("status", status)
        }
        if(query != null){
            mMap.put("query", query)
        }
        var offSetNumb = getOffSetNumb(req_page, req_size)
        mMap.put("page", req_page)
        mMap.put("size", req_size)
        mMap.put("offSetNumb", offSetNumb)
        mMap.put("employerId", user_id)
        if(query == null){
            jobsList = jobsService.selectJobListCorp(mMap)
            //jobsList = jobsService.selectJobList("", "", 1, 10, offSetNumb)
        }else{
            jobsList = jobsService.selectJobListCorp(mMap)
        }
        if (jobsList != null) {
            for(job in jobsList){
                if (job != null) {
                    job.status = status
                    job.postNumber = job.jobId
                    job.total_applier = job.appTotalCnt
                    job.unread = job.appUnreadCnt
                    job.pending = job.appPendingCnt
                    job.paper_passed = job.appPassedCnt
                    job.final_passed = job.appFinalCnt
                }
            }
        }
        var sMap = mutableMapOf<String, Any>()
        sMap.put("query", query.toString())
        var jobsCnt = jobsService.selectJobListCorpCnt(mMap)
        //jobsCnt = 90
        val jobListResponse = JobListResponse()
        if(jobsCnt > 0) {
            jobListResponse.content = jobsList!!.toTypedArray()
            jobListResponse.page = req_page.toString().toInt()
            jobListResponse.size = req_size.toString().toInt()
            jobListResponse.totalElements = jobsCnt
            jobListResponse.total = jobsCnt
            var pageCnt = jobsCnt / req_size.toString().toInt()
            var pageCnt_remain = jobsCnt % req_size.toString().toInt()
            if (pageCnt_remain > 0) {
                pageCnt = pageCnt + 1
            }
            jobListResponse.totalPages = pageCnt
        }else{
            return ResponseEntity(HttpStatus.OK)
            //return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        var re = request.queryString
        if(page == null){
            return ResponseEntity(jobsList.toTypedArray(), HttpStatus.OK)
        }else {
            return ResponseEntity(jobListResponse, HttpStatus.OK)
        }
    }
    //@GetMapping("/corpmem/posts")
    //    fun api_v1_auth_posts_list(request: HttpServletRequest, query: String?, keyword: String?, location: String?, page: Int?, size: Int?): ResponseEntity<Any> {
    //
    @GetMapping("/corpmem/posts/count")
    fun api_v1_auth_posts_count(session: HttpSession): ResponseEntity<Any>{
        /*
        ONGOING = 'ONGOING',
          CLOSED = 'CLOSED',
          ENDED = 'ENDED',
         */
        //먼저 채용공고 시간 범위 안에 있는 공고 갯수 ONGOING
        //시간을 지난 공고 갯수가 ENDED
        //마감을 강제로 누른 공고 갯수가 CLOSED
        //app_strt_tm
        //app_end_tm
        //status 채용중, close 이렇게 있음
        //jobsService.
        //jobsService.selectJobScrapList()

        var user_id = session.getAttribute("userId")
        if (user_id == null) {
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }

        var sMap = mutableMapOf<String, Any>()
        sMap.put("userId", user_id)

        var sRst = jobsService.selectJobStatusCnt(sMap)
        var rMap = mutableMapOf<String, Any>()

        if(!sRst.isEmpty()) {
            var sRst_first = sRst[0]
            rMap.put("ONGOING", sRst_first.get("ongoingcnt").toString())
            rMap.put("ENDED", sRst_first.get("endedcnt").toString())
            rMap.put("CLOSED", sRst_first.get("closedcnt").toString())
        } else {
            rMap.put("ONGOING", "0")
            rMap.put("ENDED", "0")
            rMap.put("CLOSED", "0")
        }

        return ResponseEntity(rMap, HttpStatus.OK)
    }
    @PostMapping("/corpmem/posts")
    //fun api_vi_auth_posts_insert(session: HttpSession, @RequestBody jobRequest: JobRequest): ResponseEntity<JobResponse?> {
    fun api_vi_auth_posts_insert(session: HttpSession, @RequestParam data:String, @RequestParam yourJobFiles:MultipartFile? , @RequestParam companyFormatFiles:MultipartFile? ): ResponseEntity<JobResponse?> {
        //var data = data.get("data")
        val gson = Gson()
        var jobRequest: Map<String, Any> = HashMap()
        jobRequest = Gson().fromJson(data, jobRequest.javaClass)

        var user_id = session.getAttribute("userId")
        if (user_id == null){
            //user_id = 31
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }

        //접수방법 시작(유어잡 즉시지원, 홈페이지, 우편, 방문, 이메일접수
        val applicationMethodMap = jobRequest["applicationMethod"] as MutableMap<String, Any>
        //유어잡 지원(즉시지원), 자사홈페이지

        //접수방법 시작(유어잡 즉시지원, 홈페이지, 우편, 방문, 이메일접수
        //val applicationMethodMap = jobRequest.applicationMethod as MutableMap<String, Any>
        //유어잡 지원(즉시지원), 자사홈페이지
        var applicationMethod_methods = applicationMethodMap["methods"] as ArrayList<*>
        var method_str = ""
        for((index, item) in applicationMethod_methods.withIndex()) {
            println("index : $index value : $item")
            if(index >= 0){
                //var index_value_str = applicationMethod_methods.get(index).toString()
                //var index_value = applicationMethod_methods.get(index).toString().toInt()
                method_str += method_name_array.get(index)
                if(applicationMethod_methods.size - 1 > index){
                    method_str += ","
                }
            }
        }

        var reqMap = mutableMapOf<String, Any>()
        reqMap.put("method_str", method_str)
        reqMap.put("employerid", user_id)

        //이력서 양식(유어잡 양식, 자사 양식)
        var applicationMethod_resumeTypes = applicationMethodMap["resumeTypes"] as MutableMap<String, Any>
        var useYourJobType = applicationMethod_resumeTypes["useYourJob"]
        var useCompanyFormatType = applicationMethod_resumeTypes["useCompanyFormat"]
        if(useYourJobType == true){
            reqMap.put("useYourJobType", 1)
        }else{
            reqMap.put("useYourJobType", 0)
        }
        if(useCompanyFormatType == true){
            reqMap.put("useCompanyFormatType", 1)
        }else{
            reqMap.put("useCompanyFormatType", 0)
        }
        //접수방법 홈페이지
        var applicationMethod_homepage = applicationMethodMap["homepage"].toString()
        reqMap.put("homepage", applicationMethod_homepage)
        //접수방법 종료

        //접수기간(시작, 종료, 타입:before)
        if(jobRequest["applicationPeriod"] != null){
            var applicationPeriodMap = jobRequest["applicationPeriod"] as MutableMap<String, Any>
            var applicationPeriodMap_start = applicationPeriodMap["start"] as MutableMap<String, Any>
            var applicationPeriodMap_start_date_time = applicationPeriodMap_start["date"].toString() + " " + applicationPeriodMap_start["time"].toString()
            reqMap.put("app_strt_tm", applicationPeriodMap_start_date_time)
            var applicationPeriodMap_end = applicationPeriodMap["end"] as MutableMap<String, Any>
            var applicationPeriodMap_end_date_time = applicationPeriodMap_end["date"].toString() + " " + applicationPeriodMap_end["time"].toString()
            reqMap.put("app_end_tm", applicationPeriodMap_end_date_time)
            //접수기간 후 마감 등 선택
            var applicationPeriodMap_type = applicationPeriodMap["type"] as String
            reqMap.put("app_prd_typ", applicationPeriodMap_type)
        }else{
            var applicationPeriodMap_start_date_time = "2025-03-10 09:00"
            reqMap.put("app_strt_tm", applicationPeriodMap_start_date_time)
            var applicationPeriodMap_end_date_time = "2099-06-10 09:00"
            reqMap.put("app_end_tm", applicationPeriodMap_end_date_time)
        }

        //핵심역량[]
        if(jobRequest["capabilities"] != null){
            var capabilitiesArray = jobRequest["capabilities"] as ArrayList<*>
            var capabilitiesStr = capabilitiesArray.joinToString(",")
            reqMap.put("capabilities", capabilitiesStr)
        }else{
            var capabilitiesStr = "cap1,cap2,cap2"
            reqMap.put("capabilities", capabilitiesStr)
        }
        //신입, 경력, 년수 등
        if(jobRequest["career"] != null){
            var careerMap = jobRequest["career"] as MutableMap<String, Any>
            var careertype = careerMap["type"] as String
            var isYearMatter = careerMap["isYearMatter"] as Boolean
            reqMap.put("career_type", careertype)
            if(isYearMatter == true){
                //경력무관인지? isyear_matter 은 안보이는데 무슨 파라미터인지 확인필요
                reqMap.put("isyear_matter", 1)
            }else{
                reqMap.put("isyear_matter", 0)
            }
        }else{
            reqMap.put("career_type", "new") //신입(new) 경력(experienced) 경력무관(any)
            reqMap.put("isyear_matter", 1) //1(경력 선택시 경력 년수 무관)
        }

        //우리기업의 정보가 맞나요?
        if(jobRequest["companyInfo"] != null){
            var companyInfoMap = jobRequest["companyInfo"] as MutableMap<String, Any>
            var cmpninfo_industry_arr = companyInfoMap["industry"] as ArrayList<*>
            var cmpninfo_industry_str = cmpninfo_industry_arr.joinToString(",")
            reqMap.put("cmpninfo_industry", cmpninfo_industry_str)

            var cmpninfo_name = companyInfoMap["name"] as String
            if(cmpninfo_name.length == 0){
                cmpninfo_name = "담당자명"
            }
            reqMap.put("cmpninfo_name", cmpninfo_name)
            var cmpninfo_namePrvt = companyInfoMap["namePrivate"] as Boolean
            if(cmpninfo_namePrvt == true){
                reqMap.put("cmpninfo_namePrvt", 1)
            }else{
                reqMap.put("cmpninfo_namePrvt", 0)
            }
            var cmpninfo_phnfld_1 = companyInfoMap["phoneField1"] as String
            reqMap.put("cmpninfo_phnfld_1", cmpninfo_phnfld_1)
            var cmpninfo_phnfld_2 = companyInfoMap["phoneField2"] as String
            reqMap.put("cmpninfo_phnfld_2", cmpninfo_phnfld_2)
            var cmpninfo_phnfld_3 = companyInfoMap["phoneField3"] as String
            reqMap.put("cmpninfo_phnfld_3", cmpninfo_phnfld_3)
            var cmpninfo_phnPrvt = companyInfoMap["phonePrivate"] as Boolean
            if(cmpninfo_phnPrvt == true){
                reqMap.put("cmpninfo_phnPrvt", 1)
            }else{
                reqMap.put("cmpninfo_phnPrvt", 0)
            }
        }else{
            reqMap.put("cmpninfo_industry", "통신 판매업, 전자상거래 소매업")
            reqMap.put("cmpninfo_name", "기업명")
            reqMap.put("cmpninfo_namePrvt", 1)
            reqMap.put("cmpninfo_phnPrvt", 1)
        }

        if(jobRequest["content"] != null) {
            var content = jobRequest["content"] as String
            reqMap.put("content", content)
        }else{
            reqMap.put("content", "")
        }

        //고용형태 (정규직/계약직/인턴 등)
        var emp_types_array = ArrayList<String>()
        if(jobRequest["employmentType"] != null){
            var employmentTypeMap = jobRequest["employmentType"] as MutableMap<String, Any>
            var emp_cntrct_prd = null_checker_for_int(employmentTypeMap["contractPeriod"])
            reqMap.put("emp_cntrct_prd", emp_cntrct_prd)
            var emp_cvrsn_avl = null_checker_for_boolean(employmentTypeMap["isConversionAvailable"])
            if(emp_cvrsn_avl == true){
                reqMap.put("emp_cvrsn_avl", 1)
            }else{
                reqMap.put("emp_cvrsn_avl", 0)
            }
            var emp_prb_mnths = null_checker_for_int_double(employmentTypeMap["probationMonths"])
            reqMap.put("emp_prb_mnths", emp_prb_mnths)
            emp_types_array = employmentTypeMap["types"] as ArrayList<String>
            var emp_types_str = emp_types_array.joinToString(",")
            reqMap.put("emp_types_str", emp_types_str)
            var emp_wrk_prd = null_checker_for_string(employmentTypeMap["workingPeriod"])
            reqMap.put("emp_wrk_prd", emp_wrk_prd)
        }else{
            reqMap.put("emp_prb_mnths", 3) //수습기간(정규직선택경우)
            reqMap.put("emp_cntrct_prd", 3) //계약기간(계약직선택경우)
            reqMap.put("emp_cvrsn_avl", 1) //정규직전환가능(계약직선택경우)
            emp_types_array.add("정규직")
            emp_types_array.add("계약직")
            emp_types_array.add("인턴")
            reqMap.put("emp_types_str", emp_types_array.joinToString(","))  //고용형태 (정규직, 계약직, 인턴등)
            reqMap.put("emp_wrk_prd", "emp_wrk_prd")
        }

        //여기서 job_postings_emptype 에 인서트 함
        var corpmem_insertjob = mutableMapOf<String, Any>()
        //corpmem_insertjob.put("job_id", )
        //직무 []
        var jobType_array = ArrayList<String>()
        if(jobRequest["jobType"] != null){
            jobType_array = jobRequest["jobType"] as ArrayList<String>
            var jobType_str = jobType_array.joinToString(",")
            reqMap.put("job_type_str", jobType_str)
            reqMap.put("job_type", jobType_str)
        }else{
            jobType_array.add("job1")
            jobType_array.add("job2")
            jobType_array.add("job3")
            jobType_array.add("job4")
            reqMap.put("job_type_str", jobType_array.joinToString(","))
            reqMap.put("job_type", jobType_array.joinToString(","))
        }

        //포지션
        if(jobRequest["position"] != null){
            var positionStr = jobRequest["position"] as String
            reqMap.put("position_str", positionStr)
        }else{
            reqMap.put("position_str", "관리자 포지션")
        }

        //직급/직책 [] 임원, 과장 등
        if(jobRequest["position_rank"] != null){
            var position_rank_Array = jobRequest["position_rank"] as ArrayList<*>
            var position_rank_str = position_rank_Array.joinToString(",")
            reqMap.put("position_rank_str", position_rank_str)
        }else{
            //여긴 뭐지?
            reqMap.put("position_rank_str", "position_rank_str1,position_rank_str2,position_rank_str3")
        }


        //학력 (고졸/대졸/석사 등)
        if(jobRequest["qualification"] != null){
            var qualificationMap = jobRequest["qualification"] as MutableMap<String, Any>
            var qualificationEdu_Map = qualificationMap["education"] as MutableMap<String, Any>
            var qlfct_edu_lvl = qualificationEdu_Map["level"] as String
            reqMap.put("qlfct_edu_lvl", qlfct_edu_lvl)
            var qlfct_is_expected_boolean = null_checker_for_boolean(qualificationEdu_Map["isExpectedGraduate"])
            if(qlfct_is_expected_boolean == false){
                reqMap.put("qlfct_exp_grd", 0)
            }else{
                reqMap.put("qlfct_exp_grd", 1)
            }
            var qualificationPre_Map = qualificationMap["preferences"] as MutableMap<String, Any>
            var qlfct_lan_arr = null_checker_for_arraylist(qualificationPre_Map["language"])
            var qlfct_lan_str = qlfct_lan_arr.joinToString(",")
            reqMap.put("qlfct_lan_str", qlfct_lan_str)
            var qlfct_lic_arr = null_checker_for_arraylist(qualificationPre_Map["license"])
            var qlfct_lic_str = qlfct_lic_arr.joinToString(",")
            reqMap.put("qlfct_lic_str", qlfct_lic_str)
            var qlfct_con_arr = null_checker_for_arraylist(qualificationPre_Map["specialCondition"])
            var qlfct_con_str = qlfct_con_arr.joinToString(",")
            reqMap.put("qlfct_con_str", qlfct_con_str)
            var qlfct_mjr_arr = null_checker_for_arraylist(qualificationPre_Map["specialMajor"])
            var qlfct_mjr_str = qlfct_mjr_arr.joinToString(",")
            reqMap.put("qlfct_mjr_str", qlfct_mjr_str)

            var use_language_boolean = boolean_return_int(qualificationPre_Map, "useLanguage")
            reqMap.put("use_lan", use_language_boolean)
            var use_licence_boolean = boolean_return_int(qualificationPre_Map, "useLicense")
            reqMap.put("use_lic", use_licence_boolean)
            var use_condition_boolean = boolean_return_int(qualificationPre_Map, "useSpecialCondition")
            reqMap.put("use_con", use_condition_boolean)
            var use_major_boolean = boolean_return_int(qualificationPre_Map, "useSpecialMajor")
            reqMap.put("use_mjr", use_major_boolean)
        }else{
            reqMap.put("qlfct_lan_str", "qlfct_lan_str")
            reqMap.put("qlfct_lic_str", "qlfct_lic_str")
            reqMap.put("qlfct_con_str", "qlfct_con_str")
            reqMap.put("qlfct_mjr_str", "qlfct_mjr_str")
            reqMap.put("use_lan", 0)
            reqMap.put("use_lic", 0)
            reqMap.put("use_con", 0)
            reqMap.put("use_mjr", 0)
        }

        //모집인원수 직접입력/프리셋
        if(jobRequest["recruitmentCount"] != null){
            var recruitmentCountMap = jobRequest["recruitmentCount"] as MutableMap<String, Any>
            var rcrtmntcnt_type = null_checker_for_string(recruitmentCountMap["type"])
            reqMap.put("rcrtmntcnt_type", rcrtmntcnt_type)
            var rcrtmntcnt_cnt = null_checker_for_double(recruitmentCountMap["count"])
            reqMap.put("rcrtmntcnt_cnt", rcrtmntcnt_cnt)
        }else{
            reqMap.put("rcrtmntcnt_type", "direct")
            reqMap.put("rcrtmntcnt_cnt", 5)
        }

        //스킬
        if(jobRequest["skills"] != null){
            var skillsArray = jobRequest["skills"] as ArrayList<*>
            var skills_str = skillsArray.joinToString(",")
            reqMap.put("skills_str", skills_str)
        }else{
            reqMap.put("skills_str", "skill1,skill2,skill3")
        }

        //약관
        if(jobRequest["terms"] != null){
            var termsMap = jobRequest["terms"] as MutableMap<String, Any>
            var terms_prsnl_inf = boolean_return_int(termsMap, "personalInfo")
            var terms_snstv_inf = boolean_return_int(termsMap, "sensitiveInfo")
            reqMap.put("terms_prsnl_inf", terms_prsnl_inf)
            reqMap.put("terms_snstv_inf", terms_snstv_inf)
        }else{
            reqMap.put("terms_prsnl_inf", 1)
            reqMap.put("terms_snstv_inf", 1)
        }

        //타이틀
        if(jobRequest["title"] != null){
            var title = jobRequest["title"] as String
            reqMap.put("title", title)
        }else{
            reqMap.put("title", "title")
        }


        //연봉/월급/시급 등
        if(jobRequest["workConditions"] != null){
            var workConditionMap = jobRequest["workConditions"] as MutableMap<String, Any>
            var wrkcndtn_lct = workConditionMap["location"] as MutableMap<String, Any>
            var wrkcndtn_lct_type = wrkcndtn_lct["type"] as String
            reqMap.put("wrkcndtn_lct_type", wrkcndtn_lct_type)

            var wrkcndtn_lct_addr = wrkcndtn_lct["address"] as String
            if(wrkcndtn_lct_addr.length == 0){
                wrkcndtn_lct_addr = "서울시 광진구 자양동 2-2"
            }
            var wrkcndtn_lct_addr_detail = null_checker_for_string(wrkcndtn_lct["address_detail"])
            reqMap.put("wrkcndtn_lct_addr", wrkcndtn_lct_addr)
            reqMap.put("wrkcndtn_lct_addr_dtl", wrkcndtn_lct_addr_detail)
            var wrkcndtn_rmt_avl = boolean_return_int(wrkcndtn_lct, "isRemoteAvailable")
            reqMap.put("wrkcndtn_lct_rmt_avl", wrkcndtn_rmt_avl)
            var wrkcndtn_rgn = wrkcndtn_lct["region"] as ArrayList<*>
            var wrkcndtn_rgn_str = wrkcndtn_rgn.joinToString(",")
            reqMap.put("wrkcndtn_lct_rgn_str", wrkcndtn_rgn_str)
            var wrkcndtn_typ = wrkcndtn_lct["type"] as String
            reqMap.put("wrkcndtn_lct_typ", wrkcndtn_typ)

            var wrkcndtn_slr = workConditionMap["salary"] as MutableMap<String, Any>
            var wrkcndtn_slr_typ = wrkcndtn_slr["type"] as String
            reqMap.put("wrkcndtn_slr_typ", wrkcndtn_slr_typ)
            var wrkcndtn_slr_min = wrkcndtn_slr["min"] as String
            reqMap.put("wrkcndtn_slr_min", wrkcndtn_slr_min)
            var wrkcndtn_slr_max = wrkcndtn_slr["max"] as String
            reqMap.put("wrkcndtn_slr_max", wrkcndtn_slr_max)
            var wrkcndtn_slr_min_wg = boolean_return_int(wrkcndtn_slr, "isMinimumWage")
            reqMap.put("wrkcndtn_slr_min_wg", wrkcndtn_slr_min_wg)
            var wrkcndtn_slr_dc = boolean_return_int(wrkcndtn_slr, "isInterviewDecided")
            reqMap.put("wrkcndtn_slr_dc", wrkcndtn_slr_dc)

            var wrkcndtn_wrkng_dy = workConditionMap["workingDay"] as MutableMap<String, Any>
            //var wrkcndtn_wrkng_dy_cst = wrkcndtn_wrkng_dy["customDays"] as ArrayList<*>
            //var wrkcndtn_wrkng_dy_cst_str = wrkcndtn_wrkng_dy_cst.joinToString(",")
            //reqMap.put("wrkcndtn_wrkng_dy_cst_str", wrkcndtn_wrkng_dy_cst_str)
            reqMap.put("wrkcndtn_wrkng_dy_cst_str", "")
            var wrkcndtn_wrkng_dy_typ = wrkcndtn_wrkng_dy["type"] as String
            reqMap.put("wrkcndtn_wrkng_dy_typ", wrkcndtn_wrkng_dy_typ)

            var wrkcndtn_hrs = workConditionMap["workingHours"] as MutableMap<String, Any>
            var wrkcndtn_hrs_isflex = boolean_return_int(wrkcndtn_hrs, "isFlexible")
            reqMap.put("wrkcndtn_hrs_isflex", wrkcndtn_hrs_isflex)
            var wrkcndtn_hrs_strt_hr = wrkcndtn_hrs["startHour"] as String
            var wrkcndtn_hrs_strt_mn = wrkcndtn_hrs["startMinute"] as String
            var wrkcndtn_hrs_end_hr = wrkcndtn_hrs["endHour"] as String
            var wrkcndtn_hrs_end_mn = wrkcndtn_hrs["endMinute"] as String

            reqMap.put("wrkcndtn_hrs_strt_hr", wrkcndtn_hrs_strt_hr)
            reqMap.put("wrkcndtn_hrs_strt_mn", wrkcndtn_hrs_strt_mn)
            reqMap.put("wrkcndtn_hrs_end_hr", wrkcndtn_hrs_end_hr)
            reqMap.put("wrkcndtn_hrs_end_mn", wrkcndtn_hrs_end_mn)
        }else{
            reqMap.put("wrkcndtn_lct_addr", "wrkcndtn_lct_addr")
            reqMap.put("wrkcndtn_lct_rmt_avl", 1)
            reqMap.put("wrkcndtn_lct_rgn_str", "wrkcndtn_rgn_str")
            reqMap.put("wrkcndtn_lct_typ", "domestic")

            reqMap.put("wrkcndtn_slr_typ", "연봉")
            reqMap.put("wrkcndtn_slr_min", "99")
            reqMap.put("wrkcndtn_slr_max", "999")
            reqMap.put("wrkcndtn_slr_min_wg", 0)
            reqMap.put("wrkcndtn_slr_dc", 0)

            reqMap.put("wrkcndtn_wrkng_dy_cst_str", "wrkcndtn_wrkng_dy_cst_str")
            reqMap.put("wrkcndtn_wrkng_dy_typ", "주5일")

            reqMap.put("wrkcndtn_hrs_isflex", 0)

            reqMap.put("wrkcndtn_hrs_strt_hr", "18")
            reqMap.put("wrkcndtn_hrs_strt_mn", "00")
            reqMap.put("wrkcndtn_hrs_end_hr", "09")
            reqMap.put("wrkcndtn_hrs_end_mn", "00")
        }

        /* 나중에 주석 풀것
                var wrkcndtn_hrs_shfts_map = wrkcndtn_hrs["shifts[0]"] as MutableMap<String, Any>
                var shfts_endHr_0 = wrkcndtn_hrs_shfts_map["endHour"] as String
                var shfts_endMn_0 = wrkcndtn_hrs_shfts_map["endMinute"] as String
                var shfts_strtHr_0 = wrkcndtn_hrs_shfts_map["startHour"] as String
                var shfts_strtMn_0 = wrkcndtn_hrs_shfts_map["startMinute"] as String
                reqMap.put("shfts_endHr_0", shfts_endHr_0)
                reqMap.put("shfts_endMn_0", shfts_endMn_0)
                reqMap.put("shfts_strtHr_0", shfts_strtHr_0)
                reqMap.put("shfts_strtMn_0", shfts_strtMn_0)
        */
        //경력 경력 체크 경력년수 무관
        if(jobRequest["year_matter"] != null) {
            var year_matterBoolean = jobRequest["year_matter"] as Boolean
            if (year_matterBoolean == true) {
                reqMap.put("year_matter", 1)
            } else {
                reqMap.put("year_matter", 0)
            }
        }else{
            reqMap.put("year_matter", 1)
        }

        reqMap.put("jobid", 0)
        reqMap.put("status", "채용중")
        val insertJobCnt = jobsService.insertCorpJob(reqMap)
        val last_insert_job_post_idx = reqMap.get("jobid")

        //last_insert_job_post_idx 인덱스, 이력서 양식을 첨부한다. 첨부파일 idx로 업데이트 다시한다.
        //파일을 저장하고
        //파일 테이블에 저장한다.(타입, 날짜, 파일이름)
        //파일 인덱스를 job_post에 업데이트 한다.
        val localDateTime: LocalDateTime = LocalDateTime.now()
        val localDate: LocalDate = LocalDate.now()

        //val uuid = UUID.randomUUID().toString()
        var fileTyp = "resume_urjob_typ"
        val todaydate = localDate.toString()

        // 이력서 본인 이미지 저장
        if(yourJobFiles != null) {

            var uuid = fileUtils.fileSave(rootpath = save_path, type = fileTyp, yeardate = todaydate, file = yourJobFiles)
            val fileNm = yourJobFiles.originalFilename ?: "unnamed"
            val fileExt = fileNm.substring(fileNm.lastIndexOf("."))

            // 이미지 URL 생성
            val imageUrl = fileUtils.getFileUrl(save_path, fileTyp, todaydate, uuid, fileNm)

            var mMap = mutableMapOf<String, Any>()
            mMap.put("fileidx", 0)
            mMap.put("user_id", user_id)
            mMap.put("con_id", last_insert_job_post_idx.toString().toInt())
            mMap.put("type", fileTyp)
            mMap.put("year_date", todaydate)
            mMap.put("file_name", uuid + "_" + fileNm)
            mMap.put("file_ext", fileExt)
            mMap.put("file_path_s3", imageUrl)
            //file_path_s3
            var insertCnt = fileUtilService.insertJobResumeFileData(mMap)
            var yourjobfileidx = mMap.get("fileidx")

            mMap.clear()
            mMap.put("jobid", last_insert_job_post_idx.toString().toInt())
            mMap.put("yourjobfileidx", yourjobfileidx.toString().toInt())
            //jobsService.updateJobInfo()
            jobsService.updateResumeYourJobFileIdx(mMap)
        }
        //이력서 파일 저장(자사 양식)
        fileTyp = "resume_company_typ"

        // 이력서 본인 이미지 저장
        if(companyFormatFiles != null) {

            var uuid = fileUtils.fileSave(
                rootpath = save_path,
                type = fileTyp,
                yeardate = todaydate,
                file = companyFormatFiles
            )
            val fileNm2 = companyFormatFiles.originalFilename ?: "unnamed"
            val fileExt2 = fileNm2.substring(fileNm2.lastIndexOf("."))

            // 이미지 URL 생성
            val imageUrl2 = fileUtils.getFileUrl(save_path, fileTyp, todaydate, uuid, fileNm2)
            //파일 정보 테이블에 저장 (채용공고 번호, 타입, 날짜, 파일명, 파일확장자)
            var mMap = mutableMapOf<String, Any>()
            mMap.put("fileidx", 0)
            mMap.put("user_id", user_id)
            mMap.put("con_id", last_insert_job_post_idx.toString().toInt())
            mMap.put("type", fileTyp)
            mMap.put("year_date", todaydate)
            mMap.put("file_name", uuid + "_" + fileNm2)
            mMap.put("file_ext", fileExt2)
            mMap.put("file_path_s3", imageUrl2)
            var insertCnt = fileUtilService.insertJobResumeFileData(mMap)
            var companyfileidx = mMap.get("fileidx")

            mMap.clear()
            mMap.put("jobid", last_insert_job_post_idx.toString().toInt())
            mMap.put("companyfileidx", companyfileidx.toString().toInt())
            //jobsService.updateJobInfo()
            jobsService.updateResumeCompanyFileIdx(mMap)
        }

        //파일 테이블 idx 가져와서 기존 채용공고 테이블에 첨부파일 인덱스를 업데이트 ?

        for(jobType_el in emp_types_array){
            var jobTypeMap = mutableMapOf<String, Any>()
            jobTypeMap.put("jobid", last_insert_job_post_idx.toString().toInt())
            jobTypeMap.put("jobtype", jobType_el)
            //insertJobType
            var insertCnt = jobsService.insertEmpJobType(jobTypeMap)
            insertCnt = 1
        }
        for(jobType_el in jobType_array){
            var jobTypeMap = mutableMapOf<String, Any>()
            jobTypeMap.put("jobid", last_insert_job_post_idx.toString().toInt())
            jobTypeMap.put("jobtype", jobType_el)
            //insertJobType
            var insertCnt = jobsService.insertJobType(jobTypeMap)
            insertCnt = 1
        }
        reqMap.put("status", "채용중")
        //val insertCnt = jobsService.insertJob(jobRequest)
        /*
        val jobResponse = JobResponse()  // 기본 생성자 사용 가능
        jobResponse.jobId = jobRequest.jobid
        jobResponse.employerId = jobRequest.employerid
        //jobResponse.title = jobRequest.title
        jobResponse.description = jobRequest.description
        jobResponse.requirements = jobRequest.requirements
        jobResponse.location = jobRequest.location
        jobResponse.countrycode = jobRequest.countryCode
         */
        //return ResponseEntity(HttpStatus.UNAUTHORIZED)
        return ResponseEntity(HttpStatus.OK)
    }
    @GetMapping("/corpmem/posts/{jobId}")
    fun api_vi_auth_posts_view(@PathVariable jobId: Int): ResponseEntity<JobResponse2?> {
        val jobResponse = JobResponse2()
        val job_info = jobsService.selectJobDetail(jobId)
        jobResponse.id = job_info.jobId
        jobResponse.jobId = job_info.jobId
        jobResponse.postNumber = job_info.jobId
        if(job_info.status != null){
            jobResponse.status = job_info.status
            if (job_info.status == "채용중"){
                jobResponse.status = "ONGOING"
            }
        }


        jobResponse.position = job_info.position

        if (job_info.jobType != null && job_info.jobType != "") {
            var jobTypeArrayList = changeStrToArray(job_info.jobType)
            jobResponse.jobType = jobTypeArrayList
        }

        var skillsArrayList = changeStrToArray(job_info.skills)
        jobResponse.skills = skillsArrayList

        var capabilitiesArrayList = changeStrToArray(job_info.capabilities)
        jobResponse.capabilities = capabilitiesArrayList

        var mMap = mutableMapOf<String, Any>()
        mMap.put("type", job_info.careerType.toString())
        mMap.put("minYears", 3)
        var isYearMatterBoolean = intToBoolean(job_info.isYearMatter.toString().toInt())
        mMap.put("isYearMatter", isYearMatterBoolean)
        jobResponse.career = mMap

        var mMap2 = mutableMapOf<String, Any>()
        var emp_types = changeStrToArray(job_info.empType)
        mMap2.put("types", emp_types)
        mMap2.put("probationMonths", job_info.empProbationMonths.toString().toInt())
        mMap2.put("contractPeriod", job_info.empContractPeriod.toString().toInt())
        //mMap2.put("isConversionAvailable", job_info.isConversionAvailable.toString().toInt())
        mMap2.put("isConversionAvailable", true)
        mMap2.put("workingPeriod", job_info.workingPeriod.toString().toInt())
        jobResponse.employmentType = mMap2

        var mMap3 = mutableMapOf<String, Any>()
        mMap3.put("type", job_info.rcrtmntcntType.toString())
        mMap3.put("count", job_info.rcrtmntcntCnt.toString().toInt())
        //rcrtmntcntType
        //rcrtmntcntCnt
        jobResponse.recruitmentCount = mMap3

        var positionRankArrayList = changeStrToArray(job_info.positionRankStr)
        jobResponse.position_rank = positionRankArrayList

        //지원자격 학력
        //qualification.education.level
        var mMap4 = mutableMapOf<String, Any>()
        var mMap4_1 = mutableMapOf<String, Any>()
        //mMap4_1.put("level", "대학교졸업(4년)")
        mMap4_1.put("level", job_info.educationLv.toString())
        mMap4_1.put("isExpectedGraduate", intToBoolean(job_info.educationExpGrd))
        mMap4.put("education", mMap4_1)

        var mMap4_2 = mutableMapOf<String, Any>()
        mMap4_2.put("useSpecialCondition", intToBoolean(job_info.useCon))
        mMap4_2.put("useLanguage", intToBoolean(job_info.useLan))
        mMap4_2.put("useLicense", intToBoolean(job_info.useLic))
        mMap4_2.put("useSpecialMajor", intToBoolean(job_info.useMjr))

        mMap4_2.put("specialCondition", changeStrToArray(job_info.qlfctConStr))
        mMap4_2.put("language", changeStrToArray(job_info.qlfctLanStr))
        mMap4_2.put("license", changeStrToArray(job_info.qlfctLicStr))
        mMap4_2.put("specialMajor", changeStrToArray(job_info.qlfctMjrStr))

        mMap4.put("preferences", mMap4_2)

        jobResponse.qualification = mMap4

        var mMap5 = mutableMapOf<String, Any>()
        var mMap5_1 = mutableMapOf<String, Any>()
        mMap5_1.put("type", job_info.wrkcndtnSlrTyp.toString())
        mMap5_1.put("min", job_info.wrkcndtnSlrMin.toString())
        mMap5_1.put("max", job_info.wrkcndtnSlrMax.toString())
        mMap5_1.put("isInterviewDecided", intToBoolean(job_info.wrkcndtnSlrDc.toString().toInt()))
        mMap5_1.put("isMinimumWage", intToBoolean(job_info.wrkcndtnSlrMinWg.toString().toInt()))
        mMap5.put("salary", mMap5_1)

        var mMap5_2 = mutableMapOf<String, Any>()
        mMap5_2.put("type", job_info.wrkcndtnLctTyp.toString())
        mMap5_2.put("isRemoteAvailable", intToBoolean(job_info.wrkcndtnLctRmtAvl.toString().toInt()))
        mMap5_2.put("address", job_info.wrkcndtnLctAddr.toString())
        mMap5_2.put("address_detail", job_info.wrkcndtnLctAddrDtl.toString())
        mMap5_2.put("region", changeStrToArray(job_info.wrkcndtnLctRgnStr))
        mMap5.put("location", mMap5_2)

        var mMap5_3 = mutableMapOf<String, Any>()
        mMap5_3.put("type", job_info.wrkcndtnWrkngDyTyp.toString())
        mMap5.put("workingDay", mMap5_3)

        var mMap5_4 = mutableMapOf<String, Any>()
        mMap5_4.put("startHour", job_info.wrkcndtnHrsStrtHr.toString())
        mMap5_4.put("startMinute", job_info.wrkcndtnHrsStrtMn.toString())
        mMap5_4.put("endHour", job_info.wrkcndtnHrsEndHr.toString())
        mMap5_4.put("endMinute", job_info.wrkcndtnHrsEndMn.toString())
        mMap5_4.put("isFlexible", intToBoolean(job_info.wrkcndtnHrsIsflex.toString().toInt()))
        mMap5.put("workingHours", mMap5_4)

        jobResponse.workConditions = mMap5

        var mMap6 = mutableMapOf<String, Any>()
        var mMap6_1 = mutableMapOf<String, Any>()
        //mMap6_1.put("date", "2025-03-14")
        //mMap6_1.put("time", "00:00")
        mMap6_1.put("date", job_info.appStrtTm.toString().split(" ")[0])
        mMap6_1.put("time", job_info.appStrtTm.toString().split(" ")[1])
        mMap6.put("start", mMap6_1)
        var mMap6_2 = mutableMapOf<String, Any>()
        mMap6_2.put("date", job_info.appEndTm.toString().split(" ")[0])
        mMap6_2.put("time", job_info.appEndTm.toString().split(" ")[1])
        mMap6.put("end", mMap6_2)
        mMap6.put("type", job_info.appPrdTyp.toString())

        jobResponse.applicationPeriod = mMap6

        var mMap7 = mutableMapOf<String, Any>()

        //var methodsArrayList = changeStrToArray("유어잡,유어잡 지원(즉시지원)")
        var methodsArrayList = changeStrToArray(job_info.appMthds)
        mMap7.put("methods", methodsArrayList)
        var appMthdsHmpg = null_checker_for_string(job_info.appMthdsHmpg)
        mMap7.put("homepage", appMthdsHmpg)

        var mMap7_1 = mutableMapOf<String, Any>()
        mMap7_1.put("useYourJob", intToBoolean(job_info.appRsmYjty))

        var fileArr = ArrayList<Any>()
        var fileArr2 = ArrayList<Any>()
        var mMap7_2 = mutableMapOf<String, Any>()
        var mMap7_2_1 = mutableMapOf<String, Any>()

        var fMap = mutableMapOf<String, Any>()
        if(job_info.yourjobFileidx != null) {

            fMap.put("fileidx", job_info.yourjobFileidx.toString().toInt())
            var attached_file_inform = fileUtilService.getFileDataByIdx(fMap)
            var apo_file_name = attached_file_inform.get("file_name").toString()
            apo_file_name = apo_file_name.split("_")[1]
            var apo_download_url = null_checker_for_string(attached_file_inform.get("file_path_s3"))

            //var apo_download_url = "http://localhost:8082/api/v1/image/download/48"
            mMap7_2.put("name", apo_file_name)
            mMap7_2_1.put("file", mMap7_2)
            mMap7_2_1.put("apo_file_nm", apo_file_name)
            mMap7_2_1.put("apo_download_url", apo_download_url)
            fileArr.add(mMap7_2_1)
            mMap7_1.put("yourJobFiles", fileArr)
        }
        fMap.clear()
        if(job_info.companyFileidx != null) {

            fMap.put("fileidx", job_info.companyFileidx.toString().toInt())
            var attached_file_inform = fileUtilService.getFileDataByIdx(fMap)
            var apo_file_name = attached_file_inform.get("file_name").toString()
            apo_file_name = apo_file_name.split("_")[1]
            var apo_download_url = null_checker_for_string(attached_file_inform.get("file_path_s3"))

            var mMap7_3 = mutableMapOf<String, Any>()
            var mMap7_3_1 = mutableMapOf<String, Any>()

            mMap7_1.put("useCompanyFormat", intToBoolean(job_info.appRsmCmpnty))
            mMap7_3.put("name", apo_file_name)
            mMap7_3_1.put("file", mMap7_3)
            mMap7_3_1.put("apo_file_nm", apo_file_name)
            mMap7_3_1.put("apo_download_url", apo_download_url)
            fileArr2.add(mMap7_3_1)
            mMap7_1.put("companyFormatFiles", fileArr2)
        }

        mMap7.put("resumeTypes", mMap7_1)

        jobResponse.applicationMethod = mMap7

        var mMap8 = mutableMapOf<String, Any>()
        mMap8.put("name", job_info.cmpninfoName.toString())
        mMap8.put("namePrivate", intToBoolean(job_info.cmpninfoNamePrvt.toString().toInt()))
        mMap8.put("phoneField1", job_info.cmpninfoPhnfld1.toString())
        mMap8.put("phoneField2", job_info.cmpninfoPhnfld2.toString())
        mMap8.put("phoneField3", job_info.cmpninfoPhnfld3.toString())
        mMap8.put("phonePrivate", intToBoolean(job_info.cmpninfoPhnPrvt.toString().toInt()))
        var cmpninfoIndustryArrayList = changeStrToArray(job_info.cmpninfoIndustry)
        mMap8.put("industry", cmpninfoIndustryArrayList) //cmpninfo_industry

        jobResponse.companyInfo = mMap8

        jobResponse.content = job_info.content.toString()

        jobResponse.employerId = job_info.employerId
        jobResponse.title = job_info.title
        jobResponse.description = job_info.description
        jobResponse.requirements = job_info.requirements
        jobResponse.location = job_info.location
        jobResponse.countrycode = job_info.countrycode
        jobResponse.salary = job_info.salary?.toFloat()
        jobResponse.views = job_info.views
        jobResponse.startDate = job_info.startDate
        jobResponse.endDate = job_info.endDate
        jobResponse.registeredDate = job_info.createdAt
        jobResponse.createdAt = job_info.createdAt
        jobResponse.updatedAt = job_info.updatedAt
        //전체
        jobResponse.total_applier = job_info.appTotalCnt
        //미열람(이건 안씀)
        jobResponse.unread = job_info.appUnreadCnt
        //서류전형(심사중)
        jobResponse.pending = job_info.appPendingCnt
        //서류통과(면접)
        jobResponse.paper_passed = job_info.appPassedCnt
        //불합격
        jobResponse.failed = job_info.appFailedCnt
        //최종합격
        jobResponse.final_passed = job_info.appFinalCnt
        return ResponseEntity(jobResponse, HttpStatus.OK)
    }
    @GetMapping("/corpmem/posts/{postId}/{applicationId}")
    fun api_v1_auth_posts_applicant_resume_detail(@PathVariable postId: Int, @PathVariable applicationId: Int, session: HttpSession): ResponseEntity<Any>{
        var user_id = session.getAttribute("userId")
        if(user_id == null){
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        //
        //현재 상태를 가져와서 UNREAD 일때 PENDING 으로 변경
        //현재 상태를 가져온다.

        var applyInfo = applicationService.selectApplyDetail(applicationId)
        var applyStatus = applyInfo.get("status").toString()
        if(applyStatus == "UNREAD"){
            applicationService.selectApplyDetail(2)
            var updateMap = mutableMapOf<String, Any>()
            updateMap.put("applicationId", applicationId)
            updateMap.put("status", "PENDING")
            applicationService.updateApplyStatus(updateMap)
        }
        var resumeId = applyInfo.get("resume_id").toString().toInt()

        //채용 담당자의 이력서 조회 테이블에 추가
        //채용 담당자 아이디, 이력서 번호 세트로
        corpmemService.selectMyJobCnt(9)
        var viewMap = mutableMapOf<String, Any>()
        viewMap.put("userId", user_id)
        viewMap.put("resumeId", resumeId)
        corpmemService.insertResumeView(viewMap)
        //이력서 로 select 해서 하나씩 추가하도록
        var rMap = mutableMapOf<String, Any>()

        rMap.put("title", "title")
        rMap.put("name", "title")
        rMap.put("gender", "title")
        rMap.put("birth", "title")
        rMap.put("careerType", "title")
        rMap.put("phone", "title")
        rMap.put("englishName", "title")
        rMap.put("address", "title")
        rMap.put("nationality", "title")
        rMap.put("email", "title")
        rMap.put("visa", "title")

        //title, name, gender, birth, careerType, phone, englishName, address, nationality, email, visa,
        //education[], careers[], activities[], languages[], certifications[], awards[],
        var arrList = ArrayList<Any>()
        rMap.put("education", arrList)
        rMap.put("careers", arrList)
        rMap.put("activities", arrList)
        rMap.put("languages", arrList)
        rMap.put("certifications", arrList)
        rMap.put("awards", arrList)

        var emp = mutableMapOf<String, Any>()
        emp.put("isVeteran", "isVeteran")
        emp.put("isEmploymentProtected", "isEmploymentProtected")
        emp.put("isEmploymentSupport", "isEmploymentSupport")
        emp.put("hasMilitaryService", "hasMilitaryService")
        emp.put("militaryServiceJoinDate", "militaryServiceJoinDate")
        emp.put("militaryServiceClass", "militaryServiceClass")
        emp.put("militaryServiceStatus", "militaryServiceStatus")
        emp.put("disabledGrade", "severe")
        //disabledGrade, severe
        emp.put("isDisabled", "isDisabled")
        rMap.put("employmentPreferences", emp)
        //employmentPreferences.isVeteran, isEmploymentProtected, isEmploymentSupport
        //hasMilitaryService, militaryServiceJoinDate, militaryServiceClass, militaryServiceStatus
        //isDisabled

        //selfIntroductions[],
        rMap.put("selfIntroductions", arrList)

        var resumeInfo = resumeService.selectResumeDetail(resumeId)

        var profileImgIdx = resumeInfo.profileImgIdx
        var fMap = mutableMapOf<String, Any>()
        if(profileImgIdx != null){
            fMap.put("fileidx", profileImgIdx.toString().toInt())
            var attached_file_inform = fileUtilService.getFileDataByIdx(fMap)
            var apo_download_url = null_checker_for_string(attached_file_inform.get("file_path_s3"))
            resumeInfo.picturePath = apo_download_url
        }

        //resume_educations 테이블에서 가져온다.
        val resume_educations = resumeService.selectResumeEducations(resumeId)
        resumeInfo.educations = resume_educations as ArrayList<Any>
        val resume_languages = resumeService.selectResumeLanguages(resumeId)
        resumeInfo.languages = resume_languages as ArrayList<Any>
        val resume_careers = resumeService.selectResumeCareers(resumeId)
        for(resume_carrer in resume_careers){
            var isCurrent = intToBoolean(resume_carrer.get("isCurrent"))
            resume_carrer.put("isCurrent", isCurrent)
        }
        resumeInfo.careers = resume_careers as ArrayList<Any>
        var resume_activities = resumeService.selectResumeActivities(resumeId)
        resumeInfo.activities = resume_activities as ArrayList<Any>
        var resume_certifications = resumeService.selectResumeCertifications(resumeId)
        resumeInfo.certifications = resume_certifications as ArrayList<Any>
        var resume_awards = resumeService.selectResumeAwards(resumeId)
        resumeInfo.awards = resume_awards as ArrayList<Any>
        var resume_selfintro = resumeService.selectResumeSelfIntro(resumeId)
        resumeInfo.selfIntroductions = resume_selfintro as ArrayList<Any>

        var apostilles = ArrayList<Any>()
        resumeInfo.apostilles = apostilles

        var resume_prf = resumeService.selectResumeEmpPrf(resumeId)
        var empprfMap = mutableMapOf<String, Any>()
        for(prf in resume_prf){
            var isVeteran = prf.get("isVeteran")
            var isVeteran_boolean = intToBoolean(isVeteran)
            empprfMap.put("isVeteran", isVeteran_boolean)

            var isEmploymentProtected = prf.get("isEmploymentProtected")
            var isEmploymentProtected_boolean = intToBoolean(isEmploymentProtected)
            empprfMap.put("isEmploymentProtected", isEmploymentProtected_boolean)

            //isEmploymentSupport
            var isEmploymentSupport = prf.get("isEmploymentSupport")
            var isEmploymentSupport_boolean = intToBoolean(isEmploymentSupport)
            empprfMap.put("isEmploymentSupport", isEmploymentSupport_boolean)

            //isDisabled
            var isDisabled = prf.get("isDisabled")
            var isDisabled_boolean = intToBoolean(isDisabled)
            empprfMap.put("isDisabled", isDisabled_boolean)

            //hasMilitaryService
            var hasMilitaryService = prf.get("hasMilitaryService")
            var hasMilitaryService_boolean = intToBoolean(hasMilitaryService)
            empprfMap.put("hasMilitaryService", hasMilitaryService_boolean)

            //disabledGrade
            var disabledGrade = prf.get("disabledGrade")
            empprfMap.put("disabledGrade", disabledGrade.toString())
            //militaryServiceStatus
            var militaryServiceStatus = prf.get("militaryServiceStatus")
            empprfMap.put("militaryServiceStatus", militaryServiceStatus.toString())
            //militaryServiceJoinDate
            var militaryServiceJoinDate = prf.get("militaryServiceJoinDate")
            empprfMap.put("militaryServiceJoinDate", militaryServiceJoinDate.toString())
            //militaryServiceOutDate
            var militaryServiceOutDate = prf.get("militaryServiceOutDate")
            empprfMap.put("militaryServiceOutDate", militaryServiceOutDate.toString())
            //militaryServiceClass
            var militaryServiceClass = prf.get("militaryServiceClass")
            empprfMap.put("militaryServiceClass", militaryServiceClass.toString())

            //empprfMap.put("disabledGrade", "mild")
        }
        resumeInfo.employmentPreferences = empprfMap

        //resumeInfo.empprf = resume_prf as ArrayList<Any>

        //languages
        var resp_mMap = mutableMapOf<String, Any>()
        resp_mMap.put("data", resumeInfo)


        var applylist = applicationService.selectApplyListByJobId(2)
        return ResponseEntity(resumeInfo, HttpStatus.OK)
    }
    @PutMapping("/corpmem/volunteerlist/{jobId}/{applicationId}")
    fun api_v1_auth_posts_applicant_status(
        @PathVariable jobId: Int,
        @PathVariable applicationId: Int,
        @RequestBody applicationRequest: ApplicationRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        var user_id = session.getAttribute("userId")
        if (user_id == null) {
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }

        var status = applicationRequest.status.toString()
        var updateMap = mutableMapOf<String, Any>()
        updateMap.put("applicationId", applicationId)
        updateMap.put("status", status)

        // 상태 업데이트
        val updateCnt = applicationService.updateApplyStatus(updateMap)

        // FINAL 상태이고 title과 content가 있는 경우 이메일 발송
        if (status == "FINAL" && !applicationRequest.title.isNullOrBlank() && !applicationRequest.content.isNullOrBlank()) {
            try {
                // 지원 정보 조회
                val applyInfo = applicationService.selectApplyDetail(applicationId)
                val jobSeekerId = applyInfo["job_seeker_id"].toString().toInt()

                // 지원자 정보 조회
                val jobSeekerInfo = authService.getUserInfoByUserId(jobSeekerId)
                val jobSeekerEmail = jobSeekerInfo["email"]?.toString() ?: ""
                val jobSeekerName = jobSeekerInfo["name"]?.toString() ?: ""

                // 공고 정보 조회
                val jobInfo = jobsService.selectJobDetail(jobId)
                val companyName = jobInfo.companyName ?: ""
                val position = jobInfo.position ?: ""

                // 이메일 발송
                if (jobSeekerEmail.isNotBlank()) {
                    emailService.sendFinalAcceptanceNotification(
                        toEmail = jobSeekerEmail,
                        companyName = companyName,
                        position = position,
                        title = applicationRequest.title!!,
                        content = applicationRequest.content!!,
                        jobSeekerName = jobSeekerName
                    )
                }
            } catch (e: Exception) {
                // 이메일 발송 실패해도 상태 업데이트는 성공으로 처리
                println("최종 합격 이메일 발송 실패: ${e.message}")
            }
        }

        return ResponseEntity(HttpStatus.OK)
    }

    @GetMapping("/corpmem/posts/{jobId}/volunteerlist")
    fun api_vi_auth_posts_applicants_list(@PathVariable jobId: Int, applicationRequest: ApplicationRequest, session: HttpSession): ResponseEntity<VolunteerListResponse?>? {
        var user_id = session.getAttribute("userId")
        if (user_id == null){
            //user_id = 1
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        //user_id = 31
        var applyList = applicationService.selectApplyListByJobId(jobId)
        //var applyList = applicationService.selectListMyApply(user_id.toString().toInt())
        if (applyList != null) {
            for(apply in applyList){
                if (apply != null) {
                    //여기서 원래는 job_seeker_id(구직자)로 정보를 가져와서 아래쪽에 넣으면됨
                    //apply.resumeId = 13
                    //applicationService.
                    //apply.name = "구직자이름"
                    //apply.gender = "남자"
                    apply.age = "38"
                    apply.experience = "6"
                    //apply.education = "고등학교졸업"
                    //apply.major = "경제학"
                    apply.expectedSalary = 300
                    //apply.applicationDate = "2025-05-01"
                    //apply.status = "미열람"
                }
            }
        }
        var volunteerListResponse = VolunteerListResponse()
        if (applyList != null) {
            volunteerListResponse.content = applyList as ArrayList<Volunteer?>?
        }
        var applyList_arr = applyList?.toTypedArray()
        var asd = ArrayList<ApplicationResponse>()
        return ResponseEntity(volunteerListResponse, HttpStatus.OK)
    }

    @PutMapping("/corpmem/posts/{jobId}")
    //fun api_vi_auth_posts_edit(@PathVariable jobId: Int, @RequestBody jobRequest: JobRequest, session: HttpSession ): ResponseEntity<JobResponse?> {
    fun api_vi_auth_posts_edit(session: HttpSession, @PathVariable jobId: Int, @RequestParam data:String, @RequestParam yourJobFiles:MultipartFile? , @RequestParam companyFormatFiles:MultipartFile? ): ResponseEntity<JobResponse?> {
        try {
            val gson = Gson()
            var jobRequest: Map<String, Any> = HashMap()
            jobRequest = Gson().fromJson(data, jobRequest.javaClass)

            var user_id = session.getAttribute("userId")
            if (user_id == null){
                //user_id = 31
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }

            //접수방법 시작(유어잡 즉시지원, 홈페이지, 우편, 방문, 이메일접수
            val applicationMethodMap = jobRequest["applicationMethod"] as MutableMap<String, Any>
            //유어잡 지원(즉시지원), 자사홈페이지

            //접수방법 시작(유어잡 즉시지원, 홈페이지, 우편, 방문, 이메일접수
            //val applicationMethodMap = jobRequest.applicationMethod as MutableMap<String, Any>
            //유어잡 지원(즉시지원), 자사홈페이지
            var applicationMethod_methods = applicationMethodMap["methods"] as ArrayList<*>
            var method_str = ""
            for((index, item) in applicationMethod_methods.withIndex()) {
                println("index : $index value : $item")
                if(index >= 0){
                    method_str += item
                    if(applicationMethod_methods.size - 1 > index){
                        method_str += ","
                    }
                }
            }

            var reqMap = mutableMapOf<String, Any>()
            reqMap.put("method_str", method_str)
            reqMap.put("employerid", user_id)

            //이력서 양식(유어잡 양식, 자사 양식)
            var applicationMethod_resumeTypes = applicationMethodMap["resumeTypes"] as MutableMap<String, Any>
            var useYourJobType = applicationMethod_resumeTypes["useYourJob"]
            var useCompanyFormatType = applicationMethod_resumeTypes["useCompanyFormat"]
            if(useYourJobType == true){
                reqMap.put("useYourJobType", 1)
            }else{
                reqMap.put("useYourJobType", 0)
            }
            if(useCompanyFormatType == true){
                reqMap.put("useCompanyFormatType", 1)
            }else{
                reqMap.put("useCompanyFormatType", 0)
            }
            //접수방법 홈페이지
            var applicationMethod_homepage = applicationMethodMap["homepage"].toString()
            reqMap.put("homepage", applicationMethod_homepage)
            //접수방법 종료

            //접수기간(시작, 종료, 타입:before)
            if(jobRequest["applicationPeriod"] != null){
                var applicationPeriodMap = jobRequest["applicationPeriod"] as MutableMap<String, Any>
                var applicationPeriodMap_start = applicationPeriodMap["start"] as MutableMap<String, Any>
                var applicationPeriodMap_start_date_time = applicationPeriodMap_start["date"].toString() + " " + applicationPeriodMap_start["time"].toString()
                reqMap.put("app_strt_tm", applicationPeriodMap_start_date_time)
                var applicationPeriodMap_end = applicationPeriodMap["end"] as MutableMap<String, Any>
                var applicationPeriodMap_end_date_time = applicationPeriodMap_end["date"].toString() + " " + applicationPeriodMap_end["time"].toString()
                reqMap.put("app_end_tm", applicationPeriodMap_end_date_time)
                //접수기간 후 마감 등 선택
                var applicationPeriodMap_type = applicationPeriodMap["type"] as String
                reqMap.put("app_prd_typ", applicationPeriodMap_type)
            }else{
                var applicationPeriodMap_start_date_time = "2025-03-10 09:00"
                reqMap.put("app_strt_tm", applicationPeriodMap_start_date_time)
                var applicationPeriodMap_end_date_time = "2099-06-10 09:00"
                reqMap.put("app_end_tm", applicationPeriodMap_end_date_time)
            }

            //핵심역량[]
            if(jobRequest["capabilities"] != null){
                var capabilitiesArray = jobRequest["capabilities"] as ArrayList<*>
                var capabilitiesStr = capabilitiesArray.joinToString(",")
                reqMap.put("capabilities", capabilitiesStr)
            }else{
                var capabilitiesStr = "cap1,cap2,cap2"
                reqMap.put("capabilities", capabilitiesStr)
            }
            //신입, 경력, 년수 등
            if(jobRequest["career"] != null){
                var careerMap = jobRequest["career"] as MutableMap<String, Any>
                var careertype = careerMap["type"] as String
                var isYearMatter = careerMap["isYearMatter"] as Boolean
                reqMap.put("career_type", careertype)
                if(isYearMatter == true){
                    //경력무관인지? isyear_matter 은 안보이는데 무슨 파라미터인지 확인필요
                    reqMap.put("isyear_matter", 1)
                }else{
                    reqMap.put("isyear_matter", 0)
                }
            }else{
                reqMap.put("career_type", "new") //신입(new) 경력(experienced) 경력무관(any)
                reqMap.put("isyear_matter", 1) //1(경력 선택시 경력 년수 무관)
            }

            //우리기업의 정보가 맞나요?
            if(jobRequest["companyInfo"] != null){
                var companyInfoMap = jobRequest["companyInfo"] as MutableMap<String, Any>
                var cmpninfo_industry_arr = companyInfoMap["industry"] as ArrayList<*>
                var cmpninfo_industry_str = cmpninfo_industry_arr.joinToString(",")
                reqMap.put("cmpninfo_industry", cmpninfo_industry_str)

                var cmpninfo_name = companyInfoMap["name"] as String
                if(cmpninfo_name.length == 0){
                    cmpninfo_name = "담당자명"
                }
                reqMap.put("cmpninfo_name", cmpninfo_name)
                var cmpninfo_namePrvt = companyInfoMap["namePrivate"] as Boolean
                if(cmpninfo_namePrvt == true){
                    reqMap.put("cmpninfo_namePrvt", 1)
                }else{
                    reqMap.put("cmpninfo_namePrvt", 0)
                }
                var cmpninfo_phnfld_1 = companyInfoMap["phoneField1"] as String
                reqMap.put("cmpninfo_phnfld_1", cmpninfo_phnfld_1)
                var cmpninfo_phnfld_2 = companyInfoMap["phoneField2"] as String
                reqMap.put("cmpninfo_phnfld_2", cmpninfo_phnfld_2)
                var cmpninfo_phnfld_3 = companyInfoMap["phoneField3"] as String
                reqMap.put("cmpninfo_phnfld_3", cmpninfo_phnfld_3)
                var cmpninfo_phnPrvt = companyInfoMap["phonePrivate"] as Boolean
                if(cmpninfo_phnPrvt == true){
                    reqMap.put("cmpninfo_phnPrvt", 1)
                }else{
                    reqMap.put("cmpninfo_phnPrvt", 0)
                }
            }else{
                reqMap.put("cmpninfo_industry", "통신 판매업, 전자상거래 소매업")
                reqMap.put("cmpninfo_name", "기업명")
                reqMap.put("cmpninfo_namePrvt", 1)
                reqMap.put("cmpninfo_phnPrvt", 1)
            }

            if(jobRequest["content"] != null) {
                var content = jobRequest["content"] as String
                reqMap.put("content", content)
            }else{
                reqMap.put("content", "모집요강 상세내용")
            }

            //고용형태 (정규직/계약직/인턴 등)
            var emp_types_array = ArrayList<String>()
            if(jobRequest["employmentType"] != null){
                var employmentTypeMap = jobRequest["employmentType"] as MutableMap<String, Any>
                var emp_cntrct_prd = null_checker_for_int_double(employmentTypeMap["contractPeriod"])
                reqMap.put("emp_cntrct_prd", emp_cntrct_prd)
                var emp_cvrsn_avl = null_checker_for_boolean(employmentTypeMap["isConversionAvailable"])
                if(emp_cvrsn_avl == true){
                    reqMap.put("emp_cvrsn_avl", 1)
                }else{
                    reqMap.put("emp_cvrsn_avl", 0)
                }
                var emp_prb_mnths = null_checker_for_double(employmentTypeMap["probationMonths"])
                reqMap.put("emp_prb_mnths", emp_prb_mnths.toInt())
                emp_types_array = employmentTypeMap["types"] as ArrayList<String>
                var emp_types_str = emp_types_array.joinToString(",")
                reqMap.put("emp_types_str", emp_types_str)
                var emp_wrk_prd = null_checker_for_string(employmentTypeMap["workingPeriod"])
                reqMap.put("emp_wrk_prd", emp_wrk_prd)
            }else{
                reqMap.put("emp_prb_mnths", 3) //수습기간(정규직선택경우)
                reqMap.put("emp_cntrct_prd", 3) //계약기간(계약직선택경우)
                reqMap.put("emp_cvrsn_avl", 1) //정규직전환가능(계약직선택경우)
                emp_types_array.add("정규직")
                emp_types_array.add("계약직")
                emp_types_array.add("인턴")
                reqMap.put("emp_types_str", emp_types_array.joinToString(","))  //고용형태 (정규직, 계약직, 인턴등)
                reqMap.put("emp_wrk_prd", "emp_wrk_prd")
            }

            //여기서 job_postings_emptype 에 인서트 함
            var corpmem_insertjob = mutableMapOf<String, Any>()
            //corpmem_insertjob.put("job_id", )
            //직무 []
            var jobType_array = ArrayList<String>()
            if(jobRequest["jobType"] != null){
                jobType_array = jobRequest["jobType"] as ArrayList<String>
                var jobType_str = jobType_array.joinToString(",")
                reqMap.put("job_type_str", jobType_str)
                reqMap.put("job_type", jobType_str)
            }else{
                jobType_array.add("job1")
                jobType_array.add("job2")
                jobType_array.add("job3")
                jobType_array.add("job4")
                reqMap.put("job_type_str", jobType_array.joinToString(","))
                reqMap.put("job_type", jobType_array.joinToString(","))
            }

            //포지션
            if(jobRequest["position"] != null){
                var positionStr = jobRequest["position"] as String
                reqMap.put("position_str", positionStr)
            }else{
                reqMap.put("position_str", "관리자 포지션")
            }

            //직급/직책 [] 임원, 과장 등
            if(jobRequest["position_rank"] != null){
                var position_rank_Array = jobRequest["position_rank"] as ArrayList<*>
                var position_rank_str = position_rank_Array.joinToString(",")
                reqMap.put("position_rank_str", position_rank_str)
            }else{
                //여긴 뭐지?
                reqMap.put("position_rank_str", "position_rank_str1,position_rank_str2,position_rank_str3")
            }


            //학력 (고졸/대졸/석사 등)
            if(jobRequest["qualification"] != null){
                var qualificationMap = jobRequest["qualification"] as MutableMap<String, Any>
                var qualificationEdu_Map = qualificationMap["education"] as MutableMap<String, Any>
                var qlfct_edu_lvl = qualificationEdu_Map["level"] as String
                reqMap.put("qlfct_edu_lvl", qlfct_edu_lvl)
                var qlfct_is_expected_boolean = null_checker_for_boolean(qualificationEdu_Map["isExpectedGraduate"])
                if(qlfct_is_expected_boolean == false){
                    reqMap.put("qlfct_exp_grd", 0)
                }else{
                    reqMap.put("qlfct_exp_grd", 1)
                }
                var qualificationPre_Map = qualificationMap["preferences"] as MutableMap<String, Any>
                var qlfct_lan_arr = null_checker_for_arraylist(qualificationPre_Map["language"])
                var qlfct_lan_str = qlfct_lan_arr.joinToString(",")
                reqMap.put("qlfct_lan_str", qlfct_lan_str)
                var qlfct_lic_arr = null_checker_for_arraylist(qualificationPre_Map["license"])
                var qlfct_lic_str = qlfct_lic_arr.joinToString(",")
                reqMap.put("qlfct_lic_str", qlfct_lic_str)
                var qlfct_con_arr = null_checker_for_arraylist(qualificationPre_Map["specialCondition"])
                var qlfct_con_str = qlfct_con_arr.joinToString(",")
                reqMap.put("qlfct_con_str", qlfct_con_str)
                var qlfct_mjr_arr = null_checker_for_arraylist(qualificationPre_Map["specialMajor"])
                var qlfct_mjr_str = qlfct_mjr_arr.joinToString(",")
                reqMap.put("qlfct_mjr_str", qlfct_mjr_str)

                var use_language_boolean = boolean_return_int(qualificationPre_Map, "useLanguage")
                reqMap.put("use_lan", use_language_boolean)
                var use_licence_boolean = boolean_return_int(qualificationPre_Map, "useLicense")
                reqMap.put("use_lic", use_licence_boolean)
                var use_condition_boolean = boolean_return_int(qualificationPre_Map, "useSpecialCondition")
                reqMap.put("use_con", use_condition_boolean)
                var use_major_boolean = boolean_return_int(qualificationPre_Map, "useSpecialMajor")
                reqMap.put("use_mjr", use_major_boolean)
            }else{
                reqMap.put("qlfct_lan_str", "qlfct_lan_str")
                reqMap.put("qlfct_lic_str", "qlfct_lic_str")
                reqMap.put("qlfct_con_str", "qlfct_con_str")
                reqMap.put("qlfct_mjr_str", "qlfct_mjr_str")
                reqMap.put("use_lan", 0)
                reqMap.put("use_lic", 0)
                reqMap.put("use_con", 0)
                reqMap.put("use_mjr", 0)
            }

            //모집인원수 직접입력/프리셋
            if(jobRequest["recruitmentCount"] != null){
                var recruitmentCountMap = jobRequest["recruitmentCount"] as MutableMap<String, Any>
                var rcrtmntcnt_type = null_checker_for_string(recruitmentCountMap["type"])
                reqMap.put("rcrtmntcnt_type", rcrtmntcnt_type)
                var rcrtmntcnt_cnt = null_checker_for_double(recruitmentCountMap["count"])
                reqMap.put("rcrtmntcnt_cnt", rcrtmntcnt_cnt)
            }else{
                reqMap.put("rcrtmntcnt_type", "direct")
                reqMap.put("rcrtmntcnt_cnt", 5)
            }

            //스킬
            if(jobRequest["skills"] != null){
                var skillsArray = jobRequest["skills"] as ArrayList<*>
                var skills_str = skillsArray.joinToString(",")
                reqMap.put("skills_str", skills_str)
            }else{
                reqMap.put("skills_str", "skill1,skill2,skill3")
            }

            //약관
            if(jobRequest["terms"] != null){
                var termsMap = jobRequest["terms"] as MutableMap<String, Any>
                var terms_prsnl_inf = boolean_return_int(termsMap, "personalInfo")
                var terms_snstv_inf = boolean_return_int(termsMap, "sensitiveInfo")
                reqMap.put("terms_prsnl_inf", terms_prsnl_inf)
                reqMap.put("terms_snstv_inf", terms_snstv_inf)
            }else{
                reqMap.put("terms_prsnl_inf", 1)
                reqMap.put("terms_snstv_inf", 1)
            }

            //타이틀
            if(jobRequest["title"] != null){
                var title = jobRequest["title"] as String
                reqMap.put("title", title)
            }else{
                reqMap.put("title", "title")
            }


            //연봉/월급/시급 등
            if(jobRequest["workConditions"] != null){
                var workConditionMap = jobRequest["workConditions"] as MutableMap<String, Any>
                var wrkcndtn_lct = workConditionMap["location"] as MutableMap<String, Any>
                var wrkcndtn_lct_type = wrkcndtn_lct["type"] as String
                reqMap.put("wrkcndtn_lct_type", wrkcndtn_lct_type)

                var wrkcndtn_lct_addr = wrkcndtn_lct["address"] as String
                if(wrkcndtn_lct_addr.length == 0){
                    wrkcndtn_lct_addr = "서울시 광진구 자양동 2-2"
                }
                var wrkcndtn_lct_addr_detail = null_checker_for_string(wrkcndtn_lct["address_detail"])
                reqMap.put("wrkcndtn_lct_addr", wrkcndtn_lct_addr)
                reqMap.put("wrkcndtn_lct_addr_dtl", wrkcndtn_lct_addr_detail)
                var wrkcndtn_rmt_avl = boolean_return_int(wrkcndtn_lct, "isRemoteAvailable")
                reqMap.put("wrkcndtn_lct_rmt_avl", wrkcndtn_rmt_avl)
                var wrkcndtn_rgn = wrkcndtn_lct["region"] as ArrayList<*>
                var wrkcndtn_rgn_str = wrkcndtn_rgn.joinToString(",")
                reqMap.put("wrkcndtn_lct_rgn_str", wrkcndtn_rgn_str)
                var wrkcndtn_typ = wrkcndtn_lct["type"] as String
                reqMap.put("wrkcndtn_lct_typ", wrkcndtn_typ)

                var wrkcndtn_slr = workConditionMap["salary"] as MutableMap<String, Any>
                var wrkcndtn_slr_typ = wrkcndtn_slr["type"] as String
                reqMap.put("wrkcndtn_slr_typ", wrkcndtn_slr_typ)
                var wrkcndtn_slr_min = wrkcndtn_slr["min"] as String
                reqMap.put("wrkcndtn_slr_min", wrkcndtn_slr_min)
                var wrkcndtn_slr_max = wrkcndtn_slr["max"] as String
                reqMap.put("wrkcndtn_slr_max", wrkcndtn_slr_max)
                var wrkcndtn_slr_min_wg = boolean_return_int(wrkcndtn_slr, "isMinimumWage")
                reqMap.put("wrkcndtn_slr_min_wg", wrkcndtn_slr_min_wg)
                var wrkcndtn_slr_dc = boolean_return_int(wrkcndtn_slr, "isInterviewDecided")
                reqMap.put("wrkcndtn_slr_dc", wrkcndtn_slr_dc)

                var wrkcndtn_wrkng_dy = workConditionMap["workingDay"] as MutableMap<String, Any>
                if(wrkcndtn_wrkng_dy["customDays"] != null){
                    var wrkcndtn_wrkng_dy_cst = wrkcndtn_wrkng_dy["customDays"] as ArrayList<*>
                    var wrkcndtn_wrkng_dy_cst_str = wrkcndtn_wrkng_dy_cst.joinToString(",")
                    reqMap.put("wrkcndtn_wrkng_dy_cst_str", wrkcndtn_wrkng_dy_cst_str)
                }

                var wrkcndtn_wrkng_dy_typ = wrkcndtn_wrkng_dy["type"] as String
                reqMap.put("wrkcndtn_wrkng_dy_typ", wrkcndtn_wrkng_dy_typ)

                var wrkcndtn_hrs = workConditionMap["workingHours"] as MutableMap<String, Any>
                var wrkcndtn_hrs_isflex = boolean_return_int(wrkcndtn_hrs, "isFlexible")
                reqMap.put("wrkcndtn_hrs_isflex", wrkcndtn_hrs_isflex)
                var wrkcndtn_hrs_strt_hr = wrkcndtn_hrs["startHour"] as String
                var wrkcndtn_hrs_strt_mn = wrkcndtn_hrs["startMinute"] as String
                var wrkcndtn_hrs_end_hr = wrkcndtn_hrs["endHour"] as String
                var wrkcndtn_hrs_end_mn = wrkcndtn_hrs["endMinute"] as String

                reqMap.put("wrkcndtn_hrs_strt_hr", wrkcndtn_hrs_strt_hr)
                reqMap.put("wrkcndtn_hrs_strt_mn", wrkcndtn_hrs_strt_mn)
                reqMap.put("wrkcndtn_hrs_end_hr", wrkcndtn_hrs_end_hr)
                reqMap.put("wrkcndtn_hrs_end_mn", wrkcndtn_hrs_end_mn)
            }else{
                reqMap.put("wrkcndtn_lct_addr", "wrkcndtn_lct_addr")
                reqMap.put("wrkcndtn_lct_rmt_avl", 1)
                reqMap.put("wrkcndtn_lct_rgn_str", "wrkcndtn_rgn_str")
                reqMap.put("wrkcndtn_lct_typ", "domestic")

                reqMap.put("wrkcndtn_slr_typ", "연봉")
                reqMap.put("wrkcndtn_slr_min", "99")
                reqMap.put("wrkcndtn_slr_max", "999")
                reqMap.put("wrkcndtn_slr_min_wg", 0)
                reqMap.put("wrkcndtn_slr_dc", 0)

                reqMap.put("wrkcndtn_wrkng_dy_cst_str", "wrkcndtn_wrkng_dy_cst_str")
                reqMap.put("wrkcndtn_wrkng_dy_typ", "주5일")

                reqMap.put("wrkcndtn_hrs_isflex", 0)

                reqMap.put("wrkcndtn_hrs_strt_hr", "18")
                reqMap.put("wrkcndtn_hrs_strt_mn", "00")
                reqMap.put("wrkcndtn_hrs_end_hr", "09")
                reqMap.put("wrkcndtn_hrs_end_mn", "00")
            }

            /* 나중에 주석 풀것
                    var wrkcndtn_hrs_shfts_map = wrkcndtn_hrs["shifts[0]"] as MutableMap<String, Any>
                    var shfts_endHr_0 = wrkcndtn_hrs_shfts_map["endHour"] as String
                    var shfts_endMn_0 = wrkcndtn_hrs_shfts_map["endMinute"] as String
                    var shfts_strtHr_0 = wrkcndtn_hrs_shfts_map["startHour"] as String
                    var shfts_strtMn_0 = wrkcndtn_hrs_shfts_map["startMinute"] as String
                    reqMap.put("shfts_endHr_0", shfts_endHr_0)
                    reqMap.put("shfts_endMn_0", shfts_endMn_0)
                    reqMap.put("shfts_strtHr_0", shfts_strtHr_0)
                    reqMap.put("shfts_strtMn_0", shfts_strtMn_0)
            */
            //경력 경력 체크 경력년수 무관
            if(jobRequest["year_matter"] != null) {
                var year_matterBoolean = jobRequest["year_matter"] as Boolean
                if (year_matterBoolean == true) {
                    reqMap.put("year_matter", 1)
                } else {
                    reqMap.put("year_matter", 0)
                }
            }else{
                reqMap.put("year_matter", 1)
            }

            //reqMap.put("jobid", 0)
            reqMap.put("jobId", jobId)
            //reqMap.put("status", "채용중")
            //val insertJobCnt = jobsService.insertCorpJob(reqMap)
            val updateJobCnt = jobsService.updateCorpJob(reqMap)
            //val last_insert_job_post_idx = reqMap.get("jobid")
            val last_insert_job_post_idx = jobId

            //last_insert_job_post_idx 인덱스, 이력서 양식을 첨부한다. 첨부파일 idx로 업데이트 다시한다.
            //파일을 저장하고
            //파일 테이블에 저장한다.(타입, 날짜, 파일이름)
            //파일 인덱스를 job_post에 업데이트 한다.
            val localDateTime: LocalDateTime = LocalDateTime.now()
            val localDate: LocalDate = LocalDate.now()

            //val uuid = UUID.randomUUID().toString()
            var fileTyp = "resume_urjob_typ"
            val todaydate = localDate.toString()

            var mMap = mutableMapOf<String, Any>()
            // 이력서 파일 저장 (유어잡 양식)
            if(yourJobFiles != null){
                var uuid = fileUtils.fileSave(rootpath = save_path, type = fileTyp, yeardate = todaydate, file = yourJobFiles)
                val fileNm = yourJobFiles.originalFilename ?: "unnamed"
                val fileExt = fileNm.substring(fileNm.lastIndexOf("."))

                // 이미지 URL 생성
                val imageUrl = fileUtils.getFileUrl(save_path, fileTyp, todaydate, uuid, fileNm)

                mMap.put("fileidx", 0)
                mMap.put("user_id", user_id)
                mMap.put("con_id", last_insert_job_post_idx.toString().toInt())
                mMap.put("type", fileTyp)
                mMap.put("year_date", todaydate)
                mMap.put("file_name", uuid + "_" + fileNm)
                mMap.put("file_ext", fileExt)
                mMap.put("file_path_s3", imageUrl)
                var insertCnt = fileUtilService.insertJobResumeFileData(mMap)
                var yourjobfileidx = mMap.get("fileidx")

                mMap.clear()
                mMap.put("jobid", last_insert_job_post_idx.toString().toInt())
                mMap.put("yourjobfileidx", yourjobfileidx.toString().toInt())
                //jobsService.updateJobInfo()
                jobsService.updateResumeYourJobFileIdx(mMap)
            }


            //이력서 파일 저장(자사 양식)
            fileTyp = "resume_company_typ"

            if(companyFormatFiles != null){
                var uuid = fileUtils.fileSave(rootpath = save_path, type = fileTyp, yeardate = todaydate, file = companyFormatFiles)
                val fileNm2 = companyFormatFiles.originalFilename ?: "unnamed"
                val fileExt2 = fileNm2.substring(fileNm2.lastIndexOf("."))

                // 이미지 URL 생성
                val imageUrl2 = fileUtils.getFileUrl(save_path, fileTyp, todaydate, uuid, fileNm2)

                //파일 정보 테이블에 저장 (채용공고 번호, 타입, 날짜, 파일명, 파일확장자)
                mMap.clear()
                mMap.put("fileidx", 0)
                mMap.put("user_id", user_id)
                mMap.put("con_id", last_insert_job_post_idx.toString().toInt())
                mMap.put("type", fileTyp)
                mMap.put("year_date", todaydate)
                mMap.put("file_name", uuid + "_" + fileNm2)
                mMap.put("file_ext", fileExt2)
                mMap.put("file_path_s3", imageUrl2)
                var insertCnt = fileUtilService.insertJobResumeFileData(mMap)
                var companyfileidx = mMap.get("fileidx")

                mMap.clear()
                mMap.put("jobid", last_insert_job_post_idx.toString().toInt())
                mMap.put("companyfileidx", companyfileidx.toString().toInt())
                //jobsService.updateJobInfo()
                jobsService.updateResumeCompanyFileIdx(mMap)
            }

            //파일 테이블 idx 가져와서 기존 채용공고 테이블에 첨부파일 인덱스를 업데이트 ?

            if(emp_types_array.size > 0){
                var insertCnt = jobsService.deleteEmpJobType(jobId)
            }
            for(jobType_el in emp_types_array){
                var jobTypeMap = mutableMapOf<String, Any>()
                jobTypeMap.put("jobid", last_insert_job_post_idx.toString().toInt())
                jobTypeMap.put("jobtype", jobType_el)
                //insertJobType
                var insertCnt = jobsService.insertEmpJobType(jobTypeMap)
                insertCnt = 1
            }
            if(jobType_array.size > 0){
                var insertCnt = jobsService.deleteJobType(jobId)
            }
            for(jobType_el in jobType_array){
                var jobTypeMap = mutableMapOf<String, Any>()
                jobTypeMap.put("jobid", last_insert_job_post_idx.toString().toInt())
                jobTypeMap.put("jobtype", jobType_el)
                //insertJobType
                var insertCnt = jobsService.insertJobType(jobTypeMap)
                insertCnt = 1
            }
            //reqMap.put("status", "채용중")

            return ResponseEntity(HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.NOT_FOUND)
        }

    }
    @PatchMapping("/corpmem/posts/{jobId}/close")
    fun api_v1_auth_posts_status_change(
        @PathVariable jobId: Int,
        session: HttpSession
    ): ResponseEntity<Any>{
        try{
            var rrr = 0
            var mMap = mutableMapOf<String, Any>()
            mMap.put("jobId", jobId)
            mMap.put("status", "close")
            jobsService.updateJobStatus(mMap)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.OK)
        }
        return ResponseEntity(HttpStatus.OK)
    }

    @DeleteMapping("/corpmem/posts/{jobId}")
    fun api_vi_auth_posts_del(
        @PathVariable jobId: Int,
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

    @PostMapping("/corpmem/email/verification")
    fun sendVerificationCode(@RequestBody request: Map<String, String>, session: HttpSession): ResponseEntity<Map<String, String>> {
        val email = request["email"] ?: return ResponseEntity(HttpStatus.BAD_REQUEST)

        try {
            authService.generateVerificationCode(email, session)
            return ResponseEntity(mapOf("message" to "Verification code sent"), HttpStatus.OK)
        } catch (e: Exception) {
            return ResponseEntity(mapOf("error" to e.message.toString()), HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @PostMapping("/corpmem/email/verify")
    fun verifyCode(@RequestBody request: Map<String, String>, session: HttpSession): ResponseEntity<Map<String, Any>> {
        val email = request["email"] ?: return ResponseEntity(HttpStatus.BAD_REQUEST)
        val code = request["code"] ?: return ResponseEntity(HttpStatus.BAD_REQUEST)

        val isValid = authService.verifyCode(email, code, session)

        if (isValid) {
            return ResponseEntity(mapOf("verified" to true), HttpStatus.OK)
        }

        return ResponseEntity(mapOf("verified" to false), HttpStatus.BAD_REQUEST)
    }

    var method_name_array = arrayOf("유어잡 지원(즉시지원)", "홈페이지", "우편", "방문", "e-메일", "fax")
    var company_type_array = arrayOf("large_company", "medium_company", "public_company", "foreign_company", "mid_sized_company", "non_profit", "startup", "financial", "hospital", "student_org", "other")
    fun null_checker_for_string(s: Any?): String{
        if(s == null){
            return ""
        }else{
            return s.toString()
        }
    }
    fun null_checker_for_int(s: Any?): Int {
        if (s == null) {
            return 0
        } else {
            return when (s) {
                is Int -> s
                is Double -> s.toInt()
                else -> s.toString().toInt()
            }
        }
    }
    fun null_checker_for_double(s: Any?): Double{
        if(s == null){
            return 0.0
        }else{
            return s as Double
        }
    }
    fun null_checker_for_int_double(s: Any?): Int{
        if(s == null){
            return 0
        }else{
            val tyNm = getTypeName(s)
            if(tyNm == "double_type"){
                s as Double
                return s.toInt()
            }else{
                return s.toString().toInt()
            }

        }
    }
    fun null_checker_for_boolean(s: Any?): Boolean{
        if(s == null){
            return false
        }else{
            return s as Boolean
        }
    }
    fun null_checker_for_arraylist(s: Any?): ArrayList<*>{
        if(s == null){
            val arrayList : ArrayList<Any> = arrayListOf<Any>()
            return arrayList
        }else{
            return s as ArrayList<Any>
        }
    }
    fun boolean_return_int(mMap: MutableMap<String, Any>, keystr: String): Int{
        var val_boolean = mMap.get(keystr) as Boolean
        if(val_boolean == true){
            return 1
        }else{
            return 0
        }
    }
    fun getOffSetNumb(page: Int, size: Int):Int{
        return (page - 1) * size
    }
    fun intToBoolean(s: Any?): Boolean{
        if(s == null || s == 0){
            return false
        }else{
            return true
        }
    }
    //changeStrToArray(job_info.jobType)
    fun changeStrToArray(s: Any?): ArrayList<Any>{
        var jobTypeStr = s as String
        var jobTypeArrayList = ArrayList<Any>()
        var jobTypeArrayList_tmp = jobTypeStr?.split(",")
        if (jobTypeArrayList_tmp != null) {
            if (jobTypeStr != null && jobTypeArrayList_tmp.size > 0) {
                //jobTypeArrayList = jobTypeArrayList_tmp as ArrayList<Any>
                for(el in jobTypeArrayList_tmp){
                    jobTypeArrayList.add(el)
                }
            }else if(jobTypeStr != null && jobTypeStr.length > 0){
                jobTypeArrayList.add(jobTypeStr)
            }
        }
        return jobTypeArrayList
    }
    fun getTypeName(obj: Any):String{
        if(obj == null){
            return ""
        }
        if(obj is Int)(
            return "int_type"
        )else if(obj is String){
            return "string_type"
        }else if(obj is Double){
            return "double_type"
        }else if(obj is Boolean){
            return "boolean_type"
        }else{
            return "another_type"
        }
    }
}