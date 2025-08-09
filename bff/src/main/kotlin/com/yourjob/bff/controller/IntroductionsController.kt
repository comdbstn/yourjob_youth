package com.yourjob.bff.controller

import com.yourjob.bff.service.IntroductionsService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/v1/introductions")
class IntroductionsController(private val introductionsService: IntroductionsService) {

    @GetMapping
    fun getIntroductions(): Mono<ResponseEntity<Any>> {
        return introductionsService.getIntroductions().map { ResponseEntity.ok(it) }
    }

    @PostMapping
    fun createIntroduction(@RequestBody intro: Any): Mono<ResponseEntity<Any>> {
        return introductionsService.createIntroduction(intro)
            .map { ResponseEntity.status(201).body(it) }
    }

    @GetMapping("/{id}")
    fun getIntroductionDetail(@PathVariable id: Int): Mono<ResponseEntity<Any>> {
        return introductionsService.getIntroductionDetail(id)
            .map { ResponseEntity.ok(it) }
    }

    @PutMapping("/{id}")
    fun updateIntroduction(@PathVariable id: Int, @RequestBody intro: Any): Mono<ResponseEntity<Any>> {
        return introductionsService.updateIntroduction(id, intro)
            .map { ResponseEntity.ok(it) }
    }

    @DeleteMapping("/{id}")
    fun deleteIntroduction(@PathVariable id: Int): Mono<ResponseEntity<Void>> {
        return introductionsService.deleteIntroduction(id)
            .map { ResponseEntity.ok(it) }
    }
}
