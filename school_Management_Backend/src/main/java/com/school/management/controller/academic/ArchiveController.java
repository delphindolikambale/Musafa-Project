package com.school.management.controller.academic;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.school.management.dto.academic.StudentFolderDTO;
import com.school.management.dto.academic.StudentSummaryDTO;
import com.school.management.service.academic.ArchiveService;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@RestController
// ✅ Changement de la route pour correspondre à l'appel Frontend
@RequestMapping("/api/archives")
@RequiredArgsConstructor

public class ArchiveController {

    private final ArchiveService archiveService;

    // ✅ Vérifiez que c'est bien ici que vos fichiers sont stockés lors de l'inscription
    private final Path rootLocation = Paths.get("storage/archives");

    @PostConstruct
    public void init() {
        try {
            if (!Files.exists(rootLocation)) {
                Files.createDirectories(rootLocation);
                System.out.println("✅ Stockage Archives prêt à : " + rootLocation.toAbsolutePath());
            }
        } catch (IOException e) {
            System.err.println("❌ Erreur init stockage : " + e.getMessage());
        }
    }

    @GetMapping("/student/{matricule}")
    public ResponseEntity<StudentFolderDTO> getStudentFolder(@PathVariable String matricule) {
        return ResponseEntity.ok(archiveService.getFullStudentArchive(matricule));
    }

    @GetMapping("/students/search")
    public ResponseEntity<List<StudentSummaryDTO>> listAllStudentsForArchives() {
        return ResponseEntity.ok(archiveService.getAllStudentsSummary());
    }

    // ✅ Route modifiée pour correspondre à : /api/archives/download/{fileName}
    @GetMapping("/download/{fileName}")
    public ResponseEntity<Resource> viewDocument(@PathVariable String fileName) {
        if (fileName == null || fileName.trim().isEmpty() || fileName.equals("[]")) {
            return ResponseEntity.badRequest().build();
        }

        try {
            String decodedFileName = URLDecoder.decode(fileName, StandardCharsets.UTF_8.toString());
            // On résout le fichier par rapport au dossier de stockage
            Path filePath = rootLocation.resolve(decodedFileName).normalize();

            System.out.println("🔍 Tentative d'accès au fichier : " + filePath.toAbsolutePath());

            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) contentType = "application/pdf";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                System.err.println("❌ Fichier introuvable sur le disque : " + filePath.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
