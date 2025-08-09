# Simple single-stage build for troubleshooting
FROM gradle:8-jdk17-alpine

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install runtime dependencies
RUN apk add --no-cache curl

# Build and run in single stage
RUN gradle clean build --no-daemon -x test --stacktrace

# Expose port
EXPOSE $PORT 8082

# Set JVM options
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
ENV SERVER_PORT=${PORT:-8082}

# Start application - use the fat jar, not the plain jar
CMD ["sh", "-c", "java $JAVA_OPTS -Dserver.port=$SERVER_PORT -jar build/libs/*-app.jar"]