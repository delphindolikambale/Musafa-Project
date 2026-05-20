package com.school.management.service.financialImpl;

import com.school.management.dto.financial.FeesItemCreateDTO;
import com.school.management.dto.financial.FeesItemResponseDTO;
import com.school.management.exception.BadRequestException;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.mapper.FeesItemMapper;
import com.school.management.model.academic.AcademicYear;
import com.school.management.model.financial.FeesGroup;
import com.school.management.model.financial.FeesItem;
import com.school.management.repository.academic.AcademicYearRepository;
import com.school.management.repository.financial.FeesGroupRepository;
import com.school.management.repository.financial.FeesItemRepository;
import com.school.management.service.financial.FeesItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;



@Service
@RequiredArgsConstructor
@Transactional
public class FeesItemServiceImpl implements FeesItemService {

    private final FeesItemRepository feesItemRepository;
    private final FeesGroupRepository feesGroupRepository;

    @Override
    public FeesItemResponseDTO create(FeesItemCreateDTO dto) {
        FeesGroup feesGroup = feesGroupRepository.findById(dto.getFeesGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("Groupe de frais introuvable"));

        validateDuplicateName(dto.getAcademicYearId(), dto.getNameFeesItem(), null);
        validateItemPercentage(dto.getFeesGroupId(), dto.getAcademicYearId(), null, dto.getPercentage(), feesGroup.getPercentage());

        FeesItem item = FeesItem.builder()
                .academicYear(feesGroup.getAcademicYear())
                .feesGroup(feesGroup)
                .nameFeesItem(dto.getNameFeesItem())
                .percentage(dto.getPercentage())
                .active(true)
                .build();

        return mapToResponseDTO(feesItemRepository.save(item));
    }

    @Override
    public FeesItemResponseDTO update(Long id, FeesItemCreateDTO dto) {
        FeesItem existingItem = feesItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Élément de frais introuvable"));

        FeesGroup group = existingItem.getFeesGroup();

        validateDuplicateName(dto.getAcademicYearId(), dto.getNameFeesItem(), id);
        validateItemPercentage(group.getId(), dto.getAcademicYearId(), id, dto.getPercentage(), group.getPercentage());

        existingItem.setNameFeesItem(dto.getNameFeesItem());
        existingItem.setPercentage(dto.getPercentage());

        return mapToResponseDTO(feesItemRepository.save(existingItem));
    }

    private void validateDuplicateName(Long yearId, String name, Long excludeId) {
        boolean exists = (excludeId == null)
                ? feesItemRepository.existsByAcademicYearIdAndNameFeesItemAndActiveTrue(yearId, name)
                : feesItemRepository.existsByAcademicYearIdAndNameFeesItemAndActiveTrueAndIdNot(yearId, name, excludeId);

        if (exists) {
            throw new BadRequestException("L'élément de frais '" + name + "' existe déjà pour cette année.");
        }
    }

    private void validateItemPercentage(Long groupId, Long yearId, Long excludeId, BigDecimal newPercentage, BigDecimal groupLimit) {
        BigDecimal currentTotal = feesItemRepository.sumPercentageByFeesGroupIdAndAcademicYearId(groupId, yearId);
        if (currentTotal == null) currentTotal = BigDecimal.ZERO;

        if (excludeId != null) {
            FeesItem oldItem = feesItemRepository.findById(excludeId).orElse(null);
            if (oldItem != null) currentTotal = currentTotal.subtract(oldItem.getPercentage());
        }

        BigDecimal finalTotal = currentTotal.add(newPercentage);
        if (finalTotal.compareTo(groupLimit) > 0) {
            throw new BadRequestException("Le total des items (" + finalTotal + "%) dépasse la limite du groupe (" + groupLimit + "%)");
        }
    }

    @Override @Transactional(readOnly = true)
    public List<FeesItemResponseDTO> getAll() {
        return feesItemRepository.findAll().stream().map(this::mapToResponseDTO).toList();
    }

    @Override @Transactional(readOnly = true)
    public List<FeesItemResponseDTO> getByFeesGroup(Long feesGroupId) {
        return feesItemRepository.findByFeesGroupIdAndActiveTrue(feesGroupId).stream().map(this::mapToResponseDTO).toList();
    }

    @Override
    public void delete(Long id) {
        if (!feesItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Élément de frais introuvable");
        }
        feesItemRepository.deleteById(id);
    }

    private FeesItemResponseDTO mapToResponseDTO(FeesItem item) {
        return FeesItemResponseDTO.builder()
                .id(item.getId())
                .academicYearId(item.getAcademicYear().getId())
                .feesGroupId(item.getFeesGroup().getId())
                .feesGroupType(item.getFeesGroup().getType().name())
                .nameFeesItem(item.getNameFeesItem())
                .percentage(item.getPercentage())
                .active(item.isActive())
                .build();
    }
}
