package com.yourjob.backend.controller.oauth

import com.yourjob.backend.entity.oauth.OAuthLoginRequest
import com.yourjob.backend.entity.oauth.OAuthLoginResponse
import com.yourjob.backend.service.AuthService
import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import java.net.URI
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.util.*

@RestController
@RequestMapping("/api/v1/oauth")
class OAuthController(
    private val authService: AuthService
) {

    @GetMapping("/authorization/{provider}")
    fun redirectToOAuthProvider(
        @PathVariable provider: String,
        @RequestParam(name = "redirect_uri", required = true) redirectUri: String?,
        request: HttpServletRequest,
        response: HttpServletResponse
    ): ResponseEntity<Void> {
        val supportedProviders = listOf("google", "kakao", "naver")
        val providerLower = provider.lowercase(Locale.getDefault())

        if (providerLower !in supportedProviders) {
            return ResponseEntity.badRequest().build()
        }

        // redirect_uri를 세션에 저장
        redirectUri?.let {
            request.session.setAttribute("redirect_uri", it)
        }

        // OAuth 인증 엔드포인트로 리다이렉트
        val redirectUrl = "${ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString()}/oauth2/authorization/$providerLower"

        val headers = HttpHeaders()
        headers.location = URI(redirectUrl)
        return ResponseEntity.status(HttpStatus.FOUND).headers(headers).build()
    }
}