package com.yourjob.backend.service
import com.yourjob.backend.entity.*
import com.yourjob.backend.util.JwtUtil

import com.yourjob.backend.entity.LoginRequest
import com.yourjob.backend.entity.LoginResponse
import com.yourjob.backend.entity.CorpJoinRequest
import com.yourjob.backend.entity.CorpLoginRequest
import com.yourjob.backend.entity.SignupRequest
import com.yourjob.backend.entity.SignupResponse
import com.yourjob.backend.entity.User
import com.yourjob.backend.entity.UserType
import com.yourjob.backend.entity.UserRequest
import com.yourjob.backend.entity.UserResponse
import com.yourjob.backend.mapper.AuthMapper
import com.yourjob.backend.mapper.CompanyProfileMapper
import com.yourjob.backend.util.EmailService
import jakarta.servlet.http.HttpSession
import java.util.Random

import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class AuthService (
    private var authMapper: AuthMapper,
    private val companyProfileMapper: CompanyProfileMapper,
    private var jwtUtil: JwtUtil,
    private val emailService: EmailService
) {
    fun selectList(): List<SignupResponse?>?{
        return authMapper.selectList()
    }

    fun insertUser(signupRequest: SignupRequest) : Int?{
        return authMapper.insertUser(signupRequest)
    }
    fun insertCorpUser(corpJoinRequest: CorpJoinRequest): Int?{
        return authMapper.insertCorpUser(corpJoinRequest)
    }
    fun selectCorpUser(corpLoginRequest: CorpLoginRequest): CorpJoinRequest?{
        return authMapper.selectCorpUser(corpLoginRequest)
    }
    fun selectCorpUserCnt(corpLoginRequest: CorpLoginRequest): Int?{
        return authMapper.selectCorpUserCnt(corpLoginRequest)
    }

    fun getUserCntByEmail(signupRequest: SignupRequest) : Int?{
        return authMapper.getUserCntByEmail(signupRequest)
    }

    fun getUserInfoByEmail(loginRequest: LoginRequest): MutableMap<String, Any>{
        return authMapper.getUserInfoByEmail(loginRequest)
    }
    fun getUserInfoByUserId(userid:Int): MutableMap<String, Any>{
        return authMapper.getUserInfoByUserId(userid)
    }
    fun updateUsersProfile(usersProfile: UsersProfile):Int {
        return authMapper.updateUsersProfile(usersProfile)
    }
    fun updateUsersProfileImg(mutableMap: MutableMap<String, Any>):Int {
        return authMapper.updateUsersProfileImg(mutableMap)
    }
    fun updateUsersHashedPwd(mutableMap: MutableMap<String, Any>):Int{
        return authMapper.updateUsersHashedPwd(mutableMap)
    }
    fun updateUsersProfileImgIdx(mutableMap: MutableMap<String, Any>): Int{
        return authMapper.updateUsersProfileImgIdx(mutableMap)
    }

    fun generateVerificationCode(email: String, session: HttpSession): String {
        val verificationCode = String.format("%06d", Random().nextInt(999999))

        session.setAttribute("verification_code_${email}", verificationCode)
        session.setAttribute("verification_code_expiry_${email}", LocalDateTime.now().plusMinutes(5))
        emailService.sendVerificationEmail(email, verificationCode)

        return verificationCode
    }

    fun verifyCode(email: String, code: String, session: HttpSession): Boolean {
        val storedCode = session.getAttribute("verification_code_${email}") as? String
        val expiryTime = session.getAttribute("verification_code_expiry_${email}") as? LocalDateTime

        if (storedCode == code && expiryTime != null && expiryTime.isAfter(LocalDateTime.now())) {
            session.removeAttribute("verification_code_${email}")
            session.removeAttribute("verification_code_expiry_${email}")

            // 세션에 인증 상태 저장
            session.setAttribute("email_verified_${email}", true)

            // 데이터베이스에도 인증 상태 저장
            setEmailVerified(email, true)

            return true
        }

        return false
    }

    fun setEmailVerified(email: String, verified: Boolean) {
        val verifiedAt = LocalDateTime.now()
        authMapper.setEmailVerificationStatus(email, verified, verifiedAt)
    }

    fun isEmailVerified(email: String): Boolean {
        return authMapper.isEmailVerified(email) ?: false
    }

    fun findIdByNameAndEmail(name: String, email: String): String? {
        return authMapper.findIdByNameAndEmail(name, email)
    }

    fun resetPassword(accountId: String, email: String): Boolean {
        // Check if user exists with given id and email
        val userExists = authMapper.checkUserExistsByIdAndEmail(accountId, email)

        if (userExists > 0) {
            // Generate a random temporary password (8 characters)
            val chars = ('A'..'Z') + ('a'..'z') + ('0'..'9')
            val tempPassword = (1..8)
                .map { chars.random() }
                .joinToString("")

            // Update the user's password
            authMapper.updatePasswordForUser(accountId, tempPassword)

            // Send email with the temporary password
            emailService.sendTemporaryPassword(email, tempPassword, accountId)

            return true
        }

        return false
    }
}

