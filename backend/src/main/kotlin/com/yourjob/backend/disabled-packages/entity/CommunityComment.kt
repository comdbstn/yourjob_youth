package com.yourjob.backend.entity

class CommunityComment {
    var id: Int? = null
    var postId: Int? = null
    var userId: Int? = null
    var writer: String? = null
    //type: string description: "댓글 작성자 이름"
    var date: String? = null
    //type: string, format: date-time, description: community_comments.created_at
    var content: String? = null
    var likes: Int? = null
    var recommentId: Int? = null
    //type: number description: "부모 댓글 ID (대댓글인 경우)"
    var delYn: String? = null
    var isLiked: Boolean = false
    var isMine: Boolean = false
}