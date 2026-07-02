package com.school.management.service.financialImpl;

import com.school.management.dto.financial.FeesGroupCreateDTO;
import com.school.management.dto.financial.FeesGroupResponseDTO;
import com.school.management.exception.BadRequestException;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.academic.AcademicYear;
import com.school.management.model.financial.FeesGroup;
import com.school.management.model.multitenant.School;
import com.school.management.repository.academic.AcademicYearRepository;
import com.school.management.repository.financial.FeesGroupRepository;
import com.school.management.repository.financial.FeesItemRepository;
import com.school.management.service.financial.FeesGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FeesGroupServiceImpl implements FeesGroupService {

    private final FeesGroupRepository feesGroupRepository;
    private final FeesItemRepository feesItemRepository;
    private final AcademicYearRepository academicYearRepository;

    @Override
    public FeesGroupResponseDTO create(FeesGroupCreateDTO dto, Long schoolId) {
        AcademicYear academicYear = academicYearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() -> new ResourceNotFoundException("Année académique introuvable"));

        boolean exists = feesGroupRepository.existsByAcademicYearIdAndTypeAndSchoolId(academicYear.getId(), dto.getType(), schoolId);
        if (exists) {
            throw new BadRequestException("Un groupe de type " + dto.getType() + " existe déjà.");
        }

        validateGlobalPercentage(academicYear.getId(), null, dto.getPercentage(), schoolId);

        FeesGroup group = FeesGroup.builder()
                .academicYear(academicYear)
                .type(dto.getType())
                .percentage(dto.getPercentage())
                .school(School.builder().id(schoolId).build())
                .active(dto.isActive())
                .build();

        return mapToDTO(feesGroupRepository.save(group));
    }

    @Override
    public FeesGroupResponseDTO update(Long id, FeesGroupCreateDTO dto, Long schoolId) {
        FeesGroup existingGroup = feesGroupRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Groupe de frais introuvable"));

        if (!existingGroup.getType().equals(dto.getType())) {
            boolean exists = feesGroupRepository.existsByAcademicYearIdAndTypeAndSchoolIdAndIdNot(
                    existingGroup.getAcademicYear().getId(), dto.getType(), schoolId, id);
            if (exists) {
                throw new BadRequestException("Un groupe de type " + dto.getType() + " existe déjà.");
            }
        }

        BigDecimal sumItems = feesItemRepository.sumPercentageByFeesGroupIdAndAcademicYearIdAndSchoolId(
                id, existingGroup.getAcademicYear().getId(), schoolId);
        if (sumItems == null) sumItems = BigDecimal.ZERO;

        if (dto.getPercentage().compareTo(sumItems) < 0) {
            throw new BadRequestException("Action impossible : Le nouveau pourcentage du groupe (" + dto.getPercentage() +
                    "%) est inférieur à la somme des items qu'il contient déjà (" + sumItems + "%).");
        }

        validateGlobalPercentage(existingGroup.getAcademicYear().getId(), id, dto.getPercentage(), schoolId);

        existingGroup.setType(dto.getType());
        existingGroup.setPercentage(dto.getPercentage());
        existingGroup.setActive(dto.isActive());

        return mapToDTO(feesGroupRepository.save(existingGroup));
    }

    private void validateGlobalPercentage(Long yearId, Long excludeId, BigDecimal newPercentage, Long schoolId) {
        BigDecimal currentTotal = feesGroupRepository.sumPercentageByAcademicYearIdAndSchoolId(yearId, schoolId);
        if (currentTotal == null) currentTotal = BigDecimal.ZERO;

        if (excludeId != null) {
            FeesGroup oldGroup = feesGroupRepository.findByIdAndSchoolId(excludeId, schoolId).orElse(null);
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
    public List<FeesGroupResponseDTO> getByAcademicYear(Long academicYearId, Long schoolId) {
        return feesGroupRepository.findByAcademicYearIdAndSchoolId(academicYearId, schoolId).stream().map(this::mapToDTO).toList();
    }

    @Override @Transactional(readOnly = true)
    public FeesGroupResponseDTO getById(Long id, Long schoolId) {
        return feesGroupRepository.findByIdAndSchoolId(id, schoolId).map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Groupe de frais introuvable"));
    }

    @Override @Transactional(readOnly = true)
    public List<FeesGroupResponseDTO> getAll(Long schoolId) {
        return feesGroupRepository.findBySchoolId(schoolId).stream().map(this::mapToDTO).toList();
    }

    @Override
    public void delete(Long id, Long schoolId) {
        FeesGroup existingGroup = feesGroupRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Groupe de frais introuvable"));
        feesGroupRepository.delete(existingGroup);
    }

    @Override
    public void deactivate(Long id, Long schoolId) {
        FeesGroup group = feesGroupRepository.findByIdAndSchoolId(id, schoolId)
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