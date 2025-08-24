package com.yourjob.backend

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration

// 간소화를 위해 DB 관련 자동 설정 제외
@SpringBootApplication(exclude = [
    DataSourceAutoConfiguration::class,
    HibernateJpaAutoConfiguration::class
])
class BackendApplication

fun main(args: Array<String>) {
    System.setProperty("spring.profiles.active", "simple")
    runApplication<BackendApplication>(*args)
}
