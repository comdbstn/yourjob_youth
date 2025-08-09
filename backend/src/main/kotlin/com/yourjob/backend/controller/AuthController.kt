package com.yourjob.backend.controller

import com.google.gson.Gson
import com.yourjob.backend.entity.*
import com.yourjob.backend.service.AuthService
import com.yourjob.backend.service.CorpmemService
import com.yourjob.backend.service.FileUtilService
import com.yourjob.backend.service.mdms.OperationDataService
import com.yourjob.backend.util.FileUtils
import com.yourjob.backend.util.JwtUtil
import com.yourjob.backend.util.SessionTracker
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

import java.io.IOException
import java.time.LocalDate
import java.util.HashMap
import java.security.MessageDigest

data class SessionInfo(
    val userId: Int,
    val UserType: String
)

@RestController
@RequestMapping("/api/v1/auth")
class AuthController (
    private var authService: AuthService,
    private var corpmemService: CorpmemService,
    private var fileUtilService: FileUtilService,
    private var fileUtils: FileUtils,
    private val jwtUtil: JwtUtil,
    private var operationDataService: OperationDataService,
){

    private var save_path: String = "uploads/corpmem"
    var company_type_array = arrayOf("large_company", "medium_company", "public_company", "foreign_company", "mid_sized_company", "non_profit", "startup", "financial", "hospital", "student_org", "other")

    @PostMapping("/signup")
    fun api_v1_auth_signup(@RequestBody signupRequest: SignupRequest): ResponseEntity<SignupResponse?> {
        try {
            // 같은 이메일로 되어있는 데이터가 있는지 확인
            var userCnt = authService.getUserCntByEmail(signupRequest) ?: 0
            if (userCnt == 0) {
                signupRequest.userType = UserType.JOB_SEEKER.name

                // visa 목록을 처리 - null이 아닌 항목만 필터링하고 문자열로 변환
                if (signupRequest.visa != null && signupRequest.visa!!.isNotEmpty()) {
                    signupRequest.visa = signupRequest.visa!!.filterNotNull()
                    // visa 목록을 쉼표로 구분된 문자열로 변환하여 저장
                    signupRequest.visaString = signupRequest.visa!!.joinToString(",")
                }
                signupRequest.phoneNumber = signupRequest.phone

                var psswd = signupRequest.password
                var accntId = signupRequest.email

                val hashedPassword = hashPassword(password = psswd, accountId = accntId)
                signupRequest.password = hashedPassword

                // salt_yn = > y
                //

                var inserted_id = authService.insertUser(signupRequest)

                var signupResponse = SignupResponse()
                signupResponse.userId = signupRequest.id
                signupResponse.email = signupRequest.email
                signupResponse.userType = UserType.JOB_SEEKER.name
                return ResponseEntity(signupResponse, HttpStatus.CREATED)
            } else {
                return ResponseEntity(HttpStatus.CONFLICT)
            }

        } catch (e: IOException) {
            e.printStackTrace() // 디버깅을 위해 추가
            return ResponseEntity(HttpStatus.BAD_REQUEST)
        }
    }

    @PostMapping("/admin/create-session")
    fun createAdminSession(
        request: HttpServletRequest,
        @RequestBody sessionData: Map<String, Any>
    ): ResponseEntity<Any> {
        try {
            val userType = sessionData["userType"] as? String

            // ADMIN 타입만 허용
            if (userType != "ADMIN") {
                return ResponseEntity.status(403).body(mapOf("error" to "Only ADMIN type allowed"))
            }

            val session = request.getSession(true)

            // 세션에 데이터 설정
            session.setAttribute("userId", sessionData["userId"])
            session.setAttribute("accountId", sessionData["accountId"])
            session.setAttribute("userType", sessionData["userType"])
            session.setAttribute("userName", sessionData["userName"])
            session.setAttribute("userCompanyName", sessionData["userCompanyName"])

            // 세션 트래커에 추가
            SessionTracker.sessions[session.id] = session

            return ResponseEntity.ok(mapOf(
                "success" to true,
                "sessionId" to session.id,
                "message" to "Admin session created successfully"
            ))
        } catch (e: Exception) {
            return ResponseEntity.status(500).body(mapOf("error" to e.message))
        }
    }


    @GetMapping("/auth/session-check")
    fun checkSession(request: HttpServletRequest): ResponseEntity<Any> {
        val session = request.getSession(false)
        val userId = session?.getAttribute("userId") as? Int
        val userType = session?.getAttribute("userType") as? String
        return if (userId != null && userType != null) {
            ResponseEntity.ok(SessionInfo(userId, userType))
        } else {
            ResponseEntity.status(401).build()
        }
    }
    @PostMapping("/login")
    fun api_v1_auth_login(request: HttpServletRequest, @RequestBody loginRequest: LoginRequest) : ResponseEntity<LoginResponse?> {
        try {
            //입력한 이메일로 비밀번호 정보를 가져온다.
            var result_map = mutableMapOf<String, Any>()
            result_map = authService.getUserInfoByEmail(loginRequest)
            if(result_map != null) {

                var input_email = loginRequest.email.toString()
                var input_pwd = loginRequest.password.toString()

                var user_info_password_hash = result_map["password_hash"].toString()
                println("입력한 비밀번호 : " + input_pwd)
                println("기존 유저정보 비밀번호 : " + user_info_password_hash)

                if(result_map["is_banned"].toString() == "true") {
                    return ResponseEntity(HttpStatus.LOCKED)
                }

                var isLogin = false
                val saltYn = result_map["salt_yn"]?.toString() ?: "N"

                val hashedPassword = hashPassword(password = input_pwd, accountId = input_email)
                if (saltYn == "Y"){
                    if (user_info_password_hash == hashedPassword){
                        isLogin = true
                    }
                }else {
                    // 기존 암호 hash 적용
                    if (user_info_password_hash == input_pwd){
                        result_map = authService.getUserInfoByEmail(loginRequest)
                        var nMap3= mutableMapOf<String, Any>()
                        nMap3.put("input_email", input_email)
                        nMap3.put("hashedPassword", hashedPassword)
                        nMap3.put("saltYn", "Y")
                        val udtresult = authService.updateUsersHashedPwd(nMap3)
                        if (udtresult > 0){
                            isLogin = true
                        }
                    }
                }


                if (isLogin == true) {
                    val userId = result_map["user_id"].toString()
                    val userType = result_map["user_type"]

                    var token = jwtUtil.generateToken(userId, userType.toString())


                    //println("입력한 비밀번호와 일치 하므로 로그인 성공으로 판단")
                    var loginResponse = LoginResponse()
                    loginResponse.token = token
                    loginResponse.userId = userId.toInt()
                    loginResponse.accountId = result_map["account_id"].toString()
                    loginResponse.userType = userType.toString()
                    if(result_map["user_type"].toString().uppercase() != "JOB_SEEKER") {
                        return ResponseEntity(HttpStatus.FORBIDDEN)
                    }

                    val session = request.getSession(true)
                    session.setAttribute("userId", result_map["user_id"])
                    session.setAttribute("accountId", result_map["account_id"])
                    session.setAttribute("userType", result_map["user_type"])
                    session.setAttribute("userName", result_map["name"])
                    session.setAttribute("userCompanyName", result_map["company_name"])

                    SessionTracker.sessions[session.id] = session
                    return ResponseEntity(loginResponse, HttpStatus.OK)
                } else {
                    //println("비밀번호 불일치") status 403
                    return ResponseEntity(HttpStatus.FORBIDDEN)
                }
            }
            //입력한 비밀번호와 일치여부를 판단한다.
            //is same password ??
            return ResponseEntity(HttpStatus.NOT_FOUND)
        }catch (e : IOException){
            return ResponseEntity(HttpStatus.BAD_REQUEST)
        }
    }

    @PostMapping("/send-verification")
    fun sendVerificationCode(@RequestBody request: Map<String, String>, session: HttpSession): ResponseEntity<Map<String, String>> {
        val email = request["email"] ?: return ResponseEntity(HttpStatus.BAD_REQUEST)

        try {
            authService.generateVerificationCode(email, session)
            return ResponseEntity(mapOf("message" to "인증코드가 메일로 발송되었습니다"), HttpStatus.OK)
        } catch (e: Exception) {
            return ResponseEntity(mapOf("error" to e.message.toString()), HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @PostMapping("/verify-code")
    fun verifyCode(@RequestBody request: Map<String, String>, session: HttpSession): ResponseEntity<Map<String, Any>> {
        val email = request["email"] ?: return ResponseEntity(mapOf("error" to "이메일이 필요합니다"), HttpStatus.BAD_REQUEST)
        val code = request["code"] ?: return ResponseEntity(mapOf("error" to "코드가 필요합니다"), HttpStatus.BAD_REQUEST)

        val isValid = authService.verifyCode(email, code, session)

        if (isValid) {
            return ResponseEntity(mapOf("verified" to true, "message" to "이메일 인증 성공"), HttpStatus.OK)
        }

        return ResponseEntity(mapOf("verified" to false, "message" to "인증코드가 만료되었거나 일치하지 않습니다"), HttpStatus.BAD_REQUEST)
    }

    @PostMapping("/logout")
    fun api_v1_auth_logout(request: HttpServletRequest) : ResponseEntity<LoginResponse?> {
        try {
            var se = request.getSession(false)
            if(se != null) {
                se.invalidate()
            }
            //입력한 비밀번호와 일치여부를 판단한다.
            //is same password ??
            return ResponseEntity(HttpStatus.OK)
        }catch (e : IOException){
            return ResponseEntity(HttpStatus.BAD_REQUEST)
        }
    }

    @PostMapping("/findid")
    fun findId(@RequestBody request: FindIdRequest): ResponseEntity<FindIdResponse> {
        // TODO: Implement findId logic
        return ResponseEntity.ok(FindIdResponse(foundId = "abcd"))
    }

    @GetMapping("/joincomplete")
    fun joinComplete(): ResponseEntity<JoinCompleteResponse> {
        return ResponseEntity.ok(JoinCompleteResponse("가입을 축하드립니다."))
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
            operationData.level1
        } catch (e: Exception) {
            null
        }
    }

    @PostMapping("/corpjoin")
    fun api_v1_auth_corpjoin(@RequestParam data: String, @RequestParam businessCertificate: MultipartFile?, session: HttpSession): ResponseEntity<Any> {
        try {
            var jobRequest: Map<String, Any> = Gson().fromJson(data, HashMap<String, Any>().javaClass)

            // 이메일 인증 확인
            val managerEmail = jobRequest["managerEmail"] as? String ?: return ResponseEntity(mapOf("error" to "Email is required"), HttpStatus.BAD_REQUEST)
            val isVerifiedInSession = session.getAttribute("email_verified_${managerEmail}") as? Boolean
            val isVerifiedInDB = authService.isEmailVerified(managerEmail)

            if (isVerifiedInSession != true && isVerifiedInDB != true) {
                return ResponseEntity(mapOf("error" to "Email verification required"), HttpStatus.UNAUTHORIZED)
            }

            var corpLoginRequest = CorpLoginRequest()
            corpLoginRequest.accountId = jobRequest["username"] as String
            var corpInfo = authService.selectCorpUserCnt(corpLoginRequest)
            if (corpInfo != null && corpInfo > 0) {
                return ResponseEntity(jobRequest["username"] as String, HttpStatus.CONFLICT)
            }

            // 기업 사용자 데이터 삽입
            var corpJoinRequest = CorpJoinRequest()
            corpJoinRequest.accountId = jobRequest["username"] as String
            corpJoinRequest.password = jobRequest["password"] as String
            corpJoinRequest.usertype = UserType.EMPLOYER.name
            corpJoinRequest.managerName = jobRequest["managerName"] as String
            corpJoinRequest.managerPhone = jobRequest["managerPhone"] as String
            corpJoinRequest.managerEmail = jobRequest["managerEmail"] as String
            corpJoinRequest.companyName = jobRequest["companyName"] as String
            corpJoinRequest.businessRegistrationNumber = jobRequest["businessNumber"] as String
            corpJoinRequest.representative = jobRequest["representative"] as String

            // level1 코드를 operation_data_id로 변환
            val level1Code = jobRequest["companyType"] as String
            val operationDataId = getOperationDataIdByLevel1Code(level1Code)

            if (operationDataId != null) {
                corpJoinRequest.corporateType = operationDataId
            } else {
                // 변환에 실패한 경우 기존 방식으로 처리
                val companyTypeIndex = company_type_array.indexOf(level1Code)
                corpJoinRequest.corporateType = if (companyTypeIndex >= 0) companyTypeIndex.toString() else "10" // 기타로 처리
            }

            corpJoinRequest.employeeCount = jobRequest["employeeCount"].toString().toDoubleOrNull()?.toInt() ?: 0
            corpJoinRequest.capital = jobRequest["capital"]?.toString() ?: "0"
            corpJoinRequest.revenue = jobRequest["revenue"]?.toString() ?: "0"
            corpJoinRequest.netIncome = jobRequest["profit"]?.toString() ?: "0"

            val insertCnt = authService.insertCorpUser(corpJoinRequest)
            System.out.println("기업회원가입 생성 갯수 : " + insertCnt)
            if (insertCnt != null) {
                if (insertCnt <= 0) {
                    return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
                }
            }

            // 생성된 사용자 정보 조회
            val createdUser = authService.selectCorpUser(corpLoginRequest)
                ?: return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)

            // 파일 업로드 처리
            var corpcertImgIdx = 0
            if (businessCertificate != null) {
                val fileTyp = "corpcert"
                val localDate: LocalDate = LocalDate.now()
                val todaydate = localDate.toString()

                val uuid = fileUtils.fileSave(rootpath = save_path, type = fileTyp, yeardate = todaydate, file = businessCertificate)
                val fileNm = businessCertificate.originalFilename ?: "unnamed"
                val fileExt = fileNm.substring(fileNm.lastIndexOf("."))

                val imageUrl = fileUtils.getFileUrl(save_path, fileTyp, todaydate, uuid, fileNm)

                val mMap = mutableMapOf<String, Any>(
                    "fileidx" to 0,
                    "user_id" to (createdUser.userid ?: return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)),
                    "type" to fileTyp,
                    "year_date" to todaydate,
                    "file_name" to fileNm,
                    "file_ext" to fileExt,
                    "file_path_s3" to imageUrl
                )
                fileUtilService.insertJobResumeFileData(mMap)
                corpcertImgIdx = mMap["fileidx"] as Int
            }

            // 파일 인덱스 설정
            if (corpcertImgIdx > 0) {
                corpJoinRequest.corpcertImgidx = corpcertImgIdx
                var mMap2 = mutableMapOf<String, Any>()
                mMap2.put("userId", createdUser.userid.toString().toInt())
                mMap2.put("corpcertImgidx", corpcertImgIdx)
                corpmemService.updateCorpCertImgIdx(mMap2)
            }

            return ResponseEntity(HttpStatus.CREATED)
        } catch (e: IOException) {
            return ResponseEntity(HttpStatus.BAD_REQUEST)
        }
    }

    @PostMapping("/corplogin")
    fun api_v1_auth_corplogin(session: HttpSession, @RequestBody loginRequest: LoginRequest) : ResponseEntity<LoginResponse?> {
        try {
            //입력한 이메일로 비밀번호 정보를 가져온다.
            var result_map = mutableMapOf<String, Any>()
            result_map = authService.getUserInfoByEmail(loginRequest)
            if(result_map != null) {
                var user_info_password_hash = result_map["password_hash"].toString()
                val input_email = loginRequest.email.toString()
                val input_pwd = loginRequest.password.toString()

                if(result_map["is_banned"].toString() == "true") {
                    return ResponseEntity(HttpStatus.LOCKED)
                }

                var isLogin = false
                val saltYn = result_map["salt_yn"]?.toString() ?: "N"

                val hashedPassword = hashPassword(password = input_pwd, accountId = input_email)
                if (saltYn == "Y"){
                    if (user_info_password_hash == hashedPassword){
                        isLogin = true
                    }
                }else {
                    // 기존 암호 hash 적용
                    if (user_info_password_hash == input_pwd){
                        result_map = authService.getUserInfoByEmail(loginRequest)
                        var nMap3= mutableMapOf<String, Any>()
                        nMap3.put("input_email", input_email)
                        nMap3.put("hashedPassword", hashedPassword)
                        nMap3.put("saltYn", "Y")
                        val udtresult = authService.updateUsersHashedPwd(nMap3)
                        if (udtresult > 0){
                            isLogin = true
                        }
                    }
                }

                if (isLogin) {

                    val userId = result_map["user_id"].toString()
                    val userType = result_map["user_type"]

                    var token = jwtUtil.generateToken(userId, userType.toString())

                    //println("입력한 비밀번호와 일치 하므로 로그인 성공으로 판단")
                    var loginResponse = LoginResponse()
                    loginResponse.token = token
                    loginResponse.userId = result_map["user_id"].toString().toInt()
                    loginResponse.accountId = result_map["account_id"].toString()
                    loginResponse.userType = result_map["user_type"].toString()
                    if(result_map["user_type"].toString().uppercase() != "COMPANY" && result_map["user_type"].toString().uppercase() != "COMPANY_EXCEL" && result_map["user_type"].toString().uppercase() != "EMPLOYER" ) {
                        return ResponseEntity(HttpStatus.FORBIDDEN)
                    }
                    session.setAttribute("userId", result_map["user_id"])
                    session.setAttribute("accountId", result_map["account_id"])
                    session.setAttribute("userType", result_map["user_type"])
                    session.setAttribute("userName", result_map["name"])
                    session.setAttribute("userCompanyName", result_map["company_name"])
                    return ResponseEntity(loginResponse, HttpStatus.OK)
                } else {
                    //println("비밀번호 불일치") status 403
                    return ResponseEntity(HttpStatus.FORBIDDEN)
                }
            }
            //입력한 비밀번호와 일치여부를 판단한다.
            //is same password ??
            return ResponseEntity(HttpStatus.NOT_FOUND)
        }catch (e : IOException){
            return ResponseEntity(HttpStatus.BAD_REQUEST)
        }
    }

    @PostMapping("/adminlogin")
    fun api_v1_auth_adminlogin(request: HttpServletRequest, session: HttpSession, @RequestBody loginRequest: LoginRequest) : ResponseEntity<LoginResponse?> {
        try {
            //입력한 이메일로 비밀번호 정보를 가져온다.
            var result_map = mutableMapOf<String, Any>()
            result_map = authService.getUserInfoByEmail(loginRequest)
            if(result_map != null) {
                var user_info_password_hash = result_map["password_hash"].toString()
                val input_email = loginRequest.email.toString()
                val input_pwd = loginRequest.password.toString()

                if(result_map["is_banned"].toString() == "true") {
                    return ResponseEntity(HttpStatus.LOCKED)
                }

                var isLogin = false
                val saltYn = result_map["salt_yn"]?.toString() ?: "N"

                val hashedPassword = hashPassword(password = input_pwd, accountId = input_email)
                if (saltYn == "Y"){
                    if (user_info_password_hash == hashedPassword){
                        isLogin = true
                    }
                }else {
                    // 기존 암호 hash 적용
                    if (user_info_password_hash == input_pwd){
                        result_map = authService.getUserInfoByEmail(loginRequest)
                        var nMap3= mutableMapOf<String, Any>()
                        nMap3.put("input_email", input_email)
                        nMap3.put("hashedPassword", hashedPassword)
                        nMap3.put("saltYn", "Y")
                        val udtresult = authService.updateUsersHashedPwd(nMap3)
                        if (udtresult > 0){
                            isLogin = true
                        }
                    }
                }

                if (isLogin) {

                    val userId = result_map["user_id"].toString()
                    val userType = result_map["user_type"]

                    var token = jwtUtil.generateToken(userId, userType.toString())

                    //println("입력한 비밀번호와 일치 하므로 로그인 성공으로 판단")
                    var loginResponse = LoginResponse()
                    loginResponse.token = token
                    loginResponse.userId = userId.toInt()
                    loginResponse.accountId = result_map["account_id"].toString()
                    loginResponse.userType = userType.toString()
                    if(result_map["user_type"].toString().uppercase() != "ADMIN") {
                        return ResponseEntity(HttpStatus.FORBIDDEN)
                    }

                    val session = request.getSession(true)
                    session.setAttribute("userId", result_map["user_id"])
                    session.setAttribute("accountId", result_map["account_id"])
                    session.setAttribute("userType", result_map["user_type"])
                    session.setAttribute("userName", result_map["name"])
                    session.setAttribute("userCompanyName", result_map["company_name"])

                    return ResponseEntity(loginResponse, HttpStatus.OK)
                } else {
                    //println("비밀번호 불일치") status 403
                    return ResponseEntity(HttpStatus.FORBIDDEN)
                }
            }
            //입력한 비밀번호와 일치여부를 판단한다.
            //is same password ??
            return ResponseEntity(HttpStatus.NOT_FOUND)
        }catch (e : IOException){
            return ResponseEntity(HttpStatus.BAD_REQUEST)
        }
    }

    @PostMapping("/findCorpId")
    fun findCorpId(@RequestBody request: FindCorpIdRequest): ResponseEntity<Map<String, Any>> {
        val name = request.name
        val email = request.email

        if (name.isNullOrBlank() || email.isNullOrBlank()) {
            return ResponseEntity(mapOf("success" to false, "message" to "이름과 이메일을 모두 입력해주세요."), HttpStatus.BAD_REQUEST)
        }

        val foundId = authService.findIdByNameAndEmail(name, email)

        return if (foundId != null) {
            ResponseEntity(mapOf("success" to true, "foundId" to foundId), HttpStatus.OK)
        } else {
            ResponseEntity(mapOf("success" to false, "message" to "일치하는 계정을 찾을 수 없습니다."), HttpStatus.NOT_FOUND)
        }
    }

    @PostMapping("/sendCorpPassword")
    fun sendTemporaryPassword(@RequestBody request: Map<String, String>): ResponseEntity<Map<String, Any>> {
        val accountId = request["id"] ?: return ResponseEntity(mapOf("success" to false, "message" to "아이디를 입력해주세요."), HttpStatus.BAD_REQUEST)
        val email = request["email"] ?: return ResponseEntity(mapOf("success" to false, "message" to "이메일을 입력해주세요."), HttpStatus.BAD_REQUEST)

        val success = authService.resetPassword(accountId, email)

        return if (success) {
            ResponseEntity(mapOf("success" to true, "message" to "임시 비밀번호가 이메일로 발송되었습니다."), HttpStatus.OK)
        } else {
            ResponseEntity(mapOf("success" to false, "message" to "일치하는 계정을 찾을 수 없습니다."), HttpStatus.NOT_FOUND)
        }
    }

    fun hashPassword(password: String, accountId: String): String {
        val combined = password + accountId  // accountId = salt
        val bytes = MessageDigest.getInstance("SHA-256")
            .digest(combined.toByteArray(Charsets.UTF_8))
        return bytes.joinToString("") { "%02x".format(it) }
    }

}
