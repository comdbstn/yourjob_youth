package com.yourjob.backend.controller

import com.yourjob.backend.entity.resume.*
import com.yourjob.backend.service.ResumeDetailService
import com.yourjob.backend.util.JwtUtil
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/resumes")
@Tag(name = "Resume Detail", description = "이력서 세부 정보 관리 API")
class ResumeDetailController(
    private val resumeDetailService: ResumeDetailService,
    private val jwtUtil: JwtUtil
) {

    // =====================================================
    // Education Endpoints
    // =====================================================
    @GetMapping("/{resumeId}/educations")
    @Operation(summary = "학력 정보 조회", description = "특정 이력서의 학력 정보 목록을 조회합니다.")
    fun getEducations(@PathVariable resumeId: Int): ResponseEntity<List<ResumeEducationResponse>> {
        val educations = resumeDetailService.getEducationsByResumeId(resumeId)
        return ResponseEntity.ok(educations)
    }

    @PostMapping("/{resumeId}/educations")
    @Operation(summary = "학력 정보 생성", description = "새로운 학력 정보를 생성합니다.")
    fun createEducation(
        @PathVariable resumeId: Int,
        @RequestBody request: ResumeEducationRequest,
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<ResumeEducationResponse> {
        // JWT 검증
        val userId = jwtUtil.getUserIdFromToken(token)
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        }

        val requestWithResumeId = request.copy(resumeId = resumeId)
        val education = resumeDetailService.createEducation(requestWithResumeId)
        return ResponseEntity.status(HttpStatus.CREATED).body(education)
    }

    @PutMapping("/{resumeId}/educations/{educationId}")
    @Operation(summary = "학력 정보 수정", description = "기존 학력 정보를 수정합니다.")
    fun updateEducation(
        @PathVariable resumeId: Int,
        @PathVariable educationId: Int,
        @RequestBody request: ResumeEducationRequest,
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<ResumeEducationResponse> {
        val userId = jwtUtil.getUserIdFromToken(token)
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        }

        val requestWithResumeId = request.copy(resumeId = resumeId)
        val education = resumeDetailService.updateEducation(educationId, requestWithResumeId)
        return ResponseEntity.ok(education)
    }

    @DeleteMapping("/{resumeId}/educations/{educationId}")
    @Operation(summary = "학력 정보 삭제", description = "학력 정보를 삭제합니다.")
    fun deleteEducation(
        @PathVariable resumeId: Int,
        @PathVariable educationId: Int,
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<Void> {
        val userId = jwtUtil.getUserIdFromToken(token)
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        }

        val deleted = resumeDetailService.deleteEducation(educationId)
        return if (deleted) {
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    // =====================================================
    // Career Endpoints
    // =====================================================
    @GetMapping("/{resumeId}/careers")
    @Operation(summary = "경력 정보 조회", description = "특정 이력서의 경력 정보 목록을 조회합니다.")
    fun getCareers(@PathVariable resumeId: Int): ResponseEntity<List<ResumeCareerResponse>> {
        val careers = resumeDetailService.getCareersByResumeId(resumeId)
        return ResponseEntity.ok(careers)
    }

    @PostMapping("/{resumeId}/careers")
    @Operation(summary = "경력 정보 생성", description = "새로운 경력 정보를 생성합니다.")
    fun createCareer(
        @PathVariable resumeId: Int,
        @RequestBody request: ResumeCareerRequest,
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<ResumeCareerResponse> {
        val userId = jwtUtil.getUserIdFromToken(token)
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        }

        val requestWithResumeId = request.copy(resumeId = resumeId)
        val career = resumeDetailService.createCareer(requestWithResumeId)
        return ResponseEntity.status(HttpStatus.CREATED).body(career)
    }

    @PutMapping("/{resumeId}/careers/{careerId}")
    @Operation(summary = "경력 정보 수정", description = "기존 경력 정보를 수정합니다.")
    fun updateCareer(
        @PathVariable resumeId: Int,
        @PathVariable careerId: Int,
        @RequestBody request: ResumeCareerRequest,
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<ResumeCareerResponse> {
        val userId = jwtUtil.getUserIdFromToken(token)
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        }

        val requestWithResumeId = request.copy(resumeId = resumeId)
        val career = resumeDetailService.updateCareer(careerId, requestWithResumeId)
        return ResponseEntity.ok(career)
    }

    @DeleteMapping("/{resumeId}/careers/{careerId}")
    @Operation(summary = "경력 정보 삭제", description = "경력 정보를 삭제합니다.")
    fun deleteCareer(
        @PathVariable resumeId: Int,
        @PathVariable careerId: Int,
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<Void> {
        val userId = jwtUtil.getUserIdFromToken(token)
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        }

        val deleted = resumeDetailService.deleteCareer(careerId)
        return if (deleted) {
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    // =====================================================
    // Certification Endpoints
    // =====================================================
    @GetMapping("/{resumeId}/certifications")
    @Operation(summary = "자격증 정보 조회", description = "특정 이력서의 자격증 정보 목록을 조회합니다.")
    fun getCertifications(@PathVariable resumeId: Int): ResponseEntity<List<ResumeCertificationResponse>> {
        val certifications = resumeDetailService.getCertificationsByResumeId(resumeId)
        return ResponseEntity.ok(certifications)
    }

    @PostMapping("/{resumeId}/certifications")
    @Operation(summary = "자격증 정보 생성", description = "새로운 자격증 정보를 생성합니다.")
    fun createCertification(
        @PathVariable resumeId: Int,
        @RequestBody request: ResumeCertificationRequest,
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<ResumeCertificationResponse> {
        val userId = jwtUtil.getUserIdFromToken(token)
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        }

        val requestWithResumeId = request.copy(resumeId = resumeId)
        val certification = resumeDetailService.createCertification(requestWithResumeId)
        return ResponseEntity.status(HttpStatus.CREATED).body(certification)
    }

    @PutMapping("/{resumeId}/certifications/{certificationId}")
    @Operation(summary = "자격증 정보 수정", description = "기존 자격증 정보를 수정합니다.")
    fun updateCertification(
        @PathVariable resumeId: Int,
        @PathVariable certificationId: Int,
        @RequestBody request: ResumeCertificationRequest,
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<ResumeCertificationResponse> {
        val userId = jwtUtil.getUserIdFromToken(token)
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        }

        val requestWithResumeId = request.copy(resumeId = resumeId)
        val certification = resumeDetailService.updateCertification(certificationId, requestWithResumeId)
        return ResponseEntity.ok(certification)
    }

    @DeleteMapping("/{resumeId}/certifications/{certificationId}")
    @Operation(summary = "자격증 정보 삭제", description = "자격증 정보를 삭제합니다.")
    fun deleteCertification(
        @PathVariable resumeId: Int,
        @PathVariable certificationId: Int,
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<Void> {
        val userId = jwtUtil.getUserIdFromToken(token)
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        }

        val deleted = resumeDetailService.deleteCertification(certificationId)
        return if (deleted) {
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    // =====================================================
    // Complete Resume Detail Endpoint
    // =====================================================
    @GetMapping("/{resumeId}/complete")
    @Operation(summary = "이력서 전체 세부 정보 조회", description = "이력서의 모든 세부 정보를 한번에 조회합니다.")
    fun getCompleteResumeDetails(@PathVariable resumeId: Int): ResponseEntity<Map<String, Any>> {
        val completeDetails = resumeDetailService.getCompleteResumeDetails(resumeId)
        return ResponseEntity.ok(completeDetails)
    }
}