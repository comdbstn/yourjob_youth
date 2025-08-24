package com.yourjob.backend.mapper

import com.yourjob.backend.entity.CompanyInfo
import org.apache.ibatis.annotations.Mapper
import org.springframework.stereotype.Repository

@Repository
@Mapper
interface CompanyInfoMapper {
    fun selectCompanyById(userId: Int): CompanyInfo?
    fun insertCompany(companyInfo: CompanyInfo): Int
    fun updateCompany(companyInfo: CompanyInfo): Int
    fun deleteCompany(userId: Int): Int
}
