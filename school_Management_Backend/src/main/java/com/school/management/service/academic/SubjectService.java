package com.school.management.service.academic;
import com.school.management.dto.academic.SubjectRequestDTO;
import com.school.management.dto.academic.SubjectResponseDTO;
import java.util.List;

public interface SubjectService {
    SubjectResponseDTO createSubject(SubjectRequestDTO dto);

    /**
     * Récupère la liste des matières configurées pour une classe précise.
     */
    List<SubjectResponseDTO> getSubjectsByClass(Long levelId, Long sectionId, Long optionId, Long yearId);

    List<SubjectResponseDTO> getAllSubjects();

    // AJOUT DES MÉTHODES MANQUANTES
    SubjectResponseDTO updateSubject(Long id, SubjectRequestDTO dto);

    void deleteSubject(Long id);
}
