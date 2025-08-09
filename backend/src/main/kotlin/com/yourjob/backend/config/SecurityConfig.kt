package com.yourjob.backend.config

import com.yourjob.backend.controller.oauth.CustomOAuth2FailureHandler
import com.yourjob.backend.controller.oauth.OAuth2SuccessHandler
import com.yourjob.backend.service.oauth.CustomOAuth2UserService
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain

@Configuration
class SecurityConfig (
    private val oAuth2UserService: CustomOAuth2UserService,
    private val oAuth2SuccessHandler: OAuth2SuccessHandler,
    private val oAuth2FailureHandler: CustomOAuth2FailureHandler
) {
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            // JWT + 세션 하이브리드이나, 기본은 STATELESS로 두고 필요 API에서 세션 사용
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { requests ->
                requests
                    .requestMatchers(
                        "/", "/*", 
                        "/health", 
                        "/uploads/**",
                        "/swagger-ui/**", 
                        "/v3/api-docs/**",
                        "/api/v1/auth/**"
                    ).permitAll()
                    .anyRequest().authenticated()
            }
            .oauth2Login { oauth2 ->
                oauth2
                    .userInfoEndpoint { endpoint ->
                        endpoint.userService(oAuth2UserService)
                    }
                    .successHandler(oAuth2SuccessHandler)
                    .failureHandler(oAuth2FailureHandler)
            }
        return http.build()
    }
}
