package com.school.management.service.academic.storage;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    /**
     * Sauvegarde un fichier Multipart (en local ou sur Supabase selon le profil actif)
     *
     * @param file   Le fichier envoyé par l'utilisateur
     * @param folder Le sous-dossier ou dossier cible (ex: "bulletin-headers", "enrollments")
     * @param prefix Le préfixe du fichier (ex: "flag_1_")
     * @return Le chemin relatif local (ex: "storage/bulletin-headers/flag.png") ou l'URL publique Supabase
     */
    String storeFile(MultipartFile file, String folder, String prefix);
}
