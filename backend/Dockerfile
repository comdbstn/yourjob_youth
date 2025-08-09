# Simple Spring Boot build
FROM gradle:8-jdk17-alpine

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install runtime dependencies
RUN apk add --no-cache curl

# Build application (clean build without tests)
RUN gradle clean bootJar --no-daemon

# Expose port
EXPOSE $PORT 8082

# Set JVM options
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
ENV SERVER_PORT=${PORT:-8082}

# Start application using bootJar output
CMD ["sh", "-c", "java $JAVA_OPTS -Dserver.port=$SERVER_PORT -jar build/libs/backend-app.jar"]