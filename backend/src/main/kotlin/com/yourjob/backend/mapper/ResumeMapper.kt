package com.yourjob.backend.mapper

import com.yourjob.backend.entity.ResumeRequest
import com.yourjob.backend.entity.ResumeResponse
import org.apache.ibatis.annotations.Mapper
import org.springframework.stereotype.Repository

@Repository
@Mapper
interface ResumeMapper {
    fun insertResume(resumeRequest: ResumeRequest): Int
    fun insertResumeActivities(nMap: MutableMap<String, Any>): Int
    fun insertResumeAwards(nMap: MutableMap<String, Any>): Int
    fun insertResumeCareers(nMap: MutableMap<String, Any>): Int
    fun insertResumeCerts(nMap: MutableMap<String, Any>): Int
    fun insertResumeEdus(nMap: MutableMap<String, Any>): Int
    fun insertResumeEmpPrf(nMap: MutableMap<String, Any>): Int
    fun insertResumeLngs(nMap: MutableMap<String, Any>): Int
    fun insertResumeSflIntros(nMap: MutableMap<String, Any>): Int
    fun selectResumeDetail(resumeId: Int): ResumeResponse
    fun selectResumeEducations(resumeId: Int): ArrayList<MutableMap<String, Any>>
    fun selectResumeLanguages(resumeId: Int): ArrayList<MutableMap<String, Any>>
    fun selectResumeCareers(resumeId: Int): ArrayList<MutableMap<String, Any>>
    fun selectResumeActivities(resumeId: Int): ArrayList<MutableMap<String, Any>>
    fun selectResumeCertifications(resumeId: Int): ArrayList<MutableMap<String, Any>>
    fun selectResumeAwards(resumeId: Int): ArrayList<MutableMap<String, Any>>
    fun selectResumeSelfIntro(resumeId: Int): ArrayList<MutableMap<String, Any>>
    fun selectResumeEmpPrf(resumeId: Int): ArrayList<MutableMap<String, Any>>
    fun selectResumeList(nMap: MutableMap<String, Any>): List<ResumeRequest>
    fun selectResumeListCnt(nMap: MutableMap<String, Any>): Int
    fun updateResume(resumeRequest: ResumeRequest): Int
    fun updateResumeProfileImgIdx(nMap: MutableMap<String, Any>): Int
    fun updateResumeApostiImgIdx(nMap: MutableMap<String, Any>): Int
    fun updateResumePublicStatus(nMap: MutableMap<String, Any>): Int
    fun deleteResume(resumeId: Int): Int
    fun deleteResumeActivities(resumeId: Int): Int
    fun deleteResumeAwards(resumeId: Int): Int
    fun deleteResumeCareers(resumeId: Int): Int
    fun deleteResumeCerts(resumeId: Int): Int
    fun deleteResumeEdus(resumeId: Int): Int
    fun deleteResumeEmpPrf(resumeId: Int): Int
    fun deleteResumeLngs(resumeId: Int): Int
    fun deleteResumeSflIntros(resumeId: Int): Int
}