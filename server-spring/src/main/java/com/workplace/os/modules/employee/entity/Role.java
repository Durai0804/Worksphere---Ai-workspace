package com.workplace.os.modules.employee.entity;

/**
 * Role-based access control enum.
 * Used by Spring Security's @PreAuthorize to gate endpoints.
 *
 * - ADMIN: Full access to all resources
 * - HR: Can manage employees, attendance, leaves
 * - EMPLOYEE: Can view own data, check-in/out, apply for leave
 */
public enum Role {
    ADMIN,
    HR,
    EMPLOYEE
}
