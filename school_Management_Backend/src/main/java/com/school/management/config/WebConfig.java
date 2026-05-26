package com.school.management.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

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
        // Localisation du dossier storage à la racine du projet
        Path storageDirectory = Paths.get(System.getProperty("user.dir")).resolve("storage");
        String storagePath = storageDirectory.toUri().toString();

        registry.addResourceHandler("/storage/**")
                .addResourceLocations(storagePath)
                .setCachePeriod(0);
    }
}
