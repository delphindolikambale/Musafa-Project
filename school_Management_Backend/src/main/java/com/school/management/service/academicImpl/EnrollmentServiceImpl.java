package com.school.management.service.academicImpl;

import com.school.management.dto.academic.DocumentDTO;
import com.school.management.dto.academic.EnrollmentRequestDTO;
import com.school.management.dto.academic.EnrollmentResponseDTO;
import com.school.management.dto.financial.FinancialNotificationDTO;
import com.school.management.dto.financial.StudentAnnualFinancialProfileCreateDTO;
import com.school.management.dto.financial.StudentFinancialAccountCreateDTO;
import com.school.management.dto.financial.StudentFinancialAccountResponseDTO;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.academic.*;
import com.school.management.model.financial.ScheduleFees;
import com.school.management.repository.academic.*;
import com.school.management.repository.financial.ScheduleFeesRepository;
import com.school.management.service.academic.EnrollmentService;

import com.school.management.service.financial.StudentAnnualFinancialProfileService;
import com.school.management.service.financial.StudentFinancialAccountService;
import com.school.management.service.financialImpl.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
/**
 * Implémentation du service d'inscription.
 * Gère la logique métier des inscriptions et la génération du matricule unique MUSAFA.
 */
@Service

public class EnrollmentServiceImpl implements EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final ClassroomRepository classroomRepository;
    private final AcademicYearRepository academicYearRepository;
    private final StudentDocumentRepository studentDocumentRepository;

    private final StudentFinancialAccountService financialAccountService;
    private final StudentAnnualFinancialProfileService financialProfileService;
    private final ScheduleFeesRepository scheduleFeesRepository;
    private final NotificationService notificationService;

    private final Path rootLocation = Paths.get("storage/archives");

    public EnrollmentServiceImpl(
            EnrollmentRepository enrollmentRepository,
            StudentRepository studentRepository,
            ClassroomRepository classroomRepository,
            AcademicYearRepository academicYearRepository,
            StudentDocumentRepository studentDocumentRepository,
            StudentFinancialAccountService financialAccountService,
            StudentAnnualFinancialProfileService financialProfileService,
            ScheduleFeesRepository scheduleFeesRepository,
            NotificationService notificationService) {
        this.enrollmentRepository = enrollmentRepository;
        this.studentRepository = studentRepository;
        this.classroomRepository = classroomRepository;
        this.academicYearRepository = academicYearRepository;
        this.studentDocumentRepository = studentDocumentRepository;
        this.financialAccountService = financialAccountService;
        this.financialProfileService = financialProfileService;
        this.scheduleFeesRepository = scheduleFeesRepository;
        this.notificationService = notificationService;

        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Impossible d'initialiser le dossier de stockage", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentResponseDTO> getAllEnrollments(Long academicYearId) {
        List<Enrollment> enrollments;
        if (academicYearId != null) {
            enrollments = enrollmentRepository.findByAcademicYearId(academicYearId);
        } else {
            enrollments = enrollmentRepository.findAll();
        }
        return enrollments.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EnrollmentResponseDTO createEnrollment(EnrollmentRequestDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Élève non trouvé"));
        AcademicYear year = academicYearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() -> new ResourceNotFoundException("Année académique non trouvée"));
        Classroom classroom = classroomRepository.findById(dto.getClassroomId())
                .orElseThrow(() -> new ResourceNotFoundException("Classe non trouvée"));

        validateClassroomCapacity(classroom, year.getId());

        if (enrollmentRepository.existsByStudentIdAndAcademicYearId(student.getId(), year.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "❌ Cet élève est déjà inscrit pour cette année académique.");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .academicYear(year)
                .classroom(classroom)
                .enrollmentType(dto.getEnrollmentType())
                .active(true)
                .enrollmentDate(LocalDate.now())
                .enrollmentNumber(generateEnrollmentNumber(dto.getEnrollmentType().name(), year.getId()))
                .documents(new ArrayList<>())
                .build();

        if (dto.getFiles() != null && !dto.getFiles().isEmpty()) {
            processAndAttachDocuments(enrollment, dto.getFiles(), dto.getDocumentsPresented());
        }

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        if (student.getMatricule() == null || student.getMatricule().trim().isEmpty()) {
            String yearSuffix = year.getAnnee().substring(Math.max(0, year.getAnnee().length() - 2));
            student.setMatricule(savedEnrollment.getId().toString() + yearSuffix);
            studentRepository.save(student);
        }

        StudentFinancialAccountResponseDTO account = financialAccountService.create(
                StudentFinancialAccountCreateDTO.builder().studentId(student.getId()).build()
        );

        ScheduleFees schedule = scheduleFeesRepository.findByLevelIdAndOptionIdAndAcademicYearId(
                classroom.getLevel().getId(),
                (classroom.getOption() != null ? classroom.getOption().getId() : null),
                year.getId()
        ).orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "❌ Aucun barème configuré pour la classe " + classroom.getDisplayName()));

        financialProfileService.create(StudentAnnualFinancialProfileCreateDTO.builder()
                .financialAccountId(account.getId())
                .enrollmentId(savedEnrollment.getId())
                .scheduleFeesId(schedule.getId())
                .build());

        String fullName = student.getLastName() + " " + (student.getPostName() != null ? student.getPostName() + " " : "") + student.getFirstName();

        FinancialNotificationDTO notifDto = FinancialNotificationDTO.builder()
                .studentName(fullName)
                .accountNumber(account.getAccountNumber())
                .classroom(classroom.getDisplayName())
                .amountDue(schedule.getTotalAmount().toString())
                .currency(schedule.getCurrency().name())
                .message("Nouvelle inscription effectuée.")
                .build();

        notificationService.sendEnrollmentNotification(notifDto);

        return mapToResponseDTO(savedEnrollment);
    }

    @Override
    @Transactional
    public EnrollmentResponseDTO updateEnrollment(Long id, EnrollmentRequestDTO dto) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription introuvable"));

        Classroom newClassroom = classroomRepository.findById(dto.getClassroomId())
                .orElseThrow(() -> new ResourceNotFoundException("La classe spécifiée n'existe pas"));

        if (!enrollment.getClassroom().getId().equals(newClassroom.getId())) {
            validateClassroomCapacity(newClassroom, enrollment.getAcademicYear().getId());
        }

        if (dto.getFiles() != null && !dto.getFiles().isEmpty()) {
            processAndAttachDocuments(enrollment, dto.getFiles(), dto.getDocumentsPresented());
        }

        enrollment.setClassroom(newClassroom);

        if (dto.getEnrollmentType() != null) {
            enrollment.setEnrollmentType(dto.getEnrollmentType());
        }

        return mapToResponseDTO(enrollmentRepository.save(enrollment));
    }

    private void processAndAttachDocuments(Enrollment enrollment, List<MultipartFile> files, List<String> customNames) {
        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            if (file.isEmpty()) continue;

            String customName = (customNames != null && i < customNames.size() && !customNames.get(i).isEmpty())
                    ? customNames.get(i)
                    : "Document_" + (i + 1);

            try {
                String originalName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
                String sanitizedName = originalName.replaceAll("[^a-zA-Z0-9.-]", "_");
                String fileName = UUID.randomUUID().toString() + "_" + sanitizedName;

                Files.copy(file.getInputStream(), rootLocation.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

                StudentDocument doc = StudentDocument.builder()
                        .customName(customName)
                        .fileName(fileName)
                        .fileType(file.getContentType())
                        .fileUrl("/api/archives/download/" + fileName)
                        .enrollment(enrollment)
                        .build();

                enrollment.addDocument(doc);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur sauvegarde fichier");
            }
        }
    }

    @Override
    @Transactional
    public void deleteDocument(Long enrollmentId, Long documentId) {
        StudentDocument doc = studentDocumentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable"));
        try {
            Files.deleteIfExists(rootLocation.resolve(doc.getFileName()));
        } catch (IOException e) {
            System.err.println("⚠️ Erreur suppression physique");
        }
        studentDocumentRepository.delete(doc);
    }

    private void validateClassroomCapacity(Classroom classroom, Long academicYearId) {
        long currentStudents = enrollmentRepository.countByClassroomIdAndAcademicYearIdAndActiveTrue(classroom.getId(), academicYearId);
        int maxCapacity = (classroom.getRoom() != null) ? classroom.getRoom().getCapacity() : 0;

        if (maxCapacity > 0 && currentStudents >= maxCapacity) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("❌ La classe %s est complète.", classroom.getDisplayName()));
        }
    }

    private String generateEnrollmentNumber(String type, Long academicYearId) {
        long count = enrollmentRepository.countByAcademicYearId(academicYearId);
        String prefix = type.equalsIgnoreCase("REINSCRIPTION") ? "R" : "N";
        return String.format("INS-%d-%03d-%s", academicYearId, count + 1, prefix);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentResponseDTO> getEnrollmentsByClassroomAndAcademicYear(Long classroomId, Long academicYearId) {
        return enrollmentRepository.findByClassroomIdAndAcademicYearIdAndActiveTrue(classroomId, academicYearId)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteEnrollment(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription introuvable"));
        enrollmentRepository.delete(enrollment);
    }

    private EnrollmentResponseDTO mapToResponseDTO(Enrollment enrollment) {
        Student student = enrollment.getStudent();
        Classroom classroom = enrollment.getClassroom();
        Long yearId = enrollment.getAcademicYear().getId();

        long currentCount = enrollmentRepository.countByClassroomIdAndAcademicYearIdAndActiveTrue(classroom.getId(), yearId);
        int capacity = (classroom.getRoom() != null) ? classroom.getRoom().getCapacity() : 0;

        List<DocumentDTO> documentDTOs = enrollment.getDocuments().stream()
                .map(doc -> DocumentDTO.builder()
                        .id(doc.getId())
                        .customName(doc.getCustomName())
                        .fileUrl(doc.getFileUrl())
                        .fileType(doc.getFileType())
                        .build())
                .collect(Collectors.toList());

        return EnrollmentResponseDTO.builder()
                .id(enrollment.getId())
                .studentId(student.getId()) // CORRECTION CRUCIALE : Expose l'ID unique de l'élève
                .studentFullName(student.getLastName() + " " + (student.getPostName() != null ? student.getPostName() + " " : "") + student.getFirstName())
                .matricule(student.getMatricule())
                .gender(student.getGender() != null ? student.getGender().name() : "N/A")
                .classroomName(classroom.getDisplayName())
                .classroomId(classroom.getId())
                .academicYear(enrollment.getAcademicYear().getAnnee())
                .enrollmentDate(enrollment.getEnrollmentDate())
                .enrollmentType(enrollment.getEnrollmentType() != null ? enrollment.getEnrollmentType().name() : "NOUVEAU")
                .active(enrollment.isActive())
                .capacity(capacity)
                .currentStudents(currentCount)
                .availablePlaces((long) capacity - currentCount)
                .documents(documentDTOs)
                .build();
    }
}
