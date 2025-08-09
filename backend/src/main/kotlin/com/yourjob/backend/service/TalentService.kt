package com.yourjob.backend.service

import com.yourjob.backend.entity.TalentPoolRequest
import com.yourjob.backend.entity.TalentPoolResponse
import com.yourjob.backend.mapper.TalentMapper
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException

@Service
class TalentService (private var talentMapper: TalentMapper){
    fun selectTalentList(employerId: Int): List<TalentPoolResponse?>?{
        return talentMapper.selectTalentList(employerId)
    }
    fun selectTalentSearchList(mutableMap: MutableMap<String, Any>): List<Any> {
        // 정렬 타입이 추천순인 경우
        if (mutableMap["srchSrtType"] == "recommended") {
            val talents = talentMapper.selectTalentSearchListForRecommendation(mutableMap)

            // 각 인재에 대한 추천 점수 계산
            val scoredTalents = calculateRecommendationScores(talents)

            // 점수 기준 내림차순 정렬
            return scoredTalents.sortedByDescending { it.second }.map { it.first }
        }

        // 업데이트일순이면 기존 메서드 사용
        return talentMapper.selectTalentSearchList(mutableMap)
    }

    // 인재 추천 점수 계산 함수
    private fun calculateRecommendationScores(talents: List<Any>): List<Pair<Any, Double>> {
        val scoredTalents = mutableListOf<Pair<Any, Double>>()

        for (talent in talents) {
            talent as MutableMap<String, Any>
            var score = 0.0
            val resumeId = talent["resume_id"].toString().toInt()

            // 1. 경력 점수
            val careerScore = calculateCareerScore(talent, resumeId)
            score += careerScore

            // 2. 자격증 점수
            val certScore = calculateCertificationScore(talent)
            score += certScore

            // 3. 학력 점수
            val eduScore = calculateEducationScore(talent)
            score += eduScore

            // 4. 수상 경력 점수
            val awardScore = calculateAwardScore(resumeId)
            score += awardScore

            // 5. 기타 활동 점수
            val activityScore = calculateActivityScore(resumeId)
            score += activityScore

            scoredTalents.add(Pair(talent, score))
        }

        return scoredTalents
    }

    // 경력 점수 계산
    private fun calculateCareerScore(talent: MutableMap<String, Any>, resumeId: Int): Double {
        var careerScore = 0.0
        val companyName = talent["companyName"]?.toString() ?: ""

        // 회사명이 있으면 기본 점수 부여
        if (companyName.isNotBlank() && companyName != "null") {
            careerScore += 10.0
        }

        // 경력 기간에 따른 점수 계산
        try {
            val resumeCareers = talentMapper.selectResumeCareers(resumeId)
            if (resumeCareers.isNotEmpty()) {
                var totalMonths = 0

                for (career in resumeCareers) {
                    career as MutableMap<String, Any>
                    val startDate = career["startDate"]?.toString() ?: ""
                    val endDate = career["endDate"]?.toString() ?: ""

                    if (startDate.isNotBlank() && endDate.isNotBlank()) {
                        try {
                            val startLocalDate = LocalDate.parse(startDate, DateTimeFormatter.ISO_DATE)
                            val endLocalDate = LocalDate.parse(endDate, DateTimeFormatter.ISO_DATE)

                            val years = endLocalDate.year - startLocalDate.year
                            val months = endLocalDate.monthValue - startLocalDate.monthValue

                            totalMonths += (years * 12) + months
                        } catch (e: DateTimeParseException) {
                            // 날짜 파싱 실패 시 무시
                        }
                    }
                }

                // 경력 월수에 따른 점수
                careerScore += when {
                    totalMonths >= 96 -> 50.0  // 8년 이상
                    totalMonths >= 60 -> 40.0  // 5년 이상
                    totalMonths >= 36 -> 30.0  // 3년 이상
                    totalMonths >= 24 -> 20.0  // 2년 이상
                    totalMonths >= 12 -> 10.0  // 1년 이상
                    else -> 0.0                // 경력 없음
                }
            }
        } catch (e: Exception) {
            // 예외 발생 시 기본 점수만 반환
        }

        return careerScore
    }

    // 자격증 점수 계산
    private fun calculateCertificationScore(talent: MutableMap<String, Any>): Double {
        var certScore = 0.0
        val certificationName = talent["certificationName"]?.toString() ?: ""

        // 자격증이 있으면 점수 부여
        if (certificationName.isNotBlank() && certificationName != "null") {
            certScore += 10.0
        }

        return certScore
    }

