package com.school.management.service.academicImpl;

import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.academic.Student;
import com.school.management.model.auth.User;
import com.school.management.model.enums.StudentStatus;
import com.school.management.model.multitenant.School;
import com.school.management.repository.academic.StudentRepository;
import com.school.management.repository.auth.UserRepository;
import com.school.management.security.services.UserDetailsImpl;
import com.school.management.service.academic.StudentService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentServiceImpl(StudentRepository studentRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Extrait l'ID de l'établissement lié à la session courante
     */
    private Long getCurrentSchoolId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // ✅ CORRECTION : Vérification robuste alignée sur la casse exacte de l'enum AppRole (avec et sans préfixe ROLE_)
        boolean isSuperAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("SUPER_ADMIN_SYSTEM") || a.getAuthority().equals("ROLE_SUPER_ADMIN_SYSTEM"));

        if (isSuperAdmin) {
            throw new IllegalStateException("Opération impossible : l'autorité globale SuperAdminSystem n'agit pas au sein d'une école locale.");
        }

        // ✅ INTÉGRATION SÉCURISÉE : Alerte explicite si un utilisateur local (ex: PREFET) n'a pas de school_id défini en BDD
        if (userDetails.getSchool() == null) {
            throw new IllegalStateException("❌ Configuration requise : Votre compte (" + userDetails.getUsername() + ") n'est rattaché à aucun établissement dans la base de données. Veuillez renseigner la colonne school_id de votre ligne utilisateur.");
        }

        return userDetails.getSchool().getId();
    }

    @Override
    @Transactional
    public Student createStudent(Student student) {
        Long schoolId = getCurrentSchoolId();
        if (studentRepository.existsByPermanentNumberAndSchoolId(student.getPermanentNumber(), schoolId)) {
            throw new IllegalStateException("❌ Un élève avec ce numéro permanent existe déjà dans votre établissement.");
        }

        if (student.getStatus() == null) {
            student.setStatus(StudentStatus.ACTIF);
        }

        // ✅ CORRECTION MULTI-TENANT : Injection obligatoire de l'école courante pour isoler l'élève créé
        student.setSchool(School.builder().id(schoolId).build());

        return studentRepository.save(student);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Student> getAllStudents() {
        // 🛡️ ADAPTATION SÉCURITÉ : Cloisonnement hermétique par ID d'école
        return studentRepository.findBySchoolId(getCurrentSchoolId());
    }

    @Override
    @Transactional(readOnly = true)
    public Student getStudentById(Long id) {
        return studentRepository.findByIdAndSchoolId(id, getCurrentSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("❌ Élève introuvable avec l'id : " + id));
    }

    @Override
    @Transactional
    public Student updateStudent(Student student) {
        Long schoolId = getCurrentSchoolId();

        // ✅ SÉCURISATION MULTI-TENANT : Valider l'existence ET le scope d'appartenance à l'établissement avant modification
        Student existingStudent = studentRepository.findByIdAndSchoolId(student.getId(), schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("❌ Impossible de modifier : Élève introuvable ou accès non autorisé avec l'id " + student.getId()));

        // ✅ PROTECTION : On verrouille l'école d'origine pour empêcher tout transfert inter-tenant frauduleux via le payload JSON
        student.setSchool(existingStudent.getSchool());

        return studentRepository.save(student);
    }

    @Override
    @Transactional(readOnly = true)
    public Student getStudentByPermanentNumber(String permanentNumber) {
        return studentRepository.findByPermanentNumberAndSchoolId(permanentNumber, getCurrentSchoolId())
                .orElseThrow(() -> new IllegalStateException("❌ Aucun élève trouvé avec le numéro permanent : " + permanentNumber));
    }

    @Override
    @Transactional(readOnly = true)
    public Student getStudentByMatricule(String matricule) {
        return studentRepository.findByMatriculeAndSchoolId(matricule, getCurrentSchoolId())
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
        Student student = getStudentById(id);
        studentRepository.delete(student);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Student> searchStudentsWithAccount(String query) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }
        return studentRepository.searchStudentsWithAccountMultiTenant(query, StudentStatus.ACTIF, getCurrentSchoolId());
    }

    @Override
    @Transactional
    public Student linkAccount(Long userId, String matricule, String password) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Mot de passe incorrect");
        }

        // ✅ MODIFICATION APPORTÉE : Recherche globale par matricule au lieu de filtrer par l'école de la session utilisateur (qui est encore nulle)
        Student student = studentRepository.findByMatricule(matricule)
                .orElseThrow(() -> new ResourceNotFoundException("Matricule introuvable dans le système."));

        if (student.getUser() != null && !student.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Ce matricule est déjà lié à un autre compte.");
        }

        student.setUser(user);

        // ✅ MUTATION MULTI-TENANT CRITIQUE : Maintenant que l'élève est trouvé, on propage l'ID de son établissement d'origine vers son compte User local
        if (user.getSchool() == null && student.getSchool() != null) {
            user.setSchool(student.getSchool());
            userRepository.save(user);
        }

        return studentRepository.save(student);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Student> getStudentByUserId(Long userId) {
        // ✅ MODIFICATION APPORTÉE : Recherche directe par ID utilisateur sans passer par getCurrentSchoolId() pour éviter le plantage 500 des comptes non liés au démarrage de l'application
        return studentRepository.findByUserId(userId);
    }
}