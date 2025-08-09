package com.yourjob.backend.controller

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
import com.yourjob.backend.entity.CorporateTypeRequest
import com.yourjob.backend.entity.JobTypeRequest
import com.yourjob.backend.entity.JobTypeResponse
import com.yourjob.backend.entity.JobCategoryRequest
import com.yourjob.backend.entity.JobCategoryResponse

import com.yourjob.backend.service.DumsService
import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/dums")
class DumsController(private val dumsService: DumsService) {

    // [Domestic University] 엔드포인트
    @PostMapping("/domestic-universities")
    fun createDomesticUniversity(
        @RequestBody request: DomesticUniversityRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        val result = dumsService.insertDomesticUniversity(request)
        return if(result > 0) ResponseEntity(HttpStatus.CREATED) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }

    @GetMapping("/domestic-universities")
    fun getDomesticUniversities(
        @RequestParam(required = false) keyword: String?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val params = mutableMapOf<String, Any>(
            "keyword" to (keyword ?: ""),
            "offSetNumb" to ((page - 1) * size),
            "size" to size
        )
        val list = dumsService.selectDomesticUniversityList(params)
        val responseMap = mutableMapOf<String, Any>(
            "content" to list,
            "totalElements" to list.size,
            "currentPage" to page
        )
        return ResponseEntity(responseMap, HttpStatus.OK)
    }
    @GetMapping("/domestic-universities/{id}")
    fun getDomesticUniversityDetail(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val detail = dumsService.selectDomesticUniversityDetail(id)
        return ResponseEntity(detail, HttpStatus.OK)
    }
    @PutMapping("/domestic-universities/{id}")
    fun updateDomesticUniversity(
        @PathVariable id: Int,
        @RequestBody request: DomesticUniversityRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        request.universityId = id
        val result = dumsService.updateDomesticUniversity(request)
        return if(result > 0) ResponseEntity(HttpStatus.OK) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }
    @DeleteMapping("/domestic-universities/{id}")
    fun deleteDomesticUniversity(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val result = dumsService.deleteDomesticUniversity(id)
        return if(result > 0) ResponseEntity(HttpStatus.OK) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }
    @GetMapping("/domestic-universities/names")
    fun getDomesticUniversityNames(
        @RequestParam(required = false) keyword: String?,
        session: HttpSession
    ): ResponseEntity<Any> {
        val nameList = dumsService.getUniversityNameList(keyword)
        return ResponseEntity(nameList, HttpStatus.OK)
    }
    @GetMapping("/domestic-universities/majors")
    fun getDomesticUniversityMajors(
        session: HttpSession
    ): ResponseEntity<Any> {
        val majorList = dumsService.selectDomesticUniversityMajors()
        return ResponseEntity(majorList, HttpStatus.OK)
    }
    // [International University] 엔드포인트
    @PostMapping("/international-universities")
    fun createInternationalUniversity(
        @RequestBody request: InternationalUniversityRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        val result = dumsService.insertInternationalUniversity(request)
        return if(result > 0) ResponseEntity(HttpStatus.CREATED) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }
    @GetMapping("/international-universities")
    fun getInternationalUniversities(
        @RequestParam(required = false) keyword: String?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val params = mutableMapOf<String, Any>(
            "keyword" to (keyword ?: ""),
            "offSetNumb" to ((page - 1) * size),
            "size" to size
        )
        val list = dumsService.selectInternationalUniversityList(params)
        val responseMap = mutableMapOf<String, Any>(
            "content" to list,
            "totalElements" to list.size,
            "currentPage" to page
        )
        return ResponseEntity(responseMap, HttpStatus.OK)
    }

    @GetMapping("/international-universities/{id}")
    fun getInternationalUniversityDetail(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val detail = dumsService.selectInternationalUniversityDetail(id)
        return ResponseEntity(detail, HttpStatus.OK)
    }

