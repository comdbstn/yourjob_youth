package com.yourjob.bff.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono

@Service
class ResumesService(private val webClient: WebClient) {

    // 백엔드 API URL: 환경변수 또는 application.yml에서 주입받습니다.
    @Value("\${backend.url:http://localhost:8082}")
    lateinit var backendUrl: String

    fun getResumes(): Mono<Any> {
        return webClient.get()
            .uri("$backendUrl/api/v1/resumes")
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun createResume(resume: Any): Mono<Any> {
        return webClient.post()
            .uri("$backendUrl/api/v1/resumes")
            .bodyValue(resume)
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun getResumeDetail(id: Int): Mono<Any> {
        return webClient.get()
            .uri("$backendUrl/api/v1/resumes/$id")
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun updateResume(id: Int, resume: Any): Mono<Any> {
        return webClient.put()
            .uri("$backendUrl/api/v1/resumes/$id")
            .bodyValue(resume)
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun deleteResume(id: Int): Mono<Void> {
        return webClient.delete()
            .uri("$backendUrl/api/v1/resumes/$id")
            .retrieve()
            .bodyToMono(Void::class.java)
    }
}
