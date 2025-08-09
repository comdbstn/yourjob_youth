package com.yourjob.backend.entity

class JobRequest {
    var jobid: Int? = null
    var employerid: Int? = null
    var applicationMethod: Any? = null
    var applicationPeriod: Any? = null
    var capabilities: Any? = null
    var career: Any? = null
    var companyInfo: Any? = null
    var content: String? = null
    var employmentType: Any? = null
    var jobType: Any? = null
    var position: Any? = null
    var position_rank: Any? = null
    var qualification: Any? = null
    var recruitmentCount: Any? = null
    var skills: Any? = null
    var terms: Any? = null
    var title: String? = null
    var workConditions: Any? = null
    var year_matter: Any? = null
    //아래에는 api spec 에는 있는데 프론트로 부터 실제 전달되지 않는 파라미터
    var description: String? = null
    var requirements: String? = null
    var location: String? = null
    var countryCode: String? = null
    var salary: Float? = null
    var deadline: String? = null
}