    @PutMapping("/international-universities/{id}")
    fun updateInternationalUniversity(
        @PathVariable id: Int,
        @RequestBody request: InternationalUniversityRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        request.internationalUniversityId = id
        val result = dumsService.updateInternationalUniversity(request)
        return if(result > 0) ResponseEntity(HttpStatus.OK) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }

    @DeleteMapping("/international-universities/{id}")
    fun deleteInternationalUniversity(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val result = dumsService.deleteInternationalUniversity(id)
        return if(result > 0) ResponseEntity(HttpStatus.OK) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }

    // [Major] 엔드포인트
    @PostMapping("/majors")
    fun createMajor(
        @RequestBody request: MajorRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        val result = dumsService.insertMajor(request)
        return if(result > 0) ResponseEntity(HttpStatus.CREATED) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }
    @GetMapping("/majors")
    fun getMajors(
        @RequestParam(required = false) keyword: String?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val params = mutableMapOf<String, Any>(
            "keyword" to (keyword ?: ""),
            "offSetNumb" to ((page - 1) * size),
            "size" to size
        )
        val list = dumsService.selectMajorList(params)
        val responseMap = mutableMapOf<String, Any>(
            "content" to list,
            "totalElements" to list.size,
            "currentPage" to page
        )
        return ResponseEntity(responseMap, HttpStatus.OK)
    }
    @GetMapping("/majors/{id}")
    fun getMajorDetail(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val detail = dumsService.selectMajorDetail(id)
        return ResponseEntity(detail, HttpStatus.OK)
    }
    @PutMapping("/majors/{id}")
    fun updateMajor(
        @PathVariable id: Int,
        @RequestBody request: MajorRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        request.majorId = id
        val result = dumsService.updateMajor(request)
        return if(result > 0) ResponseEntity(HttpStatus.OK) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }
    @DeleteMapping("/majors/{id}")
    fun deleteMajor(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val result = dumsService.deleteMajor(id)
        return if(result > 0) ResponseEntity(HttpStatus.OK) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }

    // [Certificate List] 엔드포인트
    @PostMapping("/certificates")
    fun createCertificate(
        @RequestBody request: CertificateListRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        val result = dumsService.insertCertificate(request)
        return if(result > 0) ResponseEntity(HttpStatus.CREATED) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }
    @GetMapping("/certificates")
    fun getCertificates(
        @RequestParam(required = false) keyword: String?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val params = mutableMapOf<String, Any>(
            "keyword" to (keyword ?: ""),
            "offSetNumb" to ((page - 1) * size),
            "size" to size
        )
        val list = dumsService.selectCertificateList(params)
        val responseMap = mutableMapOf<String, Any>(
            "content" to list,
            "totalElements" to list.size,
            "currentPage" to page
        )
        return ResponseEntity(responseMap, HttpStatus.OK)
    }
    @GetMapping("/certificates/{id}")
    fun getCertificateDetail(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val detail = dumsService.selectCertificateDetail(id)
        return ResponseEntity(detail, HttpStatus.OK)
    }
    @PutMapping("/certificates/{id}")
    fun updateCertificate(
        @PathVariable id: Int,
        @RequestBody request: CertificateListRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        request.certificateId = id
        val result = dumsService.updateCertificate(request)
        return if(result > 0) ResponseEntity(HttpStatus.OK) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }
    @DeleteMapping("/certificates/{id}")
    fun deleteCertificate(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val result = dumsService.deleteCertificate(id)
        return if(result > 0) ResponseEntity(HttpStatus.OK) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }

