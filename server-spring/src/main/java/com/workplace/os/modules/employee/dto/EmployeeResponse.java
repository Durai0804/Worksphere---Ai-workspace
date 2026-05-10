package com.workplace.os.modules.employee.dto;

import com.workplace.os.modules.employee.entity.EmployeeStatus;
import com.workplace.os.modules.employee.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Employee response DTO — the shape of employee data sent to the frontend.
 * Never includes the password hash.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {

    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private String department;
    private String phone;
    private String position;
    private String profileImage;
    private Double salary;
    private EmployeeStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
