package com.school.management.service.academicImpl;

import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.academic.Student;
import com.school.management.model.auth.User;
import com.school.management.model.enums.StudentStatus;
import com.school.management.repository.academic.StudentRepository;
import com.school.management.repository.auth.UserRepository;
import com.school.management.service.academic.StudentService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository; // NOUVEAU
    private final PasswordEncoder passwordEncoder; // NOUVEAU

    // ✅ ADAPTATION : Constructeur mis à jour avec les nouveaux repos/services
    public StudentServiceImpl(StudentRepository studentRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public Student createStudent(Student student) {
        if (studentRepository.existsByPermanentNumber(student.getPermanentNumber())) {
            throw new IllegalStateException("❌ Un élève avec ce numéro permanent existe déjà");
        }

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

    @Override
    @Transactional
    public Student updateStudent(Student student) {
        if (!studentRepository.existsById(student.getId())) {
            throw new ResourceNotFoundException("❌ Impossible de modifier : Élève introuvable avec l'id " + student.getId());
        }
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
        return studentRepository.searchStudentsWithAccount(query, StudentStatus.ACTIF);
    }

    /**
     * ✅ NOUVEAU : Logique de liaison sécurisée de l'espace élève
     */
    @Override
    @Transactional
    public Student linkAccount(Long userId, String matricule, String password) {
        // 1. Récupérer l'utilisateur
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        // 2. Vérifier strictement le mot de passe
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Mot de passe incorrect");
        }

        // 3. Récupérer l'élève via le matricule fourni
        Student student = studentRepository.findByMatricule(matricule)
                .orElseThrow(() -> new ResourceNotFoundException("Matricule introuvable. Veuillez vérifier vos données."));

        // 4. Vérifier si l'élève n'est pas déjà lié à quelqu'un d'autre
        if (student.getUser() != null && !student.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Ce matricule est déjà lié à un autre compte.");
        }

        // 5. Appliquer la liaison et sauvegarder
        student.setUser(user);
        return studentRepository.save(student);
    }

    /**
     * ✅ NOUVEAU : Récupérer le dossier élève via l'ID de session globale
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<Student> getStudentByUserId(Long userId) {
        return studentRepository.findByUserId(userId);
    }
}