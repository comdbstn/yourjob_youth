package com.yourjob.bff.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono

@Service
class TalentPoolService(private val webClient: WebClient) {

    @Value("\${backend.url:http://localhost:8082}")
    lateinit var backendUrl: String

    fun getTalentPool(): Mono<Any> {
        return webClient.get()
            .uri("$backendUrl/api/v1/talent-pool")
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun addTalentPoolItem(item: Any): Mono<Any> {
        return webClient.post()
            .uri("$backendUrl/api/v1/talent-pool")
            .bodyValue(item)
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun deleteTalentPoolItem(id: Int): Mono<Void> {
        return webClient.delete()
            .uri("$backendUrl/api/v1/talent-pool/$id")
            .retrieve()
            .bodyToMono(Void::class.java)
    }
}
