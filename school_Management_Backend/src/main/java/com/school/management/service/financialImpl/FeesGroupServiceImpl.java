package com.school.management.service.financialImpl;

import com.school.management.dto.financial.FeesGroupCreateDTO;
import com.school.management.dto.financial.FeesGroupResponseDTO;
import com.school.management.exception.BadRequestException;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.academic.AcademicYear;
import com.school.management.model.financial.FeesGroup;
import com.school.management.model.financial.ScheduleFees;
import com.school.management.repository.academic.AcademicYearRepository;
import com.school.management.repository.financial.FeesGroupRepository;
import com.school.management.repository.financial.FeesItemRepository;
import com.school.management.repository.financial.ScheduleFeesRepository;
import com.school.management.service.financial.FeesGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional

public class FeesGroupServiceImpl implements FeesGroupService{

    private final FeesGroupRepository feesGroupRepository;
    private final FeesItemRepository feesItemRepository;
    private final AcademicYearRepository academicYearRepository;

    @Override
    public FeesGroupResponseDTO create(FeesGroupCreateDTO dto) {
        AcademicYear academicYear = academicYearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() -> new ResourceNotFoundException("Année académique introuvable"));

        boolean exists = feesGroupRepository.existsByAcademicYearIdAndType(academicYear.getId(), dto.getType());
        if (exists) {
            throw new BadRequestException("Un groupe de type " + dto.getType() + " existe déjà.");
        }

        validateGlobalPercentage(academicYear.getId(), null, dto.getPercentage());

        FeesGroup group = FeesGroup.builder()
                .academicYear(academicYear)
                .type(dto.getType())
                .percentage(dto.getPercentage())
                .active(dto.isActive())
                .build();

        return mapToDTO(feesGroupRepository.save(group));
    }

    @Override
    public FeesGroupResponseDTO update(Long id, FeesGroupCreateDTO dto) {
        FeesGroup existingGroup = feesGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Groupe de frais introuvable"));

        if (!existingGroup.getType().equals(dto.getType())) {
            boolean exists = feesGroupRepository.existsByAcademicYearIdAndTypeAndIdNot(
                    existingGroup.getAcademicYear().getId(), dto.getType(), id);
            if (exists) {
                throw new BadRequestException("Un groupe de type " + dto.getType() + " existe déjà.");
            }
        }

        // Cohérence Groupe vs Items : On ne peut pas descendre le % du groupe en dessous de la somme des items
        BigDecimal sumItems = feesItemRepository.sumPercentageByFeesGroupIdAndAcademicYearId(
                id, existingGroup.getAcademicYear().getId());
        if (sumItems == null) sumItems = BigDecimal.ZERO;

        if (dto.getPercentage().compareTo(sumItems) < 0) {
            throw new BadRequestException("Action impossible : Le nouveau pourcentage du groupe (" + dto.getPercentage() +
                    "%) est inférieur à la somme des items qu'il contient déjà (" + sumItems + "%).");
        }

        validateGlobalPercentage(existingGroup.getAcademicYear().getId(), id, dto.getPercentage());

        existingGroup.setType(dto.getType());
        existingGroup.setPercentage(dto.getPercentage());
        existingGroup.setActive(dto.isActive());

        return mapToDTO(feesGroupRepository.save(existingGroup));
    }

    private void validateGlobalPercentage(Long yearId, Long excludeId, BigDecimal newPercentage) {
        BigDecimal currentTotal = feesGroupRepository.sumPercentageByAcademicYearId(yearId);
        if (currentTotal == null) currentTotal = BigDecimal.ZERO;

        if (excludeId != null) {
            FeesGroup oldGroup = feesGroupRepository.findById(excludeId).orElse(null);
            if (oldGroup != null) {
                currentTotal = currentTotal.subtract(oldGroup.getPercentage());
            }
        }

        BigDecimal finalTotal = currentTotal.add(newPercentage);
        if (finalTotal.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BadRequestException("Le total des groupes dépasse 100% (Actuel: " + currentTotal + "%, Nouveau Total: " + finalTotal + "%)");
        }
    }

    @Override @Transactional(readOnly = true)
    public List<FeesGroupResponseDTO> getByAcademicYear(Long academicYearId) {
        return feesGroupRepository.findByAcademicYearId(academicYearId).stream().map(this::mapToDTO).toList();
    }

    @Override @Transactional(readOnly = true)
    public FeesGroupResponseDTO getById(Long id) {
        return feesGroupRepository.findById(id).map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Groupe de frais introuvable"));
    }

    @Override @Transactional(readOnly = true)
    public List<FeesGroupResponseDTO> getAll() {
        return feesGroupRepository.findAll().stream().map(this::mapToDTO).toList();
    }

    @Override
    public void delete(Long id) {
        if (!feesGroupRepository.existsById(id)) {
            throw new ResourceNotFoundException("Groupe de frais introuvable");
        }
        feesGroupRepository.deleteById(id);
    }

    @Override
    public void deactivate(Long id) {
        FeesGroup group = feesGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Groupe de frais introuvable"));
        group.setActive(false);
        feesGroupRepository.save(group);
    }

    private FeesGroupResponseDTO mapToDTO(FeesGroup group) {
        FeesGroupResponseDTO dto = new FeesGroupResponseDTO();
        dto.setId(group.getId());
        dto.setAcademicYearId(group.getAcademicYear().getId());
        dto.setType(group.getType());
        dto.setPercentage(group.getPercentage());
        dto.setActive(group.isActive());
        return dto;
    }
}
