package com.yourjob.backend.controller

import com.yourjob.backend.entity.TalentPoolRequest
import com.yourjob.backend.entity.TalentPoolResponse
import com.yourjob.backend.service.TalentService
import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.io.IOException

@RestController
@RequestMapping("/talent-pool")
class TalentpoolController (private var talentService: TalentService){
    @GetMapping("/employers/{employerId}/talent")
    fun api_v1_employers_talent_list(@PathVariable employerId: Int, session: HttpSession): ResponseEntity<Array<TalentPoolResponse?>> {
        try {
            var user_id = session.getAttribute("userId")
            if (user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            val talentList = talentService.selectTalentList(employerId)
            val talentListToArr = talentList!!.toTypedArray()
            return ResponseEntity(talentListToArr, HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @PostMapping("/employers/{employerId}/talent")
    fun api_v1_employers_talent_insert(@PathVariable employerId: Int, @RequestBody talentPoolRequest: TalentPoolRequest, session: HttpSession): ResponseEntity<TalentPoolResponse?> {
        try{
            val user_id = session.getAttribute("userId")
            if (user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            var insertCnt = talentService.insertTalent(talentPoolRequest)
            return ResponseEntity(HttpStatus.CREATED)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @PostMapping("/employers/{employerId}/talent/{talentPoolId}")
    fun api_v1_employers_talent_edit(@PathVariable talentPoolId: Int, @PathVariable employerId: Int, @RequestBody talentPoolRequest: TalentPoolRequest, session: HttpSession): ResponseEntity<TalentPoolResponse?> {
        try{
            val user_id = session.getAttribute("userId")
            if (user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            talentPoolRequest.employerId = employerId
            talentPoolRequest.talentPoolId = talentPoolId
            var rst_val = talentService.updateTalent(talentPoolRequest)
            return ResponseEntity(HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @GetMapping("/employers/{employerId}/talent/{talentPoolId}")
    fun api_v1_employers_talent_view(@PathVariable talentPoolId: Int, @PathVariable employerId: Int, @RequestBody talentPoolRequest: TalentPoolRequest, session: HttpSession): ResponseEntity<TalentPoolResponse?> {
        try{
            val user_id = session.getAttribute("userId")
            if (user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            talentPoolRequest.employerId = employerId
            talentPoolRequest.talentPoolId = talentPoolId
            var rst_val = talentService.getTalentInfo(talentPoolRequest)
            return ResponseEntity(HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    @DeleteMapping("/employers/{employerId}/talent/{talentPoolId}")
    fun api_v1_employers_talent_delete(@PathVariable talentPoolId: Int, @PathVariable employerId: Int, session: HttpSession): ResponseEntity<TalentPoolResponse?> {
        try{
            val user_id = session.getAttribute("userId")
            if (user_id == null){
                return ResponseEntity(HttpStatus.UNAUTHORIZED)
            }
            var talentPoolRequest = TalentPoolRequest()
            talentPoolRequest.employerId = employerId
            talentPoolRequest.talentPoolId = talentPoolId
            var rst_val = talentService.deleteTalent(talentPoolRequest)
            return ResponseEntity(HttpStatus.OK)
        }catch (e: IOException){
            return ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}