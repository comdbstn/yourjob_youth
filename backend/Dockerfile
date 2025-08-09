# Multi-stage build for Railway deployment
FROM gradle:8-jdk17-alpine AS builder

# Install build dependencies
RUN apk add --no-cache curl

# Set working directory
WORKDIR /home/gradle/project

# Copy gradle files first for better layer caching
COPY build.gradle.kts ./
COPY gradle.properties ./
COPY settings.gradle.kts ./

# Copy gradle wrapper
COPY gradle/ gradle/
COPY gradlew ./

# Make gradlew executable
RUN chmod +x gradlew

# Download dependencies
RUN ./gradlew dependencies --no-daemon --stacktrace

# Copy source code
COPY src src

# Build application
RUN ./gradlew clean bootJar --no-daemon --stacktrace

# Production stage with updated image
FROM eclipse-temurin:17-jre-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache curl tzdata

# Set timezone
ENV TZ=Asia/Seoul

# Create app user for security
RUN addgroup -g 1000 app && adduser -u 1000 -G app -h /app -D app

# Set working directory
WORKDIR /app

# Copy built application from builder stage - fix JAR path
COPY --from=builder /home/gradle/project/build/libs/backend-app.jar app.jar

# Create necessary directories
RUN mkdir -p /app/uploads /app/logs
RUN chown -R app:app /app

# Switch to non-root user
USER app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8082}/actuator/health || exit 1

# Expose port
EXPOSE $PORT

# JVM optimization for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"

# Application profile
ENV SPRING_PROFILES_ACTIVE=production

# Start application with Railway PORT
CMD ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8082} -jar app.jar"]