package com.yourjob.backend.controller

import com.yourjob.backend.entity.*
import com.yourjob.backend.service.AuthService
import com.yourjob.backend.service.CommunityService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.io.IOException
import java.time.LocalDate

@RestController
@RequestMapping("/api/v1")
class CommunityController (
    private var communityService: CommunityService,
    private var authService: AuthService){
    @GetMapping("/community/posts")
    //fun api_v1_community_post_list(session: HttpSession,  country: String, searchType: String, query: String, page: Int, size: Int): ResponseEntity<Array<Any>>{
    //fun api_v1_community_post_list(session: HttpSession,  country: String, searchType: String, query: String, page: Int, size: Int): ResponseEntity<MutableMap<String, Any>>{
    fun api_v1_community_post_list(request: HttpServletRequest, session: HttpSession,  country: String, searchType: String, query: String, page: Int, size: Int): ResponseEntity<Any>{
        try{
            var user_id = session.getAttribute("userId")
//            var user_name = session.getAttribute("userName")
//            if (user_id == null){
//                user_name = "tmp_name"
//                user_id = 30
//                //return ResponseEntity(HttpStatus.UNAUTHORIZED)
//            }
            var categoryId = 1 // 기본값: 일반 카테고리
            if(country == "domestic"){
                categoryId = 1 // 국내 채용 관련
            }else if (country == "general"){
                categoryId = 2 // 일반 토론
            }else if (country == "career"){
                categoryId = 3 // 취업 정보
            }else if (country == "review"){
                categoryId = 4 // 기업 리뷰
            }else if (country == "other"){
                categoryId = 5 // 기타
            }
            var offSetNumb = getOffSetNumb(page, size)
            var mMap = mutableMapOf<String, Any>()
            mMap.put("searchType", searchType)
            mMap.put("categoryId", categoryId)
            mMap.put("type", "public")
            mMap.put("query", query.toString())
            mMap.put("offSetNumb", offSetNumb)
            mMap.put("size", size)
            var postList = communityService.selectPostList(mMap)
            var postCnt = communityService.selectPostCnt(mMap)
            var pageCnt = postCnt / size
            var pageCnt_remain = postCnt % size
            if (pageCnt_remain > 0) {
                pageCnt = pageCnt + 1
            }


            var postIdx = 1
            for(post in postList){
                //post.id = postIdx++
                post.writer = post.writer
                post.commentCount = post.commentCount
                post.isMine = if (user_id == post.userId) true else false
            }
            var resp_mMap = mutableMapOf<String, Any>()
            resp_mMap.put("totalElements", postCnt)
            resp_mMap.put("totalPages", pageCnt)
            resp_mMap.put("currentPage", page)
            resp_mMap.put("posts", postList.toTypedArray())
            resp_mMap.put("map", postList)

            var re = request.queryString
            if(re.contains("country=best")){//메인
                return ResponseEntity(postList.toTypedArray(), HttpStatus.OK)
            }else{
                return ResponseEntity(resp_mMap, HttpStatus.OK)
            }

            //return ResponseEntity(postList.toTypedArray(), HttpStatus.OK)
            //return ResponseEntity(resp_mMap, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @GetMapping("/community/postsBest")
    //fun api_v1_community_post_list(session: HttpSession,  country: String, searchType: String, query: String, page: Int, size: Int): ResponseEntity<Array<Any>>{
    //fun api_v1_community_post_list(session: HttpSession,  country: String, searchType: String, query: String, page: Int, size: Int): ResponseEntity<MutableMap<String, Any>>{
    fun api_v1_community_post_list_best(request: HttpServletRequest, session: HttpSession,  country: String, searchType: String, query: String, page: Int, size: Int): ResponseEntity<Any>{
        try{
            var user_id = session.getAttribute("userId")
//            var user_name = session.getAttribute("userName")
//            if (user_id == null){
//                user_name = "tmp_name"
//                user_id = 30
//                //return ResponseEntity(HttpStatus.UNAUTHORIZED)
//            }
            var categoryId = 1 // 기본값: 일반 카테고리
            if(country == "domestic"){
                categoryId = 1 // 국내 채용 관련
            }else if (country == "general"){
                categoryId = 2 // 일반 토론
            }else if (country == "career"){
                categoryId = 3 // 취업 정보
            }else if (country == "review"){
                categoryId = 4 // 기업 리뷰
            }else if (country == "other"){
                categoryId = 5 // 기타
            }
            var offSetNumb = getOffSetNumb(page, size)
            var mMap = mutableMapOf<String, Any>()
            mMap.put("searchType", searchType)
            mMap.put("categoryId", categoryId)
            mMap.put("type", "public")
            mMap.put("query", query.toString())
            mMap.put("offSetNumb", offSetNumb)
            mMap.put("size", size)
            var postList = communityService.selectPostListBest(mMap)
            var postCnt = communityService.selectPostCnt(mMap)
            var pageCnt = postCnt / size
            var pageCnt_remain = postCnt % size
            if (pageCnt_remain > 0) {
                pageCnt = pageCnt + 1
            }
            var postIdx = 1 + (page-1) * size
            for(post in postList){
                //post.id = postIdx++
                post.idx = postIdx++;
//                post.writer = user_name.toString()
                post.writer = post.writer
                post.commentCount = post.commentCount
                post.isMine = if (user_id == post.userId) true else false
            }
            var resp_mMap = mutableMapOf<String, Any>()
            resp_mMap.put("totalPages", pageCnt)
            resp_mMap.put("currentPage", page)
            resp_mMap.put("posts", postList.toTypedArray())
            resp_mMap.put("map", postList)

            var re = request.queryString
            if(re.contains("country=best")){//메인
                return ResponseEntity(postList.toTypedArray(), HttpStatus.OK)
            }else{
                return ResponseEntity(resp_mMap, HttpStatus.OK)
            }

            //return ResponseEntity(postList.toTypedArray(), HttpStatus.OK)
            //return ResponseEntity(resp_mMap, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @PostMapping("/community/posts")
    fun api_v1_community_post_create(session: HttpSession, @RequestBody communityPostCreate: CommunityPostCreate): ResponseEntity<CommunityPostDetail>{
        try{
            var user_id = session.getAttribute("userId")
            var userinfo = authService.getUserInfoByUserId(user_id.toString().toInt())
            var user_name = null_checker_for_string(userinfo.get("name"))
            if (user_id == null || user_name == ""){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            var categoryidx = 1
            var category_name = communityPostCreate.category
                if (category_name != null) {
                categoryidx = communityService.communityCategoryIdx(category_name)
            }
            var reqMap = mutableMapOf<String, Any>()
            reqMap.put("userid", user_id)
            reqMap.put("categoryid", categoryidx)
            reqMap.put("type", "public")
            reqMap.put("title", communityPostCreate.title.toString())
            reqMap.put("writer", user_name)
            reqMap.put("content", communityPostCreate.content.toString())
            var insertCnt = communityService.insertPost(reqMap)
            val localDate: LocalDate = LocalDate.now()
            var postDetail = CommunityPostDetail()
            postDetail.id = communityPostCreate.id
            postDetail.subTitle = communityPostCreate.title
            postDetail.title = communityPostCreate.title
            postDetail.writer = user_id.toString()
            postDetail.date = localDate.toString()
            postDetail.views = 0
            postDetail.likes = 0
            postDetail.content = communityPostCreate.content
            postDetail.comments = emptyArray<CommunityComment>()
            return ResponseEntity(postDetail, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @GetMapping("/community/posts/{id}")
    fun api_v1_community_post_view(
        request: HttpServletRequest,
        session: HttpSession,
        @PathVariable id: Int
    ): ResponseEntity<CommunityPostDetail?> {
        var user_id = session.getAttribute("userId")
        // 세션에서 조회한 게시글 목록 가져오기
        val viewedPosts = session.getAttribute("viewedPosts") as? MutableSet<Int> ?: mutableSetOf()

        // 이 게시글을 처음 조회하는 경우에만 조회수 증가
        if (!viewedPosts.contains(id)) {
            communityService.updatePostView(id)
            // 조회한 게시글 목록에 추가
            viewedPosts.add(id)
            session.setAttribute("viewedPosts", viewedPosts)
        }

        val communityPostDetail = communityService.selectPostDetail(id)

        if(user_id != null){
            communityPostDetail.isMine = if (user_id == communityPostDetail.userId) true else false

            val mMap = mutableMapOf<String, Any>()
            mMap["userId"] = user_id
            mMap["postId"] = id
            // 이미 추천했는지 확인
            val isRecommended = communityService.checkPostRecommend(mMap)
            if (isRecommended != null && isRecommended > 0){
                communityPostDetail.isLiked = true
            }
        }


        //차단 한 댓글들을 가져와서 차단 유저 리스트를 뽑아서 하나씩 차단 유저 댓글이라고 바꾼다.
        //var blockCmmnts = communityService.selectCommunityComments(id)
        var blockUserIdList = ArrayList<Int>();
        if(user_id != null) {
            var blockCmmnts = communityService.selectCommunityCommentsBlock(user_id.toString().toInt())
            for(blockCmmnt in blockCmmnts){
                blockUserIdList.add(blockCmmnt.cmmntUserId.toString().toInt())
            }
        }


        //댓글 가져와서 추가
        var communityComments = communityService.selectCommunityComments(id).map {
            it.also { comment -> comment.isMine = user_id == comment.userId }
        }
        for(communityComment in communityComments){
            val commentDelYn = communityComment.delYn
            if(commentDelYn == "y"){
                communityComment.content = "삭제된 댓글입니다."
            }
        }

        if(user_id != null) {
            for (communityComment in communityComments) {
                val commentMakerId = communityComment.userId
                if (blockUserIdList.contains(commentMakerId) == true) {
                    communityComment.content = "차단한 유저의 댓글입니다."
                }
            }
        }
        communityPostDetail.comments = communityComments.toTypedArray()
        return ResponseEntity(communityPostDetail, HttpStatus.OK)
    }

    @PutMapping("/community/posts/{id}")
    fun api_v1_community_post_edit(session: HttpSession, @PathVariable id: Int, @RequestBody communityPostCreate: CommunityPostCreate): ResponseEntity<CommunityPostDetail?> {
        try{
            var user_id = session.getAttribute("userId")
            if (user_id == null){
                //user_id = 1
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }

            var categoryidx = 1
            var category_name = communityPostCreate.category
            if (category_name != null) {
                categoryidx = communityService.communityCategoryIdx(category_name)
            }

            var reqMap = mutableMapOf<String, Any>()
            reqMap.put("postid", id)
            reqMap.put("title", communityPostCreate.title.toString())
            reqMap.put("content", communityPostCreate.content.toString())
            reqMap.put("categoryid", categoryidx)
            var editCnt = communityService.editPost(reqMap)
            val communityPostDetail = communityService.selectPostDetail(id)
            val communityComments = communityService.selectCommunityComments(id)
            communityPostDetail.comments = communityComments.toTypedArray()
            return ResponseEntity(communityPostDetail, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @DeleteMapping("/community/posts/{id}")
    fun api_v1_community_post_del(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<CommunityPostDetail?> {
        try {
            var del_rst = communityService.deletePost(id)
            return ResponseEntity(HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.NOT_FOUND)
        }
    }
    @PostMapping("/community/posts/{postId}/comments")
    fun api_v1_community_post_comment_create(session: HttpSession, @PathVariable postId: Int, @RequestBody communityCommentCreate: CommunityCommentCreate): ResponseEntity<CommunityComment>{
        try{
            var user_id = session.getAttribute("userId")
            var userinfo = authService.getUserInfoByUserId(user_id.toString().toInt())
            var user_name = null_checker_for_string(userinfo.get("name"))
            if (user_id == null || user_name == ""){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            communityCommentCreate.postId = postId

            val communityPostDetail = communityService.selectPostDetail(postId)
            val isDelYn = communityPostDetail.delYn
            //val commentDetail = communityService.selectPostDetail()
            var commentDelYn = "n" //대댓글을 달때 기존 커멘트가 삭제가 아닐 경우
            if(communityCommentCreate.recommentId != null){
                val commentDetail = communityService.selectCommunityCommentDetail(communityCommentCreate.recommentId.toString().toInt())
                commentDelYn = commentDetail.delYn.toString()
            }

            if(isDelYn == "n" && commentDelYn == "n") {
                communityCommentCreate.postId = postId
                communityCommentCreate.userId = user_id.toString().toInt()
                communityCommentCreate.writer = user_name.toString()
                var insertCnt = communityService.insertCommunityComment(communityCommentCreate)
                val localDate: LocalDate = LocalDate.now()
                var commentDetail = CommunityComment()
                commentDetail.id = communityCommentCreate.id
                commentDetail.content = communityCommentCreate.content
                return ResponseEntity(commentDetail, HttpStatus.OK)
            }else{
                return ResponseEntity(HttpStatus.CONFLICT)
            }

        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @PostMapping("/community/posts/{postId}/comments/delete")
    fun api_v1_community_post_comment_delete(session: HttpSession, @PathVariable postId: Int, @RequestBody communityCommentCreate: CommunityCommentCreate): ResponseEntity<CommunityComment>{
        try{
            var user_id = session.getAttribute("userId")
            var userinfo = authService.getUserInfoByUserId(user_id.toString().toInt())
            var user_name = null_checker_for_string(userinfo.get("name"))
            if (user_id == null || user_name == ""){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            communityCommentCreate.id = communityCommentCreate.commentId
            communityCommentCreate.postId = postId
            communityCommentCreate.userId = user_id.toString().toInt()
            communityCommentCreate.writer = user_name.toString()
            //var insertCnt = communityService.insertCommunityComment(communityCommentCreate)
            //var insertCnt = communityService.updateCommunityComment(communityCommentCreate)
            var insertCnt = communityService.deleteCommunityComment(communityCommentCreate)
            val localDate: LocalDate = LocalDate.now()
            var commentDetail = CommunityComment()
            commentDetail.id = communityCommentCreate.id
            commentDetail.content = communityCommentCreate.content
            return ResponseEntity(commentDetail, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @PutMapping("/community/posts/{postId}/comments/{commentId}")
    fun api_v1_community_post_comment_edit(session: HttpSession, @PathVariable postId: Int, @PathVariable commentId: Int, @RequestBody communityCommentCreate: CommunityCommentCreate): ResponseEntity<CommunityComment>{
        try{
            var user_id = session.getAttribute("userId")
            var userinfo = authService.getUserInfoByUserId(user_id.toString().toInt())
            var user_name = null_checker_for_string(userinfo.get("name"))
            if (user_id == null || user_name == ""){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }

            communityCommentCreate.id = commentId
            communityCommentCreate.postId = postId
            communityCommentCreate.userId = user_id.toString().toInt()
            communityCommentCreate.writer = user_name.toString()
            //var insertCnt = communityService.insertCommunityComment(communityCommentCreate)
            var insertCnt = communityService.updateCommunityComment(communityCommentCreate)
            val localDate: LocalDate = LocalDate.now()
            var commentDetail = CommunityComment()
            commentDetail.id = communityCommentCreate.id
            commentDetail.content = communityCommentCreate.content
            return ResponseEntity(commentDetail, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @PostMapping("/community/recommend/post/{postId}")
    fun api_v1_community_post_recommend_toggle(session: HttpSession, @PathVariable postId: Int): ResponseEntity<Any>{
        try {
            val userId = session.getAttribute("userId") ?: return ResponseEntity(HttpStatus.UNAUTHORIZED)

            val mMap = mutableMapOf<String, Any>()
            mMap["userId"] = userId
            mMap["postId"] = postId

            // 이미 추천했는지 확인
            val isRecommended = communityService.checkPostRecommend(mMap)

            if (isRecommended > 0) {
                // 이미 추천한 경우, 추천 취소
                val result = communityService.deletePostRecommend(mMap)
                val response = mapOf("message" to "게시글 추천이 취소되었습니다", "isLiked" to false)
                return ResponseEntity(response, HttpStatus.OK)
            } else {
                // 추천하지 않은 경우, 추천 추가
                val result = communityService.insertCommunityRecommend(mMap)
                val response = mapOf("message" to "게시글을 추천했습니다", "isLiked" to true)
                return ResponseEntity(response, HttpStatus.OK)
            }
        } catch (e: IOException) {
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        } catch (e: Exception) {
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @PostMapping("/community/recommend/comment/{commentId}")
    fun api_v1_community_comment_recommend_toggle(session: HttpSession, @PathVariable commentId: Int): ResponseEntity<Any> {
        try {
            val userId = session.getAttribute("userId") ?: return ResponseEntity(HttpStatus.UNAUTHORIZED)

            val mMap = mutableMapOf<String, Any>()
            mMap["userId"] = userId
            mMap["commentId"] = commentId

            // 이미 추천했는지 확인
            val isRecommended = communityService.checkCommentRecommend(mMap)

            if (isRecommended > 0) {
                // 이미 추천한 경우, 추천 취소
                val result = communityService.deleteCommentRecommend(mMap)
                val response = mapOf("message" to "댓글 추천이 취소되었습니다", "isLiked" to false)
                return ResponseEntity(response, HttpStatus.OK)
            } else {
                // 추천하지 않은 경우, 추천 추가
                val result = communityService.insertCommunityCommentRecommend(mMap)
                val response = mapOf("message" to "댓글을 추천했습니다", "isLiked" to true)
                return ResponseEntity(response, HttpStatus.OK)
            }
        } catch (e: IOException) {
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        } catch (e: Exception) {
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }


    @GetMapping("/community/mento/posts/{id}")
    fun api_v1_community_mento_post_view(
        request: HttpServletRequest,
        session: HttpSession,
        @PathVariable id: Int
    ): ResponseEntity<CommunityPostDetail?> {
        var user_id = session.getAttribute("userId")
        // 세션에서 조회한 게시글 목록 가져오기
        val viewedPosts = session.getAttribute("viewedPosts") as? MutableSet<Int> ?: mutableSetOf()

        // 이 게시글을 처음 조회하는 경우에만 조회수 증가
        if (!viewedPosts.contains(id)) {
            communityService.updatePostView(id)
            // 조회한 게시글 목록에 추가
            viewedPosts.add(id)
            session.setAttribute("viewedPosts", viewedPosts)
        }

        val communityPostDetail = communityService.selectPostDetailMento(id)

        //댓글 가져와서 추가
        /*val communityComments = communityService.selectCommunityComments(id).map {
            it.also { comment -> comment.isMine = user_id == comment.userId }
        }*/
        val communityComments = communityService.selectCommunityComments(id)
        if (user_id != null){
            for (communityComment in communityComments){
                if(user_id == communityComment.userId){
                    communityComment.isMine = true
                }
            }
        }
        communityPostDetail.comments = communityComments.toTypedArray()
        return ResponseEntity(communityPostDetail, HttpStatus.OK)
    }

    @GetMapping("/community/mento/posts")
    fun api_v1_community_mento_post_list(request: HttpServletRequest, session: HttpSession,  country: String, searchType: String, query: String, page: Int, size: Int): ResponseEntity<Any>{
        try{
            var user_id = session.getAttribute("userId")
//            var user_name = session.getAttribute("userName")
            //var userCompanyName = session.getAttribute("userCompanyName")
//            if (user_id == null){
//                user_name = "tmp_name"
//                user_id = 30
//                //return ResponseEntity(HttpStatus.UNAUTHORIZED)
//            }
            var categoryId = 0
            //europe
            //asia
            //oceania
            var offSetNumb = getOffSetNumb(page, size)
            var mMap = mutableMapOf<String, Any>()
            mMap.put("searchType", searchType)
            mMap.put("categoryId", categoryId)
            mMap.put("type", "mento")
            mMap.put("query", query.toString())
            mMap.put("offSetNumb", offSetNumb)
            mMap.put("size", size)
            var postList = communityService.selectPostList(mMap)
            //mMap.clear()

            var postCnt = communityService.selectPostCnt(mMap)
            var pageCnt = postCnt / size
            var pageCnt_remain = postCnt % size
            if (pageCnt_remain > 0) {
                pageCnt = pageCnt + 1
            }
            var postIdx = 1
            for(post in postList){
                //post.id = postIdx++
                if(post.companyName != null && post.companyName != ""){
                    post.subTitle = post.companyName
                }else{
                    post.subTitle = ""
                }
                //post.subTitle = userCompanyName.toString()
//                post.writer = user_name.toString()
                post.writer = post.writer
                post.commentCount = post.commentCount
                post.isMine = if (user_id == post.userId) true else false
            }
            var resp_mMap = mutableMapOf<String, Any>()
            resp_mMap.put("totalPages", pageCnt)
            resp_mMap.put("currentPage", page)
            resp_mMap.put("posts", postList.toTypedArray())
            resp_mMap.put("map", postList)

            var re = request.queryString
            if(re.contains("country=best")){//메인
                return ResponseEntity(postList.toTypedArray(), HttpStatus.OK)
            }else{
                return ResponseEntity(resp_mMap, HttpStatus.OK)
            }

            //return ResponseEntity(postList.toTypedArray(), HttpStatus.OK)
            //return ResponseEntity(resp_mMap, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @PutMapping("/community/mento/posts/{id}")
    fun api_v1_community_mento_post_edit(session: HttpSession, @PathVariable id: Int, @RequestBody communityPostCreate: CommunityPostCreate): ResponseEntity<CommunityPostDetail?> {
        try{
            var user_id = session.getAttribute("userId")
            if (user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }

            // 기존 게시글 확인 (권한 체크 등을 위해)
            val communityPostDetail = communityService.selectPostDetailMento(id)

            // 자신의 글만 수정 가능하도록 체크 (옵션)
            /*if (user_id != communityPostDetail.userId) {
                return ResponseEntity(HttpStatus.FORBIDDEN)
            }*/

            var reqMap = mutableMapOf<String, Any>()
            reqMap.put("postid", id)
            reqMap.put("title", communityPostCreate.title.toString())
            reqMap.put("content", communityPostCreate.content.toString())
            reqMap.put("companyName", communityPostCreate.companyName.toString())

            // 기존 editPost 메서드 활용
            var editCnt = communityService.editPost(reqMap)

            // 업데이트된 게시글 정보 반환
            val updatedPostDetail = communityService.selectPostDetail(id)
            val communityComments = communityService.selectCommunityComments(id)
            updatedPostDetail.comments = communityComments.toTypedArray()

            return ResponseEntity(updatedPostDetail, HttpStatus.OK)
        } catch (e: IOException) {
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @PostMapping("/community/mento/posts")
    fun api_v1_community_mento_post_create(session: HttpSession, @RequestBody communityPostCreate: CommunityPostCreate): ResponseEntity<CommunityPostDetail>{
        try{
            var user_id = session.getAttribute("userId")
            var userinfo = authService.getUserInfoByUserId(user_id.toString().toInt())
            var user_name = null_checker_for_string(userinfo.get("name"))
            if (user_id == null || user_name == ""){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            var categoryidx = 1
            var category_name = communityPostCreate.category
            if (category_name != null) {
                categoryidx = communityService.communityCategoryIdx(category_name)
            }
            var reqMap = mutableMapOf<String, Any>()
            reqMap.put("userid", user_id)
            reqMap.put("categoryid", 0)
            reqMap.put("type", "mento")
            reqMap.put("title", communityPostCreate.title.toString())
            reqMap.put("writer", user_name)
            reqMap.put("content", communityPostCreate.content.toString())
            var insertCnt = communityService.insertPost(reqMap)
            val localDate: LocalDate = LocalDate.now()
            var postDetail = CommunityPostDetail()
            postDetail.id = communityPostCreate.id
            postDetail.subTitle = communityPostCreate.title
            postDetail.title = communityPostCreate.title
            postDetail.writer = user_id.toString()
            postDetail.date = localDate.toString()
            postDetail.views = 0
            postDetail.likes = 0
            postDetail.content = communityPostCreate.content
            postDetail.comments = emptyArray<CommunityComment>()
            return ResponseEntity(postDetail, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @PostMapping("/community/mento/posts/{postId}/comments")
    fun api_v1_community_post_comment_mento_create(session: HttpSession, @PathVariable postId: Int, @RequestBody communityCommentCreate: CommunityCommentCreate): ResponseEntity<CommunityComment>{
        try{
            var user_id = session.getAttribute("userId")
            var userinfo = authService.getUserInfoByUserId(user_id.toString().toInt())
            var user_name = null_checker_for_string(userinfo.get("name"))
            if (user_id == null || user_name == ""){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }

            communityCommentCreate.postId = postId
            communityCommentCreate.userId = user_id.toString().toInt()
            communityCommentCreate.writer = user_name.toString()
            var insertCnt = communityService.insertCommunityComment(communityCommentCreate)
            val localDate: LocalDate = LocalDate.now()
            var commentDetail = CommunityComment()
            commentDetail.id = communityCommentCreate.id
            commentDetail.content = communityCommentCreate.content
            return ResponseEntity(commentDetail, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @PostMapping("/community/posts/{postId}/comments/report")
    fun api_v1_community_post_comment_report_create(session: HttpSession, @PathVariable postId: Int, @RequestBody communityCommentReport: CommunityCommentReport): ResponseEntity<CommunityComment>{
        try{
            var user_id = session.getAttribute("userId")
            var userinfo = authService.getUserInfoByUserId(user_id.toString().toInt())
            var user_name = null_checker_for_string(userinfo.get("name"))
            if (user_id == null || user_name == ""){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }

            communityCommentReport.postId = postId
            communityCommentReport.userId = user_id.toString().toInt()
            //var insertCnt = communityService.insertCommunityComment(communityCommentReport)
            var insertCnt = communityService.insertCommunityCommentReport(communityCommentReport)
            val localDate: LocalDate = LocalDate.now()
            var commentDetail = CommunityComment()
            commentDetail.id = communityCommentReport.id
            return ResponseEntity(commentDetail, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @PostMapping("/community/posts/{postId}/comments/block")
    fun api_v1_community_post_comment_block_create(session: HttpSession, @PathVariable postId: Int, @RequestBody communityCommentBlock: CommunityCommentBlock): ResponseEntity<CommunityComment>{
        try{
            var user_id = session.getAttribute("userId")
            var userinfo = authService.getUserInfoByUserId(user_id.toString().toInt())
            var user_name = null_checker_for_string(userinfo.get("name"))
            if (user_id == null || user_name == ""){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }

            communityCommentBlock.postId = postId
            communityCommentBlock.userId = user_id.toString().toInt()
            val commentDetail = communityService.selectCommunityCommentDetail(communityCommentBlock.commentId.toString().toInt())
            val cmmntUserId = commentDetail.userId
            communityCommentBlock.cmmntUserId = cmmntUserId

            if(user_id == cmmntUserId) {
                return ResponseEntity(HttpStatus.CONFLICT)
            }
            //communityCommentBlock.writer = user_name.toString()
            var insertCnt = communityService.insertCommunityCommentBlock(communityCommentBlock)
            val localDate: LocalDate = LocalDate.now()
            commentDetail.id = communityCommentBlock.id
            return ResponseEntity(commentDetail, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    fun getOffSetNumb(page: Int, size: Int):Int{
        return (page - 1) * size
    }
    fun null_checker_for_string(s: Any?): String {
        if (s == null) {
            return ""
        } else {
            return s as String
        }
    }
}