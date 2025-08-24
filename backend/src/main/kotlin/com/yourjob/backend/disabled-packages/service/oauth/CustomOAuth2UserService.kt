package com.yourjob.backend.service.oauth

import com.yourjob.backend.entity.User
import com.yourjob.backend.entity.oauth.OAuthAttributes
import com.yourjob.backend.mapper.AuthMapper
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService
import org.springframework.security.oauth2.core.user.DefaultOAuth2User
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Service
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.oauth2.core.OAuth2Error
import java.time.LocalDateTime
import java.util.*

@Service
class CustomOAuth2UserService(
    private val authMapper: AuthMapper
) : OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    override fun loadUser(userRequest: OAuth2UserRequest): OAuth2User {
        val delegate = DefaultOAuth2UserService()
        val oAuth2User = delegate.loadUser(userRequest)

        val registrationId = userRequest.clientRegistration.registrationId

        val attributes = OAuthAttributes.of(
            registrationId,
            oAuth2User.attributes
        )

        val user = saveOrUpdate(attributes)

        return DefaultOAuth2User(
            Collections.singleton(SimpleGrantedAuthority("ROLE_USER")),
            attributes.attributes,
            attributes.nameAttributeKey
        )
    }

    private fun saveOrUpdate(attributes: OAuthAttributes): MutableMap<String, Any>? {
        // 1. 해당 소셜 provider와 providerId로 가입된 소셜 로그인을 먼저 확인
        val existingSocialUser = authMapper.findByOAuthProviderAndProviderId(attributes.provider, attributes.providerId)
        if (existingSocialUser != null) {
            return existingSocialUser
        }

        // 2. 소셜 로그인 정보가 없는 경우, email을 기준으로 사용자 조회
        val emailUser = authMapper.findByEmail(attributes.email)

        if (emailUser != null) {
            // 기존에 email로 가입되었는데 소셜 로그인 정보가 없는 경우 (즉, email 회원가입 계정)
            if (emailUser["oauthProvider"].toString().isBlank() || emailUser["oauthProvider"].toString().isBlank()) {
                //throw IllegalArgumentException("해당 이메일로 가입한 계정은 소셜 로그인으로 로그인할 수 없습니다.")
                throw OAuth2AuthenticationException(
                    OAuth2Error("invalid_request"),
                    "해당 이메일로 가입한 계정은 소셜 로그인으로 로그인할 수 없습니다."
                )
            }
            // 만약 이미 소셜 로그인 정보가 존재하지만 다른 provider로 가입된 경우도 처리
            if (emailUser["oauthProvider"] != attributes.provider) {
                //throw IllegalArgumentException("이미 다른 소셜 계정으로 가입한 이메일입니다.")
                throw OAuth2AuthenticationException(
                    OAuth2Error("invalid_request"),
                    "이미 다른 소셜 계정으로 가입한 이메일입니다."
                )
            }

            return emailUser
        }

        // 3. 사용자 정보가 전혀 없으면 신규 계정 생성
        val newUser = attributes.toUser()
        authMapper.insertUserFromOAuth(newUser)
        return null
    }
}