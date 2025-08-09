package com.yourjob.bff.controller

import com.yourjob.bff.service.JobOffersService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/v1/job-offers")
class JobOffersController(private val jobOffersService: JobOffersService) {

    @GetMapping
    fun getJobOffers(
        @RequestParam(required = false) employerId: Int?,
        @RequestParam(required = false) jobSeekerId: Int?
    ): Mono<ResponseEntity<Any>> {
        return jobOffersService.getJobOffers(employerId, jobSeekerId)
            .map { ResponseEntity.ok(it) }
    }

    @PostMapping
    fun createJobOffer(@RequestBody jobOffer: Any): Mono<ResponseEntity<Any>> {
        return jobOffersService.createJobOffer(jobOffer)
            .map { ResponseEntity.status(201).body(it) }
    }

    @PutMapping("/{offerId}")
    fun updateJobOffer(@PathVariable offerId: Int, @RequestBody jobOffer: Any): Mono<ResponseEntity<Any>> {
        return jobOffersService.updateJobOffer(offerId, jobOffer)
            .map { ResponseEntity.ok(it) }
    }

    @DeleteMapping("/{offerId}")
    fun deleteJobOffer(@PathVariable offerId: Int): Mono<ResponseEntity<Void>> {
        return jobOffersService.deleteJobOffer(offerId)
            .map { ResponseEntity.ok(it) }
    }
}
