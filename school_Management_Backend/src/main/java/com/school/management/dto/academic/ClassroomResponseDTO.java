package com.school.management.dto.academic;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class ClassroomResponseDTO {

    private Long id;
    private String levelName;
    private String sectionName;
    private String optionName;
    private String division;
    private String roomName;
    private Integer capacity;
    private String displayName;
    private boolean active;
    // Ces champs permettent de stocker les IDs récupérés dans le ServiceImpl
    private Long levelId;   //
    private Long sectionId; //
    private Long optionId;  //
    private Long roomId;    //
    // AJOUT : Nombre actuel d'élèves inscrits dans cette classe
    private Integer currentStudents;
}
