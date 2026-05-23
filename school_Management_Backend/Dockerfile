# Étape 1 : Build de l'application
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Étape 2 : Création de l'image finale
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
# Copie du fichier JAR généré depuis l'étape de build
# On suppose que Maven génère le JAR dans le dossier /target
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]