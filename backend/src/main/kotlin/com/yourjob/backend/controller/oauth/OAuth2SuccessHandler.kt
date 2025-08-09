package com.yourjob.backend.controller.oauth

import com.yourjob.backend.entity.oauth.OAuthAttributes
import com.yourjob.backend.mapper.AuthMapper
import com.yourjob.backend.util.JwtUtil
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder
import java.io.IOException
import java.net.URI

@Component
class OAuth2SuccessHandler(
    private val jwtUtil: JwtUtil,
    private val authMapper: AuthMapper
) : SimpleUrlAuthenticationSuccessHandler() {

    companion object {
        private const val REDIRECT_URI_PARAM_NAME = "redirect_uri"
        //private val DEFAULT_REDIRECT_URI = "http://localhost:3000/oauth2/redirect"
        //private val DEFAULT_REDIRECT_URI = "http://www.urjob.kr/oauth2/redirect"
        private val DEFAULT_REDIRECT_URI = "https://www.urjob.kr/oauth2/redirect"
        private val ALLOWED_REDIRECT_URIS = listOf(
            "http://urjob.kr/oauth2/redirect",
            "http://www.urjob.kr/oauth2/redirect",
            "http://localhost:3000/oauth2/redirect",
            "http://13.125.187.22:3000/oauth2/redirect",
            "https://urjob.kr/oauth2/redirect",
            "https://www.urjob.kr/oauth2/redirect",
            "https://localhost:3000/oauth2/redirect",
            "https://13.125.187.22:3000/oauth2/redirect"
        )
    }

    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication
    ) {
        val oAuth2User = authentication.principal as OAuth2User
        val oAuth2AuthToken = authentication as OAuth2AuthenticationToken

        val attributes = OAuthAttributes.of(
            oAuth2AuthToken.authorizedClientRegistrationId,
            oAuth2User.attributes
        )

        val user = authMapper.findByOAuthProviderAndProviderId(attributes.provider, attributes.providerId)

        val isNewUser = user == null
        if(user == null) {
            throw IllegalArgumentException("No user found after OAuth")
        }

        val userId = user["user_id"].toString()
        val userType = user["user_type"].toString()

        var token = jwtUtil.generateToken(userId, userType)

        // Store userId in HttpSession
        request.session.setAttribute("userId", userId.toInt())
        request.session.setAttribute("userType", userType)

        // 세션에서 리다이렉션 URL 가져오기
        val redirectUri = request.session.getAttribute(REDIRECT_URI_PARAM_NAME) as? String

        val targetUrl = if (redirectUri != null && isAuthorizedRedirectUri(redirectUri)) {
            redirectUri
        } else {
            DEFAULT_REDIRECT_URI
        }

        val finalUrl = UriComponentsBuilder.fromUriString(targetUrl)
            .queryParam("token", token)
            .queryParam("isNewUser", isNewUser)
            .build().toUriString()

        response.sendRedirect(finalUrl)
    }

    private fun isAuthorizedRedirectUri(uri: String): Boolean {
        return ALLOWED_REDIRECT_URIS.any { allowedUri ->
            URI(allowedUri).host == URI(uri).host && URI(allowedUri).port == URI(uri).port
        }
    }
}