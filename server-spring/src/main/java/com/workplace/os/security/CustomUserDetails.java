package com.workplace.os.security;

import com.workplace.os.modules.employee.entity.Employee;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Bridges our Employee entity with Spring Security's UserDetails contract.
 *
 * WHY: Spring Security needs a UserDetails object to authenticate users.
 * This adapter wraps our Employee entity so Security can read the
 * email (username), password, and role without polluting the entity itself.
 */
@Getter
@AllArgsConstructor
public class CustomUserDetails implements UserDetails {

    private Long id;
    private String email;
    private String password;
    private String fullName;
    private Collection<? extends GrantedAuthority> authorities;

    /**
     * Factory method: creates a CustomUserDetails from an Employee entity.
     */
    public static CustomUserDetails fromEmployee(Employee employee) {
        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + employee.getRole().name())
        );

        return new CustomUserDetails(
                employee.getId(),
                employee.getEmail(),
                employee.getPassword(),
                employee.getFullName(),
                authorities
        );
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
