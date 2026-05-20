package com.school.management.dto.auth;

import com.school.management.model.auth.RoleInfoDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String username;
    private String email;
    private boolean accountNonLocked;
    private boolean enabled;
    private Set<RoleInfoDTO> roles;
    private Long teacherId;
}
