package com.school.management.model.auth;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.school.management.model.academic.Teacher;
import com.school.management.model.academic.Student;
import com.school.management.model.multitenant.School;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "username"),
                @UniqueConstraint(columnNames = "email")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @NotBlank
    @Size(max = 120)
    private String password;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @Column(nullable = false)
    private boolean isAccountNonLocked = true;

    @Column(nullable = false)
    private boolean isEnabled = true;

    // ✅ NOUVEAU : Rattachement de l'utilisateur à une école spécifique
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = true)
    private School school;

    @JsonIgnore
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Teacher teacher;

    @JsonIgnore
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Student student;

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.isAccountNonLocked = true;
        this.isEnabled = true;
    }
}