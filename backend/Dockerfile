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
RUN ./gradlew clean bootJar --no-daemon -x test

# Expose port
EXPOSE 8082

# Run application
CMD ["sh", "-c", "java -Dserver.port=8082 -jar build/libs/*.jar"]