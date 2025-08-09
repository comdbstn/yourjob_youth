package com.yourjob.backend.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class                           WebConfig : WebMvcConfigurer {

    @Value("\${file.upload.dir:/app/uploads}")
    private lateinit var uploadDir: String

    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        // 업로드된 파일에 접근할 수 있는 URL 경로 설정
        registry.addResourceHandler("/uploads/**")
            .addResourceLocations("file:$uploadDir/")
    }
}