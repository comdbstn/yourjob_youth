package com.yourjob.backend.mapper

import com.yourjob.backend.entity.Introduction
import com.yourjob.backend.entity.IntroductionCreate
import org.apache.ibatis.annotations.Mapper
import org.springframework.stereotype.Repository

@Repository
@Mapper
interface IntroductionsMapper {
    fun selectIntroductionList(mutableMap: MutableMap<String, Any>): List<MutableMap<String, Any>>
    fun insertIntroduction(introductionCreate: IntroductionCreate): Int
    fun updateIntroduction(introductionCreate: IntroductionCreate): Int
    fun deleteIntroduction(id: Int): Int
    fun selectIntroductionDetail(id: Int): Introduction
}