    // [University Classification] 엔드포인트
    @PostMapping("/university-classifications")
    fun createUniversityClassification(
        @RequestBody request: UniversityClassificationRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        val result = dumsService.insertUniversityClassification(request)
        return if(result > 0) ResponseEntity(HttpStatus.CREATED) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }
    @GetMapping("/university-classifications")
    fun getUniversityClassifications(
        @RequestParam(required = false) keyword: String?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val params = mutableMapOf<String, Any>(
            "keyword" to (keyword ?: ""),
            "offSetNumb" to ((page - 1) * size),
            "size" to size
        )
        val list = dumsService.selectUniversityClassificationList(params)
        val responseMap = mutableMapOf<String, Any>(
            "content" to list,
            "totalElements" to list.size,
            "currentPage" to page
        )
        return ResponseEntity(responseMap, HttpStatus.OK)
    }
    @GetMapping("/university-classifications/{id}")
    fun getUniversityClassificationDetail(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val detail = dumsService.selectUniversityClassificationDetail(id)
        return ResponseEntity(detail, HttpStatus.OK)
    }
    @PutMapping("/university-classifications/{id}")
    fun updateUniversityClassification(
        @PathVariable id: Int,
        @RequestBody request: UniversityClassificationRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        request.classificationId = id
        val result = dumsService.updateUniversityClassification(request)
        return if(result > 0) ResponseEntity(HttpStatus.OK) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }
    @DeleteMapping("/university-classifications/{id}")
    fun deleteUniversityClassification(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val result = dumsService.deleteUniversityClassification(id)
        return if(result > 0) ResponseEntity(HttpStatus.OK) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }

    // [Graduation Status] 엔드포인트
    @PostMapping("/graduation-statuses")
    fun createGraduationStatus(
        @RequestBody request: GraduationStatusRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        val result = dumsService.insertGraduationStatus(request)
        return if(result > 0) ResponseEntity(HttpStatus.CREATED) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }
    @GetMapping("/graduation-statuses")
    fun getGraduationStatuses(
        @RequestParam(required = false) keyword: String?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val params = mutableMapOf<String, Any>(
            "keyword" to (keyword ?: ""),
            "offSetNumb" to ((page - 1) * size),
            "size" to size
        )
        val list = dumsService.selectGraduationStatusList(params)
        val responseMap = mutableMapOf<String, Any>(
            "content" to list,
            "totalElements" to list.size,
            "currentPage" to page
        )
        return ResponseEntity(responseMap, HttpStatus.OK)
    }
    @GetMapping("/graduation-statuses/{id}")
    fun getGraduationStatusDetail(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val detail = dumsService.selectGraduationStatusDetail(id)
        return ResponseEntity(detail, HttpStatus.OK)
    }
    @PutMapping("/graduation-statuses/{id}")
    fun updateGraduationStatus(
        @PathVariable id: Int,
        @RequestBody request: GraduationStatusRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        request.graduationStatusId = id
        val result = dumsService.updateGraduationStatus(request)
        return if(result > 0) ResponseEntity(HttpStatus.OK) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }
    @DeleteMapping("/graduation-statuses/{id}")
    fun deleteGraduationStatus(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val result = dumsService.deleteGraduationStatus(id)
        return if(result > 0) ResponseEntity(HttpStatus.OK) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }

    // [Region] 엔드포인트
    @GetMapping("/regions/all")
    fun getAllRegions(
        session: HttpSession
    ): ResponseEntity<Any> {
        val list = dumsService.selectAllRegions()
        return ResponseEntity(list, HttpStatus.OK)
    }

    @PostMapping("/regions")
    fun createRegion(
        @RequestBody request: RegionRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        val result = dumsService.insertRegion(request)
        return if(result > 0) ResponseEntity(HttpStatus.CREATED) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }

    @GetMapping("/regions")
    fun getRegions(
        @RequestParam(required = false) keyword: String?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val params = mutableMapOf<String, Any>(
            "keyword" to (keyword ?: ""),
            "offSetNumb" to ((page - 1) * size),
            "size" to size
        )
        val list = dumsService.selectRegionList(params)
        val responseMap = mutableMapOf<String, Any>(
            "content" to list,
            "totalElements" to list.size,
            "currentPage" to page
        )
        return ResponseEntity(responseMap, HttpStatus.OK)
    }

    @GetMapping("/regions/{id}")
    fun getRegionDetail(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val detail = dumsService.selectRegionDetail(id)
        return ResponseEntity(detail, HttpStatus.OK)
    }

