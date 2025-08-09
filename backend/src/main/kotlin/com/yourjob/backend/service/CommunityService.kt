package com.yourjob.backend.service

import com.yourjob.backend.entity.*
import com.yourjob.backend.mapper.CommunityMapper
import org.springframework.stereotype.Service

@Service
class CommunityService (private var communityMapper: CommunityMapper){
    fun selectPostList(mMap: MutableMap<String, Any>): List<CommunityPostListItem>{
        return communityMapper.selectPostList(mMap)
    }
    fun selectPostListBest(mMap: MutableMap<String, Any>): List<CommunityPostListItem>{
        return communityMapper.selectPostListBest(mMap)
    }
    fun selectPostCnt(mMap: MutableMap<String, Any>): Int{
        return communityMapper.selectPostCnt(mMap)
    }
    fun insertPost(mMap: MutableMap<String, Any>): Int {
        return communityMapper.insertPost(mMap)
    }
    fun communityCategoryIdx(category_name: String): Int{
        return communityMapper.communityCategoryIdx(category_name)
    }
    fun editPost(mMap: MutableMap<String, Any>): Int{
        return communityMapper.editPost(mMap)
    }
    fun deletePost(id: Int): Int{
        return communityMapper.deletePost(id)
    }
    fun selectPostDetail(id: Int): CommunityPostDetail{
        return communityMapper.selectPostDetail(id)
    }
    fun selectPostDetailMento(id: Int): CommunityPostDetail{
        return communityMapper.selectPostDetailMento(id)
    }

    fun selectCommunityCommentDetail(commentId: Int):CommunityComment{
        return communityMapper.selectCommunityCommentDetail(commentId)
    }
    fun updatePostView(id: Int): Int{
        return communityMapper.updatePostView(id)
    }
    fun selectCommunityComments(id: Int): List<CommunityComment>{
        return communityMapper.selectCommunityComments(id)
    }
    fun selectCommunityCommentsBlock(id: Int): List<CommunityCommentBlock>{
        return communityMapper.selectCommunityCommentsBlock(id)
    }
    fun insertCommunityComment(communityCommentCreate: CommunityCommentCreate): Int{
        return communityMapper.insertCommunityComment(communityCommentCreate)
    }
    fun insertCommunityCommentReport(communityCommentReport: CommunityCommentReport): Int{
        return communityMapper.insertCommunityCommentReport(communityCommentReport)
    }
    fun insertCommunityCommentBlock(communityCommentBlock: CommunityCommentBlock): Int{
        return communityMapper.insertCommunityCommentBlock(communityCommentBlock)
    }
    fun updateCommunityComment(communityCommentCreate: CommunityCommentCreate): Int{
        return communityMapper.updateCommunityComment(communityCommentCreate)
    }
    fun deleteCommunityComment(communityCommentCreate: CommunityCommentCreate): Int{
        return communityMapper.deleteCommunityComment(communityCommentCreate)
    }
    fun insertCommunityRecommend(mutableMap: MutableMap<String, Any>): Int{
        return communityMapper.insertCommunityRecommend(mutableMap)
    }
    fun insertCommunityCommentRecommend(mMap: MutableMap<String, Any>): Int {
        return communityMapper.insertCommunityCommentRecommend(mMap)
    }
    fun selectCommentReports(mMap: MutableMap<String, Any>): List<CommentReportItem> {
        return communityMapper.selectCommentReports(mMap)
    }

    fun selectCommentReportsCount(mMap: MutableMap<String, Any>): Int {
        return communityMapper.selectCommentReportsCount(mMap)
    }

    fun completeCommentReport(reportId: Int): Int {
        return communityMapper.completeCommentReport(reportId)
    }

    fun deleteCommentReport(reportId: Int): Int {
        return communityMapper.deleteCommentReport(reportId)
    }

    fun bulkDeleteCommentReports(reportIds: List<Int>): Int {
        return communityMapper.bulkDeleteCommentReports(reportIds)
    }
    fun checkPostRecommend(mMap: MutableMap<String, Any>): Int {
        return communityMapper.checkPostRecommend(mMap)
    }

    fun checkCommentRecommend(mMap: MutableMap<String, Any>): Int {
        return communityMapper.checkCommentRecommend(mMap)
    }

    fun deletePostRecommend(mMap: MutableMap<String, Any>): Int {
        return communityMapper.deletePostRecommend(mMap)
    }

    fun deleteCommentRecommend(mMap: MutableMap<String, Any>): Int {
        return communityMapper.deleteCommentRecommend(mMap)
    }
}