    // 학력 점수 계산
    private fun calculateEducationScore(talent: MutableMap<String, Any>): Double {
        var eduScore = 0.0

        // 최종학력에 따른 점수
        val lastSchool = talent["lastSchool"]?.toString() ?: ""
        eduScore += when (lastSchool) {
            "univ4" -> 30.0    // 4년제 대학
            "univ2" -> 20.0    // 2/3년제 대학
            else -> 0.0
        }

        // 학점 정보가 있으면 추가 점수
        val gpa = talent["gpa"]?.toString()?.toDoubleOrNull()
        if (gpa != null) {
            eduScore += when {
                gpa >= 4.0 -> 30.0
                gpa >= 3.5 -> 20.0
                gpa >= 3.0 -> 10.0
                gpa >= 2.5 -> 5.0
                else -> 0.0
            }
        }

        return eduScore
    }

    // 수상 경력 점수 계산
    private fun calculateAwardScore(resumeId: Int): Double {
        var awardScore = 0.0

        try {
            val awards = talentMapper.selectResumeAwards(resumeId)
            // 수상 경력이 있으면 건당 5점, 최대 10점
            awardScore = minOf(awards.size * 5.0, 10.0)
        } catch (e: Exception) {
            // 예외 발생 시 0점 반환
        }

        return awardScore
    }

    // 기타 활동 점수 계산
    private fun calculateActivityScore(resumeId: Int): Double {
        var activityScore = 0.0

        try {
            val activities = talentMapper.selectResumeActivities(resumeId)
            // 활동 경험이 있으면 건당 2점, 최대 6점
            activityScore = minOf(activities.size * 2.0, 6.0)
        } catch (e: Exception) {
            // 예외 발생 시 0점 반환
        }

        return activityScore
    }
    fun selectTalentSearchListCnt(mutableMap: MutableMap<String, Any>): Int{
        return talentMapper.selectTalentSearchListCnt(mutableMap)
    }
    fun selectTalentSearchListByParams(mutableMap: MutableMap<String, Any>): List<Any>{
        return talentMapper.selectTalentSearchListByParams(mutableMap)
    }
    fun selectScrapListByEmp(mutableMap: MutableMap<String, Any>): List<Any>{
        return talentMapper.selectScrapListByEmp(mutableMap)
    }
    fun selectScrapListByEmpCnt(mutableMap: MutableMap<String, Any>): Int{
        return talentMapper.selectScrapListByEmpCnt(mutableMap)
    }
    fun selectJobOfferListByEmp(mutableMap: MutableMap<String, Any>): List<Any>{
        return talentMapper.selectJobOfferListByEmp(mutableMap)
    }
    fun selectRecentViewListByEmp(mutableMap: MutableMap<String, Any>): List<Any>{
        return talentMapper.selectRecentViewListByEmp(mutableMap)
    }
    fun selectRecentViewListByEmpCnt(mutableMap: MutableMap<String, Any>): Int{
        return talentMapper.selectRecentViewListByEmpCnt(mutableMap)
    }
    fun selectTalentSearchListByParamsCnt(mutableMap: MutableMap<String, Any>): Int{
        return talentMapper.selectTalentSearchListByParamsCnt(mutableMap)
    }
    fun insertTalent(talentPoolRequest: TalentPoolRequest): Int{
        return talentMapper.insertTalent(talentPoolRequest)
    }
    fun insertTalentScrap(mutableMap: MutableMap<String, Any>): Int{
        return talentMapper.insertTalentScrap(mutableMap)
    }
    fun getTalentScrap(mutableMap: MutableMap<String, Any>): ArrayList<Any>{
        return talentMapper.getTalentScrap(mutableMap)
    }
    fun getTalentInfo(talentPoolRequest: TalentPoolRequest): TalentPoolResponse{
        return talentMapper.getTalentInfo(talentPoolRequest)
    }
    fun updateTalent(talentPoolRequest: TalentPoolRequest): Int{
        return talentMapper.updateTalent(talentPoolRequest)
    }
    fun deleteTalent(talentPoolRequest: TalentPoolRequest): Int{
        return talentMapper.deleteTalent(talentPoolRequest)
    }
    fun deleteTalentScrap(mutableMap: MutableMap<String, Any>): Int{
        return talentMapper.deleteTalentScrap(mutableMap)
    }
    fun deleteCorpScrap(scrapId:Int): Int{
        return talentMapper.deleteCorpScrap(scrapId)
    }
}