    @PutMapping("/regions/{id}")
    fun updateRegion(
        @PathVariable id: Int,
        @RequestBody request: RegionRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        request.regionId = id
        val result = dumsService.updateRegion(request)
        return if(result > 0) ResponseEntity(HttpStatus.OK) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }
    
    @DeleteMapping("/regions/{id}")
    fun deleteRegion(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val result = dumsService.deleteRegion(id)
        return if(result > 0) ResponseEntity(HttpStatus.OK) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }

    @PostMapping("/countries")
    fun createCountry(
        @RequestBody countryRequest: CountryRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        val result = dumsService.insertCountry(countryRequest)
        return if (result > 0) ResponseEntity(HttpStatus.CREATED) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }

    @GetMapping("/countries")
    fun getCountries(
        @RequestParam(required = false) keyword: String?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val params = mutableMapOf<String, Any>(
            "keyword" to (keyword ?: ""),
            "offSetNumb" to ((page - 1) * size),
            "size" to size
        )
        val list = dumsService.selectCountryList(params)
        val responseMap = mutableMapOf<String, Any>(
            "content" to list,
            "totalElements" to list.size,
            "currentPage" to page
        )
        return ResponseEntity(responseMap, HttpStatus.OK)
    }

    @GetMapping("/countries/{id}")
    fun getCountryDetail(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val detail = dumsService.selectCountryDetail(id)
        return ResponseEntity(detail, HttpStatus.OK)
    }

    @PutMapping("/countries/{id}")
    fun updateCountry(
        @PathVariable id: Int,
        @RequestBody countryRequest: CountryRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        countryRequest.countryId = id
        val result = dumsService.updateCountry(countryRequest)
        return if (result > 0) ResponseEntity(HttpStatus.OK) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }

    @DeleteMapping("/countries/{id}")
    fun deleteCountry(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val result = dumsService.deleteCountry(id)
        return if (result > 0) ResponseEntity(HttpStatus.OK) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }

    // [Integrated View] 엔드포인트
    @GetMapping("/integrated")
    fun getDumsIntegratedList(
        @RequestParam(required = false) keyword: String?,
        @RequestParam(required = false) dataType: String?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val params = mutableMapOf<String, Any>(
            "keyword" to (keyword ?: ""),
            "dataType" to (dataType ?: ""),
            "offSetNumb" to ((page - 1) * size),
            "size" to size
        )
        val list = dumsService.selectDumsIntegratedList(params)
        val totalCount = dumsService.selectDumsIntegratedCount(params)
        val responseMap = mutableMapOf<String, Any>(
            "content" to list,
            "totalElements" to totalCount,
            "currentPage" to page
        )
        return ResponseEntity(responseMap, HttpStatus.OK)
    }

    // [Corporate Type] 엔드포인트
    @PostMapping("/corporate-types")
    fun createCorporateType(
        @RequestBody request: CorporateTypeRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        val result = dumsService.insertCorporateType(request)
        return if(result > 0) ResponseEntity(HttpStatus.CREATED) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }

    @GetMapping("/corporate-types")
    fun getCorporateTypes(
        @RequestParam(required = false) keyword: String?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val params = mutableMapOf<String, Any>(
            "keyword" to (keyword ?: ""),
            "offSetNumb" to ((page - 1) * size),
            "size" to size
        )
        val list = dumsService.selectCorporateTypeList(params)
        val responseMap = mutableMapOf<String, Any>(
            "content" to list,
            "totalElements" to list.size,
            "currentPage" to page
        )
        return ResponseEntity(responseMap, HttpStatus.OK)
    }

    @GetMapping("/corporate-types/{id}")
    fun getCorporateTypeDetail(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val detail = dumsService.selectCorporateTypeDetail(id)
        return ResponseEntity(detail, HttpStatus.OK)
    }

    @PutMapping("/corporate-types/{id}")
    fun updateCorporateType(
        @PathVariable id: Int,
        @RequestBody request: CorporateTypeRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        request.corporateTypeId = id
        val result = dumsService.updateCorporateType(request)
        return if(result > 0) ResponseEntity(HttpStatus.OK) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }

