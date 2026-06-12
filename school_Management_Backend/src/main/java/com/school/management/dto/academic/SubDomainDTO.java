package com.school.management.dto.academic;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SubDomainDTO {
    private String name;
    private List<SubjectGradeDTO> subjects;
}
