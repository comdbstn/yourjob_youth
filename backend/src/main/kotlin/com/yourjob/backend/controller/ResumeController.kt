package com.yourjob.backend.controller

import com.google.gson.Gson
import com.yourjob.backend.entity.JobResponse
import com.yourjob.backend.entity.ResumeRequest
import com.yourjob.backend.entity.ResumeResponse
import com.yourjob.backend.entity.ResumeVisibilityRequest
import com.yourjob.backend.service.*
import com.yourjob.backend.util.FileUtils
import jakarta.servlet.http.HttpSession
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.io.IOException
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*
import kotlin.collections.ArrayList

@RestController
@RequestMapping("/api/v1")
class ResumeController (
    private var authService: AuthService,
    private var resumeService: ResumeService,
    private var joboffersService: JoboffersService,
    private var corpmemService: CorpmemService,
    private var fileUtilService:FileUtilService,
    private var fileUtils: FileUtils){

    var save_path: String = "uploads/resumes"

    @PostMapping("/resumes")
    //fun api_v1_resume_insert(@RequestBody resumeRequest: ResumeRequest, session: HttpSession): ResponseEntity<ResumeRequest?>{
    fun api_v1_resume_insert(@RequestParam resumeData: String, session: HttpSession, @RequestParam profileImage: MultipartFile, @RequestParam apostilleFiles: ArrayList<MultipartFile>?): ResponseEntity<ResumeRequest?>{
        try{
            var user_id = session.getAttribute("userId")
            if(user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            val gson = Gson()
            var resumeRequestData: Map<String, Any> = HashMap()
            resumeRequestData = Gson().fromJson(resumeData, resumeRequestData.javaClass)

            // 이력서 이미지와 아포스티 파일 저장
            val localDate: LocalDate = LocalDate.now()
            var fileTyp = "resume_profile_img"
            val todaydate = localDate.toString()

            // 이력서 본인 이미지 저장
            val uuid = fileUtils.fileSave(rootpath = save_path, type = fileTyp, yeardate = todaydate, file = profileImage)
            val fileNm = profileImage.originalFilename ?: "unnamed"
            val fileExt = fileNm.substring(fileNm.lastIndexOf("."))

            // 이미지 URL 생성
            val imageUrl = fileUtils.getFileUrl(save_path, fileTyp, todaydate, uuid, fileNm)

            var resumeRequest = ResumeRequest()
            resumeRequest.jobSeekerId = user_id as Int?
            /*var title = resumeRequest.title as String
            var address = resumeRequest.address as String
            var birth = resumeRequest.birth as String
            var careerType = resumeRequest.careerType as String
            var email = resumeRequest.email as String
            var englishName = resumeRequest.englishName as String
            var gender = resumeRequest.gender as String
            var name = resumeRequest.name as String
            var nationality = resumeRequest.nationality as String
            var phone = resumeRequest.phone as String
            var picturePath = resumeRequest.picturePath as String
            var spellingText = null_checker_for_string(resumeRequest.spellingText)*/
            //var visa = resumeRequest.visa as java.util.ArrayList<String>
            var title = resumeRequestData["title"] as String
            resumeRequest.title = title
            var address = null_checker_for_string(resumeRequestData["address"])
            resumeRequest.address = address

            var birth = ""
            if (resumeRequestData["birth"] != null){
                birth = resumeRequestData["birth"] as String
            }
            resumeRequest.birth = birth

            var careerType = resumeRequestData["careerType"] as String
            resumeRequest.careerType = careerType
            var email = null_checker_for_string(resumeRequestData["email"])
            resumeRequest.email = email
            var englishName = null_checker_for_string(resumeRequestData["englishName"])
            resumeRequest.englishName = englishName
            var gender = null_checker_for_string(resumeRequestData["gender"])
            resumeRequest.gender = gender
            var name = null_checker_for_string(resumeRequestData["name"])
            resumeRequest.name = name
            var nationality = null_checker_for_string(resumeRequestData["nationality"])
            resumeRequest.nationality = nationality
            var phone = null_checker_for_string(resumeRequestData["phone"])
            resumeRequest.phone = phone
            //var picturePath = resumeRequestData["picturePath"] as String
            resumeRequest.picturePath = imageUrl
            var spellingText = null_checker_for_string(resumeRequestData["spellingText"])
            resumeRequest.spellingText = spellingText

            var visaStr = ""
            if (resumeRequestData["visa"] != null){
                var visa = resumeRequestData["visa"] as java.util.ArrayList<String>
                visaStr = visa.joinToString(",")
            }
            resumeRequest.visa = visaStr

            resumeService.insertResume(resumeRequest)

            val last_insert_resume_idx = resumeRequest.resumeId

            //var activitiesArrayList = resumeRequest.activities as ArrayList<Any>
            var activitiesArrayList = resumeRequestData["activities"] as ArrayList<Any>
            for(activitiesMap in activitiesArrayList){
                activitiesMap as MutableMap<String, Any>
                var activityType = activitiesMap["activityType"] as String
                var description = activitiesMap["description"] as String
                var organizationName = activitiesMap["organizationName"] as String
                var startDate = activitiesMap["startDate"] as String
                var endDate = activitiesMap["endDate"] as String
                var activitiesInsertMap = mutableMapOf<String, Any>()
                activitiesInsertMap.put("resume_id", resumeRequest.resumeId.toString().toInt())
                activitiesInsertMap.put("activityType", activityType)
                activitiesInsertMap.put("description", description)
                activitiesInsertMap.put("organizationName", organizationName)
                activitiesInsertMap.put("startDate", startDate)
                activitiesInsertMap.put("endDate", endDate)
                var inserCnt = resumeService.insertResumeActivities(activitiesInsertMap)
                var insertCnt = inserCnt
            }

            //var awardsArrayList = resumeRequest.awards as ArrayList<Any>
            var awardsArrayList = resumeRequestData["awards"] as ArrayList<Any>
            for(awardsMap in awardsArrayList){
                awardsMap as MutableMap<String, Any>
                var awardName = awardsMap["awardName"] as String
                var awardYear = awardsMap["awardYear"] as String
                var awardingOrganization = awardsMap["awardingOrganization"] as String
                var description = awardsMap["description"] as String
                var awardsInsertMap = mutableMapOf<String, Any>()
                awardsInsertMap.put("resume_id", resumeRequest.resumeId.toString().toInt())
                awardsInsertMap.put("awardName", awardName)
                awardsInsertMap.put("awardYear", awardYear)
                awardsInsertMap.put("awardingOrganization", awardingOrganization)
                awardsInsertMap.put("description", description)
                var insertCnt = resumeService.insertResumeAwards(awardsInsertMap)
                var inserCnt = insertCnt
            }

            //var careersArrayList = resumeRequest.careers as ArrayList<Any>
            var careersArrayList = resumeRequestData["careers"] as ArrayList<Any>
            for(careersMap in careersArrayList){
                careersMap as MutableMap<String, Any>
                var companyName = careersMap["companyName"] as String
                var endDate = careersMap["endDate"] as String
                var isCurrent_boolean = careersMap["isCurrent"] as Boolean
                var isCurrent = booleanToInt(isCurrent_boolean)

                var jobTitle = careersMap["jobTitle"] as String
                var position = careersMap["position"] as String
                var responsibilities = careersMap["responsibilities"] as String
                var startDate = careersMap["startDate"] as String
                var careersInsertMap = mutableMapOf<String, Any>()
                careersInsertMap.put("resume_id", resumeRequest.resumeId.toString().toInt())
                careersInsertMap.put("companyName", companyName)
                careersInsertMap.put("endDate", endDate)
                careersInsertMap.put("isCurrent", isCurrent)
                careersInsertMap.put("jobTitle", jobTitle)
                careersInsertMap.put("position", position)
                careersInsertMap.put("responsibilities", responsibilities)
                careersInsertMap.put("startDate", startDate)
                var insertCnt = resumeService.insertResumeCareers(careersInsertMap)
                var inserCnt = insertCnt
            }

            //var certificationsArrayList = resumeRequest.certifications as ArrayList<Any>
            var certificationsArrayList = resumeRequestData["certifications"] as ArrayList<Any>
            for(certifications in certificationsArrayList){
                certifications as MutableMap<String, Any>
                var acquisitionDate = certifications["acquisitionDate"] as String
                var certificationName = certifications["certificationName"] as String
                var issuingOrganization = certifications["issuingOrganization"] as String
                var certificationsInsertMap = mutableMapOf<String, Any>()
                certificationsInsertMap.put("resume_id", resumeRequest.resumeId.toString().toInt())
                certificationsInsertMap.put("acquisitionDate", acquisitionDate)
                certificationsInsertMap.put("certificationName", certificationName)
                certificationsInsertMap.put("issuingOrganization", issuingOrganization)
                var insertCnt = resumeService.insertResumeCerts(certificationsInsertMap)
                var inserCnt = insertCnt
            }

            //var educationsArrayList = resumeRequest.educations as ArrayList<Any>
            var educationsArrayList = resumeRequestData["educations"] as ArrayList<Any>
            for(educations in educationsArrayList){
                educations as MutableMap<String, Any>
                var additionalMajor = educations["additionalMajor"] as String
                var additionalMajorType = educations["additionalMajorType"] as String
                var admissionDate = educations["admissionDate"] as String
                var department = educations["department"] as String
                var gpa = educations["gpa"] as String
                var graduationDate = educations["graduationDate"] as String
                var graduationStatus = educations["graduationStatus"] as String
                var lastSchool = educations["lastSchool"] as String
                var region = educations["region"] as String
                var schoolName = educations["schoolName"] as String
                var totalCredits = educations["totalCredits"] as String
                var transferStatus_boolean = educations["transferStatus"] as Boolean
                var transferStatus = booleanToInt(transferStatus_boolean)

                var educationsInsertMap = mutableMapOf<String, Any>()
                educationsInsertMap.put("resume_id", resumeRequest.resumeId.toString().toInt())
                educationsInsertMap.put("additionalMajor", additionalMajor)
                educationsInsertMap.put("additionalMajorType", additionalMajorType)
                educationsInsertMap.put("admissionDate", admissionDate)
                educationsInsertMap.put("department", department)
                educationsInsertMap.put("gpa", gpa)
                educationsInsertMap.put("graduationDate", graduationDate)
                educationsInsertMap.put("graduationStatus", graduationStatus)
                educationsInsertMap.put("lastSchool", lastSchool)
                educationsInsertMap.put("region", region)
                educationsInsertMap.put("schoolName", schoolName)
                educationsInsertMap.put("totalCredits", totalCredits)
                educationsInsertMap.put("transferStatus", transferStatus)
                var insertCnt = resumeService.insertResumeEdus(educationsInsertMap)
                var inserCnt = insertCnt
            }

            //var employmentPreferencesMap = resumeRequest.employmentPreferences as MutableMap<String, Any>
            var employmentPreferencesMap = resumeRequestData["employmentPreferences"] as MutableMap<String, Any>
            var disabledGrade = employmentPreferencesMap["disabledGrade"] as String
            var hasMilitaryService_boolean = employmentPreferencesMap["hasMilitaryService"] as Boolean
            var hasMilitaryService = booleanToInt(hasMilitaryService_boolean)
            var isDisabled_boolean = employmentPreferencesMap["isDisabled"] as Boolean
            var isDisabled = booleanToInt(isDisabled_boolean)
            var isEmploymentProtected_boolean = employmentPreferencesMap["isEmploymentProtected"] as Boolean
            var isEmploymentProtected = booleanToInt(isEmploymentProtected_boolean)
            var isEmploymentSupport_boolean = employmentPreferencesMap["isEmploymentSupport"] as Boolean
            var isEmploymentSupport = booleanToInt(isEmploymentSupport_boolean)
            var isVeteran_boolean = employmentPreferencesMap["isVeteran"] as Boolean
            var isVeteran = booleanToInt(isVeteran_boolean)
            var militaryServiceClass = employmentPreferencesMap["militaryServiceClass"] as String
            var militaryServiceJoinDate = employmentPreferencesMap["militaryServiceJoinDate"] as String
            var militaryServiceOutDate = employmentPreferencesMap["militaryServiceOutDate"] as String
            var militaryServiceStatus = employmentPreferencesMap["militaryServiceStatus"] as String

            var employmentPreferencesInsertMap = mutableMapOf<String, Any>()
            employmentPreferencesInsertMap.put("resume_id", resumeRequest.resumeId.toString().toInt())
            employmentPreferencesInsertMap.put("disabledGrade", disabledGrade)
            employmentPreferencesInsertMap.put("hasMilitaryService", hasMilitaryService)
            employmentPreferencesInsertMap.put("isDisabled", isDisabled)
            employmentPreferencesInsertMap.put("isEmploymentProtected", isEmploymentProtected)
            employmentPreferencesInsertMap.put("isEmploymentSupport", isEmploymentSupport)
            employmentPreferencesInsertMap.put("isVeteran", isVeteran)
            employmentPreferencesInsertMap.put("militaryServiceClass", militaryServiceClass)
            employmentPreferencesInsertMap.put("militaryServiceJoinDate", militaryServiceJoinDate)
            employmentPreferencesInsertMap.put("militaryServiceOutDate", militaryServiceOutDate)
            employmentPreferencesInsertMap.put("militaryServiceStatus", militaryServiceStatus)

            var insertCnt = resumeService.insertResumeEmpPrf(employmentPreferencesInsertMap)
            var inserCnt = insertCnt

            //var languagesArrayList = resumeRequest.languages as ArrayList<Any>
            var languagesArrayList = resumeRequestData["languages"] as ArrayList<Any>
            for(languages in languagesArrayList){
                languages as MutableMap<String, Any>
                var language = languages["language"] as String
                var readingLevel = languages["readingLevel"] as String
                var speakingLevel = languages["speakingLevel"] as String
                var writingLevel = languages["writingLevel"] as String

                var languagesInsertMap = mutableMapOf<String, Any>()
                languagesInsertMap.put("resume_id", resumeRequest.resumeId.toString().toInt())
                languagesInsertMap.put("language", language)
                languagesInsertMap.put("readingLevel", readingLevel)
                languagesInsertMap.put("speakingLevel", speakingLevel)
                languagesInsertMap.put("writingLevel", writingLevel)

                var insertCnt = resumeService.insertResumeLngs(languagesInsertMap)
                var inserCnt = insertCnt
            }

            //var selfIntroductionsArrayList = resumeRequest.selfIntroductions as ArrayList<Any>
            var selfIntroductionsArrayList = resumeRequestData["selfIntroductions"] as ArrayList<Any>
            for(selfIntroductions in selfIntroductionsArrayList){
                selfIntroductions as MutableMap<String, Any>
                var title = selfIntroductions["title"] as String
                var content = selfIntroductions["content"] as String

                var slfIntrosInsertMap = mutableMapOf<String, Any>()
                slfIntrosInsertMap.put("resume_id", resumeRequest.resumeId.toString().toInt())
                slfIntrosInsertMap.put("title", title)
                slfIntrosInsertMap.put("content", content)

                var insertCnt = resumeService.insertResumeSflIntros(slfIntrosInsertMap)
                var inserCnt = insertCnt
            }

            var mMap = mutableMapOf<String, Any>()
            mMap.put("fileidx", 0)
            mMap.put("user_id", user_id)
            mMap.put("con_id", last_insert_resume_idx.toString().toInt())
            mMap.put("type", fileTyp)
            mMap.put("year_date", todaydate)
            mMap.put("file_name", fileNm)
            mMap.put("file_ext", fileExt)
            mMap.put("file_path_s3", imageUrl)
            insertCnt = fileUtilService.insertJobResumeFileData(mMap)

            //저장한 파일 idx 를 저장한 이력서 row 에 업데이트 함
            //profile_img_idx
            var mMap2 = mutableMapOf<String, Any>()
            mMap2.put("resumeId", last_insert_resume_idx.toString().toInt())
            mMap2.put("profileImgIdx", mMap.get("fileidx").toString().toInt())
            resumeService.updateResumeProfileImgIdx(mMap2)

            //이력서 아포스티 저장
            var apostille_idx_str = ""
            fileTyp = "resume_aposti_img"
            if (apostilleFiles != null) {
                for(apostilleFile in apostilleFiles){
                    val apostilleUuid = fileUtils.fileSave(rootpath = save_path, type = fileTyp, yeardate = todaydate, file = apostilleFile)
                    val apostilleFileName = apostilleFile.originalFilename ?: "unnamed"
                    val apostilleFileExt = apostilleFileName.substring(apostilleFileName.lastIndexOf("."))

                    // 파일 URL 생성
                    val apostilleUrl = fileUtils.getFileUrl(save_path, fileTyp, todaydate, apostilleUuid, apostilleFileName)


                    //파일 정보 테이블에 저장 (채용공고 번호, 타입, 날짜, 파일명, 파일확장자)
                    mMap.clear()
                    mMap.put("fileidx", 0)
                    mMap.put("user_id", user_id)
                    mMap.put("con_id", last_insert_resume_idx.toString().toInt())
                    mMap.put("type", fileTyp)
                    mMap.put("year_date", todaydate)
                    mMap.put("file_name", apostilleFileName)
                    mMap.put("file_ext", apostilleFileExt)
                    mMap.put("file_path_s3", apostilleUrl)
                    insertCnt = fileUtilService.insertJobResumeFileData(mMap)
                    if(apostille_idx_str.length == 0){
                        apostille_idx_str = mMap.get("fileidx").toString()
                    }else{
                        apostille_idx_str = apostille_idx_str + "," + mMap.get("fileidx").toString()
                    }
                }
            }

            mMap2.put("apostiuImgIdxStr", apostille_idx_str)
            resumeService.updateResumeApostiImgIdx(mMap2)

            if (user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            return ResponseEntity(HttpStatus.CREATED)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @PatchMapping("/resumes/{resumeId}/public")
    fun api_v1_resume_change_public(@PathVariable resumeId: Int, @RequestBody request: ResumeVisibilityRequest, session: HttpSession):ResponseEntity<Any>{
        var user_id = session.getAttribute("userId")
        if(user_id == null){
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }

        var mMap2 = mutableMapOf<String, Any>()
        mMap2.put("resumeId", resumeId)

        var isPublic = 0
        if (request.isPublic == true){
            isPublic = 1
        }
        mMap2.put("resumeId", resumeId)
        mMap2.put("isPublic", isPublic)
        resumeService.updateResumePublicStatus(mMap2)
        return ResponseEntity(HttpStatus.OK)
    }
    @PostMapping("/resumes/{resumeId}/profile-image")
    fun api_v1_resume_profile_edit(@PathVariable resumeId: Int, session: HttpSession, @RequestParam file: MultipartFile):ResponseEntity<ResumeRequest?>{
        var user_id = session.getAttribute("userId")
        if(user_id == null){
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        var last_insert_resume_idx = resumeId
        // 이력서 프로필 이미지 저장
        val localDate: LocalDate = LocalDate.now()
        val fileTyp = "resume_profile_img"
        val todaydate = localDate.toString()

        // 파일 저장 및 UUID 얻기
        val uuid = fileUtils.fileSave(rootpath = save_path, type = fileTyp, yeardate = todaydate, file = file)
        val fileNm = file.originalFilename ?: "unnamed"
        val fileExt = fileNm.substring(fileNm.lastIndexOf("."))

        // 파일 URL 생성
        val imageUrl = fileUtils.getFileUrl(save_path, fileTyp, todaydate, uuid, fileNm)

        var mMap = mutableMapOf<String, Any>()
        mMap.put("fileidx", 0)
        mMap.put("user_id", user_id)
        mMap.put("con_id", last_insert_resume_idx.toString().toInt())
        mMap.put("type", fileTyp)
        mMap.put("year_date", todaydate)
        mMap.put("file_name", fileNm)
        mMap.put("file_ext", fileExt)
        mMap.put("file_path_s3", imageUrl)
        var insertCnt = fileUtilService.insertJobResumeFileData(mMap)

        //저장한 파일 idx 를 저장한 이력서 row 에 업데이트 함
        //profile_img_idx
        var mMap2 = mutableMapOf<String, Any>()
        mMap2.put("resumeId", last_insert_resume_idx.toString().toInt())
        mMap2.put("profileImgIdx", mMap.get("fileidx").toString().toInt())
        resumeService.updateResumeProfileImgIdx(mMap2)

        return ResponseEntity(HttpStatus.OK)
    }
    @PutMapping("/resumes/{resumeId}")
    fun api_v1_resume_edit(@PathVariable resumeId: Int, @RequestParam resumeData: String, session: HttpSession, @RequestParam profileImage: MultipartFile?, @RequestParam apostilleFiles: ArrayList<MultipartFile>?): ResponseEntity<ResumeRequest?>{
        try{
            var user_id = session.getAttribute("userId")
            if(user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }else{
                user_id = user_id.toString().toInt()
            }
            val gson = Gson()
            var resumeRequestData: Map<String, Any> = HashMap()
            resumeRequestData = Gson().fromJson(resumeData, resumeRequestData.javaClass)

            var picturePath = ""
            // 이력서 이미지와 아포스티 파일 저장
            val localDate: LocalDate = LocalDate.now()
            var fileTyp = "resume_profile_img"
            val todaydate = localDate.toString()

            if(profileImage != null) {
                // 이력서 본인 이미지 저장
                val uuid = fileUtils.fileSave(rootpath = save_path, type = fileTyp, yeardate = todaydate, file = profileImage)
                val fileNm = profileImage.originalFilename ?: "unnamed"
                val fileExt = fileNm.substring(fileNm.lastIndexOf("."))

                val imageUrl = fileUtils.getFileUrl(save_path, fileTyp, todaydate, uuid, fileNm)
                picturePath = imageUrl
            }


            // 이미지 URL 생성
            var resumeInfo = resumeService.selectResumeDetail(resumeId)

            var resumeRequest = ResumeRequest()
            resumeRequest.jobSeekerId = resumeInfo.jobSeekerId.toString().toInt()
            /*var title = resumeRequest.title as String
            var address = resumeRequest.address as String
            var birth = resumeRequest.birth as String
            var careerType = resumeRequest.careerType as String
            var email = resumeRequest.email as String
            var englishName = resumeRequest.englishName as String
            var gender = resumeRequest.gender as String
            var name = null_checker_for_string(resumeRequest.name)
            var nationality = resumeRequest.nationality as String
            var phone = resumeRequest.phone as String
            var picturePath = resumeRequest.picturePath as String
            var spellingText = null_checker_for_string(resumeRequest.spellingText)
            var visa = resumeRequest.visa as String*/
            //resumeService.insertResume(resumeRequest)
            resumeRequest.resumeId = resumeId
            var title = resumeRequestData["title"] as String
            resumeRequest.title = title
            var address = resumeRequestData["address"] as String
            resumeRequest.address = address

            var birth = ""
            if (resumeRequestData["birth"] != null){
                birth = resumeRequestData["birth"] as String
            }
            resumeRequest.birth = birth

            var careerType = null_checker_for_string(resumeRequestData["careerType"])
            resumeRequest.careerType = careerType
            var email = null_checker_for_string(resumeRequestData["email"])
            resumeRequest.email = email
            var englishName = null_checker_for_string(resumeRequestData["englishName"])
            resumeRequest.englishName = englishName
            var gender = null_checker_for_string(resumeRequestData["gender"])
            resumeRequest.gender = gender
            var name = null_checker_for_string(resumeRequestData["name"])
            resumeRequest.name = name
            var nationality = null_checker_for_string(resumeRequestData["nationality"])
            resumeRequest.nationality = nationality
            var phone = null_checker_for_string(resumeRequestData["phone"])
            resumeRequest.phone = phone

            resumeRequest.picturePath = picturePath
            var spellingText = resumeRequestData["spellingText"] as String?
            resumeRequest.spellingText = spellingText

            var visaStr = ""
            if (resumeRequestData["visa"] != null){
                var visa = resumeRequestData["visa"] as java.util.ArrayList<String>
                //var visaStr = resumeRequestData["visa"] as String?
                visaStr = visa.joinToString(",")
            }

            resumeRequest.visa = visaStr

            resumeService.updateResume(resumeRequest)

            var deleteCnt = resumeService.deleteResumeActivities(resumeId)
            deleteCnt = resumeService.deleteResumeAwards(resumeId)
            deleteCnt = resumeService.deleteResumeCareers(resumeId)
            deleteCnt = resumeService.deleteResumeCerts(resumeId)
            deleteCnt = resumeService.deleteResumeEdus(resumeId)
            deleteCnt = resumeService.deleteResumeEmpPrf(resumeId)
            deleteCnt = resumeService.deleteResumeLngs(resumeId)
            deleteCnt = resumeService.deleteResumeSflIntros(resumeId)

            //var activitiesArrayList = resumeRequest.activities as ArrayList<Any>
            var activitiesArrayList = resumeRequestData["activities"] as ArrayList<Any>
            for(activitiesMap in activitiesArrayList){
                activitiesMap as MutableMap<String, Any>
                var activityType = activitiesMap["activityType"] as String
                var description = activitiesMap["description"] as String
                var organizationName = activitiesMap["organizationName"] as String
                var startDate = activitiesMap["startDate"] as String
                var endDate = activitiesMap["endDate"] as String
                var activitiesInsertMap = mutableMapOf<String, Any>()
                activitiesInsertMap.put("resume_id", resumeId)
                activitiesInsertMap.put("activityType", activityType)
                activitiesInsertMap.put("description", description)
                activitiesInsertMap.put("organizationName", organizationName)
                activitiesInsertMap.put("startDate", startDate)
                activitiesInsertMap.put("endDate", endDate)
                if(activityType.length == 0 || description.length == 0 ||
                    organizationName.length == 0 || startDate.length == 0 ||
                    endDate.length == 0){
                    continue
                }
                var inserCnt = resumeService.insertResumeActivities(activitiesInsertMap)
                var insertCnt = inserCnt
            }

            //var awardsArrayList = resumeRequest.awards as ArrayList<Any>
            var awardsArrayList = resumeRequestData["awards"] as ArrayList<Any>
            for(awardsMap in awardsArrayList){
                awardsMap as MutableMap<String, Any>
                var awardName = awardsMap["awardName"] as String
                var awardYear = awardsMap["awardYear"] as String
                var awardingOrganization = awardsMap["awardingOrganization"] as String
                var description = awardsMap["description"] as String
                var awardsInsertMap = mutableMapOf<String, Any>()
                awardsInsertMap.put("resume_id", resumeId)
                awardsInsertMap.put("awardName", awardName)
                awardsInsertMap.put("awardYear", awardYear)
                awardsInsertMap.put("awardingOrganization", awardingOrganization)
                awardsInsertMap.put("description", description)
                if(awardName.length == 0 || awardYear.length == 0 ||
                    awardingOrganization.length == 0){
                    continue
                }
                var insertCnt = resumeService.insertResumeAwards(awardsInsertMap)
                var inserCnt = insertCnt
            }

            //var careersArrayList = resumeRequest.careers as ArrayList<Any>
            var careersArrayList = resumeRequestData["careers"] as ArrayList<Any>
            for(careersMap in careersArrayList){
                careersMap as MutableMap<String, Any>
                var companyName = careersMap["companyName"] as String
                var endDate = careersMap["endDate"] as String

                var isCurrent = anyBooleanToInt(careersMap["isCurrent"])
                //var isCurrent_boolean = careersMap["isCurrent"] as Boolean
                //var isCurrent = booleanToInt(isCurrent_boolean)

                var jobTitle = careersMap["jobTitle"] as String
                var position = careersMap["position"] as String
                var responsibilities = careersMap["responsibilities"] as String
                var startDate = careersMap["startDate"] as String
                var careersInsertMap = mutableMapOf<String, Any>()
                careersInsertMap.put("resume_id", resumeId)
                careersInsertMap.put("companyName", companyName)
                careersInsertMap.put("endDate", endDate)
                careersInsertMap.put("isCurrent", isCurrent)
                careersInsertMap.put("jobTitle", jobTitle)
                careersInsertMap.put("position", position)
                careersInsertMap.put("responsibilities", responsibilities)
                careersInsertMap.put("startDate", startDate)
                if(companyName.length == 0 || endDate.length == 0 ||
                    jobTitle.length == 0 || position.length == 0){
                    continue
                }
                var insertCnt = resumeService.insertResumeCareers(careersInsertMap)
                var inserCnt = insertCnt
            }

            //var certificationsArrayList = resumeRequest.certifications as ArrayList<Any>
            var certificationsArrayList = resumeRequestData["certifications"] as ArrayList<Any>
            for(certifications in certificationsArrayList){
                certifications as MutableMap<String, Any>
                var acquisitionDate = certifications["acquisitionDate"] as String
                var certificationName = certifications["certificationName"] as String
                var issuingOrganization = certifications["issuingOrganization"] as String
                var certificationsInsertMap = mutableMapOf<String, Any>()
                certificationsInsertMap.put("resume_id", resumeId)
                certificationsInsertMap.put("acquisitionDate", acquisitionDate)
                certificationsInsertMap.put("certificationName", certificationName)
                certificationsInsertMap.put("issuingOrganization", issuingOrganization)
                if(acquisitionDate.length == 0 || certificationName.length == 0 ||
                    issuingOrganization.length == 0){
                    continue
                }
                var insertCnt = resumeService.insertResumeCerts(certificationsInsertMap)
                var inserCnt = insertCnt
            }

            //var educationsArrayList = resumeRequest.educations as ArrayList<Any>
            var educationsArrayList = resumeRequestData["educations"] as ArrayList<Any>
            for(educations in educationsArrayList){
                educations as MutableMap<String, Any>
                var additionalMajor = null_checker_for_string(educations["additionalMajor"])
                var additionalMajorType = null_checker_for_string(educations["additionalMajorType"])
                var admissionDate = null_checker_for_string(educations["admissionDate"])
                var department = null_checker_for_string(educations["department"])
                var gpa = null_checker_for_string(educations["gpa"])
                var graduationDate = null_checker_for_string(educations["graduationDate"])
                var graduationStatus = null_checker_for_string(educations["graduationStatus"])
                var lastSchool = null_checker_for_string(educations["lastSchool"])
                var region = null_checker_for_string(educations["region"])
                var schoolName = null_checker_for_string(educations["schoolName"])
                var totalCredits = null_checker_for_string(educations["totalCredits"])

                var transferStatus = anyBooleanToInt(educations["transferStatus"])
                //var transferStatus_boolean = educations["transferStatus"] as Boolean
                //var transferStatus = booleanToInt(transferStatus_boolean)

                var educationsInsertMap = mutableMapOf<String, Any>()
                educationsInsertMap.put("resume_id", resumeId)
                educationsInsertMap.put("additionalMajor", additionalMajor)
                educationsInsertMap.put("additionalMajorType", additionalMajorType)
                educationsInsertMap.put("admissionDate", admissionDate)
                educationsInsertMap.put("department", department)
                educationsInsertMap.put("gpa", gpa)
                educationsInsertMap.put("graduationDate", graduationDate)
                educationsInsertMap.put("graduationStatus", graduationStatus)
                educationsInsertMap.put("lastSchool", lastSchool)
                educationsInsertMap.put("region", region)
                educationsInsertMap.put("schoolName", schoolName)
                educationsInsertMap.put("totalCredits", totalCredits)
                educationsInsertMap.put("transferStatus", transferStatus)
                var insertCnt = resumeService.insertResumeEdus(educationsInsertMap)
                var inserCnt = insertCnt
            }

            //var employmentPreferencesMap = resumeRequest.employmentPreferences as MutableMap<String, Any>
            var employmentPreferencesMap = resumeRequestData["employmentPreferences"] as MutableMap<String, Any>
            if (employmentPreferencesMap != null && employmentPreferencesMap.size > 0){
                var disabledGrade = null_checker_for_string(employmentPreferencesMap["disabledGrade"])
                var hasMilitaryService_boolean = employmentPreferencesMap["hasMilitaryService"] as Boolean
                var hasMilitaryService = booleanToInt(hasMilitaryService_boolean)
                var isDisabled_boolean = employmentPreferencesMap["isDisabled"] as Boolean
                var isDisabled = booleanToInt(isDisabled_boolean)
                var isEmploymentProtected_boolean = employmentPreferencesMap["isEmploymentProtected"] as Boolean
                var isEmploymentProtected = booleanToInt(isEmploymentProtected_boolean)
                var isEmploymentSupport_boolean = employmentPreferencesMap["isEmploymentSupport"] as Boolean
                var isEmploymentSupport = booleanToInt(isEmploymentSupport_boolean)
                var isVeteran_boolean = employmentPreferencesMap["isVeteran"] as Boolean
                var isVeteran = booleanToInt(isVeteran_boolean)
                var militaryServiceClass = null_checker_for_string(employmentPreferencesMap["militaryServiceClass"])
                var militaryServiceJoinDate = null_checker_for_string(employmentPreferencesMap["militaryServiceJoinDate"])
                var militaryServiceOutDate = null_checker_for_string(employmentPreferencesMap["militaryServiceOutDate"])
                var militaryServiceStatus = null_checker_for_string(employmentPreferencesMap["militaryServiceStatus"])

                var employmentPreferencesInsertMap = mutableMapOf<String, Any>()
                employmentPreferencesInsertMap.put("resume_id", resumeId)
                employmentPreferencesInsertMap.put("disabledGrade", disabledGrade)
                employmentPreferencesInsertMap.put("hasMilitaryService", hasMilitaryService)
                employmentPreferencesInsertMap.put("isDisabled", isDisabled)
                employmentPreferencesInsertMap.put("isEmploymentProtected", isEmploymentProtected)
                employmentPreferencesInsertMap.put("isEmploymentSupport", isEmploymentSupport)
                employmentPreferencesInsertMap.put("isVeteran", isVeteran)
                employmentPreferencesInsertMap.put("militaryServiceClass", militaryServiceClass)
                employmentPreferencesInsertMap.put("militaryServiceJoinDate", militaryServiceJoinDate)
                employmentPreferencesInsertMap.put("militaryServiceOutDate", militaryServiceOutDate)
                employmentPreferencesInsertMap.put("militaryServiceStatus", militaryServiceStatus)

                var insertCnt = resumeService.insertResumeEmpPrf(employmentPreferencesInsertMap)
                var inserCnt = insertCnt
            }


            //var languagesArrayList = resumeRequest.languages as ArrayList<Any>
            var languagesArrayList = resumeRequestData["languages"] as ArrayList<Any>
            for(languages in languagesArrayList){
                languages as MutableMap<String, Any>
                var language = languages["language"] as String
                var readingLevel = languages["readingLevel"] as String
                var speakingLevel = languages["speakingLevel"] as String
                var writingLevel = languages["writingLevel"] as String

                var languagesInsertMap = mutableMapOf<String, Any>()
                languagesInsertMap.put("resume_id", resumeId)
                languagesInsertMap.put("language", language)
                languagesInsertMap.put("readingLevel", readingLevel)
                languagesInsertMap.put("speakingLevel", speakingLevel)
                languagesInsertMap.put("writingLevel", writingLevel)

                var insertCnt = resumeService.insertResumeLngs(languagesInsertMap)
                var inserCnt = insertCnt
            }

            //var selfIntroductionsArrayList = resumeRequest.selfIntroductions as ArrayList<Any>
            var selfIntroductionsArrayList = resumeRequestData["selfIntroductions"] as ArrayList<Any>
            for(selfIntroductions in selfIntroductionsArrayList){
                selfIntroductions as MutableMap<String, Any>
                var title = selfIntroductions["title"] as String
                var content = selfIntroductions["content"] as String

                var slfIntrosInsertMap = mutableMapOf<String, Any>()
                slfIntrosInsertMap.put("resume_id", resumeId)
                slfIntrosInsertMap.put("title", title)
                slfIntrosInsertMap.put("content", content)
                if(title.length == 0 || content.length == 0){
                    continue
                }

                var insertCnt = resumeService.insertResumeSflIntros(slfIntrosInsertMap)
                var inserCnt = insertCnt
            }

            var last_insert_resume_idx = resumeId
            //이력서 이미지와 아포스티 파일 저장
            //last_insert_resume_idx

            //val uuid = UUID.randomUUID().toString()
            /*if(profileImage != null){
                val localDate: LocalDate = LocalDate.now()
                val todaydate = localDate.toString()


                var mMap = mutableMapOf<String, Any>()
                mMap.put("fileidx", 0)
                mMap.put("user_id", user_id)
                mMap.put("con_id", last_insert_resume_idx.toString().toInt())
                mMap.put("type", fileTyp)
                mMap.put("year_date", todaydate)
                mMap.put("file_name", uuid + "_" + fileNm)
                mMap.put("file_ext", fileExt)
                mMap.put("file_path_s3", imageUrl)
                insertCnt = fileUtilService.insertJobResumeFileData(mMap)

                //저장한 파일 idx 를 저장한 이력서 row 에 업데이트 함
                //profile_img_idx
                var mMap2 = mutableMapOf<String, Any>()
                mMap2.put("resumeId", last_insert_resume_idx.toString().toInt())
                mMap2.put("profileImgIdx", mMap.get("fileidx").toString().toInt())
                resumeService.updateResumeProfileImgIdx(mMap2)
            }*/


            //이력서 아포스티 저장
            var apostille_idx_str = ""
            fileTyp = "resume_aposti_img"
            var mMap = mutableMapOf<String, Any>()
            if (apostilleFiles != null) {
                for(apostilleFile in apostilleFiles){
                    val apostilleUuid = fileUtils.fileSave(rootpath = save_path, type = fileTyp, yeardate = todaydate, file = apostilleFile)
                    val apostilleFileName = apostilleFile.originalFilename ?: "unnamed"
                    val apostilleFileExt = apostilleFileName.substring(apostilleFileName.lastIndexOf("."))

                    // 파일 URL 생성
                    val apostilleUrl = fileUtils.getFileUrl(save_path, fileTyp, todaydate, apostilleUuid, apostilleFileName)


                    //파일 정보 테이블에 저장 (채용공고 번호, 타입, 날짜, 파일명, 파일확장자)
                    mMap.clear()
                    mMap.put("fileidx", 0)
                    mMap.put("user_id", user_id)
                    mMap.put("con_id", last_insert_resume_idx.toString().toInt())
                    mMap.put("type", fileTyp)
                    mMap.put("year_date", todaydate)
                    mMap.put("file_name", apostilleFileName)
                    mMap.put("file_ext", apostilleFileExt)
                    mMap.put("file_path_s3", apostilleUrl)
                    var insertCnt = fileUtilService.insertJobResumeFileData(mMap)
                    if(apostille_idx_str.length == 0){
                        apostille_idx_str = mMap.get("fileidx").toString()
                    }else{
                        apostille_idx_str = apostille_idx_str + "," + mMap.get("fileidx").toString()
                    }
                }
            }
            var mMap2 = mutableMapOf<String, Any>()
            mMap2.put("resumeId", last_insert_resume_idx.toString().toInt())
            mMap2.put("apostiuImgIdxStr", apostille_idx_str)
            resumeService.updateResumeApostiImgIdx(mMap2)

            if (user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            return ResponseEntity(HttpStatus.CREATED)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @GetMapping("/resumes")
    fun api_v1_resume_list(session: HttpSession, keyword: String?, location: String?, page: Int, size: Int): ResponseEntity<MutableMap<String, Any>>{
        var user_id = session.getAttribute("userId")
        if(user_id == null){
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        var req_page = 1
        var req_size = 10
        if(page != null && page >= 1 && size != null && size > 0){
            req_page = page
            req_size = size
        }
        var nMap = mutableMapOf<String, Any>()
        nMap.put("userId", user_id)
        nMap.put("size", 10)
        var offSetNumb = getOffSetNumb(req_page, req_size)
        nMap.put("offSetNumb", offSetNumb)
        var resumeList = resumeService.selectResumeList(nMap)
        var list = ArrayList<Any>()
        for (resume in resumeList){
            var nMap = mutableMapOf<String, Any>()
            nMap.put("id", resume.resumeId.toString().toInt())
            nMap.put("title", resume.title.toString())
            nMap.put("date", resume.created_at.toString())
            nMap.put("status", "ON")
            nMap.put("isPublic", null_checker_for_boolean(resume.isPublic))
            list.add(nMap)
        }
        var resumeListCnt = resumeService.selectResumeListCnt(nMap)
        var totalPages = resumeListCnt/size
        if(resumeListCnt%size > 0){
            totalPages = totalPages + 1
        }
        var resp_mMap = mutableMapOf<String, Any>()
        resp_mMap.put("totalPages", totalPages)
        //resp_mMap.put("currentPage", page)
        resp_mMap.put("content", list)
        resp_mMap.put("totalElements", resumeListCnt)

        return ResponseEntity(resp_mMap, HttpStatus.OK)
    }
    @GetMapping("/resumes/{resumeId}")
    fun api_v1_resume_view(@PathVariable resumeId: Int, session:HttpSession): ResponseEntity<Any>{
        try{
            var user_id = session.getAttribute("userId")
            if (user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            var resumeInfo = resumeService.selectResumeDetail(resumeId)

            var userinfo = authService.getUserInfoByUserId(resumeInfo.jobSeekerId.toString().toInt())

            resumeInfo.name = null_checker_for_string(userinfo.get("name"))
            resumeInfo.englishName = null_checker_for_string(userinfo.get("englishName"))
            resumeInfo.phone = null_checker_for_string(userinfo.get("phone"))
            resumeInfo.address = null_checker_for_string(userinfo.get("address"))
            resumeInfo.nationality = null_checker_for_string(userinfo.get("nationality"))
            resumeInfo.email = null_checker_for_string(userinfo.get("email"))
            resumeInfo.visa = null_checker_for_string(userinfo.get("visa"))


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
            resumeInfo.filePath = ""
            //본인 이미지 인덱스를 가져와서 파일 경로로 넘긴다.
            var resumeDetail = resumeService.selectResumeDetail(resumeId)
            var profileImgIdx = resumeDetail.profileImgIdx

            if (profileImgIdx != null && profileImgIdx > 0){
                var fMap = mutableMapOf<String, Any>()
                fMap.put("fileidx", profileImgIdx.toString().toInt())
                var attached_file_inform = fileUtilService.getFileDataByIdx(fMap)
                var apo_file_name = attached_file_inform.get("file_name").toString()
                var apo_download_url = null_checker_for_string(attached_file_inform.get("file_path_s3"))

                resumeInfo.picturePath = apo_download_url
            }

            var apo_attachlist = ArrayList<Any>()
            var apofileIdxArr_tmp = ArrayList<Any>()
            var apofileIdx = resumeDetail.apostiuImgIdx
            if (apofileIdx != null && apofileIdx != "") {
                var apofileIdxArr = apofileIdx?.split(",")
                if (apofileIdxArr != null && apofileIdx != null) {
                    if (apofileIdxArr.size > 0) {
                        for (apofile in apofileIdxArr) {
                            apofileIdxArr_tmp.add(apofile)
                        }
                    } else if (apofileIdxArr.size == 0 && apofileIdx.length > 0) {
                        apofileIdxArr_tmp.add(apofileIdx)
                    }
                }
                if (apofileIdxArr != null) {
                    for (apofileIdx in apofileIdxArr_tmp) {
                        var mMap = mutableMapOf<String, Any>()
                        mMap.put("fileidx", apofileIdx)
                        var attached_file_inform = fileUtilService.getFileDataByIdx(mMap)
                        var file_attach_id = attached_file_inform.get("file_attach_id")
                        var file_type = attached_file_inform.get("type")
                        var file_year_date = attached_file_inform.get("year_date")
                        var file_file_name = attached_file_inform.get("file_name").toString()
                        var mMap2 = mutableMapOf<String, Any>()
                        var apo_download_url = attached_file_inform.get("file_path_s3").toString()
                        var mMap3 = mutableMapOf<String, Any>()
                        mMap3.put("name", file_file_name)
                        mMap2.put("file", mMap3)
                        mMap2.put("apo_file_nm", file_file_name)
                        mMap2.put("apo_download_url", apo_download_url)
                        apo_attachlist.add(mMap2)
                    }
                }
                resumeInfo.apostilles = apo_attachlist
            }

            //resumeInfo.empprf = resume_prf as ArrayList<Any>

            var user_type = session.getAttribute("userType")
            if (user_type != null){
                if(user_type == "COMPANY") {
                    var viewMap = mutableMapOf<String, Any>()
                    viewMap.put("userId", user_id)
                    viewMap.put("resumeId", resumeId)
                    corpmemService.insertResumeView(viewMap)
                }
            }

            //해당 인재, 제안 이력 검색
            var mMap = mutableMapOf<String, Any>()
            mMap.put("employer_id", user_id)
            mMap.put("resume_id", resumeId)
            //var jobProposalInfo = joboffersService.selectJobofferProposalInfo(mMap)
            var jobOfferInfo = joboffersService.selectJobofferProposalInfoByResumeId(mMap)
            resumeInfo.blind = true
            if (jobOfferInfo == null){
                resumeInfo.blind = true
            }else if (jobOfferInfo != null){
                var offer_status = jobOfferInfo.get("status")
                if (offer_status == "ACCEPTED"){
                    resumeInfo.blind = false
                }else if (offer_status == "REJECTED"){
                    resumeInfo.blind = true
                    resumeInfo.responseStatus = "REJECTED"
                }

            }
            //resumeInfo.blind = false

            //languages
            var resp_mMap = mutableMapOf<String, Any>()
            resp_mMap.put("data", resumeInfo)
            //resp_mMap.put("educations", resume_educations)
            return ResponseEntity(resp_mMap, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    /*@PutMapping("/resumes/{resumeId}")
    fun api_v1_resume_edit(@PathVariable resumeId: Int, @RequestBody resumeRequest: ResumeRequest, session:HttpSession): ResponseEntity<ResumeResponse?>{
        try{
            var user_id = session.getAttribute("userId")
            if (user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            val rst_val = resumeService.updateResume(resumeRequest)
            return ResponseEntity(HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }*/
    @DeleteMapping("/resumes/{resumeId}")
    fun api_v1_resume_delete(@PathVariable resumeId: Int, session:HttpSession): ResponseEntity<ResumeResponse?>{
        try{
            var user_id = session.getAttribute("userId")
            if (user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            val rst_val = resumeService.deleteResume(resumeId)
            return ResponseEntity(HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    fun booleanToInt(b: Boolean): Int {
        return if (b) 1 else 0
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
    fun anyBooleanToInt(s: Any?): Int{
        if(s == null || s == 0 || s == '0' || s == "0" || s == false){
            return 0
        }else{
            return 1
        }
    }
    fun null_checker_for_string(s: Any?): String{
        if(s == null){
            return ""
        }else{
            return s as String
        }
    }
    fun null_checker_for_boolean(s: Any?): Boolean{
        if(s == null || s == 0 || s == '0' || s == "0"){
            return false
        }else{
            return true
        }
    }
}