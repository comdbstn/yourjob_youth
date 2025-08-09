package com.yourjob.backend.util

import com.yourjob.backend.service.storage.S3StorageService
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import java.io.File
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths
import java.util.*

@Component
class FileUtils(
    private val s3StorageService: S3StorageService
) {
    @Value("\${aws.s3.bucket-name}")
    private lateinit var bucketName: String

    @Value("\${aws.s3.cloudfront-domain}")
    private lateinit var cloudfrontDomain: String

    private lateinit var projectRootPath: String

    // S3 사용 여부 플래그 (필요에 따라 로컬 저장소와 S3 중 선택 가능)
    @Value("\${storage.use-s3:true}")
    private var useS3: Boolean = true

    @PostConstruct
    fun init() {
        if (File("/home/ubuntu/app/yourjob_repo/").exists()) {
            projectRootPath = "/home/ubuntu/app/yourjob_repo/"
        } else {
            projectRootPath = System.getProperty("java.io.tmpdir") + File.separator + "yourjob_repo" + File.separator
            File(projectRootPath).mkdirs()
        }
    }

    fun fileSave(rootpath: String, type: String, yeardate: String, file: MultipartFile): String {
        // 파일이 null이거나 비어 있는지 확인
        if (file.isEmpty) {
            throw IOException("파일이 비어 있습니다")
        }

        // S3 사용할 경우
        if (useS3) {
            // S3 경로 구성 (uploads/banners/2025-04-19)
            val s3Path = "$rootpath/$type/$yeardate"

            // S3에 파일 업로드하고 UUID 반환
            return s3StorageService.uploadFile(s3Path, file)
        }
        // 로컬 저장소 사용할 경우
        else {
            return saveToLocalStorage(rootpath, type, yeardate, file)
        }
    }

    private fun saveToLocalStorage(rootpath: String, type: String, yeardate: String, file: MultipartFile): String {
        makeDirectoryIfNotExistFolder(rootpath)
        makeDirectoryIfNotExistFolder("$rootpath/$type")
        makeDirectoryIfNotExistFolder("$rootpath/$type/$yeardate")

        val uuid = UUID.randomUUID().toString()
        val fileNm = file.originalFilename ?: "unnamed"
        val savePath = Paths.get("$rootpath/$type/$yeardate/${uuid}_$fileNm")

        try {
            Files.write(savePath, file.bytes)
        } catch (e: IOException) {
            throw IOException("Failed to save file: ${e.message}")
        }

        return uuid
    }

    private fun makeDirectoryIfNotExistFolder(path: String): ResponseEntity<Boolean> {
        try {
            val directory = File(path)
            if (!directory.exists()) {
                directory.mkdirs()
            }
        } catch (e: IOException) {
            return ResponseEntity(false, HttpStatus.INTERNAL_SERVER_ERROR)
        }
        return ResponseEntity(true, HttpStatus.OK)
    }

    fun getFileUrl(rootpath: String, type: String, yeardate: String, uuid: String, originalFilename: String): String {
        if (useS3) {
            val s3Path = "$rootpath/$type/$yeardate"
            return s3StorageService.getFileUrl(s3Path, uuid, originalFilename)
        } else {
            // 로컬 파일 URL (서버 컨텍스트 경로에 맞게 조정 필요)
            return "/$rootpath/$type/$yeardate/${uuid}_$originalFilename"
        }
    }
}