package com.yourjob.backend.controller

import com.yourjob.backend.entity.TalentPoolRequest
import com.yourjob.backend.entity.TalentPoolResponse
import com.yourjob.backend.service.AuthService
import com.yourjob.backend.service.ResumeService
import com.yourjob.backend.service.TalentService
import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.io.IOException
import java.text.ParseException
import java.text.SimpleDateFormat
import java.time.LocalDate
import java.time.Period
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException
import java.util.*
import kotlin.collections.ArrayList

///api/v1/employers/{employerId}/talent:
@RestController
@RequestMapping("/api/v1")
class TalentController (private var talentService: TalentService,
                        private var resumeService: ResumeService,
                        private var authService: AuthService){
    @GetMapping("/talents")
    fun api_v1_talent_list(session: HttpSession, searchType: String?, gender: String?, status: String?, career: String?, workplace: String?, keyword: String?, page: Int?, size: Int?, sortType: String?): ResponseEntity<Any> {
        try {
            var user_id = session.getAttribute("userId")
            if (user_id == null){
                //return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            var req_page = 1
            var req_size = 5
            if(page != null && page > 0){
                req_page = page
            }
            if(size != null && size > 0){
                req_size = size
            } else {
                req_size = 10
            }
            // 정렬 타입 설정 (updated 또는 recommended)
            var srchSrtType = "updated"
            if(sortType == "recommended"){
                srchSrtType = "recommended"
            }

            var srchType = "a.title"
            if(searchType == "company"){
                srchType = "companyName"
            }else if(searchType == "school"){
                srchType = "school"  // "u5.lastSchool"가 아닌 "school"로 변경
            }

            // 성별 필터
            var srchGender = ""
            if(gender != null) {
                if (gender == "male"){
                    srchGender = "M"
                }else if (gender == "female"){
                    srchGender = "F"
                }
            }

            // 경력 타입 필터 (신입/경력)
            var srchCareer = ""
            if(career != null) {
                srchCareer = career
            }

            // 재직 상태 필터 (재직중/구직중)
            var srchStatus = ""
            if(status != null) {
                srchStatus = status
            }

            // 근무지 필터 (여러 지역을 , 로 구분해서 처리)
            var workplaceList = ArrayList<String>()
            if(workplace != null && workplace.isNotEmpty()) {
                val regions = workplace.split(",")
                for(region in regions) {
                    val trimmedRegion = region.trim()
                    if(trimmedRegion.isNotEmpty()) {
                        workplaceList.add(trimmedRegion)
                    }
                }
            }

            var mMap = mutableMapOf<String, Any>()
            mMap.put("srchSrtType", srchSrtType)
            mMap.put("srchType", srchType)
            mMap.put("keyword", keyword.toString())
            mMap.put("srchGender", srchGender)
            mMap.put("srchCareer", srchCareer)
            mMap.put("srchStatus", srchStatus)
            // 지역 리스트를 전달
            if(workplaceList.isNotEmpty()) {
                mMap.put("workplaceList", workplaceList)
            }
            mMap.put("userId", user_id)

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
                var user_info = authService.getUserInfoByUserId(jobSeekerId.toString().toInt())
                var nMap = mutableMapOf<String, Any>()
                nMap.put("id", talentid.toString().toInt())
                nMap.put("jobseekerid", jobSeekerId.toString().toInt())

                nMap.put("name", user_info.get("name").toString())

                var genderTmp = "male"
                if (talent.get("gender").toString() == "F"){
                    genderTmp = "female"
                }
                nMap.put("gender", genderTmp)

                var user_birth = user_info.get("birth")
                if(user_birth != null){
                    val sdf = SimpleDateFormat("yyyyMMdd", Locale.ENGLISH)
                    val now_age = getBirthToAge(sdf, user_birth)
                    nMap.put("age", now_age)
                }else{
                    nMap.put("age", "미정")
                }

                //nMap.put("age", 38)
                nMap.put("location", talent.get("edu_region").toString())

                val scrap_cnt = talent.get("scrapcnt").toString().toInt()
                if(scrap_cnt > 0){
                    nMap.put("isScraped", true)
                }

                var nMap1 = mutableMapOf<String, Any>()
                nMap1.put("school", talent.get("schoolName").toString())
                nMap1.put("degree", talent.get("lastSchool").toString())
                nMap.put("education", nMap1)
                //degree
                var nMap2 = mutableMapOf<String, Any>()
                var companyNm = null_checker_for_string(talent.get("companyName"))
                nMap2.put("company", companyNm)

                var career_years = 0
                var career_months = 0
                var resumeCareerInfos = resumeService.selectResumeCareers(resumeId = talentid.toString().toInt())
                for(resumeCareerInfo in resumeCareerInfos){

                    var career_start_date = resumeCareerInfo.get("startDate") as CharSequence
                    //var career_start_date_local = LocalDate.parse(career_start_date, DateTimeFormatter.ISO_DATE)
                    if (career_start_date.length == 7){
                        career_start_date = career_start_date.toString() + "-01"
                    }

                    var career_end_date = resumeCareerInfo.get("endDate") as CharSequence
                    //var career_end_date_local = LocalDate.parse(career_end_date, DateTimeFormatter.ISO_DATE)
                    if (career_end_date.length == 7){
                        career_end_date = career_end_date.toString() + "-01"
                    }

                    val period = getBetweenPeriod(career_start_date, career_end_date)
                    if(period == null){
                        break
                    }
                    //val period: Period = Period.between(career_start_date_local, career_end_date_local)
                    career_years = period.getYears()
                    career_months = period.getMonths()
                }

                nMap2.put("years", career_years)
                nMap2.put("months", career_months)

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
            //var mMap2 = mutableMapOf<String, Any>()
            val talentCnt = talentService.selectTalentSearchListCnt(mMap)
            //val talentCnt = talentList.size
            var totalPages = talentCnt/req_size
            if(talentCnt%req_size > 0){
                totalPages = totalPages + 1
            }

            var resp_mMap = mutableMapOf<String, Any>()
            resp_mMap.put("totalPages", totalPages)
            resp_mMap.put("content", list.toTypedArray())
            resp_mMap.put("totalElements", talentCnt)

            val talentListToArr = talentList!!.toTypedArray()
            return ResponseEntity(resp_mMap, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @GetMapping("/talents/top")
    fun api_v1_talent_list_top(session: HttpSession, page: Int?, size: Int?): ResponseEntity<Any> {
        try {
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
            } else {
                req_size = 6
            }

            // Top 인재는 추천순으로 조회
            var mMap = mutableMapOf<String, Any>()
            mMap.put("srchSrtType", "recommended")  // 추천순 정렬 추가
            mMap.put("userId", user_id)
            var offSetNumb = getOffSetNumb(req_page, req_size)
            mMap.put("page", req_page)
            mMap.put("size", req_size)
            mMap.put("offSetNumb", offSetNumb)

            // 추천순 정렬 적용된 인재 검색
            val talentList = talentService.selectTalentSearchList(mMap)

            var list = ArrayList<Any>()
            for (talent in talentList){
                talent as MutableMap<String, Any>
                val talentid = talent.get("resume_id")
                val jobSeekerId = talent.get("job_seeker_id")

                //jobSeekerIdd
                var user_info = authService.getUserInfoByUserId(jobSeekerId.toString().toInt())


                val profileImgIdx = talent.get("profile_img_idx")

                var nMap = mutableMapOf<String, Any>()
                nMap.put("profileImage", "http://localhost:8082/api/v1/image/show/" + profileImgIdx)

                val employerId = talent.get("user_id")

                val scrap_cnt = talent.get("scrapcnt").toString().toInt()
                if(scrap_cnt > 0){
                    nMap.put("isScraped", true)
                }

                nMap.put("id", talentid.toString().toInt())
                nMap.put("jobseekerid", jobSeekerId.toString().toInt())
                nMap.put("name", user_info.get("name").toString())

                //nMap.put("gender", talent.get("gender").toString())
                //nMap.put("age", 38)
                var genderTmp = "male"
                if (talent.get("gender").toString() == "F"){
                    genderTmp = "female"
                }
                nMap.put("gender", genderTmp)

                var user_birth = user_info.get("birth")
                if(user_birth != null){
                    val sdf = SimpleDateFormat("yyyyMMdd", Locale.ENGLISH)
                    val now_age = getBirthToAge(sdf, user_birth)
                    nMap.put("age", now_age)
                }else{
                    nMap.put("age", "미정")
                }

                nMap.put("location", talent.get("edu_region").toString())
                var nMap1 = mutableMapOf<String, Any>()
                nMap1.put("school", talent.get("schoolName").toString())
                nMap1.put("degree", talent.get("lastSchool").toString())
                nMap.put("education", nMap1)
                var nMap2 = mutableMapOf<String, Any>()
                nMap2.put("company", talent.get("companyName").toString())
                nMap2.put("position", talent.get("position").toString())

                var career_years = 0
                var career_months = 0
                var resumeCareerInfos = resumeService.selectResumeCareers(resumeId = talentid.toString().toInt())
                for(resumeCareerInfo in resumeCareerInfos){

                    var career_start_date = resumeCareerInfo.get("startDate") as CharSequence
                    //var career_start_date_local = LocalDate.parse(career_start_date, DateTimeFormatter.ISO_DATE)
                    if (career_start_date.length == 7){
                        career_start_date = career_start_date.toString() + "-01"
                    }

                    var career_end_date = resumeCareerInfo.get("endDate") as CharSequence
                    //var career_end_date_local = LocalDate.parse(career_end_date, DateTimeFormatter.ISO_DATE)
                    if (career_end_date.length == 7){
                        career_end_date = career_end_date.toString() + "-01"
                    }

                    val period = getBetweenPeriod(career_start_date, career_end_date)
                    if(period == null){
                        break
                    }
                    //val period: Period = Period.between(career_start_date_local, career_end_date_local)
                    career_years = period.getYears()
                    career_months = period.getMonths()
                }

                nMap2.put("years", career_years)
                nMap2.put("months", career_months)

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
            var resp_mMap = mutableMapOf<String, Any>()
            resp_mMap.put("totalPages", 10)
            resp_mMap.put("content", list.toTypedArray())
            resp_mMap.put("totalElements", 10)

            val talentListToArr = talentList!!.toTypedArray()
            return ResponseEntity(resp_mMap, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @GetMapping("/talents/recent")
    fun api_v1_employers_talent_recent_view_list(page: Int?, size: Int?, session: HttpSession): ResponseEntity<Any>{
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
        var mMap = mutableMapOf<String, Any>()
        mMap.put("userId", user_id)
        var offSetNumb = getOffSetNumb(req_page, req_size)
        mMap.put("offSetNumb", offSetNumb)
        mMap.put("size", req_size)
        mMap.put("employerId", user_id)
        //val talentList = talentService.selectJobOfferListByEmp(mMap)
        val recentList = talentService.selectRecentViewListByEmp(mMap)
        val totalCnt = talentService.selectRecentViewListByEmpCnt(mMap)
        var totalElementCnt = totalCnt
        var list = ArrayList<Any>()
        for (talent in recentList){
            talent as MutableMap<String, Any>
            val resumeid = talent.get("resume_id")
            val corpsviewid = talent.get("corps_view_id")
            val jobSeekerId = talent.get("jobSeekerId")
            var user_info = authService.getUserInfoByUserId(jobSeekerId.toString().toInt())

            var nMap = mutableMapOf<String, Any>()
            nMap.put("id", resumeid.toString().toInt())

            val scrap_cnt = talent.get("scrapcnt").toString().toInt()
            if(scrap_cnt > 0){
                nMap.put("isScraped", true)
            }

            //nMap.put("jobseekerid", jobSeekerId.toString().toInt())
            nMap.put("name", user_info.get("name").toString())
            //nMap.put("gender", talent.get("gender").toString())
            var genderTmp = "male"
            if (talent.get("gender").toString() == "F"){
                genderTmp = "female"
            }
            nMap.put("gender", genderTmp)

            //nMap.put("manager", manager)
            nMap.put("viewDate", talent.get("created_at").toString())
            nMap.put("responseStatus", talent.get("status").toString())
            nMap.put("interviewStatus", talent.get("interview_status").toString())

            //nMap.put("age", 38)
            var user_birth = user_info.get("birth")
            if(user_birth != null){
                val sdf = SimpleDateFormat("yyyyMMdd", Locale.ENGLISH)
                val now_age = getBirthToAge(sdf, user_birth)
                nMap.put("age", now_age)
            }else{
                nMap.put("age", "미정")
            }

            nMap.put("location", talent.get("edu_region").toString())
            var nMap1 = mutableMapOf<String, Any>()
            nMap1.put("school", talent.get("schoolName").toString())
            nMap1.put("degree", talent.get("lastSchool").toString())
            nMap1.put("major", talent.get("department").toString())
            nMap1.put("gpa", talent.get("gpa").toString())
            nMap.put("education", nMap1)

            //degree
            var nMap2 = mutableMapOf<String, Any>()
            nMap2.put("company", talent.get("companyName").toString())

            nMap2.put("years", "3")
            nMap2.put("months", "10")

            if (talent.get("car_start") != null && talent.get("car_end") != null){
                var career_start = talent.get("car_start").toString()
                var career_end = talent.get("car_end").toString()
                if (career_start.length == 7){
                    career_start = career_start.toString() + "-01"
                }
                if (career_end.length == 7){
                    career_end = career_end.toString() + "-01"
                }

                val period = getBetweenPeriod(career_start, career_end)
                if(period == null){
                    break
                }
                //val period: Period = Period.between(career_start_date_local, career_end_date_local)
                val career_years = period.getYears()
                val career_months = period.getMonths()

                nMap2.put("years", career_years)
                nMap2.put("months", career_months)
            }else{
                nMap2.put("years", 0)
                nMap2.put("months", 0)
            }

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
        var resp_mMap = mutableMapOf<String, Any>()
        var totalPages = totalElementCnt / 10 + 1
        resp_mMap.put("totalPages", totalPages)
        resp_mMap.put("content", list.toTypedArray())
        resp_mMap.put("totalElements", totalElementCnt)
        return ResponseEntity(resp_mMap, HttpStatus.OK)
        return ResponseEntity(HttpStatus.OK)
    }
    /*
    * 채용 담당자가 인재검색에서 별표를 눌러서 스크랩 하는 경우 (TOP 인재)
    * */
    @PostMapping("/talents/scrap/{resumeid}")
    fun api_v1_employers_talent_scrap(@PathVariable resumeid: Int, session: HttpSession): ResponseEntity<Any>{
        try {
            //이력서 아이디, 구직자 아이디, 채용자 아이디, 스크랩 인서트
            var user_id = session.getAttribute("userId")
            if (user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            //여기서 채용자, 이력서 번호 가 이미 스크랩 되어 있는지 찾아본다.
            //스크랩 데이터가 없으면 스크랩으로 등록한다.
            var mMap = mutableMapOf<String, Any>()
            mMap.put("user_id", user_id)
            mMap.put("resume_id", resumeid)
            var scrapinfo = talentService.getTalentScrap(mMap)
            if(scrapinfo.size == 0){
                val resumeInfo = resumeService.selectResumeDetail(resumeid.toString().toInt())
                val jobSeekerId = resumeInfo.jobSeekerId
                mMap.put("job_seeker_id", jobSeekerId.toString().toInt())
                var insertCnt = talentService.insertTalentScrap(mMap)
            }else{
                return ResponseEntity(HttpStatus.CONFLICT)
            }
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
        return ResponseEntity(HttpStatus.OK)
    }
    /*
    * 채용 담당자가 인재검색에서 별표를 눌러서 스크랩 해제 하는 경우 (TOP 인재)
    * */
    @DeleteMapping("/talents/scrap/{resumeid}")
    fun api_v1_employers_talent_scrap_delete(@PathVariable resumeid: Int, session: HttpSession): ResponseEntity<Any> {
        try {
            // 세션에서 사용자 ID 확인
            var user_id = session.getAttribute("userId")
            if (user_id == null) {
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }

            // 스크랩 데이터 삭제를 위한 파라미터 맵 생성
            var mMap = mutableMapOf<String, Any>()
            mMap.put("user_id", user_id)
            mMap.put("resume_id", resumeid)

            // 스크랩 데이터 삭제
            var deleteCnt = talentService.deleteTalentScrap(mMap)

            if (deleteCnt > 0) {
                return ResponseEntity(HttpStatus.OK)
            } else {
                return ResponseEntity(HttpStatus.NOT_FOUND)
            }
        } catch (e: IOException) {
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    /*
    * 채용담당자 > 기업홈 > 인재관리 > 스크랩 인재
    * */
    @GetMapping("/talents/scrap")
    fun api_v1_employers_talent_scrap_list(session: HttpSession, page:Int?, size: Int?, keyword: String?): ResponseEntity<Any>{
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
        req_size = 5
        var offSetNumb = getOffSetNumb(req_page, req_size)

        //스크랩 테이블에서 resume id 가져온다.
        var mMap = mutableMapOf<String, Any>()
        mMap.put("user_id", user_id)
        //mMap.put("resume_id", resumeid)
        var scrapDateMap = mutableMapOf<String, Any>()
        var scrap_resume_id_list = ArrayList<Int>()
        var scrapinfoList = talentService.getTalentScrap(mMap)
        for(scrapinfo in scrapinfoList){
            scrapinfo as MutableMap<String, Any>
            var resume_id = scrapinfo.get("resume_id").toString()
            scrap_resume_id_list.add(resume_id.toString().toInt())

            var created_at = scrapinfo.get("created_at")
            var updated_at = scrapinfo.get("updated_at")
            scrapDateMap.put("resume_id_" + resume_id, created_at.toString())
        }

        var mMap2 = mutableMapOf<String, Any>()
        if (keyword != null) {
            mMap2.put("keyword", keyword)
        }
        mMap2.put("offSetNumb", offSetNumb)
        mMap2.put("size", req_size)
        mMap2.put("employerId", user_id)
        if(scrap_resume_id_list.size > 0){
            mMap2.put("resume_id_arr", scrap_resume_id_list)
        }

        //val talentList = talentService.selectTalentSearchList(mMap2)
        val talentList = talentService.selectScrapListByEmp(mMap2)
        val talentCnt = talentService.selectScrapListByEmpCnt(mMap2)
        val talentList2 = talentService.selectTalentSearchListByParams(mMap2)

        var list = ArrayList<Any>()
        for (talent in talentList){
            talent as MutableMap<String, Any>
            val jobofferId = talent.get("corps_scrap_id")
            val resumeId = talent.get("resume_id")
            val jobSeekerId = talent.get("job_seeker_id")
            val isPublic = intToBoolean(talent.get("isPublic").toString().toInt())
            var nMap = mutableMapOf<String, Any>()
            val employerId = talent.get("user_id")
            if(employerId == user_id){
                nMap.put("isScraped", true)
            }

            nMap.put("resumeId", resumeId.toString().toInt())
            nMap.put("id", jobofferId.toString().toInt())
            nMap.put("jobseekerid", jobSeekerId.toString().toInt())
            //nMap.put("jobType", job_type.toString())
            nMap.put("name", talent.get("name").toString())

            //nMap.put("gender", talent.get("gender").toString())
            var genderTmp = "male"
            if (talent.get("gender").toString() == "F"){
                genderTmp = "female"
            }
            nMap.put("gender", genderTmp)

            nMap.put("isPublic", isPublic)

            var user_info = authService.getUserInfoByUserId(jobSeekerId.toString().toInt())
            var user_birth = user_info.get("birth")
            if(user_birth != null){
                val sdf = SimpleDateFormat("yyyyMMdd", Locale.ENGLISH)
                val now_age = getBirthToAge(sdf, user_birth)
                nMap.put("age", now_age)
            }else{
                nMap.put("age", "미정")
            }

            var lstSchl = talent.get("lastSchool").toString()
            if (lstSchl == "univ4"){
                lstSchl = "대학4년"
            }else if (lstSchl == "univ2"){
                lstSchl = "대학(2,3년)"
            }else if (lstSchl == "high"){
                lstSchl = "고등학교"
            }else if (lstSchl == "high"){
                lstSchl = "대학원"
            }

            nMap.put("location", talent.get("edu_region").toString())
            var nMap1 = mutableMapOf<String, Any>()
            nMap1.put("school", talent.get("schoolName").toString())
            nMap1.put("degree", lstSchl)
            nMap1.put("major", talent.get("department").toString())
            nMap1.put("gpa", talent.get("gpa").toString() + "/" + talent.get("totalCredits").toString())
            nMap1.put("totalCredits", talent.get("totalCredits").toString())
            nMap.put("education", nMap1)
            var scrapDateMap = scrapDateMap.get("resume_id_" + talent.get("resume_id"))
            nMap.put("scrapDate", scrapDateMap.toString())

            //major
            //gpa 추가할것

            //degree
            var nMap2 = mutableMapOf<String, Any>()
            nMap2.put("company", null_checker_for_string(talent.get("companyName")))
            nMap2.put("position", null_checker_for_string(talent.get("position")))

            if (talent.get("car_start") != null && talent.get("car_end") != null){
                var career_start = talent.get("car_start").toString()
                var career_end = talent.get("car_end").toString()
                if (career_start.length == 7){
                    career_start = career_start.toString() + "-01"
                }
                if (career_end.length == 7){
                    career_end = career_end.toString() + "-01"
                }

                val period = getBetweenPeriod(career_start, career_end)
                if(period == null){
                    break
                }
                //val period: Period = Period.between(career_start_date_local, career_end_date_local)
                val career_years = period.getYears()
                val career_months = period.getMonths()

                nMap2.put("years", career_years)
                nMap2.put("months", career_months)
            }else{
                nMap2.put("years", 0)
                nMap2.put("months", 0)
            }

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
        var totalPages = talentCnt/req_size
        if(talentCnt%req_size > 0){
            totalPages = totalPages + 1
        }
        var resp_mMap = mutableMapOf<String, Any>()
        resp_mMap.put("totalPages", totalPages)
        resp_mMap.put("content", list.toTypedArray())
        resp_mMap.put("totalElements", talentCnt)
        return ResponseEntity(resp_mMap, HttpStatus.OK)
    }
    @DeleteMapping("/talents/scrap")
    fun api_v1_employers_talent_scrap_delete(@RequestBody delMap:MutableMap<String, Any>, session: HttpSession, page:Int?, size: Int?, keyword: String?): ResponseEntity<Any> {
        var user_id = session.getAttribute("userId")
        if (user_id == null) {
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }

        var talentIds = delMap.get("talentIds")
        talentIds as ArrayList<Int>
        for(offerId in talentIds){
            var update_cnt = talentService.deleteCorpScrap(offerId)
        }
        return ResponseEntity(HttpStatus.OK)
    }


    @GetMapping("/employers/{employerId}/talent")
    fun api_v1_employers_talent_list(@PathVariable employerId: Int, session: HttpSession): ResponseEntity<Array<TalentPoolResponse?>> {
        try {
            var user_id = session.getAttribute("userId")
            if (user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            val talentList = talentService.selectTalentList(employerId)
            val talentListToArr = talentList!!.toTypedArray()
            return ResponseEntity(talentListToArr, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @PostMapping("/employers/{employerId}/talent")
    fun api_v1_employers_talent_insert(@PathVariable employerId: Int,@RequestBody talentPoolRequest: TalentPoolRequest, session: HttpSession): ResponseEntity<TalentPoolResponse?> {
        try{
            val user_id = session.getAttribute("userId")
            if (user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            var insertCnt = talentService.insertTalent(talentPoolRequest)
            return ResponseEntity(HttpStatus.CREATED)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @PostMapping("/employers/{employerId}/talent/{talentPoolId}")
    fun api_v1_employers_talent_edit(@PathVariable talentPoolId: Int, @PathVariable employerId: Int, @RequestBody talentPoolRequest: TalentPoolRequest, session: HttpSession): ResponseEntity<TalentPoolResponse?>{
        try{
            val user_id = session.getAttribute("userId")
            if (user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            talentPoolRequest.employerId = employerId
            talentPoolRequest.talentPoolId = talentPoolId
            var rst_val = talentService.updateTalent(talentPoolRequest)
            return ResponseEntity(HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @GetMapping("/employers/{employerId}/talent/{talentPoolId}")
    fun api_v1_employers_talent_view(@PathVariable talentPoolId: Int, @PathVariable employerId: Int, @RequestBody talentPoolRequest: TalentPoolRequest, session: HttpSession): ResponseEntity<TalentPoolResponse?>{
        try{
            val user_id = session.getAttribute("userId")
            if (user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            talentPoolRequest.employerId = employerId
            talentPoolRequest.talentPoolId = talentPoolId
            var rst_val = talentService.getTalentInfo(talentPoolRequest)
            return ResponseEntity(HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @DeleteMapping("/employers/{employerId}/talent/{talentPoolId}")
    fun api_v1_employers_talent_delete(@PathVariable talentPoolId: Int, @PathVariable employerId: Int, session: HttpSession): ResponseEntity<TalentPoolResponse?>{
        try{
            val user_id = session.getAttribute("userId")
            if (user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            var talentPoolRequest = TalentPoolRequest()
            talentPoolRequest.employerId = employerId
            talentPoolRequest.talentPoolId = talentPoolId
            var rst_val = talentService.deleteTalent(talentPoolRequest)
            return ResponseEntity(HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    fun null_checker_for_string(s: Any?): String{
        if(s == null){
            return ""
        }else{
            return s as String
        }
    }
    fun getBetweenPeriod(career_start_date:CharSequence, career_end_date:CharSequence):Period?{
        var period: Period? = null
        try{
            var career_start_date_local = LocalDate.parse(career_start_date, DateTimeFormatter.ISO_DATE)
            var career_end_date_local = LocalDate.parse(career_end_date, DateTimeFormatter.ISO_DATE)
            period = Period.between(career_start_date_local, career_end_date_local)
        }catch (e: IOException){
            return null
        }catch (e: DateTimeParseException){
            return null
        }
        return period
    }
    fun getOffSetNumb(page: Int, size: Int):Int{
        return (page - 1) * size
    }
    /**
     * 생년월일을 기준으로 현재 나이 계산
     * @param unix unixtimestamp
     */
    fun calculateAge(date: Date?): Int {
        val birthCalendar = Calendar.getInstance()
        birthCalendar.time = date ?: Date()
        val current = Calendar.getInstance()
        val currentYear = current[Calendar.YEAR]
        val currentMonth = current[Calendar.MONTH]
        val currentDay = current[Calendar.DAY_OF_MONTH]
        var age = currentYear - birthCalendar[Calendar.YEAR]
        if (birthCalendar[Calendar.MONTH] * 100 +
            birthCalendar[Calendar.DAY_OF_MONTH] > currentMonth * 100 + currentDay
        ) age--
        return age
    }
    fun getBirthToAge(sdf: SimpleDateFormat, user_birth:Any): Int{
        var now_age = 38
        try{
            val theDate = sdf.parse(user_birth.toString())
            now_age = calculateAge(theDate)
        }catch (e: StringIndexOutOfBoundsException){
            return 38
        }catch (e: ParseException){
            return 38
        }catch (e: NumberFormatException){
            return 38
        }catch (e: IOException){
            return 38
        }
        return now_age
    }
    fun intToBoolean(s: Any?): Boolean{
        if(s == null || s == 0){
            return false
        }else{
            return true
        }
    }
}