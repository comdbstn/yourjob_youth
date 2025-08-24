package com.yourjob.backend.service

import com.yourjob.backend.entity.CountryRequest
import com.yourjob.backend.entity.CountryResponse
import com.yourjob.backend.entity.DomesticUniversityRequest
import com.yourjob.backend.entity.DomesticUniversityResponse
import com.yourjob.backend.entity.InternationalUniversityRequest
import com.yourjob.backend.entity.InternationalUniversityResponse
import com.yourjob.backend.entity.MajorRequest
import com.yourjob.backend.entity.MajorResponse
import com.yourjob.backend.entity.CertificateListRequest
import com.yourjob.backend.entity.CertificateListResponse
import com.yourjob.backend.entity.UniversityClassificationRequest
import com.yourjob.backend.entity.UniversityClassificationResponse
import com.yourjob.backend.entity.GraduationStatusRequest
import com.yourjob.backend.entity.GraduationStatusResponse
import com.yourjob.backend.entity.RegionRequest
import com.yourjob.backend.entity.RegionResponse
import com.yourjob.backend.entity.DumsIntegratedView
import com.yourjob.backend.entity.CorporateTypeRequest
import com.yourjob.backend.entity.CorporateTypeResponse
import com.yourjob.backend.entity.JobTypeRequest
import com.yourjob.backend.entity.JobTypeResponse
import com.yourjob.backend.entity.JobCategoryRequest
import com.yourjob.backend.entity.JobCategoryResponse

import com.yourjob.backend.mapper.DumsMapper
import org.springframework.stereotype.Service

@Service
class DumsService(private val dumsMapper: DumsMapper) {

    // [Domestic University] CRUD
    fun insertDomesticUniversity(request: DomesticUniversityRequest): Int = dumsMapper.insertDomesticUniversity(request)
    fun updateDomesticUniversity(request: DomesticUniversityRequest): Int = dumsMapper.updateDomesticUniversity(request)
    fun deleteDomesticUniversity(id: Int): Int = dumsMapper.deleteDomesticUniversity(id)
    fun selectDomesticUniversityDetail(id: Int): DomesticUniversityResponse = dumsMapper.selectDomesticUniversityDetail(id)
    fun selectDomesticUniversityList(params: MutableMap<String, Any>): List<DomesticUniversityRequest> = dumsMapper.selectDomesticUniversityList(params)
    fun selectDomesticUniversityMajors(): List<String> = dumsMapper.selectDomesticUniversityMajors()

    // [International University] CRUD
    fun insertInternationalUniversity(request: InternationalUniversityRequest): Int = dumsMapper.insertInternationalUniversity(request)
    fun updateInternationalUniversity(request: InternationalUniversityRequest): Int = dumsMapper.updateInternationalUniversity(request)
    fun deleteInternationalUniversity(id: Int): Int = dumsMapper.deleteInternationalUniversity(id)
    fun selectInternationalUniversityDetail(id: Int): InternationalUniversityResponse = dumsMapper.selectInternationalUniversityDetail(id)
    fun selectInternationalUniversityList(params: MutableMap<String, Any>): List<InternationalUniversityRequest> = dumsMapper.selectInternationalUniversityList(params)

    // [Major] CRUD
    fun insertMajor(request: MajorRequest): Int = dumsMapper.insertMajor(request)
    fun updateMajor(request: MajorRequest): Int = dumsMapper.updateMajor(request)
    fun deleteMajor(id: Int): Int = dumsMapper.deleteMajor(id)
    fun selectMajorDetail(id: Int): MajorResponse = dumsMapper.selectMajorDetail(id)
    fun selectMajorList(params: MutableMap<String, Any>): List<MajorRequest> = dumsMapper.selectMajorList(params)
    fun getUniversityNameList(keyword: String?): List<String> = dumsMapper.selectUniversityNameList(keyword)

    // [Certificate List] CRUD
    fun insertCertificate(request: CertificateListRequest): Int = dumsMapper.insertCertificate(request)
    fun updateCertificate(request: CertificateListRequest): Int = dumsMapper.updateCertificate(request)
    fun deleteCertificate(id: Int): Int = dumsMapper.deleteCertificate(id)
    fun selectCertificateDetail(id: Int): CertificateListResponse = dumsMapper.selectCertificateDetail(id)
    fun selectCertificateList(params: MutableMap<String, Any>): List<CertificateListRequest> = dumsMapper.selectCertificateList(params)

    // [University Classification] CRUD
    fun insertUniversityClassification(request: UniversityClassificationRequest): Int = dumsMapper.insertUniversityClassification(request)
    fun updateUniversityClassification(request: UniversityClassificationRequest): Int = dumsMapper.updateUniversityClassification(request)
    fun deleteUniversityClassification(id: Int): Int = dumsMapper.deleteUniversityClassification(id)
    fun selectUniversityClassificationDetail(id: Int): UniversityClassificationResponse = dumsMapper.selectUniversityClassificationDetail(id)
    fun selectUniversityClassificationList(params: MutableMap<String, Any>): List<UniversityClassificationRequest> = dumsMapper.selectUniversityClassificationList(params)

