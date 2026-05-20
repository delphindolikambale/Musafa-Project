package com.school.management.service.financial;

import com.school.management.dto.financial.FeesGroupCreateDTO;
import com.school.management.dto.financial.FeesGroupResponseDTO;

import java.util.List;

public interface FeesGroupService {
    /* =========================
           CREATE
           =========================
           Création d’un FeesGroup (SCOLARITE / DIVERS)
           pour une ANNÉE ACADÉMIQUE
           ========================= */
    FeesGroupResponseDTO create(FeesGroupCreateDTO dto);
    // Nouvelles méthodes
    FeesGroupResponseDTO update(Long id, FeesGroupCreateDTO dto);
    void delete(Long id);

    /* =========================
       GET ALL (ADMIN / BACK-OFFICE)
       ========================= */
    List<FeesGroupResponseDTO> getAll();

    /* =========================
       GET BY ACADEMIC YEAR
       ========================= */
    List<FeesGroupResponseDTO> getByAcademicYear(Long academicYearId);

    /* =========================
       GET BY ID
       ========================= */
    FeesGroupResponseDTO getById(Long id);

    /* =========================
       DEACTIVATE
       ========================= */
    void deactivate(Long id);
}
