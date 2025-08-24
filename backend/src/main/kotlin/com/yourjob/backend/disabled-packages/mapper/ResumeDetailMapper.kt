package com.yourjob.backend.mapper

import com.yourjob.backend.entity.resume.*
import org.apache.ibatis.annotations.*

@Mapper
interface ResumeDetailMapper {
    
    // =====================================================
    // Education Methods
    // =====================================================
    @Select("""
        SELECT education_id, resume_id, school_type, school_name, major, 
               graduation_status, admission_date, graduation_date, grade, location,
               created_at, updated_at
        FROM resume_educations 
        WHERE resume_id = #{resumeId} 
        ORDER BY graduation_date DESC
    """)
    fun getEducationsByResumeId(resumeId: Int): List<ResumeEducation>

    @Insert("""
        INSERT INTO resume_educations (resume_id, school_type, school_name, major,
                                     graduation_status, admission_date, graduation_date, 
                                     grade, location)
        VALUES (#{resumeId}, #{schoolType}, #{schoolName}, #{major},
                #{graduationStatus}, #{admissionDate}, #{graduationDate},
                #{grade}, #{location})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "educationId")
    fun insertEducation(education: ResumeEducation): Int

    @Update("""
        UPDATE resume_educations 
        SET school_type = #{schoolType}, school_name = #{schoolName}, major = #{major},
            graduation_status = #{graduationStatus}, admission_date = #{admissionDate}, 
            graduation_date = #{graduationDate}, grade = #{grade}, location = #{location}
        WHERE education_id = #{educationId}
    """)
    fun updateEducation(education: ResumeEducation): Int

    @Delete("DELETE FROM resume_educations WHERE education_id = #{educationId}")
    fun deleteEducation(educationId: Int): Int

    // =====================================================
    // Career Methods
    // =====================================================
    @Select("""
        SELECT career_id, resume_id, company_name, position, department, job_description,
               start_date, end_date, is_working, salary, employment_type, company_type,
               industry, achievements, created_at, updated_at
        FROM resume_careers 
        WHERE resume_id = #{resumeId} 
        ORDER BY start_date DESC
    """)
    fun getCareersByResumeId(resumeId: Int): List<ResumeCareer>

    @Insert("""
        INSERT INTO resume_careers (resume_id, company_name, position, department,
                                   job_description, start_date, end_date, is_working,
                                   salary, employment_type, company_type, industry, achievements)
        VALUES (#{resumeId}, #{companyName}, #{position}, #{department},
                #{jobDescription}, #{startDate}, #{endDate}, #{isWorking},
                #{salary}, #{employmentType}, #{companyType}, #{industry}, #{achievements})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "careerId")
    fun insertCareer(career: ResumeCareer): Int

    @Update("""
        UPDATE resume_careers 
        SET company_name = #{companyName}, position = #{position}, department = #{department},
            job_description = #{jobDescription}, start_date = #{startDate}, end_date = #{endDate},
            is_working = #{isWorking}, salary = #{salary}, employment_type = #{employmentType},
            company_type = #{companyType}, industry = #{industry}, achievements = #{achievements}
        WHERE career_id = #{careerId}
    """)
    fun updateCareer(career: ResumeCareer): Int

    @Delete("DELETE FROM resume_careers WHERE career_id = #{careerId}")
    fun deleteCareer(careerId: Int): Int

    // =====================================================
    // Certification Methods
    // =====================================================
    @Select("""
        SELECT certification_id, resume_id, certificate_name, certificate_number,
               issuing_organization, issue_date, expiration_date, score, description,
               created_at, updated_at
        FROM resume_certifications 
        WHERE resume_id = #{resumeId} 
        ORDER BY issue_date DESC
    """)
    fun getCertificationsByResumeId(resumeId: Int): List<ResumeCertification>

    @Insert("""
        INSERT INTO resume_certifications (resume_id, certificate_name, certificate_number,
                                         issuing_organization, issue_date, expiration_date, 
                                         score, description)
        VALUES (#{resumeId}, #{certificateName}, #{certificateNumber},
                #{issuingOrganization}, #{issueDate}, #{expirationDate},
                #{score}, #{description})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "certificationId")
    fun insertCertification(certification: ResumeCertification): Int

    @Update("""
        UPDATE resume_certifications 
        SET certificate_name = #{certificateName}, certificate_number = #{certificateNumber},
            issuing_organization = #{issuingOrganization}, issue_date = #{issueDate},
            expiration_date = #{expirationDate}, score = #{score}, description = #{description}
        WHERE certification_id = #{certificationId}
    """)
    fun updateCertification(certification: ResumeCertification): Int

    @Delete("DELETE FROM resume_certifications WHERE certification_id = #{certificationId}")
    fun deleteCertification(certificationId: Int): Int

    // =====================================================
    // Language Methods
    // =====================================================
    @Select("""
        SELECT language_id, resume_id, language_name, proficiency_level,
               certificate_name, score, test_date, description,
               created_at, updated_at
        FROM resume_languages 
        WHERE resume_id = #{resumeId} 
        ORDER BY test_date DESC
    """)
    fun getLanguagesByResumeId(resumeId: Int): List<ResumeLanguage>

    @Insert("""
        INSERT INTO resume_languages (resume_id, language_name, proficiency_level,
                                     certificate_name, score, test_date, description)
        VALUES (#{resumeId}, #{languageName}, #{proficiencyLevel},
                #{certificateName}, #{score}, #{testDate}, #{description})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "languageId")
    fun insertLanguage(language: ResumeLanguage): Int

    @Update("""
        UPDATE resume_languages 
        SET language_name = #{languageName}, proficiency_level = #{proficiencyLevel},
            certificate_name = #{certificateName}, score = #{score}, 
            test_date = #{testDate}, description = #{description}
        WHERE language_id = #{languageId}
    """)
    fun updateLanguage(language: ResumeLanguage): Int

    @Delete("DELETE FROM resume_languages WHERE language_id = #{languageId}")
    fun deleteLanguage(languageId: Int): Int

    // =====================================================
    // Activity Methods
    // =====================================================
    @Select("""
        SELECT activity_id, resume_id, activity_type, organization_name, position,
               activity_name, description, start_date, end_date, is_ongoing, achievements,
               created_at, updated_at
        FROM resume_activities 
        WHERE resume_id = #{resumeId} 
        ORDER BY start_date DESC
    """)
    fun getActivitiesByResumeId(resumeId: Int): List<ResumeActivity>

    @Insert("""
        INSERT INTO resume_activities (resume_id, activity_type, organization_name, position,
                                      activity_name, description, start_date, end_date, 
                                      is_ongoing, achievements)
        VALUES (#{resumeId}, #{activityType}, #{organizationName}, #{position},
                #{activityName}, #{description}, #{startDate}, #{endDate},
                #{isOngoing}, #{achievements})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "activityId")
    fun insertActivity(activity: ResumeActivity): Int

    @Update("""
        UPDATE resume_activities 
        SET activity_type = #{activityType}, organization_name = #{organizationName},
            position = #{position}, activity_name = #{activityName}, description = #{description},
            start_date = #{startDate}, end_date = #{endDate}, is_ongoing = #{isOngoing},
            achievements = #{achievements}
        WHERE activity_id = #{activityId}
    """)
    fun updateActivity(activity: ResumeActivity): Int

    @Delete("DELETE FROM resume_activities WHERE activity_id = #{activityId}")
    fun deleteActivity(activityId: Int): Int

    // =====================================================
    // Award Methods
    // =====================================================
    @Select("""
        SELECT award_id, resume_id, award_name, issuing_organization, award_rank,
               award_date, description, related_activity, created_at, updated_at
        FROM resume_awards 
        WHERE resume_id = #{resumeId} 
        ORDER BY award_date DESC
    """)
    fun getAwardsByResumeId(resumeId: Int): List<ResumeAward>

    @Insert("""
        INSERT INTO resume_awards (resume_id, award_name, issuing_organization, award_rank,
                                  award_date, description, related_activity)
        VALUES (#{resumeId}, #{awardName}, #{issuingOrganization}, #{awardRank},
                #{awardDate}, #{description}, #{relatedActivity})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "awardId")
    fun insertAward(award: ResumeAward): Int

    @Update("""
        UPDATE resume_awards 
        SET award_name = #{awardName}, issuing_organization = #{issuingOrganization},
            award_rank = #{awardRank}, award_date = #{awardDate}, 
            description = #{description}, related_activity = #{relatedActivity}
        WHERE award_id = #{awardId}
    """)
    fun updateAward(award: ResumeAward): Int

    @Delete("DELETE FROM resume_awards WHERE award_id = #{awardId}")
    fun deleteAward(awardId: Int): Int

    // =====================================================
    // Self Introduction Methods
    // =====================================================
    @Select("""
        SELECT self_intro_id, resume_id, question_title, question_content, answer_content,
               word_limit, order_number, created_at, updated_at
        FROM resume_selfintroductions 
        WHERE resume_id = #{resumeId} 
        ORDER BY order_number
    """)
    fun getSelfIntroductionsByResumeId(resumeId: Int): List<ResumeSelfIntroduction>

    @Insert("""
        INSERT INTO resume_selfintroductions (resume_id, question_title, question_content,
                                            answer_content, word_limit, order_number)
        VALUES (#{resumeId}, #{questionTitle}, #{questionContent},
                #{answerContent}, #{wordLimit}, #{orderNumber})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "selfIntroId")
    fun insertSelfIntroduction(selfIntro: ResumeSelfIntroduction): Int

    @Update("""
        UPDATE resume_selfintroductions 
        SET question_title = #{questionTitle}, question_content = #{questionContent},
            answer_content = #{answerContent}, word_limit = #{wordLimit}, 
            order_number = #{orderNumber}
        WHERE self_intro_id = #{selfIntroId}
    """)
    fun updateSelfIntroduction(selfIntro: ResumeSelfIntroduction): Int

    @Delete("DELETE FROM resume_selfintroductions WHERE self_intro_id = #{selfIntroId}")
    fun deleteSelfIntroduction(selfIntroId: Int): Int

    // =====================================================
    // Employment Info Methods
    // =====================================================
    @Select("""
        SELECT employment_info_id, resume_id, military_service, military_service_type,
               military_start_date, military_end_date, military_rank, military_branch,
               disability_level, veterans_affairs, social_service, overseas_travel, 
               relocation, created_at, updated_at
        FROM resume_employment_info 
        WHERE resume_id = #{resumeId}
    """)
    fun getEmploymentInfoByResumeId(resumeId: Int): ResumeEmploymentInfo?

    @Insert("""
        INSERT INTO resume_employment_info (resume_id, military_service, military_service_type,
                                          military_start_date, military_end_date, military_rank,
                                          military_branch, disability_level, veterans_affairs,
                                          social_service, overseas_travel, relocation)
        VALUES (#{resumeId}, #{militaryService}, #{militaryServiceType},
                #{militaryStartDate}, #{militaryEndDate}, #{militaryRank},
                #{militaryBranch}, #{disabilityLevel}, #{veteransAffairs},
                #{socialService}, #{overseasTravel}, #{relocation})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "employmentInfoId")
    fun insertEmploymentInfo(employmentInfo: ResumeEmploymentInfo): Int

    @Update("""
        UPDATE resume_employment_info 
        SET military_service = #{militaryService}, military_service_type = #{militaryServiceType},
            military_start_date = #{militaryStartDate}, military_end_date = #{militaryEndDate},
            military_rank = #{militaryRank}, military_branch = #{militaryBranch},
            disability_level = #{disabilityLevel}, veterans_affairs = #{veteransAffairs},
            social_service = #{socialService}, overseas_travel = #{overseasTravel},
            relocation = #{relocation}
        WHERE employment_info_id = #{employmentInfoId}
    """)
    fun updateEmploymentInfo(employmentInfo: ResumeEmploymentInfo): Int

    @Delete("DELETE FROM resume_employment_info WHERE employment_info_id = #{employmentInfoId}")
    fun deleteEmploymentInfo(employmentInfoId: Int): Int
}