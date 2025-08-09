package com.yourjob.backend.service

import com.yourjob.backend.entity.ResumeRequest
import com.yourjob.backend.entity.ResumeResponse
import com.yourjob.backend.mapper.ResumeMapper
import org.springframework.stereotype.Service

@Service
class ResumeService (private var resumeMapper: ResumeMapper){
    fun insertResume(resumeRequest: ResumeRequest): Int{
        return resumeMapper.insertResume(resumeRequest)
    }
    fun insertResumeActivities(nMap: MutableMap<String, Any>):Int{
        return resumeMapper.insertResumeActivities(nMap)
    }
    fun insertResumeAwards(nMap: MutableMap<String, Any>):Int {
        return resumeMapper.insertResumeAwards(nMap)
    }
    fun insertResumeCareers(nMap: MutableMap<String, Any>):Int {
        return resumeMapper.insertResumeCareers(nMap)
    }
    fun insertResumeCerts(nMap: MutableMap<String, Any>):Int {
        return resumeMapper.insertResumeCerts(nMap)
    }
    fun insertResumeEdus(nMap: MutableMap<String, Any>):Int {
        return resumeMapper.insertResumeEdus(nMap)
    }
    fun insertResumeEmpPrf(nMap: MutableMap<String, Any>):Int {
        return resumeMapper.insertResumeEmpPrf(nMap)
    }
    fun insertResumeLngs(nMap: MutableMap<String, Any>):Int {
        return resumeMapper.insertResumeLngs(nMap)
    }
    fun insertResumeSflIntros(nMap: MutableMap<String, Any>):Int {
        return resumeMapper.insertResumeSflIntros(nMap)
    }
    fun selectResumeDetail(resumeId: Int): ResumeResponse{
        return resumeMapper.selectResumeDetail(resumeId)
    }
    fun selectResumeEducations(resumeId: Int): ArrayList<MutableMap<String, Any>>{
        return resumeMapper.selectResumeEducations(resumeId)
    }
    fun selectResumeLanguages(resumeId: Int): ArrayList<MutableMap<String, Any>>{
        return resumeMapper.selectResumeLanguages(resumeId)
    }
    fun selectResumeCareers(resumeId: Int): ArrayList<MutableMap<String, Any>>{
        return resumeMapper.selectResumeCareers(resumeId)
    }
    fun selectResumeActivities(resumeId: Int): ArrayList<MutableMap<String, Any>>{
        return resumeMapper.selectResumeActivities(resumeId)
    }
    fun selectResumeCertifications(resumeId: Int): ArrayList<MutableMap<String, Any>>{
        return resumeMapper.selectResumeCertifications(resumeId)
    }
    fun selectResumeAwards(resumeId: Int): ArrayList<MutableMap<String, Any>>{
        return resumeMapper.selectResumeAwards(resumeId)
    }
    fun selectResumeSelfIntro(resumeId: Int): ArrayList<MutableMap<String, Any>>{
        return resumeMapper.selectResumeSelfIntro(resumeId)
    }
    fun selectResumeEmpPrf(resumeId: Int): ArrayList<MutableMap<String, Any>>{
        return resumeMapper.selectResumeEmpPrf(resumeId)
    }
    fun selectResumeList(nMap: MutableMap<String, Any>): List<ResumeRequest>{
        return resumeMapper.selectResumeList(nMap)
    }
    fun selectResumeListCnt(nMap: MutableMap<String, Any>): Int{
        return resumeMapper.selectResumeListCnt(nMap)
    }
    fun updateResume(resumeRequest: ResumeRequest): Int{
        return resumeMapper.updateResume(resumeRequest)
    }
    fun updateResumeProfileImgIdx(mutableMap: MutableMap<String, Any>): Int{
        return resumeMapper.updateResumeProfileImgIdx(mutableMap)
    }
    fun updateResumeApostiImgIdx(mutableMap: MutableMap<String, Any>): Int{
        return resumeMapper.updateResumeApostiImgIdx(mutableMap)
    }
    fun updateResumePublicStatus(mutableMap: MutableMap<String, Any>): Int {
        return resumeMapper.updateResumePublicStatus(mutableMap)
    }
    fun deleteResume(resumeId: Int): Int{
        return resumeMapper.deleteResume(resumeId)
    }
    fun deleteResumeActivities(resumeId: Int): Int{
        return resumeMapper.deleteResumeActivities(resumeId)
    }
    fun deleteResumeAwards(resumeId: Int): Int{
        return resumeMapper.deleteResumeAwards(resumeId)
    }
    fun deleteResumeCareers(resumeId: Int): Int{
        return resumeMapper.deleteResumeCareers(resumeId)
    }
    fun deleteResumeCerts(resumeId: Int): Int{
        return resumeMapper.deleteResumeCerts(resumeId)
    }
    fun deleteResumeEdus(resumeId: Int): Int{
        return resumeMapper.deleteResumeEdus(resumeId)
    }
    fun deleteResumeEmpPrf(resumeId: Int): Int{
        return resumeMapper.deleteResumeEmpPrf(resumeId)
    }
    fun deleteResumeLngs(resumeId: Int): Int{
        return resumeMapper.deleteResumeLngs(resumeId)
    }
    fun deleteResumeSflIntros(resumeId: Int): Int{
        return resumeMapper.deleteResumeSflIntros(resumeId)
    }
}