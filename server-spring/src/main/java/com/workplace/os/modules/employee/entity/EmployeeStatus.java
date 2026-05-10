package com.workplace.os.modules.employee.entity;

/**
 * Employee account status.
 * Used for soft-deletes — we never hard-delete employees.
 */
public enum EmployeeStatus {
    ACTIVE,
    INACTIVE,
    SUSPENDED
}
