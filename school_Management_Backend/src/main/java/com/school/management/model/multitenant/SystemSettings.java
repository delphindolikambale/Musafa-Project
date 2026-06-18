package com.school.management.model.multitenant;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "system_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SystemSettings {

    @Id
    private Long id = 1L;

    @Column(nullable = false)
    private String applicationName = "MyAcademia";

    private String globalLogoPath;
}