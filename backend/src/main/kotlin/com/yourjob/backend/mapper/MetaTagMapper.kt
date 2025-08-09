package com.yourjob.backend.mapper

import org.apache.ibatis.annotations.Mapper
import org.apache.ibatis.annotations.Param
import org.springframework.stereotype.Repository

@Repository
@Mapper
interface MetaTagMapper {
    
    /**
     * 지원 상세 정보 조회 (메타태그용)
     */
    fun selectAcceptDetailForMetaTag(@Param("acceptId") acceptId: Long): MutableMap<String, Any>?
    
    /**
     * 사용자 정보 조회 (메타태그용)
     */
    fun selectUserInfoForMetaTag(@Param("userId") userId: Long): MutableMap<String, Any>?
}