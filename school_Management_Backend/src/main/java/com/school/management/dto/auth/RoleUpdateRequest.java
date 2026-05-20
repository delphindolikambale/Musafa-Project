package com.school.management.dto.auth;

import lombok.Data;
import java.util.Set;

@Data
public class RoleUpdateRequest {

    private Set<String> roles; // Contiendra par exemple ["ROLE_COMPTABLE"]
}
