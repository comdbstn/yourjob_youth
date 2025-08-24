package com.yourjob.backend.controller.oauth

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.authentication.AuthenticationFailureHandler
import org.springframework.stereotype.Component
import java.net.URLEncoder

@Component
class CustomOAuth2FailureHandler : AuthenticationFailureHandler {

    override fun onAuthenticationFailure(
        request: HttpServletRequest,
        response: HttpServletResponse,
        exception: AuthenticationException
    ) {
        val errorMessage = URLEncoder.encode(exception.message ?: "소셜 로그인 실패", "UTF-8")

        response.sendRedirect("https://www.urjob.kr/oauth2/redirect?error=$errorMessage")
    }
}