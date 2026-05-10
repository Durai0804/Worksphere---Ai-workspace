package com.workplace.os.modules.auth.service;

import com.workplace.os.exception.BadRequestException;
import com.workplace.os.exception.DuplicateResourceException;
import com.workplace.os.exception.ResourceNotFoundException;
import com.workplace.os.modules.auth.dto.*;
import com.workplace.os.modules.auth.entity.RefreshToken;
import com.workplace.os.modules.auth.repository.RefreshTokenRepository;
import com.workplace.os.modules.employee.dto.EmployeeResponse;
import com.workplace.os.modules.employee.entity.Employee;
import com.workplace.os.modules.employee.entity.EmployeeStatus;
import com.workplace.os.modules.employee.entity.Role;
import com.workplace.os.modules.employee.mapper.EmployeeMapper;
import com.workplace.os.modules.employee.repository.EmployeeRepository;
import com.workplace.os.security.CustomUserDetails;
import com.workplace.os.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Authentication service — handles login, registration, token refresh, and password changes.
 *
 * Flow: Controller → AuthService → Repository/JwtTokenProvider
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final EmployeeRepository employeeRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeMapper employeeMapper;

    @Value("${app.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    /**
     * Authenticate user and return JWT tokens.
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Spring Security authenticates against CustomUserDetailsService + BCrypt
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = createRefreshToken(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee employee = employeeRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", userDetails.getId()));

        log.info("User logged in: {}", request.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(employeeMapper.toResponse(employee))
                .build();
    }

    /**
     * Register a new employee account.
     * Default role is EMPLOYEE — only admins can change roles later.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Employee", "email", request.getEmail());
        }

        Employee employee = Employee.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.EMPLOYEE) // Default role
                .department(request.getDepartment())
                .phone(request.getPhone())
                .position(request.getPosition())
                .status(EmployeeStatus.ACTIVE)
                .build();

        employee = employeeRepository.save(employee);
        log.info("New user registered: {}", request.getEmail());

        // Auto-login after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = createRefreshToken(authentication);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(employeeMapper.toResponse(employee))
                .build();
    }

    /**
     * Refresh an expired access token using a valid refresh token.
     */
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (storedToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(storedToken);
            throw new BadRequestException("Refresh token has expired. Please login again.");
        }

        String newAccessToken = tokenProvider.generateAccessTokenFromUserId(
                storedToken.getEmployee().getId());

        Employee employee = storedToken.getEmployee();

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(storedToken.getToken()) // Return same refresh token
                .user(employeeMapper.toResponse(employee))
                .build();
    }

    /**
     * Change password for the currently authenticated user.
     */
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        Employee employee = employeeRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), employee.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        employee.setPassword(passwordEncoder.encode(request.getNewPassword()));
        employeeRepository.save(employee);
        log.info("Password changed for user: {}", employee.getEmail());
    }

    /**
     * Get the currently authenticated user's profile.
     */
    @Transactional(readOnly = true)
    public EmployeeResponse getCurrentUser(Long userId) {
        Employee employee = employeeRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", userId));
        return employeeMapper.toResponse(employee);
    }

    // ── Private helpers ─────────────────────────────────

    private String createRefreshToken(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee employee = employeeRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", userDetails.getId()));

        // Delete existing refresh tokens for this user (one session at a time)
        refreshTokenRepository.deleteByEmployee(employee);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .employee(employee)
                .expiryDate(Instant.now().plusMillis(refreshTokenExpirationMs))
                .build();

        refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }
}
