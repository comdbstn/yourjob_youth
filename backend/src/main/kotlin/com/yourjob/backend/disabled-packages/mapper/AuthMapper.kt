package com.yourjob.backend.mapper

import com.yourjob.backend.entity.*
import org.apache.ibatis.annotations.*
import org.springframework.stereotype.Repository
import java.time.LocalDateTime


@Repository
@Mapper
interface AuthMapper {
    fun selectList(): List<SignupResponse?>?
    fun insertUser(signupRequest: SignupRequest): Int
    fun insertCorpUser(corpJoinRequest: CorpJoinRequest): Int
    fun selectCorpUser(corpLoginRequest: CorpLoginRequest): CorpJoinRequest
    fun selectCorpUserCnt(corpLoginRequest: CorpLoginRequest): Int
    fun getUserCntByEmail(signupRequest: SignupRequest): Int
    fun getUserInfoByEmail(loginRequest: LoginRequest): MutableMap<String, Any>
    fun getUserInfoByUserId(userid:Int): MutableMap<String, Any>
    fun updateUsersProfile(usersProfile: UsersProfile): Int
    fun updateUsersProfileImgIdx(mutableMap: MutableMap<String, Any>): Int
    fun updateUsersProfileImg(mutableMap: MutableMap<String, Any>): Int
    fun updateUsersHashedPwd(mutableMap: MutableMap<String, Any>): Int

    //OAuth를 위한 추가
    fun findByOAuthProviderAndProviderId(
        @Param("provider") provider: String,
        @Param("providerId") providerId: String
    ): MutableMap<String, Any>?
    fun findByEmail(@Param("email") email: String): MutableMap<String, Any>?
    fun insertUserFromOAuth(user: User): Int

    fun findIdByNameAndEmail(
        @Param("name") name: String,
        @Param("email") email: String
    ): String?

    fun checkUserExistsByIdAndEmail(
        @Param("accountId") accountId: String,
        @Param("email") email: String
    ): Int

    fun updatePasswordForUser(
        @Param("accountId") accountId: String,
        @Param("newPassword") newPassword: String
    ): Int

    @Insert("INSERT INTO email_verifications (email, verified, verified_at) VALUES (#{email}, #{verified}, #{verifiedAt}) ON DUPLICATE KEY UPDATE verified = #{verified}, verified_at = #{verifiedAt}, updated_at = CURRENT_TIMESTAMP")
    fun setEmailVerificationStatus(email: String, verified: Boolean, verifiedAt: LocalDateTime): Int

    @Select("SELECT verified FROM email_verifications WHERE email = #{email}")
    fun isEmailVerified(email: String): Boolean?

    @Delete("DELETE FROM email_verifications WHERE email = #{email}")
    fun deleteEmailVerification(email: String): Int
}
