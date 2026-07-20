package com.school.management.service.academicImpl;

import com.school.management.dto.academic.bulletin.*;
import com.school.management.model.academic.*;
import com.school.management.repository.academic.ClassroomRepository;
import com.school.management.repository.academic.CourseAssignmentRepository;
import com.school.management.repository.academic.EnrollmentRepository;
import com.school.management.repository.academic.BulletinRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BulletinProviseurServiceImpl {

    private final ClassroomRepository classroomRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseAssignmentRepository courseAssignmentRepository;
    private final BulletinRepository bulletinRepository;

    public BulletinInitResponseDTO getBulletinInitData(Long classroomId, Long academicYearId, Long schoolId) {

        Classroom classroom = classroomRepository.findByIdAndSchoolId(classroomId, schoolId)
                .orElseThrow(() -> new RuntimeException("Classe introuvable ou accès non autorisé"));

        String titulaireName = "Non assigné";
        Long teacherId = null;

        if (classroom.getTitulaire() != null) {
            titulaireName = classroom.getTitulaire().getFullName();
            teacherId = classroom.getTitulaire().getId();
        }

        long studentCount = enrollmentRepository.countByClassroomIdAndAcademicYearIdAndSchoolIdAndActiveTrue(
                classroomId, academicYearId, schoolId);

        Long levelId = classroom.getLevel().getId();
        Long sectionId = classroom.getSection() != null ? classroom.getSection().getId() : null;
        Long optionId = classroom.getOption() != null ? classroom.getOption().getId() : null;

        List<CourseAssignment> assignments = courseAssignmentRepository.findByPedagogicalKey(
                levelId, sectionId, optionId, academicYearId, schoolId
        );

        // 1. Séparer les cours avec domaine (ex: EB) et sans domaine (ex: Humanités)
        List<CourseAssignment> standaloneAssignments = new ArrayList<>();
        List<CourseAssignment> domainAssignments = new ArrayList<>();

        for (CourseAssignment a : assignments) {
            if (a.getSubject().getDomain() == null) {
                standaloneAssignments.add(a);
            } else {
                domainAssignments.add(a);
            }
        }

        // 2. Traitement des cours sans domaine (Humanités)
        List<SubjectGridDTO> standaloneSubjects = standaloneAssignments.stream()
                .map(this::mapToSubjectDTO)
                .collect(Collectors.toList());

        // 3. Traitement des cours avec domaine (Éducation de base)
        Map<Domain, List<CourseAssignment>> groupedByDomain = domainAssignments.stream()
                .collect(Collectors.groupingBy(a -> a.getSubject().getDomain()));

        List<DomainGridDTO> domainDTOs = groupedByDomain.entrySet().stream().map(entry -> {
            Domain domain = entry.getKey();
            List<CourseAssignment> domAssigns = entry.getValue();

            // Séparer les cours directs du domaine et ceux liés à un sous-domaine
            List<CourseAssignment> directAssigns = new ArrayList<>();
            List<CourseAssignment> subDomainAssigns = new ArrayList<>();

            for (CourseAssignment a : domAssigns) {
                if (a.getSubject().getSubDomain() == null) {
                    directAssigns.add(a);
                } else {
                    subDomainAssigns.add(a);
                }
            }

            // Mapper les cours directs
            List<SubjectGridDTO> directSubjectsDTO = directAssigns.stream()
                    .map(this::mapToSubjectDTO)
                    .collect(Collectors.toList());

            // Grouper et mapper les sous-domaines
            Map<SubDomain, List<CourseAssignment>> groupedBySubDomain = subDomainAssigns.stream()
                    .collect(Collectors.groupingBy(a -> a.getSubject().getSubDomain()));

            List<SubDomainGridDTO> subDomainDTOs = groupedBySubDomain.entrySet().stream().map(subEntry -> {
                SubDomain subDomain = subEntry.getKey();
                List<SubjectGridDTO> subSubjectsDTO = subEntry.getValue().stream()
                        .map(this::mapToSubjectDTO)
                        .collect(Collectors.toList());

                return SubDomainGridDTO.builder()
                        .subDomainId(subDomain.getId())
                        .subDomainName(subDomain.getName())
                        .subjects(subSubjectsDTO)
                        .subMaxP1(sumP1(subSubjectsDTO)).subMaxP2(sumP2(subSubjectsDTO))
                        .subMaxExam1(sumExam1(subSubjectsDTO)).subMaxTotalS1(sumTotalS1(subSubjectsDTO))
                        .subMaxP3(sumP3(subSubjectsDTO)).subMaxP4(sumP4(subSubjectsDTO))
                        .subMaxExam2(sumExam2(subSubjectsDTO)).subMaxTotalS2(sumTotalS2(subSubjectsDTO))
                        .subMaxTotalGen(sumTotalGen(subSubjectsDTO))
                        .build();
            }).collect(Collectors.toList());

            // Calculer les totaux globaux du domaine (Directs + Sous-domaines)
            double domP1 = sumP1(directSubjectsDTO) + subDomainDTOs.stream().mapToDouble(SubDomainGridDTO::getSubMaxP1).sum();
            double domP2 = sumP2(directSubjectsDTO) + subDomainDTOs.stream().mapToDouble(SubDomainGridDTO::getSubMaxP2).sum();
            double domEx1 = sumExam1(directSubjectsDTO) + subDomainDTOs.stream().mapToDouble(SubDomainGridDTO::getSubMaxExam1).sum();
            double domTS1 = sumTotalS1(directSubjectsDTO) + subDomainDTOs.stream().mapToDouble(SubDomainGridDTO::getSubMaxTotalS1).sum();
            double domP3 = sumP3(directSubjectsDTO) + subDomainDTOs.stream().mapToDouble(SubDomainGridDTO::getSubMaxP3).sum();
            double domP4 = sumP4(directSubjectsDTO) + subDomainDTOs.stream().mapToDouble(SubDomainGridDTO::getSubMaxP4).sum();
            double domEx2 = sumExam2(directSubjectsDTO) + subDomainDTOs.stream().mapToDouble(SubDomainGridDTO::getSubMaxExam2).sum();
            double domTS2 = sumTotalS2(directSubjectsDTO) + subDomainDTOs.stream().mapToDouble(SubDomainGridDTO::getSubMaxTotalS2).sum();
            double domTGen = sumTotalGen(directSubjectsDTO) + subDomainDTOs.stream().mapToDouble(SubDomainGridDTO::getSubMaxTotalGen).sum();

            return DomainGridDTO.builder()
                    .domainId(domain.getId())
                    .domainName(domain.getName())
                    .subjects(directSubjectsDTO)
                    .subDomains(subDomainDTOs)
                    .subMaxP1(domP1).subMaxP2(domP2).subMaxExam1(domEx1).subMaxTotalS1(domTS1)
                    .subMaxP3(domP3).subMaxP4(domP4).subMaxExam2(domEx2).subMaxTotalS2(domTS2)
                    .subMaxTotalGen(domTGen)
                    .build();
        }).collect(Collectors.toList());

        // 4. Calcul des Maxima Généraux Finaux (Domaines + Humanités)
        double totP1 = sumP1(standaloneSubjects) + domainDTOs.stream().mapToDouble(DomainGridDTO::getSubMaxP1).sum();
        double totP2 = sumP2(standaloneSubjects) + domainDTOs.stream().mapToDouble(DomainGridDTO::getSubMaxP2).sum();
        double totEx1 = sumExam1(standaloneSubjects) + domainDTOs.stream().mapToDouble(DomainGridDTO::getSubMaxExam1).sum();
        double totTS1 = sumTotalS1(standaloneSubjects) + domainDTOs.stream().mapToDouble(DomainGridDTO::getSubMaxTotalS1).sum();
        double totP3 = sumP3(standaloneSubjects) + domainDTOs.stream().mapToDouble(DomainGridDTO::getSubMaxP3).sum();
        double totP4 = sumP4(standaloneSubjects) + domainDTOs.stream().mapToDouble(DomainGridDTO::getSubMaxP4).sum();
        double totEx2 = sumExam2(standaloneSubjects) + domainDTOs.stream().mapToDouble(DomainGridDTO::getSubMaxExam2).sum();
        double totTS2 = sumTotalS2(standaloneSubjects) + domainDTOs.stream().mapToDouble(DomainGridDTO::getSubMaxTotalS2).sum();
        double totGen = sumTotalGen(standaloneSubjects) + domainDTOs.stream().mapToDouble(DomainGridDTO::getSubMaxTotalGen).sum();

        return BulletinInitResponseDTO.builder()
                .classroomId(classroom.getId())
                .classroomName(classroom.getDisplayName())
                .teacherId(teacherId)
                .titulaireName(titulaireName)
                .studentCount(studentCount)
                .domains(domainDTOs)
                .standaloneSubjects(standaloneSubjects)
                .totalMaxP1(totP1).totalMaxP2(totP2).totalMaxExam1(totEx1).totalMaxS1(totTS1)
                .totalMaxP3(totP3).totalMaxP4(totP4).totalMaxExam2(totEx2).totalMaxS2(totTS2)
                .totalGeneralMax(totGen)
                .build();
    }

    public List<ClassroomBasicDTO> getClassesForComboBox(Long schoolId) {
        return classroomRepository.findBySchoolIdAndActiveTrue(schoolId).stream()
                .map(c -> new ClassroomBasicDTO(c.getId(), c.getDisplayName()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void initializeBulletins(Long classroomId, Long academicYearId, Long schoolId) {
        Classroom classroom = classroomRepository.findByIdAndSchoolId(classroomId, schoolId)
                .orElseThrow(() -> new RuntimeException("Classe introuvable ou accès non autorisé"));

        List<Enrollment> activeEnrollments = enrollmentRepository.findByClassroomIdAndAcademicYearIdAndSchoolIdAndActiveTrue(
                classroomId, academicYearId, schoolId);

        if (activeEnrollments.isEmpty()) {
            throw new RuntimeException("Impossible d'initialiser : Aucun élève actif trouvé pour cette classe.");
        }

        for (Enrollment enrollment : activeEnrollments) {
            boolean bulletinExists = bulletinRepository.existsByStudentIdAndClassroomIdAndAcademicYearIdAndSchoolId(
                    enrollment.getStudent().getId(), classroomId, academicYearId, schoolId);

            if (!bulletinExists) {
                Bulletin newBulletin = Bulletin.builder()
                        .student(enrollment.getStudent())
                        .classroom(classroom)
                        .academicYear(enrollment.getAcademicYear())
                        .school(classroom.getSchool())
                        .status("NOUVEAU")
                        .build();

                bulletinRepository.save(newBulletin);
            }
        }
    }

    private SubjectGridDTO mapToSubjectDTO(CourseAssignment a) {
        return SubjectGridDTO.builder()
                .subjectId(a.getSubject().getId())
                .subjectName(a.getSubject().getName())
                .maxP1(a.getMaxP1())
                .maxP2(a.getMaxP2())
                .maxExam1(a.getMaxExam1())
                .maxTotalS1(a.getMaxS1())
                .maxP3(a.getMaxP3())
                .maxP4(a.getMaxP4())
                .maxExam2(a.getMaxExam2())
                .maxTotalS2(a.getMaxS2())
                .maxTotalGen(a.getMaxTotal())
                .build();
    }

    private double sumP1(List<SubjectGridDTO> l) { return l.stream().mapToDouble(SubjectGridDTO::getMaxP1).sum(); }
    private double sumP2(List<SubjectGridDTO> l) { return l.stream().mapToDouble(SubjectGridDTO::getMaxP2).sum(); }
    private double sumExam1(List<SubjectGridDTO> l) { return l.stream().mapToDouble(SubjectGridDTO::getMaxExam1).sum(); }
    private double sumTotalS1(List<SubjectGridDTO> l) { return l.stream().mapToDouble(SubjectGridDTO::getMaxTotalS1).sum(); }
    private double sumP3(List<SubjectGridDTO> l) { return l.stream().mapToDouble(SubjectGridDTO::getMaxP3).sum(); }
    private double sumP4(List<SubjectGridDTO> l) { return l.stream().mapToDouble(SubjectGridDTO::getMaxP4).sum(); }
    private double sumExam2(List<SubjectGridDTO> l) { return l.stream().mapToDouble(SubjectGridDTO::getMaxExam2).sum(); }
    private double sumTotalS2(List<SubjectGridDTO> l) { return l.stream().mapToDouble(SubjectGridDTO::getMaxTotalS2).sum(); }
    private double sumTotalGen(List<SubjectGridDTO> l) { return l.stream().mapToDouble(SubjectGridDTO::getMaxTotalGen).sum(); }
}