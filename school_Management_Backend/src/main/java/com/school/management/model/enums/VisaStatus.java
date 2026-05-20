package com.school.management.model.enums;

public enum VisaStatus {
    DRAFT,                  // Brouillon (En cours de saisie par le prof)
    SUBMITTED_TO_PROVISEUR, // Transmis au Proviseur pour contrôle
    VALIDATED_BY_PROVISEUR, // Validé par la Direction
    VALIDATED_BY_TITULAIRE  // Clôturé et intégré au bulletin
}
