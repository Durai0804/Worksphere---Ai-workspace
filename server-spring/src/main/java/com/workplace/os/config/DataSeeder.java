package com.workplace.os.config;

import com.workplace.os.modules.employee.entity.Employee;
import com.workplace.os.modules.employee.entity.EmployeeStatus;
import com.workplace.os.modules.employee.entity.Role;
import com.workplace.os.modules.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds demo data on application startup if the database is empty.
 * Runs only once — skips if employees already exist.
 *
 * This replaces the Node.js seedDemoData() function from server.js.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (employeeRepository.count() > 0) {
            log.info("Database already contains data — skipping seed");
            return;
        }

        log.info("🌱 Seeding demo data...");

        List<Employee> employees = List.of(
                buildEmployee("Admin User", "admin@workplace.com", "admin123", Role.ADMIN, "Management", "+1234567890", "CEO", 120000.0),
                buildEmployee("HR Manager", "hr@workplace.com", "hr123456", Role.HR, "Human Resources", "+1234567891", "HR Manager", 85000.0),
                buildEmployee("John Smith", "john@workplace.com", "emp12345", Role.EMPLOYEE, "Engineering", "+1234567892", "Software Engineer", 75000.0),
                buildEmployee("Sarah Johnson", "sarah@workplace.com", "emp12345", Role.EMPLOYEE, "Design", "+1234567893", "UI/UX Designer", 70000.0),
                buildEmployee("Mike Wilson", "mike@workplace.com", "emp12345", Role.EMPLOYEE, "Engineering", "+1234567894", "Backend Developer", 72000.0),
                buildEmployee("Emily Davis", "emily@workplace.com", "emp12345", Role.EMPLOYEE, "Marketing", "+1234567895", "Marketing Lead", 68000.0),
                buildEmployee("David Brown", "david@workplace.com", "emp12345", Role.EMPLOYEE, "Finance", "+1234567896", "Financial Analyst", 78000.0),
                buildEmployee("Lisa Anderson", "lisa@workplace.com", "emp12345", Role.EMPLOYEE, "Engineering", "+1234567897", "DevOps Engineer", 76000.0),
                buildEmployee("Chris Martinez", "chris@workplace.com", "emp12345", Role.EMPLOYEE, "Design", "+1234567898", "Graphic Designer", 65000.0),
                buildEmployee("Amy Taylor", "amy@workplace.com", "emp12345", Role.EMPLOYEE, "Human Resources", "+1234567899", "HR Specialist", 62000.0)
        );

        employeeRepository.saveAll(employees);

        log.info("✅ Seeded {} demo users", employees.size());
        log.info("📧 Login credentials:");
        log.info("   Admin: admin@workplace.com / admin123");
        log.info("   HR:    hr@workplace.com / hr123456");
        log.info("   Emp:   john@workplace.com / emp12345");
    }

    private Employee buildEmployee(String name, String email, String password,
                                    Role role, String dept, String phone, String position, Double salary) {
        return Employee.builder()
                .fullName(name).email(email)
                .password(passwordEncoder.encode(password))
                .role(role).department(dept).phone(phone)
                .position(position).salary(salary)
                .status(EmployeeStatus.ACTIVE).build();
    }
}
