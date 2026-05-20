package com.school.management.model.enums;

/**
 * Liste exhaustive des acteurs du système.
 * L'ordre et les noms sont cruciaux pour la hiérarchie des droits.
 */

public enum AppRole {

    ROLE_PREFET,             // Gestion administrative globale
    ROLE_PROVISEUR,          // Gestion pédagogique et discipline
    ROLE_ENSEIGNANT,         // Encodage des points et présences
    ROLE_COMPTABLE,          // Gestion du budget et rapports financiers
    ROLE_CAISSIER,           // Perception des frais et émission de reçus
    ROLE_ADMIN_BUDGET,       // Planification budgétaire
    ROLE_ELEVE,              // Consultation des notes et soldes
    ROLE_ADMIN_SYSTEM        // Super-utilisateur (Maintenance technique)
}
