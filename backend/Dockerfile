# Multi-stage build optimized for macOS Docker
FROM openjdk:17-jdk-slim AS builder

WORKDIR /app

# Install necessary packages
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy gradle files for dependency caching
COPY build.gradle.kts settings.gradle.kts gradle.properties ./
COPY gradle ./gradle
COPY gradlew ./

# Make gradlew executable
RUN chmod +x ./gradlew

# Download dependencies (cached layer)
RUN ./gradlew dependencies --no-daemon || true

# Copy source code
COPY src ./src

# Build application with optimized settings for Docker
RUN ./gradlew clean bootJar --no-daemon -x test --parallel

# Production stage
FROM openjdk:17-jre-slim AS production

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN addgroup --system --gid 1001 yourjob && \
    adduser --system --uid 1001 --gid 1001 yourjob

# Copy built application
COPY --from=builder /app/build/libs/*.jar app.jar

# Change ownership
RUN chown yourjob:yourjob app.jar

# Switch to non-root user
USER yourjob

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8082/actuator/health || exit 1

# Expose port
EXPOSE 8082

# JVM optimization for container
ENV JAVA_OPTS="-Xmx1g -Xms512m -XX:+UseG1GC -XX:G1HeapRegionSize=16m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Run application
CMD ["sh", "-c", "java $JAVA_OPTS -Dserver.port=8082 -jar app.jar"]

# Development stage for macOS
FROM builder AS development

# Install development tools
RUN apt-get update && apt-get install -y vim curl netcat && rm -rf /var/lib/apt/lists/*

# Enable debug port
EXPOSE 5005

# Development JVM options
ENV JAVA_OPTS="-Xmx1g -Xms512m -XX:+UseG1GC -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"

# Run with development profile
CMD ["sh", "-c", "java $JAVA_OPTS -Dspring.profiles.active=local -Dserver.port=8082 -jar build/libs/*.jar"]