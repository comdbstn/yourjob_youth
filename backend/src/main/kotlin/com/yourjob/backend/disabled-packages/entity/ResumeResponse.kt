package com.yourjob.backend.entity

class ResumeResponse {
    var resumeId: Int? = null
    var jobSeekerId: Int? = null
    var title: String? = null

    var name: String? = null
    var gender: String? = null
    var birth: String? = null
    var careerType: String? = null
    var phone: String? = null
    var englishName: String? = null
    var address: String? = null
    var nationality: String? = null
    var email: String? = null
    var visa: String? = null

    var filePath: String? = null
    var picturePath: String? = null
    var educations: ArrayList<Any>? = null
    var languages: ArrayList<Any>? = null
    var careers: ArrayList<Any>? = null
    var activities: ArrayList<Any>? = null
    var certifications: ArrayList<Any>? = null
    var awards: ArrayList<Any>? = null
    var selfIntroductions: ArrayList<Any>? = null
    var profileImgIdx: Int? = null
    var apostiuImgIdx: String? = null
    var apostilles: ArrayList<Any>? = null
    var employmentPreferences: MutableMap<String, Any>? = null
    var blind: Boolean? = null
    var responseStatus: String? = null
    var createdAt: String? = null
    var updatedAt: String? = null
}