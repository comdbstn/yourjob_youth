package com.yourjob.backend.controller

import com.yourjob.backend.entity.UsersProfile
import com.yourjob.backend.service.AuthService
import com.yourjob.backend.service.FileUtilService
import com.yourjob.backend.util.FileUtils
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpSession
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDate
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/v1/users")
class UsersController (private var authService: AuthService, private var fileUtilService: FileUtilService, private var fileUtils: FileUtils){

    @Value("\${servlet.multipart.location}")
    lateinit var save_path: String

    //properties:
    //  values:
    //    domain: http://13.125.187.22
    @Value("\${properties.values.domain}")
    lateinit var properties_values_domain: String

    @GetMapping("/profile")
    fun api_v1_users_profile_view(request: HttpServletRequest, session: HttpSession): ResponseEntity<Any>{
        var userId = session.getAttribute("userId")

        val qryStr = request.queryString
        if(userId == null && qryStr == null){
            //return ResponseEntity(HttpStatus.UNAUTHORIZED)
            return ResponseEntity(HttpStatus.NOT_FOUND)
        }
        if(userId == null && qryStr != null){
            //return ResponseEntity(HttpStatus.UNAUTHORIZED)
            return ResponseEntity(HttpStatus.NOT_FOUND)
        }
        var userinfo = authService.getUserInfoByUserId(userId.toString().toInt())
        var visaStr = userinfo.get("visa")
        if(visaStr != null){
            var visaArrayList = changeStrToArray(visaStr)
            var visaArr = ArrayList<String>()
            visaArr.add("D-2")
            visaArr.add("D-10")
            userinfo.put("visa", visaArrayList)
        }

        var profileImgIdx = userinfo.get("profileImgIdx")
        var fMap = mutableMapOf<String, Any>()
        if(profileImgIdx != null){
            fMap.put("fileidx", profileImgIdx.toString().toInt())
            var attached_file_inform = fileUtilService.getFileDataByIdx(fMap)
            var apo_file_name = attached_file_inform.get("file_name").toString()
            var apo_download_url = null_checker_for_string(attached_file_inform.get("file_path_s3"))
            userinfo.put("picturePath", apo_download_url)
        }

        //userinfo.put("profileImage", "http://localhost:8082/api/v1/image/show/" + profileImgIdx)
        var profileImgUrl = userinfo.get("profileImage")

        if(userinfo.get("email") == null) {
            userinfo.put("email", "")
        }
        if(userinfo.get("address") == null) {
            userinfo.put("address", "")
        }

        if (profileImgUrl != null) {
            userinfo.put("profileImage", profileImgUrl)

        }
        return ResponseEntity(userinfo, HttpStatus.OK)
    }
    @PostMapping("/profile/image")
    fun api_v1_users_profile_image_change(session: HttpSession, @RequestParam file: MultipartFile): ResponseEntity<Any>{
        var user_id = session.getAttribute("userId")
        if(user_id == null){
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        var last_insert_resume_idx = 0
        //이력서 이미지와 아포스티 파일 저장
        //last_insert_resume_idx
        val localDateTime: LocalDateTime = LocalDateTime.now()
        val localDate: LocalDate = LocalDate.now()
        val fileTyp = "users_profile_img"
        val todaydate = localDate.toString()

        //이력서 본인 이미지 저장
        /*System.out.println("본인 이미지 저장 step 1")
        System.out.println("fileNm : " + fileNm)
        System.out.println("save_path : " + save_path)
        System.out.println("properties_values_domain : " + properties_values_domain)*/
        //properties_values_domain


        // 파일 저장 및 UUID 얻기
        val tempPath = "uploads"
        val uuid = fileUtils.fileSave(rootpath = tempPath, type = fileTyp, yeardate = todaydate, file = file)
        //System.out.println("본인 이미지 저장 step 2")

        val fileNm = file.originalFilename ?: "unnamed"
        val fileExt = fileNm.substring(fileNm.lastIndexOf("."))

        // 파일 URL 생성
        val imageUrl = fileUtils.getFileUrl(tempPath, fileTyp, todaydate, uuid, fileNm)


        //System.out.println("본인 이미지 저장 step 2")
        var mMap = mutableMapOf<String, Any>()
        mMap.put("fileidx", 0)
        mMap.put("user_id", user_id)
        mMap.put("con_id", last_insert_resume_idx.toString().toInt())
        mMap.put("type", fileTyp)
        mMap.put("year_date", todaydate)
        mMap.put("file_name", uuid + "_" + fileNm)
        mMap.put("file_ext", fileExt)
        mMap.put("file_path_s3", imageUrl)
        var insertCnt = fileUtilService.insertJobResumeFileData(mMap)
        //System.out.println("본인 이미지 저장 step 3")
        //저장한 파일 idx 를 저장한 이력서 row 에 업데이트 함
        //profile_img_idx
        var mMap2 = mutableMapOf<String, Any>()
        mMap2.put("userId", user_id)
        //mMap2.put("profileImgIdx", mMap.get("fileidx").toString().toInt())
        mMap2.put("profileImage", imageUrl)

        var nMap3= mutableMapOf<String, Any>()
        nMap3.put("profileImage", imageUrl)
        var updateCnt = authService.updateUsersProfileImg(mMap2)

        return ResponseEntity(nMap3, HttpStatus.OK)
    }
    @PutMapping("/profile")
    fun api_v1_users_profile_update(session: HttpSession, @RequestBody usersProfile: UsersProfile): ResponseEntity<Any>{
        var userId = session.getAttribute("userId")
        if(userId == null){
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }

        // visa 배열에서 빈 문자열과 null 제거
        val filteredVisa = usersProfile.visa?.filterNot {
            it.isNullOrBlank()
        }?.takeIf { it.isNotEmpty() }

        usersProfile.visaStr = filteredVisa?.joinToString(",")

        // address null 체크 및 변환
        usersProfile.address = usersProfile.address ?: ""

        // address_detail null 체크 및 변환
        usersProfile.address_detail = usersProfile.address_detail ?: ""

        // 다른 문자열 필드들도 null일 경우
        usersProfile.name = usersProfile.name ?: ""
        usersProfile.englishName = usersProfile.englishName ?: ""
        usersProfile.birth = usersProfile.birth ?: ""
        usersProfile.nationality = usersProfile.nationality ?: ""
        usersProfile.email = usersProfile.email ?: ""
        usersProfile.phone = usersProfile.phone ?: ""
        usersProfile.gender = usersProfile.gender ?: "male"

        var userinfo = authService.updateUsersProfile(usersProfile)
        return ResponseEntity(userinfo, HttpStatus.OK)
    }
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
    fun null_checker_for_string(s: Any?): String{
        if(s == null){
            return ""
        }else{
            return s as String
        }
    }
}