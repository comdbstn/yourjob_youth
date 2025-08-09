// backend/src/main/kotlin/com/yourjob/backend/mapper/CompanyProfileMapper.kt
package com.yourjob.backend.mapper

import org.apache.ibatis.annotations.Insert
import org.apache.ibatis.annotations.Mapper
import org.springframework.stereotype.Repository

@Repository
@Mapper
interface CompanyProfileMapper {
    @Insert("""
        INSERT INTO company_profile 
        (user_id, company_name, business_registration_number, corporate_type, capital_amount, revenue_amount, net_income, address, number_of_employees)
        VALUES (#{userId}, #{companyName}, #{businessRegistrationNumber}, #{corporateType}, #{capitalAmount}, #{revenueAmount}, #{netIncome}, #{address}, #{numberOfEmployees})
    """)
    fun insertCompanyProfile(
        userId: Int,
        companyName: String,
        businessRegistrationNumber: String,
        corporateType: Int,
        capitalAmount: String,
        revenueAmount: String,
        netIncome: String,
        address: String,
        numberOfEmployees: Int?
    ): Int
}
