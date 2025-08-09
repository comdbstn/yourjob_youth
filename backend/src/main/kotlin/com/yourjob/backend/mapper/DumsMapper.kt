package com.yourjob.backend.mapper

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

import org.apache.ibatis.annotations.Mapper 
import org.apache.ibatis.annotations.Param

import org.springframework.stereotype.Repository

@Repository
@Mapper
interface DumsMapper {

    // [Domestic University]
    fun insertDomesticUniversity(request: DomesticUniversityRequest): Int
    fun updateDomesticUniversity(request: DomesticUniversityRequest): Int
    fun deleteDomesticUniversity(universityId: Int): Int
    fun selectDomesticUniversityDetail(universityId: Int): DomesticUniversityResponse
    fun selectDomesticUniversityList(params: MutableMap<String, Any>): List<DomesticUniversityRequest>
    fun selectUniversityNameList(@Param("keyword") keyword: String?): List<String>
    fun selectDomesticUniversityMajors(): List<String>

    // [International University]
    fun insertInternationalUniversity(request: InternationalUniversityRequest): Int
    fun updateInternationalUniversity(request: InternationalUniversityRequest): Int
    fun deleteInternationalUniversity(universityId: Int): Int
    fun selectInternationalUniversityDetail(universityId: Int): InternationalUniversityResponse
    fun selectInternationalUniversityList(params: MutableMap<String, Any>): List<InternationalUniversityRequest>

    // [Major]
    fun insertMajor(request: MajorRequest): Int
    fun updateMajor(request: MajorRequest): Int
    fun deleteMajor(majorId: Int): Int
    fun selectMajorDetail(majorId: Int): MajorResponse
    fun selectMajorList(params: MutableMap<String, Any>): List<MajorRequest>

    // [Certificate List]
    fun insertCertificate(request: CertificateListRequest): Int
    fun updateCertificate(request: CertificateListRequest): Int
    fun deleteCertificate(certificateId: Int): Int
    fun selectCertificateDetail(certificateId: Int): CertificateListResponse
    fun selectCertificateList(params: MutableMap<String, Any>): List<CertificateListRequest>

    // [University Classification]
    fun insertUniversityClassification(request: UniversityClassificationRequest): Int
    fun updateUniversityClassification(request: UniversityClassificationRequest): Int
    fun deleteUniversityClassification(classificationId: Int): Int
    fun selectUniversityClassificationDetail(classificationId: Int): UniversityClassificationResponse
    fun selectUniversityClassificationList(params: MutableMap<String, Any>): List<UniversityClassificationRequest>

    // [Graduation Status]
    fun insertGraduationStatus(request: GraduationStatusRequest): Int
    fun updateGraduationStatus(request: GraduationStatusRequest): Int
    fun deleteGraduationStatus(graduationStatusId: Int): Int
    fun selectGraduationStatusDetail(graduationStatusId: Int): GraduationStatusResponse
    fun selectGraduationStatusList(params: MutableMap<String, Any>): List<GraduationStatusRequest>

    // [Region]
    fun insertRegion(request: RegionRequest): Int
    fun updateRegion(request: RegionRequest): Int
    fun deleteRegion(regionId: Int): Int
    fun selectRegionDetail(regionId: Int): RegionResponse
    fun selectRegionList(params: MutableMap<String, Any>): List<RegionRequest>
    fun selectAllRegions(): List<RegionRequest>

    fun insertCountry(request: CountryRequest): Int
    fun updateCountry(request: CountryRequest): Int
    fun deleteCountry(countryId: Int): Int
    fun selectCountryDetail(countryId: Int): CountryResponse
    fun selectCountryList(params: MutableMap<String, Any>): List<CountryRequest>

    // [Corporate Type]
    fun insertCorporateType(request: CorporateTypeRequest): Int
    fun updateCorporateType(request: CorporateTypeRequest): Int
    fun deleteCorporateType(corporateTypeId: Int): Int
    fun selectCorporateTypeDetail(corporateTypeId: Int): CorporateTypeResponse
    fun selectCorporateTypeList(params: MutableMap<String, Any>): List<CorporateTypeRequest>
    fun selectAllCorporateTypes(): List<CorporateTypeResponse>

    // [Job Type]
    fun insertJobType(request: JobTypeRequest): Int
    fun updateJobType(request: JobTypeRequest): Int
    fun deleteJobType(jobTypeId: Int): Int
    fun selectJobTypeDetail(jobTypeId: Int): JobTypeResponse
    fun selectJobTypeList(params: MutableMap<String, Any>): List<JobTypeRequest>
    fun selectAllJobTypes(): List<JobTypeResponse>

    // [Job Category]
    fun insertJobCategory(jobCategoryRequest: JobCategoryRequest): Int
    fun updateJobCategory(jobCategoryRequest: JobCategoryRequest): Int
    fun deleteJobCategory(jobCategoryId: Int): Int
    fun selectJobCategoryDetail(jobCategoryId: Int): JobCategoryResponse
    fun selectJobCategoryList(params: Map<String, Any>): List<JobCategoryResponse>
    fun selectAllJobCategories(): List<JobCategoryResponse>

    // [Integrated View]
    fun selectDumsIntegratedList(params: MutableMap<String, Any>): List<DumsIntegratedView>
    fun selectDumsIntegratedCount(params: MutableMap<String, Any>): Int
}
