package com.school.management.service.academicImpl;

import com.school.management.dto.academic.ClassroomReportDetailDTO;
import com.school.management.dto.academic.ReportStructureDTO;
import com.school.management.model.academic.AcademicYear;
import com.school.management.model.academic.Classroom;
import com.school.management.model.academic.Enrollment;
import com.school.management.model.academic.Student;
import com.school.management.model.enums.Gender;
import com.school.management.repository.academic.AcademicYearRepository;
import com.school.management.repository.academic.ClassroomRepository;
import com.school.management.repository.academic.EnrollmentRepository;
import com.school.management.security.services.UserDetailsImpl; // ✅ AJOUT
import org.springframework.security.core.context.SecurityContextHolder; // ✅ AJOUT
import org.springframework.security.access.AccessDeniedException; // ✅ AJOUT
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final AcademicYearRepository academicYearRepository;
    private final ClassroomRepository classroomRepository;
    private final EnrollmentRepository enrollmentRepository;

    public ReportService(AcademicYearRepository academicYearRepository,
                         ClassroomRepository classroomRepository,
                         EnrollmentRepository enrollmentRepository) {
        this.academicYearRepository = academicYearRepository;
        this.classroomRepository = classroomRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    /**
     * ✅ EXTRACTION DU CONTEXTE MULTI-TENANT SÉCURISÉ
     */
    private UserDetailsImpl getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String) {
            throw new AccessDeniedException("❌ Session invalide ou expirée.");
        }
        return (UserDetailsImpl) principal;
    }

    private Long getCurrentSchoolId() {
        if (getCurrentUser().getSchool() == null) {
            throw new IllegalStateException("L'utilisateur actuel n'est relié à aucun établissement.");
        }
        return getCurrentUser().getSchool().getId();
    }

    /**
     * Structure globale des dossiers (Années -> Classes actives)
     */
    @Transactional(readOnly = true)
    public List<ReportStructureDTO> getReportsFolderStructure() {
        Long schoolId = getCurrentSchoolId();

        // ✅ CORRECTION MULTI-TENANT : Utilisation des méthodes de requêtage exactes des repositories
        List<AcademicYear> years = academicYearRepository.findAllBySchoolId(schoolId);
        List<Classroom> allClassrooms = classroomRepository.findAllBySchoolId(schoolId);

        return years.stream().map(year -> {
                    List<ReportStructureDTO.ClassroomReportSummary> classroomSummaries = allClassrooms.stream()
                            .map(classroom -> {
                                // ✅ CORRECTION MULTI-TENANT : Ajout du paramètre schoolId requis par le repository
                                List<Enrollment> activeEnrollments = enrollmentRepository
                                        .findByClassroomIdAndAcademicYearIdAndSchoolIdAndActiveTrue(classroom.getId(), year.getId(), schoolId);

                                long total = activeEnrollments.size();

                                long boys = activeEnrollments.stream()
                                        .filter(e -> e.getStudent() != null && e.getStudent().getGender() == Gender.MASCULIN)
                                        .count();

                                long girls = total - boys;

                                int capacity = 0;
                                if (classroom.getRoom() != null) {
                                    capacity = classroom.getRoom().getCapacity();
                                }

                                double occupancy = (capacity > 0) ? (double) total / capacity * 100 : 0;

                                return ReportStructureDTO.ClassroomReportSummary.builder()
                                        .classroomId(classroom.getId())
                                        .classroomName(classroom.getDisplayName())
                                        .totalStudents(total)
                                        .boyCount(boys)
                                        .girlCount(girls)
                                        .capacity(capacity)
                                        .occupancyRate(Math.round(occupancy * 100.0) / 100.0)
                                        .build();
                            })
                            .filter(summary -> summary.getTotalStudents() > 0)
                            .collect(Collectors.toList());

                    return ReportStructureDTO.builder()
                            .academicYearId(year.getId())
                            .academicYearLabel("Année Scolaire : " + year.getAnnee())
                            .classrooms(classroomSummaries)
                            .build();
                })
                .filter(yearDto -> !yearDto.getClassrooms().isEmpty())
                .collect(Collectors.toList());
    }

    /**
     * Détails d'une classe spécifique pour la prévisualisation/impression
     */
    @Transactional(readOnly = true)
    public ClassroomReportDetailDTO getClassroomReportDetail(Long classroomId, Long yearId) {
        Long schoolId = getCurrentSchoolId();

        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classe non trouvée"));

        AcademicYear year = academicYearRepository.findById(yearId)
                .orElseThrow(() -> new RuntimeException("Année non trouvée"));

        // ✅ MULTI-TENANT VERIFICATION : Interdiction d'accéder aux rapports d'autres entités
        if (!classroom.getSchool().getId().equals(schoolId) || !year.getSchool().getId().equals(schoolId)) {
            throw new AccessDeniedException("❌ Accès refusé : Tentative d'extraction de rapports hors périmètre d'accréditation.");
        }

        // ✅ CORRECTION MULTI-TENANT : Alignement sur la méthode sécurisée prenant le schoolId
        List<Enrollment> enrollments = enrollmentRepository
                .findByClassroomIdAndAcademicYearIdAndSchoolIdAndActiveTrue(classroomId, yearId, schoolId);

        List<ClassroomReportDetailDTO.StudentRowDTO> studentRows = enrollments.stream()
                .map(e -> {
                    Student s = e.getStudent();
                    return ClassroomReportDetailDTO.StudentRowDTO.builder()
                            .matricule(s.getMatricule())
                            .lastName(s.getLastName())
                            .postName(s.getPostName())
                            .firstName(s.getFirstName())
                            .gender(s.getGender().toString())
                            .birthDate(s.getBirthDate().toString())
                            .birthPlace(s.getBirthPlace())
                            .build();
                })
                .sorted((a, b) -> a.getLastName().compareToIgnoreCase(b.getLastName()))
                .collect(Collectors.toList());

        long boys = studentRows.stream().filter(r -> r.getGender().equals("MASCULIN")).count();

        return ClassroomReportDetailDTO.builder()
                .schoolName(getCurrentUser().getSchool().getName()) // ✅ DYNAMIQUE : Utilisation du nom réel de l'établissement du tenant au lieu de la constante codée en dur
                .academicYearLabel(year.getAnnee())
                .classroomName(classroom.getDisplayName())
                .totalStudents(studentRows.size())
                .boysCount((int) boys)
                .girlsCount(studentRows.size() - (int) boys)
                .students(studentRows)
                .build();
    }
}