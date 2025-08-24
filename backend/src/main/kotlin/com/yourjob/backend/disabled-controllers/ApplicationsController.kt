package com.yourjob.backend.controller

import com.yourjob.backend.entity.*
import com.yourjob.backend.service.ApplicationService
import com.yourjob.backend.service.FileUtilService
import com.yourjob.backend.service.ResumeService
import com.yourjob.backend.util.FileUtils
import jakarta.servlet.http.HttpSession
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.io.IOException
import java.time.LocalDate
import java.time.LocalDateTime


@RestController
@RequestMapping("/api/v1")
class ApplicationsController(private var applicationService: ApplicationService,
                             private var resumeService: ResumeService,
                             private var fileUtilService: FileUtilService,
                             private var fileUtils: FileUtils) {

    //@Value("\${servlet.multipart.location}")
    //lateinit var save_path: String
    val save_path = "uploads"

    @PostMapping("/applications")
    //fun api_v1_application_insert(@RequestParam applicationRequest: ApplicationRequest, session: HttpSession): ResponseEntity<ApplicationRequest?> {
    fun api_v1_application_insert(@RequestParam jobId:Int,
                                  @RequestParam jobType:Int,
                                  @RequestParam resumeId:Int,
                                  @RequestParam ("attachments[0].title") title0 : String?,
                                  @RequestParam ("attachments[0].file") file0 : MultipartFile?,
                                  @RequestParam ("attachments[1].title") title1 : String?,
                                  @RequestParam ("attachments[1].file") file1 : MultipartFile?,
                                  @RequestParam ("attachments[2].title") title2 : String?,
                                  @RequestParam ("attachments[2].file") file2 : MultipartFile?,
                                  session: HttpSession): ResponseEntity<ApplicationRequest?> {
        try{
            var user_id = session.getAttribute("userId")
            if (user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            var applicationRequest = ApplicationRequest()
            applicationRequest.jobId = jobId
            applicationRequest.jobseekerId = user_id.toString().toInt()
            applicationRequest.resumeId = resumeId
            applicationRequest.status = "UNREAD"
            var cnt = applicationService.selectCntMyApply(applicationRequest)
            if (cnt > 0){
                return ResponseEntity(HttpStatus.CONFLICT) //409 이미 지원함
            }
            var insertCnt = applicationService.insertApplication(applicationRequest)
            val last_insert_job_post_idx = applicationRequest.applicationId

            var files = ArrayList<MultipartFile>()
            if (file0 != null) {
                files.add(file0)
            }
            if (file1 != null) {
                files.add(file1)
            }
            if (file2 != null) {
                files.add(file2)
            }

            //이력서 이미지와 아포스티 파일 저장
            //last_insert_resume_idx
            val localDateTime: LocalDateTime = LocalDateTime.now()
            //val localDate: LocalDate = LocalDate.now()

            //val uuid = UUID.randomUUID().toString()
            //val fileNm = profileImage.originalFilename
            //val fileExt = fileNm.substring(fileNm.lastIndexOf("."))
            //var fileTyp = "resume_profile_img"
            //val todaydate = localDate.toString()

            //이력서 이미지와 아포스티 파일 저장
            val localDate: LocalDate = LocalDate.now()
            var fileTyp = "instant_application_files"
            val todaydate = localDate.toString()

            //이력서 아포스티 저장
            var apostille_idx_str = ""
            for(apostilleFile in files){
                // 파일 저장 및 UUID 얻기
                val uuid = fileUtils.fileSave(rootpath = save_path, type = fileTyp, yeardate = todaydate, file = apostilleFile)
                val fileNm = apostilleFile.originalFilename ?: "unnamed"
                val fileExt = fileNm.substring(fileNm.lastIndexOf("."))

                // 파일 URL 생성
                val fileUrl = fileUtils.getFileUrl(save_path, fileTyp, todaydate, uuid, fileNm)

                //파일 정보 테이블에 저장 (채용공고 번호, 타입, 날짜, 파일명, 파일확장자)
                val mMap = mutableMapOf<String, Any>()
                mMap.put("fileidx", 0)
                mMap.put("user_id", user_id)
                mMap.put("con_id", last_insert_job_post_idx.toString().toInt())
                mMap.put("type", fileTyp)
                mMap.put("year_date", todaydate)
                mMap.put("file_name", uuid + "_" + fileNm)
                mMap.put("file_ext", fileExt)
                mMap.put("file_path_s3", fileUrl)
                var insertCnt = fileUtilService.insertJobResumeFileData(mMap)
                if(apostille_idx_str.length == 0){
                    apostille_idx_str = mMap.get("fileidx").toString()
                }else{
                    apostille_idx_str = apostille_idx_str + "," + mMap.get("fileidx").toString()
                }
            }

            var mMap2 = mutableMapOf<String, Any>()
            mMap2.put("attach_files_idx", apostille_idx_str)
            mMap2.put("applicationId", last_insert_job_post_idx.toString().toInt())
            //resumeService.updateResumeApostiImgIdx(mMap2)
            //applicationService.updateApplyStatus(mMap2)
            applicationService.updateApplyAttchFilesIdx(mMap2)

            //file.originalFilename
            //applicationRequest.jobId = 27
            //applicationRequest.jobseekerId = user_id.toString().toInt()
            //applicationRequest.status = "UNREAD"
            //var cnt = applicationService.selectCntMyApply(applicationRequest)
            //if (cnt > 0){
            //    return ResponseEntity(HttpStatus.CONFLICT) //409 이미 지원함
            //}
            //var insertCnt = applicationService.insertApplication(applicationRequest)
            return ResponseEntity(HttpStatus.CREATED)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @GetMapping("/my_applications")
    fun api_v1_my_application_list(session: HttpSession, @RequestParam page: Int?, @RequestParam size: Int?): ResponseEntity<List<ApplicationResponse?>> {
        try{
            var user_id = session.getAttribute("userId")
            if (user_id == null){
                //user_id = 1
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            var pMap = mutableMapOf<String, Any>()
            pMap.put("userid", user_id)
            pMap.put("page", page.toString().toInt())
            pMap.put("size", size.toString().toInt())
            var myApplyList = applicationService.selectListMyApply(pMap)
            //myApplyList = myApplyList!!.toTypedArray()
            var myApplyList_arr = myApplyList?.toTypedArray()
            return ResponseEntity(myApplyList, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @GetMapping("/applications")
    fun api_v1_application_list(applicationRequest: ApplicationRequest, session: HttpSession, @RequestParam page: Int?, @RequestParam size: Int?): ResponseEntity<List<ApplicationResponse?>> {
        try{
            var user_id = session.getAttribute("userId")
            if (user_id == null){
                //user_id = 1
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            var pMap = mutableMapOf<String, Any>()
            pMap.put("userid", user_id)
            pMap.put("page", page.toString().toInt())
            pMap.put("size", size.toString().toInt())
            var applyList = applicationService.selectListMyApply(pMap)
            if (applyList != null) {
                for(apply in applyList){
                    if (apply != null) {
                        apply.applierInfo?.career = "[kt p&m] 산업안전보건 기획"
                        apply.applierInfo?.education = "대학교졸업 (4년)"
                        apply.applierInfo?.major = "환경보건"
                        apply.applierInfo?.majorScore = "3.45"
                        apply.applierInfo?.applicantDay = "2025-03-11"
                    }
                }
            }

            var applyList_arr = applyList?.toTypedArray()
            return ResponseEntity(applyList, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @GetMapping("/applies")
    fun api_v1_applies_list(applicationRequest: ApplicationRequest, session: HttpSession, @RequestParam page: Int, @RequestParam size: Int): ResponseEntity<Any> {
        try{
            var user_id = session.getAttribute("userId")
            if (user_id == null){
                //user_id = 1
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            //test user_id = 30
            var req_page = page
            var req_size = 2
            var offSetNumb = getOffSetNumb(req_page, req_size)
            var pMap = mutableMapOf<String, Any>()
            pMap.put("userid", user_id)
            pMap.put("offSetNumb", offSetNumb)
            pMap.put("page", page.toString().toInt())
            pMap.put("size", req_size.toString().toInt())
            var applyList = applicationService.selectListMyApply(pMap)
            if (applyList != null) {
                for(apply in applyList){
                    if (apply != null) {
                        apply.applierInfo?.career = "[kt p&m] 산업안전보건 기획"
                        apply.applierInfo?.education = "대학교졸업 (4년)"
                        apply.applierInfo?.major = "환경보건"
                        apply.applierInfo?.majorScore = "3.45"
                        apply.applierInfo?.applicantDay = "2025-03-11"

                        var attachlist = ArrayList<Any>()
                        if(apply.attach_files_idx != null){
                            var attach_idx_str = apply.attach_files_idx as String
                            var attach_idx_arr = attach_idx_str.split(",")
                            for(attach_idx in attach_idx_arr){
                                var mMap = mutableMapOf<String, Any>()
                                mMap.put("fileidx", attach_idx)
                                var attached_file_inform = fileUtilService.getFileDataByIdx(mMap)
                                if(attached_file_inform != null){
                                    var file_attach_id = attached_file_inform.get("file_attach_id")
                                    var file_type = attached_file_inform.get("type")
                                    var file_year_date = attached_file_inform.get("year_date")
                                    var file_file_name = attached_file_inform.get("file_name") as String
                                    var apo_download_url = null_checker_for_string(attached_file_inform.get("file_path_s3"))
                                    var file_name = file_file_name.split("_")[1]
                                    var fMap = mutableMapOf<String, Any>()
                                    fMap.put("filename", file_name)
                                    //var apo_download_url = "http://localhost:8082/api/v1/image/download/" + file_attach_id.toString()
                                    fMap.put("fileurl", apo_download_url)
                                    fMap.put("filePath", apo_download_url)
                                    attachlist.add(fMap)
                                }
                            }
                        }
                        apply.attachments = attachlist
                    }
                }
            }

            //var applyList_arr = applyList?.toTypedArray()
            //return ResponseEntity(applyList, HttpStatus.OK)
            var resp_mMap = mutableMapOf<String, Any>()
            //var page = 1
            var size = req_size
            var applyListCnt = applicationService.selectListMyApplyCnt(user_id.toString().toInt())
            var totalPages = applyListCnt/size
            if(applyListCnt%size > 0){
                totalPages = totalPages + 1
            }

            resp_mMap.put("totalPages", totalPages)
            if (applyList != null) {
                resp_mMap.put("content", applyList.toTypedArray())
            }
            resp_mMap.put("totalElements", applyListCnt)
            return ResponseEntity(resp_mMap, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
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
}