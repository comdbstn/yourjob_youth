package com.yourjob.bff.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient

import java.util.UUID

@Service
class DummyGoogleOAuthService (
    private val webClient: WebClient  
){    
    @Value("\${backend.url:http://localhost:8082}")
    lateinit var backendUrl: String

    fun exchangeCodeForDummyToken(code: String): String {
        val randomId = UUID.randomUUID().toString().substring(0, 8)
        val dummyEmail = "randomuser$randomId@example.com"

        val backendSignupUrl = "$backendUrl/api/v1/auth/oauth2/signup"

        val requestBody = mapOf("email" to dummyEmail)

        webClient.post()
            .uri(backendSignupUrl)
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(String::class.java)
            .block()

        return dummyEmail
    }
}
