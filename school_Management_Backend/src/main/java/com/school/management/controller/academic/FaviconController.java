package com.school.management.controller.academic;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FaviconController {
    /**
     * Intercepte la requête automatique du navigateur pour le favicon.
     * Répond avec un statut "No Content" (204) pour éviter les exceptions et les logs rouges.
     */
    @GetMapping("/favicon.ico")
    public ResponseEntity<Void> disableFavicon() {
        return ResponseEntity.noContent().build();
    }

}
