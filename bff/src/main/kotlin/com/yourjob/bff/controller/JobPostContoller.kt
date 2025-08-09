package com.yourjob.bff.controller

import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation.*
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.http.ResponseEntity

@RestController
@RequestMapping("/api/v1/jobposts")
class JobPostController(private val webClient: WebClient) {

    @Value("\${backend.url:http://localhost:8082}")
    lateinit var backendUrl: String

    @GetMapping("")
    fun getJobList(): ResponseEntity<List<JobDetailItem>> {
        val jobList = webClient.get()
            .uri("$backendUrl/api/v1/jobs")
            .retrieve()
            .bodyToFlux(JobDetailItem::class.java)
            .collectList()
            .block()

        return jobList?.let { ResponseEntity.ok(it) } ?: ResponseEntity.notFound().build()
    }

    @GetMapping("/{jobId}")
    fun getJobDetail(@PathVariable jobId: Int): ResponseEntity<JobDetailItem> {
        val jobDetail = webClient.get()
            .uri("$backendUrl/api/v1/jobs/$jobId")
            .retrieve()
            .bodyToMono(JobDetailItem::class.java)
            .block()

        return jobDetail?.let { ResponseEntity.ok(jobDetail) } ?: ResponseEntity.notFound().build()
    }

    @PostMapping("/{jobId}/scrap")
    fun scrapJob(@PathVariable jobId: Int): ResponseEntity<Void> {
        webClient.post()
            .uri("$backendUrl/api/v1/jobs/$jobId/scrap")
            .retrieve()
            .bodyToMono(Void::class.java)
            .block()
        return ResponseEntity.ok().build()
    }
}

data class JobDetailItem(
    val id: Int,
    val title: String,
    val company: String,
    val location: String,
    val salary: String,
    val experience: String,
    val education: String,
    val language: String,
    val jobType: String,
    val workDays: String,
    val startDate: String,
    val deadline: String,
    val description: String,
    val logo: String?,
    val applyLink: String?
)
