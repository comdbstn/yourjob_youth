package com.yourjob.backend.mapper

import com.yourjob.backend.entity.TalentPoolRequest
import com.yourjob.backend.entity.TalentPoolResponse
import org.apache.ibatis.annotations.Mapper
import org.springframework.stereotype.Repository

@Repository
@Mapper
interface TalentMapper {
    fun selectTalentList(employerId: Int): List<TalentPoolResponse?>?
    fun selectTalentSearchListCnt(mutableMap: MutableMap<String, Any>): Int
    fun selectTalentSearchList(mutableMap: MutableMap<String, Any>): ArrayList<Any>
    fun selectTalentSearchListByParams(mutableMap: MutableMap<String, Any>): ArrayList<Any>
    fun selectScrapListByEmp(mutableMap: MutableMap<String, Any>): ArrayList<Any>
    fun selectScrapListByEmpCnt(mutableMap: MutableMap<String, Any>): Int
    fun selectJobOfferListByEmp(mutableMap: MutableMap<String, Any>): ArrayList<Any>
    fun selectRecentViewListByEmp(mutableMap: MutableMap<String, Any>): ArrayList<Any>
    fun selectRecentViewListByEmpCnt(mutableMap: MutableMap<String, Any>): Int
    fun selectTalentSearchListByParamsCnt(mutableMap: MutableMap<String, Any>): Int
    fun insertTalent(talentPoolRequest: TalentPoolRequest): Int
    fun insertTalentScrap(mutableMap: MutableMap<String, Any>): Int
    fun getTalentScrap(mutableMap: MutableMap<String, Any>): ArrayList<Any>
    fun getTalentInfo(talentPoolRequest: TalentPoolRequest): TalentPoolResponse
    fun updateTalent(talentPoolRequest: TalentPoolRequest): Int
    fun deleteTalent(talentPoolRequest: TalentPoolRequest): Int
    fun deleteTalentScrap(mutableMap: MutableMap<String, Any>): Int
    fun deleteCorpScrap(corpScrapId: Int): Int
    // 추천 알고리즘을 위한 추가 메서드
    fun selectTalentSearchListForRecommendation(mutableMap: MutableMap<String, Any>): ArrayList<Any>
    fun selectResumeCareers(resumeId: Int): ArrayList<Any>
    fun selectResumeAwards(resumeId: Int): ArrayList<Any>
    fun selectResumeActivities(resumeId: Int): ArrayList<Any>
}