    @DeleteMapping("/corporate-types/{id}")
    fun deleteCorporateType(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val result = dumsService.deleteCorporateType(id)
        return if(result > 0) ResponseEntity(HttpStatus.OK) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }

    @GetMapping("/corporate-types/all")
    fun getAllCorporateTypes(
        session: HttpSession
    ): ResponseEntity<Any> {
        val list = dumsService.selectAllCorporateTypes()
        return ResponseEntity(list, HttpStatus.OK)
    }

    // [Job Type] 엔드포인트
    @PostMapping("/job-types")
    fun createJobType(
        @RequestBody request: JobTypeRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        val result = dumsService.insertJobType(request)
        return if(result > 0) ResponseEntity(HttpStatus.CREATED) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }

    @GetMapping("/job-types")
    fun getJobTypes(
        @RequestParam(required = false) keyword: String?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val params = mutableMapOf<String, Any>(
            "keyword" to (keyword ?: ""),
            "offSetNumb" to ((page - 1) * size),
            "size" to size
        )
        val list = dumsService.selectJobTypeList(params)
        val responseMap = mutableMapOf<String, Any>(
            "content" to list,
            "totalElements" to list.size,
            "currentPage" to page
        )
        return ResponseEntity(responseMap, HttpStatus.OK)
    }

    @GetMapping("/job-types/{id}")
    fun getJobTypeDetail(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val detail = dumsService.selectJobTypeDetail(id)
        return ResponseEntity(detail, HttpStatus.OK)
    }

    @PutMapping("/job-types/{id}")
    fun updateJobType(
        @PathVariable id: Int,
        @RequestBody request: JobTypeRequest,
        session: HttpSession
    ): ResponseEntity<Any> {
        request.jobTypeId = id
        val result = dumsService.updateJobType(request)
        return if(result > 0) ResponseEntity(HttpStatus.OK) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }

    @DeleteMapping("/job-types/{id}")
    fun deleteJobType(
        @PathVariable id: Int,
        session: HttpSession
    ): ResponseEntity<Any> {
        val result = dumsService.deleteJobType(id)
        return if(result > 0) ResponseEntity(HttpStatus.OK) else ResponseEntity(HttpStatus.BAD_REQUEST)
    }

    @GetMapping("/job-types/all")
    fun getAllJobTypes(
        session: HttpSession
    ): ResponseEntity<Any> {
        val list = dumsService.selectAllJobTypes()
        return ResponseEntity(list, HttpStatus.OK)
    }

    // [Job Category] CRUD
    @PostMapping("/job-categories")
    fun createJobCategory(@RequestBody request: JobCategoryRequest): ResponseEntity<Int> {
        return ResponseEntity.ok(dumsService.createJobCategory(request))
    }

    @GetMapping("/job-categories")
    fun getJobCategories(
        @RequestParam(required = false) keyword: String?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<List<JobCategoryResponse>> {
        return ResponseEntity.ok(dumsService.getJobCategories(keyword, page, size))
    }

    @GetMapping("/job-categories/{id}")
    fun getJobCategoryDetail(@PathVariable id: Int): ResponseEntity<JobCategoryResponse> {
        return ResponseEntity.ok(dumsService.getJobCategoryDetail(id))
    }

    @PutMapping("/job-categories/{id}")
    fun updateJobCategory(
        @PathVariable id: Int,
        @RequestBody request: JobCategoryRequest
    ): ResponseEntity<Int> {
        request.jobCategoryId = id
        return ResponseEntity.ok(dumsService.updateJobCategory(request))
    }

    @DeleteMapping("/job-categories/{id}")
    fun deleteJobCategory(@PathVariable id: Int): ResponseEntity<Int> {
        return ResponseEntity.ok(dumsService.deleteJobCategory(id))
    }

    @GetMapping("/job-categories/all")
    fun getAllJobCategories(): ResponseEntity<List<JobCategoryResponse>> {
        return ResponseEntity.ok(dumsService.getAllJobCategories())
    }
}
