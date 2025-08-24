package com.yourjob.backend.controller

import com.yourjob.backend.entity.Introduction
import com.yourjob.backend.entity.IntroductionCreate
import com.yourjob.backend.service.IntroductionsService
import jakarta.servlet.http.HttpSession
import jakarta.validation.constraints.Size
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1")
class IntroductionsController (private var introductionsService: IntroductionsService){
    @GetMapping("/introductions")
    fun api_v1_introductions_list(status:String?, page:Int?, size: Size?): ResponseEntity<List<MutableMap<String, Any>>?>{
        var reqMap = mutableMapOf<String, Any>()
        reqMap.put("status", status.toString())
        reqMap.put("page", page.toString().toInt())
        reqMap.put("size", size.toString().toInt())
        var introduction_detail = introductionsService.selectIntroductionList(reqMap)
        return ResponseEntity(introduction_detail, HttpStatus.OK)
    }
    @PostMapping("/introductions")
    fun api_v1_introductions_insert(@RequestBody introductionCreate: IntroductionCreate): ResponseEntity<Introduction?>{
        var insertCnt = introductionsService.insertIntroduction(introductionCreate)
        var introduction_detail = introductionsService.selectIntroductionDetail(introductionCreate.id.toString().toInt())
        return ResponseEntity(introduction_detail, HttpStatus.OK)
    }
    @PostMapping("/introductions/{id}")
    fun api_v1_introductions_edit(@PathVariable id: Int, @RequestBody introductionCreate: IntroductionCreate): ResponseEntity<Introduction?>{
        introductionCreate.id = id
        var insertCnt = introductionsService.insertIntroduction(introductionCreate)
        var introduction_detail = introductionsService.selectIntroductionDetail(id)
        return ResponseEntity(introduction_detail, HttpStatus.OK)
    }
    @DeleteMapping("/introductions/{id}")
    fun api_v1_introductions_delete(session: HttpSession, @PathVariable id: Int): ResponseEntity<IntroductionCreate>{
        var delete_result = introductionsService.deleteIntroduction(id)
        return ResponseEntity(HttpStatus.OK)
    }
    @GetMapping("/introductions/{id}")
    fun api_v1_introductions_detail(@PathVariable id: Int): ResponseEntity<Introduction?>{
        var introduction_detail = introductionsService.selectIntroductionDetail(id)
        return ResponseEntity(introduction_detail, HttpStatus.OK)
    }
}