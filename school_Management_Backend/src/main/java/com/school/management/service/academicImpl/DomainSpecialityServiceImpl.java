package com.school.management.service.academicImpl;

import com.school.management.dto.academic.DomainSpecialityCreateDTO;
import com.school.management.dto.academic.DomainSpecialityResponseDTO;
import com.school.management.model.academic.DomainSpeciality;
import com.school.management.repository.academic.DomainSpecialityRepository;
import com.school.management.service.academic.DomainSpecialityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DomainSpecialityServiceImpl implements DomainSpecialityService {
    private final DomainSpecialityRepository repository;

    @Override
    @Transactional
    public DomainSpecialityResponseDTO create(DomainSpecialityCreateDTO dto) {
        if(repository.findByNameIgnoreCase(dto.getName()).isPresent()) {
            throw new RuntimeException("Cette spécialité existe déjà.");
        }
        DomainSpeciality spec = DomainSpeciality.builder().name(dto.getName().toUpperCase()).build();
        return mapToDTO(repository.save(spec));
    }

    @Override
    public List<DomainSpecialityResponseDTO> getAll() {
        return repository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public DomainSpecialityResponseDTO getById(Long id) {
        return repository.findById(id).map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Spécialité introuvable"));
    }

    @Override @Transactional public void delete(Long id) { repository.deleteById(id); }

    private DomainSpecialityResponseDTO mapToDTO(DomainSpeciality s) {
        return new DomainSpecialityResponseDTO(s.getId(), s.getName());
    }
}
