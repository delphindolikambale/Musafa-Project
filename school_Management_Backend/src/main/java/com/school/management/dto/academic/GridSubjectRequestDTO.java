package com.school.management.dto.academic;

import com.school.management.model.enums.CourseCategory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class GridSubjectRequestDTO {

    // Ces champs peuvent être null (Ex: Cycle de Base)
    private Long sectionId;
    private Long optionId;

    // ADAPTATION : L'identifiant n'est plus requis obligatoirement à la validation de surface du DTO
    private Long academicYearId;

    @NotEmpty(message = "La liste des cours ne doit pas être vide")
    @Valid
    private List<GridCourseDTO> courses;

    @Data
    public static class GridCourseDTO {
        @NotNull(message = "Le nom du cours est obligatoire")
        private String name;

        // ADAPTATION : L'annotation @NotNull a été retirée car le domaine est dissocié à cette étape
        private Long domainId;

        private CourseCategory category;

        // Map associant l'ID du niveau (Level) au nombre d'heures
        @NotEmpty(message = "Les volumes horaires par niveau sont obligatoires")
        private Map<Long, Double> levelHours;
    }
}