package com.yourjob.bff.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono

@Service
class CommunityService(private val webClient: WebClient) {

    @Value("\${backend.url:http://localhost:8082}")
    lateinit var backendUrl: String

    fun getPosts(): Mono<Any> {
        return webClient.get()
            .uri("$backendUrl/api/v1/community/posts")
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun createPost(post: Any): Mono<Any> {
        return webClient.post()
            .uri("$backendUrl/api/v1/community/posts")
            .bodyValue(post)
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun getPostDetail(id: Int): Mono<Any> {
        return webClient.get()
            .uri("$backendUrl/api/v1/community/posts/$id")
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun updatePost(id: Int, post: Any): Mono<Any> {
        return webClient.put()
            .uri("$backendUrl/api/v1/community/posts/$id")
            .bodyValue(post)
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun deletePost(id: Int): Mono<Any> {
        return webClient.delete()
            .uri("$backendUrl/api/v1/community/posts/$id")
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    // 댓글 관련
    fun createComment(postId: Int, comment: Any): Mono<Any> {
        return webClient.post()
            .uri("$backendUrl/api/v1/community/posts/$postId/comments")
            .bodyValue(comment)
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun reportComment(postId: Int, report: Any): Mono<Any> {
        return webClient.post()
            .uri("$backendUrl/api/v1/community/posts/$postId/comments/report")
            .bodyValue(report)
            .retrieve()
            .bodyToMono(Any::class.java)
    }

    fun blockComment(postId: Int, block: Any): Mono<Any> {
        return webClient.post()
            .uri("$backendUrl/api/v1/community/posts/$postId/comments/block")
            .bodyValue(block)
            .retrieve()
            .bodyToMono(Any::class.java)
    }
}
