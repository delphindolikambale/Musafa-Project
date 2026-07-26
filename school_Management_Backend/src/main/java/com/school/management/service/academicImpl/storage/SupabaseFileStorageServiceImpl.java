package com.school.management.service.academicImpl.storage;

import com.school.management.service.academic.storage.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "storage.provider", havingValue = "supabase")

public class SupabaseFileStorageServiceImpl implements FileStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key}")
    private String serviceRoleKey;

    @Value("${supabase.bucket-name:school-media}")
    private String bucketName;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String storeFile(MultipartFile file, String folder, String prefix) {
        try {
            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String fileName = prefix + UUID.randomUUID() + "_" + originalFilename;
            String objectPath = folder + "/" + fileName;

            // Endpoint API Storage de Supabase
            String uploadUrl = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucketName, objectPath);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + serviceRoleKey);
            headers.set("apiKey", serviceRoleKey);

            String contentType = file.getContentType();
            if (contentType == null || contentType.isEmpty()) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }
            headers.setContentType(MediaType.parseMediaType(contentType));

            HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

            ResponseEntity<String> response = restTemplate.exchange(uploadUrl, HttpMethod.POST, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                // Retourne l'URL publique directe du fichier sur Supabase
                return String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucketName, objectPath);
            } else {
                throw new RuntimeException("Échec de l'upload Supabase. Code statut : " + response.getStatusCode());
            }

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la lecture des octets du fichier : " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Erreur d'envoi du fichier vers Supabase Storage : " + e.getMessage(), e);
        }
    }
}
