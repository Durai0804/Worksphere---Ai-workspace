package com.workplace.os.modules.employee.dto;

import com.workplace.os.modules.employee.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO for creating a new employee (admin-only operation).
 */
@Data
public class CreateEmployeeRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100)
    private String password;

    private Role role;
    private String department;
    private String phone;
    private String position;
    private Double salary;
}
