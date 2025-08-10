FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy gradle files
COPY build.gradle.kts settings.gradle.kts gradle.properties ./
COPY gradle ./gradle
COPY gradlew ./

# Make gradlew executable
RUN chmod +x ./gradlew

# Copy source code
COPY src ./src

# Build application
RUN ./gradlew clean bootJar --no-daemon

# Expose port
EXPOSE 10000

# Find and run jar file
CMD ["sh", "-c", "java -jar build/libs/*.jar"]