package com.workplace.os.modules.employee.service;

import com.workplace.os.common.dto.PagedResponse;
import com.workplace.os.exception.DuplicateResourceException;
import com.workplace.os.exception.ResourceNotFoundException;
import com.workplace.os.modules.employee.dto.CreateEmployeeRequest;
import com.workplace.os.modules.employee.dto.EmployeeResponse;
import com.workplace.os.modules.employee.dto.UpdateEmployeeRequest;
import com.workplace.os.modules.employee.entity.Employee;
import com.workplace.os.modules.employee.entity.EmployeeStatus;
import com.workplace.os.modules.employee.entity.Role;
import com.workplace.os.modules.employee.mapper.EmployeeMapper;
import com.workplace.os.modules.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Employee service — business logic for CRUD operations on employees.
 *
 * WHY separate from controller? The controller handles HTTP concerns (status codes,
 * request mapping). The service handles business rules (validation, data transformation).
 * This separation makes the code testable and reusable.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository repository;
    private final EmployeeMapper mapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PagedResponse<EmployeeResponse> getAllEmployees(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Employee> employeePage = repository.findAll(pageable);

        return buildPagedResponse(employeePage);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = findEmployeeOrThrow(id);
        return mapper.toResponse(employee);
    }

    @Transactional(readOnly = true)
    public PagedResponse<EmployeeResponse> searchEmployees(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Employee> employeePage = repository.searchEmployees(query, pageable);
        return buildPagedResponse(employeePage);
    }

    @Transactional(readOnly = true)
    public PagedResponse<EmployeeResponse> getEmployeesByDepartment(String department, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Employee> employeePage = repository.findByDepartment(department, pageable);
        return buildPagedResponse(employeePage);
    }

    @Transactional
    public EmployeeResponse createEmployee(CreateEmployeeRequest request) {
        if (repository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Employee", "email", request.getEmail());
        }

        Employee employee = Employee.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.EMPLOYEE)
                .department(request.getDepartment())
                .phone(request.getPhone())
                .position(request.getPosition())
                .salary(request.getSalary())
                .status(EmployeeStatus.ACTIVE)
                .build();

        employee = repository.save(employee);
        log.info("Created employee: {} ({})", employee.getFullName(), employee.getEmail());

        return mapper.toResponse(employee);
    }

    @Transactional
    public EmployeeResponse updateEmployee(Long id, UpdateEmployeeRequest request) {
        Employee employee = findEmployeeOrThrow(id);

        // Update only non-null fields (partial update pattern)
        if (request.getFullName() != null) employee.setFullName(request.getFullName());
        if (request.getEmail() != null) {
            // Check for duplicate email, but allow if it's the same employee's current email
            if (!employee.getEmail().equals(request.getEmail()) &&
                    repository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Employee", "email", request.getEmail());
            }
            employee.setEmail(request.getEmail());
        }
        if (request.getRole() != null) employee.setRole(request.getRole());
        if (request.getDepartment() != null) employee.setDepartment(request.getDepartment());
        if (request.getPhone() != null) employee.setPhone(request.getPhone());
        if (request.getPosition() != null) employee.setPosition(request.getPosition());
        if (request.getSalary() != null) employee.setSalary(request.getSalary());
        if (request.getStatus() != null) employee.setStatus(request.getStatus());

        employee = repository.save(employee);
        log.info("Updated employee: {} (ID: {})", employee.getFullName(), id);

        return mapper.toResponse(employee);
    }

    /**
     * Soft-delete: sets status to INACTIVE instead of removing the row.
     * WHY: Hard deletes break referential integrity (attendance, leaves, tasks all reference employees).
     */
    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = findEmployeeOrThrow(id);
        employee.setStatus(EmployeeStatus.INACTIVE);
        repository.save(employee);
        log.info("Soft-deleted employee: {} (ID: {})", employee.getFullName(), id);
    }

    // ── Private helpers ─────────────────────────────────

    private Employee findEmployeeOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
    }

    private PagedResponse<EmployeeResponse> buildPagedResponse(Page<Employee> page) {
        return PagedResponse.<EmployeeResponse>builder()
                .content(page.getContent().stream().map(mapper::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
