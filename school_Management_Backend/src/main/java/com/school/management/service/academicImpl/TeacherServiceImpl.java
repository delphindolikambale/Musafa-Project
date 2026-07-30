package com.school.management.service.academicImpl;

import com.school.management.dto.academic.AcademicTitleDTO;
import com.school.management.dto.academic.TeacherCreateDTO;
import com.school.management.dto.academic.TeacherResponseDTO;
import com.school.management.dto.academic.TrainingDTO;
import com.school.management.model.academic.*;
import com.school.management.model.enums.DayOfWeek;
import com.school.management.repository.academic.AcademicYearRepository;
import com.school.management.repository.academic.DomainSpecialityRepository;
import com.school.management.repository.academic.TeacherRepository;
import com.school.management.service.academic.TeacherService;
import com.school.management.security.services.UserDetailsImpl;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherServiceImpl implements TeacherService {

    private final TeacherRepository teacherRepository;
    private final AcademicYearRepository academicYearRepository;
    private final DomainSpecialityRepository specialityRepository;

    @Value("${app.storage.location:${user.dir}/storage}")
    private String storageLocation;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        this.rootLocation = Paths.get(storageLocation).toAbsolutePath().normalize();
        try {
            if (!Files.exists(this.rootLocation)) {
                Files.createDirectories(this.rootLocation);
            }
        } catch (IOException e) {
            throw new RuntimeException("Impossible d'initialiser le dossier de stockage", e);
        }
    }

    private UserDetailsImpl getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String) {
            throw new AccessDeniedException("❌ Session utilisateur invalide ou expirée. Veuillez vous reconnecter.");
        }
        return (UserDetailsImpl) principal;
    }

    private Long getCurrentSchoolId() {
        if (getCurrentUser().getSchool() == null) {
            throw new IllegalStateException("Action impossible : Votre compte utilisateur n'est rattaché à aucune école.");
        }
        return getCurrentUser().getSchool().getId();
    }

    /**
     * ✅ SÉCURITÉ : Règle métier - Un enseignant ne peut pas avoir plus de 2 jours pédagogiques.
     * Utilisation de List<?> pour être compatible avec List<DayOfWeek> ou List<String>.
     */
    private void validatePedagogicalDays(List<?> pedagogicalDays) {
        if (pedagogicalDays != null && pedagogicalDays.size() > 2) {
            throw new IllegalArgumentException("❌ Règle de sécurité : Un enseignant ne peut pas avoir plus de 2 journées pédagogiques par semaine.");
        }
    }

    @Override
    @Transactional
    public TeacherResponseDTO createTeacher(TeacherCreateDTO dto, MultipartFile photo, MultipartFile cv, List<MultipartFile> titleDocs, List<MultipartFile> trainingDocs) {
        validatePedagogicalDays(dto.getPedagogicalDays());

        Teacher teacher = new Teacher();
        Long currentSchoolId = getCurrentSchoolId();

        AcademicYear activeYear = academicYearRepository.findAll().stream()
                .filter(ay -> ay.isActive() && ay.getSchool() != null && ay.getSchool().getId().equals(currentSchoolId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Aucune année académique active trouvée pour votre établissement."));

        teacher.setSchool(getCurrentUser().getSchool());
        teacher.setSchoolRegistrationNumber(generateUniqueRegistrationNumber(activeYear));
        teacher.setActive(dto.isActive());

        handleSpecialityAssignment(teacher, dto);
        mapBasicInfo(teacher, dto);

        String safeLastName = dto.getLastName().trim().toUpperCase().replaceAll("[^A-Z0-9]", "_");
        String safeFirstName = dto.getFirstName().trim().toUpperCase().replaceAll("[^A-Z0-9]", "_");
        String folderName = teacher.getSchoolRegistrationNumber() + "_" + safeLastName + "_" + safeFirstName;

        String relativeFolderPath = "teachers/" + activeYear.getAnnee().replace("/", "-") + "/" + folderName;
        teacher.setDirectoryPath(relativeFolderPath);

        if (photo != null && !photo.isEmpty()) {
            teacher.setProfilePicturePath(saveFile(photo, relativeFolderPath + "/photo", "profil"));
        }
        if (cv != null && !cv.isEmpty()) {
            teacher.setCvPath(saveFile(cv, relativeFolderPath + "/cv", "cv"));
        }

        mapAcademicTitles(teacher, dto, titleDocs, relativeFolderPath);
        mapTrainings(teacher, dto, trainingDocs, relativeFolderPath);

        return mapToResponseDTO(teacherRepository.save(teacher));
    }

    @Override
    @Transactional
    public TeacherResponseDTO toggleActiveStatus(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));

        if (!teacher.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action interdite : Cet enseignant n'appartient pas à votre établissement.");
        }

        teacher.setActive(!teacher.isActive());
        return mapToResponseDTO(teacherRepository.save(teacher));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeacherResponseDTO> getActiveTeachers() {
        return teacherRepository.findAllByActiveTrueAndSchoolId(getCurrentSchoolId()).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TeacherResponseDTO updateTeacher(Long id, TeacherCreateDTO dto, MultipartFile photo, MultipartFile cv, List<MultipartFile> titleDocs, List<MultipartFile> trainingDocs) {
        validatePedagogicalDays(dto.getPedagogicalDays());

        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));

        if (!teacher.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action interdite : Vous ne pouvez pas modifier un enseignant d'un autre établissement.");
        }

        handleSpecialityAssignment(teacher, dto);
        mapBasicInfo(teacher, dto);
        teacher.setActive(dto.isActive());

        String currentPath = teacher.getDirectoryPath();
        if (currentPath == null) {
            currentPath = "teachers/default/" + teacher.getSchoolRegistrationNumber();
            teacher.setDirectoryPath(currentPath);
        }

        if (photo != null && !photo.isEmpty()) {
            teacher.setProfilePicturePath(saveFile(photo, currentPath + "/photo", "profil"));
        }
        if (cv != null && !cv.isEmpty()) {
            teacher.setCvPath(saveFile(cv, currentPath + "/cv", "cv"));
        }

        mapAcademicTitles(teacher, dto, titleDocs, currentPath);
        mapTrainings(teacher, dto, trainingDocs, currentPath);

        return mapToResponseDTO(teacherRepository.saveAndFlush(teacher));
    }

    private void handleSpecialityAssignment(Teacher teacher, TeacherCreateDTO dto) {
        if (dto.getNewSpecialityName() != null && !dto.getNewSpecialityName().trim().isEmpty()) {
            Long schoolId = getCurrentSchoolId();

            DomainSpeciality spec = specialityRepository.findByNameIgnoreCaseAndSchoolId(dto.getNewSpecialityName(), schoolId)
                    .orElseGet(() -> {
                        DomainSpeciality newSpec = DomainSpeciality.builder()
                                .name(dto.getNewSpecialityName().toUpperCase())
                                .school(getCurrentUser().getSchool())
                                .build();
                        return specialityRepository.save(newSpec);
                    });
            teacher.setDomainSpeciality(spec);
        } else if (dto.getDomainSpecialityId() != null) {
            teacher.setDomainSpeciality(specialityRepository.findById(dto.getDomainSpecialityId())
                    .orElseThrow(() -> new RuntimeException("Spécialité introuvable")));
        }
    }

    private String generateUniqueRegistrationNumber(AcademicYear activeYear) {
        String fullYear = activeYear.getAnnee();
        String yearSuffix = (fullYear != null && fullYear.length() >= 2) ? fullYear.substring(fullYear.length() - 2) : "26";
        long nextOrderNumber = teacherRepository.findAllBySchoolIdOrderByIdDesc(getCurrentSchoolId()).size() + 1;
        return "ENS" + nextOrderNumber + yearSuffix;
    }

    private void mapBasicInfo(Teacher teacher, TeacherCreateDTO dto) {
        teacher.setLastName(dto.getLastName());
        teacher.setMiddleName(dto.getMiddleName());
        teacher.setFirstName(dto.getFirstName());
        teacher.setNationalRegistrationNumber(dto.getNationalRegistrationNumber());
        teacher.setGender(dto.getGender());
        teacher.setMaritalStatus(dto.getMaritalStatus());
        teacher.setPlaceOfBirth(dto.getPlaceOfBirth());
        teacher.setDateOfBirth(dto.getDateOfBirth());
        teacher.setPhoneNumber(dto.getPhoneNumber());
        teacher.setEmail(dto.getEmail());
        teacher.setResidentialAddress(dto.getResidentialAddress());
        teacher.setPedagogicalDays(dto.getPedagogicalDays());
    }

    private TeacherResponseDTO mapToResponseDTO(Teacher t) {
        TeacherResponseDTO dto = new TeacherResponseDTO();
        dto.setId(t.getId());
        dto.setSchoolRegistrationNumber(t.getSchoolRegistrationNumber());
        dto.setNationalRegistrationNumber(t.getNationalRegistrationNumber());
        dto.setLastName(t.getLastName());
        dto.setMiddleName(t.getMiddleName());
        dto.setFirstName(t.getFirstName());
        dto.setGender(t.getGender());
        dto.setMaritalStatus(t.getMaritalStatus());
        dto.setPlaceOfBirth(t.getPlaceOfBirth());
        dto.setDateOfBirth(t.getDateOfBirth());
        dto.setPhoneNumber(t.getPhoneNumber());
        dto.setEmail(t.getEmail());
        dto.setResidentialAddress(t.getResidentialAddress());
        dto.setActive(t.isActive());
        dto.setPedagogicalDays(t.getPedagogicalDays());
        dto.setProfilePicturePath(t.getProfilePicturePath());
        dto.setCvPath(t.getCvPath());
        dto.setDirectoryPath(t.getDirectoryPath());

        if (t.getDomainSpeciality() != null) {
            dto.setDomainSpecialityId(t.getDomainSpeciality().getId());
            dto.setDomainSpecialityName(t.getDomainSpeciality().getName());
        }

        if (t.getAcademicTitles() != null) {
            dto.setAcademicTitles(t.getAcademicTitles().stream()
                    .map(at -> new AcademicTitleDTO(at.getTitleName(), at.getDocumentPath()))
                    .collect(Collectors.toList()));
        }
        if (t.getTrainings() != null) {
            dto.setTrainings(t.getTrainings().stream()
                    .map(tr -> new TrainingDTO(tr.getTrainingName(), tr.getDocumentPath()))
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private String saveFile(MultipartFile file, String subPath, String fileNamePrefix) {
        try {
            Path targetDir = this.rootLocation.resolve(subPath).normalize();
            if (!Files.exists(targetDir)) Files.createDirectories(targetDir);
            String originalFilename = file.getOriginalFilename();
            String extension = (originalFilename != null && originalFilename.contains("."))
                    ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".bin";
            String fileName = fileNamePrefix + "_" + System.currentTimeMillis() + extension;
            Path targetFile = targetDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
            return subPath + "/" + fileName;
        } catch (IOException e) { throw new RuntimeException("Erreur de stockage : " + e.getMessage()); }
    }

    private void mapAcademicTitles(Teacher teacher, TeacherCreateDTO dto, List<MultipartFile> titleDocs, String relativePath) {
        if (teacher.getAcademicTitles() == null) teacher.setAcademicTitles(new ArrayList<>());
        teacher.getAcademicTitles().clear();
        if (dto.getAcademicTitles() != null) {
            for (int i = 0; i < dto.getAcademicTitles().size(); i++) {
                AcademicTitleDTO tDto = dto.getAcademicTitles().get(i);
                String docPath = tDto.getDocumentPath();
                if (titleDocs != null && i < titleDocs.size() && titleDocs.get(i) != null && !titleDocs.get(i).isEmpty()) {
                    docPath = saveFile(titleDocs.get(i), relativePath + "/titres", "titre_" + i);
                }
                if (docPath != null) teacher.getAcademicTitles().add(new AcademicTitle(tDto.getTitleName(), docPath));
            }
        }
    }

    private void mapTrainings(Teacher teacher, TeacherCreateDTO dto, List<MultipartFile> trainingDocs, String relativePath) {
        if (teacher.getTrainings() == null) teacher.setTrainings(new ArrayList<>());
        teacher.getTrainings().clear();
        if (dto.getTrainings() != null) {
            for (int i = 0; i < dto.getTrainings().size(); i++) {
                TrainingDTO fDto = dto.getTrainings().get(i);
                String docPath = fDto.getDocumentPath();
                if (trainingDocs != null && i < trainingDocs.size() && trainingDocs.get(i) != null && !trainingDocs.get(i).isEmpty()) {
                    docPath = saveFile(trainingDocs.get(i), relativePath + "/formations", "formation_" + i);
                }
                if (docPath != null) teacher.getTrainings().add(new Training(fDto.getTrainingName(), docPath));
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeacherResponseDTO> getAllTeachers() {
        return teacherRepository.findAllBySchoolIdOrderByIdDesc(getCurrentSchoolId()).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeacherResponseDTO> searchTeachers(String query) {
        return teacherRepository.searchTeachers(query, getCurrentSchoolId()).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TeacherResponseDTO getTeacherByRegistrationNumber(String reg) {
        return teacherRepository.findBySchoolRegistrationNumberAndSchoolId(reg, getCurrentSchoolId())
                .map(this::mapToResponseDTO)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public TeacherResponseDTO getTeacherById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));

        if (!teacher.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Accès refusé : Cet enseignant n'appartient pas à votre établissement.");
        }
        return mapToResponseDTO(teacher);
    }

    @Override
    @Transactional
    public void deleteTeacher(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));

        if (!teacher.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action interdite : Suppression non autorisée.");
        }
        teacherRepository.delete(teacher);
    }
}