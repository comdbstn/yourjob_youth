# Multi-stage build for BFF service
FROM gradle:7.6.2-jdk17-alpine AS builder

# Install build dependencies
RUN apk add --no-cache curl

# Set working directory
WORKDIR /home/gradle/project

# Copy gradle files first for better layer caching
COPY build.gradle.kts ./
COPY gradle.properties ./
COPY settings.gradle.kts ./

# Download dependencies
RUN gradle dependencies --no-daemon || true

# Copy source code
COPY src src

# Build application
RUN gradle clean build --no-daemon -x test

# Production stage
FROM openjdk:17-jre-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache curl netcat-openbsd tzdata

# Set timezone
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create app user for security
RUN addgroup -g 1000 app && adduser -u 1000 -G app -h /app -D app

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /home/gradle/project/build/libs/*.jar app.jar

# Copy Firebase service account (if needed)
# Note: In production, use secrets management instead of copying files
# COPY src/main/resources/firebase/service.json /firebase/service.json
# ENV FIREBASE_SERVICE_ACCOUNT_PATH=/firebase/service.json

# Create necessary directories
RUN mkdir -p /app/logs
RUN chown -R app:app /app

# Switch to non-root user
USER app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8081/health || exit 1

# Expose ports
EXPOSE 8081 5005

# JVM optimization for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:G1HeapRegionSize=16m -XX:+UseStringDeduplication -Djava.security.egd=file:/dev/./urandom"

# Application profile
ENV SPRING_PROFILES_ACTIVE=production

# Start application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

# Development stage
FROM production AS development

# Switch back to root for development tools
USER root

# Install development tools
RUN apk add --no-cache bash vim less

# Enable remote debugging
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"
ENV SPRING_PROFILES_ACTIVE=local

# Switch back to app user
USER app