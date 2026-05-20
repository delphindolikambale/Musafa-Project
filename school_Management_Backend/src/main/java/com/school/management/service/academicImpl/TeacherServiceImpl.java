package com.school.management.service.academicImpl;

import com.school.management.dto.academic.AcademicTitleDTO;
import com.school.management.dto.academic.TeacherCreateDTO;
import com.school.management.dto.academic.TeacherResponseDTO;
import com.school.management.dto.academic.TrainingDTO;
import com.school.management.model.academic.*;
import com.school.management.repository.academic.AcademicYearRepository;
import com.school.management.repository.academic.DomainRepository;
import com.school.management.repository.academic.DomainSpecialityRepository;
import com.school.management.repository.academic.TeacherRepository;
import com.school.management.service.academic.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherServiceImpl implements TeacherService { // 'implements' ajouté ici

    private final TeacherRepository teacherRepository;
    private final AcademicYearRepository academicYearRepository;
    private final DomainSpecialityRepository specialityRepository;
    private final Path rootLocation = Paths.get(System.getProperty("user.dir")).resolve("storage");

    @Override
    @Transactional
    public TeacherResponseDTO createTeacher(TeacherCreateDTO dto, MultipartFile photo, MultipartFile cv, List<MultipartFile> titleDocs, List<MultipartFile> trainingDocs) {
        Teacher teacher = new Teacher();
        AcademicYear activeYear = academicYearRepository.findAll().stream()
                .filter(AcademicYear::isActive)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Aucune année académique active trouvée."));

        teacher.setSchoolRegistrationNumber(generateUniqueRegistrationNumber(activeYear));
        teacher.setActive(dto.isActive()); // Initialisation du statut

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
        teacher.setActive(!teacher.isActive()); // Inverse le statut
        return mapToResponseDTO(teacherRepository.save(teacher));
    }

    @Override
    public List<TeacherResponseDTO> getActiveTeachers() {
        return teacherRepository.findAllByActiveTrue().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TeacherResponseDTO updateTeacher(Long id, TeacherCreateDTO dto, MultipartFile photo, MultipartFile cv, List<MultipartFile> titleDocs, List<MultipartFile> trainingDocs) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));

        handleSpecialityAssignment(teacher, dto);
        mapBasicInfo(teacher, dto);
        teacher.setActive(dto.isActive()); // Permet de modifier le statut via l'édition

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
            DomainSpeciality spec = specialityRepository.findByNameIgnoreCase(dto.getNewSpecialityName())
                    .orElseGet(() -> specialityRepository.save(new DomainSpeciality(null, dto.getNewSpecialityName().toUpperCase())));
            teacher.setDomainSpeciality(spec);
        } else if (dto.getDomainSpecialityId() != null) {
            teacher.setDomainSpeciality(specialityRepository.findById(dto.getDomainSpecialityId())
                    .orElseThrow(() -> new RuntimeException("Spécialité introuvable")));
        }
    }

    private String generateUniqueRegistrationNumber(AcademicYear activeYear) {
        String fullYear = activeYear.getAnnee();
        String yearSuffix = (fullYear != null && fullYear.length() >= 2) ? fullYear.substring(fullYear.length() - 2) : "26";
        long nextOrderNumber = teacherRepository.count() + 1;
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
        dto.setActive(t.isActive()); // Mapping du statut
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

    @Override public List<TeacherResponseDTO> getAllTeachers() { return teacherRepository.findAllByOrderByIdDesc().stream().map(this::mapToResponseDTO).collect(Collectors.toList()); }
    @Override public List<TeacherResponseDTO> searchTeachers(String query) { return teacherRepository.searchTeachers(query).stream().map(this::mapToResponseDTO).collect(Collectors.toList()); }
    @Override public TeacherResponseDTO getTeacherByRegistrationNumber(String reg) { return teacherRepository.findBySchoolRegistrationNumber(reg).map(this::mapToResponseDTO).orElse(null); }
    @Override public TeacherResponseDTO getTeacherById(Long id) { return teacherRepository.findById(id).map(this::mapToResponseDTO).orElse(null); }
    @Override @Transactional public void deleteTeacher(Long id) { teacherRepository.deleteById(id); }
}
