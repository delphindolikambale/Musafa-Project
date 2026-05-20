package com.school.management.service.academicImpl;

import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.academic.Student;
import com.school.management.model.enums.StudentStatus;
import com.school.management.repository.academic.StudentRepository;
import com.school.management.service.academic.StudentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudentServiceImpl implements StudentService {
    private final StudentRepository studentRepository;

    public StudentServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    @Transactional
    public Student createStudent(Student student) {
        // Vérification d'unicité pour le numéro permanent
        if (studentRepository.existsByPermanentNumber(student.getPermanentNumber())) {
            throw new IllegalStateException("❌ Un élève avec ce numéro permanent existe déjà");
        }

        // Initialisation du statut par défaut si non précisé
        if (student.getStatus() == null) {
            student.setStatus(StudentStatus.ACTIF);
        }

        return studentRepository.save(student);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("❌ Élève introuvable avec l'id : " + id));
    }

    /**
     * ✅ MÉTHODE AJOUTÉE : Pour corriger "cannot find symbol updateStudent"
     * Cette méthode gère la mise à jour complète via le PUT du Controller.
     */
    @Override
    @Transactional
    public Student updateStudent(Student student) {
        // 1. On vérifie si l'élève existe avant de faire quoi que ce soit
        if (!studentRepository.existsById(student.getId())) {
            throw new ResourceNotFoundException("❌ Impossible de modifier : Élève introuvable avec l'id " + student.getId());
        }

        // 2. Le .save() fera un UPDATE car l'objet possède déjà un ID
        return studentRepository.save(student);
    }

    @Override
    @Transactional(readOnly = true)
    public Student getStudentByPermanentNumber(String permanentNumber) {
        return studentRepository.findByPermanentNumber(permanentNumber)
                .orElseThrow(() -> new IllegalStateException("❌ Aucun élève trouvé avec le numéro permanent : " + permanentNumber));
    }

    @Override
    @Transactional(readOnly = true)
    public Student getStudentByMatricule(String matricule) {
        return studentRepository.findByMatricule(matricule)
                .orElseThrow(() -> new IllegalStateException("❌ Aucun élève trouvé avec le matricule : " + matricule));
    }

    @Override
    @Transactional
    public Student updateStudentStatus(Long id, StudentStatus status) {
        Student student = getStudentById(id);
        student.setStatus(status);
        return studentRepository.save(student);
    }

    @Override
    @Transactional
    public void deleteStudent(Long id) {
        // Vérification d'existence avant suppression pour éviter les erreurs SQL
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("❌ Élève non trouvé avec l'id : " + id);
        }
        studentRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Student> searchStudentsWithAccount(String query) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }
        // On passe explicitement le statut ACTIVE ici
        return studentRepository.searchStudentsWithAccount(query, StudentStatus.ACTIF);
    }
}
