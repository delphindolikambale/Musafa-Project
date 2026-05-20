package com.school.management.mapper;

import com.school.management.dto.financial.FeesItemResponseDTO;
import com.school.management.model.financial.FeesItem;

public class FeesItemMapper {

    private FeesItemMapper() {}

    public static FeesItemResponseDTO toResponseDTO(FeesItem item) {
        if (item == null) {
            return null;
        }

        return FeesItemResponseDTO.builder()
                .id(item.getId())

                // Academic Year
                .academicYearId(
                        item.getAcademicYear() != null
                                ? item.getAcademicYear().getId()
                                : null
                )

                // Fees Group
                .feesGroupId(
                        item.getFeesGroup() != null
                                ? item.getFeesGroup().getId()
                                : null
                )
                .feesGroupType(
                        item.getFeesGroup() != null && item.getFeesGroup().getType() != null
                                ? item.getFeesGroup().getType().name()
                                : null
                )

                // Champs existants
                .nameFeesItem(item.getNameFeesItem())
                .percentage(item.getPercentage())
                .active(item.isActive())

                .build();
    }
}
