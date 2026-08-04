package com.school.management.service.academicImpl.storage;

import com.school.management.service.academic.storage.FileStorageService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
// S'active uniquement si le provider est "local" ou s'il n'est pas défini (par défaut)
@ConditionalOnProperty(name = "storage.provider", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageServiceImpl implements FileStorageService {

    private Path storageLocation;

    @Value("${file.upload-dir:${STORAGE_PATH:./storage}}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        // Initialise et crée le dossier racine du disque persistant s'il n'existe pas
        this.storageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            if (!Files.exists(this.storageLocation)) {
                Files.createDirectories(this.storageLocation);
            }
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le répertoire sur le disque persistant", e);
        }
    }

    @Override
    public String storeFile(MultipartFile file, String folder, String prefix) {
        try {
            // Création automatique du sous-dossier (ex: "bulletin-headers", "enrollments")
            Path targetDirectory = this.storageLocation.resolve(folder).normalize();
            if (!Files.exists(targetDirectory)) {
                Files.createDirectories(targetDirectory);
            }

            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file.png";

            // ✅ CORRECTION : Nettoyage des espaces et caractères spéciaux pour prévenir les erreurs 404 Linux
            String safeFilename = originalFilename.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
            String fileName = prefix + UUID.randomUUID() + "_" + safeFilename;

            Path targetPath = targetDirectory.resolve(fileName);

            // Copie physique du fichier sur le disque persistant Render
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            // ✅ CORRECTION : Ajout du "/" au début pour que le frontend fasse un appel absolu depuis l'origine
            // Exemple : "/storage/bulletin-headers/flag_1_1234_file_png"
            return "/storage/" + folder + "/" + fileName;

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la sauvegarde du fichier sur le disque : " + e.getMessage(), e);
        }
    }
}