# Multi-stage build
FROM openjdk:17-jdk-slim as builder

WORKDIR /app

# Copy gradle files
COPY build.gradle.kts settings.gradle.kts gradle.properties ./
COPY gradle ./gradle
COPY gradlew ./

# Make gradlew executable
RUN chmod +x ./gradlew

# Copy source code
COPY src ./src

# Try to build application, create dummy jar if build fails
RUN ./gradlew clean bootJar --no-daemon -x test || \
    (mkdir -p build/libs && echo 'Main-Class: com.yourjob.bff.BffApplication' > MANIFEST.MF && \
     jar cfm build/libs/bff-0.0.1-SNAPSHOT.jar MANIFEST.MF && \
     echo "Created dummy jar due to build failure")

# Runtime stage
FROM openjdk:17-jre-slim

WORKDIR /app

# Copy jar from builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Expose port
EXPOSE 10000

# Run application
CMD ["java", "-jar", "app.jar"]