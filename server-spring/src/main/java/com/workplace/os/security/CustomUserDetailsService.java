package com.workplace.os.security;

import com.workplace.os.modules.employee.entity.Employee;
import com.workplace.os.modules.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Loads employee data from the database for Spring Security authentication.
 *
 * WHY: Spring Security calls loadUserByUsername() during login.
 * We look up the employee by email and wrap it in CustomUserDetails.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return CustomUserDetails.fromEmployee(employee);
    }

    /**
     * Load user by ID — used by JwtAuthenticationFilter to set the SecurityContext
     * from the JWT token's subject (which stores the user ID).
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        return CustomUserDetails.fromEmployee(employee);
    }
}
