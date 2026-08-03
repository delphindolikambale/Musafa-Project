package com.school.management.controller.academic;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final Path fileStorageLocation;

    // Injection du chemin absolu dès la construction du contrôleur
    public FileController(@Value("${file.upload-dir:${STORAGE_PATH:./storage}}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).resolve("enrollments").toAbsolutePath().normalize();
    }

    /**
     * 👁️ Visualiser ou Télécharger un document d'inscription
     * @param fileName : le nom du fichier stocké en base de données
     */
    @GetMapping("/enrollments/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, HttpServletRequest request) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                // Déterminer le type de contenu (PDF, Image, etc.)
                String contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        // "inline" permet d'ouvrir dans le navigateur, "attachment" force le téléchargement
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException ex) {
            return ResponseEntity.internalServerError().build();
        }
    }
}