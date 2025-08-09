package com.yourjob.backend.entity

data class SignupRequest(
    var id: Int = 0,
    var email: String = "",
    var password: String = "",
    var name: String = "",
    var phone: String = "",
    var phoneNumber: String = "",
    var userType: String = "",
    var gender: String? = null,
    var englishName: String? = null,
    var birth: String? = null,
    var nationality: String? = null,
    var visa: List<String>? = null,
    var visaString: String? = null,  // 컨트롤러에서 설정될 값
    var address: String? = null,
    var address_detail: String? = null,
    var zip_code: String? = null,
    var profileImage: String? = null
)