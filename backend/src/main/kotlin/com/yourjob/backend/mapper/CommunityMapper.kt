package com.yourjob.backend.mapper

import com.yourjob.backend.entity.*
import org.apache.ibatis.annotations.Mapper
import org.springframework.stereotype.Repository

@Repository
@Mapper
interface CommunityMapper {
    fun selectPostList(mMap: MutableMap<String, Any>): List<CommunityPostListItem>
    fun selectPostListBest(mMap: MutableMap<String, Any>): List<CommunityPostListItem>
    fun selectPostCnt(mMap: MutableMap<String, Any>): Int
    fun insertPost(mMap: MutableMap<String, Any>): Int
    fun communityCategoryIdx(category_name: String): Int
    fun editPost(mMap: MutableMap<String, Any>): Int
    fun deletePost(id: Int): Int
    fun selectPostDetail(id: Int): CommunityPostDetail
    fun selectPostDetailMento(id: Int): CommunityPostDetail

    fun selectCommunityCommentDetail(id: Int): CommunityComment
    fun updatePostView(id: Int): Int
    fun selectCommunityComments(id: Int): List<CommunityComment>
    fun selectCommunityCommentsBlock(id: Int): List<CommunityCommentBlock>
    fun insertCommunityComment(communityCommentCreate: CommunityCommentCreate): Int
    fun insertCommunityCommentReport(communityCommentReport: CommunityCommentReport): Int
    fun insertCommunityCommentBlock(communityCommentBlock: CommunityCommentBlock): Int
    fun updateCommunityComment(communityCommentCreate: CommunityCommentCreate): Int
    fun deleteCommunityComment(communityCommentCreate: CommunityCommentCreate): Int
    fun insertCommunityRecommend(mMap: MutableMap<String, Any>): Int
    fun insertCommunityCommentRecommend(mMap: MutableMap<String, Any>): Int
    fun selectCommentReports(mMap: MutableMap<String, Any>): List<CommentReportItem>
    fun selectCommentReportsCount(mMap: MutableMap<String, Any>): Int
    fun completeCommentReport(reportId: Int): Int
    fun deleteCommentReport(reportId: Int): Int
    fun bulkDeleteCommentReports(reportIds: List<Int>): Int
    fun checkPostRecommend(mMap: MutableMap<String, Any>): Int
    fun checkCommentRecommend(mMap: MutableMap<String, Any>): Int
    fun deletePostRecommend(mMap: MutableMap<String, Any>): Int
    fun deleteCommentRecommend(mMap: MutableMap<String, Any>): Int
}