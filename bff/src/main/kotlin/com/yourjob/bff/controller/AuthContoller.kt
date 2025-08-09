package com.yourjob.bff.controller

import com.yourjob.bff.service.DummyGoogleOAuthService

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.*

import org.springframework.web.bind.annotation.*
import org.springframework.web.client.RestTemplate

// TODO: Applied Firebase OAuth2
// import com.google.firebase.FirebaseApp
// import com.google.firebase.auth.FirebaseAuth
import org.springframework.context.annotation.DependsOn
import org.springframework.http.ResponseEntity
import org.springframework.web.reactive.function.client.WebClient
import java.util.Base64


data class CorpJoinRequest(
    val accountId: String,
    val password: String,
    val managerName: String,
    val managerPhone: String,
    val companyName: String,
    val businessRegistrationNumber: String,
    val capital: String,
    val revenue: String,
    val netIncome: String,
    val companyAddress: String,
    val corporateType: Int,
    val employeeCount: Int?
)

data class CorpLoginRequest(
    val accountId: String,
    val password: String
)

data class FindIdRequest(val name: String, val phone: String)
data class FindIdResponse(val foundId: String)
data class JoinCompleteResponse(val message: String)
data class OauthLoginRequest(val email: String)
data class OauthFirebaseRequest(val idToken: String)
data class OauthFirebaseResponse(val token: String)

