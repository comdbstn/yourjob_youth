plugins {
    id("org.springframework.boot") version "3.3.6"
    id("io.spring.dependency-management") version "1.1.0"
    kotlin("jvm") version "1.9.25"
    kotlin("plugin.spring") version "1.9.25"
    kotlin("plugin.jpa") version "1.9.25"
    kotlin("plugin.noarg") version "1.9.25"
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    kotlinOptions {
        jvmTarget = "17"
    }
}

group = "com.yourjob"
version = "0.0.1-SNAPSHOT"

tasks.bootJar {
    archiveBaseName.set("backend-app")
    archiveVersion.set("")
    archiveClassifier.set("")
}

noArg {
    annotation("jakarta.persistence.Entity") // JPA Entity에 no-arg 생성자 자동 생성
}

repositories {
    mavenCentral()
}

dependencies {
    // Web + JPA
    implementation("org.springframework.boot:spring-boot-starter-web")
    
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("io.jsonwebtoken:jjwt-api:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.11.5")

    // MySQL Connector
    //implementation("mysql:mysql-connector-java:8.0.33")
    implementation("org.mybatis:mybatis:3.5.14")
    implementation("org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.3")
    implementation("org.bgee.log4jdbc-log4j2:log4jdbc-log4j2-jdbc4.1:1.16")

    runtimeOnly("com.mysql:mysql-connector-j")

    // Jackson Kotlin
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    // Gson Kotlin
    implementation("com.google.code.gson:gson:2.8.9")

    // Kotlin 관련 설정
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")

    testImplementation("org.springframework.boot:spring-boot-starter-test")

    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.0.2")

    //spring jpa
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")

    //Lombok
    implementation("org.projectlombok:lombok:1.18.26")

    //Apache POI - Excel 파일 업로드용
    implementation("org.apache.poi:poi:5.2.3")
    implementation("org.apache.poi:poi-ooxml:5.2.3")

    //소셜 로그인을 위한 oAuth2 Client
    implementation("org.springframework.boot:spring-boot-starter-oauth2-client")

    // AWS SDK v2 의존성
    implementation("software.amazon.awssdk:s3:2.21.20")
    implementation("software.amazon.awssdk:s3-transfer-manager:2.21.20")

    // AWS SDK v2 HTTP 클라이언트 (Apache HTTP Client 사용)
    implementation("software.amazon.awssdk:apache-client:2.21.20")

    // 이메일 전송용 라이브러리
    implementation("org.springframework.boot:spring-boot-starter-mail")
    
    // 웹 크롤링용 라이브러리
    implementation("org.jsoup:jsoup:1.17.2")
    implementation("org.seleniumhq.selenium:selenium-java:4.15.0")
    implementation("org.seleniumhq.selenium:selenium-chrome-driver:4.15.0")
}