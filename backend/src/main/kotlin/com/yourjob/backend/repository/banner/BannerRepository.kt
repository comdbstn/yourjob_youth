package com.yourjob.backend.repository.banner

import com.yourjob.backend.entity.banner.Banner
import org.apache.ibatis.annotations.Param
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository


@Repository
interface BannerRepository : JpaRepository<Banner, Long> {
    fun findByBannerId(bannerId: String): Banner?
    fun findByGroupName(groupName: String): List<Banner>
    fun findByStartDateLessThanEqualAndEndDateGreaterThanEqual(currentDate: String, currentDate2: String): List<Banner>

    @Query("""
        SELECT b FROM Banner b 
        WHERE (:groupName IS NULL OR b.groupName = :groupName)
        AND (:status IS NULL OR b.status = :status)
        AND (:keyword IS NULL OR b.title LIKE CONCAT('%', :keyword, '%'))
        ORDER BY b.createdAt DESC
    """)
    fun findWithFilters(
        @Param("groupName") groupName: String?,
        @Param("status") status: String?,
        @Param("keyword") keyword: String?,
        pageable: Pageable
    ): Page<Banner>
}