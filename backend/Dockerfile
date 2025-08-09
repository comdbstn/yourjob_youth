# Railway deployment optimized Dockerfile
FROM eclipse-temurin:17-jre-alpine

# Install runtime dependencies
RUN apk add --no-cache curl tzdata

# Set timezone
ENV TZ=Asia/Seoul

# Create app user for security
RUN addgroup -g 1000 app && adduser -u 1000 -G app -h /app -D app

# Set working directory
WORKDIR /app

# Copy pre-built JAR file (Railway builds with nixpacks)
COPY build/libs/backend-app.jar app.jar

# Create necessary directories and set permissions
RUN mkdir -p /app/uploads /app/logs && chown -R app:app /app

# Switch to non-root user
USER app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8082}/actuator/health || exit 1

# JVM optimization for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"

# Application profile
ENV SPRING_PROFILES_ACTIVE=production

# Start application with Railway PORT
CMD ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8082} -jar app.jar"]