package com.yourjob.bff.controller

import com.yourjob.bff.service.CorpmemService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/v1/corpmem")
class CorpmemController(private val corpmemService: CorpmemService) {

    @GetMapping("/mydata")
    fun getMyData(): Mono<ResponseEntity<Any>> {
        return corpmemService.getMyData().map { ResponseEntity.ok(it) }
    }

    @PostMapping("/accept")
    fun accept(@RequestBody request: Any): Mono<ResponseEntity<Any>> {
        return corpmemService.accept(request).map { ResponseEntity.ok(it) }
    }

    @GetMapping("/applicants")
    fun getApplicants(): Mono<ResponseEntity<Any>> {
        return corpmemService.getApplicants().map { ResponseEntity.ok(it) }
    }

    @GetMapping("/corpinfo")
    fun getCorpInfo(): Mono<ResponseEntity<Any>> {
        return corpmemService.getCorpInfo().map { ResponseEntity.ok(it) }
    }

    @PutMapping("/corpinfo")
    fun updateCorpInfo(@RequestBody info: Any): Mono<ResponseEntity<Any>> {
        return corpmemService.updateCorpInfo(info).map { ResponseEntity.ok(it) }
    }

    @PostMapping("/talents/filter")
    fun filterTalents(@RequestBody request: Any): Mono<ResponseEntity<Any>> {
        return corpmemService.filterTalents(request).map { ResponseEntity.ok(it) }
    }
}
