package com.school.management.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Injection dynamique de la variable d'environnement (Render) ou du dossier local par défaut
    @Value("${file.upload-dir:${STORAGE_PATH:./storage}}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // 🔥 CORRECTION : Ajout de l'URL Render pour éviter le conflit CORS avec WebSecurityConfig
                .allowedOriginPatterns(
                        "https://musafa-project.onrender.com",
                        "http://localhost:3000",
                        "http://localhost:517*",
                        "http://localhost:5180"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Localisation dynamique vers le disque persistant
        Path storageDirectory = Paths.get(uploadDir).toAbsolutePath().normalize();
        String storagePath = storageDirectory.toUri().toString();

        // S'assurer que le chemin URI se termine par un slash pour Spring
        if (!storagePath.endsWith("/")) {
            storagePath += "/";
        }

        registry.addResourceHandler("/storage/**")
                .addResourceLocations(storagePath)
                .setCachePeriod(0);
    }
}