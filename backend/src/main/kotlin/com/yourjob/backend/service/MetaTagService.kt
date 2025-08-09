package com.yourjob.backend.service

import com.yourjob.backend.entity.MetaTagResponse
import com.yourjob.backend.service.mdms.CommunityPostManagementService
import org.springframework.stereotype.Service
import com.yourjob.backend.service.mdms.JobManagementService
import com.yourjob.backend.mapper.MetaTagMapper

@Service
class MetaTagService(
    private val jobManagementService: JobManagementService,
    private val communityPostManagementService: CommunityPostManagementService,
    private val metaTagMapper: MetaTagMapper
) {

    

    /**
     * 채용공고 메타태그 생성
     */
    fun generateJobMetaTag(jobId: Long, baseUrl: String): MetaTagResponse? {
        val jobDto = jobManagementService.getJobById(jobId) ?: return null
        
        val title = jobDto.title ?: "채용공고"
        val companyName = jobDto.companyName ?: "유어잡"
        val description = jobDto.position ?: title
        val url = "$baseUrl/jobs/$jobId"
    
        var logoUrl: String? = null
        jobDto.employerId?.let { employerId ->
            val userInfo = getUserInfoByUserId(employerId)
            logoUrl = userInfo?.get("corpLogo_Url") as String?
        }
        return MetaTagResponse(
            title = "$title - $companyName",
            description = description,
            image = logoUrl,
            url = url
        )
    }
    /**
     * 합격자소서 메타태그 생성
     */
    fun generateAcceptMetaTag(acceptId: Long, baseUrl: String): MetaTagResponse? {

        try {
            val result = metaTagMapper.selectAcceptDetailForMetaTag(acceptId)
            
            if (result == null) {
                return null
            }

            val companyName = result["company_name"] as String?
            val logoUrl = result["corp_logo_url"] as String?
            
            val metaTitle = "${companyName ?: "유어잡"} 합격자소서"
            val description = "${companyName ?: "유어잡"} 합격자소서 상세 페이지"
            val image = if (!logoUrl.isNullOrBlank()) logoUrl else null
            val url = "$baseUrl/accept/acceptdetail/$acceptId"
            
            
            return MetaTagResponse(
                title = metaTitle,
                description = description,
                image = image,
                url = url,
                type = "article"
            )
        } catch (e: Exception) {
            return MetaTagResponse(
                title = "유어잡 합격자소서",
                description = "유어잡 합격자소서 상세 페이지",
                image = "https://www.urjob.kr/img/og-image.png",
                url = "$baseUrl/accept/acceptdetail/$acceptId",
                type = "article"
            )
        }
    }

    /**
     * 커뮤니티 게시글 메타태그 생성
     */
    fun generateCommunityMetaTag(postId: Long, baseUrl: String): MetaTagResponse? {
        val postInfo = communityPostManagementService.getPostById(postId) ?: return null
        
        val title = "${postInfo.title} - 유어잡 커뮤니티"
        val description = postInfo.content.take(100) + if (postInfo.content.length > 100) "..." else ""
        val url = "$baseUrl/community/bbsview/$postId"
        
        return MetaTagResponse(
            title = title,
            description = description,
            image = "https://www.urjob.kr/img/og-image.png",
            url = url,
            type = "article"
        )
    }
    

    fun generateCommunityMentoMetaTag(postId: Long, baseUrl: String): MetaTagResponse? {
        val postInfo = communityPostManagementService.getPostById(postId) ?: return null
    
        val title = "${postInfo.title} - 유어잡 멘토링"
        val description = postInfo.content.take(100) + if (postInfo.content.length > 100) "..." else ""
        val url = "$baseUrl/community/mentoview/$postId"
        
        return MetaTagResponse(
            title = title,
            description = description,
            image = "https://www.urjob.kr/img/og-image.png",
            url = url,
            type = "article"
        )
    }


    /**
     * 사용자 정보 조회
     */
    private fun getUserInfoByUserId(userId: Long): MutableMap<String, Any>? {
        return try {
            val result = metaTagMapper.selectUserInfoForMetaTag(userId) ?: return null
            mutableMapOf<String, Any>(
                "userId" to (result["user_id"] as Number).toInt(),
                "companyName" to (result["company_name"] as String? ?: ""),
                "corpLogo_Url" to (result["corp_logo_url"] as String? ?: "")
            )
        } catch (e: Exception) {
            null
        }
    }
} 