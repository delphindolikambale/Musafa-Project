package com.school.management.model.academic;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Training {
    private String trainingName;
    private String documentPath; // Path to the training certificate
}
