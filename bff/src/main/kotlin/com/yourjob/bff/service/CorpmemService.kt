package com.yourjob.bff.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono

@Service
class CorpmemService(private val webClient: WebClient) {

    @Value("\${backend.url:http://localhost:8082}")
    lateinit var backendUrl: String

    fun getMyData(): Mono<Any> {
        return webClient.get()
            .uri("$backendUrl/api/bff/corpmem/mydata")
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun accept(request: Any): Mono<Any> {
        return webClient.post()
            .uri("$backendUrl/api/v1/corpmem/accept")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun getApplicants(): Mono<Any> {
        return webClient.get()
            .uri("$backendUrl/api/v1/corpmem/applicants")
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun getCorpInfo(): Mono<Any> {
        return webClient.get()
            .uri("$backendUrl/api/v1/corpmem/corpinfo")
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun updateCorpInfo(info: Any): Mono<Any> {
        return webClient.put()
            .uri("$backendUrl/api/v1/corpmem/corpinfo")
            .bodyValue(info)
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun filterTalents(request: Any): Mono<Any> {
        return webClient.post()
            .uri("$backendUrl/api/v1/corpmem/talents/filter")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(Any::class.java)
    }
}
