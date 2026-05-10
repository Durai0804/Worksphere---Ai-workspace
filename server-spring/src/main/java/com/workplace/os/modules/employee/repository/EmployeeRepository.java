package com.workplace.os.modules.employee.repository;

import com.workplace.os.modules.employee.entity.Employee;
import com.workplace.os.modules.employee.entity.EmployeeStatus;
import com.workplace.os.modules.employee.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for Employee.
 * JpaRepository provides CRUD + pagination out of the box.
 * Custom queries are defined here for search/filter functionality.
 */
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<Employee> findByStatus(EmployeeStatus status, Pageable pageable);

    Page<Employee> findByDepartment(String department, Pageable pageable);

    Page<Employee> findByRole(Role role, Pageable pageable);

    /**
     * Search employees by name, email, or department (case-insensitive).
     * Used by the frontend search bar.
     */
    @Query("SELECT e FROM Employee e WHERE " +
            "LOWER(e.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(e.department) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Employee> searchEmployees(@Param("query") String query, Pageable pageable);

    long countByStatus(EmployeeStatus status);

    long countByDepartment(String department);

    long countByRole(Role role);
}
