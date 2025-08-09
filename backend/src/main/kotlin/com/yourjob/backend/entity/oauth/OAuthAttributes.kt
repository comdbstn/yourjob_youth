package com.yourjob.backend.entity.oauth

import com.yourjob.backend.entity.User
import com.yourjob.backend.entity.UserType
import java.time.LocalDateTime
import java.util.*

class OAuthAttributes(
    val attributes: Map<String, Any>,
    val nameAttributeKey: String,
    val name: String,
    val email: String,
    val picture: String?,
    val provider: String,
    val providerId: String
) {
    companion object {
        fun of(
            registrationId: String,
            attributes: Map<String, Any>
        ): OAuthAttributes {
            return when (registrationId.lowercase(Locale.getDefault())) {
                "google" -> ofGoogle(attributes)
                "kakao" -> ofKakao(attributes)
                "naver" -> ofNaver(attributes)
                else -> throw IllegalArgumentException("Unsupported provider: $registrationId")
            }
        }

        private fun ofGoogle(attributes: Map<String, Any>): OAuthAttributes {

            return OAuthAttributes(
                attributes = attributes,
                nameAttributeKey = "email",
                name = attributes["name"] as String,
                email = attributes["email"] as String,
                picture = attributes["picture"] as? String,
                provider = "google",
                providerId = attributes["sub"] as String
            )
        }

        private fun ofKakao(attributes: Map<String, Any>): OAuthAttributes {
            val kakaoAccount = attributes["kakao_account"] as Map<String, Any>
            val profile = kakaoAccount["profile"] as Map<String, Any>

            return OAuthAttributes(
                attributes = attributes,
                nameAttributeKey = "id",
                //nameAttributeKey = "email",
                name = profile["nickname"] as String,
                //email = kakaoAccount["email"] as? String ?: "",
                //email = kakaoAccount["nickname"] as? String ?: "",
                email = attributes["id"].toString(),
                picture = profile["profile_image_url"] as? String,
                provider = "kakao",
                providerId = attributes["id"].toString()
            )
        }

        private fun ofNaver(attributes: Map<String, Any>): OAuthAttributes {
            val response = if (attributes.containsKey("response")) {
                attributes["response"] as Map<String, Any>
            } else {
                attributes
            }

            return OAuthAttributes(
                attributes = response,
                nameAttributeKey = "email",
                name = response["name"] as String,
                email = response["email"] as String,
                picture = response["profile_image"] as? String,
                provider = "naver",
                providerId = response["id"].toString()
            )
        }

        /*private fun ofApple(attributes: Map<String, Any>): OAuthAttributes {
            val email = attributes["email"] as? String ?: ""
            val name = if (email.isNotEmpty()) email.split("@")[0] else "Apple User"

            return OAuthAttributes(
                attributes = attributes,
                nameAttributeKey = "email",
                name = name,
                email = email,
                picture = null,
                provider = "apple",
                providerId = attributes["id"].toString()
            )
        }*/
    }

    fun toUser(): User {
        return User(
            userType = UserType.JOB_SEEKER, // Default는 JOB_SEEKER
            email = email,
            name = name,
            oauthProvider = provider,
            oauthProviderId = providerId,
            isActive = true,
            isBanned = false,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
    }
}
