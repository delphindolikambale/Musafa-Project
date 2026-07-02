package com.school.management.repository.academic;

import com.school.management.model.academic.StudentDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentDocumentRepository extends JpaRepository<StudentDocument, Long> {

    // ✅ ADAPTATION MULTI-TENANT : Récupération des documents sécurisée par école
    List<StudentDocument> findByEnrollmentIdAndSchoolId(Long enrollmentId, Long schoolId);

    // ✅ ADAPTATION MULTI-TENANT : Empêche la suppression d'un fichier appartenant à une autre école
    void deleteByFileNameAndSchoolId(String fileName, Long schoolId);
}