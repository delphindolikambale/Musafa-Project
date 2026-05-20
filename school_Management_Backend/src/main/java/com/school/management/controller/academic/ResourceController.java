package com.school.management.controller.academic;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/resources")

public class ResourceController {

    private static final Logger logger = LoggerFactory.getLogger(ResourceController.class);
    private final Path rootLocation = Paths.get(System.getProperty("user.dir")).resolve("storage").normalize();

    @GetMapping("/view")
    public ResponseEntity<Resource> getFile(@RequestParam("path") String path) {
        try {
            String decodedPath = URLDecoder.decode(path, StandardCharsets.UTF_8.toString());

            if (decodedPath.startsWith("storage/")) {
                decodedPath = decodedPath.substring(8);
            }

            Path file = rootLocation.resolve(decodedPath).normalize();

            // Sécurité : s'assurer que le fichier est bien à l'intérieur du dossier storage
            if (!file.startsWith(rootLocation)) {
                logger.warn("Tentative d'accès non autorisé au chemin : {}", file);
                return ResponseEntity.status(403).build();
            }

            if (Files.exists(file) && Files.isReadable(file)) {
                Resource resource = new UrlResource(file.toUri());

                // Détermination du Content-Type
                String contentType = Files.probeContentType(file);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header("Content-Disposition", "inline; filename=\"" + file.getFileName().toString() + "\"")
                        // Cache de 1 heure pour éviter de re-télécharger l'image à chaque clic
                        .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic())
                        .body(resource);
            } else {
                logger.debug("Fichier non trouvé : {}", file);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération du fichier : {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
