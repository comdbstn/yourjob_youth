package com.yourjob.backend.entity

class VolunteerListResponse (
    var content: ArrayList<Volunteer?>? = null,
    var page: Int? = null,
    var size: Int? = null,
    var totalPages: Int? = null,
    var totalElements: Int? = null
)