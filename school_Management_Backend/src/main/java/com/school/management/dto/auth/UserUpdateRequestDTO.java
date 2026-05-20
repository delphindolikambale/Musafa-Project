package com.school.management.dto.auth;

import lombok.Data;
import java.util.List;

@Data

public class UserUpdateRequestDTO {

    private List<String> roles;
    private String password;
    private Long teacherId;
}
