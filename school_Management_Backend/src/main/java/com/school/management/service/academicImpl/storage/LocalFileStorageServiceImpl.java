package com.school.management.service.academicImpl.storage;


import com.school.management.service.academic.storage.FileStorageService;
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
@ConditionalOnProperty(name = "storage.provider", havingValue = "local", matchIfMissing = true)

public class LocalFileStorageServiceImpl implements FileStorageService {

    @Value("${storage.local.base-dir:storage}")
    private String baseDir;

    @Override
    public String storeFile(MultipartFile file, String folder, String prefix) {
        try {
            Path uploadPath = Paths.get(baseDir, folder);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String fileName = prefix + UUID.randomUUID() + "_" + originalFilename;
            Path filePath = uploadPath.resolve(fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Retourne le chemin relatif local exploitable par WebSecurityConfig (/storage/** ou /uploads/**)
            return baseDir + "/" + folder + "/" + fileName;

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la sauvegarde locale du fichier : " + e.getMessage(), e);
        }
    }
}
