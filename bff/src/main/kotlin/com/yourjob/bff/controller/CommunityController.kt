package com.yourjob.bff.controller

import com.yourjob.bff.service.CommunityService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/v1/community/posts")
class CommunityController(private val communityService: CommunityService) {

    @GetMapping
    fun getPosts(): Mono<ResponseEntity<Any>> {
        return communityService.getPosts().map { ResponseEntity.ok(it) }
    }

    @PostMapping
    fun createPost(@RequestBody post: Any): Mono<ResponseEntity<Any>> {
        return communityService.createPost(post)
            .map { ResponseEntity.status(201).body(it) }
    }

    @GetMapping("/{id}")
    fun getPostDetail(@PathVariable id: Int): Mono<ResponseEntity<Any>> {
        return communityService.getPostDetail(id)
            .map { ResponseEntity.ok(it) }
    }

    @PutMapping("/{id}")
    fun updatePost(@PathVariable id: Int, @RequestBody post: Any): Mono<ResponseEntity<Any>> {
        return communityService.updatePost(id, post)
            .map { ResponseEntity.ok(it) }
    }

    @DeleteMapping("/{id}")
    fun deletePost(@PathVariable id: Int): Mono<ResponseEntity<Any>> {
        return communityService.deletePost(id)
            .map { ResponseEntity.ok(it) }
    }

    // 댓글 관련 endpoints
    @PostMapping("/{postId}/comments")
    fun createComment(@PathVariable postId: Int, @RequestBody comment: Any): Mono<ResponseEntity<Any>> {
        return communityService.createComment(postId, comment)
            .map { ResponseEntity.status(201).body(it) }
    }

    @PostMapping("/{postId}/comments/report")
    fun reportComment(@PathVariable postId: Int, @RequestBody report: Any): Mono<ResponseEntity<Any>> {
        return communityService.reportComment(postId, report)
            .map { ResponseEntity.ok(it) }
    }

    @PostMapping("/{postId}/comments/block")
    fun blockComment(@PathVariable postId: Int, @RequestBody block: Any): Mono<ResponseEntity<Any>> {
        return communityService.blockComment(postId, block)
            .map { ResponseEntity.ok(it) }
    }
}
