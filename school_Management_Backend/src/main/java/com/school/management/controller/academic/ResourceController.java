package com.school.management.controller.academic;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private static final Logger logger = LoggerFactory.getLogger(ResourceController.class);

    // Dossier de stockage sécurisé. On force la résolution absolue pour éviter les ambiguïtés d'IDE.
    private final Path rootLocation = Paths.get(System.getProperty("user.dir"))
            .resolve("storage")
            .toAbsolutePath()
            .normalize();

    @GetMapping("/view")
    public ResponseEntity<Resource> getFile(@RequestParam("path") String path) {
        try {
            // 1. Spring Boot a DÉJÀ décodé l'URL (les %2F sont déjà des /).
            String cleanPath = path;

            // 2. NETTOYAGE CRITIQUE : Retirer tout slash ou antislash au début du chemin.
            // Cela empêche la fonction .resolve() de zapper le dossier "storage".
            cleanPath = cleanPath.replaceAll("^[/\\\\]+", "");

            // 3. Enlever le préfixe "storage/" s'il a été enregistré par erreur dans la base de données
            if (cleanPath.startsWith("storage/")) {
                cleanPath = cleanPath.substring(8);
            }

            // 4. Construction du chemin physique final
            Path file = rootLocation.resolve(cleanPath).normalize();

            // 5. LOGS D'INVESTIGATION (Très important pour le débogage)
            logger.info("Requête reçue pour le chemin interne : {}", cleanPath);
            logger.info("Le serveur cherche physiquement ici : {}", file.toAbsolutePath());

            // 6. Sécurité : S'assurer qu'un pirate ne remonte pas dans les dossiers système avec des "../"
            if (!file.startsWith(rootLocation)) {
                logger.warn("Alerte de sécurité : Tentative d'accès hors du dossier storage : {}", file);
                return ResponseEntity.status(403).build();
            }

            // 7. Lecture et renvoi du fichier
            if (Files.exists(file) && Files.isReadable(file)) {
                Resource resource = new UrlResource(file.toUri());

                // Détermination dynamique du type de fichier (PDF, JPG, PNG, etc.)
                String contentType = Files.probeContentType(file);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header("Content-Disposition", "inline; filename=\"" + file.getFileName().toString() + "\"")
                        .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic())
                        .body(resource);
            } else {
                // Si ça échoue, on affiche l'erreur en clair dans la console
                logger.error("ERREUR 404 : Le fichier physique N'EXISTE PAS à cet emplacement : {}", file.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Erreur critique lors de la récupération du fichier : {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}