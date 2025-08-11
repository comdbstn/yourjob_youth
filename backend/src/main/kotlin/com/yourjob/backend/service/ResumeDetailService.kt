package com.yourjob.backend.service

import com.yourjob.backend.entity.resume.*
import com.yourjob.backend.mapper.ResumeDetailMapper
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
@Transactional
class ResumeDetailService(
    private val resumeDetailMapper: ResumeDetailMapper
) {
    
    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    
    // =====================================================
    // Education Methods
    // =====================================================
    fun getEducationsByResumeId(resumeId: Int): List<ResumeEducationResponse> {
        return resumeDetailMapper.getEducationsByResumeId(resumeId).map { education ->
            ResumeEducationResponse(
                educationId = education.educationId!!,
                resumeId = education.resumeId,
                schoolType = education.schoolType,
                schoolName = education.schoolName,
                major = education.major,
                graduationStatus = education.graduationStatus,
                admissionDate = education.admissionDate?.format(dateFormatter),
                graduationDate = education.graduationDate?.format(dateFormatter),
                grade = education.grade,
                location = education.location,
                createdAt = education.createdAt,
                updatedAt = education.updatedAt
            )
        }
    }
    
    fun createEducation(request: ResumeEducationRequest): ResumeEducationResponse {
        val education = ResumeEducation(
            resumeId = request.resumeId,
            schoolType = request.schoolType,
            schoolName = request.schoolName,
            major = request.major,
            graduationStatus = request.graduationStatus,
            admissionDate = request.admissionDate?.let { LocalDate.parse(it, dateFormatter) },
            graduationDate = request.graduationDate?.let { LocalDate.parse(it, dateFormatter) },
            grade = request.grade,
            location = request.location
        )
        
        resumeDetailMapper.insertEducation(education)
        
        return ResumeEducationResponse(
            educationId = education.educationId!!,
            resumeId = education.resumeId,
            schoolType = education.schoolType,
            schoolName = education.schoolName,
            major = education.major,
            graduationStatus = education.graduationStatus,
            admissionDate = request.admissionDate,
            graduationDate = request.graduationDate,
            grade = education.grade,
            location = education.location,
            createdAt = null,
            updatedAt = null
        )
    }
    
    fun updateEducation(educationId: Int, request: ResumeEducationRequest): ResumeEducationResponse {
        val education = ResumeEducation(
            educationId = educationId,
            resumeId = request.resumeId,
            schoolType = request.schoolType,
            schoolName = request.schoolName,
            major = request.major,
            graduationStatus = request.graduationStatus,
            admissionDate = request.admissionDate?.let { LocalDate.parse(it, dateFormatter) },
            graduationDate = request.graduationDate?.let { LocalDate.parse(it, dateFormatter) },
            grade = request.grade,
            location = request.location
        )
        
        resumeDetailMapper.updateEducation(education)
        
        return ResumeEducationResponse(
            educationId = educationId,
            resumeId = education.resumeId,
            schoolType = education.schoolType,
            schoolName = education.schoolName,
            major = education.major,
            graduationStatus = education.graduationStatus,
            admissionDate = request.admissionDate,
            graduationDate = request.graduationDate,
            grade = education.grade,
            location = education.location,
            createdAt = null,
            updatedAt = null
        )
    }
    
    fun deleteEducation(educationId: Int): Boolean {
        return resumeDetailMapper.deleteEducation(educationId) > 0
    }
    
    // =====================================================
    // Career Methods
    // =====================================================
    fun getCareersByResumeId(resumeId: Int): List<ResumeCareerResponse> {
        return resumeDetailMapper.getCareersByResumeId(resumeId).map { career ->
            ResumeCareerResponse(
                careerId = career.careerId!!,
                resumeId = career.resumeId,
                companyName = career.companyName,
                position = career.position,
                department = career.department,
                jobDescription = career.jobDescription,
                startDate = career.startDate?.format(dateFormatter),
                endDate = career.endDate?.format(dateFormatter),
                isWorking = career.isWorking,
                salary = career.salary,
                employmentType = career.employmentType,
                companyType = career.companyType,
                industry = career.industry,
                achievements = career.achievements,
                createdAt = career.createdAt,
                updatedAt = career.updatedAt
            )
        }
    }
    
    fun createCareer(request: ResumeCareerRequest): ResumeCareerResponse {
        val career = ResumeCareer(
            resumeId = request.resumeId,
            companyName = request.companyName,
            position = request.position,
            department = request.department,
            jobDescription = request.jobDescription,
            startDate = request.startDate?.let { LocalDate.parse(it, dateFormatter) },
            endDate = request.endDate?.let { LocalDate.parse(it, dateFormatter) },
            isWorking = request.isWorking,
            salary = request.salary,
            employmentType = request.employmentType,
            companyType = request.companyType,
            industry = request.industry,
            achievements = request.achievements
        )
        
        resumeDetailMapper.insertCareer(career)
        
        return ResumeCareerResponse(
            careerId = career.careerId!!,
            resumeId = career.resumeId,
            companyName = career.companyName,
            position = career.position,
            department = career.department,
            jobDescription = career.jobDescription,
            startDate = request.startDate,
            endDate = request.endDate,
            isWorking = career.isWorking,
            salary = career.salary,
            employmentType = career.employmentType,
            companyType = career.companyType,
            industry = career.industry,
            achievements = career.achievements,
            createdAt = null,
            updatedAt = null
        )
    }
    
    fun updateCareer(careerId: Int, request: ResumeCareerRequest): ResumeCareerResponse {
        val career = ResumeCareer(
            careerId = careerId,
            resumeId = request.resumeId,
            companyName = request.companyName,
            position = request.position,
            department = request.department,
            jobDescription = request.jobDescription,
            startDate = request.startDate?.let { LocalDate.parse(it, dateFormatter) },
            endDate = request.endDate?.let { LocalDate.parse(it, dateFormatter) },
            isWorking = request.isWorking,
            salary = request.salary,
            employmentType = request.employmentType,
            companyType = request.companyType,
            industry = request.industry,
            achievements = request.achievements
        )
        
        resumeDetailMapper.updateCareer(career)
        
        return ResumeCareerResponse(
            careerId = careerId,
            resumeId = career.resumeId,
            companyName = career.companyName,
            position = career.position,
            department = career.department,
            jobDescription = career.jobDescription,
            startDate = request.startDate,
            endDate = request.endDate,
            isWorking = career.isWorking,
            salary = career.salary,
            employmentType = career.employmentType,
            companyType = career.companyType,
            industry = career.industry,
            achievements = career.achievements,
            createdAt = null,
            updatedAt = null
        )
    }
    
    fun deleteCareer(careerId: Int): Boolean {
        return resumeDetailMapper.deleteCareer(careerId) > 0
    }
    
    // =====================================================
    // Certification Methods  
    // =====================================================
    fun getCertificationsByResumeId(resumeId: Int): List<ResumeCertificationResponse> {
        return resumeDetailMapper.getCertificationsByResumeId(resumeId).map { cert ->
            ResumeCertificationResponse(
                certificationId = cert.certificationId!!,
                resumeId = cert.resumeId,
                certificateName = cert.certificateName,
                certificateNumber = cert.certificateNumber,
                issuingOrganization = cert.issuingOrganization,
                issueDate = cert.issueDate?.format(dateFormatter),
                expirationDate = cert.expirationDate?.format(dateFormatter),
                score = cert.score,
                description = cert.description,
                createdAt = cert.createdAt,
                updatedAt = cert.updatedAt
            )
        }
    }
    
    fun createCertification(request: ResumeCertificationRequest): ResumeCertificationResponse {
        val certification = ResumeCertification(
            resumeId = request.resumeId,
            certificateName = request.certificateName,
            certificateNumber = request.certificateNumber,
            issuingOrganization = request.issuingOrganization,
            issueDate = request.issueDate?.let { LocalDate.parse(it, dateFormatter) },
            expirationDate = request.expirationDate?.let { LocalDate.parse(it, dateFormatter) },
            score = request.score,
            description = request.description
        )
        
        resumeDetailMapper.insertCertification(certification)
        
        return ResumeCertificationResponse(
            certificationId = certification.certificationId!!,
            resumeId = certification.resumeId,
            certificateName = certification.certificateName,
            certificateNumber = certification.certificateNumber,
            issuingOrganization = certification.issuingOrganization,
            issueDate = request.issueDate,
            expirationDate = request.expirationDate,
            score = certification.score,
            description = certification.description,
            createdAt = null,
            updatedAt = null
        )
    }
    
    fun updateCertification(certificationId: Int, request: ResumeCertificationRequest): ResumeCertificationResponse {
        val certification = ResumeCertification(
            certificationId = certificationId,
            resumeId = request.resumeId,
            certificateName = request.certificateName,
            certificateNumber = request.certificateNumber,
            issuingOrganization = request.issuingOrganization,
            issueDate = request.issueDate?.let { LocalDate.parse(it, dateFormatter) },
            expirationDate = request.expirationDate?.let { LocalDate.parse(it, dateFormatter) },
            score = request.score,
            description = request.description
        )
        
        resumeDetailMapper.updateCertification(certification)
        
        return ResumeCertificationResponse(
            certificationId = certificationId,
            resumeId = certification.resumeId,
            certificateName = certification.certificateName,
            certificateNumber = certification.certificateNumber,
            issuingOrganization = certification.issuingOrganization,
            issueDate = request.issueDate,
            expirationDate = request.expirationDate,
            score = certification.score,
            description = certification.description,
            createdAt = null,
            updatedAt = null
        )
    }
    
    fun deleteCertification(certificationId: Int): Boolean {
        return resumeDetailMapper.deleteCertification(certificationId) > 0
    }
    
    // Additional methods for Language, Activity, Award, SelfIntroduction, and EmploymentInfo
    // would follow similar patterns...
    
    // =====================================================
    // Complete Resume Detail Methods
    // =====================================================
    fun getCompleteResumeDetails(resumeId: Int): Map<String, Any> {
        return mapOf(
            "educations" to (getEducationsByResumeId(resumeId) ?: emptyList<Any>()),
            "careers" to (getCareersByResumeId(resumeId) ?: emptyList<Any>()),
            "certifications" to (getCertificationsByResumeId(resumeId) ?: emptyList<Any>()),
            "languages" to (resumeDetailMapper.getLanguagesByResumeId(resumeId) ?: emptyList<Any>()),
            "activities" to (resumeDetailMapper.getActivitiesByResumeId(resumeId) ?: emptyList<Any>()),
            "awards" to (resumeDetailMapper.getAwardsByResumeId(resumeId) ?: emptyList<Any>()),
            "selfIntroductions" to (resumeDetailMapper.getSelfIntroductionsByResumeId(resumeId) ?: emptyList<Any>()),
            "employmentInfo" to (resumeDetailMapper.getEmploymentInfoByResumeId(resumeId) ?: emptyMap<String, Any>())
        )
    }
}