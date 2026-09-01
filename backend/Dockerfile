# Build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy wrapper and config
COPY gradlew settings.gradle.kts build.gradle.kts ./
COPY gradle ./gradle
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew
RUN ./gradlew dependencies --no-daemon

# Copy app folder
COPY src ./src
RUN ./gradlew clean bootJar --no-daemon -x test

# runtime
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

RUN groupadd --system spring && useradd --system --gid spring spring
COPY --from=build --chown=spring:spring /app/build/libs/*.jar app.jar

USER spring:spring
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
