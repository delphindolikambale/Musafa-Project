package com.school.management.dto.academic.bulletin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulletinInitResponseDTO {
    private Long classroomId;
    private String classroomName;
    private Long teacherId; // ✅ AJOUT : Identifiant du titulaire nécessaire pour le SSE
    private String titulaireName;
    private Long studentCount;

    // Structure pour l'Éducation de Base (EB)
    private List<DomainGridDTO> domains;

    // Structure pour les Humanités (Cours en vrac, sans aucun domaine)
    private List<SubjectGridDTO> standaloneSubjects;

    // Maxima Généraux Globaux
    private double totalMaxP1;
    private double totalMaxP2;
    private double totalMaxExam1;
    private double totalMaxS1;

    private double totalMaxP3;
    private double totalMaxP4;
    private double totalMaxExam2;
    private double totalMaxS2;

    private double totalGeneralMax;
}