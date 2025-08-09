package com.yourjob.bff.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono

@Service
class IntroductionsService(private val webClient: WebClient) {

    @Value("\${backend.url:http://localhost:8082}")
    lateinit var backendUrl: String

    fun getIntroductions(): Mono<Any> {
        return webClient.get()
            .uri("$backendUrl/api/v1/introductions")
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun createIntroduction(intro: Any): Mono<Any> {
        return webClient.post()
            .uri("$backendUrl/api/v1/introductions")
            .bodyValue(intro)
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun getIntroductionDetail(id: Int): Mono<Any> {
        return webClient.get()
            .uri("$backendUrl/api/v1/introductions/$id")
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun updateIntroduction(id: Int, intro: Any): Mono<Any> {
        return webClient.put()
            .uri("$backendUrl/api/v1/introductions/$id")
            .bodyValue(intro)
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun deleteIntroduction(id: Int): Mono<Void> {
        return webClient.delete()
            .uri("$backendUrl/api/v1/introductions/$id")
            .retrieve()
            .bodyToMono(Void::class.java)
    }
}
