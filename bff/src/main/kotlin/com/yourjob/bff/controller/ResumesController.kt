package com.yourjob.bff.controller

import com.yourjob.bff.service.ResumesService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/v1/resumes")
class ResumesController(private val resumesService: ResumesService) {

    @GetMapping
    fun getResumes(): Mono<ResponseEntity<Any>> {
        return resumesService.getResumes()
            .map { ResponseEntity.ok(it) }
    }

    @PostMapping
    fun createResume(@RequestBody resume: Any): Mono<ResponseEntity<Any>> {
        return resumesService.createResume(resume)
            .map { ResponseEntity.status(201).body(it) }
    }

    @GetMapping("/{id}")
    fun getResumeDetail(@PathVariable id: Int): Mono<ResponseEntity<Any>> {
        return resumesService.getResumeDetail(id)
            .map { ResponseEntity.ok(it) }
    }

    @PutMapping("/{id}")
    fun updateResume(@PathVariable id: Int, @RequestBody resume: Any): Mono<ResponseEntity<Any>> {
        return resumesService.updateResume(id, resume)
            .map { ResponseEntity.ok(it) }
    }

    @DeleteMapping("/{id}")
    fun deleteResume(@PathVariable id: Int): Mono<ResponseEntity<Void>> {
        return resumesService.deleteResume(id)
            .map { ResponseEntity.ok(it) }
    }
}
