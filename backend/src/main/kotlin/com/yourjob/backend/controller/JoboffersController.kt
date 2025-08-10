package com.yourjob.backend.controller

import com.yourjob.backend.entity.JobOffer
import com.yourjob.backend.entity.JobOfferCreate
import com.yourjob.backend.entity.JobOfferUpdate
import com.yourjob.backend.service.AuthService
import com.yourjob.backend.service.JoboffersService
import com.yourjob.backend.service.ResumeService
import com.yourjob.backend.service.TalentService
import com.yourjob.backend.util.EmailService
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

@RestController
@RequestMapping("/api/v1")
class JoboffersController(
    private var joboffersService: JoboffersService,
    private var talentService: TalentService,
    private var resumeService: ResumeService,
    private var authService: AuthService,
    private var emailService: EmailService
) {

    @GetMapping("/corpmem/position-offer/status")
    fun getPositionOfferStatus(session: HttpSession): ResponseEntity<Map<String, Any>> {
        val userId = session.getAttribute("userId") ?: return ResponseEntity(HttpStatus.UNAUTHORIZED)

        val status = joboffersService.getPositionOfferStatus(userId.toString())
        return ResponseEntity.ok(status)
    }

    @GetMapping("/corpmem/position-offer/check-availability")
    fun checkPositionOfferAvailability(session: HttpSession): ResponseEntity<Map<String, Any>> {
        val userId = session.getAttribute("userId") ?: return ResponseEntity(HttpStatus.UNAUTHORIZED)

        val availability = joboffersService.checkPositionOfferAvailability(userId.toString())
        return ResponseEntity.ok(availability)
    }

    @GetMapping("/corpmem/job-offers")
    fun api_v1_joboffers_list(session: HttpSession, @RequestParam page: Int?, @RequestParam size: Int?, @RequestParam status: String?, @RequestParam keyword: String?): ResponseEntity<Any> {
        var user_id = session.getAttribute("userId")
        if (user_id == null) {
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        var req_page = 1
        var req_size = 10
        if (page != null && page >= 1 && size != null && size > 0) {
            req_page = page
            req_size = size
        }
        var mMap = mutableMapOf<String, Any>()
        mMap.put("userId", user_id)
        mMap.put("size", req_size)
        var offSetNumb = getOffSetNumb(req_page, req_size)
        mMap.put("offSetNumb", offSetNumb)
        mMap.put("employerId", user_id)

        var srchStatus = ""
        if (status != null) {
            if (status == "accept"){
                srchStatus = "ACCEPTED"
            }else if (status == "reject"){
                srchStatus = "REJECTED"
            }else if (status == "none"){
                srchStatus = "PENDING"
            }
            mMap.put("status", srchStatus)
        }

        var jobofferlist = joboffersService.selectJoboffersList(mMap)
        var joboffer_employer_id_list = ArrayList<Int>()
        if (jobofferlist != null) {
            for (joboffer in jobofferlist) {
                if (joboffer != null) {
                    joboffer_employer_id_list.add(joboffer.employerId.toString().toInt())
                }
            }
        }
        var manager = ""
        var proposalDate = ""
        var joboffer_jobseeker_id_list = ArrayList<Int>()
        var joboffer_resume_id_list = ArrayList<Int>()
        if (jobofferlist != null) {
            for (joboffer in jobofferlist) {
                if (joboffer != null) {
                    joboffer_jobseeker_id_list.add(joboffer.jobSeekerId.toString().toInt())
                    if(joboffer.resumeId != null) {
                        joboffer_resume_id_list.add(joboffer.resumeId.toString().toInt())
                    }

                    if (manager == "") {
                        manager = joboffer.manager.toString()
                    }
                    if (proposalDate == "") {
                        proposalDate = joboffer.createdAt.toString()
                    }
                }
            }
        }

        var mMap2 = mutableMapOf<String, Any>()
        if (keyword != null && keyword != "") {
            mMap2.put("keyword", keyword)
        }
        if (status != null){
            mMap2.put("status", srchStatus)
        }
        mMap2.put("offSetNumb", offSetNumb)
        mMap2.put("size", req_size)
        mMap2.put("employerId", user_id)
        if (joboffer_resume_id_list.size > 0) {
            mMap2.put("resume_id_arr", joboffer_resume_id_list)
        }

        val talentList = talentService.selectJobOfferListByEmp(mMap2)
        val talentCnt = talentService.selectTalentSearchListByParamsCnt(mMap2)

        var totalElementCnt = 0
        var list = ArrayList<Any>()
        for (talent in talentList) {
            talent as MutableMap<String, Any>
            if (totalElementCnt <= 0) {
                totalElementCnt = talentCnt
            }
            val resumeid = talent.get("resume_id")
            val jobofferid = talent.get("joboffer_id")
            val jobSeekerId = talent.get("job_seeker_id")
            var user_info = authService.getUserInfoByUserId(jobSeekerId.toString().toInt())

            var nMap = mutableMapOf<String, Any>()
            nMap.put("id", jobofferid.toString().toInt())
            if(resumeid != null) {
                nMap.put("resumeid", resumeid.toString().toInt())
            }
            nMap.put("jobofferid", jobofferid.toString().toInt())
            nMap.put("jobseekerid", jobSeekerId.toString().toInt())
            nMap.put("name", user_info.get("name").toString())
            nMap.put("gender", user_info.get("gender").toString())
            nMap.put("manager", manager)
            nMap.put("proposalDate", talent.get("created_at").toString())
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
            nMap.put("location", "서울")
            var nMap1 = mutableMapOf<String, Any>()
            nMap1.put("school", talent.get("schoolName").toString())
            nMap1.put("degree", talent.get("lastSchool").toString())
            nMap.put("education", nMap1)
            var nMap2 = mutableMapOf<String, Any>()

            nMap2.put("company", null_checker_for_string(talent.get("companyName")))

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
    }

    @GetMapping("/corpmem/job-offers/status")
    fun api_v1_joboffers_status(session: HttpSession): ResponseEntity<Any> {
        var user_id = session.getAttribute("userId")
        if (user_id == null) {
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        var mMap = mutableMapOf<String, Any>()
        mMap.put("employerId", user_id)
        var joboffer_list = joboffersService.selectJoboffersList(mMap)
        var accept_cnt = 0
        var reject_cnt = 0
        var none_cnt = 0
        if (joboffer_list != null) {
            for (joboffer in joboffer_list) {
                if (joboffer != null && joboffer.status != null && joboffer.status == "PENDING") {
                    none_cnt = none_cnt + 1
                } else if (joboffer != null && joboffer.status != null && joboffer.status == "ACCEPTED") {
                    accept_cnt = accept_cnt + 1
                } else if (joboffer != null && joboffer.status != null && joboffer.status == "REJECTED") {
                    reject_cnt = reject_cnt + 1
                } else {
                    none_cnt = none_cnt + 1
                }
            }
        }
        var counts_mMap = mutableMapOf<String, Any>()
        counts_mMap.put("accept", accept_cnt)
        counts_mMap.put("reject", reject_cnt)
        counts_mMap.put("none", none_cnt)
        mMap.put("counts", counts_mMap)

        // 포지션 제안 상품 상태 추가
        val positionOfferStatus = joboffersService.getPositionOfferStatus(user_id.toString())
        mMap.put("positionOfferStatus", positionOfferStatus)

        return ResponseEntity(mMap, HttpStatus.OK)
    }

    @PutMapping("/corpmem/job-offers/{jobofferId}/interview-status")
    fun api_v1_joboffers_status_change(session: HttpSession, @PathVariable jobofferId: Int?, @RequestBody jobOffer: JobOffer): ResponseEntity<Any> {
        var user_id = session.getAttribute("userId")
        if (user_id == null || jobofferId == null) {
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        jobOffer.id = jobofferId
        var mMap = mutableMapOf<String, Any>()
        mMap.put("jobofferId", jobofferId)
        mMap.put("status", jobOffer.status.toString())
        val updateCnt = joboffersService.updateJobofferInterviewStatus(mMap)
        if (updateCnt < 1) {
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
        return ResponseEntity(HttpStatus.OK)
    }

    data class JobOfferCreate(
        val userId: Int,
        val jobPostId: Int,
        val resumeId: Int? = null,
        val position: String,
        val message: String,
        val positionInfo: String? = null,
        val manager: String? = null
    )

    @PostMapping("/corpmem/job-offers")
    fun createJobOffer(@RequestBody request: JobOfferCreate, session: HttpSession): ResponseEntity<Any> {
        try {
            val userId = session.getAttribute("userId")?.toString()
                ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf(
                    "success" to false,
                    "message" to "로그인이 필요합니다."
                ))

            var resumeId = request.userId
            val resumeInfo = resumeService.selectResumeDetail(resumeId.toString().toInt())

            // 구직자 정보 가져오기
            var user_info = authService.getUserInfoByUserId(resumeInfo.jobSeekerId.toString().toInt())
            val email = user_info.get("email").toString()
            val jobSeekerName = user_info.get("name")?.toString()

            // 기업 정보 가져오기
            var company_user_info = authService.getUserInfoByUserId(userId.toInt())
            val companyName = company_user_info.get("companyName")?.toString() ?: "기업"

            var jobOffer = JobOffer().apply {
                employerId = userId.toInt()
                jobSeekerId = resumeInfo.jobSeekerId
                jobPostId = request.jobPostId.toString()
                resumeId = request.userId
                message = request.message
                position = request.position
                positionInfo = request.positionInfo ?: ""
                manager = request.manager ?: "인사팀"
                status = "PENDING"
            }

            jobOffer.resumeId = resumeId

            val offerAvailability = joboffersService.checkPositionOfferAvailability(userId)
            if (offerAvailability["canOffer"] == false) {
                return ResponseEntity.badRequest().body(mapOf(
                    "success" to false,
                    "message" to offerAvailability["reason"]
                ))
            }

            val offerDone = joboffersService.selectJobofferDone(jobOffer)
            if (offerDone != null && !offerDone.isEmpty()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(mapOf(
                    "success" to false,
                    "message" to "이미 제안한 인재입니다."
                ))
            }

            val insertResult = joboffersService.insertJoboffer(jobOffer)

            return if (insertResult > 0) {
                // 포지션 제안 알림 이메일 전송
                try {
                    emailService.sendPositionOfferNotification(
                        toEmail = email,
                        companyName = companyName,
                        position = jobOffer.position ?: request.position,
                        positionInfo = jobOffer.positionInfo,
                        message = jobOffer.message ?: request.message,
                        manager = jobOffer.manager ?: "인사담당자",
                        jobSeekerName = jobSeekerName
                    )
                } catch (e: Exception) {
                    // 이메일 전송 실패해도 포지션 제안은 성공으로 처리
                    // 로그만 남기고 계속 진행
                    println("Failed to send position offer notification email: ${e.message}")
                }

                ResponseEntity.status(HttpStatus.CREATED).body(mapOf(
                    "success" to true,
                    "message" to "포지션 제안이 성공적으로 전송되었습니다."
                ))
            } else {
                ResponseEntity.badRequest().body(mapOf(
                    "success" to false,
                    "message" to "포지션 제안 전송에 실패했습니다."
                ))
            }
        } catch (e: IllegalStateException) {
            return ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to e.message
            ))
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "success" to false,
                "message" to "서버 오류가 발생했습니다: ${e.message}"
            ))
        }
    }

    /*@PostMapping("/corpmem/job-offers")
    fun api_v1_joboffers_insert(session: HttpSession, @RequestBody jobOffer: JobOffer): ResponseEntity<Any> {
        var user_id = session.getAttribute("userId")
        if (user_id == null) {
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }

        // 포지션 제안 가능 여부 확인
        val availability = joboffersService.checkPositionOfferAvailability(user_id.toString())
        if (availability["canOffer"] == false) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                .body(mapOf("error" to availability["reason"]))
        }

        jobOffer.employerId = user_id.toString().toInt()
        var jobSeekerId = jobOffer.jobSeekerId
        if (jobSeekerId == null) {
            jobOffer.jobSeekerId = 30
        }
        var resumeId = jobOffer.userId
        jobOffer.resumeId = resumeId
        val resumeInfo = resumeService.selectResumeDetail(resumeId.toString().toInt())
        jobOffer.jobSeekerId = resumeInfo.jobSeekerId
        jobOffer.employerId = user_id.toString().toInt()
        jobOffer.status = "PENDING"

        var offerDone = joboffersService.selectJobofferDone(jobOffer)
        if (offerDone.isNotEmpty()) {
            return ResponseEntity(HttpStatus.CONFLICT)
        }

        try {
            var insertcnt = joboffersService.insertJoboffer(jobOffer)
            var jobOffer_detail = joboffersService.selectJoboffersInfo(jobOffer.id.toString().toInt())

            // 포지션 제안 상품 상태 추가
            val updatedStatus = joboffersService.getPositionOfferStatus(user_id.toString())

            return ResponseEntity.ok(
                mapOf(
                    "jobOffer" to jobOffer_detail,
                    "positionOfferStatus" to updatedStatus
                )
            )
        } catch (e: IllegalStateException) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                .body(mapOf("error" to e.message))
        }
    }*/

    @DeleteMapping("/corpmem/job-offers")
    fun api_v1_joboffers_delete_by_emp(@RequestBody delMap: MutableMap<String, Any>, session: HttpSession, page: Int?, size: Int?, keyword: String?): ResponseEntity<Any> {
        var user_id = session.getAttribute("userId")
        if (user_id == null) {
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        var talentIds = delMap.get("talentIds")
        talentIds as ArrayList<Int>
        for (offerId in talentIds) {
            var update_cnt = joboffersService.deleteJoboffer(offerId)
        }
        return ResponseEntity(HttpStatus.OK)
    }

    @GetMapping("/job-offers/{offerId}")
    fun api_v1_joboffers_detail(@PathVariable offerId: Int): ResponseEntity<JobOffer> {
        var jobOffer_detail = joboffersService.selectJoboffersInfo(offerId)
        return ResponseEntity(jobOffer_detail, HttpStatus.OK)
    }

    @PutMapping("/job-offers/{offerId}")
    fun api_v1_joboffers_edit(@PathVariable offerId: Int, @RequestBody jobOfferUpdate: JobOfferUpdate): ResponseEntity<JobOffer> {
        jobOfferUpdate.id = offerId
        var update_cnt = joboffersService.updateJoboffer(jobOfferUpdate)
        var jobOffer_detail = joboffersService.selectJoboffersInfo(offerId)
        return ResponseEntity(jobOffer_detail, HttpStatus.OK)
    }

    @DeleteMapping("/job-offers/{offerId}")
    fun api_v1_joboffers_delete(@PathVariable offerId: Int): ResponseEntity<JobOffer> {
        var update_cnt = joboffersService.deleteJoboffer(offerId)
        return ResponseEntity(HttpStatus.OK)
    }

    @GetMapping("/proposals")
    fun api_v1_joboffers_proposals(session: HttpSession, page: Int?, size: Int?, status: String?, keyword: String?): ResponseEntity<Any> {
        val userId = session.getAttribute("userId")
        if (userId == null) {
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        var req_page = 1
        var req_size = 10
        if (page != null && size != null && size > 0) {
            req_page = page
            req_size = size
        }
        var mMap = mutableMapOf<String, Any>()
        var offSetNumb = getOffSetNumb(req_page, req_size)
        mMap.put("offSetNumb", offSetNumb)
        mMap.put("page", page.toString().toInt())
        mMap.put("size", size.toString().toInt())
        mMap.put("jobSeekerId", userId)
        mMap.put("keyword", keyword.toString())
        var jobProposalList = joboffersService.selectJobofferProposalList(mMap)
        var rstList = ArrayList<Any>()
        for (jobProposal in jobProposalList) {
            jobProposal as MutableMap<String, Any>
            var mutableMap = mutableMapOf<String, Any>()
            var proposalId = jobProposal.get("id")
            mutableMap.put("id", proposalId.toString().toInt())
            var proposalDate = jobProposal.get("createdAt")
            mutableMap.put("proposalDate", proposalDate.toString())
            var expiryDate = jobProposal.get("appEndTm")
            mutableMap.put("expiryDate", expiryDate.toString())
            var companyName = jobProposal.get("companyName")
            mutableMap.put("companyName", companyName.toString())
            var position = jobProposal.get("position")
            mutableMap.put("position", position.toString())
            var status = jobProposal.get("status")
            mutableMap.put("status", status.toString())
            rstList.add(mutableMap)
        }
        var jobProposalCnt = joboffersService.selectJobofferProposalCnt(mMap)
        var totalElementCnt = jobProposalCnt
        var resp_mMap = mutableMapOf<String, Any>()
        var totalPages = totalElementCnt / req_size
        if (totalElementCnt % req_size > 0) {
            totalPages = totalPages + 1
        }
        resp_mMap.put("totalPages", totalPages)
        resp_mMap.put("content", rstList.toTypedArray())
        resp_mMap.put("totalElements", totalElementCnt)
        return ResponseEntity(resp_mMap, HttpStatus.OK)
    }

    @GetMapping("/proposals/{proposalId}")
    fun api_v1_joboffers_proposals(@PathVariable proposalId: Int, session: HttpSession, page: Int?, size: Int?, status: String?, keyword: String?): ResponseEntity<Any> {
        var userId = session.getAttribute("userId")
        if (userId == null) {
            return ResponseEntity(HttpStatus.UNAUTHORIZED)
        }
        var mMap = mutableMapOf<String, Any>()
        mMap.put("proposalId", proposalId)
        var jobProposalInfo = joboffersService.selectJobofferProposalInfo(mMap)

        mMap = mutableMapOf<String, Any>()
        mMap.put("id", proposalId)
        mMap.put("title", jobProposalInfo.get("message").toString())
        mMap.put("message", jobProposalInfo.get("message").toString())
        mMap.put("position", jobProposalInfo.get("position").toString())
        mMap.put("positionInfo", jobProposalInfo.get("positionInfo").toString())
        mMap.put("status", jobProposalInfo.get("status").toString())
        mMap.put("manager", jobProposalInfo.get("manager").toString())
        mMap.put("expiryDate", jobProposalInfo.get("appEndTm").toString())
        mMap.put("companyName", jobProposalInfo.get("companyName").toString())

        return ResponseEntity(mMap, HttpStatus.OK)
    }

    @PutMapping("/proposals/{jobofferId}/status")
    fun api_v1_joboffers_proposals_status_set(@PathVariable jobofferId: Int, session: HttpSession, @RequestBody jobOffer: JobOffer): ResponseEntity<Any> {
        var proposalId = jobofferId
        var mMap = mutableMapOf<String, Any>()
        mMap.put("jobofferId", jobofferId)
        mMap.put("status", jobOffer.status.toString())
        if (jobOffer.rejectReason != null && jobOffer.rejectReason!!.length > 0) {
            mMap.put("rejectReason", jobOffer.rejectReason.toString())
        }
        joboffersService.updateJobofferStatus(mMap)

        return ResponseEntity(HttpStatus.OK)
    }

    fun null_checker_for_string(s: Any?): String {
        if (s == null) {
            return ""
        } else {
            return s as String
        }
    }

    fun getOffSetNumb(page: Int, size: Int): Int {
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
    fun getBetweenPeriod(career_start_date:CharSequence, career_end_date:CharSequence): Period?{
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
}