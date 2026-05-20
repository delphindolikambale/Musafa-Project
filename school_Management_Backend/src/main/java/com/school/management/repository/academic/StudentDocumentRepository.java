package com.school.management.repository.academic;

import com.school.management.model.academic.StudentDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface StudentDocumentRepository extends JpaRepository<StudentDocument, Long> {

    // ✅ Récupérer tous les documents d'une inscription spécifique
    List<StudentDocument> findByEnrollmentId(Long enrollmentId);

    // ✅ Optionnel : Utile pour vérifier si un fichier existe avant suppression physique
    void deleteByFileName(String fileName);
}
