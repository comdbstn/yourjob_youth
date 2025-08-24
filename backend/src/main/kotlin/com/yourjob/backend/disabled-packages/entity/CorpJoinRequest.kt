package com.yourjob.backend.entity

data class CorpJoinRequest(
    var userid: Int? = null,
    var accountId: String? = null,
    var password: String? = null,
    var usertype: String? = null,
    var name: String? = null,
    var phone: String? = null,
    var email: String? = null,
    var managerName: String? = null,
    var managerPhone: String? = null,
    var managerEmail: String? = null,
    var companyName: String? = null,
    var businessRegistrationNumber: String? = null,
    var representative: String? = null,
    var corpcertImgidx: Int? = null,
    var capital: String? = null,
    var revenue: String? = null,
    var netIncome: String? = null,
    var companyAddress: String? = null,
    var corporateType: String? = null,
    var employeeCount: Int? = null
)
