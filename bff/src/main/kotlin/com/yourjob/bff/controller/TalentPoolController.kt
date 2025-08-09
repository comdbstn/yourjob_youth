package com.yourjob.bff.controller

import com.yourjob.bff.service.TalentPoolService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/v1/talent-pool")
class TalentPoolController(private val talentPoolService: TalentPoolService) {

    @GetMapping
    fun getTalentPool(): Mono<ResponseEntity<Any>> {
        return talentPoolService.getTalentPool()
            .map { ResponseEntity.ok(it) }
    }

    @PostMapping
    fun addTalentPoolItem(@RequestBody item: Any): Mono<ResponseEntity<Any>> {
        return talentPoolService.addTalentPoolItem(item)
            .map { ResponseEntity.status(201).body(it) }
    }

    @DeleteMapping("/{id}")
    fun deleteTalentPoolItem(@PathVariable id: Int): Mono<ResponseEntity<Void>> {
        return talentPoolService.deleteTalentPoolItem(id)
            .map { ResponseEntity.ok(it) }
    }
}
