package com.yourjob.backend.entity

class CommunityPostListItem {
    var id: Int? = null
    var idx: Int? = null
    var categoryId: Int? = null
    var userId: Int? = null
    var companyName: String? = null
    var subTitle: String? = null
    var title: String? = null
    var writer: String? = null
    //description: "게시글 작성자 이름"
    var content: String? = null
    var views: Int? = null
    var likes: Int? = null
    var date: String? = null
    var isMine: Boolean? = null
    //description: "현재 사용자와 작성자 비교 결과"
    var isNotice: Boolean? = null
    var commentCount: Int? = null
}