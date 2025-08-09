package com.yourjob.backend.service.storage

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import java.io.IOException
import java.util.*

@Service
class S3StorageService(
    private val s3Client: S3Client
) {
    @Value("\${aws.s3.bucket-name}")
    private lateinit var bucketName: String

    @Value("\${aws.s3.cloudfront-domain}")
    private lateinit var cloudfrontDomain: String

    fun uploadFile(path: String, file: MultipartFile): String {
        if (file.isEmpty) {
            throw IOException("파일이 비어 있습니다")
        }

        // UUID 생성 및 파일 이름 구성
        val uuid = UUID.randomUUID().toString()
        val originalFilename = file.originalFilename ?: "unnamed"
        val newFilename = "${uuid}_${originalFilename}"

        // S3 키 경로 (버킷 내 전체 경로)
        val s3Key = if (path.endsWith("/")) "$path$newFilename" else "$path/$newFilename"

        try {
            // 파일 업로드
            val request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .contentType(file.contentType)
                .build()

            s3Client.putObject(request, RequestBody.fromInputStream(file.inputStream, file.size))

            return uuid
        } catch (e: Exception) {
            throw IOException("S3 업로드 실패: ${e.message}", e)
        }
    }

    fun getFileUrl(path: String, uuid: String, originalFilename: String): String {
        val formattedPath = if (path.startsWith("/")) path.substring(1) else path
        return "$cloudfrontDomain/$formattedPath/${uuid}_$originalFilename"
    }
}