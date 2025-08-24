package com.yourjob.backend.service

import com.yourjob.backend.entity.Introduction
import com.yourjob.backend.entity.IntroductionCreate
import com.yourjob.backend.mapper.IntroductionsMapper
import org.springframework.stereotype.Service

@Service
class IntroductionsService (private var introductionsMapper: IntroductionsMapper){
    fun selectIntroductionList(mutableMap: MutableMap<String, Any>): List<MutableMap<String, Any>>{
        return introductionsMapper.selectIntroductionList(mutableMap)
    }
    fun insertIntroduction(introductionCreate: IntroductionCreate): Int{
        return introductionsMapper.insertIntroduction(introductionCreate)
    }
    fun updateIntroduction(introductionCreate: IntroductionCreate): Int{
        return introductionsMapper.updateIntroduction(introductionCreate)
    }
    fun deleteIntroduction(id: Int): Int{
        return introductionsMapper.deleteIntroduction(id)
    }
    fun selectIntroductionDetail(id: Int): Introduction{
        return introductionsMapper.selectIntroductionDetail(id)
    }
}