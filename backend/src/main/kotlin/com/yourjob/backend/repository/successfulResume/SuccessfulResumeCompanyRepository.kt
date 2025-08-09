package com.yourjob.backend.repository.successfulResume

import com.yourjob.backend.entity.successfulResume.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
@Repository
interface SuccessfulResumeCompanyRepository : JpaRepository<SuccessfulResumeCompany, Long> {
    fun findByCompanyNameContaining(companyName: String): List<SuccessfulResumeCompany>
    fun findByCountryType(countryType: CountryType): List<SuccessfulResumeCompany>
}