@RestController
@RequestMapping("/api/v1/auth")
// TODO: Applied Firebase OAuth2
// @DependsOn("firebaseApp") 
class AuthController(
    private val webClient: WebClient,
    // TODO: Applied Firebase OAuth2
    // firebaseApp: FirebaseApp,
    private val dummyGoogleOAuthService: DummyGoogleOAuthService
) {
    private val logger = LoggerFactory.getLogger(AuthController::class.java)

    @Value("\${google.client.id}")
    lateinit var googleClientId: String

    @Value("\${google.client.secret}")
    lateinit var googleClientSecret: String

    @Value("\${google.redirect.uri}")
    lateinit var googleRedirectUri: String

    @Value("\${dummy.oauth.enabled:false}")
    private lateinit var dummyOauthEnabled: String

    @Value("\${backend.url:http://localhost:8082}")
    lateinit var backendUrl: String

    // TODO: Applied Firebase OAuth2
    // private val firebaseAuth: FirebaseAuth = FirebaseAuth.getInstance(firebaseApp)

    @PostMapping("/signup")
    fun signup(@RequestBody signupData: Map<String, String>): ResponseEntity<Any> {
        val backendResponse = webClient.post()
            .uri("$backendUrl/api/v1/auth/signup")
            .bodyValue(signupData)
            .retrieve()
            .bodyToMono(Map::class.java)
            .block()
        return ResponseEntity.ok(backendResponse ?: mapOf("message" to "No response"))
    }

    @PostMapping("/login")
    fun login(@RequestBody loginData: Map<String, String>): ResponseEntity<Any> {
        val backendResponse = webClient.post()
            .uri("$backendUrl/api/v1/auth/login")
            .bodyValue(loginData)
            .retrieve()
            .bodyToMono(Map::class.java)
            .block()
        return ResponseEntity.ok(backendResponse ?: mapOf("message" to "No response"))
    }

    @PostMapping("/oauth2/signup")
    fun oauth2Signup(@RequestBody request: Map<String, String>): ResponseEntity<Any> {
        val backendResponse = webClient.post()
            .uri("$backendUrl/api/v1/auth/oauth2/signup")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(Map::class.java)
            .block()
        return ResponseEntity.ok(backendResponse ?: mapOf("message" to "No response from backend"))
    }

    // TODO: Applied Firebase OAuth2
    // @PostMapping("/oauth2/firebase")
    // fun firebaseOAuthLogin(@RequestBody request: OauthFirebaseRequest): ResponseEntity<Any> {
    //     return try {
    //         val decodedToken = firebaseAuth.verifyIdToken(request.idToken)
    //         val email = decodedToken.email ?: throw Exception("Invalid token")
    //         val backendResponse = webClient.post()
    //             .uri("$backendUrl/api/v1/auth/oauth2/login")
    //             .bodyValue(mapOf("email" to email))
    //             .retrieve()
    //             .bodyToMono(Map::class.java)
    //             .block()
    //         ResponseEntity.ok(backendResponse ?: mapOf("message" to "No response from backend"))
    //     } catch (e: Exception) {
    //         ResponseEntity.badRequest().body(mapOf("message" to e.message.orEmpty()))
    //     }
    // }

    @PostMapping("/oauth2/login")
    fun oauth2Login(@RequestBody request: Map<String, String>): ResponseEntity<Any> {
        val backendResponse = webClient.post()
            .uri("$backendUrl/api/v1/auth/oauth2/login")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(Map::class.java)
            .block()
        return ResponseEntity.ok(backendResponse ?: mapOf("message" to "No response from backend"))
    }

    @PostMapping("/logout")
    fun logout(@RequestHeader("Authorization") token: String?): ResponseEntity<String> {
        return if (token != null) {
            ResponseEntity.ok("Logged out successfully")
        } else {
            ResponseEntity.badRequest().body("Invalid token")
        }
    }

    @PostMapping("/corpjoin")
    fun corpJoin(@RequestBody request: CorpJoinRequest): ResponseEntity<Any> {
        val backendResponse = webClient.post()
            .uri("$backendUrl/api/v1/auth/corpjoin")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(Map::class.java)
            .block()
        return ResponseEntity.ok(backendResponse ?: mapOf("message" to "No response from backend"))
    }

    @PostMapping("/corplogin")
    fun corpLogin(@RequestBody request: CorpLoginRequest): ResponseEntity<Any> {
        val backendResponse = webClient.post()
            .uri("$backendUrl/api/v1/auth/corplogin")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(Map::class.java)
            .block()
        return ResponseEntity.ok(backendResponse ?: mapOf("message" to "No response from backend"))
    }

    @PostMapping("/findid")
    fun findId(@RequestBody request: FindIdRequest): ResponseEntity<FindIdResponse> {
        val backendResponse = webClient.post()
            .uri("$backendUrl/api/v1/auth/findid")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(FindIdResponse::class.java)
            .block()
        return ResponseEntity.ok(backendResponse!!)
    }

    @GetMapping("/joincomplete")
    fun joinComplete(): ResponseEntity<JoinCompleteResponse> {
        val backendResponse = webClient.get()
            .uri("$backendUrl/api/v1/auth/joincomplete")
            .retrieve()
            .bodyToMono(JoinCompleteResponse::class.java)
            .block()
        return ResponseEntity.ok(backendResponse ?: JoinCompleteResponse("가입을 축하드립니다."))
    }

    @GetMapping("/corporate-types")
    fun getCorporateTypes(): ResponseEntity<Any> {
        val backendResponse = webClient.get()
            .uri("$backendUrl/api/v1/corporate-types")
            .retrieve()
            .bodyToMono(List::class.java)
            .block()
        return ResponseEntity.ok(backendResponse ?: listOf<Any>())
    }

    @GetMapping("/google")
    fun googleLogin(): ResponseEntity<String> {
        return if (dummyOauthEnabled.toBoolean()) {
            ResponseEntity.ok("$googleRedirectUri?code=dummy")
        } else {
            val scope = "email profile"
            val googleUrl = "https://accounts.google.com/o/oauth2/auth?" +
                "client_id=$googleClientId" +
                "&redirect_uri=$googleRedirectUri" +
                "&response_type=code" +
                "&scope=$scope"
            ResponseEntity.ok(googleUrl)
        }
    }

    @GetMapping("/callback")
    fun callback(@RequestParam code: String): ResponseEntity<Any> {
        return try {
            val email = obtainEmailFromCode(code)
            ResponseEntity.ok(buildBackendResponse(email))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(mapOf("message" to e.message.orEmpty()))
        }
    }

    private fun obtainEmailFromCode(code: String): String {
        return if (dummyOauthEnabled.toBoolean()) {
            dummyGoogleOAuthService.exchangeCodeForDummyToken(code)
        } else {
            exchangeCodeForGoogleToken(code)
        }
    }

    private fun buildBackendResponse(email: String): Map<String, Any> {
        return mapOf("email" to email, "token" to "dummy-token")
    }

    private fun exchangeCodeForGoogleToken(code: String): String {
        val url = "https://oauth2.googleapis.com/token"

        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_FORM_URLENCODED
        }

        // 요청 바디를 URL 인코딩된 문자열로 구성합니다.
        val body = "code=$code" +
                "&client_id=$googleClientId" +
                "&client_secret=$googleClientSecret" +
                "&redirect_uri=$googleRedirectUri" +
                "&grant_type=authorization_code"

        val entity = HttpEntity(body, headers)
        val restTemplate = RestTemplate()
        val response: ResponseEntity<Map<String, Any>> = restTemplate.exchange(
            url,
            HttpMethod.POST,
            entity,
            object : ParameterizedTypeReference<Map<String, Any>>() {}
        )

        if (response.statusCode != HttpStatus.OK) {
            throw Exception("Google 토큰 교환 실패: ${response.statusCode}")
        }

        val responseBody = response.body ?: throw Exception("응답 바디가 비어 있습니다.")
        val idToken = responseBody["id_token"] as? String
            ?: throw Exception("id_token이 응답에 포함되어 있지 않습니다.")

        return extractEmailFromIdToken(idToken)
            ?: throw Exception("id_token에서 이메일 추출에 실패했습니다.")
    }
    
    private fun extractEmailFromIdToken(idToken: String): String? {
        return try {
            val parts = idToken.split(".")
            if (parts.size != 3) return null
            val payload = String(java.util.Base64.getUrlDecoder().decode(parts[1]))
            val mapper = jacksonObjectMapper()
            val payloadMap: Map<String, Any> = mapper.readValue(payload, object : TypeReference<Map<String, Any>>() {})
            payloadMap["email"] as? String
        } catch (e: Exception) {
            logger.error("idToken에서 이메일 추출 실패", e)
            null
        }
    }
}

