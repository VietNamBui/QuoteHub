# Build image
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime image
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/target/social_media-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 5454
ENTRYPOINT ["java","-jar","/app/app.jar"]
