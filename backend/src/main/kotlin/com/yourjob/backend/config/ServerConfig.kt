package com.yourjob.backend.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.apache.catalina.connector.Connector
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory
import org.springframework.boot.web.servlet.server.ServletWebServerFactory

@Configuration
class ServerConfig {

    @Bean
    fun servletContainer(): ServletWebServerFactory {
        val tomcat = TomcatServletWebServerFactory()
        tomcat.addAdditionalTomcatConnectors(createStandardConnector())
        return tomcat
    }

    private fun createStandardConnector(): Connector {
        val connector = Connector("org.apache.coyote.http11.Http11NioProtocol")
        connector.port = 8082
        return connector
    }
}