    // [Graduation Status] CRUD
    fun insertGraduationStatus(request: GraduationStatusRequest): Int = dumsMapper.insertGraduationStatus(request)
    fun updateGraduationStatus(request: GraduationStatusRequest): Int = dumsMapper.updateGraduationStatus(request)
    fun deleteGraduationStatus(id: Int): Int = dumsMapper.deleteGraduationStatus(id)
    fun selectGraduationStatusDetail(id: Int): GraduationStatusResponse = dumsMapper.selectGraduationStatusDetail(id)
    fun selectGraduationStatusList(params: MutableMap<String, Any>): List<GraduationStatusRequest> = dumsMapper.selectGraduationStatusList(params)

    // [Region] CRUD
    fun selectAllRegions(): List<RegionRequest> = dumsMapper.selectAllRegions()
    fun insertRegion(request: RegionRequest): Int = dumsMapper.insertRegion(request)
    fun updateRegion(request: RegionRequest): Int = dumsMapper.updateRegion(request)
    fun deleteRegion(id: Int): Int = dumsMapper.deleteRegion(id)
    fun selectRegionDetail(id: Int): RegionResponse = dumsMapper.selectRegionDetail(id)
    fun selectRegionList(params: MutableMap<String, Any>): List<RegionRequest> = dumsMapper.selectRegionList(params)

    fun insertCountry(request: CountryRequest): Int = dumsMapper.insertCountry(request)
    fun updateCountry(request: CountryRequest): Int = dumsMapper.updateCountry(request)
    fun deleteCountry(countryId: Int): Int = dumsMapper.deleteCountry(countryId)
    fun selectCountryDetail(countryId: Int): CountryResponse = dumsMapper.selectCountryDetail(countryId)
    fun selectCountryList(params: MutableMap<String, Any>): List<CountryRequest> = dumsMapper.selectCountryList(params)

    // [Corporate Type] CRUD
    fun insertCorporateType(request: CorporateTypeRequest): Int = dumsMapper.insertCorporateType(request)
    fun updateCorporateType(request: CorporateTypeRequest): Int = dumsMapper.updateCorporateType(request)
    fun deleteCorporateType(id: Int): Int = dumsMapper.deleteCorporateType(id)
    fun selectCorporateTypeDetail(id: Int): CorporateTypeResponse = dumsMapper.selectCorporateTypeDetail(id)
    fun selectCorporateTypeList(params: MutableMap<String, Any>): List<CorporateTypeRequest> = dumsMapper.selectCorporateTypeList(params)
    fun selectAllCorporateTypes(): List<CorporateTypeResponse> = dumsMapper.selectAllCorporateTypes()

    // [Job Type] CRUD
    fun insertJobType(request: JobTypeRequest): Int = dumsMapper.insertJobType(request)
    fun updateJobType(request: JobTypeRequest): Int = dumsMapper.updateJobType(request)
    fun deleteJobType(id: Int): Int = dumsMapper.deleteJobType(id)
    fun selectJobTypeDetail(id: Int): JobTypeResponse = dumsMapper.selectJobTypeDetail(id)
    fun selectJobTypeList(params: MutableMap<String, Any>): List<JobTypeRequest> = dumsMapper.selectJobTypeList(params)
    fun selectAllJobTypes(): List<JobTypeResponse> = dumsMapper.selectAllJobTypes()

    // [Job Category] CRUD
    fun createJobCategory(request: JobCategoryRequest): Int {
        return dumsMapper.insertJobCategory(request)
    }

    fun updateJobCategory(request: JobCategoryRequest): Int {
        return dumsMapper.updateJobCategory(request)
    }

    fun deleteJobCategory(jobCategoryId: Int): Int {
        return dumsMapper.deleteJobCategory(jobCategoryId)
    }

    fun getJobCategoryDetail(jobCategoryId: Int): JobCategoryResponse {
        return dumsMapper.selectJobCategoryDetail(jobCategoryId)
    }

    fun getJobCategories(keyword: String?, page: Int, size: Int): List<JobCategoryResponse> {
        val params = mutableMapOf<String, Any>()
        params["offset"] = (page - 1) * size
        params["size"] = size
        if (!keyword.isNullOrEmpty()) {
            params["keyword"] = keyword
        }
        return dumsMapper.selectJobCategoryList(params)
    }

    fun getAllJobCategories(): List<JobCategoryResponse> {
        return dumsMapper.selectAllJobCategories()
    }

    // [Integrated View] CRUD
    fun selectDumsIntegratedList(params: MutableMap<String, Any>): List<DumsIntegratedView> = dumsMapper.selectDumsIntegratedList(params)
    fun selectDumsIntegratedCount(params: MutableMap<String, Any>): Int = dumsMapper.selectDumsIntegratedCount(params)
}
