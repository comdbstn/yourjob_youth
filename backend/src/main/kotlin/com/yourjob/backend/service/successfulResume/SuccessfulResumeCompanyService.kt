package com.yourjob.backend.service.successfulResume

import com.yourjob.backend.entity.successfulResume.*
import com.yourjob.backend.repository.successfulResume.*
import jakarta.persistence.EntityNotFoundException
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class SuccessfulResumeCompanyService(
    private val companyRepository: SuccessfulResumeCompanyRepository
) {
    @Transactional(readOnly = true)
    fun getAllCompanies(): List<SuccessfulResumeCompany> {
        return companyRepository.findAll()
    }

    @Transactional(readOnly = true)
    fun getCompanyById(companyId: Long): SuccessfulResumeCompany {
        return companyRepository.findById(companyId)
            .orElseThrow { EntityNotFoundException("Company with id $companyId not found") }
    }

    @Transactional(readOnly = true)
    fun searchCompanies(name: String?, countryType: CountryType?): List<SuccessfulResumeCompany> {
        if (name != null && countryType != null) {
            val nameResults = companyRepository.findByCompanyNameContaining(name)
            val countryResults = companyRepository.findByCountryType(countryType)
            return nameResults.filter { it in countryResults }
        } else if (name != null) {
            return companyRepository.findByCompanyNameContaining(name)
        } else if (countryType != null) {
            return companyRepository.findByCountryType(countryType)
        }

        return companyRepository.findAll()
    }

    @Transactional
    fun createCompany(company: SuccessfulResumeCompany): SuccessfulResumeCompany {
        return companyRepository.save(company)
    }

    @Transactional
    fun updateCompanyLogo(companyId: Long, corpLogoUrl: String): SuccessfulResumeCompany {
        val company = getCompanyById(companyId)
        val updatedCompany = company.copy(corpLogoUrl = corpLogoUrl)
        return companyRepository.save(updatedCompany)
    }
}