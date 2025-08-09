package com.yourjob.backend.entity

/**
 * DUMS 통합 뷰를 위한 데이터 클래스
 * @property id 고유 식별자
 * @property dataType 데이터 타입 (예: DOMESTIC_UNIVERSITY, INTERNATIONAL_UNIVERSITY 등)
 * @property code 코드 번호
 * @property name 명칭
 * @property status 상태 (ACTIVE/INACTIVE)
 * @property createdAt 생성일시
 * @property updatedAt 수정일시
 */
data class DumsIntegratedView(
    val id: Int,
    val dataType: String,
    val code: String?,
    val name: String,
    val status: String?,
    val createdAt: String,
    val updatedAt: String
) 