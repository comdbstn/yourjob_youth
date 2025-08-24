package com.yourjob.backend.entity

data class CommentReportItem(
    var reportId: Int = 0,
    var reportUserId: Int = 0,
    var postId: Int = 0,
    var commentId: Int = 0,
    var createdAt: String = "",
    var postTitle: String = "",
    var postType: String = "",
    var commentContent: String = "",
    var commentCreatedAt: String = "",
    var reporterAccountId: String = "",
    var commentWriterAccountId: String = "",
    var isCleared: Boolean = false
)