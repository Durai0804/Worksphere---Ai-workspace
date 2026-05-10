package com.workplace.os.modules.employee.entity;

import com.workplace.os.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Core Employee entity — the central table in the system.
 * Serves as both the "user" for authentication and the "employee" for HR management.
 *
 * WHY merged? In a workplace system, every user IS an employee.
 * A separate User table would create unnecessary joins and complexity.
 *
 * Extends BaseEntity for automatic createdAt / updatedAt auditing.
 */
@Entity
@Table(name = "employees", indexes = {
        @Index(name = "idx_employee_email", columnList = "email", unique = true),
        @Index(name = "idx_employee_department", columnList = "department"),
        @Index(name = "idx_employee_role", columnList = "role"),
        @Index(name = "idx_employee_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String department;
    private String phone;
    private String position;
    private String profileImage;

    @Column(columnDefinition = "DECIMAL(12,2)")
    private Double salary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EmployeeStatus status = EmployeeStatus.ACTIVE;
}
