package com.school.management.service.academicImpl;

import com.school.management.dto.academic.DomainSpecialityCreateDTO;
import com.school.management.dto.academic.DomainSpecialityResponseDTO;
import com.school.management.model.academic.DomainSpeciality;
import com.school.management.repository.academic.DomainSpecialityRepository;
import com.school.management.service.academic.DomainSpecialityService;
import com.school.management.security.services.UserDetailsImpl; // ✅ AJOUT
import org.springframework.security.core.context.SecurityContextHolder; // ✅ AJOUT
import org.springframework.security.access.AccessDeniedException; // ✅ AJOUT
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DomainSpecialityServiceImpl implements DomainSpecialityService {

    private final DomainSpecialityRepository repository;

    /**
     * ✅ EXTRACTION ET VERIFICATION SÉCURISÉE DU TENANT ACTIVE
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
            throw new IllegalStateException("L'utilisateur actuel n'est rattaché à aucune structure scolaire.");
        }
        return getCurrentUser().getSchool().getId();
    }

    @Override
    @Transactional
    public DomainSpecialityResponseDTO create(DomainSpecialityCreateDTO dto) {
        // ✅ MULTI-TENANT : Vérification de l'existence de la spécialité uniquement dans cette école
        if(repository.findByNameIgnoreCaseAndSchoolId(dto.getName(), getCurrentSchoolId()).isPresent()) {
            throw new RuntimeException("Cette spécialité existe déjà dans votre établissement.");
        }

        DomainSpeciality spec = DomainSpeciality.builder()
                .name(dto.getName().toUpperCase())
                .school(getCurrentUser().getSchool()) // ✅ MULTI-TENANT : Liaison du tenant
                .build();

        return mapToDTO(repository.save(spec));
    }

    @Override
    public List<DomainSpecialityResponseDTO> getAll() {
        // ✅ MULTI-TENANT : Filtrage pour ne renvoyer que les spécialités du tenant connecté
        return repository.findBySchoolId(getCurrentSchoolId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DomainSpecialityResponseDTO getById(Long id) {
        DomainSpeciality speciality = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Spécialité introuvable"));

        // ✅ SÉCURITÉ : Empêcher la lecture d'une spécialité d'une autre école via ID manipulé
        if (!speciality.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Accès interdit : Cette ressource n'appartient pas à votre école.");
        }

        return mapToDTO(speciality);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        DomainSpeciality speciality = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Spécialité introuvable"));

        // ✅ SÉCURITÉ : Empêcher la suppression transverse
        if (!speciality.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Suppression interdite : Droits insuffisants.");
        }

        repository.delete(speciality);
    }

    private DomainSpecialityResponseDTO mapToDTO(DomainSpeciality s) {
        return new DomainSpecialityResponseDTO(s.getId(), s.getName());
    }
}