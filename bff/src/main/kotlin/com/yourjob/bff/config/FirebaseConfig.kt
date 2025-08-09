package com.yourjob.bff.config

import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.io.File
import java.io.FileInputStream

@Configuration
@ConditionalOnProperty(name = ["firebase.enabled"], havingValue = "true", matchIfMissing = true)
class FirebaseConfig {
    private val logger = LoggerFactory.getLogger(FirebaseConfig::class.java)

    // TODO : Fireabase OAuth2
    // @Bean
    // fun firebaseApp(): FirebaseApp {
    //     val serviceAccountPath = "/firebase/service.json"
    //     logger.info("Loading Firebase service account key from: $serviceAccountPath")
    //     val serviceAccountFile = File(serviceAccountPath)
    //     if (!serviceAccountFile.exists()) {
    //         throw IllegalStateException("Firebase service account file not found at: $serviceAccountPath")
    //     }
    //     FileInputStream(serviceAccountFile).use { stream ->
    //         val options = FirebaseOptions.builder()
    //             .setCredentials(GoogleCredentials.fromStream(stream))
    //             .build()
    //         return FirebaseApp.initializeApp(options)
    //     }
    // }
}
