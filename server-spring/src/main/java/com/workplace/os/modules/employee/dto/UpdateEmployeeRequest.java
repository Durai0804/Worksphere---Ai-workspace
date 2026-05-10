package com.workplace.os.modules.employee.dto;

import com.workplace.os.modules.employee.entity.EmployeeStatus;
import com.workplace.os.modules.employee.entity.Role;
import lombok.Data;

/**
 * DTO for updating an existing employee.
 * All fields are optional — only non-null fields will be updated.
 */
@Data
public class UpdateEmployeeRequest {

    private String fullName;
    private String email;
    private Role role;
    private String department;
    private String phone;
    private String position;
    private Double salary;
    private EmployeeStatus status;
}
