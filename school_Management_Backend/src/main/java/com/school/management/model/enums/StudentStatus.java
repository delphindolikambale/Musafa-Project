package com.school.management.model.enums;

import lombok.Getter;

/**
 * Définit les différents états administratifs d'un élève
 * au sein du Complexe Scolaire MUSAFA.
 */
@Getter

public enum StudentStatus {

    /**
     * L'élève est régulièrement inscrit et suit les cours.
     */
    ACTIF("Actif"),

    /**
     * L'élève est temporairement écarté (raisons disciplinaires ou administratives).
     */
    SUSPENDU("Suspendu"),

    /**
     * L'élève a quitté définitivement l'établissement (transfert ou fin de cycle).
     */
    SORTI("Sorti"),

    /**
     * L'élève est enregistré mais son dossier d'admission est incomplet.
     */
    EN_ATTENTE("En attente");

    private final String displayValue;

    StudentStatus(String displayValue) {
        this.displayValue = displayValue;
    }
}
