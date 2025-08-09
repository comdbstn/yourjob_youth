package com.yourjob.bff.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import org.springframework.web.util.UriBuilder
import java.net.URI

@Service
class JobsService(private val webClient: WebClient) {

    @Value("\${backend.url:http://localhost:8082}")
    lateinit var backendUrl: String

    fun getJobs(
        page: Int,
        size: Int,
        searchType: String?,
        query: String?,
        country: String?,
        location: String?,
        jobType: String?
    ): Mono<Any> {
        return webClient.get()
            .uri { uriBuilder: UriBuilder ->
                uriBuilder
                    .scheme("http")
                    .host(backendUrl.removePrefix("http://"))
                    .path("/api/v1/jobs")
                    .queryParam("page", page)
                    .queryParam("size", size)
                    .apply { if (!searchType.isNullOrEmpty()) queryParam("searchType", searchType) }
                    .apply { if (!query.isNullOrEmpty()) queryParam("query", query) }
                    .apply { if (!country.isNullOrEmpty()) queryParam("country", country) }
                    .apply { if (!location.isNullOrEmpty()) queryParam("location", location) }
                    .apply { if (!jobType.isNullOrEmpty()) queryParam("jobType", jobType) }
                    .build()
            }
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun createJob(job: Any): Mono<Any> {
        return webClient.post()
            .uri("$backendUrl/api/v1/jobs")
            .bodyValue(job)
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun updateJob(jobId: Int, job: Any): Mono<Any> {
        return webClient.put()
            .uri("$backendUrl/api/v1/jobs/$jobId")
            .bodyValue(job)
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun deleteJob(jobId: Int): Mono<Void> {
        return webClient.delete()
            .uri("$backendUrl/api/v1/jobs/$jobId")
            .retrieve()
            .bodyToMono(Void::class.java)
    }

    fun updateJobStatus(jobId: Int, statusUpdate: Map<String, String>): Mono<Any> {
        return webClient.put()
            .uri("$backendUrl/api/v1/jobs/$jobId/status")
            .bodyValue(statusUpdate)
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun searchJobs(
        title: String?,
        location: String?,
        jobType: String?,
        company: String?
    ): Mono<Any> {
        return webClient.get()
            .uri { uriBuilder: UriBuilder ->
                uriBuilder
                    .scheme("http")
                    .host(backendUrl.removePrefix("http://"))
                    .path("/api/v1/jobs/search")
                    .apply { if (!title.isNullOrEmpty()) queryParam("title", title) }
                    .apply { if (!location.isNullOrEmpty()) queryParam("location", location) }
                    .apply { if (!jobType.isNullOrEmpty()) queryParam("jobType", jobType) }
                    .apply { if (!company.isNullOrEmpty()) queryParam("company", company) }
                    .build()
            }
            .retrieve()
            .bodyToMono(Any::class.java)
    }
}
