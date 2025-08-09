package com.yourjob.backend.entity

class CommunityPostDetail {
    var id: Int? = null
    var userId: Int? = null
    var subTitle: String? = null
    var title: String? = null
    var writer: String? = null
    var date: String? = null
    var views: Int? = null
    var likes: Int? = null
    var delYn: String? = null
    var content: String? = null
    var comments: Array<CommunityComment>? = null
    var isLiked: Boolean = false
    var isMine: Boolean = false
    var companyName: String? = null
}