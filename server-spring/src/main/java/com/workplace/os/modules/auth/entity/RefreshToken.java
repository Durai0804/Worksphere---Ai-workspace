package com.workplace.os.modules.auth.entity;

import com.workplace.os.modules.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Refresh token entity — stored in the database for secure token rotation.
 *
 * WHY store refresh tokens in the DB?
 * - Access tokens are short-lived (24h) and stateless (validated from signature alone).
 * - Refresh tokens are long-lived (7 days) and MUST be revocable (e.g., on logout, password change).
 * - Storing them lets us invalidate individual sessions without revoking all tokens.
 */
@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private Instant expiryDate;

    @OneToOne
    @JoinColumn(name = "employee_id", referencedColumnName = "id")
    private Employee employee;
}
