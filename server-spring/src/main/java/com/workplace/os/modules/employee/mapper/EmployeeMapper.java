package com.workplace.os.modules.employee.mapper;

import com.workplace.os.modules.employee.dto.EmployeeResponse;
import com.workplace.os.modules.employee.entity.Employee;
import org.springframework.stereotype.Component;

/**
 * Maps between Employee entity and EmployeeResponse DTO.
 *
 * WHY a separate mapper? Keeps conversion logic out of services,
 * making it reusable and easy to test independently.
 * In larger projects, you'd use MapStruct for this.
 */
@Component
public class EmployeeMapper {

    public EmployeeResponse toResponse(Employee employee) {
        return EmployeeResponse.builder()
                .id(employee.getId())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .role(employee.getRole())
                .department(employee.getDepartment())
                .phone(employee.getPhone())
                .position(employee.getPosition())
                .profileImage(employee.getProfileImage())
                .salary(employee.getSalary())
                .status(employee.getStatus())
                .createdAt(employee.getCreatedAt())
                .updatedAt(employee.getUpdatedAt())
                .build();
    }
}
