package com.yourjob.backend.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class GlobalCorsConfig {
    @Bean
    fun corsConfigurer(): WebMvcConfigurer {
        val allowedOriginsEnv = System.getenv("CORS_ALLOWED_ORIGINS") ?: "*"
        val allowedOrigins = allowedOriginsEnv.split(",").map { it.trim() }.toTypedArray()
        return object : WebMvcConfigurer {
            override fun addCorsMappings(registry: CorsRegistry) {
                registry.addMapping("/**")
                    .allowedOriginPatterns(*allowedOrigins)
                    .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true)
            }
        }
    }
}
