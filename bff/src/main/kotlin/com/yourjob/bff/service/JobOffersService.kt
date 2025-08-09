package com.yourjob.bff.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono

@Service
class JobOffersService(private val webClient: WebClient) {

    @Value("\${backend.url:http://localhost:8082}")
    lateinit var backendUrl: String

    fun getJobOffers(employerId: Int?, jobSeekerId: Int?): Mono<Any> {
        // 간단하게 backend URL을 호출합니다.
        return webClient.get()
            .uri("$backendUrl/api/v1/job-offers")
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun createJobOffer(jobOffer: Any): Mono<Any> {
        return webClient.post()
            .uri("$backendUrl/api/v1/job-offers")
            .bodyValue(jobOffer)
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun updateJobOffer(offerId: Int, jobOffer: Any): Mono<Any> {
        return webClient.put()
            .uri("$backendUrl/api/v1/job-offers/$offerId")
            .bodyValue(jobOffer)
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun deleteJobOffer(offerId: Int): Mono<Void> {
        return webClient.delete()
            .uri("$backendUrl/api/v1/job-offers/$offerId")
            .retrieve()
            .bodyToMono(Void::class.java)
    }
}
