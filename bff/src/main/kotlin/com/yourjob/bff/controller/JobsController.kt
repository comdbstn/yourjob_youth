package com.yourjob.bff.controller

import com.yourjob.bff.service.JobsService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/v1/jobs")
class JobsController(private val jobsService: JobsService) {

    @GetMapping
    fun getJobs(
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false) searchType: String?,
        @RequestParam(required = false) query: String?,
        @RequestParam(required = false) country: String?,
        @RequestParam(required = false) location: String?,
        @RequestParam(required = false) jobType: String?
    ): Mono<ResponseEntity<Any>> {
        return jobsService.getJobs(page, size, searchType, query, country, location, jobType)
            .map { ResponseEntity.ok(it) }
    }

    @PostMapping
    fun createJob(@RequestBody job: Any): Mono<ResponseEntity<Any>> {
        return jobsService.createJob(job)
            .map { ResponseEntity.status(201).body(it) }
    }

    @PutMapping("/{jobId}")
    fun updateJob(@PathVariable jobId: Int, @RequestBody job: Any): Mono<ResponseEntity<Any>> {
        return jobsService.updateJob(jobId, job)
            .map { ResponseEntity.ok(it) }
    }

    @DeleteMapping("/{jobId}")
    fun deleteJob(@PathVariable jobId: Int): Mono<ResponseEntity<Void>> {
        return jobsService.deleteJob(jobId)
            .map { ResponseEntity.ok(it) }
    }

    @PutMapping("/{jobId}/status")
    fun updateJobStatus(@PathVariable jobId: Int, @RequestBody statusUpdate: Map<String, String>): Mono<ResponseEntity<Any>> {
        return jobsService.updateJobStatus(jobId, statusUpdate)
            .map { ResponseEntity.ok(it) }
    }

    @GetMapping("/search")
    fun searchJobs(
        @RequestParam(required = false) title: String?,
        @RequestParam(required = false) location: String?,
        @RequestParam(required = false) jobType: String?,
        @RequestParam(required = false) company: String?
    ): Mono<ResponseEntity<Any>> {
        return jobsService.searchJobs(title, location, jobType, company)
            .map { ResponseEntity.ok(it) }
    }
}
